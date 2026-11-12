import { useState } from 'react'
import { add, extrasSum, update, useStore } from '../lib/data'
import { addDays, dayKey, dayLabel, normPhone, prettyPhone } from '../lib/util'
import { DH, Field, Ic, Stepper, TopBar, fail, toast } from '../ui'

const QUICK = ['نكافة', 'العمارية', 'ديكور', 'التصوير', 'الحلويات', 'الدقايقية']

export default function NewWedding({ back, done, edit, prefill }) {
  const s = useStore()
  const pk0 = s.packages[0]
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState(() => edit
    ? { ...edit, phone: prettyPhone(edit.phone), extras: edit.extras || [] }
    : { family: '', phone: '', day: dayKey(addDays(new Date(), 14)), time: '20:00', hall: '', city: s.traiteur?.city || '', guests: 200, package_id: pk0?.id || null, package_name: pk0?.name || '', price: pk0?.price || 0, extras: [], notes: '', ...prefill })
  const [arboun, setArboun] = useState('')
  const set = (p) => setF((x) => ({ ...x, ...p }))
  const clash = s.weddings.filter((w) => w.day === f.day && w.status !== 'cancelled' && w.id !== edit?.id)
  const total = Math.round((+f.guests || 0) * (+f.price || 0) + extrasSum(f))

  const ok0 = f.family.trim().length > 1 && f.day
  const ok1 = +f.guests > 0 && +f.price > 0

  async function save() {
    setBusy(true)
    const row = {
      family: f.family.trim(), phone: normPhone(f.phone), day: f.day, time: f.time, hall: f.hall.trim(), city: f.city.trim(),
      guests: +f.guests, package_id: f.package_id, package_name: f.package_name, price: +f.price,
      extras: f.extras.filter((e) => e.label && +e.amount > 0).map((e) => ({ label: e.label, amount: +e.amount })), notes: f.notes,
    }
    try {
      if (edit) { await update('weddings', edit.id, row); toast('تبدّل'); done(edit.id); return }
      const a = +arboun || 0
      const w = await add('weddings', { ...row, status: a > 0 ? 'confirmed' : 'devis' })
      if (a > 0) await add('payments', { wedding_id: w.id, amount: a, kind: 'arboun', paid_on: dayKey(new Date()) })
      toast(a > 0 ? 'العرس تسجّل والعربون معاه' : 'الدوفي تسجّل')
      done(w.id)
    } catch (e) { fail(e); setBusy(false) }
  }

  const steps = ['شكون؟', 'الضياف', edit ? 'راجع' : 'الدوفي']
  return (
    <div className="screen form">
      <TopBar title={edit ? 'بدّل العرس' : 'عرس جديد'} back={step ? () => setStep(step - 1) : back} />
      <div className="steps">{steps.map((t, i) => <span key={t} className={i === step ? 'on' : i < step ? 'done' : ''}><i>{i < step ? Ic.check(12) : i + 1}</i>{t}</span>)}</div>

      {step === 0 && (
        <div className="pane">
          <Field label="سمية العائلة"><input autoFocus value={f.family} onChange={(e) => set({ family: e.target.value })} placeholder="مثلا: عائلة بنعلي" /></Field>
          <Field label="التيليفون"><input inputMode="tel" dir="ltr" value={f.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="06 00 00 00 00" /></Field>
          <div className="two">
            <Field label="النهار"><input type="date" value={f.day} onChange={(e) => set({ day: e.target.value })} /></Field>
            <Field label="الساعة"><input type="time" value={f.time} onChange={(e) => set({ time: e.target.value })} /></Field>
          </div>
            {clash.length > 0 && <p className="clash">{Ic.cal(15)} عندك {clash.length === 1 ? 'عرس' : clash.length + ' عراسات'} هاد النهار: {clash.map((w) => w.family).join('، ')}</p>}
          <div className="two">
            <Field label="القاعة"><input value={f.hall} onChange={(e) => set({ hall: e.target.value })} placeholder="قاعة النخيل" /></Field>
            <Field label="المدينة"><input value={f.city} onChange={(e) => set({ city: e.target.value })} /></Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="pane">
          <div className="bigq"><span className="lab">عدد الضياف</span><Stepper value={f.guests} onChange={(v) => set({ guests: v })} /></div>
          <span className="lab">المينو</span>
          <div className="pkgs">
            {s.packages.map((p) => (
              <button key={p.id} className={'pkg' + (f.package_id === p.id ? ' on' : '')} onClick={() => set({ package_id: p.id, package_name: p.name, price: p.price })}>
                <span className="pn">{p.name}</span>
                <span className="pp"><DH v={p.price} /><small> / للضيف</small></span>
                <span className="pi">{(p.items || []).slice(0, 4).join(' · ')}</span>
                {f.package_id === p.id && <span className="tick">{Ic.check(13)}</span>}
              </button>
            ))}
          </div>
          <Field label="الثمن ديال الضيف (تقدر تبدلو)"><input inputMode="numeric" dir="ltr" value={f.price} onChange={(e) => set({ price: e.target.value.replace(/[^\d.]/g, '') })} /></Field>
          <span className="lab">زيادات</span>
          <div className="quick">
            {QUICK.filter((q) => !f.extras.some((e) => e.label === q)).map((q) => <button key={q} className="qchip" onClick={() => set({ extras: [...f.extras, { label: q, amount: '' }] })}>+ {q}</button>)}
            <button className="qchip" onClick={() => set({ extras: [...f.extras, { label: '', amount: '' }] })}>+ حاجة أخرى</button>
          </div>
          {f.extras.map((e, i) => (
            <div className="extra" key={i}>
              <input value={e.label} placeholder="شنو؟" onChange={(ev) => set({ extras: f.extras.map((x, j) => j === i ? { ...x, label: ev.target.value } : x) })} />
              <input inputMode="numeric" dir="ltr" value={e.amount} placeholder="DH" onChange={(ev) => set({ extras: f.extras.map((x, j) => j === i ? { ...x, amount: ev.target.value.replace(/\D/g, '') } : x) })} />
              <button className="round sm" onClick={() => set({ extras: f.extras.filter((_, j) => j !== i) })} aria-label="حيّد">{Ic.x(15)}</button>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="pane">
          <div className="devis">
            <div className="dv-h"><b>{f.family}</b><span>{dayLabel(f.day)} · <span dir="ltr">{f.time}</span>{f.hall ? ' · ' + f.hall : ''}</span></div>
            <div className="dv-r"><span>{f.package_name || 'المينو'} · <span dir="ltr">{f.guests} × {f.price}</span></span><DH v={(+f.guests || 0) * (+f.price || 0)} /></div>
            {f.extras.filter((e) => e.label && +e.amount > 0).map((e, i) => <div className="dv-r" key={i}><span>{e.label}</span><DH v={+e.amount} /></div>)}
            <div className="dv-t"><span>المجموع</span><DH v={total} /></div>
          </div>
          {!edit && (
            <Field label="العربون اللي خلّصو دابا (إلا كاين)" hint="إلا ما خلّصو والو، خليه خاوي: يتسجّل كدوفي.">
              <input inputMode="numeric" dir="ltr" value={arboun} onChange={(e) => setArboun(e.target.value.replace(/\D/g, ''))} placeholder="0" />
            </Field>
          )}
          <Field label="ملاحظات"><textarea rows={3} value={f.notes || ''} onChange={(e) => set({ notes: e.target.value })} placeholder="شي حاجة خاصك تعقل عليها" /></Field>
        </div>
      )}

      <div className="actionbar">
        {step < 2
          ? <button className="btn brass wide" disabled={step === 0 ? !ok0 : !ok1} onClick={() => setStep(step + 1)}>كمّل</button>
          : <button className="btn brass wide" disabled={busy} onClick={save}>{edit ? 'سجّل التبديلات' : 'سجّل العرس'} · <DH v={total} /></button>}
      </div>
    </div>
  )
}
