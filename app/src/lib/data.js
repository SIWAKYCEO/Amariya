// Data layer: one store for the whole traiteur (a few hundred rows at most), loaded once,
// kept in memory, every change written to Supabase (or to localStorage in demo mode).
import { createClient } from '@supabase/supabase-js'
import { useSyncExternalStore } from 'react'
import { demoSeed } from './seed'
import { dayKey } from './util'

export const SUPABASE_URL = 'https://tonxmajfvgflvlkkutou.supabase.co'
export const SUPABASE_KEY = 'sb_publishable__qWxALxtce2El0zEMW-5Lg_c_tbiEKC'

export const isDemo = import.meta.env.VITE_DEMO === '1' || new URLSearchParams(location.search).has('demo')
export const supabase = isDemo ? null : createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'amariya-auth' },
})

const TABLES = { packages: 'amr_packages', weddings: 'amr_weddings', payments: 'amr_payments', staff: 'amr_staff', assignments: 'amr_assignments', expenses: 'amr_expenses', requests: 'amr_requests', proofs: 'amr_proofs', items: 'amr_items', witems: 'amr_wedding_items' }
const empty = () => ({ traiteur: null, me: null, packages: [], weddings: [], payments: [], staff: [], assignments: [], expenses: [], requests: [], proofs: [], items: [], witems: [] })

let state = empty()
const subs = new Set()
const emit = () => { if (isDemo) try { localStorage.setItem('amariya-demo', JSON.stringify(state)) } catch { /* */ } ; subs.forEach((f) => f()) }
const set = (patch) => { state = { ...state, ...patch }; emit() }
export const useStore = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => state)
export const getState = () => state

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random())

/* ---------- auth ---------- */
export async function redeem(token) {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/amariya-redeem`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
  })
  if (!r.ok) throw new Error(r.status === 404 ? 'expired' : 'failed')
  const { token_hash } = await r.json()
  const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })
  if (error) throw error
}

export async function load() {
  if (isDemo) {
    let saved = null
    try { saved = JSON.parse(localStorage.getItem('amariya-demo')) } catch { /* */ }
    state = saved?.traiteur ? { ...empty(), ...saved } : demoSeed()
    // ?demo=1&pro=1 → everything open (director view); ?demo=1&free=1 → what a new traiteur sees
    const q = new URLSearchParams(location.search)
    if (q.has('pro')) state.traiteur = { ...state.traiteur, plan: 'premium', plan_until: null }
    if (q.has('free')) state.traiteur = { ...state.traiteur, plan: 'free', plan_until: null }
    emit()
    return true
  }
  const { data: s } = await supabase.auth.getSession()
  if (!s.session) return false
  const { data: me, error } = await supabase.from('amr_members').select('*, traiteur:amr_traiteurs(*)').eq('user_id', s.session.user.id).single()
  if (error || !me) return false
  const keys = Object.keys(TABLES)
  const res = await Promise.all(keys.map((k) => supabase.from(TABLES[k]).select('*').order('created_at')))
  const next = { me, traiteur: me.traiteur }
  // material tables are optional: an error there must never block the app
  res.forEach((r, i) => { if (r.error) { if (keys[i] === 'items' || keys[i] === 'witems') { next[keys[i]] = []; return } throw r.error } next[keys[i]] = r.data })
  state = { ...empty(), ...next }
  emit()
  return true
}

export async function logout() {
  if (isDemo) { localStorage.removeItem('amariya-demo'); location.href = location.pathname; return }
  await supabase.auth.signOut()
  location.reload()
}

/* ---------- generic writes (optimistic) ---------- */
export async function add(kind, row) {
  const full = { id: uid(), created_at: new Date().toISOString(), ...row }
  if (!isDemo) full.traiteur_id = state.traiteur.id
  set({ [kind]: [...state[kind], full] })
  if (!isDemo) {
    const { error } = await supabase.from(TABLES[kind]).insert(full)
    if (error) { set({ [kind]: state[kind].filter((x) => x.id !== full.id) }); throw error }
  }
  return full
}
export async function update(kind, id, patch) {
  const before = state[kind].find((x) => x.id === id)
  set({ [kind]: state[kind].map((x) => (x.id === id ? { ...x, ...patch } : x)) })
  if (!isDemo) {
    const { error } = await supabase.from(TABLES[kind]).update(patch).eq('id', id)
    if (error) { set({ [kind]: state[kind].map((x) => (x.id === id ? before : x)) }); throw error }
  }
}
export async function remove(kind, id) {
  const before = state[kind]
  const drop = { [kind]: before.filter((x) => x.id !== id) }
  if (kind === 'weddings') {
    drop.payments = state.payments.filter((p) => p.wedding_id !== id)
    drop.assignments = state.assignments.filter((a) => a.wedding_id !== id)
    drop.witems = state.witems.filter((x) => x.wedding_id !== id)
  }
  if (kind === 'items') drop.witems = state.witems.filter((x) => x.item_id !== id)
  set(drop)
  if (!isDemo) {
    const { error } = await supabase.from(TABLES[kind]).delete().eq('id', id)
    if (error) { set({ [kind]: before }); throw error }
  }
}
export async function saveTraiteur(patch) {
  const before = state.traiteur
  set({ traiteur: { ...before, ...patch } })
  if (!isDemo) {
    const { error } = await supabase.from('amr_traiteurs').update(patch).eq('id', before.id)
    if (error) { set({ traiteur: before }); throw error }
  }
}

/* ---------- plans: free · pro · premium ---------- */
export function planOf(t = state.traiteur) {
  const p = t?.plan || 'free'
  if (p !== 'free' && t.plan_until && new Date(t.plan_until) < new Date()) return 'free'
  return p
}
export const isPro = (t = state.traiteur) => planOf(t) !== 'free'
export const PRICES = { pro: 150, premium: 350, ultra: 990 }
export const PLAN_NAME = { free: 'المجاني', pro: 'Pro', premium: 'Premium', ultra: 'Ultra' }
export const SALES_WA = '212621287405'
// message ready for our WhatsApp: who is asking, which plan, which feature they wanted
export function planWaText(plan, feature) {
  const t = state.traiteur || {}
  const name = PLAN_NAME[plan]
  return [`السلام عليكم Amariya 👋`, `بغيت نفعّل ${name} (${PRICES[plan]} درهم فالشهر).`, feature && `بغيت خصوصا: ${feature}.`, t.name && `التريتور: ${t.name}${t.city ? ' · ' + t.city : ''}`, 'كيفاش نخلّص؟'].filter(Boolean).join('\n')
}
export const planWaLink = (plan, feature) => `https://wa.me/${SALES_WA}?text=${encodeURIComponent(planWaText(plan, feature))}`
// opens our WhatsApp and records the request (dashboard sees it); the demo just turns the plan on
export async function wantPlan(plan, feature) {
  if (isDemo) return askPlan(plan)
  window.open(planWaLink(plan, feature), '_blank', 'noopener')
  askPlan(plan).catch(() => {})
  return 'wa'
}

export async function askPlan(plan) {
  if (isDemo) { set({ traiteur: { ...state.traiteur, plan, plan_until: null } }); return 'demo' }
  const { error } = await supabase.from('amr_plan_requests').insert({ traiteur_id: state.traiteur.id, plan })
  if (error) throw error
  try { localStorage.setItem('amariya-asked-' + plan, String(Date.now())) } catch { /* */ }
  return 'asked'
}
export const askedPlan = (plan) => { try { return +localStorage.getItem('amariya-asked-' + plan) || 0 } catch { return 0 } }

/* ---------- staff pay ---------- */
// nights a person worked (status ok, wedding passed) that are not paid yet
export function owedOf(s = state) {
  const today = dayKey(new Date())
  const rows = s.assignments.filter((a) => a.status === 'ok' && !a.paid_at).map((a) => ({ a, w: s.weddings.find((x) => x.id === a.wedding_id) }))
    .filter(({ w }) => w && w.status !== 'cancelled' && w.day <= today)
  const by = new Map()
  for (const { a, w } of rows) {
    const p = s.staff.find((x) => x.id === a.staff_id)
    if (!p) continue
    const o = by.get(p.id) || { p, nights: [], total: 0 }
    o.nights.push({ a, w }); o.total += +a.pay || 0
    by.set(p.id, o)
  }
  return [...by.values()].sort((x, y) => y.total - x.total)
}
export async function payStaff(o) {
  const at = new Date().toISOString()
  for (const { a } of o.nights) await update('assignments', a.id, { paid_at: at })
}

/* ---------- material ---------- */
// how many of each item are out right now (sent to a wedding and not back yet)
export function stockOf(item, s = state) {
  const rows = s.witems.filter((x) => x.item_id === item.id)
  const out = rows.filter((x) => x.qty_back == null).reduce((a, x) => a + (+x.qty_out || 0), 0)
  const broken = rows.reduce((a, x) => a + (+x.broken || 0), 0)
  return { out, broken, free: Math.max(0, (+item.qty || 0) - out) }
}
// material of a wedding, with what is missing on the same day (other weddings use the same items)
export function weddingItemsOf(w, s = state) {
  return s.witems.filter((x) => x.wedding_id === w.id).map((x) => {
    const item = s.items.find((i) => i.id === x.item_id)
    if (!item) return null
    const sameDay = s.witems.filter((y) => y.item_id === x.item_id && y.wedding_id !== w.id && s.weddings.find((ww) => ww.id === y.wedding_id && ww.day === w.day && ww.status !== 'cancelled'))
    const used = sameDay.reduce((a, y) => a + (+y.qty_out || 0), 0) + (+x.qty_out || 0)
    return { ...x, item, short: Math.max(0, used - (+item.qty || 0)), missing: x.qty_back == null ? 0 : Math.max(0, (+x.qty_out || 0) - (+x.qty_back || 0) - (+x.broken || 0)) }
  }).filter(Boolean)
}

/* ---------- business rules ---------- */
export const extrasSum = (w) => (w.extras || []).reduce((s, e) => s + (+e.amount || 0), 0)
export const totalOf = (w) => Math.round((+w.guests || 0) * (+w.price || 0) + extrasSum(w))
export const paidOf = (w, payments = state.payments) => payments.filter((p) => p.wedding_id === w.id).reduce((s, p) => s + (+p.amount || 0), 0)
export const restOf = (w, payments) => Math.max(0, totalOf(w) - paidOf(w, payments))
// one serveur every 20 guests, at least 2
export const serveursNeeded = (w) => Math.max(2, Math.ceil((+w.guests || 0) / 20))

export function teamOf(w, s = state) {
  const rows = s.assignments.filter((a) => a.wedding_id === w.id).map((a) => ({ ...a, person: s.staff.find((p) => p.id === a.staff_id) })).filter((a) => a.person)
  const serveursOk = rows.filter((a) => a.person.role === 'serveur' && a.status === 'ok').length
  return { rows, serveursOk, need: serveursNeeded(w) }
}

// what is wrong with a wedding, in order of urgency (only these get the henna colour)
export function problemsOf(w, s = state) {
  if (w.status === 'cancelled' || w.status === 'done') return []
  const out = []
  const paid = paidOf(w, s.payments)
  if (paid <= 0) out.push('noArboun')
  const t = teamOf(w, s)
  if (t.serveursOk < t.need) out.push('serveurs')
  if (t.rows.some((a) => a.status === 'no')) out.push('refused')
  return out
}

// how ready a wedding is: the 4 things a traiteur checks before the night
export function readinessOf(w, s = state) {
  const t = teamOf(w, s)
  const ok = (role) => t.rows.some((a) => a.person.role === role && a.status === 'ok')
  const items = [
    ['العربون', paidOf(w, s.payments) > 0],
    ['السرباية', t.serveursOk >= t.need],
    ['النكافة', ok('neggafa')],
    ['الكوزينة', ok('cuisine') || ok('chef')],
  ]
  return { items, done: items.filter((i) => i[1]).length, total: items.length }
}

// shopping estimate from the menu × guests (rough ratios a traiteur can adjust by eye)
const BUY = [
  [/بسطيلة|البسطيلة/, 'البسطيلة', (g) => Math.ceil(g / 10), 'كبيرة'],
  [/دجاج/, 'الدجاج', (g) => Math.ceil(g / 4), 'دجاجة'],
  [/مشوي|لحم|خروف|طاجين/, 'اللحم', (g) => Math.round(g * 0.3), 'كيلو'],
  [/حوت/, 'الحوت', (g) => Math.round(g * 0.12), 'كيلو'],
  [/فواكه/, 'الفواكه', (g) => Math.round(g * 0.35), 'كيلو'],
  [/حلويات/, 'الحلويات', (g) => g * 8, 'حبة'],
  [/أتاي|اتاي/, 'النعناع', (g) => Math.ceil(g / 25), 'ربطة'],
  [/عصير/, 'العصير', (g) => Math.round(g * 0.3), 'لتر'],
]
// what the traiteur pays for each unit of the shopping list (he can change them in the app)
export const PRICE_DEFAULTS = { 'البسطيلة': 220, 'الدجاج': 45, 'اللحم': 100, 'الحوت': 70, 'الفواكه': 15, 'الحلويات': 2, 'النعناع': 5, 'العصير': 12, misc: 10 }
export const PRICE_UNITS = { 'البسطيلة': 'كبيرة', 'الدجاج': 'دجاجة', 'اللحم': 'كيلو', 'الحوت': 'كيلو', 'الفواكه': 'كيلو', 'الحلويات': 'حبة', 'النعناع': 'ربطة', 'العصير': 'لتر' }
export const MISC_LABEL = 'الزيت، العطرية، الخبز والبوطة'
export const priceOf = (label, s = state) => { const v = (s.traiteur?.costs || {})[label]; return v === undefined || v === '' ? PRICE_DEFAULTS[label] || 0 : +v }

export function shoppingOf(w, s = state) {
  const pkg = s.packages.find((p) => p.id === w.package_id)
  const items = pkg?.items || []
  const out = []
  // a pastilla already has its filling (chicken or fish) inside its price: it doesn't count twice
  const rest = items.filter((it) => !BUY[0][0].test(it))
  for (const [re, label, f, unit] of BUY) if ((label === 'البسطيلة' ? items : rest).some((it) => re.test(it)) && !out.some((o) => o.label === label)) {
    const qty = f(+w.guests || 0), price = priceOf(label, s)
    out.push({ label, qty, unit, price, cost: Math.round(qty * price) })
  }
  return out
}

// expenses the traiteur writes with these names are food: they replace the estimate
const FOOD_RE = /لحم|دجاج|خضر|فواك|حلوي|عطري|حوت|زيت|خبز|سكر|أتاي|اتاي|نعناع|عصير|ماكلة|سلعة/
export const isFood = (label) => FOOD_RE.test(label || '')

// real profit of one wedding: income minus food, staff and other costs of that night
export function profitOf(w, s = state) {
  const income = totalOf(w)
  const guests = +w.guests || 0
  const shop = shoppingOf(w, s)
  const misc = Math.round(guests * priceOf('misc', s))
  const foodEst = shop.reduce((a, x) => a + x.cost, 0) + misc
  const linked = s.expenses.filter((e) => e.wedding_id === w.id)
  const foodReal = linked.filter((e) => isFood(e.label)).reduce((a, e) => a + +e.amount, 0)
  const other = linked.filter((e) => !isFood(e.label)).reduce((a, e) => a + +e.amount, 0)
  const past = w.status === 'done' || w.day < dayKey(new Date())
  const team = s.assignments.filter((a) => a.wedding_id === w.id && (past ? a.status === 'ok' : a.status !== 'no'))
  const staff = team.reduce((a, x) => a + (+x.pay || 0), 0)
  const food = foodReal > 0 ? foodReal : foodEst
  const net = income - food - staff - other
  return { income, food, foodEst, foodReal, estimated: foodReal <= 0, misc, shop, staff, staffCount: team.length, other, otherCount: linked.length - linked.filter((e) => isFood(e.label)).length, net, perGuest: guests ? Math.round(net / guests) : 0, pct: income ? Math.round((net / income) * 100) : 0, past }
}

/* ---------- public links, deposit proofs, reminders ---------- */
export const APP_URL = 'https://amariya-app.vercel.app'
export const devisLink = (w) => w.pub_token ? `${APP_URL}/d/${w.pub_token}` : ''
export const shopLink = (t = state.traiteur) => t?.slug ? `${APP_URL}/t/${t.slug}` : ''

// signed URL to look at a proof photo (private bucket)
export async function proofUrl(p) {
  if (isDemo || !p?.path) return p?.demo_url || null
  const { data } = await supabase.storage.from('amr-proofs').createSignedUrl(p.path, 600)
  return data?.signedUrl || null
}
// the traiteur accepts a proof: it becomes a real payment (arboun if it is the first one)
export async function acceptProof(p) {
  const w = state.weddings.find((x) => x.id === p.wedding_id)
  const first = w && paidOf(w) <= 0
  const pay = await add('payments', { wedding_id: p.wedding_id, amount: +p.amount, kind: first ? 'arboun' : 'payment', paid_on: dayKey(new Date()), note: 'وصل من الكليان' })
  await update('proofs', p.id, { status: 'ok', payment_id: pay.id })
  if (w?.status === 'devis') await update('weddings', w.id, { status: 'confirmed' })
  return pay
}

// balance reminders: 7 days before (stage d7) and the day before / same day (stage d1)
export function remindersDue(s = state) {
  const out = []
  for (const w of s.weddings) {
    if (w.status === 'cancelled' || w.status === 'done' || w.status === 'devis' || !w.phone) continue
    const n = Math.round((new Date(w.day + 'T00:00') - new Date(new Date().toDateString())) / 86400000)
    const rest = restOf(w, s.payments)
    if (rest <= 0 || n < 0 || n > 7) continue
    const stage = n <= 1 ? 'd1' : 'd7'
    if ((w.reminded || {})[stage]) continue
    out.push({ w, rest, stage, n })
  }
  return out.sort((a, b) => a.n - b.n)
}
export const markReminded = (w, stage) => update('weddings', w.id, { reminded: { ...(w.reminded || {}), [stage]: new Date().toISOString() } })

// pull fresh requests / proofs (they arrive from the public pages while the app is open)
export async function refresh(kinds = ['requests', 'proofs']) {
  if (isDemo || !state.traiteur) return
  const res = await Promise.all(kinds.map((k) => supabase.from(TABLES[k]).select('*').order('created_at')))
  const patch = {}
  res.forEach((r, i) => { if (!r.error) patch[kinds[i]] = r.data })
  set(patch)
}
