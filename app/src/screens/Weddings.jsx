import { useEffect, useState } from 'react'
import { isSample, seedSample, paidOf, problemsOf, readinessOf, teamBar, teamOf, totalOf, useStore } from '../lib/data'
import { DAYS, PHOTOS, addDays, dayKey, daysFromToday, fromKey, greeting, photoFor, todayKey, MONTHS } from '../lib/util'
import { DH, Empty, Fab, Ic, Logo, Ring } from '../ui'
import { InstallNudge } from '../install'
import { Inbox, QuickReplies } from './Inbox'
import { AccountBar } from './Account'
import { AddCard, NextCard, Stats, TodoCard } from './HomeParts'

const PROBLEM = { noArboun: 'ما خلّصوش العربون', serveurs: 'خاصك السرباية', refused: 'شي حد قال لا', team: 'الفريق باقي ما تأكّد' }

export function WeddingChips({ w, s }) {
  const t = teamBar(w, s)
  const probs = problemsOf(w, s)
  return (
    <div className="chips">
      {+w.guests > 0 ? <span className="chip">{Ic.guests(13)} <b dir="ltr">{w.guests}</b> ضيف</span> : w.package_name ? <span className="chip">{Ic.box(13)} {w.package_name}</span> : null}
      {w.status !== 'done' && t.need > 0 && <span className={'chip' + (t.short ? ' hot' : ' ok')}>{Ic.team(13)} {t.label} <b dir="ltr">{t.ok}/{t.need}</b></span>}
      {probs.includes('noArboun') ? <span className="chip hot">بلا عربون</span> : <span className="chip ok">{Ic.check(12)} العربون</span>}
    </div>
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
        <span className="meta">{[w.hall, <span key="t" dir="ltr">{w.time}</span>, +w.guests > 0 ? <span key="g"><span dir="ltr">{w.guests}</span> ضيف</span> : w.package_name].filter(Boolean).reduce((a, x, i) => i ? [...a, ' · ', x] : [x], [])}</span>
        {probs.length > 0 ? <span className="warn">{PROBLEM[probs[0]]}</span> : w.status === 'devis' ? <span className="soft">دوفي، باقي ما تأكدش</span> : <span className="good">{Ic.check(12)} كلشي واجد</span>}
      </span>
      <span className="amt"><DH v={totalOf(w)} unit={false} /><small>DH</small></span>
    </button>
  )
}

export default function Weddings({ go }) {
  const s = useStore()
  const [showPast, setShowPast] = useState(false)
  const [qr, setQr] = useState(false)
  const today = todayKey()
  const live = s.weddings.filter((w) => w.status !== 'cancelled').sort((a, b) => (a.day + a.time).localeCompare(b.day + b.time))
  const todays = live.filter((w) => w.day === today)
  const week = live.filter((w) => { const n = daysFromToday(w.day); return n > 0 && n <= 7 })
  const later = live.filter((w) => daysFromToday(w.day) > 7)
  const past = live.filter((w) => daysFromToday(w.day) < 0).reverse()
  const problems = live.filter((w) => daysFromToday(w.day) >= 0 && daysFromToday(w.day) <= 7).reduce((n, w) => n + problemsOf(w, s).length, 0)
  const strip = Array.from({ length: 7 }, (_, i) => dayKey(addDays(new Date(), i)))
  const first = (s.me?.name || '').split(' ')[0]
  const sample = s.weddings.find(isSample)
  const realCount = s.weddings.filter((w) => !isSample(w)).length
  useEffect(() => { seedSample() }, [s.traiteur?.id, s.weddings.length])

  return (
    <div className="screen">
      <section className="hero h3">
        <div className="hero-in">
          <div className="hero-top">
            <Logo size={20} />
            <span className="hero-act">
              <button className="round glass" onClick={() => setQr(true)} aria-label="ردود جاهزين">{Ic.wa(19)}</button>
              <button className="round glass" onClick={() => go('calendar')} aria-label="الكالوندري">{Ic.cal()}</button>
              <button className="round glass" onClick={() => go('settings')} aria-label="الإعدادات">{Ic.gear()}</button>
            </span>
          </div>
          <h1>{greeting()}{first ? ' ' + first : ''}</h1>
          <p className="lead">
            {todays.length ? <>عندك <b dir="ltr">{todays.length}</b> {todays.length === 1 ? 'عرس' : 'عراسات'} اليوم</> : 'ما عندك حتى عرس اليوم'}
            {problems > 0 ? <> · <span className="hotx">{problems} {problems === 1 ? 'حاجة' : 'حوايج'} خاصها تتحل</span></> : ''}
          </p>
          <AccountBar go={go} />
          <div className="strip">
            {strip.map((k) => {
              const n = live.filter((w) => w.day === k).length
              const d = fromKey(k)
              return (
                <div key={k} className={'sd' + (k === today ? ' on' : '')} onClick={() => go('calendar', { day: k })}>
                  <small>{k === today ? 'اليوم' : DAYS[d.getDay()]}</small><b dir="ltr">{d.getDate()}</b>
                  <span className="dots">{Array.from({ length: Math.min(n, 3) }, (_, i) => <i key={i} />)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="content">
        {realCount === 0 && (
          <div className="startx">
            <h4 className="sec">بدا من هنا</h4>
            {sample && <button className="stc" onClick={() => go('wedding', { id: sample.id })}><i>1</i><span><b>شوف العرس التجريبي</b><small>الربح، العربون، الدوفي بالـPDF… كلشي واجد</small></span>{Ic.back(16)}</button>}
            <button className="stc" onClick={() => go('new')}><i>{sample ? 2 : 1}</i><span><b>زيد أول عرس ديالك</b><small>غير السمية، النهار وعدد الضياف</small></span>{Ic.back(16)}</button>
            <button className="stc" onClick={() => setQr(true)}><i>{sample ? 3 : 2}</i><span><b>جرّب الردود ديال الواتساب</b><small>جاوب الكليان فثانية بالثمن والنهارات الخاوين</small></span>{Ic.back(16)}</button>
          </div>
        )}
        {todays.length > 0 && todays.map((w) => <NextCard key={w.id} w={w} s={s} go={go} label="اليوم" />)}
        {!todays.length && (week[0] || later[0]) && <NextCard w={week[0] || later[0]} s={s} go={go} />}
        {!todays.length && !week.length && !later.length && realCount > 0 && <AddCard go={go} />}
        <Inbox go={go} />
        {realCount > 0 && <TodoCard s={s} go={go} />}
        {realCount > 0 && <Stats s={s} go={go} />}
        <InstallNudge />
        {(todays.length ? week : week.slice(1)).length > 0 && <><h4 className="sec">هاد السيمانة</h4><div className="list">{(todays.length ? week : week.slice(1)).map((w) => <Row key={w.id} w={w} s={s} go={go} />)}</div></>}
        {(!todays.length && !week.length ? later.slice(1) : later).length > 0 && <><h4 className="sec">من بعد</h4><div className="list">{(!todays.length && !week.length ? later.slice(1) : later).map((w) => <Row key={w.id} w={w} s={s} go={go} />)}</div></>}
        
        {past.length > 0 && (
          <button className="linkbtn" onClick={() => setShowPast(!showPast)}>{showPast ? 'خبّي العراسات اللي فاتو' : `العراسات اللي فاتو (${past.length})`}</button>
        )}
        {showPast && <div className="list dim">{past.map((w) => <Row key={w.id} w={w} s={s} go={go} />)}</div>}
      </div>
      <Fab onClick={() => go('new')}>عرس جديد</Fab>
      {qr && <QuickReplies onClose={() => setQr(false)} />}
    </div>
  )
}
