import { PRICES, wantPlan } from './lib/data'
import { useEffect, useRef, useState } from 'react'
import { money } from './lib/util'

const sv = (d, w = 22, sw = 1.9) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)
export const Ic = {
  rings: (w) => sv(<><circle cx="9" cy="14" r="5" /><circle cx="15" cy="14" r="5" /><path d="M10 5.5l2-2.5 2 2.5" /></>, w),
  team: (w) => sv(<><circle cx="9" cy="9" r="3" /><path d="M3.5 19c1-2.8 3-4 5.5-4s4.5 1.2 5.5 4M16 7.5a2.6 2.6 0 1 1 0 5M17 15.5c1.8.4 3 1.6 3.6 3.5" /></>, w),
  ppl: (w) => sv(<><path d="M4 20v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1" /><circle cx="12" cy="8" r="3.6" /></>, w),
  cal: (w = 20) => sv(<><rect x="3.5" y="5" width="17" height="15.5" rx="3.5" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>, w),
  bell: (w = 17) => sv(<><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></>, w, 2),
  cart: (w = 18) => sv(<><path d="M3 4h2.5l2 11h10l2-8H7" /><circle cx="9.5" cy="19" r="1.4" /><circle cx="16.5" cy="19" r="1.4" /></>, w, 2),
  share: (w = 17) => sv(<><path d="M12 3v12M8 7l4-4 4 4" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></>, w, 2),
  receipt: (w = 17) => sv(<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>, w, 2),
  cash: (w) => sv(<><rect x="3" y="6" width="18" height="12" rx="3.5" /><circle cx="12" cy="12" r="2.6" /><path d="M6.5 9.5v.01M17.5 14.5v.01" /></>, w),
  plus: (w = 22) => sv(<path d="M12 5v14M5 12h14" />, w, 2.4),
  back: (w = 20) => sv(<path d="M9 5l7 7-7 7" />, w, 2.3),
  x: (w = 18) => sv(<path d="M7 7l10 10M17 7L7 17" />, w, 2.3),
  check: (w = 16) => sv(<path d="M5 12.5l4.5 4.5L19 7.5" />, w, 2.6),
  clock: (w = 15) => sv(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>, w, 2),
  pin: (w = 15) => sv(<><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>, w, 2),
  guests: (w = 15) => sv(<><circle cx="9" cy="8.5" r="3" /><path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5M16 6a3 3 0 0 1 0 6M18 14.5c1.5.6 2.3 2 2.6 4" /></>, w, 2),
  phone: (w = 18) => sv(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />, w, 2),
  pen: (w = 18) => sv(<><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>, w, 2),
  trash: (w = 18) => sv(<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" />, w, 2),
  gear: (w = 20) => sv(<><circle cx="12" cy="12" r="3" /><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" /></>, w),
  search: (w = 19) => sv(<><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></>, w),
  doc: (w = 18) => sv(<><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></>, w),
  wa: (w = 18) => (
    <svg width={w} height={w} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2zm5.6 13.7c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1a16 16 0 0 1-1.6-.6 12.6 12.6 0 0 1-4.8-4.3c-.4-.5-1.1-1.6-1.1-3s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.4z" /></svg>
  ),
  lock: (w = 18) => sv(<><rect x="5" y="10.5" width="14" height="10" rx="3" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /><path d="M12 14.5v2" /></>, w, 2),
  box: (w = 18) => sv(<><path d="M3.5 8l8.5-4.5L20.5 8v8.5L12 21l-8.5-4.5z" /><path d="M3.5 8L12 12.5 20.5 8M12 12.5V21" /></>, w, 2),
  ticks: (w = 18) => sv(<><path d="M2.5 12.5l4 4L14 9" /><path d="M10.5 16l.5.5L21.5 7" /></>, w, 2.2),
}

export const Star = ({ size = 14, color = 'var(--brass)', style }) => (
  <svg width={size} height={size} viewBox="-10 -10 20 20" style={style} aria-hidden="true">
    <path d="M0 -10 L2.93 -7.07 L7.07 -7.07 L7.07 -2.93 L10 0 L7.07 2.93 L7.07 7.07 L2.93 7.07 L0 10 L-2.93 7.07 L-7.07 7.07 L-7.07 2.93 L-10 0 L-7.07 -2.93 L-7.07 -7.07 L-2.93 -7.07 Z" fill={color} />
  </svg>
)
// official wordmark (public/logo.svg) tinted with any color through a CSS mask
export const Logo = ({ size = 22, color = 'var(--ivory)' }) => {
  const h = size * 0.95, url = `url(${import.meta.env.BASE_URL}logo.svg)`
  return <span className="logo-mark" role="img" aria-label="amariya" style={{ display: 'inline-block', height: h, width: h * 3.295, background: color, WebkitMask: `${url} center / contain no-repeat`, mask: `${url} center / contain no-repeat` }} />
}

// amounts in RTL text: keep digits + DH left-to-right
export const DH = ({ v, unit = true }) => <span className="num" dir="ltr">{money(v)}{unit && <small> DH</small>}</span>

// light tap on the phone (Android) when something is saved
export const haptic = (ms = 10) => { try { navigator.vibrate?.(ms) } catch { /* */ } }

// number that rolls to its new value (counts from the value currently on screen)
export function Count({ v, unit = true }) {
  const [shown, setShown] = useState(v)
  const cur = useRef(v)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { cur.current = v; setShown(v); return }
    const from = cur.current, t0 = performance.now(), d = 520
    let raf
    const step = (t) => { const p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3); cur.current = from + (v - from) * e; setShown(cur.current); if (p < 1) raf = requestAnimationFrame(step) }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [v])
  return <DH v={Math.round(shown)} unit={unit} />
}

// readiness ring: n of total checks done
export function Ring({ done, total, size = 46, light }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r, p = total ? done / total : 0
  return (
    <span className="ring" style={{ width: size, height: size }} aria-label={`${done}/${total}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={light ? 'rgba(243,237,227,.18)' : 'rgba(15,42,36,.1)'} strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p === 1 ? 'var(--ok2)' : 'var(--brass)'} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <b dir="ltr">{done}/{total}</b>
    </span>
  )
}

// share text: native share sheet when available, otherwise WhatsApp
export async function shareText(text, phoneUrl) {
  if (phoneUrl) { window.open(phoneUrl, '_system') || (location.href = phoneUrl); return }
  if (navigator.share) { try { await navigator.share({ text }); return } catch { return } }
  const u = 'https://wa.me/?text=' + encodeURIComponent(text); window.open(u, '_system') || (location.href = u)
}

export function Dock({ tab, go }) {
  const items = [['weddings', 'العراسات', Ic.rings], ['staff', 'الخدامة', Ic.team], ['clients', 'الكليان', Ic.ppl], ['money', 'الفلوس', Ic.cash]]
  return (
    <nav className="dock" aria-label="menu"><div className="in" style={{ '--i': items.findIndex(([k]) => k === tab) }}>
      {items.some(([k]) => k === tab) && <span className="ind" aria-hidden="true" />}
      {items.map(([k, l, ic]) => (
        <button key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined}>
          {ic(23)}<span>{l}</span>
        </button>
      ))}
    </div></nav>
  )
}

export function Fab({ onClick, children }) {
  const [mini, setMini] = useState(false)
  useEffect(() => { const f = () => setMini(scrollY > 120); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f) }, [])
  return <button className={'fab' + (mini ? ' mini' : '')} onClick={() => { haptic(); onClick() }} aria-label={children}>{Ic.plus(22)}<span>{children}</span></button>
}

export function TopBar({ title, back, right }) {
  return (
    <header className="topbar">
      {back ? <button className="round" onClick={back} aria-label="رجوع">{Ic.back()}</button> : <span className="round ghost" />}
      <h2>{title}</h2>
      {right || <span className="round ghost" />}
    </header>
  )
}

export function Sheet({ onClose, title, children }) {
  const ref = useRef(null), drag = useRef(null)
  const down = (e) => { const el = ref.current; if (!el || e.target.closest('button')) return; drag.current = { y0: e.clientY, y: 0, t: performance.now(), v: 0 }; el.style.transition = 'none'; e.currentTarget.setPointerCapture(e.pointerId) }
  const move = (e) => {
    const d = drag.current; if (!d) return
    const dy = e.clientY - d.y0, now = performance.now()
    d.v = (dy - d.y) / Math.max(1, now - d.t); d.y = dy; d.t = now
    const y = dy > 0 ? dy : -(Math.abs(dy) * 0.55 * 60) / (60 + 0.55 * Math.abs(dy)) // rubber-band upward
    ref.current.style.transform = `translateY(${y}px)`
  }
  const up = () => {
    const d = drag.current; drag.current = null; if (!d) return
    const el = ref.current; el.style.transition = 'transform .32s cubic-bezier(.2,.9,.25,1)'
    const projected = d.y + d.v * 180 // momentum: where the flick is going
    if (projected > el.offsetHeight * 0.35) { el.style.transform = 'translateY(105%)'; setTimeout(onClose, 220) } else el.style.transform = ''
  }
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', k)
    document.body.classList.add('lock')
    return () => { removeEventListener('keydown', k); document.body.classList.remove('lock') }
  }, [onClose])
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" ref={ref} role="dialog" aria-modal="true" aria-label={title}>
        <div className="drag" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}><div className="grab" /></div>
        <div className="sheet-top" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}><h3>{title}</h3><button className="round sm" onClick={onClose} aria-label="سد">{Ic.x()}</button></div>
        <div className="sheet-body">{children}</div>
      </div>
    </>
  )
}

export function Field({ label, children, hint }) {
  return <label className="field"><span className="lab">{label}</span>{children}{hint && <span className="hint">{hint}</span>}</label>
}

export function Stepper({ value, onChange, step = 10, min = 0 }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(+value + step)} aria-label="زيد">+</button>
      <input inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))} dir="ltr" />
      <button type="button" onClick={() => onChange(Math.max(min, +value - step))} aria-label="نقص">−</button>
    </div>
  )
}

let toastFn = null
export const toast = (msg, kind) => { haptic(kind === 'err' ? [20, 40, 20] : 12); toastFn && toastFn({ msg, kind, id: Math.random() }) }
export function Toaster() {
  const [t, setT] = useState(null)
  useEffect(() => { toastFn = setT; return () => { toastFn = null } }, [])
  useEffect(() => { if (!t) return; const h = setTimeout(() => setT(null), 3200); return () => clearTimeout(h) }, [t])
  if (!t) return null
  return <div className={'toast ' + (t.kind || '')} role="status">{t.kind !== 'err' && <span className="tk">{Ic.check(14)}</span>}{t.msg}</div>
}
export const fail = (e) => { console.error(e); toast('ما تسجّلش، عاود جرّب', 'err') }

export const Empty = ({ title, sub }) => <div className="empty"><Star size={22} /><b>{title}</b>{sub && <p>{sub}</p>}</div>
export const Spin = () => <div className="spin" aria-label="loading" />

// green header band with a real photo behind (every main screen)
export function Band({ photo, pos = 'center 40%', kicker, title, back, right, children }) {
  return (
    <section className="band" style={photo ? { backgroundImage: `url(${photo})`, backgroundPosition: pos } : undefined}>
      <div className="band-in">
        <div className="band-top">
          <div className="band-t">
            {back && <button className="round glass" onClick={back} aria-label="رجوع">{Ic.back()}</button>}
            <div>{kicker && <span className="kick">{kicker}</span>}<h1>{title}</h1></div>
          </div>
          {right}
        </div>
        {children}
      </div>
    </section>
  )
}

// square photo thumbnail (crop of a bigger photo) or an icon tile
export const Thumb = ({ style, icon, size = 44, radius = 14 }) => (
  <span className="thumb" style={{ width: size, height: size, borderRadius: radius, ...style }}>{!style?.backgroundImage && icon}</span>
)

// big phone-style keypad for amounts (one hand, no keyboard popping up)
export function Numpad({ value, onChange }) {
  const press = (k) => {
    haptic(6)
    if (k === 'del') onChange(String(value).slice(0, -1))
    else { const n = (String(value) + k).replace(/^0+/, ''); if (n.length <= 7) onChange(n) }
  }
  // PC only: type the amount with the keyboard (digits, Backspace)
  const latest = useRef(press); latest.current = press
  useEffect(() => {
    if (!matchMedia('(min-width: 1024px)').matches) return
    const k = (e) => {
      if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName) || e.ctrlKey || e.metaKey) return
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); latest.current(e.key) }
      else if (e.key === 'Backspace') { e.preventDefault(); latest.current('del') }
    }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])
  return (
    <div className="numpad">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'].map((k) => (
        <button key={k} type="button" onClick={() => press(k)} aria-label={k === 'del' ? 'مسح' : k}>
          {k === 'del' ? sv(<><path d="M21 5H9l-6 7 6 7h12z" /><path d="M17 9l-6 6M11 9l6 6" /></>, 24, 2) : k}
        </button>
      ))}
    </div>
  )
}

// a Pro feature for a free account: the real thing behind frosted glass, a lock, why it is worth it, one button
export function Locked({ title, why, go, children, compact }) {
  return (
    <div className={'locked' + (compact ? ' compact' : '')}>
      <div className="lk-prev" aria-hidden="true" inert="">{children}</div>
      <div className="lk-over">
        <span className="lk-ic">{Ic.lock(20)}</span>
        <b>{title}</b>
        {why && <p>{why}</p>}
        <button className="btn brass" onClick={() => wantPlan('pro', title)}>{Ic.wa(16)} فتح بـ Pro · <span className="num" dir="ltr">{PRICES.pro}</span> درهم</button>
        <button className="linkbtn lk-more" onClick={() => go('plans')}>شوف شنو كاين فـ Pro</button>
      </div>
    </div>
  )
}
export const ProTag = () => <span className="protag">{Ic.lock(11)} Pro</span>
