import { useState } from 'react'
import { askPlan, askedPlan, isDemo, planOf, totalOf, useStore } from '../lib/data'
import { PHOTOS, dayLabel, money } from '../lib/util'
import { Band, Ic, fail, toast } from '../ui'

const FREE = ['العراسات والكالوندري', 'العربون، الباقي والوصل', 'السرباية والنكافة مأكدين', 'الصفحة ديالك وطلبات الدوفي', 'رابط العربون وصورة الوصل', 'تفكير الكليان بالباقي', 'ردود جاهزين']
const PRO = [
  ['الربح الصافي ديال كل عرس', 'كتعرف شحال ربحتي بصّح، ماشي غير شحال دخل.'],
  ['لائحة الشرا بالأثمنة', 'كتعرف شحال غادي تصرف قبل ما تشري.'],
  ['الدوفي والعقد PDF باللوغو ديالك', 'كتبان محترف، والعائلة كتوقّع على الشروط.'],
  ['الخلاص ديال الخدامة', 'شكون خلّصتي وشكون باقي، بلا كارني.'],
  ['الماتريال', 'شنو خرج، شنو رجع وشنو تهرّس.'],
  ['الصفحة ديالك فالأولين', 'فـ «لقا تريتور فمدينتك»، العرايس كيشوفوك قبل الآخرين.'],
  ['النسخة ديال الكمبيوتر', 'خدم بشاشة كبيرة فالبيرو.'],
]
const PREMIUM = [
  ['واتساب كيجاوب بوحدو 24/24', 'على «شحال للواحد؟» بالدوفي والنهارات الخاوين، حتى وانت ناعس.'],
  ['الميساجات كاملين وسط التطبيق', 'واتساب وأنستغرام فبلاصة وحدة.'],
  ['تذكير أوتوماتيكي', 'للعائلة بالباقي وللخدامة بالعرس، بلا ما تكليكي.'],
  ['تأكيد أوتوماتيكي', 'ملّي يوصل العربون، العائلة كتوصل بالوصل بوحدها.'],
]

export default function Plans({ back }) {
  const s = useStore()
  const plan = planOf(s.traiteur)
  const [asked, setAsked] = useState(() => ({ pro: askedPlan('pro'), premium: askedPlan('premium') }))
  const ym = new Date().toISOString().slice(0, 7)
  const month = s.weddings.filter((w) => w.status !== 'cancelled' && w.status !== 'devis' && w.day.startsWith(ym))
  const income = month.reduce((a, w) => a + totalOf(w), 0)

  async function ask(p) {
    try {
      const r = await askPlan(p)
      if (r === 'demo') toast(p === 'pro' ? 'تفعّل Pro فالتجربة' : 'تفعّل Premium فالتجربة')
      else { setAsked({ ...asked, [p]: Date.now() }); toast('توصلنا بالطلب ديالك') }
    } catch (e) { fail(e) }
  }

  return (
    <div className="screen plans">
      <Band photo={PHOTOS.hall2} title="الباقات" back={back} kicker={<>دابا عندك: <b>{plan === 'free' ? 'المجاني' : plan === 'pro' ? 'Pro' : 'Premium'}</b></>} />
      <div className="content" style={{ paddingTop: 16 }}>
        {month.length > 0 && plan === 'free' && (
          <div className="pv">
            <span className="pv-n num" dir="ltr">{money(Math.round(199 / month.length))}</span>
            <p>هاد الشهر عندك <b>{month.length}</b> {month.length === 1 ? 'عرس' : 'عراسات'} فيهم <b><bdi dir="ltr">{money(income)}</bdi> درهم</b>. Pro كيجيك بـ <b><bdi dir="ltr">{money(Math.round(199 / month.length))}</bdi></b> درهم للعرس، وكتعرف فين كتمشي كل درهم.</p>
          </div>
        )}

        <div className={'plan' + (plan === 'free' ? ' cur' : '')}>
          <div className="ph"><span><b>المجاني</b><small>باش تنظّم العراسات</small></span><span className="pp"><span className="num" dir="ltr">0</span><small>درهم</small></span></div>
          <ul className="pf">{FREE.map((f) => <li key={f}>{Ic.check(14)}<span>{f}</span></li>)}</ul>
          {plan === 'free' && <span className="pcur">هادي اللي عندك دابا</span>}
        </div>

        <div className={'plan pro' + (plan === 'pro' ? ' cur' : '')}>
          <span className="pbadge">كيخلّص راسو</span>
          <div className="ph"><span><b>Pro</b><small>باش تربح كثر وتضيّع أقل</small></span><span className="pp"><span className="num" dir="ltr">199</span><small>درهم / الشهر</small></span></div>
          <p className="pall">كلشي اللي فالمجاني، وزيد:</p>
          <ul className="pf">{PRO.map(([t, d]) => <li key={t}>{Ic.check(14)}<span><b>{t}</b><small>{d}</small></span></li>)}</ul>
          {plan === 'free' && (asked.pro
            ? <div className="pasked">{Ic.ticks(18)}<span><b>توصلنا بالطلب ديالك</b><small>غادي نتاصلو بيك فالواتساب اليوم باش نفعّلوه ليك.</small></span></div>
            : <button className="btn brass wide" onClick={() => ask('pro')}>بغيت Pro</button>)}
          {plan === 'pro' && <span className="pcur">{Ic.check(13)} خدام عندك{s.traiteur?.plan_until ? <> حتى {dayLabel(s.traiteur.plan_until.slice(0, 10))}</> : ''}</span>}
        </div>

        <div className={'plan prem' + (plan === 'premium' ? ' cur' : '')}>
          <span className="pbadge soon">قريبا</span>
          <div className="ph"><span><b>Premium</b><small>الواتساب كيخدم بلاصتك</small></span><span className="pp"><span className="num" dir="ltr">399</span><small>درهم / الشهر</small></span></div>
          <p className="pall">كلشي اللي فـ Pro، وزيد:</p>
          <ul className="pf">{PREMIUM.map(([t, d]) => <li key={t}>{Ic.check(14)}<span><b>{t}</b><small>{d}</small></span></li>)}</ul>
          {plan !== 'premium' && (asked.premium
            ? <div className="pasked">{Ic.ticks(18)}<span><b>سجّلناك</b><small>غادي تكون من الأولين ملّي يخرج.</small></span></div>
            : <button className="btn ghost wide" onClick={() => ask('premium')}>بغيت نكون من الأولين</button>)}
        </div>

        <h4 className="sec2">علاش Pro كيخلّص راسو؟</h4>
        <div className="why">
          <div><b className="num" dir="ltr">300</b><span>سرباي واحد نسيتي تخلّصو ولا خلّصتيه جوج مرات = <b dir="ltr">300</b> درهم. Pro = <b dir="ltr">199</b>.</span></div>
          <div><b className="num" dir="ltr">20</b><span>20 طبسيل ضاعو فعرس واحد كيسواو كثر من الشهر ديال Pro.</span></div>
          <div><b className="num" dir="ltr">1</b><span>عرس واحد خاسر عرفتيه قبل ما توقّع، كيفكّك من آلاف الدراهم.</span></div>
        </div>

        <h4 className="sec2">سؤالات</h4>
        <div className="faq">
          <details><summary>كيفاش نخلّص؟</summary><p>كليكي على «بغيت Pro». كنتاصلو بيك فالواتساب فنفس النهار، كتخلّص بتحويل بنكي ولا CashPlus، وكنفعّلوه ليك دغيا.</p></details>
          <details><summary>واش نقدر نحبس؟</summary><p>إيه، فأي وقت. إلا ما خلّصتيش الشهر الجاي كترجع للمجاني، والمعلومات ديالك كيبقاو كاملين.</p></details>
          <details><summary>واش المعلومات ديالي محميين؟</summary><p>المعلومات ديالك ديالك بوحدك. ما كنعطيوها لحتى واحد.</p></details>
        </div>
        {isDemo && <p className="hint" style={{ margin: '14px 4px' }}>هادي تجربة: «بغيت Pro» كيفتح ليك Pro دابا باش تشوف كيفاش كيخدم.</p>}
      </div>
    </div>
  )
}
