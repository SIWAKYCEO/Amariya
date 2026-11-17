// Pay a plan by card with YouCan Pay: our server makes the token, yp.js shows the card form here, the webhook turns the plan on.
import { useEffect, useRef, useState } from 'react'
import { SUPABASE_URL, contactWaLink, load, supabase } from '../lib/data'
import { Ic, Sheet, Spin } from '../ui'
import { openExternal } from '../lib/util'
import { CashPlus, Mastercard, Visa } from '../PayLogos'

let ypLoading = null
const loadYp = () => ypLoading || (ypLoading = new Promise((ok, ko) => {
  if (window.yp) return ok()
  const s = document.createElement('script'); s.src = 'https://youcanpay.com/yp.js'; s.onload = ok; s.onerror = () => { ypLoading = null; ko(new Error('yp')) }
  document.head.appendChild(s)
}))
const call = async (body) => {
  const { data } = await supabase.auth.getSession()
  const r = await fetch(`${SUPABASE_URL}/functions/v1/amariya-pay`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token || ''}` }, body: JSON.stringify(body) })
  return r.json().catch(() => ({}))
}

export default function PayCard({ plan, name, onClose, onOther, via = 'credit-card' }) {
  const cp = via === 'cash-plus' // CashPlus through YouCan: a code to pay at an agency, the plan turns on by itself
  const [st, setSt] = useState('loading') // loading | form | paying | code | done | fail | error
  const [why, setWhy] = useState('')
  const [round, setRound] = useState(0) // "try again" makes a fresh payment
  const [info, setInfo] = useState(null)
  const pay = useRef(null)
  useEffect(() => {
    let dead = false
    ;(async () => {
      try {
        const [j] = await Promise.all([call({ plan, via }), loadYp()])
        if (dead) return
        if (!j.token) throw new Error(j.error || 'token')
        setInfo(j); setSt('form')
        const lang = (document.documentElement.lang || 'ar').slice(0, 2)
        pay.current = window.yp(j.pub_key, { locale: ['ar', 'fr', 'en'].includes(lang) ? lang : 'ar' }).elements({ token: j.token, container: '#ycp-form', gateways: [via] })
        await pay.current.mount()
      } catch { if (!dead) setSt('error') }
    })()
    return () => { dead = true }
  }, [plan, round])

  async function confirm() {
    if (!pay.current) return
    if (cp) { // YouCan shows the code in its form; we tell the dashboard and explain what happens next
      setSt('code')
      call({ action: 'code', id: info.id }).catch(() => {})
      pay.current.confirm().catch(() => {})
      return
    }
    setSt('paying')
    let r = null
    try { r = await pay.current.confirm() } catch (e) { r = { error: e } }
    // whatever yp.js returns, the truth is our server (the webhook marks it paid)
    let paid = false
    for (let i = 0; i < 15; i++) {
      const s = await call({ action: 'status', id: info.id })
      if (s.status === 'paid') { paid = true; break }
      if (i >= 2 && r?.error) break
      await new Promise((w) => setTimeout(w, 2000))
    }
    if (!paid) {
      const reason = String(r?.error?.message || r?.error?.code || r?.message || '').slice(0, 140)
      setWhy(reason); setSt('fail')
      call({ action: 'failed', id: info.id, reason }).catch(() => {})
      return
    }
    await load().catch(() => {})
    setSt('done')
  }

  const retry = () => { setInfo(null); setWhy(''); setSt('loading'); setRound((x) => x + 1) }
  if (st === 'done') return <PayResult ok plan={plan} name={name} onClose={onClose} />
  if (st === 'fail' || st === 'error') return <PayResult plan={plan} name={name} error={st === 'error'} why={why} onRetry={retry} onOther={onOther} onClose={onClose} />

  return (
    <Sheet onClose={onClose} title={cp ? `خلّص ${name} بـ CashPlus` : `خلّص ${name} بالكارطة`}>
      <div className="ycp">
        {info && <div className="pm-head"><span className="pm-logos">{cp ? <CashPlus /> : <><Visa /><Mastercard /></>}</span><p className="ycp-amt"><b className="num" dir="ltr">{info.amount.toLocaleString('de-DE')}</b> درهم{info.sandbox && <em> · تجربة</em>}</p></div>}
        {st === 'loading' && <div className="ycp-wait"><Spin /></div>}
        <div id="ycp-form" key={round} style={{ display: st === 'form' || st === 'paying' || st === 'code' ? 'block' : 'none' }} />
        {(st === 'form' || st === 'paying') && <button className="btn wide brass" disabled={st === 'paying'} onClick={confirm}>{cp ? 'عطيني الكود ديال CashPlus' : st === 'paying' ? 'كنخلّصو…' : 'خلّص دابا'}</button>}
        {st === 'code' && <div className="ycp-wa"><b>سجّل الكود وخلّص بيه فأقرب وكالة CashPlus</b><small>ملي تخلّص، {name} كتفعّل فالتطبيق بوحدها، بلا ما تصيفط حتى حاجة.</small><button className="btn wide" onClick={onClose}>مزيان</button></div>}
        {st !== 'code' && <p className="ycp-note">الخلاص آمن عبر YouCan Pay. ما كنشوفوش معلومات الكارطة ديالك.</p>}
      </div>
    </Sheet>
  )
}

const UNLOCKED = {
  pro: ['واتساب كيجاوب بوحدو 24/24', 'الربح الصافي ديال كل عرس', 'الدوفي والعقد PDF باللوغو ديالك', 'خلاص الخدامة والماتريال'],
  ultra: ['سيت ويب كامل باسمك', 'لوغو وهوية كاملة', 'فيديو إشهاري للأدز', 'مونطاج 4 ريلز كل شهر'],
}

// full screen after the card payment: approved (green arch, gold star) or refused (clear reason, what to do now)
export function PayResult({ ok, plan, name, error, why, onRetry, onOther, onClose }) {
  return (
    <div className={'pres ' + (ok ? 'ok' : 'ko')} role="dialog" aria-modal="true" aria-label={ok ? 'الخلاص داز' : 'ما دازش الخلاص'}>
      <div className="pres-arch" aria-hidden="true" />
      <div className="pres-in">
        <div className="pres-mark" aria-hidden="true"><span className="pres-star" /><i>{ok ? Ic.check(30) : Ic.x(28)}</i></div>
        {ok ? <>
          <span className="pres-k">تخلّص بنجاح</span>
          <h1>مبروك! دابا راك فـ <em>{name}</em></h1>
          <p>كلشي تحلّ ليك فالتطبيق دابا، بلا ما تبدّل والو.</p>
          {UNLOCKED[plan] && <ul className="pres-list">{UNLOCKED[plan].map((t) => <li key={t}><i>{Ic.check(12)}</i>{t}</li>)}</ul>}
          <div className="pres-wa">
            <b>بغيتي الواتساب يجاوب الكليان ديالك بوحدو؟</b>
            <small>صيفط لينا ميساج ونشغّلوه ليك.</small>
            <button className="pres-btn line" onClick={() => openExternal(contactWaLink(`خلّصت ${name}، بغيت نشغّل الواتساب اللي كيجاوب بوحدو.`))}>{Ic.wa(17)} شغّلو ليا الواتساب</button>
          </div>
          <button className="pres-btn main" onClick={onClose}>بدا تخدم<i>←</i></button>
        </> : <>
          <span className="pres-k">ما دازش الخلاص</span>
          <h1>{error ? 'ما قدرناش نحلّو الخلاص دابا' : 'البنك ما قبلش الخلاص'}</h1>
          <p>{error ? 'عاود جرّب من بعد شوية.' : 'شوف المعلومات ديال الكارطة ولا جرّب بكارطة أخرى.'}</p>
          {why && <small className="pres-why" dir="auto">{why}</small>}
          <ul className="pres-list">
            <li><i>{Ic.cash(13)}</i>تأكد من الرقم والتاريخ والـ CVV</li>
            <li><i>{Ic.check(12)}</i>شوف واش الكارطة مفتوحة للخلاص فالأنترنيت</li>
          </ul>
          <button className="pres-btn main" onClick={onRetry}>عاود جرّب<i>←</i></button>
          {onOther && <button className="pres-btn line" onClick={onOther}>{Ic.cash(17)} خلّص بطريقة أخرى</button>}
          <button className="pres-link" onClick={() => openExternal(contactWaLink(`حاولت نخلّص ${name} بالكارطة وما دازش.`))}>{Ic.wa(15)} عاوننا فالواتساب</button>
          <button className="pres-link mute" onClick={onClose}>رجع</button>
        </>}
      </div>
    </div>
  )
}
