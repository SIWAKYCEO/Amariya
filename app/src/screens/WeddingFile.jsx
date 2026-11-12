import { useState } from 'react'
import { add, extrasSum, paidOf, problemsOf, readinessOf, remove, shoppingOf, teamOf, totalOf, update, useStore } from '../lib/data'
import { ROLES, ROLES_PL, dayKey, dayLabel, money, openExternal, photoFor, prettyPhone, relDay, telLink, waLink } from '../lib/util'
import { Count, DH, Field, Ic, Ring, Sheet, fail, shareText, toast } from '../ui'
import { WeddingChips } from './Weddings'

function devisText(w, traiteur) {
  const lines = [
    `السلام عليكم ${w.family} 🌿`,
    `هادا الدوفي ديال العرس من ${traiteur?.name || 'التريتور'}:`,
    `📅 ${dayLabel(w.day)} مع ${w.time}${w.hall ? ' · ' + w.hall : ''}`,
    `👥 ${w.guests} ضيف · ${w.package_name || 'المينو'} (${money(w.price)} DH للضيف) = ${money(w.guests * w.price)} DH`,
    ...(w.extras || []).map((e) => `➕ ${e.label}: ${money(e.amount)} DH`),
    `💰 المجموع: ${money(totalOf(w))} DH`,
  ]
  return lines.join('\n')
}
const remindText = (w, rest, tr) => `السلام عليكم ${w.family} 🌿\nكنفكّروكم بلي باقي ${money(rest)} DH ديال العرس نهار ${dayLabel(w.day)}.\nالله يكمّل بالخير، ${tr?.name || 'التريتور'}`
const receiptText = (w, p, paidSoFar, total, tr) => [`🧾 وصل · ${tr?.name || 'التريتور'}`, `العائلة: ${w.family}`, `العرس: ${dayLabel(w.day)}`, `${p.kind === 'arboun' ? 'العربون' : 'خلاص'}: ${money(p.amount)} DH · ${dayLabel(p.paid_on, false)}`, `تخلّص حتى لدابا: ${money(paidSoFar)} DH`, `الباقي: ${money(Math.max(0, total - paidSoFar))} DH`, 'شكرا على الثقة 🙏'].join('\n')
const teamText = (w, rows) => [`📣 عرس ${w.family}`, `📅 ${dayLabel(w.day)} · ${w.time}`, `📍 ${[w.hall, w.city].filter(Boolean).join('، ')}`, `👥 ${w.guests} ضيف`, '', 'الخدامة:', ...rows.filter((a) => a.status !== 'no').map((a) => `• ${a.person.name} (${ROLES[a.person.role]})`), '', 'كونو تما قبل الوقت بساعة 🙏'].join('\n')
const askText = (p, w) => `السلام ${p.name}، عندنا عرس نهار ${dayLabel(w.day)} مع ${w.time}${w.hall ? ' ف' + w.hall : ''}${w.city ? ' (' + w.city + ')' : ''}. واش معانا؟`

const TICK = {
  asked: [<span key="a" className="tk1">{Ic.check(15)}</span>, 'تسول'],
  ok: [<span key="o" className="tk2">{Ic.ticks(17)}</span>, 'جاي'],
  no: [<span key="n" className="tk3">{Ic.x(14)}</span>, 'ما جايش'],
}
const NEXT = { asked: 'ok', ok: 'no', no: 'asked' }

export default function WeddingFile({ w, back, go }) {
  const s = useStore()
  const [sheet, setSheet] = useState(null)
  const [amount, setAmount] = useState('')
  const total = totalOf(w), paid = paidOf(w, s.payments), rest = Math.max(0, total - paid)
  const pays = s.payments.filter((p) => p.wedding_id === w.id).sort((a, b) => a.paid_on.localeCompare(b.paid_on))
  const team = teamOf(w, s)
  const probs = problemsOf(w, s)
  const pkg = s.packages.find((p) => p.id === w.package_id)
  const ready = readinessOf(w, s)
  const shop = shoppingOf(w, s)
  const byRole = Object.keys(ROLES).map((r) => [r, team.rows.filter((a) => a.person.role === r)]).filter(([, l]) => l.length)

  async function addPay() {
    const a = +amount
    if (!a) return
    try {
      await add('payments', { wedding_id: w.id, amount: a, kind: paid ? 'payment' : 'arboun', paid_on: dayKey(new Date()) })
      if (w.status === 'devis') await update('weddings', w.id, { status: 'confirmed' })
      setAmount(''); setSheet(null); toast(`تسجّل \u2066${money(a)} DH\u2069`)
    } catch (e) { fail(e) }
  }
  async function toggleStaff(p) {
    const ex = s.assignments.find((a) => a.wedding_id === w.id && a.staff_id === p.id)
    try {
      if (ex) await remove('assignments', ex.id)
      else await add('assignments', { wedding_id: w.id, staff_id: p.id, status: 'asked', pay: p.rate || 0 })
    } catch (e) { fail(e) }
  }
  const setStatus = (st) => update('weddings', w.id, { status: st }).then(() => { toast(st === 'done' ? 'العرس داز، مبروك' : st === 'cancelled' ? 'العرس تلغى' : 'تبدّل'); setSheet(null) }).catch(fail)

  return (
    <div className="screen file">
      <section className="fhero">
        <div className="bgphoto sharp" style={{ backgroundImage: `url(${photoFor(w.id)})` }} />
        <div className="shade" />
        <div className="fh-top">
          <button className="round glass" onClick={back} aria-label="رجوع">{Ic.back()}</button>
          <span className="pill glass">{w.status === 'devis' ? 'دوفي' : w.status === 'done' ? 'داز' : w.status === 'cancelled' ? 'ملغي' : relDay(w.day)}</span>
          <button className="round glass" onClick={() => setSheet('more')} aria-label="المزيد">{Ic.pen()}</button>
        </div>
        <div className="fh-in">
          <h1>{w.family}</h1>
          <p className="meta">{dayLabel(w.day)} · <span dir="ltr">{w.time}</span>{w.hall ? ' · ' + w.hall : ''}{w.city ? (w.hall ? '، ' : ' · ') + w.city : ''}</p>
          <WeddingChips w={w} s={s} />
        </div>
      </section>

      <div className="content">
        {probs.length > 0 && (
          <div className="alert">
            {probs.includes('noArboun') && <p>ما خلّصوش العربون. سجّلو ملّي يخلّصو.</p>}
            {probs.includes('serveurs') && <p>خاصك <b>{team.need - team.serveursOk}</b> سرباي باش تكمّل ({team.serveursOk}/{team.need}).</p>}
            {probs.includes('refused') && <p>شي واحد قال ما جايش. قلب على واحد آخر.</p>}
          </div>
        )}

        {w.status !== 'cancelled' && (
          <div className="card ready">
            <Ring done={ready.done} total={ready.total} size={58} />
            <div className="rd-l">
              <b>{ready.done === ready.total ? 'كلشي واجد ليهاد العرس' : 'واش العرس واجد؟'}</b>
              <div className="rd-i">{ready.items.map(([l, ok]) => <span key={l} className={ok ? 'y' : 'n'}>{ok ? Ic.check(12) : Ic.x(11)} {l}</span>)}</div>
            </div>
          </div>
        )}

        <div className="card money">
          <div className="m3">
            <div><small>المجموع</small><DH v={total} /></div>
            <div><small>تخلّص</small><Count v={paid} /></div>
            <div className={rest > 0 ? 'hot' : 'good'}><small>الباقي</small><Count v={rest} /></div>
          </div>
          <div className="bar"><i style={{ width: Math.min(100, (paid / (total || 1)) * 100) + '%' }} /></div>
          {pays.length > 0 && <ul className="pays">{pays.map((p, i) => {
            const soFar = pays.slice(0, i + 1).reduce((a, x) => a + +x.amount, 0)
            return <li key={p.id}><span>{p.kind === 'arboun' ? 'العربون' : 'خلاص'} · {dayLabel(p.paid_on, false)}</span><span className="pr-r"><DH v={p.amount} /><button className="rcpt" onClick={() => shareText(receiptText(w, p, soFar, total, s.traiteur), w.phone ? waLink(w.phone, receiptText(w, p, soFar, total, s.traiteur)) : null)} aria-label="صيفط الوصل">{Ic.receipt(15)}</button></span></li>
          })}</ul>}
          <div className="btnrow">
            <button className="btn green" onClick={() => setSheet('pay')}>{Ic.plus(18)} {paid ? 'زيد خلاص' : 'سجّل العربون'}</button>
            {w.phone && <button className="btn ghost" onClick={() => openExternal(waLink(w.phone, devisText(w, s.traiteur)))}>{Ic.wa(17)} صيفط الدوفي</button>}
          </div>
          {rest > 0 && paid > 0 && w.phone && <button className="linkrow" onClick={() => openExternal(waLink(w.phone, remindText(w, rest, s.traiteur)))}>{Ic.bell(16)} فكّرهم بالباقي (<DH v={rest} />) فالواتساب</button>}
        </div>

        <div className="card">
          <div className="ch"><h3>الخدامة ديال الليلة</h3><button className="mini" onClick={() => setSheet('staff')}>{Ic.plus(16)} زيد</button></div>
          {team.rows.length === 0 && <p className="muted">باقي ما زدتي حتى واحد. زيد السرباية والنكافة والكوزينة.</p>}
          {byRole.map(([r, list]) => (
            <div key={r} className="grp">
              <span className="gl">{ROLES_PL[r]} <b dir="ltr">{list.filter((a) => a.status === 'ok').length}/{r === 'serveur' ? team.need : list.length}</b></span>
              {list.map((a) => (
                <div key={a.id} className={'srow ' + a.status}>
                  <button className="st" onClick={() => update('assignments', a.id, { status: NEXT[a.status] }).catch(fail)} aria-label={'بدّل: ' + TICK[a.status][1]}>
                    {TICK[a.status][0]}<span className="nm">{a.person.name}</span><small>{TICK[a.status][1]}</small>
                  </button>
                  {a.person.phone && <button className="round sm wa" onClick={() => openExternal(waLink(a.person.phone, askText(a.person, w)))} aria-label="واتساب">{Ic.wa(16)}</button>}
                </div>
              ))}
            </div>
          ))}
          {team.rows.length > 0 && <p className="hint">كليكي على السمية باش تبدّل: تسول ← جاي ← ما جايش</p>}
          {team.rows.length > 0 && <button className="linkrow" onClick={() => shareText(teamText(w, team.rows))}>{Ic.share(16)} صيفط البرنامج للخدامة كاملين</button>}
        </div>

        {shop.length > 0 && w.status !== 'cancelled' && (
          <div className="card">
            <div className="ch"><h3>{Ic.cart(17)} لائحة الشرا</h3><span className="muted">تقدير · <span dir="ltr">{w.guests}</span> ضيف</span></div>
            <ul className="shop">{shop.map((x) => <li key={x.label}><span>{x.label}</span><b><span dir="ltr">{money(x.qty)}</span> {x.unit}</b></li>)}</ul>
            <button className="linkrow" onClick={() => shareText([`🛒 لائحة الشرا · عرس ${w.family} (${w.guests} ضيف)`, ...shop.map((x) => `• ${x.label}: ${money(x.qty)} ${x.unit}`)].join('\n'))}>{Ic.share(16)} صيفطها للمول ديال السلعة</button>
          </div>
        )}

        <div className="card">
          <div className="ch"><h3>المينو · {w.package_name}</h3><span className="muted"><span dir="ltr">{w.guests}</span> ضيف</span></div>
          <ul className="menu">{(pkg?.items || []).map((it) => <li key={it}>{it}</li>)}</ul>
          {(w.extras || []).length > 0 && <ul className="extras">{w.extras.map((e, i) => <li key={i}><span>{e.label}</span><DH v={e.amount} /></li>)}{w.extras.length > 1 && <li className="t"><span>الزيادات</span><DH v={extrasSum(w)} /></li>}</ul>}
        </div>

        {w.notes && <div className="card note"><h3>ملاحظات</h3><p>{w.notes}</p></div>}

        <div className="card contact">
          <div><b>{w.family}</b><span dir="ltr">{prettyPhone(w.phone)}</span></div>
          {w.phone && <div className="btnrow tight">
            <button className="round" onClick={() => openExternal(telLink(w.phone))} aria-label="عيّط">{Ic.phone()}</button>
            <button className="round wa" onClick={() => openExternal(waLink(w.phone, `السلام عليكم ${w.family}`))} aria-label="واتساب">{Ic.wa()}</button>
          </div>}
        </div>
      </div>

      {sheet === 'pay' && (
        <Sheet title={paid ? 'زيد خلاص' : 'سجّل العربون'} onClose={() => setSheet(null)}>
          <Field label="شحال خلّصو؟" hint={rest ? `الباقي: ${money(rest)} DH` : ''}>
            <input autoFocus inputMode="numeric" dir="ltr" className="big" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0" />
          </Field>
          {rest > 0 && <div className="quick">{[rest, Math.round(rest / 2)].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((v) => <button key={v} className="qchip" onClick={() => setAmount(String(v))}>{money(v)} DH</button>)}</div>}
          <button className="btn brass wide" disabled={!+amount} onClick={addPay}>سجّل</button>
        </Sheet>
      )}

      {sheet === 'staff' && (
        <Sheet title="شكون غادي يخدم؟" onClose={() => setSheet(null)}>
          {s.staff.length === 0 && <p className="muted">باقي ما زدتي حتى خدام. زيدهم من «الخدامة».</p>}
          {Object.keys(ROLES).map((r) => {
            const list = s.staff.filter((p) => p.role === r && p.active !== false)
            if (!list.length) return null
            return (
              <div key={r} className="pick">
                <span className="gl">{ROLES_PL[r]}</span>
                {list.map((p) => {
                  const on = s.assignments.some((a) => a.wedding_id === w.id && a.staff_id === p.id)
                  return <button key={p.id} className={'prow' + (on ? ' on' : '')} onClick={() => toggleStaff(p)}><span className="box">{on && Ic.check(13)}</span>{p.name}</button>
                })}
              </div>
            )
          })}
          <button className="btn brass wide" onClick={() => setSheet(null)}>صافي</button>
        </Sheet>
      )}

      {sheet === 'more' && (
        <Sheet title={w.family} onClose={() => setSheet(null)}>
          <div className="menulist">
            <button onClick={() => { setSheet(null); go('edit', { id: w.id }) }}>{Ic.pen()} بدّل المعلومات والضياف</button>
            {w.status !== 'done' && <button onClick={() => setStatus('done')}>{Ic.check(18)} العرس داز</button>}
            {w.status !== 'cancelled' ? <button className="danger" onClick={() => setStatus('cancelled')}>{Ic.x()} لغي العرس</button>
              : <button onClick={() => setStatus('confirmed')}>{Ic.check(18)} رجّع العرس</button>}
            {w.status === 'cancelled' && <button className="danger" onClick={() => { if (confirm('تمسح هاد العرس نهائيا؟')) { remove('weddings', w.id).then(back).catch(fail) } }}>{Ic.trash()} مسح نهائيا</button>}
          </div>
        </Sheet>
      )}
    </div>
  )
}
