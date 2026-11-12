import { useMemo, useState } from 'react'
import { paidOf, totalOf, useStore } from '../lib/data'
import { DAYS, PHOTOS, dayLabel, fromKey, openExternal, prettyPhone, telLink, waLink } from '../lib/util'
import { Band, DH, Empty, Ic, Sheet } from '../ui'

// clients are the families of the weddings, grouped by phone (or name when no phone)
export default function Clients({ go }) {
  const s = useStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const clients = useMemo(() => {
    const m = new Map()
    for (const w of s.weddings) {
      if (w.status === 'cancelled') continue
      const k = w.phone || w.family
      const c = m.get(k) || { key: k, family: w.family, phone: w.phone, weddings: [], total: 0, rest: 0 }
      c.weddings.push(w); c.total += totalOf(w); c.rest += Math.max(0, totalOf(w) - paidOf(w, s.payments))
      if (w.day > (c.weddings[0]?.day || '')) c.family = w.family
      m.set(k, c)
    }
    return [...m.values()].map((c) => ({ ...c, weddings: c.weddings.sort((a, b) => b.day.localeCompare(a.day)) })).sort((a, b) => b.weddings[0].day.localeCompare(a.weddings[0].day))
  }, [s.weddings, s.payments])
  const [tab, setTab] = useState('all')
  const n = q.trim()
  const found = n ? clients.filter((c) => c.family.includes(n) || (c.phone || '').includes(n.replace(/\D/g, '').replace(/^0/, ''))) : clients
  const shown = found.filter((c) => tab === 'all' || (tab === 'owe' ? c.rest > 0 : c.rest <= 0))
  const restAll = clients.reduce((a, c) => a + c.rest, 0)
  const owing = clients.filter((c) => c.rest > 0).length
  const status = (c) => {
    const w = c.weddings[0]
    if (c.rest <= 0) return <span className="pill2 ok">✓ خالص كامل</span>
    const paid = paidOf(w, s.payments)
    return <><span className="r">باقي <DH v={c.rest} unit={false} /></span>{paid <= 0 ? <span className="pill2 hot">بلا عربون</span> : <span className="pill2 br">العربون ✓</span>}</>
  }

  return (
    <div className="screen">
      <Band photo={PHOTOS.bride} pos="center 60%" title="الكليان"
        kicker={<>{clients.length} كليان{restAll > 0 && <> · <DH v={restAll} /> باقي</>}</>}
        right={<button className="round glass" onClick={() => go('new')} aria-label="عرس جديد">{Ic.plus(20)}</button>}>
        <label className="search">{Ic.search()}<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="قلّب بالسمية ولا التيليفون" /></label>
      </Band>
      <div className="content">
        <div className="tabs2">
          <button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>الكل <b>{clients.length}</b></button>
          <button className={tab === 'owe' ? 'on' : ''} onClick={() => setTab('owe')}>ما خلّصوش <b>{owing}</b></button>
          <button className={tab === 'paid' ? 'on' : ''} onClick={() => setTab('paid')}>خالصين <b>{clients.length - owing}</b></button>
        </div>
        {shown.length === 0 && <Empty title={n ? 'ما لقيناش' : 'باقي ما كاين حتى كليان'} sub={n ? '' : 'كل عائلة كتزيد ليها عرس كتبان هنا.'} />}
        {shown.map((c) => {
          const w = c.weddings[0], d = fromKey(w.day)
          return (
            <div className="cli" key={c.key} role="button" tabIndex={0} onClick={() => setOpen(c)}>
              <span className="calbox"><small>{DAYS[d.getDay()]}</small><b>{d.getDate()}</b></span>
              <span className="mid"><b>{c.family}</b><span className="meta">{c.weddings.length > 1 ? `${c.weddings.length} عراسات · ` : ''}{[w.hall, w.guests ? `${w.guests} ضيف` : ''].filter(Boolean).join(' · ')}</span><span className="cst">{status(c)}</span></span>
              {c.phone && <button className="wab" onClick={(e) => { e.stopPropagation(); openExternal(waLink(c.phone, `السلام عليكم ${c.family}`)) }} aria-label="واتساب">{Ic.wa(20)}</button>}
            </div>
          )
        })}
      </div>
      {open && (
        <Sheet title={open.family} onClose={() => setOpen(null)}>
          {open.phone && (
            <div className="contact flat">
              <span dir="ltr">{prettyPhone(open.phone)}</span>
              <div className="btnrow tight">
                <button className="round" onClick={() => openExternal(telLink(open.phone))} aria-label="عيّط">{Ic.phone()}</button>
                <button className="round wa" onClick={() => openExternal(waLink(open.phone, `السلام عليكم ${open.family}`))} aria-label="واتساب">{Ic.wa()}</button>
              </div>
            </div>
          )}
          <div className="list">
            {open.weddings.map((w) => (
              <button key={w.id} className="crow" onClick={() => { setOpen(null); go('wedding', { id: w.id }) }}>
                <span className="mid"><b>{dayLabel(w.day)}</b><span className="meta">{w.hall} · <span dir="ltr">{w.guests}</span> ضيف</span></span>
                <DH v={totalOf(w)} />
              </button>
            ))}
          </div>
          <button className="btn ghost wide" onClick={() => { setOpen(null); go('new', { prefill: { family: open.family, phone: prettyPhone(open.phone) } }) }}>{Ic.plus(18)} عرس جديد لهاد العائلة</button>
        </Sheet>
      )}
    </div>
  )
}
