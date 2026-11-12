import { useState } from 'react'
import { InstallButton } from '../install'
import { add, isDemo, logout, remove, saveTraiteur, update, useStore } from '../lib/data'
import { normPhone, prettyPhone } from '../lib/util'
import { DH, Field, Ic, Sheet, TopBar, fail, toast } from '../ui'

export default function Settings({ back }) {
  const s = useStore()
  const t = s.traiteur || {}
  const [f, setF] = useState({ name: t.name || '', city: t.city || '', phone: prettyPhone(t.phone) })
  const [pk, setPk] = useState(null)
  const dirty = f.name !== t.name || f.city !== (t.city || '') || normPhone(f.phone) !== (t.phone || '')
  const save = () => saveTraiteur({ name: f.name.trim(), city: f.city.trim(), phone: normPhone(f.phone) }).then(() => toast('تسجّل')).catch(fail)

  return (
    <div className="screen form">
      <TopBar title="الإعدادات" back={back} />
      <div className="content pt">
        <div className="card">
          <h3>التريتور ديالك</h3>
          <Field label="السمية"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="two">
            <Field label="المدينة"><input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
            <Field label="التيليفون"><input inputMode="tel" dir="ltr" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          </div>
          {dirty && <button className="btn brass wide" onClick={save}>سجّل</button>}
        </div>

        <div className="card">
          <div className="ch"><h3>المينوهات والأثمنة</h3><button className="mini" onClick={() => setPk({})}>{Ic.plus(16)} زيد</button></div>
          <p className="muted">الثمن ديال الضيف. كيتحسب بيه الدوفي بوحدو.</p>
          <div className="list">
            {s.packages.map((p) => (
              <button key={p.id} className="crow" onClick={() => setPk(p)}>
                <span className="mid"><b>{p.name}</b><span className="meta">{(p.items || []).join(' · ')}</span></span>
                <DH v={p.price} />
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>دير التطبيق فالتيليفون</h3>
          <p className="muted">تفتح بكليكة وحدة من الشاشة ديال التيليفون، بلا ما تقلب على الرابط.</p>
          <InstallButton />
        </div>

        <p className="privacy">كنسجلو شحال كتستعمل التطبيق، نوع التيليفون والمدينة (عن طريق IP) غير باش نحسنو الخدمة. ما كنعطيو هاد المعلومات لحتى واحد.</p>
        <button className="btn ghost wide danger" onClick={logout}>{isDemo ? 'خرج من التجربة' : 'خرج من الحساب'}</button>
        <p className="ver">Amariya · v0.1</p>
      </div>
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
