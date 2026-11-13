// What the traiteur has to do now: new devis requests, deposit proofs to confirm, balance reminders.
// Plus the ready-made replies and the shared WhatsApp texts.
import { useEffect, useState } from 'react'
import { acceptProof, devisLink, markReminded, proofUrl, refresh, remindersDue, shopLink, update, useStore } from '../lib/data'
import { dayLabel, money, openExternal, photoFor, waLink } from '../lib/util'
import { DH, Ic, Sheet, fail, haptic, toast } from '../ui'

const METHOD = { bank: 'تحويل بنكي', cashplus: 'CashPlus', wafacash: 'Wafacash', other: 'آخر' }
export const methodLabel = (m) => METHOD[m] || m

export const remindText = (w, rest, tr) => [
  `السلام عليكم ${w.family} 🌿`,
  `كنفكّروكم بلي العرس نهار ${dayLabel(w.day)} وباقي ${money(rest)} DH.`,
  devisLink(w) && `تقدرو تخلّصو وتصيفطو الوصل من هنا: ${devisLink(w)}`,
  `الله يكمّل بالخير، ${tr?.name || 'التريتور'}`,
].filter(Boolean).join('\n')

const ago = (iso) => {
  const m = Math.round((Date.now() - new Date(iso)) / 60000)
  if (m < 60) return `قبل ${Math.max(1, m)} دقيقة`
  const h = Math.round(m / 60); if (h < 24) return `قبل ${h} ساعة`
  const d = Math.round(h / 24); return d === 1 ? 'البارح' : `قبل ${d} أيام`
}
export { ago }

// keep requests/proofs fresh while the app is open
export function useInboxRefresh() {
  useEffect(() => {
    refresh()
    const f = () => document.visibilityState === 'visible' && refresh()
    const t = setInterval(f, 60000)
    document.addEventListener('visibilitychange', f)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', f) }
  }, [])
}

export function ProofSheet({ p, onClose }) {
  const s = useStore()
  const w = s.weddings.find((x) => x.id === p.wedding_id)
  const [url, setUrl] = useState(undefined)
  const [busy, setBusy] = useState(false)
  useEffect(() => { proofUrl(p).then(setUrl, () => setUrl(null)) }, [p])
  const ok = async () => { setBusy(true); try { await acceptProof(p); haptic(); toast(`تسجّل ⁦${money(p.amount)} DH⁩ فعرس ${w?.family || ''}`); onClose() } catch (e) { fail(e); setBusy(false) } }
  const no = async () => { setBusy(true); try { await update('proofs', p.id, { status: 'no' }); toast('ترفض الوصل'); onClose() } catch (e) { fail(e); setBusy(false) } }
  const pdf = /\.pdf$/i.test(p.path || '')
  return (
    <Sheet title="وصل من الكليان" onClose={onClose}>
      <div className="prf-top">
        <div><small>{w?.family}{w && ` · ${dayLabel(w.day)}`}</small><b><DH v={p.amount} /></b><span>{methodLabel(p.method)}{p.payer && ` · ${p.payer}`} · {ago(p.created_at)}</span></div>
      </div>
      <div className="prf-img">
        {url === undefined ? <div className="spin" /> : !url ? <p className="muted">ما قدرناش نجيبو الصورة.</p> : pdf ? <a className="btn ghost" href={url} target="_blank" rel="noreferrer">{Ic.doc()} حلّ الـ PDF</a> : <a href={url} target="_blank" rel="noreferrer"><img src={url} alt="الوصل" /></a>}
      </div>
      <p className="muted" style={{ textAlign: 'center', margin: '8px 0 2px' }}>شوف واش الفلوس وصلاتك قبل ما تأكّد.</p>
      <div className="btnrow">
        <button className="btn green" disabled={busy} onClick={ok}>{Ic.check(18)} وصلاتني، أكّد</button>
        <button className="btn ghost danger" disabled={busy} onClick={no}>ماشي صحيح</button>
      </div>
    </Sheet>
  )
}

// the "to do now" block on the home screen (phone) and in the side column (PC)
export function Inbox({ go, compact }) {
  const s = useStore()
  const [proof, setProof] = useState(null)
  const [all, setAll] = useState(false)
  const reqs = (s.requests || []).filter((r) => r.status === 'new')
  const proofs = (s.proofs || []).filter((p) => p.status === 'pending')
  const due = remindersDue(s)
  if (!reqs.length && !proofs.length && !due.length) return null
  const remind = async ({ w, rest, stage }) => {
    openExternal(waLink(w.phone, remindText(w, rest, s.traiteur)))
    try { await markReminded(w, stage) } catch { /* the message is what matters */ }
  }
  return (
    <section className={'inbox' + (compact ? ' compact' : '')}>
      {!compact && <h4 className="sec dark">خاصك دير دابا</h4>}
      {reqs.length > 0 && (
        <button className="ibx req" onClick={() => go('requests')}>
          <span className="ic">{Ic.doc(20)}</span>
          <span className="mid"><b>{reqs.length === 1 ? 'طلب دوفي جديد' : `${reqs.length} طلبات دوفي جداد`}</b><span className="meta">{reqs.slice(0, 2).map((r) => r.name).join('، ')}</span></span>
          <span className="go">{Ic.back(18)}</span>
        </button>
      )}
      {proofs.map((p) => {
        const w = s.weddings.find((x) => x.id === p.wedding_id)
        return (
          <button key={p.id} className="ibx prf" onClick={() => setProof(p)}>
            <span className="ic">{Ic.receipt(20)}</span>
            <span className="mid"><b>وصل جديد · {w?.family || p.payer}</b><span className="meta">{methodLabel(p.method)} · {ago(p.created_at)} · أكّد واش وصلاتك</span></span>
            <span className="rest ok"><DH v={p.amount} /></span>
            <span className="go">{Ic.back(18)}</span>
          </button>
        )
      })}
      {(all ? due : due.slice(0, 2)).map((x) => {
        return (
          <div key={x.w.id + x.stage} className="ibx rem">
            <span className="ph" style={{ backgroundImage: `url(${photoFor(x.w.id)})` }} />
            <span className="mid" role="button" tabIndex={0} onClick={() => go('wedding', { id: x.w.id })}><b>{x.w.family}</b><span className="meta">فكّرهم · العرس {x.n === 0 ? 'اليوم' : x.n === 1 ? 'غدا' : `بعد ${x.n} أيام`}</span></span>
            <span className="rest"><small>باقي</small><DH v={x.rest} /></span>
            <button className="sendwa" onClick={() => remind(x)} aria-label="صيفط التفكير فالواتساب">{Ic.wa(18)}</button>
          </div>
        )
      })}
      {due.length > 2 && <button className="ibx-more" onClick={() => setAll(!all)}>{all ? 'خبّي' : `و ${due.length - 2} آخرين خاصهم تفكير بالباقي`}</button>}
      {proof && <ProofSheet p={proof} onClose={() => setProof(null)} />}
    </section>
  )
}

/* ---------- ready replies ---------- */
export function replies(s) {
  const t = s.traiteur || {}, pay = t.pay || {}, link = shopLink(t)
  const menus = s.packages.filter((p) => p.active !== false)
  const out = []
  out.push(['الثمن', [
    'السلام عليكم ومرحبا 🌿',
    `هادو المينوهات ديال ${t.name || 'التريتور'}:`,
    ...menus.map((p) => `• ${p.name}: ${money(p.price)} DH للضيف${(p.items || []).length ? ` (${p.items.slice(0, 4).join('، ')})` : ''}`),
    link && `شوف الصور والنهارات الخاوين: ${link}`,
    'عطيني النهار، المدينة وشحال من ضيف ونصيفط ليك الدوفي فالحين 🙏',
  ].filter(Boolean).join('\n')])
  out.push(['النهار والضياف', 'السلام عليكم ومرحبا 🌿\nعافاك عطيني: النهار ديال العرس، المدينة والقاعة، وشحال من ضيف تقريبا.\nنشوف واش النهار خاوي ونصيفط ليك الدوفي 🙏'])
  const how = [pay.rib && `🏦 ${pay.bank || 'البنك'} · ${pay.holder || ''}\nRIB: ${pay.rib}`, pay.cashplus_phone && `💸 CashPlus: ${pay.cashplus_name || ''} · ${pay.cashplus_phone}`, pay.wafacash_phone && `💸 Wafacash: ${pay.wafacash_name || ''} · ${pay.wafacash_phone}`].filter(Boolean)
  out.push(['العربون', [`باش نحجزو ليكم النهار كنطلبو عربون ${t.arboun_pct || 30}% من المجموع.`, how.length ? `تقدرو تخلّصو هنا:\n${how.join('\n')}` : 'غادي نصيفط ليكم الرابط ديال الدوفي فيه كيفاش تخلّصو.', 'ومن بعد صيفطو لينا صورة الوصل ونأكّدو ليكم الحجز ✅'].join('\n')])
  if (link) out.push(['الصفحة ديالي', `السلام عليكم 🌿\nهادي الصفحة ديال ${t.name || 'التريتور'}: المينوهات، الأثمنة والنهارات الخاوين، وتقدر تطلب الدوفي مباشرة:\n${link}`])
  return out
}

export function QuickReplies({ onClose, phone }) {
  const s = useStore()
  const list = replies(s)
  const [i, setI] = useState(0)
  const text = list[i][1]
  const send = () => openExternal(phone ? waLink(phone, text) : `https://wa.me/?text=${encodeURIComponent(text)}`)
  const copy = async () => { try { await navigator.clipboard.writeText(text); toast('تنسخ') } catch { /* */ } }
  return (
    <Sheet title="ردود جاهزين" onClose={onClose}>
      <div className="filters">{list.map(([l], k) => <button key={l} className={i === k ? 'on' : ''} onClick={() => setI(k)}>{l}</button>)}</div>
      <pre className="qr-text">{text}</pre>
      <div className="btnrow">
        <button className="btn green" onClick={send}>{Ic.wa(18)} صيفط فالواتساب</button>
        <button className="btn ghost" onClick={copy}>نسخ</button>
      </div>
      <p className="hint" style={{ textAlign: 'center' }}>كيتبدّلو بوحدهم ملي كتبدّل المينوهات ولا معلومات الخلاص.</p>
    </Sheet>
  )
}

