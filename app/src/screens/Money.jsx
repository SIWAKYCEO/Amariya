import { useState } from 'react'
import { add, paidOf, profitOf, remove, restOf, totalOf, useStore } from '../lib/data'
import { MONTHS, PHOTOS, cropStyle, dayKey, dayLabel, expenseCrop, money, photoFor } from '../lib/util'
import { Band, Count, DH, Empty, Fab, Ic, Numpad, Sheet, Thumb, fail, toast } from '../ui'

export default function Money({ go }) {
  const s = useStore()
  const now = new Date()
  const [ym, setYm] = useState([now.getFullYear(), now.getMonth()])
  const [sheet, setSheet] = useState(false)
  const key = `${ym[0]}-${String(ym[1] + 1).padStart(2, '0')}`
  const inMonth = (d) => d && d.startsWith(key)
  const income = s.payments.filter((p) => inMonth(p.paid_on)).reduce((a, p) => a + +p.amount, 0)
  const exps = s.expenses.filter((e) => inMonth(e.spent_on)).sort((a, b) => b.spent_on.localeCompare(a.spent_on))
  // staff who came to a wedding of this month count as an expense automatically
  const staffCost = s.assignments.filter((a) => a.status === 'ok').reduce((sum, a) => {
    const w = s.weddings.find((x) => x.id === a.wedding_id)
    return w && w.status !== 'cancelled' && inMonth(w.day) && w.day <= dayKey(now) ? sum + (+a.pay || 0) : sum
  }, 0)
  const spent = exps.reduce((a, e) => a + +e.amount, 0) + staffCost
  const profit = income - spent
  const owed = s.weddings.filter((w) => w.status !== 'cancelled' && w.status !== 'devis').map((w) => ({ w, rest: restOf(w, s.payments) })).filter((x) => x.rest > 0).sort((a, b) => a.w.day.localeCompare(b.w.day))
  const owedTotal = owed.reduce((a, x) => a + x.rest, 0)
  const monthW = s.weddings.filter((w) => w.status !== 'cancelled' && w.status !== 'devis' && inMonth(w.day)).sort((a, b) => a.day.localeCompare(b.day)).map((w) => ({ w, p: profitOf(w, s) })).filter((x) => x.p.income > 0)
  const shift = (n) => { const d = new Date(ym[0], ym[1] + n, 1); setYm([d.getFullYear(), d.getMonth()]) }

  const paidPct = (w) => { const t = totalOf(w); return t ? Math.min(1, paidOf(w, s.payments) / t) : 0 }
  const inPct = income + spent > 0 ? (income / (income + spent)) * 100 : 50

  return (
    <div className="screen">
      <Band photo={PHOTOS.hall2} kicker={<>{MONTHS[ym[1]]} <span dir="ltr">{ym[0]}</span></>} title="الفلوس"
        right={<span className="mnav"><button className="round glass" onClick={() => shift(-1)} aria-label="الشهر اللي فات">{Ic.back(18)}</button><button className="round glass flip" onClick={() => shift(1)} aria-label="الشهر الجاي">{Ic.back(18)}</button></span>}>
        <span className="kick" style={{ marginTop: 14 }}>الصافي ديال هاد الشهر</span>
        <div className={'netv' + (profit < 0 ? ' neg' : '')}><Count v={profit} /></div>
        <div className="meter"><i style={{ width: inPct + '%', background: 'var(--brass)' }} /><i style={{ width: 100 - inPct + '%', background: 'rgba(243,237,227,.3)' }} /></div>
        <div className="split">
          <div><small><i className="dot in" />دخل</small><b><DH v={income} unit={false} /></b></div>
          <div><small><i className="dot out" />خرج</small><b><DH v={spent} unit={false} /></b></div>
        </div>
      </Band>
      <div className="content">
        <h4 className="sec2">باقي ليك عند الناس {owedTotal > 0 && <DH v={owedTotal} />}</h4>
        {owed.length === 0 ? <p className="muted">كلشي خالص.</p> : (
          <div className="hscroll">{owed.map(({ w, rest }) => {
            const p = paidPct(w), n = 5
            return (
              <button key={w.id} className="owc" onClick={() => go('wedding', { id: w.id })}>
                <span className="img" style={{ backgroundImage: `url(${photoFor(w.id)})` }}><span>{dayLabel(w.day)}</span></span>
                <span className="bd"><b>{w.family}</b>
                  <span className="segs">{Array.from({ length: n }, (_, i) => <i key={i} className={i < Math.round(p * n) ? 'on' : ''} />)}</span>
                  <span className="rest"><span>باقي</span><DH v={rest} /></span>
                </span>
              </button>
            )
          })}</div>
        )}

        {monthW.length > 0 && <>
          <h4 className="sec2">الربح ديال كل عرس</h4>
          <div className="ecard">{monthW.map(({ w, p }) => (
            <button key={w.id} className="erow2 pfr" onClick={() => go('wedding', { id: w.id })}>
              <Thumb size={44} style={{ backgroundImage: `url(${photoFor(w.id)})` }} />
              <span className="mid"><b>{w.family}</b><span className="meta">{dayLabel(w.day)} · {p.estimated ? 'تقدير' : 'محسوب بالشرا ديالك'}</span></span>
              <span className={'pfv' + (p.net < 0 ? ' neg' : '')}><DH v={p.net} unit={false} /></span>
            </button>
          ))}</div>
          <p className="hint" style={{ margin: '8px 4px 0' }}>كليكي على العرس باش تشوف منين جا الربح ولا الخسارة.</p>
        </>}

        <h4 className="sec2">المصاريف</h4>
        {exps.length === 0 && !staffCost && <Empty title="ما كاين حتى مصروف" sub="سجّل اللحم، الخضرة، الكرا… باش تعرف الربح الحقيقي." />}
        {(exps.length > 0 || staffCost > 0) && (
          <div className="ecard">
            {staffCost > 0 && <div className="erow2 auto"><Thumb icon={Ic.team(20)} /><span className="mid"><b>الخدامة</b><span className="meta">محسوبة من العراسات</span></span><DH v={staffCost} unit={false} /></div>}
            {exps.map((e) => (
              <div className="erow2" key={e.id}>
                <Thumb style={cropStyle(expenseCrop(e.label))} icon={Ic.cash(20)} />
                <span className="mid"><b>{e.label}</b><span className="meta">{dayLabel(e.spent_on, false)}{e.wedding_id ? ' · ' + (s.weddings.find((w) => w.id === e.wedding_id)?.family || '') : ''}</span></span>
                <DH v={e.amount} unit={false} />
                <button className="round sm ghost" onClick={() => remove('expenses', e.id).then(() => toast('تمسح')).catch(fail)} aria-label="مسح">{Ic.trash(15)}</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Fab onClick={() => setSheet(true)}>مصروف</Fab>
      {sheet && <ExpenseSheet close={() => setSheet(false)} />}
    </div>
  )
}

const QUICK = [['اللحم', 'meat'], ['الدجاج', 'chick'], ['الخضرة والفواكه', 'veg'], ['الحلويات', 'sweet'], ['العطرية', 'spice'], ['الحوت', null], ['كرا الماتريال', null], ['المازوط', null]]
export function ExpenseSheet({ close, weddingId = '' }) {
  const s = useStore()
  const [f, setF] = useState({ label: '', amount: '', wedding_id: weddingId })
  const [other, setOther] = useState(false)
  let soon = s.weddings.filter((w) => w.status !== 'cancelled').sort((a, b) => Math.abs(new Date(a.day) - Date.now()) - Math.abs(new Date(b.day) - Date.now())).slice(0, 3)
  const preset = weddingId && s.weddings.find((w) => w.id === weddingId)
  if (preset && !soon.some((w) => w.id === weddingId)) soon = [preset, ...soon.slice(0, 2)]
  const save = async () => {
    try { await add('expenses', { label: f.label.trim(), amount: +f.amount, wedding_id: f.wedding_id || null, spent_on: dayKey(new Date()) }); toast(`تسجّل \u2066${money(+f.amount)} DH\u2069`); close() } catch (e) { fail(e) }
  }
  return (
    <Sheet title="مصروف جديد" onClose={close}>
      <div className="amtbox" style={{ backgroundImage: `url(${PHOTOS.prep})` }}>
        <small>{f.label || 'شحال؟'}</small>
        <span className={'num' + (+f.amount ? '' : ' zero')} dir="ltr">{money(+f.amount || 0)}<small> DH</small></span>
      </div>
      <div className="cats">
        {QUICK.map(([q, k]) => <button key={q} className={'cat' + (f.label === q ? ' on' : '')} onClick={() => { setOther(false); setF({ ...f, label: q }) }}><Thumb size={74} radius={22} style={cropStyle(k)} icon={Ic.cart(26)} />{q.replace(' والفواكه', '').replace('كرا ', '')}</button>)}
        <button className={'cat' + (other ? ' on' : '')} onClick={() => { setOther(true); setF({ ...f, label: '' }) }}><Thumb size={74} radius={22} icon={Ic.pen(24)} />شي حاجة أخرى</button>
      </div>
      {other && <input className="lbl-in" autoFocus value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="شنو؟" />}
      <Numpad value={f.amount} onChange={(v) => setF({ ...f, amount: v })} />
      {soon.length > 0 && <>
        <span className="lab">ديال شي عرس؟ (ماشي ضروري)</span>
        <div className="wpick">{soon.map((w) => (
          <button key={w.id} className={f.wedding_id === w.id ? 'on' : ''} onClick={() => setF({ ...f, wedding_id: f.wedding_id === w.id ? '' : w.id })}>
            <Thumb size={38} radius={12} style={{ backgroundImage: `url(${photoFor(w.id)})` }} />
            <span className="mid"><b>{w.family}</b><span className="meta">{dayLabel(w.day)}</span></span>
            <span className="rad">{f.wedding_id === w.id && Ic.check(13)}</span>
          </button>
        ))}</div>
      </>}
      <button className="btn brass wide" disabled={!f.label.trim() || !+f.amount} onClick={save}>سجّل {+f.amount > 0 && <span className="num" dir="ltr">{money(+f.amount)} DH</span>}</button>
    </Sheet>
  )
}
