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
  if (how === 'card') return <PayCard plan={plan} name={name} onClose={onClose} onOther={() => setHow('pick')} />
  if (how === 'cashplus') return <PayCard plan={plan} name={name} onClose={onClose} onOther={() => setHow('pick')} via="cash-plus" />

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
    `خلّصت ${name} (${amt} درهم) بالتحويل البنكي.`,
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
          <button className="pmopt" onClick={() => setHow('cashplus')}>
            <span className="pm-top"><b>CashPlus</b><span className="pm-tag">كتفعّل بوحدها</span></span>
            <small>كتاخد كود وكتخلّص كاش فأقرب وكالة CashPlus</small>
            <span className="pm-logos"><CashPlus /></span>
          </button>
          {busy && <div className="ycp-wait"><Spin /></div>}
          <p className="ycp-note">{Ic.lock(13)} الخلاص آمن. ما كنشوفوش معلومات الكارطة ديالك.</p>
        </div>
      )}
      {how === 'virement' && (
        <div className="paymanual">
          <div className="pm-head"><Bank /><p className="ycp-amt"><b className="num" dir="ltr">{Number(amt).toLocaleString('de-DE')}</b> درهم</p></div>
          <p className="muted">دير التحويل لهاد الحساب:</p>
          <div className="pm-rows">
            <button className="pm-row" onClick={() => copy(PAYEE)}><small>باسم</small><b dir="ltr">{PAYEE}</b>{Ic.doc(15)}</button>
            <button className="pm-row" onClick={() => copy(RIB)}><small>RIB</small><b dir="ltr">{RIB}</b>{Ic.doc(15)}</button>
          </div>
          <p className="muted">من بعد صيفط لينا صورة الوصل فالواتساب، ونفعّلو ليك {name} فنفس النهار.</p>
          <button className="btn wide green" onClick={sendReceipt}>{Ic.wa(18)} صيفط صورة الوصل</button>
          <button className="linkrow" onClick={() => setHow('pick')}>{Ic.back(15)} طريقة أخرى</button>
        </div>
      )}
    </Sheet>
  )
}
