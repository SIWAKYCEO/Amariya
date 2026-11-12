import { useEffect, useState } from 'react'
import { money } from './lib/util'

const sv = (d, w = 22, sw = 1.9) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)
export const Ic = {
  rings: (w) => sv(<><circle cx="9" cy="14" r="5" /><circle cx="15" cy="14" r="5" /><path d="M10 5.5l2-2.5 2 2.5" /></>, w),
  team: (w) => sv(<><circle cx="9" cy="9" r="3" /><path d="M3.5 19c1-2.8 3-4 5.5-4s4.5 1.2 5.5 4M16 7.5a2.6 2.6 0 1 1 0 5M17 15.5c1.8.4 3 1.6 3.6 3.5" /></>, w),
  ppl: (w) => sv(<><path d="M4 20v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1" /><circle cx="12" cy="8" r="3.6" /></>, w),
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

export function Dock({ tab, go }) {
  const items = [['weddings', 'العراسات', Ic.rings], ['staff', 'الخدامة', Ic.team], ['clients', 'الكليان', Ic.ppl], ['money', 'الفلوس', Ic.cash]]
  return (
    <nav className="dock" aria-label="menu"><div className="in">
      {items.map(([k, l, ic]) => (
        <button key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined}>
          {ic(23)}<span>{l}</span>
        </button>
      ))}
    </div></nav>
  )
}

export const Fab = ({ onClick, children }) => (
  <button className="fab" onClick={onClick}>{Ic.plus(22)}<span>{children}</span></button>
)

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
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', k)
    document.body.classList.add('lock')
    return () => { removeEventListener('keydown', k); document.body.classList.remove('lock') }
  }, [onClose])
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="grab" />
        <div className="sheet-top"><h3>{title}</h3><button className="round sm" onClick={onClose} aria-label="سد">{Ic.x()}</button></div>
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
export const toast = (msg, kind) => toastFn && toastFn({ msg, kind, id: Math.random() })
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
