import { useState } from 'react'
import { InstallButton } from '../install'
import { add, isDemo, logout, remove, saveTraiteur, update, useStore } from '../lib/data'
import { PHOTOS, cropStyle, normPhone, prettyPhone } from '../lib/util'
import { Band, Field, Ic, Sheet, fail, toast } from '../ui'

export default function Settings({ back }) {
  const s = useStore()
  const t = s.traiteur || {}
  const [f, setF] = useState({ name: t.name || '', city: t.city || '', phone: prettyPhone(t.phone) })
  const [pk, setPk] = useState(null)
  const [ed, setEd] = useState(false)
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
          <button className="btn brass wide" disabled={!dirty} onClick={save}>سجّل</button>
        </Sheet>
      )}
      {pk && <PackageSheet p={pk} close={() => setPk(null)} />}
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
