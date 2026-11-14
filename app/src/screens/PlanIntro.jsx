import { useState } from 'react'
import { PRICES, isDemo, planOf, useStore, wantPlan } from '../lib/data'
import { Ic, Logo, toast } from '../ui'

// shown once per traiteur: new ones choose how to start, the ones already inside choose after trying it
const KEY = (id) => 'amariya-intro-' + (id || 'x')
export function shouldShowIntro(t) {
  if (!t || t.internal) return false
  if (isDemo) return new URLSearchParams(location.search).has('intro')
  if (planOf(t) !== 'free') return false
  try { return !localStorage.getItem(KEY(t.id)) } catch { return false }
}

const BASIC = ['العراسات والكالوندري', 'العربون، الباقي والوصل', 'السرباية والنكافة', 'رابط الدوفي للعائلة']
const PRO = [
  ['الربح الصافي ديال كل عرس', 'كتعرف شحال بقا ليك بصّح'],
  ['لائحة الشرا بالأثمنة', 'كتعرف شحال غادي تصرف قبل ما تشري'],
  ['الدوفي والعقد PDF باللوغو ديالك', 'كتبان محترف قدام العائلة'],
  ['خلاص الخدامة والماتريال', 'شكون خلّصتي وشنو رجع'],
  ['النسخة ديال الكمبيوتر', 'وصفحتك فالأولين فالمدينة'],
]
const PREM = [
  ['واتساب كيجاوب بوحدو', 'الثمن، النهارات الخاوين والدوفي، حتى فالليل', true],
  ['تذكير وتأكيد أوتوماتيكي', 'العائلة والخدامة كيوصلهم كلشي بوحدهم', true],
  ['الميساجات كاملين فبلاصة وحدة', 'واتساب وأنستغرام وسط التطبيق', true],
]

export default function PlanIntro({ onClose }) {
  const s = useStore()
  const old = s.weddings.length > 0
  const [leaving, setLeaving] = useState(false)
  const close = () => { try { localStorage.setItem(KEY(s.traiteur?.id), String(Date.now())) } catch { /* */ } setLeaving(true); setTimeout(onClose, 260) }
  async function pick(plan) {
    const r = await wantPlan(plan).catch(() => null)
    if (r === 'demo') toast(plan === 'pro' ? 'تفعّل Pro فالتجربة' : 'تفعّل Premium فالتجربة')
    close()
  }

  return (
    <div className={'intro' + (leaving ? ' out' : '')} role="dialog" aria-modal="true" aria-label="اختار الباقة">
      <div className="in-scroll">
        <div className="in-top">
          <Logo size={30} />
          <h1>{old ? <>جرّبتي <span dir="ltr">Amariya</span> 👏</> : <>مرحبا بيك فـ <span dir="ltr">Amariya</span></>}</h1>
          <p>{old ? 'دابا اختار الباقة اللي تناسبك. إلا بقيتي فالمجاني، كلشي ديالك كيبقى كيف ما هو.' : 'اختار كيفاش بغيتي تبدا. المجاني مجاني ديما، وتقدر تبدّل من بعد.'}</p>
        </div>

        <div className="ip basic">
          <div className="ip-h"><b>المجاني</b><span><i className="num" dir="ltr">0</i> درهم · ديما</span></div>
          <ul className="ip-b">{BASIC.map((t) => <li key={t}>{Ic.check(13)}<span>{t}</span></li>)}</ul>
          <button className="btn wide ip-free" onClick={close}>{old ? 'نبقى فالمجاني دابا' : 'جرّب المجاني'}</button>
        </div>


        <div className="ip pro">
          <span className="ip-badge">الأكثر اختيار</span>
          <div className="ip-h"><b>Pro</b><span><i className="num" dir="ltr">{PRICES.pro}</i> درهم / الشهر</span></div>
          <p className="ip-why">باش تعرف شحال كتربح فكل عرس، وما يضيع ليك حتى درهم.</p>
          <p className="ip-all">كلشي اللي فالمجاني، وزيد:</p>
          <ul>{PRO.map(([t, d]) => <li key={t}>{Ic.check(14)}<span><b>{t}</b><small>{d}</small></span></li>)}</ul>
          <button className="btn brass wide" onClick={() => pick('pro')}>{Ic.wa(18)} بغيت Pro</button>
        </div>

        <div className="ip prem">
          <div className="ip-h"><b>Premium</b><span><i className="num" dir="ltr">{PRICES.premium}</i> درهم / الشهر</span></div>
          <p className="ip-why">التطبيق كيخدم بلاصتك: كيجاوب الكليان وكيوجّد كلشي بوحدو.</p>
          <p className="ip-all">كلشي اللي فـ Pro، وزيد:</p>
          <ul>{PREM.map(([t, d, soon]) => <li key={t}>{Ic.check(14)}<span><b>{t}{soon && <em>قريبا</em>}</b><small>{d}</small></span></li>)}</ul>
          <button className="btn ghost wide" onClick={() => pick('premium')}>{Ic.wa(18)} بغيت Premium</button>
        </div>

        <p className="ip-foot">{Ic.wa(14)} فـ Pro و Premium كتهضر معانا فالواتساب، كنشرحو ليك كلشي، كتخلّص بتحويل بنكي وكنفعّلو ليك فنفس النهار. تقدر تحبس وقتما بغيتي.</p>
      </div>
    </div>
  )
}
