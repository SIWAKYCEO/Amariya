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
import { registerSW } from 'virtual:pwa-register'

// check for a new version often (installed app on the phone stays open for days):
// every minute and every time the app comes back to the front; a new version reloads the app by itself
registerSW({
  immediate: true,
  onRegisteredSW(_url, r) {
    if (!r) return
    const check = () => { if (navigator.onLine) r.update().catch(() => {}) }
    setInterval(check, 60 * 1000)
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check() })
  },
})

// public pages (devis/deposit link and the traiteur's shop window) load without the app or a login
const Public = lazy(() => import('./Public'))
const pub = /^\/(d|t)\//.test(location.pathname)
createRoot(document.getElementById('root')).render(<StrictMode>{pub ? <Suspense fallback={null}><Public /></Suspense> : <App />}</StrictMode>)
