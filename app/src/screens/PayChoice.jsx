// How the traiteur pays a plan: card (automatic, YouCan Pay), bank transfer or CashPlus (we turn the plan on after the receipt on WhatsApp).
import { useState } from 'react'
import { SALES_WA, SUPABASE_URL, isDemo, supabase, useStore } from '../lib/data'
import { Ic, Sheet, Spin, toast } from '../ui'
import { openExternal } from '../lib/util'
import PayCard from './PayCard'
import { Bank, CashPlus, Mastercard, Visa } from '../PayLogos'

// our receiving details (given by Siwaky)
const PAYEE = 'Mohamed Amine Ennachti'
const RIB = '007 610 0007519700430005 38'
const CASHPLUS_PHONE = '0621287405'

const call = async (body) => {
  const { data } = await supabase.auth.getSession()
  const r = await fetch(`${SUPABASE_URL}/functions/v1/amariya-pay`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token || ''}` }, body: JSON.stringify(body) })
  return r.json().catch(() => ({}))
}
const copy = (v) => { try { navigator.clipboard.writeText(v.replace(/\s/g, v.length > 20 ? '' : ' ')); toast('تكوبيا') } catch { toast(v) } }

export default function PayChoice({ plan, name, onClose }) {
  const [how, setHow] = useState('pick') // pick | card | virement | cashplus
  const [amt, setAmt] = useState(null)
  const [busy, setBusy] = useState(false)
  const s = useStore()
  if (how === 'card') return <PayCard plan={plan} name={name} onClose={onClose} />

  async function manual(m) {
    setBusy(true)
    const j = isDemo ? { amount: plan === 'pro' ? 199 : 2380 } : await call({ action: 'manual', plan, method: m })
    setBusy(false)
    if (!j.amount) { toast('وقع مشكل، عاود جرّب', 'err'); return }
    setAmt(j.amount); setHow(m)
  }
  const tname = s.traiteur?.name || ''
  const sendReceipt = () => openExternal(`https://wa.me/${SALES_WA}?text=${encodeURIComponent([
    'السلام عليكم Amariya 👋',
    `خلّصت ${name} (${amt} درهم) ${how === 'cashplus' ? 'بـ CashPlus' : 'بالتحويل البنكي'}.`,
    'هاهي صورة الوصل 👇',
    tname && `الحساب: ${tname}`,
  ].filter(Boolean).join('\n'))}`)

  return (
    <Sheet onClose={onClose} title={how === 'pick' ? `كيفاش بغيتي تخلّص ${name}؟` : `خلّص ${name}`}>
      {how === 'pick' && (
        <div className="pmopts">
          <button className="pmopt best" onClick={() => setHow('card')}>
            <span className="pm-top"><b>بالكارطة البنكية</b><span className="pm-tag">كتفعّل فالحين</span></span>
            <small>Visa · Mastercard · الكارطة ديال أي بنك مغربي</small>
            <span className="pm-logos"><Visa /><Mastercard /></span>
          </button>
          <button className="pmopt" disabled={busy} onClick={() => manual('virement')}>
            <span className="pm-top"><b>بالتحويل البنكي</b></span>
            <small>Virement من البنك ولا من التطبيق ديال البنك</small>
            <span className="pm-logos"><Bank /></span>
          </button>
          <button className="pmopt" disabled={busy} onClick={() => manual('cashplus')}>
            <span className="pm-top"><b>CashPlus</b></span>
            <small>خلّص كاش من أقرب وكالة CashPlus</small>
            <span className="pm-logos"><CashPlus /></span>
          </button>
          {busy && <div className="ycp-wait"><Spin /></div>}
          <p className="ycp-note">{Ic.lock(13)} الخلاص آمن. ما كنشوفوش معلومات الكارطة ديالك.</p>
        </div>
      )}
      {(how === 'virement' || how === 'cashplus') && (
        <div className="paymanual">
          <div className="pm-head">{how === 'cashplus' ? <CashPlus /> : <Bank />}<p className="ycp-amt"><b className="num" dir="ltr">{Number(amt).toLocaleString('de-DE')}</b> درهم</p></div>
          <p className="muted">{how === 'cashplus' ? 'صيفط المبلغ من أي وكالة CashPlus بهاد المعلومات:' : 'دير التحويل لهاد الحساب:'}</p>
          <div className="pm-rows">
            <button className="pm-row" onClick={() => copy(PAYEE)}><small>{how === 'cashplus' ? 'الاسم' : 'باسم'}</small><b dir="ltr">{PAYEE}</b>{Ic.doc(15)}</button>
            {how === 'virement'
              ? <button className="pm-row" onClick={() => copy(RIB)}><small>RIB</small><b dir="ltr">{RIB}</b>{Ic.doc(15)}</button>
              : <button className="pm-row" onClick={() => copy(CASHPLUS_PHONE)}><small>رقم التيليفون</small><b dir="ltr">{CASHPLUS_PHONE}</b>{Ic.doc(15)}</button>}
          </div>
          <p className="muted">من بعد صيفط لينا صورة الوصل فالواتساب، ونفعّلو ليك {name} فنفس النهار.</p>
          <button className="btn wide green" onClick={sendReceipt}>{Ic.wa(18)} صيفط صورة الوصل</button>
          <button className="linkrow" onClick={() => setHow('pick')}>{Ic.back(15)} طريقة أخرى</button>
        </div>
      )}
    </Sheet>
  )
}
