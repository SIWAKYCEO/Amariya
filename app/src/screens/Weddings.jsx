import { useState } from 'react'
import { paidOf, problemsOf, teamOf, totalOf, useStore } from '../lib/data'
import { DAYS, addDays, dayKey, daysFromToday, fromKey, greeting, photoFor, todayKey, MONTHS } from '../lib/util'
import { DH, Empty, Fab, Ic, Logo } from '../ui'

const PROBLEM = { noArboun: 'ما خلّصوش العربون', serveurs: 'خاصك السرباية', refused: 'شي حد قال لا' }

export function WeddingChips({ w, s }) {
  const t = teamOf(w, s)
  const probs = problemsOf(w, s)
  const short = t.serveursOk < t.need
  return (
    <div className="chips">
      <span className="chip">{Ic.guests(13)} <b dir="ltr">{w.guests}</b> ضيف</span>
      {w.status !== 'done' && <span className={'chip' + (short ? ' hot' : ' ok')}>{Ic.team(13)} السرباية <b dir="ltr">{t.serveursOk}/{t.need}</b></span>}
      {probs.includes('noArboun') ? <span className="chip hot">بلا عربون</span> : <span className="chip ok">{Ic.check(12)} العربون</span>}
    </div>
  )
}

function TodayCard({ w, s, go }) {
  const total = totalOf(w), paid = paidOf(w, s.payments)
  return (
    <button className="tcard" onClick={() => go('wedding', { id: w.id })}>
      <span className="ph" style={{ backgroundImage: `url(${photoFor(w.id)})` }} />
      <span className="grad" />
      <span className="body">
        <span className="row1">
          <span><b className="fam">{w.family}</b><span className="meta">{Ic.pin(13)} {w.hall}{w.city ? ' · ' + w.city : ''}</span></span>
          <span className="time" dir="ltr">{w.time}</span>
        </span>
        <WeddingChips w={w} s={s} />
        <span className="bar"><i style={{ width: Math.min(100, (paid / (total || 1)) * 100) + '%' }} /></span>
        <span className="row2"><span>تخلّص <DH v={paid} /></span><span>من <DH v={total} /></span></span>
      </span>
    </button>
  )
}

function Row({ w, s, go }) {
  const d = fromKey(w.day)
  const probs = problemsOf(w, s)
  return (
    <button className="wrow" onClick={() => go('wedding', { id: w.id })}>
      <span className="dbox"><small>{DAYS[d.getDay()]}</small><b>{d.getDate()}</b><small>{MONTHS[d.getMonth()]}</small></span>
      <span className="mid">
        <b>{w.family}</b>
        <span className="meta">{w.hall} · <span dir="ltr">{w.time}</span> · <span dir="ltr">{w.guests}</span> ضيف</span>
        {probs.length > 0 ? <span className="warn">{PROBLEM[probs[0]]}</span> : w.status === 'devis' ? <span className="soft">دوفي، باقي ما تأكدش</span> : <span className="good">{Ic.check(12)} كلشي واجد</span>}
      </span>
      <span className="amt"><DH v={totalOf(w)} unit={false} /><small>DH</small></span>
    </button>
  )
}

export default function Weddings({ go }) {
  const s = useStore()
  const [showPast, setShowPast] = useState(false)
  const today = todayKey()
  const live = s.weddings.filter((w) => w.status !== 'cancelled').sort((a, b) => (a.day + a.time).localeCompare(b.day + b.time))
  const todays = live.filter((w) => w.day === today)
  const week = live.filter((w) => { const n = daysFromToday(w.day); return n > 0 && n <= 7 })
  const later = live.filter((w) => daysFromToday(w.day) > 7)
  const past = live.filter((w) => daysFromToday(w.day) < 0).reverse()
  const problems = live.filter((w) => daysFromToday(w.day) >= 0 && daysFromToday(w.day) <= 7).reduce((n, w) => n + problemsOf(w, s).length, 0)
  const strip = Array.from({ length: 7 }, (_, i) => dayKey(addDays(new Date(), i)))
  const first = (s.me?.name || '').split(' ')[0]

  return (
    <div className="screen">
      <section className="hero">
        <div className="bgphoto" style={{ backgroundImage: `url(${photoFor('hall')})` }} />
        <div className="shade" />
        <div className="hero-in">
          <div className="hero-top">
            <Logo size={20} />
            <button className="round glass" onClick={() => go('settings')} aria-label="الإعدادات">{Ic.gear()}</button>
          </div>
          <h1>{greeting()}{first ? ' ' + first : ''}</h1>
          <p className="lead">
            {todays.length ? <>عندك <b dir="ltr">{todays.length}</b> {todays.length === 1 ? 'عرس' : 'عراسات'} اليوم</> : 'ما عندك حتى عرس اليوم'}
            {problems > 0 ? <> · <span className="hotx">{problems} {problems === 1 ? 'حاجة' : 'حوايج'} خاصها تتحل</span></> : ''}
          </p>
          <div className="strip">
            {strip.map((k) => {
              const n = live.filter((w) => w.day === k).length
              const d = fromKey(k)
              return (
                <div key={k} className={'sd' + (k === today ? ' on' : '')}>
                  <small>{k === today ? 'اليوم' : DAYS[d.getDay()]}</small><b dir="ltr">{d.getDate()}</b>
                  <span className="dots">{Array.from({ length: Math.min(n, 3) }, (_, i) => <i key={i} />)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="content">
        {todays.length > 0 && <><h4 className="sec">اليوم</h4>{todays.map((w) => <TodayCard key={w.id} w={w} s={s} go={go} />)}</>}
        {week.length > 0 && <><h4 className="sec">هاد السيمانة</h4><div className="list">{week.map((w) => <Row key={w.id} w={w} s={s} go={go} />)}</div></>}
        {later.length > 0 && <><h4 className="sec">من بعد</h4><div className="list">{later.map((w) => <Row key={w.id} w={w} s={s} go={go} />)}</div></>}
        {!todays.length && !week.length && !later.length && <Empty title="ما كاين حتى عرس جاي" sub="زيد أول عرس وغادي تلقاه هنا" />}
        {past.length > 0 && (
          <button className="linkbtn" onClick={() => setShowPast(!showPast)}>{showPast ? 'خبّي العراسات اللي فاتو' : `العراسات اللي فاتو (${past.length})`}</button>
        )}
        {showPast && <div className="list dim">{past.map((w) => <Row key={w.id} w={w} s={s} go={go} />)}</div>}
      </div>
      <Fab onClick={() => go('new')}>عرس جديد</Fab>
    </div>
  )
}
