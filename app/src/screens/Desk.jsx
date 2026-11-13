// PC layout only (screens 1024px and wider): side menu + dashboard home.
// The phone layout never renders anything from this file.
import { useEffect, useMemo, useRef, useState } from 'react'
import { paidOf, problemsOf, restOf, teamOf, totalOf, useStore } from '../lib/data'
import { DAYS, MONTHS, PHOTOS, dayKey, daysFromToday, fromKey, greeting, money, openExternal, photoFor, todayKey, waLink } from '../lib/util'
import { DH, Empty, Ic, Logo } from '../ui'
import { Inbox, QuickReplies } from './Inbox'

export function Side({ v, go }) {
  const s = useStore()
  const live = s.weddings.filter((w) => w.status !== 'cancelled' && w.status !== 'done' && daysFromToday(w.day) >= 0)
  const owing = live.filter((w) => w.status !== 'devis' && paidOf(w, s.payments) <= 0).length
  const items = [
    ['weddings', 'الرئيسية', Ic.rings, live.length],
    ['calendar', 'الكالوندري', Ic.cal],
    ['clients', 'الكليان', Ic.ppl],
    ['staff', 'الخدامة', Ic.team],
    ['money', 'الفلوس', Ic.cash, owing, true],
    ['requests', 'طلبات الدوفي', Ic.doc, (s.requests || []).filter((r) => r.status === 'new').length + (s.proofs || []).filter((p) => p.status === 'pending').length, true],
  ]
  const tr = s.traiteur
  return (
    <aside className="dside">
      <div className="dlogo"><Logo size={26} /></div>
      <nav>
        {items.map(([k, l, ic, n, hot]) => (
          <button key={k} className={'dnav' + (v === k || (k === 'weddings' && ['wedding', 'new', 'edit'].includes(v)) ? ' on' : '')} onClick={() => go(k)}>
            {ic(20)}<span>{l}</span>{n > 0 && <b className={hot ? 'hot' : ''} dir="ltr">{n}</b>}
          </button>
        ))}
        <h6>الحساب</h6>
        <button className={'dnav' + (v === 'settings' ? ' on' : '')} onClick={() => go('settings')}>{Ic.gear(20)}<span>الإعدادات والمينوات</span></button>
      </nav>
      <button className="dme" onClick={() => go('settings')}>
        <span className="av">{(tr?.name || 'A').trim().slice(0, 1)}</span>
        <span><b>{tr?.name || 'Amariya'}</b><small>{tr?.city || ''}</small></span>
      </button>
    </aside>
  )
}

const FILTERS = [['all', 'الجايين'], ['week', 'هاد السيمانة'], ['todo', 'ناقصهم شي حاجة'], ['past', 'اللي فاتو']]

export function Dashboard({ go }) {
  const s = useStore()
  const [f, setF] = useState('all')
  const [q, setQ] = useState('')
  const [qr, setQr] = useState(false)
  const search = useRef(null)
  const today = todayKey()
  const now = new Date()
  const mk = dayKey(now).slice(0, 7)

  // Ctrl/Cmd + K focuses the search, N opens a new wedding
  useEffect(() => {
    const k = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.current?.focus() }
      else if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) go('new')
    }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [go])

  const live = useMemo(() => s.weddings.filter((w) => w.status !== 'cancelled').sort((a, b) => (a.day + a.time).localeCompare(b.day + b.time)), [s.weddings])
  const upcoming = live.filter((w) => daysFromToday(w.day) >= 0)
  const thisWeek = upcoming.filter((w) => daysFromToday(w.day) <= 7)
  const todays = upcoming.filter((w) => w.day === today)

  const monthW = live.filter((w) => w.day.startsWith(mk))
  const income = s.payments.filter((p) => p.paid_on?.startsWith(mk)).reduce((a, p) => a + +p.amount, 0)
  const staffCost = s.assignments.filter((a) => a.status === 'ok').reduce((sum, a) => {
    const w = s.weddings.find((x) => x.id === a.wedding_id)
    return w && w.status !== 'cancelled' && w.day.startsWith(mk) && w.day <= today ? sum + (+a.pay || 0) : sum
  }, 0)
  const spent = s.expenses.filter((e) => e.spent_on?.startsWith(mk)).reduce((a, e) => a + +e.amount, 0) + staffCost
  const owed = live.filter((w) => w.status !== 'devis').map((w) => ({ w, rest: restOf(w, s.payments), paid: paidOf(w, s.payments) })).filter((x) => x.rest > 0)
  const owedTotal = owed.reduce((a, x) => a + x.rest, 0)
  const noArboun = owed.filter((x) => x.paid <= 0 && daysFromToday(x.w.day) >= 0)

  let rows = f === 'week' ? thisWeek : f === 'todo' ? upcoming.filter((w) => problemsOf(w, s).length) : f === 'past' ? live.filter((w) => daysFromToday(w.day) < 0).reverse() : upcoming
  const n = q.trim()
  if (n) rows = live.filter((w) => [w.family, w.hall, w.city, w.phone].join(' ').includes(n))

  // mini month
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7 // weeks start on Monday
  const byDay = {}; monthW.forEach((w) => { (byDay[w.day] ||= []).push(w) })
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => dayKey(new Date(now.getFullYear(), now.getMonth(), i + 1)))]
  const hot = (k) => (byDay[k] || []).some((w) => problemsOf(w, s).length)

  const first_ = (s.me?.name || '').split(' ')[0]
  return (
    <div className="dash">
      <section className="dhead" style={{ backgroundImage: `url(${PHOTOS.hall2})` }}>
        <div className="t">
          <small>{greeting()}{first_ ? '، ' + first_ : ''} · {DAYS[now.getDay()]} {now.getDate()} {MONTHS[now.getMonth()]}</small>
          <h1>{todays.length ? <>عندك <b dir="ltr">{todays.length}</b> {todays.length === 1 ? 'عرس' : 'عراسات'} اليوم</> : thisWeek.length ? <>عندك <b dir="ltr">{thisWeek.length}</b> {thisWeek.length === 1 ? 'عرس' : 'عراسات'} هاد السيمانة</> : 'ما عندك حتى عرس هاد السيمانة'}</h1>
        </div>
        <div className="ac">
          <label className="dsr">{Ic.search(18)}<input ref={search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="قلّب على عائلة، قاعة، تيليفون…" /><kbd dir="ltr">Ctrl K</kbd></label>
          <button className="dqr" onClick={() => setQr(true)} aria-label="ردود جاهزين">{Ic.wa(18)}<span>ردود جاهزين</span></button>
          <button className="dcta" onClick={() => go('new')}>{Ic.plus(18)} عرس جديد</button>
        </div>
      </section>

      <section className="dkpi">
        <div className="k"><small>عراسات {MONTHS[now.getMonth()]}</small><div className="v"><b className="num">{monthW.length}</b><u>{monthW.length === 1 ? 'عرس' : 'عراسات'}</u></div><span className="mut">{upcoming.length} جايين فالمجموع</span></div>
        <div className="k"><small>الفلوس اللي دخلات هاد الشهر</small><div className="v"><DH v={income} /></div><span className="mut">المصاريف: <DH v={spent} /></span></div>
        <div className="k"><small>الصافي ديال الشهر</small><div className={'v' + (income - spent < 0 ? ' neg' : ' pos')}><DH v={income - spent} /></div><span className="mut">مدخول ناقص المصاريف والخدامة</span></div>
        <div className={'k' + (owedTotal > 0 ? ' al' : '')}><small>باقي عند الناس</small><div className="v"><DH v={owedTotal} /></div><span className="mut">{noArboun.length ? `${noArboun.length} ما عطاوش العربون` : 'كلشي عطا العربون'}</span></div>
      </section>

      <section className="dgrid">
        <div className="dpn">
          <div className="dpn-h">
            <h2>{n ? `النتائج (${rows.length})` : 'العراسات'}</h2>
            {!n && <div className="seg">{FILTERS.map(([k, l]) => <button key={k} className={f === k ? 'on' : ''} onClick={() => setF(k)}>{l}</button>)}</div>}
          </div>
          {rows.length === 0 ? <Empty title={n ? 'ما لقينا والو' : 'ما كاين حتى عرس هنا'} sub={n ? '' : 'زيد عرس جديد وغادي يبان هنا'} /> : (
            <div className="dtbl">
              <div className="tr th"><span>النهار</span><span>العائلة</span><span>الضياف</span><span>السرباية</span><span>الخلاص</span><span className="l">الباقي</span></div>
              {rows.map((w) => {
                const d = fromKey(w.day), t = teamOf(w, s), paid = paidOf(w, s.payments), rest = restOf(w, s.payments), probs = problemsOf(w, s)
                const pct = Math.min(100, (t.serveursOk / (t.need || 1)) * 100)
                return (
                  <button key={w.id} className="tr" onClick={() => go('wedding', { id: w.id })}>
                    <span><span className={'cbx' + (probs.length ? ' hot' : '')}><small>{DAYS[d.getDay()]}</small><b dir="ltr">{d.getDate()}</b><small>{MONTHS[d.getMonth()]}</small></span></span>
                    <span className="fm"><i style={{ backgroundImage: `url(${photoFor(w.id)})` }} /><span><b>{w.family}</b><small>{[w.hall, w.city].filter(Boolean).join(' · ')} · <span dir="ltr">{w.time}</span></small></span></span>
                    <span className="num">{w.guests}</span>
                    <span className={'mtr' + (t.serveursOk < t.need ? ' hot' : '')}><i><em style={{ width: pct + '%' }} /></i><b dir="ltr">{t.serveursOk}/{t.need}</b></span>
                    <span>{w.status === 'devis' ? <em className="pl br">دوفي</em> : rest <= 0 ? <em className="pl ok">✓ خالص كامل</em> : paid <= 0 ? <em className="pl hot">بلا عربون</em> : <em className="pl ok">✓ العربون</em>}</span>
                    <span className="l"><DH v={rest} /></span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="dcol">
          <Inbox go={go} compact />
          <div className="dpn">
            <div className="dpn-h"><h2>{MONTHS[now.getMonth()]} <span dir="ltr">{now.getFullYear()}</span></h2><button className="dlink" onClick={() => go('calendar')}>الكالوندري كامل ←</button></div>
            <div className="mcal">
              {['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح'].map((x) => <span key={x}>{x}</span>)}
              {cells.map((k, i) => !k ? <i key={'e' + i} /> : (
                <button key={k} className={(byDay[k] ? (hot(k) ? 'h' : 'b') : '') + (k === today ? ' t' : '') + (k < today ? ' p' : '')} onClick={() => go('calendar', { day: k })}>
                  <b dir="ltr">{fromKey(k).getDate()}</b>{byDay[k]?.length > 1 && <sup dir="ltr">{byDay[k].length}</sup>}
                </button>
              ))}
            </div>
            <div className="mlg"><span><i className="b" />محجوز</span><span><i className="h" />ناقصو شي حاجة</span><span><i className="t" />اليوم</span></div>
          </div>
          <div className="dpn grow">
            <div className="dpn-h"><h2>خاص يخلّصو</h2>{owed.length > 0 && <button className="dlink" onClick={() => go('money')}>الفلوس ←</button>}</div>
            {owed.length === 0 ? <p className="muted">كلشي خالص 👌</p> : owed.sort((a, b) => (a.paid > 0) - (b.paid > 0) || a.w.day.localeCompare(b.w.day)).slice(0, 6).map(({ w, rest, paid }) => (
              <div key={w.id} className="ow" role="button" tabIndex={0} onClick={() => go('wedding', { id: w.id })}>
                <i style={{ backgroundImage: `url(${photoFor(w.id)})` }} />
                <span><b>{w.family}</b><small>{daysFromToday(w.day) >= 0 ? `العرس ${DAYS[fromKey(w.day).getDay()]} ${fromKey(w.day).getDate()} ${MONTHS[fromKey(w.day).getMonth()]}` : 'العرس داز'}{paid <= 0 ? ' · بلا عربون' : ''}</small></span>
                <DH v={rest} />
                {w.phone && <button className="wab" onClick={(e) => { e.stopPropagation(); openExternal(waLink(w.phone, `السلام عليكم ${w.family} 🌿\nكنفكّروكم بلي باقي ${money(rest)} DH ديال العرس.\n${s.traiteur?.name || ''}`)) }} aria-label="واتساب">{Ic.wa(18)}</button>}
              </div>
            ))}
          </div>
        </div>
      </section>
      {qr && <QuickReplies onClose={() => setQr(false)} />}
    </div>
  )
}

// true on screens wide enough for the PC layout
export function useDesk() {
  const q = '(min-width: 1024px)'
  const [d, setD] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches)
  useEffect(() => { const m = matchMedia(q); const f = () => setD(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f) }, [])
  return d
}
