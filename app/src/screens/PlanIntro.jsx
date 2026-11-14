import { useEffect, useRef, useState } from 'react'
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

const crown = (w = 16) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-2 10H5L3 8zm2.6 11.5h12.8v1.5H5.6z" /></svg>
)

export const PLANS = [
  {
    k: 'free', name: 'المجاني', price: 0, per: 'ديما مجاني',
    line: 'باش تنظّم العراسات ديالك بلا كارني.',
    items: [['العراسات والكالوندري'], ['العربون، الباقي والوصل'], ['السرباية والنكافة'], ['رابط الدوفي للعائلة'], ['تفكير العائلة بالباقي']],
  },
  {
    k: 'pro', name: 'Pro', price: PRICES.pro, per: 'درهم / الشهر', badge: 'الأكثر اختيار',
    line: 'باش تعرف شحال كتربح فكل عرس، وما يضيع ليك حتى درهم.',
    all: 'كلشي اللي فالمجاني، وزيد:',
    items: [
      ['الربح الصافي ديال كل عرس', 'شحال بقا ليك بصّح، ماشي غير شحال دخل'],
      ['لائحة الشرا بالأثمنة', 'شحال غادي تصرف قبل ما تشري'],
      ['الدوفي والعقد PDF باللوغو ديالك', 'كتبان محترف، والعائلة كتوقّع'],
      ['خلاص الخدامة', 'شكون خدم وشكون باقي ما خلّصتيهش'],
      ['الماتريال', 'شنو خرج، شنو رجع وشنو تهرّس'],
      ['صفحتك فالأولين فمدينتك', 'العرايس كيشوفوك قبل الآخرين'],
      ['النسخة ديال الكمبيوتر', 'خدم بشاشة كبيرة فالبيرو'],
      ['مساعدة فالواتساب', 'فريق Amariya معاك'],
    ],
  },
  {
    k: 'premium', name: 'Premium', price: PRICES.premium, per: 'درهم / الشهر',
    line: 'وانت ناعس ولا مشغول، الواتساب ديالك كيجاوب الكليان ويحجز ليك العراسات.',
    all: 'كلشي اللي فـ Pro، وزيد:',
    items: [
      ['واتساب كيجاوب بوحدو 24/24', 'الثمن، النهارات الخاوين والدوفي بالسمية ديالك'],
      ['كيحجز ليك النهار بوحدو', 'كيصيفط رابط العربون، وملّي يخلّصو كيتحجز النهار'],
      ['تذكير وتأكيد أوتوماتيكي', 'للعائلة بالباقي وللخدامة بالعرس'],
      ['الميساجات كاملين فبلاصة وحدة', 'واتساب وأنستغرام وسط التطبيق'],
    ],
  },
  {
    k: 'ultra', name: 'Ultra', price: PRICES.ultra, per: 'درهم / الشهر', badge: 'حنا كنخدمو عليك', note: 'أقل مدة: 3 شهور',
    line: 'فريق Amariya كيبني ليك البراند ديالك ويجيب ليك الكليان، وانت غير خدم.',
    all: 'كلشي اللي فـ Premium، وزيد:',
    items: [
      ['سيت ويب كامل باسمك', 'دومين ديالك، المينو، الصور والأثمنة، والطلبات كيوصلو للتطبيق'],
      ['لوغو وهوية كاملة', 'اللوغو، الألوان، المينو للطباعة، الدوفي وبطائق الزيارة'],
      ['فيديو إشهاري للأدز', 'واجد لأنستغرام وفيسبوك'],
      ['مونطاج 4 ريلز كل شهر', 'من الفيديوهات ديال العراسات اللي كتصيفط لينا'],
      ['غوغل ماپس', 'باش يلقاوك اللي كيقلبو على تريتور فمدينتك'],
      ['أنستغرام مقاد', 'البيو، الصورة، الستوريات المميزة ولينك السيت'],
      ['حملة إشهار كنطلقوها ليك', 'الميزانية ديال الإشهار عليك'],
      ['تقييمات غوغل', 'بعد كل عرس العائلة كتوصلها رسالة باش تقيّمك'],
      ['شخص خاص بيك فالواتساب', 'كيجاوبك قبل الآخرين'],
    ],
  },
]

// four plans side by side: pills on top to jump, cards that swipe; every plan reachable without scrolling the page
export function PlanCarousel({ current = 'free', onFree, freeLabel, start = 'pro', after }) {
  const [on, setOn] = useState(start)
  const track = useRef(null)
  const go = (k, smooth = true) => {
    setOn(k)
    const t = track.current, el = t?.querySelector(`[data-k="${k}"]`)
    if (!el) return
    const tr = t.getBoundingClientRect(), r = el.getBoundingClientRect()
    t.scrollBy({ left: (r.left + r.width / 2) - (tr.left + tr.width / 2), behavior: smooth ? 'smooth' : 'auto' })
  }
  useEffect(() => { go(start, false) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const onScroll = () => {
    const t = track.current; if (!t) return
    const tr = t.getBoundingClientRect(), mid = tr.left + tr.width / 2
    let best = null, d = 1e9
    t.querySelectorAll('[data-k]').forEach((c) => { const r = c.getBoundingClientRect(), m = r.left + r.width / 2; if (Math.abs(m - mid) < d) { d = Math.abs(m - mid); best = c.dataset.k } })
    if (best && best !== on) setOn(best)
  }
  async function pick(k) {
    if (k === 'free') return onFree?.()
    const r = await wantPlan(k).catch(() => null)
    if (r === 'demo') toast(`تفعّل ${PLANS.find((p) => p.k === k).name} فالتجربة`)
    after?.()
  }
  return (
    <div className="pcar">
      <div className="pc-pills" role="tablist">
        {PLANS.map((p) => (
          <button key={p.k} role="tab" aria-selected={on === p.k} className={'pc-pill ' + p.k + (on === p.k ? ' on' : '')} onClick={() => go(p.k)}>
            {p.k === 'ultra' && crown(13)}{p.name}
          </button>
        ))}
      </div>
      <div className="pc-track" ref={track} onScroll={onScroll}>
        {PLANS.map((p) => (
          <article key={p.k} data-k={p.k} className={'pc-card ' + p.k + (current === p.k ? ' cur' : '')}>
            <div className="pc-top">
              {p.badge && <span className="pc-badge">{p.k === 'ultra' && crown(12)}{p.badge}</span>}
              <header className="pc-h">
                <b>{p.k === 'ultra' && crown(20)}{p.name}</b>
                <span className="pc-price"><i className="num" dir="ltr">{p.price}</i><small>{p.per}</small></span>
              </header>
              <p className="pc-line">{p.line}</p>
            </div>
            <div className="pc-body">
              {p.all && <p className="pc-all">{p.all}</p>}
              <ul className="pc-list">
                {p.items.map(([t, d]) => <li key={t}><i className="pc-ic">{Ic.check(12)}</i><span><b>{t}</b>{d && <small>{d}</small>}</span></li>)}
              </ul>
            </div>
            <div className="pc-foot">
              {p.note && <small className="pc-note">{p.note}</small>}
              {current === p.k
                ? <span className="pc-cur">{Ic.check(14)} هادي اللي عندك دابا</span>
                : p.k === 'free'
                  ? (onFree && <button className="btn wide pc-btn" onClick={() => pick('free')}>{freeLabel || 'جرّب المجاني'}</button>)
                  : <button className="btn wide pc-btn" onClick={() => pick(p.k)}>{Ic.wa(17)} بغيت {p.name}</button>}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default function PlanIntro({ onClose }) {
  const s = useStore()
  const old = s.weddings.length > 0
  const [leaving, setLeaving] = useState(false)
  const close = () => { try { localStorage.setItem(KEY(s.traiteur?.id), String(Date.now())) } catch { /* */ } setLeaving(true); setTimeout(onClose, 260) }
  return (
    <div className={'intro' + (leaving ? ' out' : '')} role="dialog" aria-modal="true" aria-label="اختار الباقة">
      <div className="in-wrap">
        <div className="in-top">
          <Logo size={24} />
          <h1>{old ? 'اختار الباقة ديالك' : 'كيفاش بغيتي تبدا؟'}</h1>
          <p>{old ? 'جرّبتي التطبيق. إلا بقيتي فالمجاني، كلشي ديالك كيبقى.' : 'المجاني مجاني ديما. تقدر تبدّل الباقة وقتما بغيتي.'}</p>
        </div>
        <PlanCarousel current={null} onFree={close} freeLabel={old ? 'نبقى فالمجاني دابا' : 'جرّب المجاني'} after={close} />
        <p className="ip-foot">{Ic.wa(13)} كتهضر معانا فالواتساب، كنشرحو ليك كلشي، كتخلّص بتحويل بنكي وكنفعّلو ليك فنفس النهار.</p>
      </div>
    </div>
  )
}
