import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/alexandria/arabic-400.css'
import '@fontsource/alexandria/arabic-500.css'
import '@fontsource/alexandria/arabic-700.css'
import '@fontsource/alexandria/arabic-900.css'
import '@fontsource/alexandria/latin-500.css'
import '@fontsource/alexandria/latin-700.css'
import '@fontsource-variable/bricolage-grotesque/index.css'
import './styles.css'
import App from './App'
import { initPrefs, startTranslator } from './lib/i18n'
import { registerSW } from 'virtual:pwa-register'

// every update reaches everyone by itself, nobody has to refresh:
// the app checks for a new version every minute and whenever it comes back to the front,
// then switches to it at a quiet moment (never while a form or a sheet is open, so nothing typed is lost)
const busy = () => {
  const a = document.activeElement
  return (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) || !!document.querySelector('.sheet, [data-editing]')
}
let pending = null
const applyWhenQuiet = () => {
  if (!pending) return
  if (document.visibilityState === 'hidden' || !busy()) { const go = pending; pending = null; go() }
}
registerSW({
  immediate: true,
  // the new version is already active: reload into it at a quiet moment
  onNeedReload() { pending = () => location.reload(); applyWhenQuiet() },
  onRegisteredSW(_url, r) {
    if (!r) return
    const check = () => { if (navigator.onLine) r.update().catch(() => {}) }
    setInterval(check, 60 * 1000)
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check() })
  },
})
setInterval(applyWhenQuiet, 3000)
document.addEventListener('visibilitychange', applyWhenQuiet)
// a screen from an old version that is no longer online: load the new version
addEventListener('vite:preloadError', () => location.reload())

// public pages (devis/deposit link and the traiteur's shop window) load without the app or a login
const Public = lazy(() => import('./Public'))
const pub = /^\/(d|t)\//.test(location.pathname) || /^\/traiteurs\/?$/.test(location.pathname)
if (!pub) initPrefs()
createRoot(document.getElementById('root')).render(<StrictMode>{pub ? <Suspense fallback={null}><Public /></Suspense> : <App />}</StrictMode>)
startTranslator()
