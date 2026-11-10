import { useMemo, useState } from 'react'
import { paidOf, totalOf, useStore } from '../lib/data'
import { dayLabel, openExternal, prettyPhone, telLink, waLink } from '../lib/util'
import { DH, Empty, Ic, Sheet, TopBar } from '../ui'

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
  const n = q.trim()
  const shown = n ? clients.filter((c) => c.family.includes(n) || (c.phone || '').includes(n.replace(/\D/g, '').replace(/^0/, ''))) : clients

  return (
    <div className="screen">
      <TopBar title="الكليان" />
      <div className="content pt">
        <label className="search">{Ic.search()}<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="قلب بالسمية ولا التيليفون" /></label>
        {shown.length === 0 && <Empty title={n ? 'ما لقيناش' : 'باقي ما كاين حتى كليان'} sub={n ? '' : 'كل عائلة كتزيد ليها عرس كتبان هنا.'} />}
        <div className="list">
          {shown.map((c) => (
            <button className="crow" key={c.key} onClick={() => setOpen(c)}>
              <span className="av">{c.family.replace('عائلة ', '').slice(0, 1)}</span>
              <span className="mid"><b>{c.family}</b><span className="meta">{c.weddings.length > 1 ? `${c.weddings.length} عراسات · ` : ''}{dayLabel(c.weddings[0].day, false)}</span></span>
              {c.rest > 0 ? <span className="owe">باقي <DH v={c.rest} /></span> : <span className="paid">{Ic.check(13)} خالص</span>}
            </button>
          ))}
        </div>
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
