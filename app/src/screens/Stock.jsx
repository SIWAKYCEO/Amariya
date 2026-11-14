import { useState } from 'react'
import { add, isPro, remove, stockOf, update, useStore } from '../lib/data'
import { PHOTOS, dayLabel } from '../lib/util'
import { Band, Empty, Fab, Field, Ic, Locked, Sheet, fail, toast } from '../ui'

const SUGGEST = ['الطباسل', 'الكيسان', 'الفرشيطات', 'المغارف', 'الطيفورات', 'الطناجر الكبار', 'البرّادات', 'الصواني', 'النابات', 'الكراسي', 'الطابلات']

export default function Stock({ back, go }) {
  const s = useStore()
  const [edit, setEdit] = useState(null)
  const pro = isPro(s.traiteur)
  const list = (
    <div>
      {s.items.length === 0 && <Empty title="ما كاين حتى ماتريال" sub="زيد شحال عندك من كل حاجة مرة وحدة. من بعد كتخرّج منو لكل عرس وكتعرف شنو رجع وشنو تهرّس." />}
      {s.items.map((i) => {
        const st = stockOf(i, s)
        const pct = i.qty ? Math.min(100, (st.out / i.qty) * 100) : 0
        const away = s.witems.filter((x) => x.item_id === i.id && x.qty_back == null).map((x) => s.weddings.find((w) => w.id === x.wedding_id)).filter(Boolean)
        return (
          <button key={i.id} className="stk" onClick={() => setEdit(i)}>
            <span className="stk-t"><b>{i.name}</b><span className="num" dir="ltr">{st.free}<small> / {i.qty}</small></span></span>
            <span className="bar"><i style={{ width: 100 - pct + '%' }} /></span>
            <span className="stk-m">
              {st.out > 0 ? <span>خارج <b dir="ltr">{st.out}</b> عند {away.map((w) => w.family).join('، ')}</span> : <span>كلشي فالدار</span>}
              {st.broken > 0 && <span className="warn">تهرّس <b dir="ltr">{st.broken}</b></span>}
            </span>
          </button>
        )
      })}
    </div>
  )
  return (
    <div className="screen">
      <Band photo={PHOTOS.prep} title="الماتريال" back={back} kicker="شحال عندك، شحال خارج وشحال تهرّس" />
      <div className="content" style={{ paddingTop: 16 }}>
        {pro ? list : <Locked go={go} title="الماتريال ديالك تحت العين" why="كتعرف فين مشا كل طبسيل وكاس، واش كافيك لجوج عراسات فنهار واحد، وشحال تهرّس. ما يبقاش يضيع ليك الماتريال.">{list}</Locked>}
        {pro && <p className="hint" style={{ margin: '12px 4px' }}>الرقم الكبير هو اللي فالدار دابا. كليكي على حاجة باش تبدّل العدد ديالها.</p>}
      </div>
      {pro && <Fab onClick={() => setEdit({})}>زيد ماتريال</Fab>}
      {edit && <ItemSheet i={edit} close={() => setEdit(null)} />}
    </div>
  )
}

function ItemSheet({ i, close }) {
  const s = useStore()
  const [f, setF] = useState({ name: i.name || '', qty: i.qty ?? '' })
  const save = async () => {
    try {
      if (i.id) await update('items', i.id, { name: f.name.trim(), qty: +f.qty || 0 })
      else await add('items', { name: f.name.trim(), qty: +f.qty || 0 })
      toast(i.id ? 'تبدّل' : 'تزاد'); close()
    } catch (e) { fail(e) }
  }
  const hist = i.id ? s.witems.filter((x) => x.item_id === i.id).map((x) => ({ x, w: s.weddings.find((w) => w.id === x.wedding_id) })).filter((r) => r.w).sort((a, b) => b.w.day.localeCompare(a.w.day)).slice(0, 5) : []
  return (
    <Sheet title={i.id ? i.name : 'ماتريال جديد'} onClose={close}>
      {!i.id && <div className="quick">{SUGGEST.filter((n) => !s.items.some((x) => x.name === n)).slice(0, 8).map((n) => <button key={n} className={'qchip' + (f.name === n ? ' on' : '')} onClick={() => setF({ ...f, name: n })}>{n}</button>)}</div>}
      <Field label="السمية"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="مثلا: الطباسل" /></Field>
      <Field label="شحال عندك فالمجموع؟"><input inputMode="numeric" dir="ltr" className="big" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value.replace(/\D/g, '') })} placeholder="0" /></Field>
      {hist.length > 0 && <ul className="mat">{hist.map(({ x, w }) => <li key={x.id}><span className="mn"><b>{w.family}</b><small>{dayLabel(w.day)}{x.qty_back != null && (x.broken ? ` · تهرّس ${x.broken}` : ' · رجع')}</small></span><b className="mq" dir="ltr">{x.qty_out}</b></li>)}</ul>}
      <button className="btn brass wide" disabled={f.name.trim().length < 2} onClick={save}>سجّل</button>
      {i.id && <button className="btn ghost wide danger" onClick={() => { if (confirm('تمسح هاد الماتريال؟')) remove('items', i.id).then(() => { toast('تمسح'); close() }).catch(fail) }}>{Ic.trash()} مسحو</button>}
    </Sheet>
  )
}
