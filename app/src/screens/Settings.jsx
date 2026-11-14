import { useState } from 'react'
import { InstallButton } from '../install'
import { add, isDemo, isPro, logout, planOf, remove, saveTraiteur, shopLink, update, useStore } from '../lib/data'
import { PHOTOS, cropStyle, normPhone, prettyPhone } from '../lib/util'
import { Band, Field, Ic, Sheet, fail, shareText, toast } from '../ui'
import { QuickReplies } from './Inbox'

export default function Settings({ back, go }) {
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
        <button className={'planrow' + (isPro(t) ? ' on' : '')} onClick={() => go('plans')}>
          <span className="ic">{isPro(t) ? Ic.check(18) : Ic.lock(18)}</span>
          <span className="gtx"><b>{isPro(t) ? `عندك ${planOf(t) === 'pro' ? 'Pro' : 'Premium'}` : 'عندك المجاني'}</b><small>{isPro(t) ? 'الربح، الوراق PDF، الخلاص والماتريال مفتوحين' : 'فتح الربح، الدوفي PDF، الخلاص والماتريال بـ 150 درهم'}</small></span>
          <span className="x">{isPro(t) ? 'الباقات' : 'شوف Pro'}</span>
        </button>

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
          <button className="gli" onClick={() => (isPro(t) ? setSh('logo') : go('plans'))}><span className="ic">{t.logo ? <img src={t.logo} alt="" className="lgmini" /> : Ic.pen(17)}</span><span className="gtx"><b>اللوغو ديالك</b><small>كيبان فالدوفي والعقد PDF</small></span><span className="x">{isPro(t) ? (t.logo ? 'بدّل' : 'زيد') : <>{Ic.lock(13)} Pro</>}</span></button>
          <button className="gli" onClick={() => go('stock')}><span className="ic">{Ic.box(17)}</span><span className="gtx"><b>الماتريال ديالك</b><small>الطباسل، الكيسان، الطناجر…</small></span>{!isPro(t) && <span className="x">{Ic.lock(13)} Pro</span>}</button>
          <button className="gli" onClick={() => setSh('qr')}><span className="ic">{Ic.wa(17)}</span><span className="gtx"><b>ردود جاهزين</b><small>الثمن، النهار، العربون، الصفحة</small></span></button>
        </div>
        <p className="muted" style={{ margin: '8px 4px 0' }}>الكليان كيشوفو المينوهات والنهارات الخاوين وكيطلبو الدوفي، وكيخلّصو العربون من الرابط ديال الدوفي.</p>

        {t.internal && !isDemo && <>
          <h4 className="sec2">المدير</h4>
          <div className="glist">
            <a className="gli" href="?demo=1&pro=1"><span className="ic">{Ic.check(17)}</span><span className="gtx"><b>التجربة · كلشي مفتوح</b><small>أرقام وعراسات ماشي حقيقيين، Pro و Premium مفتوحين</small></span></a>
            <a className="gli" href="?demo=1&free=1"><span className="ic">{Ic.lock(17)}</span><span className="gtx"><b>التجربة · بحال تريتور جديد</b><small>المجاني بالقفل، باش تشوف شنو كيشوف الكليان</small></span></a>
          </div>
          <p className="muted" style={{ margin: '8px 4px 0' }}>هاد الحساب ما كيبانش فالداشبورد وما كيصيفط حتى نوتيفيكاسيون.</p>
        </>}
        {isDemo && <>
          <h4 className="sec2">التجربة</h4>
          <div className="glist">
            <a className="gli" href="?demo=1&pro=1"><span className="ic">{Ic.check(17)}</span><span className="gtx"><b>كلشي مفتوح</b><small>Pro و Premium</small></span></a>
            <a className="gli" href="?demo=1&free=1"><span className="ic">{Ic.lock(17)}</span><span className="gtx"><b>بحال تريتور جديد</b><small>المجاني بالقفل</small></span></a>
            <a className="gli" href="./"><span className="ic">{Ic.back(17)}</span><span className="gtx"><b>رجع للحساب ديالي</b><small>الأرقام الحقيقيين</small></span></a>
          </div>
        </>}

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
      {sh === 'logo' && <LogoSheet t={t} close={() => setSh(null)} />}
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

// logo: resized in the phone to 320px and kept as a small image inside the traiteur row
async function shrinkLogo(file) {
  const bmp = await createImageBitmap(file)
  const k = Math.min(1, 320 / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
  return c.toDataURL('image/png')
}
function LogoSheet({ t, close }) {
  const [src, setSrc] = useState(t.logo || '')
  const [busy, setBusy] = useState(false)
  const pick = async (e) => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); try { setSrc(await shrinkLogo(f)) } catch { toast('ما قدرناش نقراو هاد الصورة', 'err') } finally { setBusy(false) } }
  const save = () => saveTraiteur({ logo: src || null }).then(() => { toast('تسجّل اللوغو'); close() }).catch(fail)
  return (
    <Sheet title="اللوغو ديالك" onClose={close}>
      <p className="muted">اختار صورة اللوغو من التيليفون. كيبان فالفوق ديال الدوفي والعقد.</p>
      <label className="logopick">{src ? <img src={src} alt="اللوغو" /> : <span>{busy ? '…' : 'كليكي هنا باش تختار الصورة'}</span>}<input type="file" accept="image/*" onChange={pick} hidden /></label>
      <button className="btn brass wide" disabled={busy} onClick={save}>سجّل</button>
      {src && <button className="linkbtn danger" onClick={() => setSrc('')}>حيد اللوغو</button>}
    </Sheet>
  )
}
