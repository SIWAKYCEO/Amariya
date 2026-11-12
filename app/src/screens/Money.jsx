import { useState } from 'react'
import { add, remove, restOf, useStore } from '../lib/data'
import { MONTHS, dayKey, dayLabel, money } from '../lib/util'
import { DH, Empty, Fab, Field, Ic, Sheet, TopBar, fail, toast } from '../ui'

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
  const shift = (n) => { const d = new Date(ym[0], ym[1] + n, 1); setYm([d.getFullYear(), d.getMonth()]) }

  return (
    <div className="screen">
      <TopBar title="الفلوس" />
      <div className="content pt">
        <div className="month">
          <button className="round sm" onClick={() => shift(-1)} aria-label="الشهر اللي فات">{Ic.back(18)}</button>
          <b>{MONTHS[ym[1]]} <span dir="ltr">{ym[0]}</span></b>
          <button className="round sm flip" onClick={() => shift(1)} aria-label="الشهر الجاي">{Ic.back(18)}</button>
        </div>
        <div className="profit">
          <small>الصافي ديال هاد الشهر (دخل − خرج)</small>
          <div className={'pv' + (profit < 0 ? ' neg' : '')}><DH v={profit} /></div>
          <div className="pr"><span><i className="dot in" />دخل <DH v={income} /></span><span><i className="dot out" />خرج <DH v={spent} /></span></div>
        </div>

        <h4 className="sec dark">باقي ليك عند الناس <span className="sum"><DH v={owedTotal} /></span></h4>
        {owed.length === 0 ? <p className="muted">كلشي خالص.</p> : (
          <div className="list">{owed.map(({ w, rest }) => (
            <button key={w.id} className="crow" onClick={() => go('wedding', { id: w.id })}>
              <span className="mid"><b>{w.family}</b><span className="meta">{dayLabel(w.day)}</span></span>
              <span className="owe"><DH v={rest} /></span>
            </button>
          ))}</div>
        )}

        <h4 className="sec dark">المصاريف</h4>
        {staffCost > 0 && <div className="erow auto"><span className="mid"><b>الخدامة</b><span className="meta">محسوبة من العراسات</span></span><DH v={staffCost} /></div>}
        {exps.length === 0 && !staffCost && <Empty title="ما كاين حتى مصروف" sub="سجّل اللحم، الخضرة، الكرا… باش تعرف الربح الحقيقي." />}
        {exps.map((e) => (
          <div className="erow" key={e.id}>
            <span className="mid"><b>{e.label}</b><span className="meta">{dayLabel(e.spent_on, false)}{e.wedding_id ? ' · ' + (s.weddings.find((w) => w.id === e.wedding_id)?.family || '') : ''}</span></span>
            <DH v={e.amount} />
            <button className="round sm" onClick={() => remove('expenses', e.id).then(() => toast('تمسح')).catch(fail)} aria-label="مسح">{Ic.trash(15)}</button>
          </div>
        ))}
      </div>
      <Fab onClick={() => setSheet(true)}>مصروف</Fab>
      {sheet && <ExpenseSheet close={() => setSheet(false)} />}
    </div>
  )
}

const QUICK = ['اللحم', 'الدجاج', 'الحوت', 'الخضرة والفواكه', 'الحلويات', 'كرا الماتريال', 'المازوط']
function ExpenseSheet({ close }) {
  const s = useStore()
  const [f, setF] = useState({ label: '', amount: '', wedding_id: '' })
  const soon = s.weddings.filter((w) => w.status !== 'cancelled').sort((a, b) => Math.abs(new Date(a.day) - Date.now()) - Math.abs(new Date(b.day) - Date.now())).slice(0, 4)
  const save = async () => {
    try { await add('expenses', { label: f.label.trim(), amount: +f.amount, wedding_id: f.wedding_id || null, spent_on: dayKey(new Date()) }); toast(`تسجّل \u2066${money(+f.amount)} DH\u2069`); close() } catch (e) { fail(e) }
  }
  return (
    <Sheet title="مصروف جديد" onClose={close}>
      <div className="quick">{QUICK.map((q) => <button key={q} className={'qchip' + (f.label === q ? ' on' : '')} onClick={() => setF({ ...f, label: q })}>{q}</button>)}</div>
      <Field label="شنو؟"><input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></Field>
      <Field label="شحال؟ (DH)"><input inputMode="numeric" dir="ltr" className="big" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/\D/g, '') })} placeholder="0" /></Field>
      <span className="lab">ديال شي عرس؟ (ماشي ضروري)</span>
      <div className="quick">{soon.map((w) => <button key={w.id} className={'qchip' + (f.wedding_id === w.id ? ' on' : '')} onClick={() => setF({ ...f, wedding_id: f.wedding_id === w.id ? '' : w.id })}>{w.family}</button>)}</div>
      <button className="btn brass wide" disabled={!f.label.trim() || !+f.amount} onClick={save}>سجّل</button>
    </Sheet>
  )
}
