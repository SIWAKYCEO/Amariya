import { useState } from 'react'
import { InstallButton } from '../install'
import { add, isDemo, logout, remove, saveTraiteur, shopLink, update, useStore } from '../lib/data'
import { PHOTOS, cropStyle, normPhone, prettyPhone } from '../lib/util'
import { Band, Field, Ic, Sheet, fail, shareText, toast } from '../ui'
import { QuickReplies } from './Inbox'

export default function Settings({ back }) {
  const s = useStore()
  const t = s.traiteur || {}
  const [f, setF] = useState({ name: t.name || '', city: t.city || '', phone: prettyPhone(t.phone) })
  const [pk, setPk] = useState(null)
  const [ed, setEd] = useState(false)
  const [sh, setSh] = useState(null) // 'page' | 'pay' | 'qr'
  const link = shopLink(t), pay = t.pay || {}
  const payLine = [pay.rib && (pay.bank || 'بنك'), pay.cashplus_phone && 'CashPlus', pay.wafacash_phone && 'Wafacash'].filter(Boolean).join(' · ')
  const save = () => saveTraiteur({ name: f.name.trim(), city: f.city.trim(), phone: normPhone(f.phone) }).then(() => { toast('تسجّل'); setEd(false) }).catch(fail)
  const pics = ['pastilla', 'tajine', 'sweet']
  const first = (t.name || 'ت').replace(/^تريتور\s+/, '').replace(/^ال(?=\S{2})/, '').slice(0, 1)

  return (
    <div className="screen form">
      <Band photo={PHOTOS.food} pos="center 75%" title="الإعدادات" back={back}>
        <div className="prof">
          <span className="lgx">{first}</span>
          <span style={{ flex: 1, minWidth: 0 }}><b>{t.name || 'التريتور ديالك'}</b><small>{t.city}{t.city && t.phone && ' · '}{t.phone && <span dir="ltr">{prettyPhone(t.phone)}</span>}{!t.city && !t.phone && 'زيد المدينة والتيليفون'}</small></span>
          <button className="round glass" onClick={() => setEd(true)} aria-label="بدّل">{Ic.pen(17)}</button>
        </div>
      </Band>
      <div className="content">
        <h4 className="sec2">المينوهات والأثمنة <button className="mini" onClick={() => setPk({})}>{Ic.plus(16)} زيد مينو</button></h4>
        <div className="hscroll">
          {s.packages.map((p, i) => (
            <button key={p.id} className="mncard" onClick={() => setPk(p)}>
              <span className="img" style={cropStyle(pics[i % pics.length])}><span className="num" dir="ltr">{p.price}<small> DH</small></span></span>
              <span className="bd"><b>{p.name}</b><small>{(p.items || []).join(' · ')}</small></span>
            </button>
          ))}
          <button className="mncard add" onClick={() => setPk({})}>{Ic.plus(24)}مينو جديد</button>
        </div>
        <p className="muted" style={{ margin: '-4px 4px 0' }}>الثمن ديال الضيف. كيتحسب بيه الدوفي بوحدو.</p>

        <h4 className="sec2">الصفحة ديالك والخلاص</h4>
        <div className="glist">
          <button className="gli" onClick={() => setSh('page')}><span className="ic">{Ic.share(17)}</span><span className="gtx"><b>الصفحة ديالك</b><small dir="ltr">{link ? link.replace('https://', '') : '—'}</small></span><span className="x">{t.public_on === false ? 'مسدودة' : 'خدامة'}</span></button>
          <button className="gli" onClick={() => setSh('pay')}><span className="ic">{Ic.cash(17)}</span><span className="gtx"><b>كيفاش كيخلّصوك العربون</b><small>{payLine || 'زيد الـ RIB ولا CashPlus'}</small></span><span className="x"><span dir="ltr">{t.arboun_pct || 30}%</span></span></button>
          <button className="gli" onClick={() => setSh('qr')}><span className="ic">{Ic.wa(17)}</span><span className="gtx"><b>ردود جاهزين</b><small>الثمن، النهار، العربون، الصفحة</small></span></button>
        </div>
        <p className="muted" style={{ margin: '8px 4px 0' }}>الكليان كيشوفو المينوهات والنهارات الخاوين وكيطلبو الدوفي، وكيخلّصو العربون من الرابط ديال الدوفي.</p>

        <h4 className="sec2">التطبيق</h4>
        <div className="glist">
          <InstallButton className="gli" label="زيد Amariya للتيليفون" />
          <button className="gli danger" onClick={logout}><span className="ic">{Ic.x(17)}</span>{isDemo ? 'خرج من التجربة' : 'خرج من الحساب'}</button>
        </div>
        <p className="privacy" style={{ marginTop: 16 }}>كنسجلو شحال كتستعمل التطبيق، نوع التيليفون والمدينة (عن طريق IP) غير باش نحسنو الخدمة. ما كنعطيو هاد المعلومات لحتى واحد.</p>
        <p className="ver">Amariya · v0.2</p>
      </div>
      {ed && (
        <Sheet title="التريتور ديالك" onClose={() => setEd(false)}>
          <Field label="السمية"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="two">
            <Field label="المدينة"><input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
            <Field label="التيليفون"><input inputMode="tel" dir="ltr" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          </div>
          <button className="btn brass wide" disabled={!f.name.trim()} onClick={save}>سجّل</button>
        </Sheet>
      )}
      {pk && <PackageSheet p={pk} close={() => setPk(null)} />}
      {sh === 'page' && <PageSheet t={t} close={() => setSh(null)} />}
      {sh === 'pay' && <PaySheet t={t} close={() => setSh(null)} />}
      {sh === 'qr' && <QuickReplies onClose={() => setSh(null)} />}
    </div>
  )
}

function PackageSheet({ p, close }) {
  const [f, setF] = useState({ name: p.name || '', price: p.price ?? '', items: (p.items || []).join('\n') })
  const save = async () => {
    const row = { name: f.name.trim(), price: +f.price || 0, items: f.items.split('\n').map((x) => x.trim()).filter(Boolean) }
    try { if (p.id) await update('packages', p.id, row); else await add('packages', { ...row, sort: 99, active: true }); toast('تسجّل'); close() } catch (e) { fail(e) }
  }
  return (
    <Sheet title={p.id ? p.name : 'مينو جديد'} onClose={close}>
      <Field label="السمية"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="مثلا: الملكي" /></Field>
      <Field label="الثمن ديال الضيف (DH)"><input inputMode="numeric" dir="ltr" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, '') })} /></Field>
      <Field label="الماكلة (كل وحدة فسطر)"><textarea rows={6} value={f.items} onChange={(e) => setF({ ...f, items: e.target.value })} placeholder={'البسطيلة\nالمشوي\nالفواكه'} /></Field>
      <button className="btn brass wide" disabled={!f.name.trim() || !+f.price} onClick={save}>سجّل</button>
      {p.id && <button className="btn ghost wide danger" onClick={() => remove('packages', p.id).then(close).catch(fail)}>{Ic.trash()} مسحو</button>}
    </Sheet>
  )
}

function PageSheet({ t, close }) {
  const [f, setF] = useState({ slug: t.slug || '', bio: t.bio || '', on: t.public_on !== false })
  const [busy, setBusy] = useState(false)
  const link = shopLink({ slug: f.slug })
  const okSlug = /^[a-z0-9][a-z0-9-]{2,39}$/.test(f.slug)
  const save = async () => {
    setBusy(true)
    try { await saveTraiteur({ slug: f.slug, bio: f.bio.trim() || null, public_on: f.on }); toast('تسجّل'); close() }
    catch (e) { setBusy(false); if (String(e?.code) === '23505' || /duplicate|unique/i.test(e?.message || '')) toast('هاد السمية مستعملة، ختار وحدة أخرى', 'err'); else fail(e) }
  }
  return (
    <Sheet title="الصفحة ديالك" onClose={close}>
      <div className="linkbox"><span dir="ltr">{link.replace('https://', '')}</span>
        <div className="btnrow tight">
          <button className="round" onClick={async () => { try { await navigator.clipboard.writeText(link); toast('تنسخ') } catch { /* */ } }} aria-label="نسخ">{Ic.doc(17)}</button>
          <button className="round" onClick={() => shareText(`شوف المينوهات والنهارات الخاوين ديال ${t.name}:\n${link}`)} aria-label="صيفط">{Ic.share(17)}</button>
          <a className="round" href={link} target="_blank" rel="noreferrer" aria-label="شوف">{Ic.back(17)}</a>
        </div>
      </div>
      <Field label="السمية فالرابط (حروف لاتينية، أرقام و -)" hint="مثلا: traiteur-yakout"><input dir="ltr" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) })} /></Field>
      <Field label="جملة على التريتور ديالك"><textarea rows={3} maxLength={160} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="مثلا: تريتور فسطات من 2012 · العراسات والخطوبات والعقيقة" /></Field>
      <label className="tgl"><span><b>الصفحة مفتوحة للناس</b><small>إلا سدّيتيها، الرابط ما يبقاش يخدم</small></span><input type="checkbox" checked={f.on} onChange={(e) => setF({ ...f, on: e.target.checked })} /><i /></label>
      <button className="btn brass wide" disabled={!okSlug || busy} onClick={save}>سجّل</button>
    </Sheet>
  )
}

function PaySheet({ t, close }) {
  const p = t.pay || {}
  const [f, setF] = useState({ bank: p.bank || '', holder: p.holder || '', rib: p.rib || '', cashplus_name: p.cashplus_name || '', cashplus_phone: p.cashplus_phone || '', wafacash_name: p.wafacash_name || '', wafacash_phone: p.wafacash_phone || '', pct: String(t.arboun_pct || 30) })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const rib = f.rib.replace(/\D/g, '')
  const ribOk = !rib || rib.length === 24
  const save = async () => {
    const pay = Object.fromEntries(Object.entries({ bank: f.bank, holder: f.holder, rib: rib ? rib.replace(/(\d{3})(\d{3})(\d{16})(\d{2})/, '$1 $2 $3 $4') : '', cashplus_name: f.cashplus_name, cashplus_phone: f.cashplus_phone.replace(/[^\d+]/g, ''), wafacash_name: f.wafacash_name, wafacash_phone: f.wafacash_phone.replace(/[^\d+]/g, '') }).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v))
    try { await saveTraiteur({ pay, arboun_pct: Math.min(100, Math.max(5, +f.pct || 30)) }); toast('تسجّل'); close() } catch (e) { fail(e) }
  }
  return (
    <Sheet title="كيفاش كيخلّصوك" onClose={close}>
      <p className="muted">هادشي كيبان للكليان فالرابط ديال الدوفي. كيخلّصو، كيصيفطو صورة الوصل، ونتا كتأكّد بتوكة وحدة.</p>
      <Field label="العربون (% من المجموع)"><input inputMode="numeric" dir="ltr" value={f.pct} onChange={(e) => setF({ ...f, pct: e.target.value.replace(/\D/g, '').slice(0, 3) })} /></Field>
      <h4 className="lab">🏦 التحويل البنكي</h4>
      <div className="two">
        <Field label="البنك"><input value={f.bank} onChange={set('bank')} placeholder="CIH, Attijari…" /></Field>
        <Field label="سمية مول الحساب"><input value={f.holder} onChange={set('holder')} /></Field>
      </div>
      <Field label="RIB (24 رقم)" hint={!ribOk ? 'الـ RIB خاصو يكون 24 رقم' : ''}><input inputMode="numeric" dir="ltr" value={f.rib} onChange={set('rib')} placeholder="000 000 0000000000000000 00" /></Field>
      <h4 className="lab">💸 CashPlus</h4>
      <div className="two">
        <Field label="السمية"><input value={f.cashplus_name} onChange={set('cashplus_name')} /></Field>
        <Field label="التيليفون"><input inputMode="tel" dir="ltr" value={f.cashplus_phone} onChange={set('cashplus_phone')} placeholder="06…" /></Field>
      </div>
      <h4 className="lab">💸 Wafacash</h4>
      <div className="two">
        <Field label="السمية"><input value={f.wafacash_name} onChange={set('wafacash_name')} /></Field>
        <Field label="التيليفون"><input inputMode="tel" dir="ltr" value={f.wafacash_phone} onChange={set('wafacash_phone')} placeholder="06…" /></Field>
      </div>
      <button className="btn brass wide" disabled={!ribOk} onClick={save}>سجّل</button>
    </Sheet>
  )
}
