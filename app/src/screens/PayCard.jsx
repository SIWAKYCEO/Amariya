// Pay a plan by card with YouCan Pay: our server makes the token, yp.js shows the card form here, the webhook turns the plan on.
import { useEffect, useRef, useState } from 'react'
import { SUPABASE_URL, load, supabase, wantPlan } from '../lib/data'
import { Sheet, Spin, toast } from '../ui'

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

export default function PayCard({ plan, name, onClose }) {
  const [st, setSt] = useState('loading') // loading | form | paying | done | error
  const [info, setInfo] = useState(null)
  const pay = useRef(null)
  useEffect(() => {
    let dead = false
    ;(async () => {
      try {
        const [j] = await Promise.all([call({ plan }), loadYp()])
        if (dead) return
        if (!j.token) throw new Error(j.error || 'token')
        setInfo(j); setSt('form')
        const lang = (document.documentElement.lang || 'ar').slice(0, 2)
        pay.current = window.yp(j.pub_key, { locale: ['ar', 'fr', 'en'].includes(lang) ? lang : 'ar' }).elements({ token: j.token, container: '#ycp-form' })
        await pay.current.mount()
      } catch { if (!dead) setSt('error') }
    })()
    return () => { dead = true }
  }, [plan])

  async function confirm() {
    if (!pay.current) return
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
    if (!paid) { setSt('form'); toast(r?.error?.message || 'ما دازش الخلاص، عاود جرّب', 'err'); return }
    await load().catch(() => {})
    setSt('done')
  }

  return (
    <Sheet onClose={onClose} title={`خلّص ${name} بالكارطة`}>
      <div className="ycp">
        {info && <p className="ycp-amt"><b className="num" dir="ltr">{info.amount.toLocaleString('de-DE')}</b> درهم{info.sandbox && <em> · تجربة</em>}</p>}
        {st === 'loading' && <div className="ycp-wait"><Spin /></div>}
        {st === 'error' && <div className="ycp-err"><p>ما قدرناش نحلّو الخلاص بالكارطة دابا.</p><button className="btn wide" onClick={() => { wantPlan(plan); onClose() }}>خلّص بالتحويل البنكي فالواتساب</button></div>}
        {st === 'done'
          ? <div className="ycp-ok"><b>تخلّص بنجاح 🎉</b><p>{name} تفعّل فالحساب ديالك.</p><button className="btn wide" onClick={onClose}>مزيان</button></div>
          : <>
            <div id="ycp-form" style={{ display: st === 'form' || st === 'paying' ? 'block' : 'none' }} />
            {(st === 'form' || st === 'paying') && <button className="btn wide brass" disabled={st === 'paying'} onClick={confirm}>{st === 'paying' ? 'كنخلّصو…' : 'خلّص دابا'}</button>}
          </>}
        <p className="ycp-note">الخلاص آمن عبر YouCan Pay. ما كنشوفوش معلومات الكارطة ديالك.</p>
      </div>
    </Sheet>
  )
}
