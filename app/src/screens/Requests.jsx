// Devis requests that came from the traiteur's public page
import { useEffect, useState } from 'react'
import { shopLink, update, useStore } from '../lib/data'
import { PHOTOS, dayLabel, money, openExternal, prettyPhone, telLink, waLink } from '../lib/util'
import { Band, Empty, Ic, fail, toast } from '../ui'
import { QuickReplies, ago } from './Inbox'

const replyText = (r, pkg, t) => [
  `السلام عليكم ${r.name} ومرحبا 🌿`,
  `معاك ${t?.name || 'التريتور'}، توصّلنا بالطلب ديالك${r.day ? ` ديال نهار ${dayLabel(r.day)}` : ''}${r.guests ? ` (${r.guests} ضيف)` : ''}.`,
  pkg && r.guests ? `المينو ${pkg.name}: ${money(pkg.price)} DH للضيف، يعني تقريبا ${money(pkg.price * r.guests)} DH.` : '',
  'واش نصيفط ليك الدوفي كامل؟ ولا عندك شي سؤال؟',
].filter(Boolean).join('\n')

export default function Requests({ go, back }) {
  const s = useStore()
  const [tab, setTab] = useState('new')
  const [qr, setQr] = useState(false)
  const all = [...(s.requests || [])].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const fresh = all.filter((r) => r.status === 'new' || r.status === 'seen')
  const shown = tab === 'new' ? fresh : all.filter((r) => r.status === 'done' || r.status === 'no')
  const link = shopLink(s.traiteur)
  // opening the list = the traiteur has seen them (they stay in «جداد» until handled)
  useEffect(() => { (s.requests || []).filter((r) => r.status === 'new').forEach((r) => update('requests', r.id, { status: 'seen' }).catch(() => {})) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const setSt = (r, status) => update('requests', r.id, { status }).catch(fail)
  const toWedding = (r) => {
    const pkg = s.packages.find((p) => p.id === r.package_id)
    setSt(r, 'done')
    go('new', { prefill: { family: r.name, phone: prettyPhone(r.phone), ...(r.day && { day: r.day }), ...(r.guests && { guests: r.guests }), ...(pkg && { package_id: pkg.id, package_name: pkg.name, price: pkg.price }), notes: r.note || '' } })
  }
  return (
    <div className="screen">
      <Band photo={PHOTOS.bride} pos="center 35%" title="طلبات الدوفي" back={back}
        kicker={<>{fresh.length} جداد · من الصفحة ديالك</>}
        right={<button className="round glass" onClick={() => setQr(true)} aria-label="ردود جاهزين">{Ic.wa(19)}</button>}>
        {link && <button className="linkpill" onClick={async () => { try { await navigator.clipboard.writeText(link); toast('تنسخ الرابط') } catch { /* */ } }}>{Ic.share(15)} <span dir="ltr">{link.replace('https://', '')}</span></button>}
      </Band>
      <div className="content">
        <div className="tabs2">
          <button className={tab === 'new' ? 'on' : ''} onClick={() => setTab('new')}>جداد <b>{fresh.length}</b></button>
          <button className={tab === 'old' ? 'on' : ''} onClick={() => setTab('old')}>تسالاو <b>{all.length - fresh.length}</b></button>
        </div>
        {shown.length === 0 && <Empty title={tab === 'new' ? 'ما كاين حتى طلب جديد' : 'والو هنا'} sub={tab === 'new' ? 'حط الرابط ديال الصفحة ديالك فالبيو ديال إنستغرام والستوريات، والطلبات غادي يوصلو هنا.' : ''} />}
        {shown.map((r) => {
          const pkg = s.packages.find((p) => p.id === r.package_id)
          return (
            <div key={r.id} className={'rq' + (r.status === 'new' ? ' nw' : '')}>
              <div className="rq-h"><b>{r.name}</b><small>{ago(r.created_at)}</small></div>
              <div className="rq-c">
                {r.day && <span>{Ic.cal(14)} {dayLabel(r.day)}</span>}
                {r.guests && <span>{Ic.guests(14)} <b dir="ltr">{r.guests}</b> ضيف</span>}
                {pkg && <span>{pkg.name} · <b dir="ltr">{money(pkg.price)}</b> DH</span>}
                <span dir="ltr">{prettyPhone(r.phone)}</span>
              </div>
              {r.note && <p className="rq-n">«{r.note}»</p>}
              <div className="rq-a">
                <button className="btn green" onClick={() => openExternal(waLink(r.phone, replyText(r, pkg, s.traiteur)))}>{Ic.wa(17)} جاوب</button>
                <button className="btn ghost" onClick={() => toWedding(r)}>{Ic.plus(17)} دوفي</button>
                <button className="round" onClick={() => openExternal(telLink(r.phone))} aria-label="عيّط">{Ic.phone(17)}</button>
                {r.status !== 'no' && r.status !== 'done' && <button className="round" onClick={() => setSt(r, 'no')} aria-label="ماشي مهم">{Ic.x(16)}</button>}
              </div>
            </div>
          )
        })}
      </div>
      {qr && <QuickReplies onClose={() => setQr(false)} />}
    </div>
  )
}
