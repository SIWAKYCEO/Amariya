import { isTraiteur } from '../lib/trades'
import { PLAN_NAME, PRICES, isDemo, planOf, totalOf, useStore } from '../lib/data'
import { PHOTOS, dayLabel, money } from '../lib/util'
import { Band, Ic, LangPill } from '../ui'
import { PlanCarousel } from './PlanIntro'
import { ContactSheet } from './Account'
import { useState } from 'react'


export default function Plans({ back }) {
  const s = useStore()
  const plan = planOf(s.traiteur)
  const ym = new Date().toISOString().slice(0, 7)
  const month = s.weddings.filter((w) => w.status !== 'cancelled' && w.status !== 'devis' && w.day.startsWith(ym))
  const income = month.reduce((a, w) => a + totalOf(w), 0)
  const [help, setHelp] = useState(false)


  return (
    <div className="screen plans">
      <Band photo={PHOTOS.hall2} title="الباقات" back={back} right={<LangPill light />} kicker={<>دابا عندك: <b>{PLAN_NAME[plan]}</b></>} />
      <div className="content" style={{ paddingTop: 4 }}>
        <button className="planhelp" onClick={() => setHelp(true)}>
          <span className="ic">{Ic.wa(20)}</span>
          <span className="gtx"><b>بغيتي تبدّل الباقة ولا عندك سؤال؟</b><small>كتب لينا فالواتساب، كنبدّلو ليك كلشي فنفس النهار</small></span>
          <span className="x">تواصل معانا</span>
        </button>
        <div className="plansbox"><PlanCarousel current={plan} start={plan === 'free' ? 'pro' : plan} /></div>

        {month.length > 0 && plan === 'free' && (
          <div className="pv">
            <span className="pv-n num" dir="ltr">{money(Math.round(PRICES.pro / month.length))}</span>
            <p>هاد الشهر عندك <b>{month.length}</b> {month.length === 1 ? 'عرس' : 'عراسات'} فيهم <b><bdi dir="ltr">{money(income)}</bdi> درهم</b>. Pro كيجيك بـ <b><bdi dir="ltr">{money(Math.round(PRICES.pro / month.length))}</bdi></b> درهم للعرس، وكتعرف فين كتمشي كل درهم.</p>
          </div>
        )}

        <h4 className="sec2">علاش Pro كيخلّص راسو؟</h4>
        <div className="why">
          {isTraiteur() ? <>
          <div><b className="num" dir="ltr">300</b><span>سرباي واحد نسيتي تخلّصو ولا خلّصتيه جوج مرات = <b dir="ltr">300</b> درهم. Pro = <b dir="ltr">{PRICES.pro}</b>.</span></div>
          <div><b className="num" dir="ltr">20</b><span>20 طبسيل ضاعو فعرس واحد كيسواو كثر من الشهر ديال Pro.</span></div>
          </> : <>
          <div><b className="num" dir="ltr">300</b><span>واحد من الفريق نسيتي تخلّصو ولا خلّصتيه جوج مرات = <b dir="ltr">300</b> درهم. Pro = <b dir="ltr">{PRICES.pro}</b>.</span></div>
          <div><b className="num" dir="ltr">2</b><span>جوج عراسات فنفس النهار بلا ما تعرف كيضيعو ليك كليان والسمعة. Pro كيبيّن ليك كلشي.</span></div>
          </>}
          <div><b className="num" dir="ltr">1</b><span>عرس واحد خاسر عرفتيه قبل ما توقّع، كيفكّك من آلاف الدراهم.</span></div>
        </div>

        <h4 className="sec2">سؤالات</h4>
        <div className="faq">
          <details><summary>كيفاش نخلّص؟</summary><p>كليكي على «بغيت Pro» ولا «بغيت Ultra» وخلّص بالكارطة البنكية من وسط التطبيق. الخلاص آمن، والباقة كتفعّل فالحين.</p></details>
          <details><summary>واش نقدر نحبس؟</summary><p>إيه، فأي وقت. إلا ما خلّصتيش الشهر الجاي كترجع للمجاني، والمعلومات ديالك كيبقاو كاملين.</p></details>
          <details><summary>واش المعلومات ديالي محميين؟</summary><p>المعلومات ديالك ديالك بوحدك. ما كنعطيوها لحتى واحد.</p></details>
        </div>
        {help && <ContactSheet onClose={() => setHelp(false)} />}
        {isDemo && <p className="hint" style={{ margin: '14px 4px' }}>هادي تجربة: «بغيت Pro» كيفتح ليك Pro دابا باش تشوف كيفاش كيخدم.</p>}
      </div>
    </div>
  )
}
