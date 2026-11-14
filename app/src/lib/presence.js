// Battito di presenza: dice alla dashboard chi usa l'app, quando, da che telefono.
import { getState, isDemo, supabase } from './data'

let timer = null
let screen = null
export const setScreen = (s) => { screen = s }

async function device() {
  const ua = navigator.userAgent
  let model = null, os = null
  try {
    const d = navigator.userAgentData
    if (d?.getHighEntropyValues) {
      const h = await d.getHighEntropyValues(['model', 'platformVersion'])
      model = h.model || null
      os = d.platform ? `${d.platform} ${h.platformVersion || ''}`.trim() : null
    }
  } catch { /* */ }
  if (!os) {
    const ios = ua.match(/(iPhone|iPad).*?OS (\d+[_\d]*)/)
    const and = ua.match(/Android (\d+(\.\d+)?)/)
    if (ios) { os = `iOS ${ios[2].replace(/_/g, '.')}`; model = model || ios[1] }
    else if (and) { os = `Android ${and[1]}`; model = model || (ua.match(/Android [^;]+; ([^;)]+?)(?: Build|\))/) || [])[1] || null }
    else if (/Windows/.test(ua)) os = 'Windows'
    else if (/Mac OS X/.test(ua)) os = 'macOS'
  }
  return { model: model ? model.slice(0, 60) : null, os }
}

export async function startPresence() {
  // director / internal accounts are never counted in the dashboard
  if (isDemo || !supabase || timer || getState().traiteur?.internal) return
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
  const { model, os } = await device()
  const base = {
    p_app: 'amariya', p_standalone: standalone, p_ua: navigator.userAgent,
    p_lang: navigator.language, p_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    p_platform: os, p_device: model ? `${model} · ${screen_w()}` : screen_w(),
  }
  const ping = (fresh) => supabase.rpc('app_ping', { ...base, p_new_session: fresh, p_screen: screen }).then(() => {}, () => {})
  await ping(true)
  supabase.functions.invoke('app-geo', { body: { app: 'amariya' } }).catch(() => {})
  timer = setInterval(() => { if (document.visibilityState === 'visible') ping(false) }, 30000)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') ping(false) })
}
const screen_w = () => `${globalThis.screen.width}x${globalThis.screen.height}`
