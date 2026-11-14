import { useState } from 'react'
import { MISC_LABEL, PRICE_DEFAULTS, PRICE_UNITS, profitOf, saveTraiteur, useStore } from '../lib/data'
import { money } from '../lib/util'
import { Count, DH, Ic, Sheet, fail, toast } from '../ui'
import { ExpenseSheet } from './Money'

// "how much do I really earn on this wedding?" — income minus food, staff and other costs
export function ProfitCard({ w }) {
  const s = useStore()
  const [sheet, setSheet] = useState(null) // 'how' | 'prices' | 'exp'
  const p = profitOf(w, s)
  if (!p.income) return null
  const lost = p.net < 0
  const parts = [
    ['food', p.food], ['staff', p.staff], ['other', p.other], ['net', Math.max(0, p.net)],
  ].filter(([, v]) => v > 0)
  const sum = parts.reduce((a, [, v]) => a + v, 0) || 1

  return (
    <div className={'card wprofit' + (lost ? ' lost' : '')}>
      <h3 className="pf-h">{p.past ? 'شحال ربحتي فهاد العرس؟' : 'شحال غادي تربح فهاد العرس؟'}</h3>

      <div className="pf-big">
        <small>{lost ? 'خسارة' : p.past ? 'الربح الصافي' : 'الربح الصافي (تقريبا)'}</small>
        <div className="pf-num"><Count v={p.net} /></div>
        <span className="pf-sub">على كل ضيف: <DH v={p.perGuest} /> · <span dir="ltr">{p.pct}%</span> من الدخل</span>
      </div>

      <div className="pf-bar" aria-hidden="true">{parts.map(([k, v]) => <i key={k} className={k} style={{ width: (v / sum) * 100 + '%' }} />)}</div>

      <ul className="pf-rows">
        <li><span className="k in" /><span className="t"><b>الدخل ديال العرس</b><small>الضياف × الثمن + الزيادات</small></span><span className="v plus"><DH v={p.income} /></span></li>
        <li>
          <span className="k food" />
          <span className="t"><b>الماكلة والسلعة {p.estimated && <em className="est">تقدير</em>}</b>
            <small>{p.estimated ? 'محسوبة من لائحة الشرا والأثمنة ديالك' : 'اللي سجّلتي بصّح لهاد العرس'}</small></span>
          <span className="v">− <DH v={p.food} /></span>
        </li>
        <li>
          <span className="k staff" />
          <span className="t"><b>الخدامة</b><small>{p.staffCount ? <><span dir="ltr">{p.staffCount}</span> خدام × الخلصة ديالهم</> : 'باقي ما زدتي الخدامة لهاد العرس'}</small></span>
          <span className="v">− <DH v={p.staff} /></span>
        </li>
        {p.other > 0 && (
          <li><span className="k other" /><span className="t"><b>مصاريف أخرى</b><small>المازوط، الكرا… اللي سجّلتي لهاد العرس</small></span><span className="v">− <DH v={p.other} /></span></li>
        )}
      </ul>

      {lost && <p className="pf-warn">هاد العرس خاسر. شوف الثمن ديال الضيف ولا المصاريف قبل ما تأكّد.</p>}
      {!lost && p.estimated && <p className="hint">هادا غير تقدير. ملّي تشري السلعة، سجّل شحال خلّصتي والربح كيولّي حقيقي.</p>}

      <button className="linkrow" onClick={() => setSheet('how')}><span className="qm">؟</span> كيفاش كنحسبو هاد الربح؟</button>

      <div className="btnrow pf-btns">
        <button className="btn green" onClick={() => setSheet('exp')}>سجّل شنو صرفتي</button>
        <button className="btn ghost" onClick={() => setSheet('prices')}>{Ic.pen(16)} الأثمنة ديالك</button>
      </div>

      {sheet === 'how' && (
        <Sheet title="كيفاش كنحسبو الربح؟" onClose={() => setSheet(null)}>
          <ol className="how">
            <li><b>الدخل:</b> عدد الضياف × الثمن ديال الضيف، وزيد عليه الزيادات بحال النكافة والديكور.</li>
            <li><b>الماكلة:</b> التطبيق كيحسب شحال خاصك تشري من اللحم والدجاج والحلويات… على حساب الضياف، وكيضربها فالأثمنة ديالك. وزيد <span dir="ltr">{money(PRICE_DEFAULTS.misc)}</span> درهم تقريبا على كل ضيف ديال {MISC_LABEL}.</li>
            <li><b>ملّي تسجّل الشرا بصّح</b> (اللحم، الدجاج، الخضرة…) لهاد العرس، التطبيق كيحيد التقدير وكيحط الرقم الحقيقي.</li>
            <li><b>الخدامة:</b> كل واحد زدتيه لهاد العرس بالخلصة ديالو.</li>
            <li><b>مصاريف أخرى:</b> المازوط، الكرا، وأي حاجة سجّلتيها لهاد العرس.</li>
          </ol>
          <div className="howeq"><span>الدخل</span><b>−</b><span>الماكلة</span><b>−</b><span>الخدامة</span><b>−</b><span>الأخرى</span><b>=</b><span className="r">الربح ديالك</span></div>
          <button className="btn brass wide" onClick={() => setSheet(null)}>فهمت</button>
        </Sheet>
      )}
      {sheet === 'prices' && <PricesSheet close={() => setSheet(null)} />}
      {sheet === 'exp' && <ExpenseSheet weddingId={w.id} close={() => setSheet(null)} />}
    </div>
  )
}

// the traiteur writes once what he pays for each thing; every wedding is computed with it
export function PricesSheet({ close }) {
  const s = useStore()
  const saved = s.traiteur?.costs || {}
  const keys = Object.keys(PRICE_UNITS)
  const [f, setF] = useState(() => Object.fromEntries([...keys, 'misc'].map((k) => [k, saved[k] ?? PRICE_DEFAULTS[k]])))
  const set = (k, v) => setF({ ...f, [k]: v.replace(/\D/g, '') })
  const save = () => saveTraiteur({ costs: Object.fromEntries(Object.entries(f).map(([k, v]) => [k, +v || 0])) }).then(() => { toast('تسجّلو الأثمنة'); close() }).catch(fail)
  return (
    <Sheet title="بشحال كتشري؟" onClose={close}>
      <p className="muted" style={{ marginBottom: 12 }}>حط الثمن اللي كتشري بيه انتا. كنحسبو بيه الربح ديال كل عرس بوحدو. إلا ما عرفتيش، خلّي الثمن اللي كاين.</p>
      <div className="prices">
        {keys.map((k) => (
          <label key={k} className="prc">
            <span><b>{k}</b><small>للـ{PRICE_UNITS[k]}</small></span>
            <span className="pin"><input inputMode="numeric" dir="ltr" value={f[k]} onChange={(e) => set(k, e.target.value)} /><small>DH</small></span>
          </label>
        ))}
        <label className="prc wide">
          <span><b>{MISC_LABEL}</b><small>على كل ضيف</small></span>
          <span className="pin"><input inputMode="numeric" dir="ltr" value={f.misc} onChange={(e) => set('misc', e.target.value)} /><small>DH</small></span>
        </label>
      </div>
      <button className="btn brass wide" onClick={save}>سجّل الأثمنة</button>
    </Sheet>
  )
}
