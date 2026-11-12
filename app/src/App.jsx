import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { isDemo, load, redeem, useStore } from './lib/data'
import { Dock, Logo, Spin, Toaster } from './ui'
import Weddings from './screens/Weddings'
import WeddingFile from './screens/WeddingFile'
import NewWedding from './screens/NewWedding'
import Staff from './screens/Staff'
import Clients from './screens/Clients'
import Money from './screens/Money'
import Settings from './screens/Settings'
import { PHOTOS } from './lib/util'
import { InstallButton, InstallNudge } from './install'

const TABS = ['weddings', 'staff', 'clients', 'money']

// navigation lives in history.state so the phone's back button (web and Android) works everywhere
function transition(update) {
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) { update(); return }
  const t = document.startViewTransition(() => flushSync(update))
  t.ready.catch(() => {}); t.finished.catch(() => {}); t.updateCallbackDone.catch(() => {})
}

const inviteToken = () => {
  const m = location.hash.match(/^#\/i\/([A-Za-z0-9_-]{20,64})/) || location.pathname.match(/\/i\/([A-Za-z0-9_-]{20,64})/)
  return m ? m[1] : null
}

export default function App() {
  const [phase, setPhase] = useState('loading')
  const [err, setErr] = useState('')
  const [route, setRoute] = useState({ v: 'weddings' })
  const s = useStore()

  useEffect(() => {
    (async () => {
      try {
        const tok = inviteToken()
        if (tok && !isDemo) { setPhase('redeeming'); await redeem(tok); history.replaceState(null, '', location.pathname.replace(/\/i\/.*/, '/')) }
        setPhase((await load()) ? 'ready' : 'welcome')
      } catch (e) {
        setErr(e?.message === 'expired' ? 'هاد الرابط سالا. طلب رابط جديد.' : 'وقع مشكل فالدخول. عاود جرّب.')
        setPhase('welcome')
      }
    })()
    history.replaceState({ v: 'weddings' }, '')
    const pop = (e) => transition(() => setRoute(e.state || { v: 'weddings' }))
    addEventListener('popstate', pop)
    return () => removeEventListener('popstate', pop)
  }, [])

  const go = (v, params = {}) => {
    const next = { v, ...params }
    transition(() => {
      if (TABS.includes(v) && TABS.includes(route.v)) history.replaceState(next, '')
      else history.pushState(next, '')
      setRoute(next); scrollTo(0, 0)
    })
  }
  const back = () => history.back()

  if (phase !== 'ready') {
    return (
      <div className="welcome">
        <div className="bgphoto" style={{ backgroundImage: `url(${PHOTOS.amariya})` }} />
        <div className="shade" />
        <div className="in">
          <Logo size={34} />
          {phase === 'welcome' ? (
            <>
              <h1>العراسات ديالك<br />كاملين فبلاصة وحدة</h1>
              {err ? <p className="err">{err}</p> : <p>هاد التطبيق كيتفتح بالرابط اللي صيفطنا ليك فالواتساب.</p>}
              <a className="btn brass" href="?demo=1">شوف كيفاش خدام</a>
              <InstallButton className="btn glassbtn" />
            </>
          ) : <Spin />}
        </div>
      </div>
    )
  }

  const tab = TABS.includes(route.v) ? route.v : null
  const w = route.id && s.weddings.find((x) => x.id === route.id)
  return (
    <div className="app">
      {route.v === 'weddings' && <><Weddings go={go} /><InstallNudge /></>}
      {route.v === 'staff' && <Staff go={go} />}
      {route.v === 'clients' && <Clients go={go} />}
      {route.v === 'money' && <Money go={go} />}
      {route.v === 'settings' && <Settings back={back} />}
      {route.v === 'new' && <NewWedding back={back} done={(id) => { history.replaceState({ v: 'wedding', id }, ''); setRoute({ v: 'wedding', id }) }} prefill={route.prefill} />}
      {route.v === 'edit' && w && <NewWedding key={w.id} edit={w} back={back} done={back} />}
      {route.v === 'wedding' && (w ? <WeddingFile w={w} back={back} go={go} /> : <Weddings go={go} />)}
      {tab && <Dock tab={tab} go={go} />}
      <Toaster />
    </div>
  )
}
