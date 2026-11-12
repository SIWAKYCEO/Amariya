// Install the web app on the phone: one tap on Android (native prompt), guided steps on iPhone.
import { useEffect, useState } from 'react'
import { Sheet } from './ui'

let deferred = null
const subs = new Set()
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; subs.forEach((f) => f()) })
addEventListener('appinstalled', () => { deferred = null; subs.forEach((f) => f()) })

export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
const ua = navigator.userAgent
export const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)

function useInstallable() {
  const [, tick] = useState(0)
  useEffect(() => { const f = () => tick((n) => n + 1); subs.add(f); return () => subs.delete(f) }, [])
  if (isStandalone()) return null
  if (deferred) return 'prompt'
  if (isIOS) return 'ios'
  return 'manual'
}

const ShareIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
  </svg>
)

export function InstallButton({ className = 'btn ghost wide', label = 'زيد Amariya للتيليفون' }) {
  const mode = useInstallable()
  const [help, setHelp] = useState(false)
  if (!mode) return null
  const click = async () => {
    if (mode === 'prompt') { deferred.prompt(); await deferred.userChoice.catch(() => {}); deferred = null; subs.forEach((f) => f()) }
    else setHelp(true)
  }
  return (
    <>
      <button className={className} onClick={click}>
        <img src={import.meta.env.BASE_URL + 'icon-192.png'} alt="" width="22" height="22" style={{ borderRadius: 6 }} />
        {label}
      </button>
      {help && (
        <Sheet title="زيد التطبيق للتيليفون" onClose={() => setHelp(false)}>
          {mode === 'ios' ? (
            <ol className="isteps">
              <li><b>1</b><span>كليكي على <span className="key"><ShareIcon /></span> اللي لتحت ف Safari</span></li>
              <li><b>2</b><span>طلع واختار «Sur l'écran d'accueil»</span></li>
              <li><b>3</b><span>كليكي على «Ajouter»… وصافي، Amariya غادي تبان بحال أي تطبيق</span></li>
            </ol>
          ) : (
            <ol className="isteps">
              <li><b>1</b><span>كليكي على القائمة <span className="key">⋮</span> لفوق</span></li>
              <li><b>2</b><span>اختار «Installer l'application» ولا «Ajouter à l'écran d'accueil»</span></li>
              <li><b>3</b><span>Amariya غادي تبان مع التطبيقات ديالك</span></li>
            </ol>
          )}
          <button className="btn brass wide" onClick={() => setHelp(false)}>فهمت</button>
        </Sheet>
      )}
    </>
  )
}

// small card on the home screen until the app is installed or dismissed
export function InstallNudge() {
  const mode = useInstallable()
  const [off, setOff] = useState(() => { try { return localStorage.getItem('amr-install-off') === '1' } catch { return false } })
  if (!mode || off) return null
  const close = () => { try { localStorage.setItem('amr-install-off', '1') } catch { /* */ } setOff(true) }
  return (
    <div className="nudge">
      <div className="nudge-t"><b>دير Amariya فالتيليفون</b><span>تفتح بكليكة وحدة، بحال واتساب</span></div>
      <InstallButton className="btn brass sm" label="زيدها" />
      <button className="round sm" onClick={close} aria-label="سد">×</button>
    </div>
  )
}
