import { useState } from 'react'
import { add, owedOf, payStaff, remove, stockOf, update, useStore, weddingItemsOf } from '../lib/data'
import { dayLabel, money, openExternal, waLink } from '../lib/util'
import { DH, Ic, Sheet, fail, toast } from '../ui'

/* ---------- devis + contract as PDF ---------- */
export function DocsCard({ w }) {
  const s = useStore()
  const [busy, setBusy] = useState('')
  const [file, setFile] = useState(null)
  async function make(kind) {
    setBusy(kind)
    try {
      const { weddingPdf } = await import('../lib/pdf')
      const f = await weddingPdf(w, s, kind)
      setFile({ f, kind, url: URL.createObjectURL(f) })
    } catch (e) { fail(e) } finally { setBusy('') }
  }
  async function send() {
    if (navigator.canShare?.({ files: [file.f] })) {
      try { await navigator.share({ files: [file.f], title: file.f.name }); return } catch (e) { if (e?.name === 'AbortError') return }
    }
    const a = document.createElement('a'); a.href = file.url; a.download = file.f.name; a.click()
    toast('تسجّل الملف · صيفطو فالواتساب')
    if (w.phone) setTimeout(() => openExternal(waLink(w.phone, `السلام عليكم ${w.family} 🌿\nها ${file.kind === 'contract' ? 'العقد' : 'الدوفي'} ديال العرس فـ PDF.`)), 700)
  }
  const close = () => { if (file?.url) URL.revokeObjectURL(file.url); setFile(null) }
  return (
    <div className="card docs">
      <div className="ch"><h3>{Ic.doc(17)} الوراق ديال العرس</h3></div>
      <p className="muted">كيتعمّرو بوحدهم من المعلومات ديال العرس، باللوغو والسمية ديالك.</p>
      <div className="docrow">
        <button className="docb" onClick={() => make('devis')} disabled={!!busy}>
          <span className="dbi">{busy === 'devis' ? <span className="spin sm" /> : 'PDF'}</span>
          <span><b>الدوفي</b><small>الثمن، المينو والعربون</small></span>
        </button>
        <button className="docb" onClick={() => make('contract')} disabled={!!busy}>
          <span className="dbi">{busy === 'contract' ? <span className="spin sm" /> : 'PDF'}</span>
          <span><b>العقد</b><small>الشروط والتوقيع</small></span>
        </button>
      </div>
      {file && (
        <Sheet title={file.kind === 'contract' ? 'العقد واجد' : 'الدوفي واجد'} onClose={close}>
          <p className="muted">صيفطو للعائلة فالواتساب، ولا طبعو باش يوقّعو.</p>
          <div className="pdfok">{Ic.doc(30)}<span><b dir="ltr">{file.f.name}</b><small>{file.kind === 'contract' ? '2 صفحات' : 'صفحة وحدة'} · PDF</small></span></div>
          <button className="btn green wide" onClick={send}>{Ic.wa(18)} صيفطو</button>
          <a className="linkbtn" href={file.url} target="_blank" rel="noreferrer">شوفو قبل</a>
        </Sheet>
      )}
    </div>
  )
}

/* ---------- material of one wedding ---------- */
export function MaterialCard({ w, go }) {
  const s = useStore()
  const [sheet, setSheet] = useState(null) // 'out' | row (return)
  const rows = weddingItemsOf(w, s)
  const short = rows.filter((r) => r.short > 0)
  const out = rows.filter((r) => r.qty_back == null)
  const past = w.day < new Date().toISOString().slice(0, 10)
  return (
    <div className="card">
      <div className="ch"><h3>{Ic.box(17)} الماتريال</h3>{rows.length > 0 && <button className="mini" onClick={() => setSheet('out')}>{Ic.pen(15)} بدّل</button>}</div>
      {short.length > 0 && <div className="alert sm">{short.map((r) => <p key={r.id}>ناقصك <b dir="ltr">{r.short}</b> {r.item.name} نهار {dayLabel(w.day)}: كاين عرس آخر ف نفس النهار.</p>)}</div>}
      {past && out.length > 0 && <div className="alert sm"><p>باقي ما رجعش الماتريال ديال هاد العرس. سجّل شنو رجع.</p></div>}
      {rows.length === 0 ? <p className="muted">سجّل شنو غادي يخرج لهاد العرس (الطباسل، الكيسان…) باش تعرف واش كافي وشنو رجع.</p> : (
        <ul className="mat">{rows.map((r) => (
          <li key={r.id}>
            <span className="mn"><b>{r.item.name}</b>
              <small>{r.qty_back == null ? 'خرج · باقي ما رجعش' : r.missing || r.broken ? `رجع ${r.qty_back}${r.broken ? ` · تهرّس ${r.broken}` : ''}${r.missing ? ` · ضاع ${r.missing}` : ''}` : 'رجع كامل'}</small></span>
            <b className="mq" dir="ltr">{r.qty_out}</b>
            {r.qty_back == null ? <button className="mini" onClick={() => setSheet(r)}>رجع؟</button> : <span className={'mst' + (r.missing || r.broken ? ' bad' : '')}>{r.missing || r.broken ? Ic.x(13) : Ic.check(13)}</span>}
          </li>
        ))}</ul>
      )}
      <button className="linkrow" onClick={() => setSheet('out')}>{Ic.plus(16)} {rows.length ? 'زيد ماتريال' : 'خرّج الماتريال لهاد العرس'}</button>
      <button className="linkbtn" onClick={() => go('stock')}>شوف الماتريال ديالك كامل</button>
      {sheet === 'out' && <OutSheet w={w} close={() => setSheet(null)} go={go} />}
      {sheet && sheet !== 'out' && <BackSheet r={sheet} close={() => setSheet(null)} />}
    </div>
  )
}

function OutSheet({ w, close, go }) {
  const s = useStore()
  const cur = Object.fromEntries(s.witems.filter((x) => x.wedding_id === w.id).map((x) => [x.item_id, x]))
  const [q, setQ] = useState(() => Object.fromEntries(s.items.map((i) => [i.id, cur[i.id]?.qty_out ?? ''])))
  const save = async () => {
    try {
      for (const i of s.items) {
        const v = +q[i.id] || 0, ex = cur[i.id]
        if (ex && !v) await remove('witems', ex.id)
        else if (ex && v !== +ex.qty_out) await update('witems', ex.id, { qty_out: v })
        else if (!ex && v) await add('witems', { wedding_id: w.id, item_id: i.id, qty_out: v, qty_back: null, broken: 0 })
      }
      toast('تسجّل الماتريال'); close()
    } catch (e) { fail(e) }
  }
  return (
    <Sheet title="شنو غادي يخرج؟" onClose={close}>
      {s.items.length === 0 ? (
        <>
          <p className="muted">باقي ما زدتي الماتريال ديالك. زيدو مرة وحدة (شحال عندك من طبسيل، كاس…) ومن بعد غير كتختار.</p>
          <button className="btn brass wide" onClick={() => { close(); go('stock') }}>زيد الماتريال ديالك</button>
        </>
      ) : (
        <>
          <p className="muted">كتب شحال غادي تخرّج من كل حاجة. اللي ما غاديش يخرج خليه خاوي.</p>
          <div className="qlist">{s.items.map((i) => {
            const st = stockOf(i, s), mine = +cur[i.id]?.qty_out || 0
            return (
              <label key={i.id} className="qrow">
                <span><b>{i.name}</b><small>عندك {i.qty} · خاويين دابا {st.free + (cur[i.id]?.qty_back == null ? mine : 0)}</small></span>
                <input inputMode="numeric" dir="ltr" placeholder="0" value={q[i.id]} onChange={(e) => setQ({ ...q, [i.id]: e.target.value.replace(/\D/g, '') })} />
              </label>
            )
          })}</div>
          <button className="btn brass wide" onClick={save}>سجّل</button>
        </>
      )}
    </Sheet>
  )
}

function BackSheet({ r, close }) {
  const [ok, setOk] = useState(String(r.qty_out))
  const [br, setBr] = useState('')
  const lost = Math.max(0, r.qty_out - (+ok || 0) - (+br || 0))
  const save = () => update('witems', r.id, { qty_back: +ok || 0, broken: +br || 0 }).then(() => { toast('تسجّل'); close() }).catch(fail)
  return (
    <Sheet title={`رجوع ${r.item.name}`} onClose={close}>
      <p className="muted">خرجو <b dir="ltr">{r.qty_out}</b>. شحال رجع سالم وشحال تهرّس؟</p>
      <div className="qlist">
        <label className="qrow"><span><b>رجع سالم</b></span><input inputMode="numeric" dir="ltr" value={ok} onChange={(e) => setOk(e.target.value.replace(/\D/g, ''))} /></label>
        <label className="qrow"><span><b>تهرّس</b></span><input inputMode="numeric" dir="ltr" placeholder="0" value={br} onChange={(e) => setBr(e.target.value.replace(/\D/g, ''))} /></label>
      </div>
      {lost > 0 && <p className="pf-warn">ضاعو <b dir="ltr">{lost}</b>. سوّل الخدامة ولا العائلة.</p>}
      <button className="btn brass wide" onClick={save}>سجّل</button>
    </Sheet>
  )
}

/* ---------- staff pay ---------- */
export function StaffPayCard() {
  const s = useStore()
  const owed = owedOf(s)
  const total = owed.reduce((a, o) => a + o.total, 0)
  const ym = new Date().toISOString().slice(0, 7)
  const paidMonth = s.assignments.filter((a) => a.paid_at && a.paid_at.startsWith(ym)).reduce((a, x) => a + (+x.pay || 0), 0)
  const pay = async (o) => {
    try {
      await payStaff(o)
      toast(`تسجّل: خلّصتي ${o.p.name}`)
      if (o.p.phone) openExternal(waLink(o.p.phone, `السلام ${o.p.name}، خلّصتك ${money(o.total)} درهم ديال ${o.nights.length} ${o.nights.length === 1 ? 'ليلة' : 'ليالي'} (${o.nights.map(({ w }) => w.family).join('، ')}). الله يعطيك الصحة 🙏`))
    } catch (e) { fail(e) }
  }
  return (
    <div className="card pay">
      <div className="ch"><h3>{Ic.cash(17)} الخلاص ديال الخدامة</h3></div>
      <div className="m3 two">
        <div className={total ? 'hot' : 'good'}><small>باقي عليك</small><DH v={total} /></div>
        <div><small>خلّصتي هاد الشهر</small><DH v={paidMonth} /></div>
      </div>
      {owed.length === 0 ? <p className="muted" style={{ marginTop: 10 }}>ما باقي عليك والو للخدامة.</p> : (
        <ul className="owl">{owed.map((o) => (
          <li key={o.p.id}>
            <span className="mid"><b>{o.p.name}</b><small><span dir="ltr">{o.nights.length}</span> {o.nights.length === 1 ? 'ليلة' : 'ليالي'} · {o.nights.map(({ w }) => w.family.replace('عائلة ', '')).join('، ')}</small></span>
            <DH v={o.total} />
            <button className="btn green sm" onClick={() => pay(o)}>خلّصتو</button>
          </li>
        ))}</ul>
      )}
      <p className="hint">كيتحسب بوحدو: كل خدام قلتي «جاي» فعرس داز، بالخلصة ديال الليلة ديالو. ملّي تكليكي «خلّصتو» كيتسجّل وكيمشي ليه ميساج فالواتساب.</p>
    </div>
  )
}
