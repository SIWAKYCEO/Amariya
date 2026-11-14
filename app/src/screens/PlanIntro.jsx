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
  ['الربح الصافي ديال كل عرس', 'كتعرف شحال بقا ليك بصّح، ماشي غير شحال دخل'],
  ['لائحة الشرا بالأثمنة', 'كتعرف شحال غادي تصرف قبل ما تشري'],
  ['الدوفي والعقد PDF باللوغو ديالك', 'كتبان محترف، والعائلة كتوقّع على الشروط'],
  ['خلاص الخدامة', 'شكون خدم، شحال ليه، وشكون باقي ما خلّصتيهش'],
  ['الماتريال', 'شنو خرج للعرس، شنو رجع وشنو تهرّس'],
  ['الصفحة ديالك فالأولين', 'فـ «لقا تريتور فمدينتك»، العرايس كيشوفوك قبل الآخرين'],
  ['النسخة ديال الكمبيوتر', 'خدم بشاشة كبيرة فالبيرو'],
  ['مساعدة فالواتساب', 'فريق Amariya معاك إلا حبستي فشي حاجة'],
]
const PREM = [
  ['واتساب كيجاوب بوحدو 24/24', 'وانت ناعس ولا مشغول فعرس، كيجاوب الكليان: الثمن، النهارات الخاوين والدوفي بالسمية ديالك'],
  ['كيحجز ليك النهار بوحدو', 'كيصيفط رابط العربون، وملّي يخلّصو كيتحجز النهار فالكالوندري'],
  ['تذكير وتأكيد أوتوماتيكي', 'العائلة كتوصلها بالباقي، والخدامة كيتفكّرو بالعرس، بلا ما تكليكي'],
  ['الميساجات كاملين فبلاصة وحدة', 'واتساب وأنستغرام وسط التطبيق'],
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
          <p className="ip-why">ملّي تكون ناعس ولا مشغول، الواتساب ديالك كيبقى يجاوب الكليان ويحجز ليك العراسات. كتفيق وتلقى كلشي واجد.</p>
          <p className="ip-all">كلشي اللي فـ Pro، وزيد:</p>
          <ul>{PREM.map(([t, d]) => <li key={t}>{Ic.check(14)}<span><b>{t}</b><small>{d}</small></span></li>)}</ul>
          <button className="btn ghost wide" onClick={() => pick('premium')}>{Ic.wa(18)} بغيت Premium</button>
        </div>

        <p className="ip-foot">{Ic.wa(14)} فـ Pro و Premium كتهضر معانا فالواتساب، كنشرحو ليك كلشي، كتخلّص بتحويل بنكي وكنفعّلو ليك فنفس النهار. تقدر تحبس وقتما بغيتي.</p>
      </div>
    </div>
  )
}
