import { isTraiteur } from '../lib/trades'
import { LANG } from '../lib/i18n'
import { useEffect, useRef, useState } from 'react'
import { PRICES, ULTRA_SETUP, cardPay, choosePlan, isDemo, planOf, useStore, wantPlan } from '../lib/data'
import { Ic, LangPill, Logo, Sheet, toast } from '../ui'
import PayChoice from './PayChoice'

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
    get items() { return [['3 عراسات جداد فالشهر', 'العراسات اللي عندك كيبقاو ديما'], ['العراسات والكالوندري'], ['العربون، الباقي والوصل'], [isTraiteur() ? 'السرباية والنكافة' : 'الفريق ديالك'], ['رابط الدوفي للعائلة'], ['تفكير العائلة بالباقي']] },
  },
  {
    k: 'pro', name: 'Pro', price: PRICES.pro, per: 'درهم / الشهر', badge: 'الأكثر اختيار',
    line: 'كتنظّم كلشي وكتعرف شحال كتربح، والواتساب ديالك كيجاوب الكليان حتى وانت ناعس.',
    all: 'كلشي اللي فالمجاني، وزيد:',
    get items() { return [
      ['عراسات بلا حدود', 'زيد شحال ما بغيتي من عرس كل شهر'],
      ['واتساب كيجاوب بوحدو 24/24', 'الثمن، النهارات الخاوين والدوفي بالسمية ديالك، حتى فالليل'],
      ['كيحجز ليك النهار بوحدو', 'كيصيفط رابط العربون، وملّي يخلّصو كيتحجز النهار'],
      ['تذكير وتأكيد أوتوماتيكي', 'للعائلة بالباقي وللخدامة بالعرس'],
      ['الربح الصافي ديال كل عرس', 'شحال بقا ليك بصّح، ماشي غير شحال دخل'],
      isTraiteur() ? ['لائحة الشرا بالأثمنة', 'شحال غادي تصرف قبل ما تشري'] : ['البرنامج للفريق فالواتساب', 'شكون جاي لكل عرس، فين ومنين'],
      ['الدوفي والعقد PDF باللوغو ديالك', 'كتبان محترف، والعائلة كتوقّع'],
      ['خلاص الخدامة والماتريال', 'شكون خدم، شكون باقي، وشنو رجع'],
      ['الميساجات كاملين فبلاصة وحدة', 'واتساب وأنستغرام وسط التطبيق'],
      ['صفحتك فالأولين فمدينتك', 'العرايس كيشوفوك قبل الآخرين'],
      ['مساعدة فالواتساب', 'فريق Amariya معاك فاش ما احتجتي'],
    ] },
  },
  {
    k: 'ultra', name: 'Ultra', price: PRICES.ultra, per: 'درهم / الشهر', badge: 'حنا كنخدمو عليك', setup: ULTRA_SETUP,
    line: 'فريق Amariya كيبني ليك البراند ديالك ويجيب ليك الكليان، وانت غير خدم.',
    all: 'كلشي اللي فـ Pro، وزيد:',
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

// plan windows: an arch on top of every card that shows what the plan gives, before reading anything
function PlanWindow({ k }) {
  if (k === 'free') return (
    <div className="pz-win" aria-hidden="true">
      <span className="pz-star" />
      <div className="pz-cal">
        <div className="pz-cal-h"><span>الكالوندري ديالك</span><span>3 عراسات</span></div>
        <div className="pz-cal-g">{Array.from({ length: 14 }, (_, i) => <i key={i} className={i === 2 || i === 11 ? 'w' : i === 5 ? 'h' : ''} />)}</div>
      </div>
    </div>
  )
  if (k === 'pro') return (
    <div className="pz-win" aria-hidden="true">
      <span className="pz-live">{Ic.wa(13)} كيجاوب بوحدو · 24/24</span>
      <div className="pz-chat">
        <p className="pz-in">سلام، واش 14 دجنبر خاوي؟ وشحال الثمن؟</p>
        <p className="pz-out">مرحبا بيك، 14 دجنبر خاوي. هادا الدوفي ورابط العربون باش نحجزو ليك النهار<small>Amariya · دابا</small></p>
      </div>
    </div>
  )
  return (
    <div className="pz-win" aria-hidden="true">
      <span className="pz-crown">{crown(12)} حنا كنخدمو عليك</span>
      <div className="pz-tiles"><i className="site" /><i className="vid" /><i className="reels"><b dir="ltr">4×</b></i></div>
    </div>
  )
}

// three plans: on the phone small arches on top (all three always visible) and cards that swipe; on tablet and PC the three side by side
export function PlanCarousel({ current: cur0 = 'free', onFree, freeLabel, start = 'pro', after, intro = false }) {
  const current = cur0 === 'premium' ? 'pro' : cur0
  const [on, setOn] = useState(start === 'premium' ? 'pro' : start)
  const track = useRef(null)
  const go = (k, smooth = true) => {
    setOn(k)
    const t = track.current, el = t?.querySelector(`[data-k="${k}"]`)
    if (!el || getComputedStyle(t).overflowX === 'visible') return
    const tr = t.getBoundingClientRect(), r = el.getBoundingClientRect()
    t.scrollTo({ left: t.scrollLeft + (r.left + r.width / 2) - (tr.left + tr.width / 2), behavior: smooth ? 'smooth' : 'auto' })
  }
  useEffect(() => { const id = requestAnimationFrame(() => go(start === 'premium' ? 'pro' : start, false)); return () => cancelAnimationFrame(id) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const onScroll = () => {
    const t = track.current; if (!t) return
    const tr = t.getBoundingClientRect(), mid = tr.left + tr.width / 2
    let best = null, d = 1e9
    t.querySelectorAll('[data-k]').forEach((c) => { const r = c.getBoundingClientRect(), m = r.left + r.width / 2; if (Math.abs(m - mid) < d) { d = Math.abs(m - mid); best = c.dataset.k } })
    if (best && best !== on) setOn(best)
  }
  const [card, setCard] = useState(null)
  async function pick(k) {
    if (k === 'free') { if (intro) choosePlan('free'); return onFree?.() }
    if (cardPay()) return setCard(k)
    return viaWa(k)
  }
  async function viaWa(k) {
    const r = await wantPlan(k, null, intro).catch(() => null)
    if (r === 'demo') toast(`تفعّل ${PLANS.find((p) => p.k === k).name} فالتجربة`)
    after?.()
  }
  const short = (p) => (p.k === 'free' ? 'ديما' : 'درهم / الشهر')
  return (
    <div className="pz" data-keep-cur>
      <div className="pz-tabs" role="tablist">
        {PLANS.map((p) => (
          <button key={p.k} role="tab" aria-selected={on === p.k} className={'pz-tab ' + p.k + (on === p.k ? ' on' : '')} onClick={() => go(p.k)}>
            {p.k === 'pro' && <span className="pz-flag">{p.badge}</span>}
            <b>{p.k === 'ultra' && crown(11)}{p.name}</b>
            <i className="num" dir="ltr">{p.price}</i>
            <small>{short(p)}</small>
          </button>
        ))}
      </div>
      <div className="pz-track" ref={track} onScroll={onScroll}>
        {PLANS.map((p) => (
          <article key={p.k} data-k={p.k} className={'pz-card ' + p.k + (current === p.k ? ' cur' : '')}>
            {p.k === 'pro' && <span className="pz-badge">{p.badge}</span>}
            <PlanWindow k={p.k} />
            <div className="pz-body">
              <div className="pz-row">
                <span className="pz-name">{p.name}</span>
                <span className="pz-price"><i className="num" dir="ltr">{p.price}</i><small>{p.per}</small></span>
              </div>
              {p.setup && <p className="pz-setup">+ <span className="num" dir="ltr">{p.setup.toLocaleString('de-DE')}</span> درهم مرة وحدة فالبداية</p>}
              <p className="pz-line">{p.line}</p>
              <div className="pz-feats">
                {p.all && <p className="pz-all">{p.all}</p>}
                <ul>{p.items.map(([t, d]) => <li key={t} title={d || undefined}>{t}</li>)}</ul>
              </div>
              <div className="pz-foot">
                {current === p.k
                  ? <span className="pz-cur">{Ic.check(14)} هادي اللي عندك دابا</span>
                  : p.k === 'free'
                    ? (onFree && <button className="pz-btn" onClick={() => pick('free')}>{freeLabel || 'جرّب المجاني'}<i>←</i></button>)
                    : <button className="pz-btn" onClick={() => pick(p.k)}>بغيت {p.name}<i>←</i></button>}
              </div>
            </div>
          </article>
        ))}
      </div>
      {card && <PayChoice plan={card} name={PLANS.find((p) => p.k === card).name} onClose={() => { setCard(null); after?.() }} />}
    </div>
  )
}

export default function PlanIntro({ onClose }) {
  const s = useStore()
  const old = s.weddings.length > 0
  const [leaving, setLeaving] = useState(false)
  const close = () => { try { localStorage.setItem(KEY(s.traiteur?.id), String(Date.now())) } catch { /* */ } setLeaving(true); setTimeout(onClose, 260) }
  return (
    <div className={'intro pzi' + (leaving ? ' out' : '')} role="dialog" aria-modal="true" aria-label="اختار الباقة">
      <div className="pzi-arch" aria-hidden="true" />
      <div className="pzi-wrap">
        <div className="pzi-bar"><Logo size={24} /><LangPill light /></div>
        <div className="pzi-top">
          <span className="pzi-pill">بلا التزام · بدّل ولا وقّف فاين ما بغيتي</span>
          <h1>{LANG !== 'ar' ? (old ? 'اختار الباقة ديالك' : 'كيفاش بغيتي تبدا؟') : old ? <>اختار <em>الباقة</em> ديالك</> : <>كيفاش بغيتي <em>تبدا</em>؟</>}</h1>
          <p>{old ? 'جرّبتي التطبيق. إلا بقيتي فالمجاني، كلشي ديالك كيبقى.' : 'المجاني مجاني ديما. ختار الباقة اللي كتناسب الخدمة ديالك.'}</p>
        </div>
        <PlanCarousel intro current={null} onFree={close} freeLabel={old ? 'نبقى فالمجاني دابا' : 'جرّب المجاني'} after={close} />
        <p className="pzi-foot">{cardPay() ? <>{Ic.cash(13)} كتخلّص بالكارطة، بالتحويل البنكي ولا بـ CashPlus، والباقة كتفعّل ليك.</> : <>{Ic.wa(13)} كتهضر معانا فالواتساب، كنشرحو ليك كلشي، كتخلّص بتحويل بنكي وكنفعّلو ليك فنفس النهار.</>}</p>
      </div>
    </div>
  )
}
