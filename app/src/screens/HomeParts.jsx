// Home blocks shared by the phone and the PC: the next wedding, what to do today, the month in numbers.
import { owedOf, paidOf, problemsOf, readinessOf, teamBar, totalOf, useStore, devisLink } from '../lib/data'
import { usesGuests } from '../lib/trades'
import { DAYS, MONTHS, PHOTOS, dayKey, daysFromToday, fromKey, money, openExternal, photoFor, todayKey, waLink } from '../lib/util'
import { DH, Ic } from '../ui'

export const until = (w) => {
  const n = daysFromToday(w.day)
  if (n > 1) return `بعد ${n} أيام`
  if (n === 1) return 'غدا'
  const [h, m] = (w.time || '20:00').split(':').map(Number), t = new Date(); t.setHours(h, m || 0, 0, 0)
  const mins = Math.round((t - Date.now()) / 60000)
  return mins > 60 ? `بعد ${Math.floor(mins / 60)} ساعات` : mins > 0 ? `بعد ${mins} دقيقة` : 'دابا'
}

const remind = (w, rest, s) => openExternal(waLink(w.phone, `السلام عليكم ${w.family} 🌿\nكنفكّروكم بلي باقي ${money(rest)} DH ديال العرس.\n${s.traiteur?.name || ''}`))

// the next wedding: photo in an arch, what is ready, what is missing, how much is paid
export function NextCard({ w, s, go, label }) {
  const d = fromKey(w.day)
  const total = totalOf(w), paid = paidOf(w, s.payments), rest = Math.max(0, total - paid)
  const r = readinessOf(w, s)
  const pct = Math.min(100, (paid / (total || 1)) * 100)
  const open = () => go('wedding', { id: w.id })
  return (
    <section className="hn-card" role="button" tabIndex={0} onClick={open}>
      <div className="hn-ph" style={{ backgroundImage: `url(${photoFor(w.id)})` }}>
        <span className="hn-date"><b dir="ltr">{d.getDate()}</b><small>{MONTHS[d.getMonth()]} · {DAYS[d.getDay()]}</small></span>
      </div>
      <div className="hn-in">
        <span className="hn-lbl">{label || 'العرس الجاي'} · {until(w)}</span>
        <h3>{w.family}</h3>
        <div className="hn-meta">
          <span>{Ic.clock(15)} {DAYS[d.getDay()]} {d.getDate()} {MONTHS[d.getMonth()]} · <bdi dir="ltr">{w.time}</bdi></span>
          {(w.hall || w.city) && <span>{Ic.pin(15)} {[w.hall, w.city].filter(Boolean).join('، ')}</span>}
          {usesGuests() && +w.guests > 0 ? <span>{Ic.guests(15)} <bdi dir="ltr">{w.guests}</bdi> ضيف</span> : w.package_name ? <span>{Ic.box(15)} {w.package_name}</span> : null}
        </div>
        <div className="hn-chk">
          {r.items.map(([t, ok]) => (
            <div key={t} className={'hn-ci' + (ok ? '' : ' bad')}>
              <i>{ok ? Ic.check(12) : '!'}</i><span>{t === 'السرباية' && !ok ? <>السرباية <bdi dir="ltr">{teamBar(w, s).ok}/{teamBar(w, s).need}</bdi></> : t}</span>
              {!ok && <b>زيد</b>}
            </div>
          ))}
        </div>
        <div className="hn-pay">
          <div className="hn-row"><span>خلّصو <b><DH v={paid} unit={false} /></b> من <DH v={total} /></span>{rest > 0 ? <span>باقي <b className="hot"><DH v={rest} unit={false} /></b></span> : <span className="ok">{Ic.check(13)} خالص كامل</span>}</div>
          <div className="hn-bar"><i style={{ width: pct + '%' }} /></div>
          {rest > 0 && w.phone && <button className="hn-btn" onClick={(e) => { e.stopPropagation(); remind(w, rest, s) }}>{Ic.wa(16)} صيفط تذكير للعائلة</button>}
        </div>
      </div>
    </section>
  )
}

// up to four things to do today, each with its own button
export function TodoCard({ s, go }) {
  const t = []
  const live = s.weddings.filter((w) => w.status !== 'cancelled' && w.status !== 'done' && w.status !== 'devis' && daysFromToday(w.day) >= 0).sort((a, b) => a.day.localeCompare(b.day))
  const noArb = live.find((w) => paidOf(w, s.payments) <= 0)
  if (noArb) {
    const d = fromKey(noArb.day)
    const link = devisLink(noArb)
    t.push({ k: 'arb', ic: Ic.cash(18), title: `${noArb.family} ما خلّصوش العربون`, sub: `العرس ${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}، والنهار ماشي محجوز`, btn: noArb.phone ? 'صيفط تذكير' : 'شوف العرس', on: () => noArb.phone ? openExternal(waLink(noArb.phone, `السلام عليكم ${noArb.family} 🌿\nباش نحجزو ليكم النهار، خاص العربون.${link ? '\n' + link : ''}\n${s.traiteur?.name || ''}`)) : go('wedding', { id: noArb.id }) })
  }
  const short = live.filter((w) => daysFromToday(w.day) <= 10 && problemsOf(w, s).some((p) => p === 'serveurs' || p === 'team' || p === 'refused'))[0]
  if (short) {
    const b = teamBar(short, s)
    t.push({ k: 'team', ic: Ic.team(18), cls: 'r', title: b.need > b.ok ? `ناقصين ${b.need - b.ok} ف${b.label === 'السرباية' ? ' السرباية' : ' الفريق'} ديال ${short.family}` : `الفريق ديال ${short.family} باقي ما تأكّد`, sub: `العرس ${until(short)}`, btn: 'زيد', on: () => go('wedding', { id: short.id }) })
  }
  const owed = owedOf(s)
  if (owed.length) {
    const sum = owed.reduce((a, o) => a + o.total, 0)
    t.push({ k: 'staff', ic: Ic.team(18), cls: 'g', title: `خلّص ${owed.length} من الخدامة`, sub: `المجموع ${money(sum)} درهم`, btn: 'شوف الخلاص', on: () => go('staff') })
  }
  return (
    <section className="hd-card">
      <div className="hd-h"><h2>خاصك تدير اليوم</h2>{t.length > 0 && <span className="hd-n"><bdi dir="ltr">{t.length}</bdi> {t.length === 1 ? 'حاجة' : 'حوايج'}</span>}</div>
      {t.length === 0
        ? <div className="hd-ok"><i>{Ic.check(18)}</i><span><b>كلشي مزيان اليوم</b><small>ما كاين حتى حاجة خاصها تتحل دابا</small></span></div>
        : t.slice(0, 4).map((x) => (
          <div key={x.k} className="hd-it">
            <span className={'hd-ic ' + (x.cls || '')}>{x.ic}</span>
            <span className="hd-tx"><b>{x.title}</b><small>{x.sub}</small><button className={'hd-btn' + (x.main ? ' main' : '')} onClick={x.on}>{x.btn}</button></span>
          </div>
        ))}
    </section>
  )
}

// the month in four numbers
export function monthOf(s) {
  const now = new Date(), mk = dayKey(now).slice(0, 7), today = todayKey()
  const live = s.weddings.filter((w) => w.status !== 'cancelled')
  const monthW = live.filter((w) => w.day.startsWith(mk))
  const upcoming = live.filter((w) => daysFromToday(w.day) >= 0)
  const income = s.payments.filter((p) => p.paid_on?.startsWith(mk)).reduce((a, p) => a + +p.amount, 0)
  const staffCost = s.assignments.filter((a) => a.status === 'ok').reduce((sum, a) => {
    const w = s.weddings.find((x) => x.id === a.wedding_id)
    return w && w.status !== 'cancelled' && w.day.startsWith(mk) && w.day <= today ? sum + (+a.pay || 0) : sum
  }, 0)
  const spent = s.expenses.filter((e) => e.spent_on?.startsWith(mk)).reduce((a, e) => a + +e.amount, 0) + staffCost
  const owed = live.filter((w) => w.status !== 'devis').map((w) => ({ w, rest: Math.max(0, totalOf(w) - paidOf(w, s.payments)), paid: paidOf(w, s.payments) })).filter((x) => x.rest > 0)
  return { now, monthW, upcoming, income, spent, net: income - spent, owed, owedTotal: owed.reduce((a, x) => a + x.rest, 0), noArboun: owed.filter((x) => x.paid <= 0 && daysFromToday(x.w.day) >= 0).length }
}

export function Stats({ s, go }) {
  const m = monthOf(s)
  return (
    <section className="hs">
      <button className="hs-t" onClick={() => go('calendar')}><small>عراسات {MONTHS[m.now.getMonth()]}</small><b className="num" dir="ltr">{m.monthW.length}</b><span><bdi dir="ltr">{m.upcoming.length}</bdi> جايين فالمجموع</span></button>
      <button className="hs-t" onClick={() => go('money')}><small>الفلوس اللي دخلات</small><b><DH v={m.income} /></b><span>المصاريف: <DH v={m.spent} /></span></button>
      <button className="hs-t g" onClick={() => go('money')}><small>الربح الصافي ديال الشهر</small><b><DH v={m.net} /></b><span>من بعد المصاريف والخدامة</span></button>
      <button className="hs-t y" onClick={() => go('money')}><small>باقي عند الناس</small><b className={m.owedTotal > 0 ? 'hot' : ''}><DH v={m.owedTotal} /></b><span>{m.noArboun ? `${m.noArboun} ما عطاوش العربون` : 'كلشي عطا العربون'}</span></button>
    </section>
  )
}

// the first wedding to show on the home: today first, then the next one
export function nextWedding(s) {
  const live = s.weddings.filter((w) => w.status !== 'cancelled' && w.status !== 'done' && daysFromToday(w.day) >= 0).sort((a, b) => (a.day + a.time).localeCompare(b.day + b.time))
  return live[0] || null
}

// no wedding coming: a big, clear card to add the next one
export function AddCard({ go }) {
  return (
    <section className="hn-card hn-add" role="button" tabIndex={0} onClick={() => go('new')}>
      <div className="hn-ph" style={{ backgroundImage: `url(${PHOTOS.hall})` }} />
      <div className="hn-in">
        <span className="hn-lbl">العرس الجاي</span>
        <h3>ما عندك حتى عرس جاي</h3>
        <p className="hn-p">زيد العرس الجاي ديالك: غير السمية، النهار وعدد الضياف. التطبيق كيحسب ليك الدوفي، العربون والفريق بوحدو.</p>
        <button className="hn-big" onClick={(e) => { e.stopPropagation(); go('new') }}>{Ic.plus(20)} زيد عرس جديد</button>
      </div>
    </section>
  )
}
