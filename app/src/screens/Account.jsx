import { useState } from 'react'
import { PLAN_NAME, contactWaLink, planOf, useStore } from '../lib/data'
import { Ic, Sheet } from '../ui'

const TOPICS = [
  ['بغيت نبدّل الباقة', 'بغيت نبدّل الباقة ديالي.'],
  ['بغيت نبدّل شي حاجة فالحساب', 'بغيت نبدّل شي حاجة فالحساب ديالي (الاسم، النمرة، المدينة…).'],
  ['عندي سؤال على التطبيق', 'عندي سؤال على التطبيق.'],
  ['عندي مشكل فالتطبيق', 'عندي مشكل فالتطبيق.'],
  ['بغيت نحبس ولا نوقف الحساب', 'بغيت نحبس ولا نوقف الحساب ديالي.'],
]

// "talk to us": pick a reason, WhatsApp opens with the message ready
export function ContactSheet({ onClose }) {
  return (
    <Sheet onClose={onClose} title="تواصل معانا">
      <p className="hint" style={{ margin: '0 2px 12px' }}>اختار علاش، وكيتحل ليك الواتساب ديالنا بالميساج واجد. كنجاوبوك فنفس النهار.</p>
      <div className="ctopics">
        {TOPICS.map(([label, text]) => (
          <a key={label} className="ctopic" href={contactWaLink(text)} target="_blank" rel="noopener noreferrer" onClick={onClose}>
            <span className="ic">{Ic.wa(18)}</span><b>{label}</b><span className="go">{Ic.back(16)}</span>
          </a>
        ))}
        <a className="ctopic main" href={contactWaLink('')} target="_blank" rel="noopener noreferrer" onClick={onClose}>
          <span className="ic">{Ic.wa(18)}</span><b>شي حاجة أخرى</b><span className="go">{Ic.back(16)}</span>
        </a>
      </div>
    </Sheet>
  )
}

// always on the home: current plan (tap = change plan) + talk to us
export function AccountBar({ go, dark = true }) {
  const s = useStore()
  const plan = planOf(s.traiteur)
  const [open, setOpen] = useState(false)
  return (
    <div className={'accbar' + (dark ? '' : ' light')}>
      <button className={'accplan is-' + plan} onClick={() => go('plans')}>
        <span className="k">الباقة ديالك</span>
        <b>{PLAN_NAME[plan]}</b>
        <span className="cta">{plan === 'free' ? 'شوف الباقات' : 'بدّل الباقة'}</span>
      </button>
      <button className="acchelp" onClick={() => setOpen(true)}>{Ic.wa(17)}<span>تواصل معانا</span></button>
      {open && <ContactSheet onClose={() => setOpen(false)} />}
    </div>
  )
}
