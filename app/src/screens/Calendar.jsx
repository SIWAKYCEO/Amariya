// Month calendar: which days are booked, which are free — the first question every client asks.
import { useState } from 'react'
import { totalOf, useStore } from '../lib/data'
import { DAYS, MONTHS, dayKey, dayLabel, fromKey, todayKey } from '../lib/util'
import { DH, Ic, TopBar } from '../ui'

const WEEK = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] // الأحد → السبت

export default function Calendar({ back, go, day }) {
  const s = useStore()
  const start = day ? fromKey(day) : new Date()
  const [ym, setYm] = useState([start.getFullYear(), start.getMonth()])
  const [sel, setSel] = useState(day || todayKey())
  const live = s.weddings.filter((w) => w.status !== 'cancelled')
  const byDay = live.reduce((m, w) => ((m[w.day] = m[w.day] || []).push(w), m), {})
  const first = new Date(ym[0], ym[1], 1)
  const n = new Date(ym[0], ym[1] + 1, 0).getDate()
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: n }, (_, i) => dayKey(new Date(ym[0], ym[1], i + 1)))]
  const shift = (k) => { const d = new Date(ym[0], ym[1] + k, 1); setYm([d.getFullYear(), d.getMonth()]) }
  const monthKey = `${ym[0]}-${String(ym[1] + 1).padStart(2, '0')}`
  const inMonth = live.filter((w) => w.day.startsWith(monthKey))
  const today = todayKey()
  const list = byDay[sel] || []

  return (
    <div className="screen">
      <TopBar title="الكالوندري" back={back} />
      <div className="content">
        <div className="month">
          <button className="round sm" onClick={() => shift(-1)} aria-label="الشهر اللي فات">{Ic.back(18)}</button>
          <b>{MONTHS[ym[1]]} <span dir="ltr">{ym[0]}</span></b>
          <button className="round sm flip" onClick={() => shift(1)} aria-label="الشهر الجاي">{Ic.back(18)}</button>
        </div>
        <p className="cal-sum"><b dir="ltr">{inMonth.length}</b> {inMonth.length === 1 ? 'عرس' : 'عراسات'} هاد الشهر · <b dir="ltr">{n - new Set(inMonth.map((w) => w.day)).size}</b> نهار خاوي</p>
        <div className="cal">
          {WEEK.map((d) => <span key={d} className="wd">{d}</span>)}
          {cells.map((k, i) => {
            if (!k) return <span key={'e' + i} />
            const ws = byDay[k] || []
            const past = k < today
            return (
              <button key={k} className={'cd' + (k === sel ? ' sel' : '') + (k === today ? ' today' : '') + (ws.length ? ' busy' : '') + (past ? ' past' : '')} onClick={() => setSel(k)}>
                <b dir="ltr">{fromKey(k).getDate()}</b>
                {ws.length > 0 && <i>{ws.length > 1 ? ws.length : ''}</i>}
              </button>
            )
          })}
        </div>
        <div className="legend"><span><i className="lg busy" /> محجوز</span><span><i className="lg free" /> خاوي</span></div>

        <h4 className="sec dark">{dayLabel(sel)}</h4>
        {list.length === 0 ? (
          <div className="freeday">
            <span className="fd-ic">{Ic.check(18)}</span>
            <div><b>هاد النهار خاوي</b><span>تقدر تقبل عرس جديد</span></div>
            {sel >= today && <button className="btn brass sm" onClick={() => go('new', { prefill: { day: sel } })}>{Ic.plus(16)} حجز</button>}
          </div>
        ) : (
          <div className="list">
            {list.map((w) => (
              <button key={w.id} className="wrow" onClick={() => go('wedding', { id: w.id })}>
                <span className="dbox t"><small>الساعة</small><b dir="ltr">{w.time}</b></span>
                <span className="mid"><b>{w.family}</b><span className="meta">{[w.hall, w.city].filter(Boolean).join(' · ')} · <span dir="ltr">{w.guests}</span> ضيف</span></span>
                <span className="amt"><DH v={totalOf(w)} unit={false} /><small>DH</small></span>
              </button>
            ))}
            {sel >= today && <button className="btn ghost wide" onClick={() => go('new', { prefill: { day: sel } })}>{Ic.plus(16)} عرس آخر هاد النهار</button>}
          </div>
        )}
      </div>
    </div>
  )
}
