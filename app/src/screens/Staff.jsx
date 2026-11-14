import { useState } from 'react'
import { add, isPro, remove, update, useStore } from '../lib/data'
import { StaffPayCard } from './ProExtras'
import { PHOTOS, ROLES, ROLES_PL, daysFromToday, money, normPhone, openExternal, prettyPhone, waLink, initial } from '../lib/util'
import { Band, Empty, Fab, Field, Ic, Locked, Sheet, fail, toast } from '../ui'

export default function Staff({ go }) {
  const s = useStore()
  const [role, setRole] = useState('all')
  const [edit, setEdit] = useState(null) // null | {} new | person
  const people = s.staff.filter((p) => p.active !== false && (role === 'all' || p.role === role)).sort((a, b) => a.name.localeCompare(b.name, 'ar'))
  const upcoming = (p) => s.assignments.filter((a) => a.staff_id === p.id && a.status !== 'no').map((a) => s.weddings.find((w) => w.id === a.wedding_id)).filter((w) => w && w.status !== 'cancelled' && daysFromToday(w.day) >= 0).length
  const counts = Object.fromEntries(Object.keys(ROLES).map((r) => [r, s.staff.filter((p) => p.role === r && p.active !== false).length]))

  return (
    <div className="screen">
      <Band photo={PHOTOS.b} pos="center 45%" title="الخدامة" kicker={<>{s.staff.filter((p) => p.active !== false).length} خدام · السرباية، النكافة والكوزينة</>} />
      <div className="content pt" style={{ paddingTop: 16 }}>
        {isPro(s.traiteur) ? <StaffPayCard /> : (
          <Locked compact go={go} title="شكون خلّصتي وشكون باقي؟" why="التطبيق كيحسب الخلصة ديال كل خدام من العراسات اللي خدم فيهم، وكيصيفط ليه ميساج ملّي تخلّصو. ما تنسى حتى واحد.">
            <StaffPayCard />
          </Locked>
        )}
        <div className="filters">
          <button className={role === 'all' ? 'on' : ''} onClick={() => setRole('all')}>كلهم <b>{s.staff.filter((p) => p.active !== false).length}</b></button>
          {Object.keys(ROLES).filter((r) => counts[r]).map((r) => <button key={r} className={role === r ? 'on' : ''} onClick={() => setRole(r)}>{ROLES_PL[r]} <b>{counts[r]}</b></button>)}
        </div>
        {people.length === 0 && <Empty title="ما كاين حتى خدام" sub="زيد السرباية والنكافة والكوزينة مرة وحدة، ومن بعد غير كتختارهم لكل عرس." />}
        <div>
          {people.map((p) => {
            const n = upcoming(p)
            return (
              <div className="srow2" key={p.id} role="button" tabIndex={0} onClick={() => setEdit(p)}>
                <span className="who" style={{ display: 'contents' }}>
                  <span className="av2">{initial(p.name)}</span>
                  <span className="mid"><b>{p.name}</b><span className="meta">{ROLES[p.role]}{+p.rate ? <> · <span dir="ltr">{money(p.rate)} DH</span> لليلة</> : ''}</span></span>
                  {n > 0 && <span className="pill2 br">{n} {n === 1 ? 'عرس' : 'عراسات'}</span>}
                </span>
                {p.phone && <button className="wab" onClick={(e) => { e.stopPropagation(); openExternal(waLink(p.phone, `السلام ${p.name}`)) }} aria-label="واتساب">{Ic.wa(19)}</button>}
              </div>
            )
          })}
        </div>
      </div>
      <Fab onClick={() => setEdit({ role: role === 'all' ? 'serveur' : role })}>زيد خدام</Fab>
      {edit && <PersonSheet p={edit} close={() => setEdit(null)} />}
    </div>
  )
}

function PersonSheet({ p, close }) {
  const [f, setF] = useState({ name: p.name || '', phone: prettyPhone(p.phone), role: p.role || 'serveur', rate: p.rate ?? '' })
  const save = async () => {
    const row = { name: f.name.trim(), phone: normPhone(f.phone), role: f.role, rate: +f.rate || 0 }
    try {
      if (p.id) await update('staff', p.id, row)
      else await add('staff', { ...row, active: true })
      toast(p.id ? 'تبدّل' : 'تزاد'); close()
    } catch (e) { fail(e) }
  }
  return (
    <Sheet title={p.id ? p.name : 'خدام جديد'} onClose={close}>
      <Field label="السمية"><input autoFocus={!p.id} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="التيليفون (واتساب)"><input inputMode="tel" dir="ltr" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="06 00 00 00 00" /></Field>
      <span className="lab">الخدمة</span>
      <div className="quick">{Object.entries(ROLES).map(([k, l]) => <button key={k} className={'qchip' + (f.role === k ? ' on' : '')} onClick={() => setF({ ...f, role: k })}>{l}</button>)}</div>
      <Field label="شحال كياخد لليلة؟ (DH)"><input inputMode="numeric" dir="ltr" value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value.replace(/\D/g, '') })} placeholder="0" /></Field>
      <button className="btn brass wide" disabled={f.name.trim().length < 2} onClick={save}>سجّل</button>
      {p.id && <button className="btn ghost wide danger" onClick={() => remove('staff', p.id).then(() => { toast('تمسح'); close() }).catch(fail)}>{Ic.trash()} مسحو</button>}
    </Sheet>
  )
}
