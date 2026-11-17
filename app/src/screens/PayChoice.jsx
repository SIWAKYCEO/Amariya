// How the traiteur pays a plan: card (automatic, YouCan Pay), bank transfer or CashPlus (we turn the plan on after the receipt on WhatsApp).
import { useEffect, useState } from 'react'
import { SALES_WA, SUPABASE_URL, contactWaLink, isDemo, supabase, useStore } from '../lib/data'
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
const copy = async (v) => {
  try { await navigator.clipboard.writeText(v); return true } catch {
    // older phones: select a hidden field and copy it
    try { const t = document.createElement('textarea'); t.value = v; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok } catch { return false }
  }
}

// one value to copy: big, readable, with a clear button that confirms
function CopyRow({ label, value, show, big }) {
  const [ok, setOk] = useState(false)
  useEffect(() => { if (!ok) return; const t = setTimeout(() => setOk(false), 2200); return () => clearTimeout(t) }, [ok])
  const go = async () => { if (await copy(value)) { setOk(true); toast('تكوبيا ✓') } else toast(value) }
  return (
    <div className={'vr-row' + (big ? ' big' : '')}>
      <span className="vr-l">{label}</span>
      <b className="vr-v" dir="ltr">{show || value}</b>
      <button className={'vr-cp' + (ok ? ' ok' : '')} onClick={go}>{ok ? <>{Ic.check(14)} تكوبيا</> : <>{Ic.copy ? Ic.copy(14) : Ic.doc(14)} كوبي</>}</button>
    </div>
  )
}

// bank transfer: the amount, our account like a bank card, three simple steps
function Virement({ amt, name, onSend, onBack }) {
  const rib = RIB.replace(/\s/g, '')
  const ribShow = <>{rib.slice(0, 3)} <span>{rib.slice(3, 6)}</span> {rib.slice(6, 14)} <span>{rib.slice(14, 22)}</span> {rib.slice(22)}</>
  return (
    <div className="vr">
      <div className="vr-amt">
        <small>المبلغ اللي غادي تحوّل</small>
        <b><span className="num" dir="ltr">{Number(amt).toLocaleString('de-DE')}</span> درهم</b>
        <span className="vr-for">باقة {name}</span>
      </div>
      <div className="vr-card">
        <div className="vr-card-h"><span className="vr-bank"><Bank /></span><span>الحساب ديال Amariya</span></div>
        <CopyRow label="الاسم" value={PAYEE} />
        <CopyRow label="RIB · 24 رقم" value={rib} show={ribShow} big />
      </div>
      <ol className="vr-steps">
        <li><i>1</i><span>كوبي الـRIB والاسم</span></li>
        <li><i>2</i><span>دير التحويل ديال <b className="num" dir="ltr">{Number(amt).toLocaleString('de-DE')}</b> درهم من البنك ولا من التطبيق ديال البنك</span></li>
        <li><i>3</i><span>صيفط لينا صورة الوصل فالواتساب، ونفعّلو ليك {name} فنفس النهار</span></li>
      </ol>
      <button className="vr-send" onClick={onSend}>{Ic.wa(19)} صيفط صورة الوصل</button>
      <button className="vr-back" onClick={onBack}>{Ic.back(15)} طريقة أخرى ديال الخلاص</button>
    </div>
  )
}

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
          <button className="pmopt abroad" onClick={() => openExternal(contactWaLink(`بغيت نخلّص باقة ${name} ولكن عندي كارطة من برّا المغرب 🌍\nالبلاد ديالي: \nنوع الكارطة (Visa / Mastercard / أخرى): `))}>
            <span className="pm-top"><b>عندك كارطة من برّا المغرب؟</b></span>
            <small>كارطة أوروبية ولا من بلاد أخرى: كتب لينا فالواتساب وكنقولو ليك كيفاش تخلّص</small>
            <span className="pm-logos"><span className="pm-wa">{Ic.wa(20)}</span></span>
          </button>
          {busy && <div className="ycp-wait"><Spin /></div>}
          <p className="ycp-note">{Ic.lock(13)} الخلاص آمن. ما كنشوفوش معلومات الكارطة ديالك.</p>
        </div>
      )}
      {how === 'virement' && <Virement amt={amt} name={name} onSend={sendReceipt} onBack={() => setHow('pick')} />}
    </Sheet>
  )
}
