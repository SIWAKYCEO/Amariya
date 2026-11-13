// Public pages, no login: the devis + deposit page (/d/<token>) and the traiteur's shop window (/t/<slug>).
import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_KEY, SUPABASE_URL } from './lib/data'
import { DAYS, MONTHS, PHOTOS, addDays, cropStyle, dayKey, dayLabel, fromKey, money, waLink } from './lib/util'
import { Ic, Logo } from './ui'

const db = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'amariya-public' } })
const PICS = ['pastilla', 'tajine', 'sweet']
const open = (u) => { window.open(u, '_blank') || (location.href = u) }

function Footer() {
  return <a className="pub-foot" href="https://amariya.vercel.app" target="_blank" rel="noreferrer">مصاوب ب <Logo size={14} color="var(--green)" /></a>
}
function Shell({ children, photo = PHOTOS.hall2, pos = 'center 40%', head }) {
  return (
    <div className="pub">
      <header className="pub-hero" style={{ backgroundImage: `url(${photo})`, backgroundPosition: pos }}><div className="pub-hero-in">{head}</div></header>
      <main className="pub-main">{children}</main>
      <Footer />
    </div>
  )
}
const Loading = () => <div className="pub pub-center"><div className="spin" /></div>
const Missing = ({ text }) => <div className="pub pub-center"><Logo size={28} color="var(--green)" /><p>{text}</p></div>

function CopyRow({ label, value, ltr }) {
  const [ok, setOk] = useState(false)
  const copy = async () => { try { await navigator.clipboard.writeText(value.replace(/\s/g, ltr ? '' : ' ')); setOk(true); setTimeout(() => setOk(false), 1600) } catch { /* */ } }
  return (
    <div className="cprow">
      <span><small>{label}</small><b dir={ltr ? 'ltr' : undefined}>{value}</b></span>
      <button type="button" onClick={copy} className={ok ? 'ok' : ''}>{ok ? Ic.check(15) : 'نسخ'}</button>
    </div>
  )
}

// shrink big photos before upload (fast on slow mobile data); PDFs and anything we can't draw go as they are
async function shrink(file) {
  if (!file.type.startsWith('image/') || file.size < 600e3) return file
  try {
    const bmp = await createImageBitmap(file)
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82))
    return blob ? new File([blob], 'wasl.jpg', { type: 'image/jpeg' }) : file
  } catch { return file }
}

/* ===================== devis + deposit ===================== */
export function PublicDevis({ token }) {
  const [d, setD] = useState(undefined)
  const [m, setM] = useState('')
  const [amount, setAmount] = useState('')
  const [payer, setPayer] = useState('')
  const [file, setFile] = useState(null)
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const fileRef = useRef(null)

  useEffect(() => {
    db.rpc('amr_pub_devis', { p_token: token }).then(({ data }) => {
      setD(data || null)
      if (data) {
        const p = data.traiteur.pay || {}
        setM(p.rib ? 'bank' : p.cashplus_phone ? 'cashplus' : p.wafacash_phone ? 'wafacash' : '')
        setPayer(data.w.family || '')
      }
    }, () => setD(null))
  }, [token])
  const want = useMemo(() => {
    if (!d) return 0
    const rest = Math.max(0, d.total - d.paid)
    if (d.paid > 0) return rest
    return Math.min(rest, Math.ceil((d.total * (d.traiteur.pct || 30)) / 100 / 100) * 100)
  }, [d])
  useEffect(() => { if (want) setAmount(String(want)) }, [want])

  if (d === undefined) return <Loading />
  if (!d) return <Missing text="هاد الرابط ما بقاش خدام. طلب رابط جديد من التريتور." />

  const t = d.traiteur, w = d.w, p = t.pay || {}
  const rest = Math.max(0, d.total - d.paid)
  const methods = [p.rib && ['bank', 'تحويل بنكي'], p.cashplus_phone && ['cashplus', 'CashPlus'], p.wafacash_phone && ['wafacash', 'Wafacash']].filter(Boolean)
  const ex = (w.extras || []).filter((e) => +e.amount > 0)

  async function send(e) {
    e.preventDefault()
    if (!file || !+amount) return
    setState('sending')
    try {
      const f = await shrink(file)
      const ext = f.type === 'application/pdf' ? 'pdf' : f.type === 'image/png' ? 'png' : 'jpg'
      const path = `in/${token}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const up = await db.storage.from('amr-proofs').upload(path, f, { contentType: f.type || 'image/jpeg', upsert: false })
      if (up.error) throw up.error
      const { data, error } = await db.rpc('amr_pub_proof', { p_token: token, p_amount: +amount, p_method: m || 'other', p_path: path, p_payer: payer })
      if (error || !data) throw error || new Error('refused')
      setState('sent')
    } catch { setState('error') }
  }

  return (
    <Shell head={<>
      <span className="pub-k">الدوفي ديال العرس</span>
      <h1>{t.name}</h1>
      <p>{t.city}</p>
    </>}>
      <section className="pcard devis">
        <div className="dv-top"><div><small>العائلة</small><b>{w.family}</b></div><span className="pdate"><small>{DAYS[fromKey(w.day).getDay()]}</small><b dir="ltr">{fromKey(w.day).getDate()}</b><small>{MONTHS[fromKey(w.day).getMonth()]}</small></span></div>
        <p className="dv-meta">{Ic.clock(14)} <span dir="ltr">{w.time}</span>{w.hall && <> · {Ic.pin(14)} {w.hall}</>}{w.city && <>، {w.city}</>}</p>
        <div className="dv-menu">
          <b>{w.package || 'المينو'}</b>
          {(w.items || []).length > 0 && <div className="dv-items">{w.items.map((x) => <span key={x}>{x}</span>)}</div>}
        </div>
        <div className="dv-lines">
          <div><span><span dir="ltr">{w.guests}</span> ضيف × <span dir="ltr">{money(w.price)}</span> DH</span><b dir="ltr">{money(w.guests * w.price)} DH</b></div>
          {ex.map((e, i) => <div key={i}><span>{e.label}</span><b dir="ltr">{money(e.amount)} DH</b></div>)}
        </div>
        <div className="dv-total"><span>المجموع</span><b dir="ltr">{money(d.total)} <small>DH</small></b></div>
        {d.paid > 0 && <div className="dv-paid"><span>{Ic.check(14)} تخلّص <b dir="ltr">{money(d.paid)} DH</b></span><span>الباقي <b dir="ltr">{money(rest)} DH</b></span></div>}
      </section>

      {rest <= 0 ? (
        <section className="pcard done"><span className="big">{Ic.check(22)}</span><b>العرس خالص كامل</b><p>شكرا على الثقة، الله يكمّل بالخير 🌿</p></section>
      ) : state === 'sent' ? (
        <section className="pcard done"><span className="big">{Ic.check(22)}</span><b>توصّلنا بالوصل ديالك</b><p>{t.name} غادي يشوفو ويأكّد ليك فالواتساب.</p>
          {t.phone && <button className="pbtn wa" onClick={() => open(waLink(t.phone, `السلام عليكم، صيفطت الوصل ديال ${d.paid > 0 ? 'الخلاص' : 'العربون'} (${money(amount)} DH) ديال عرس ${w.family} 🙏`))}>{Ic.wa(18)} قول ليهم فالواتساب</button>}
        </section>
      ) : (
        <form className="pcard pay" onSubmit={send}>
          <h2>{d.paid > 0 ? 'خلّص الباقي' : 'خلّص العربون'}</h2>
          <p className="muted">{d.paid > 0 ? 'صيفط الفلوس وحمّل صورة الوصل هنا.' : `العربون كيحجز ليك النهار. ${t.pct || 30}% من المجموع.`}</p>
          <div className="want"><b dir="ltr">{money(want)}</b><small>DH</small></div>
          {d.pending > 0 && <p className="note">{Ic.clock(14)} كاين وصل سبق تصيفط، التريتور باقي ما أكّدوش.</p>}

          {methods.length === 0 ? (
            <div className="nopay"><p>تواصل مع التريتور باش يعطيك كيفاش تخلّص.</p>{t.phone && <button type="button" className="pbtn wa" onClick={() => open(waLink(t.phone, `السلام عليكم، بغيت نخلّص ${d.paid > 0 ? 'الباقي' : 'العربون'} ديال عرس ${w.family}. كيفاش؟`))}>{Ic.wa(18)} واتساب</button>}</div>
          ) : (
            <>
              <span className="plab">1 · صيفط الفلوس</span>
              {methods.length > 1 && <div className="seg2">{methods.map(([k, l]) => <button type="button" key={k} className={m === k ? 'on' : ''} onClick={() => setM(k)}>{l}</button>)}</div>}
              <div className="howto">
                {m === 'bank' && <>{p.bank && <CopyRow label="البنك" value={p.bank} />}{p.holder && <CopyRow label="سمية الحساب" value={p.holder} />}<CopyRow label="RIB" value={p.rib} ltr /></>}
                {m === 'cashplus' && <>{p.cashplus_name && <CopyRow label="السمية" value={p.cashplus_name} />}<CopyRow label="التيليفون" value={p.cashplus_phone} ltr /><p className="hint">سير لأقرب وكالة CashPlus وعطيهم السمية والتيليفون.</p></>}
                {m === 'wafacash' && <>{p.wafacash_name && <CopyRow label="السمية" value={p.wafacash_name} />}<CopyRow label="التيليفون" value={p.wafacash_phone} ltr /><p className="hint">سير لأقرب وكالة Wafacash وعطيهم السمية والتيليفون.</p></>}
              </div>

              <span className="plab">2 · حمّل صورة الوصل</span>
              <button type="button" className={'drop' + (file ? ' has' : '')} onClick={() => fileRef.current?.click()}>
                {file ? <>{Ic.check(18)} <span>{file.name.slice(0, 28)}</span><small>بدّل</small></> : <>{Ic.receipt(22)}<span>صوّر الوصل ولا ختارو من الصور</span></>}
              </button>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={(e) => { setFile(e.target.files?.[0] || null); setState('idle') }} />
              <div className="ptwo">
                <label><small>شحال صيفطتي (DH)</small><input inputMode="numeric" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').slice(0, 7))} /></label>
                <label><small>سمية اللي خلّص</small><input value={payer} onChange={(e) => setPayer(e.target.value.slice(0, 80))} /></label>
              </div>
              {state === 'error' && <p className="perr">ما تصيفطش. شوف الإنترنت وعاود جرّب.</p>}
              <button className="pbtn brass" disabled={!file || !+amount || state === 'sending'}>{state === 'sending' ? <span className="spin sm" /> : <>صيفط الوصل</>}</button>
            </>
          )}
        </form>
      )}
      {t.slug && <a className="plink" href={`/t/${t.slug}`}>شوف المينوهات ديال {t.name} ←</a>}
    </Shell>
  )
}

/* ===================== shop window ===================== */
function Month({ y, m, busy, pick, sel }) {
  const first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate(), lead = (first.getDay() + 6) % 7, today = dayKey(new Date())
  return (
    <div className="pmon">
      <b>{MONTHS[m]} <span dir="ltr">{y}</span></b>
      <div className="pgrid">
        {['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح'].map((x) => <span key={x} className="wd">{x}</span>)}
        {Array.from({ length: lead }, (_, i) => <i key={'e' + i} />)}
        {Array.from({ length: days }, (_, i) => {
          const k = dayKey(new Date(y, m, i + 1)), past = k < today, b = busy.has(k)
          return <button type="button" key={k} disabled={past || b} className={(b ? 'b' : '') + (past ? ' p' : '') + (sel === k ? ' s' : '')} onClick={() => pick(k)}><span dir="ltr">{i + 1}</span></button>
        })}
      </div>
    </div>
  )
}

export function PublicShop({ slug }) {
  const [d, setD] = useState(undefined)
  const [f, setF] = useState({ name: '', phone: '', day: '', guests: '', pkg: '', note: '' })
  const [st, setSt] = useState('idle')
  const [mo, setMo] = useState(0)
  const formRef = useRef(null)
  useEffect(() => { db.rpc('amr_pub_vetrina', { p_slug: slug }).then(({ data }) => setD(data || null), () => setD(null)) }, [slug])
  useEffect(() => { if (d?.name) document.title = `${d.name} · Amariya` }, [d])
  const busy = useMemo(() => new Set(d?.busy || []), [d])
  if (d === undefined) return <Loading />
  if (!d) return <Missing text="ما لقيناش هاد الصفحة." />

  const now = new Date(), base = new Date(now.getFullYear(), now.getMonth() + mo, 1)
  const okPhone = /^0?[5-7]\d{8}$|^(\+|00)?\d{11,14}$/.test(f.phone.replace(/[\s.-]/g, ''))
  const ready = f.name.trim().length > 1 && okPhone
  const goForm = (p) => { setF((x) => ({ ...x, ...p })); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }

  async function send(e) {
    e.preventDefault(); if (!ready) return
    setSt('sending')
    const { data, error } = await db.rpc('amr_pub_request', { p_slug: slug, p_name: f.name, p_phone: f.phone, p_day: f.day || null, p_guests: +f.guests || null, p_package: f.pkg || null, p_note: f.note || null })
    setSt(error || !data ? 'error' : 'sent')
  }
  const min = d.menus.length ? Math.min(...d.menus.map((x) => +x.price || 0).filter(Boolean)) : 0

  return (
    <Shell head={<>
      <span className="pub-k">تريتور · {d.city}</span>
      <h1>{d.name}</h1>
      {d.bio && <p>{d.bio}</p>}
      <div className="pub-cta">
        <button className="pbtn brass" onClick={() => goForm({})}>طلب دوفي</button>
        {d.phone && <button className="pbtn glass" onClick={() => open(waLink(d.phone, 'السلام عليكم، شفت الصفحة ديالكم فـ Amariya وبغيت نسول على عرس 🌿'))}>{Ic.wa(18)} واتساب</button>}
      </div>
      {min > 0 && <span className="pub-from">ابتداءً من <b dir="ltr">{money(min)} DH</b> للضيف</span>}
    </>}>
      {d.menus.length > 0 && <>
        <h2 className="psec">المينوهات</h2>
        <div className="pmenus">
          {d.menus.map((x, i) => (
            <article key={x.id} className="pmenu">
              <span className="img" style={cropStyle(PICS[i % PICS.length])}><span className="price"><small>ابتداءً من</small><b dir="ltr">{money(x.price)} <small>DH</small></b></span></span>
              <div className="bd"><b>{x.name}</b><ul>{(x.items || []).map((it) => <li key={it}>{it}</li>)}</ul>
                <button className="pbtn line" onClick={() => goForm({ pkg: x.id })}>بغيت هاد المينو</button></div>
            </article>
          ))}
        </div>
      </>}

      <h2 className="psec">النهارات الخاوين <span className="lg"><i />محجوز</span></h2>
      <div className="pcal pcard">
        <div className="pcal-nav">
          <button type="button" disabled={mo <= 0} onClick={() => setMo(mo - 1)} aria-label="الشهر اللي فات">{Ic.back(18)}</button>
          <button type="button" disabled={mo >= 4} onClick={() => setMo(mo + 1)} aria-label="الشهر الجاي" className="flip">{Ic.back(18)}</button>
        </div>
        <div className="pmons">
          <Month y={base.getFullYear()} m={base.getMonth()} busy={busy} sel={f.day} pick={(k) => goForm({ day: k })} />
          <Month y={new Date(base.getFullYear(), base.getMonth() + 1, 1).getFullYear()} m={(base.getMonth() + 1) % 12} busy={busy} sel={f.day} pick={(k) => goForm({ day: k })} />
        </div>
        <p className="hint">ختار نهار خاوي باش تطلب الدوفي ديالو.</p>
      </div>

      <h2 className="psec" ref={formRef}>طلب دوفي</h2>
      {st === 'sent' ? (
        <section className="pcard done"><span className="big">{Ic.check(22)}</span><b>توصّلو بالطلب ديالك</b><p>{d.name} غادي يتاصلو بيك فالواتساب ولا التيليفون باش يعطيوك الدوفي.</p></section>
      ) : (
        <form className="pcard pform" onSubmit={send}>
          <div className="ptwo">
            <label><small>السمية</small><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value.slice(0, 80) })} placeholder="مثلا: عائلة بنعلي" /></label>
            <label><small>التيليفون (واتساب)</small><input inputMode="tel" dir="ltr" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.slice(0, 20) })} placeholder="06 00 00 00 00" /></label>
          </div>
          <div className="ptwo">
            <label><small>النهار</small><input type="date" dir="ltr" min={dayKey(new Date())} max={dayKey(addDays(new Date(), 540))} value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })} /></label>
            <label><small>شحال من ضيف</small><input inputMode="numeric" dir="ltr" value={f.guests} onChange={(e) => setF({ ...f, guests: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="200" /></label>
          </div>
          {f.day && busy.has(f.day) && <p className="note">هاد النهار محجوز. تقدر تختار نهار آخر.</p>}
          {d.menus.length > 0 && <div className="pchips">{d.menus.map((x) => <button type="button" key={x.id} className={f.pkg === x.id ? 'on' : ''} onClick={() => setF({ ...f, pkg: f.pkg === x.id ? '' : x.id })}>{x.name} · <span dir="ltr">{money(x.price)}</span></button>)}</div>}
          <label><small>شي حاجة بغيتي تزيدها (اختياري)</small><textarea rows={3} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value.slice(0, 500) })} /></label>
          {st === 'error' && <p className="perr">ما تصيفطش. عاود جرّب.</p>}
          <button className="pbtn brass" disabled={!ready || st === 'sending'}>{st === 'sending' ? <span className="spin sm" /> : 'صيفط الطلب'}</button>
          {f.day && <p className="hint">{dayLabel(f.day)}{f.guests && ` · ${f.guests} ضيف`}</p>}
        </form>
      )}
    </Shell>
  )
}

export default function Public() {
  const p = location.pathname
  const d = p.match(/^\/d\/([A-Za-z0-9_-]{16,64})/), t = p.match(/^\/t\/([a-z0-9-]{3,40})/i)
  if (d) return <PublicDevis token={d[1]} />
  if (t) return <PublicShop slug={t[1].toLowerCase()} />
  return <Missing text="ما لقيناش هاد الصفحة." />
}
