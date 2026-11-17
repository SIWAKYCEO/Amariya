// What the business does (traiteur, neggafa, orchestra…): the app keeps the same base for everyone
// (calendar, bookings, deposits, devis, team, WhatsApp) and changes words, team roles, prices and the one extra section.
// An account can do more than one trade: roles and sections are joined, the first trade decides the words.
import { LANG } from './i18n'

// [darija, français, english]
const R = {
  serveur: ['سرباي', 'Serveur', 'Waiter'], neggafa: ['نكافة', 'Neggafa', 'Neggafa'], cuisine: ['كوزينة', 'Cuisine', 'Kitchen'], chef: ['شاف', 'Chef', 'Chef'],
  assist: ['مساعد', 'Assistant', 'Assistant'], porteur: ['حمّال العمارية', 'Porteur amariya', 'Amariya bearer'], makeup: ['ماكياج', 'Maquillage', 'Make-up'],
  photo: ['مصور', 'Photographe', 'Photographer'], video: ['فيديو', 'Vidéaste', 'Videographer'], drone: ['درون', 'Drone', 'Drone'], editor: ['مونتاج', 'Montage', 'Editor'],
  musician: ['موسيقي', 'Musicien', 'Musician'], singer: ['مغني', 'Chanteur', 'Singer'], dj: ['DJ', 'DJ', 'DJ'], dakka: ['الدقة', 'Dakka', 'Dakka'], tech: ['الصوت والضو', 'Son & lumière', 'Sound & light'],
  patissier: ['حلواني', 'Pâtissier', 'Pastry cook'], livreur: ['ليفرور', 'Livreur', 'Delivery'],
  deco: ['ديكوراتور', 'Décorateur', 'Decorator'], monteur: ['مونتور', 'Monteur', 'Setup crew'], driver: ['سائق', 'Chauffeur', 'Driver'],
  security: ['عساس', 'Sécurité', 'Security'], menage: ['النضافة', 'Ménage', 'Cleaning'],
  couturiere: ['خياطة', 'Couturière', 'Tailor'], vendeuse: ['بائعة', 'Vendeuse', 'Sales'], nekacha: ['نقاشة', 'Naqasha', 'Henna artist'],
  other: ['آخر', 'Autre', 'Other'],
}
const RPL = {
  serveur: ['السرباية', 'Serveurs', 'Waiters'], neggafa: ['النكافات', 'Neggafas', 'Neggafas'], cuisine: ['الكوزينة', 'Cuisine', 'Kitchen'], chef: ['الشاف', 'Chef', 'Chef'],
  assist: ['المساعدين', 'Assistants', 'Assistants'], porteur: ['حمّالة العمارية', 'Porteurs', 'Bearers'], makeup: ['الماكياج', 'Maquillage', 'Make-up'],
  photo: ['المصورين', 'Photographes', 'Photographers'], video: ['الفيديو', 'Vidéastes', 'Videographers'], drone: ['الدرون', 'Drone', 'Drone'], editor: ['المونتاج', 'Montage', 'Editors'],
  musician: ['الموسيقيين', 'Musiciens', 'Musicians'], singer: ['المغنيين', 'Chanteurs', 'Singers'], dj: ['DJ', 'DJ', 'DJ'], dakka: ['الدقة', 'Dakka', 'Dakka'], tech: ['الصوت والضو', 'Son & lumière', 'Sound & light'],
  patissier: ['الحلوانية', 'Pâtissiers', 'Pastry cooks'], livreur: ['الليفرورات', 'Livreurs', 'Delivery'],
  deco: ['الديكوراتورات', 'Décorateurs', 'Decorators'], monteur: ['المونتورات', 'Monteurs', 'Setup crew'], driver: ['السائقين', 'Chauffeurs', 'Drivers'],
  security: ['العساسة', 'Sécurité', 'Security'], menage: ['النضافة', 'Ménage', 'Cleaning'],
  couturiere: ['الخياطات', 'Couturières', 'Tailors'], vendeuse: ['البائعات', 'Vendeuses', 'Sales'], nekacha: ['النقاشات', 'Naqashas', 'Henna artists'],
  other: ['آخرين', 'Autres', 'Others'],
}

// k: [name, the trade (for messages), the bundle word, its plural]
// guests: the number of guests matters · perGuest: price per guest by default · food: menus, shopping list, food cost
// stock: what goes out and comes back (null = no stock section) · delivery: album/video handed over after the wedding
export const TRADES = {
  tr: { name: ['تريتور', 'Traiteur', 'Caterer'], the: ['التريتور', 'le traiteur', 'the caterer'], pkg: ['المينو', 'Menu', 'Menu'], pkgs: ['المينوهات', 'Menus', 'Menus'], guests: true, perGuest: true, food: true, stock: ['الماتريال', 'Matériel', 'Equipment'], stockHint: ['الطباسل، الكيسان، الطيفورات…', 'Plats, verres, plateaux…', 'Plates, glasses, trays…'], roles: ['serveur', 'neggafa', 'cuisine', 'chef', 'other'], quick: ['نكافة', 'العمارية', 'ديكور', 'التصوير', 'الحلويات', 'الدقايقية'] },
  hall: { name: ['قاعة الأفراح', 'Salle des fêtes', 'Wedding venue'], the: ['القاعة', 'la salle', 'the venue'], pkg: ['الباقة', 'Formule', 'Package'], pkgs: ['الباقات', 'Formules', 'Packages'], guests: true, stock: ['الماتريال', 'Matériel', 'Equipment'], stockHint: ['الكراسي، الطابلات، الزرابي…', 'Chaises, tables, tapis…', 'Chairs, tables, rugs…'], roles: ['serveur', 'menage', 'security', 'tech', 'other'], quick: ['الضو والصوت', 'الديكور', 'العساسة', 'سوايع زايدين', 'الباركينغ'] },
  negg: { name: ['نكافة', 'Neggafa', 'Neggafa'], the: ['النكافة', 'la neggafa', 'the neggafa'], pkg: ['الباقة', 'Formule', 'Package'], pkgs: ['الباقات', 'Formules', 'Packages'], stock: ['الكسوات', 'Tenues', 'Outfits'], stockHint: ['التكاشط، القفاطن، العمارية، الحلي…', 'Takchitas, caftans, amariya, bijoux…', 'Takchitas, caftans, amariya, jewels…'], roles: ['neggafa', 'assist', 'porteur', 'makeup', 'other'], quick: ['كسوة زايدة', 'العمارية', 'الميدا', 'الماكياج', 'الحلي'] },
  photo: { name: ['مصور / فيديو', 'Photo / vidéo', 'Photo / video'], the: ['المصور', 'le photographe', 'the photographer'], pkg: ['الباقة', 'Formule', 'Package'], pkgs: ['الباقات', 'Formules', 'Packages'], stock: ['الماتريال', 'Matériel', 'Equipment'], stockHint: ['الكاميرات، الضو، الدرون…', 'Caméras, lumières, drone…', 'Cameras, lights, drone…'], delivery: true, roles: ['photo', 'video', 'drone', 'editor', 'assist', 'other'], quick: ['ألبوم زايد', 'درون', 'كليب قصير', 'صور الحنة', 'فلاش ديسك'] },
  music: { name: ['أوركسترا / DJ', 'Orchestre / DJ', 'Band / DJ'], the: ['الأوركسترا', "l'orchestre", 'the band'], pkg: ['الباقة', 'Formule', 'Package'], pkgs: ['الباقات', 'Formules', 'Packages'], stock: ['الآلات', 'Instruments', 'Instruments'], stockHint: ['السماعات، الميكروات، الآلات…', 'Enceintes, micros, instruments…', 'Speakers, mics, instruments…'], roles: ['musician', 'singer', 'dj', 'dakka', 'tech', 'other'], quick: ['الدقة المراكشية', 'عيساوة', 'DJ زايد', 'سوايع زايدين', 'الضو'] },
  sweet: { name: ['حلويات العرس', 'Pâtisserie', 'Wedding sweets'], the: ['محل الحلويات', 'la pâtisserie', 'the pastry shop'], pkg: ['الطلبية', 'Commande', 'Order'], pkgs: ['الطلبيات', 'Commandes', 'Orders'], roles: ['patissier', 'assist', 'livreur', 'other'], quick: ['الكعكة', 'كيلو زايد', 'الصواني', 'التوصيل'] },
  deco: { name: ['ديكور وتنظيم', 'Déco & organisation', 'Decor & planning'], the: ['الديكور', 'la déco', 'the decorator'], pkg: ['الباقة', 'Formule', 'Package'], pkgs: ['الباقات', 'Formules', 'Packages'], stock: ['الديكور', 'Déco', 'Decor items'], stockHint: ['الكوشات، الورد، الضو، الشمعدانات…', 'Kouchas, fleurs, lumières…', 'Stages, flowers, lights…'], roles: ['deco', 'monteur', 'driver', 'assist', 'other'], quick: ['الورد الطبيعي', 'الضو', 'المدخل', 'طابلة الحلويات'] },
  tent: { name: ['الخيام والكراسي', 'Tentes & chaises', 'Tents & chairs'], the: ['الخيام', 'les tentes', 'the tents'], pkg: ['الباقة', 'Formule', 'Package'], pkgs: ['الباقات', 'Formules', 'Packages'], guests: true, stock: ['الماتريال', 'Matériel', 'Equipment'], stockHint: ['الخيام، الكراسي، الطابلات، الزرابي…', 'Tentes, chaises, tables, tapis…', 'Tents, chairs, tables, rugs…'], roles: ['monteur', 'driver', 'assist', 'other'], quick: ['الضو', 'الزرابي', 'الكليماتيزور', 'النقل'] },
  car: { name: ['طوموبيلات العرس', 'Voitures de mariage', 'Wedding cars'], the: ['كراء الطوموبيلات', 'la location', 'the car hire'], pkg: ['الباقة', 'Formule', 'Package'], pkgs: ['الباقات', 'Formules', 'Packages'], stock: ['الطوموبيلات', 'Voitures', 'Cars'], stockHint: ['كل طوموبيل وشحال عندك منها…', 'Chaque voiture et combien vous en avez…', 'Each car and how many you have…'], roles: ['driver', 'assist', 'other'], quick: ['سوايع زايدين', 'الزواق', 'طوموبيل زايدة', 'الكيلومترات'] },
  caftan: { name: ['القفاطن والخياطة', 'Caftans & couture', 'Caftans & tailoring'], the: ['المحل', 'la boutique', 'the shop'], pkg: ['الباقة', 'Formule', 'Package'], pkgs: ['الباقات', 'Formules', 'Packages'], stock: ['القفاطن', 'Caftans', 'Caftans'], stockHint: ['كل موديل وشحال عندك منو…', 'Chaque modèle et combien vous en avez…', 'Each model and how many you have…'], roles: ['couturiere', 'vendeuse', 'assist', 'other'], quick: ['التعديل', 'الإكسسوارات', 'قفطان زايد', 'التوصيل'] },
  henna: { name: ['نقاشة', 'Henné (naqasha)', 'Henna artist'], the: ['النقاشة', 'la naqasha', 'the henna artist'], pkg: ['الباقة', 'Formule', 'Package'], pkgs: ['الباقات', 'Formules', 'Packages'], roles: ['nekacha', 'assist', 'other'], quick: ['بنات زايدين', 'الصينية', 'النقش الخليجي', 'التنقل'] },
  other: { name: ['خدمة الأعراس', 'Services mariage', 'Wedding services'], the: ['الخدمة', 'le prestataire', 'the provider'], pkg: ['الباقة', 'Formule', 'Package'], pkgs: ['الباقات', 'Formules', 'Packages'], stock: ['الماتريال', 'Matériel', 'Equipment'], stockHint: ['كل حاجة كتخرج وكترجع…', 'Tout ce qui sort et revient…', 'Everything that goes out and comes back…'], roles: ['assist', 'driver', 'other'], quick: ['التنقل', 'سوايع زايدين', 'حاجة زايدة'] },
}
export const TRADE_KEYS = Object.keys(TRADES)

const IX = () => (LANG === 'fr' ? 1 : LANG === 'en' ? 2 : 0)
export const L = (v) => (Array.isArray(v) ? v[IX()] ?? v[0] : v)

// the current account (set when the store loads the traiteur; public pages set it from their data)
let CUR = { list: ['tr'], rules: {} }
export function setTrade(t) {
  const list = (Array.isArray(t?.trades) && t.trades.length ? t.trades : [t?.trade || 'tr']).filter((k) => TRADES[k])
  const first = TRADES[t?.trade] ? t.trade : list[0] || 'tr'
  CUR = { list: [first, ...list.filter((k) => k !== first)], rules: t?.rules || {}, perGuest: t?.per_guest }
  fillRoles()
}
export const tradeKey = () => CUR.list[0]
export const trades = () => CUR.list
export const T = () => TRADES[CUR.list[0]]
export const hasTrade = (k) => CUR.list.includes(k)
export const isTraiteur = () => hasTrade('tr')
export const anyOf = (f) => CUR.list.some((k) => TRADES[k][f])
// words
export const tradeName = (k = CUR.list[0]) => L(TRADES[k].name)
export const theTrade = () => L(T().the)
export const pkgWord = () => L(T().pkg)
export const pkgsWord = () => L(T().pkgs)
// what the account sells: the price is per guest (traiteur) or one price for the whole night
export function perGuest() {
  const r = CUR.rules?.perGuest
  if (r === true || r === false) return r
  if (CUR.perGuest === true || CUR.perGuest === false) return CUR.perGuest
  return !!T().perGuest
}
export const usesGuests = () => perGuest() || anyOf('guests')
export const usesFood = () => isTraiteur()
export const delivery = () => anyOf('delivery')
// the stock section belongs to the first trade that has one
export function stockOf() { const k = CUR.list.find((x) => TRADES[x].stock); return k ? TRADES[k] : null }
export const stockWord = () => L(stockOf()?.stock || TRADES.other.stock)
export const stockHint = () => L(stockOf()?.stockHint || TRADES.other.stockHint)
export const quickExtras = () => [...new Set(CUR.list.flatMap((k) => TRADES[k].quick))].slice(0, 7)

// roles: one object the whole app already imports (util.ROLES / ROLES_PL); refilled in place on every trade change
export const ROLES = {}
export const ROLES_PL = {}
function fillRoles(ix = IX()) {
  const keys = [...new Set([...CUR.list.flatMap((k) => TRADES[k].roles.filter((r) => r !== 'other')), 'other'])]
  for (const o of [ROLES, ROLES_PL]) for (const k of Object.keys(o)) delete o[k]
  for (const k of keys) { ROLES[k] = R[k][ix] ?? R[k][0]; ROLES_PL[k] = RPL[k][ix] ?? RPL[k][0] }
}
fillRoles(0) // module start: the language is read later, when the account loads
// a role saved by another trade (e.g. after changing trade) still shows its name
export const roleName = (k) => (R[k] ? L(R[k]) : k)
export const rolePl = (k) => (RPL[k] ? L(RPL[k]) : k)
export const defaultRole = () => Object.keys(ROLES)[0]
// the people a wedding cannot happen without, per trade (shown in "is it ready?")
export function keyRoles() {
  const k = CUR.list[0]
  return { negg: ['neggafa'], photo: ['photo', 'video'], music: ['musician', 'singer', 'dj'], sweet: ['patissier'], deco: ['deco', 'monteur'], tent: ['monteur'], car: ['driver'], caftan: [], henna: ['nekacha'], hall: [], other: [], tr: [] }[k] || []
}

// words of the traiteur app that change with the trade, applied on top of whatever the screen shows
// (darija, français or english). Traiteur alone: nothing to change.
let VC = null, VK = ''
export const vocabOn = () => CUR.list[0] !== 'tr'
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// one pass with one regex: a replaced word is never replaced again
export function vocab() {
  const key = CUR.list.join(',') + IX()
  if (VK === key) return VC
  VK = key
  if (!vocabOn()) return (VC = null)
  const t = T(), i = IX(), st = (stockOf() || TRADES.other).stock
  const low = (x) => x.toLowerCase(), up = (x) => x[0].toUpperCase() + x.slice(1)
  const noAl = (x) => x.replace(/^ال/, '')
  let pairs
  if (i === 0) {
    pairs = [['المينوهات', t.pkgs[0]], ['المينوات', t.pkgs[0]], ['المينو', t.pkg[0]], ['مينو', noAl(t.pkg[0])],
      ['التريتورات', 'الخدمات'], ['التريتور', t.the[0]], ['تريتور', t.name[0]], ['الماتريال', st[0]], ['ماتريال', noAl(st[0])]]
  } else if (i === 1) {
    pairs = [['Menus', t.pkgs[1]], ['menus', low(t.pkgs[1])], ['Menu', t.pkg[1]], ['menu', low(t.pkg[1])],
      ['Le traiteur', up(t.the[1])], ['le traiteur', t.the[1]], ['Traiteurs', 'Prestataires'], ['traiteurs', 'prestataires'], ['Traiteur', t.name[1]], ['traiteur', low(t.name[1])],
      ...(/s$/.test(st[1]) ? [['le matériel', 'les ' + low(st[1])], ['Le matériel', 'Les ' + low(st[1])], ['du matériel', 'des ' + low(st[1])], ['votre matériel', 'vos ' + low(st[1])], ['Votre matériel', 'Vos ' + low(st[1])]] : []),
      ['Matériel', st[1]], ['matériel', low(st[1])]]
  } else {
    pairs = [['Menus', t.pkgs[2]], ['menus', low(t.pkgs[2])], ['Menu', t.pkg[2]], ['menu', low(t.pkg[2])],
      ['The caterer', up(t.the[2])], ['the caterer', t.the[2]], ['Caterers', 'Providers'], ['caterers', 'providers'], ['Caterer', t.name[2]], ['caterer', low(t.name[2])],
      ['Equipment', st[2]], ['equipment', low(st[2])]]
  }
  pairs = pairs.filter(([a, b]) => a !== b)
  const map = new Map(pairs)
  const alt = pairs.map(([a]) => a).sort((x, y) => y.length - x.length).map(esc).join('|')
  VC = { re: new RegExp(i === 0 ? `(${alt})` : `(?<![\\p{L}])(${alt})(?![\\p{L}])`, i === 0 ? 'g' : 'gu'), map }
  return VC
}
export function applyVocab(s) {
  if (!vocabOn() || !s) return s
  const v = vocab()
  return v ? s.replace(v.re, (m) => v.map.get(m) ?? m) : s
}

// starting bundles of a new account (the same ones the sign-up writes in the database)
export const PKG_SEEDS = {
  hall: [['نص الليلة', 8000, ['القاعة', 'الكراسي والطابلات', 'الضو والصوت']], ['الليلة كاملة', 15000, ['القاعة', 'الكراسي والطابلات', 'الضو والصوت', 'النضافة', 'العساسة']]],
  negg: [['العادية', 6000, ['3 ديال الكسوات', 'العمارية', 'النكافة ومساعدة']], ['الملكية', 12000, ['7 ديال الكسوات', 'العمارية والميدا', 'النكافة و2 مساعدات', 'الحلي والتاج']]],
  photo: [['التصوير', 4000, ['مصور', '300 صورة معدّلة']], ['تصوير وفيديو', 9000, ['مصور وفيديو', 'ألبوم', 'فيديو العرس كامل', 'كليب قصير']]],
  music: [['DJ', 3500, ['DJ', 'الصوت والضو']], ['الأوركسترا كاملة', 9000, ['6 موسيقيين ومغني', 'الصوت والضو', 'الدقة']]],
  sweet: [['الصينية الصغيرة', 1500, ['حلويات بلدية', '5 كيلو']], ['الطبلة الكبيرة', 4000, ['حلويات بلدية وعصرية', '15 كيلو', 'الكعكة']]],
  deco: [['ديكور بسيط', 3000, ['الكوشة', 'الورد', 'طابلة العروسة']], ['ديكور كامل', 8000, ['الكوشة', 'الورد', 'الضو', 'الطابلات', 'المدخل']]],
  tent: [['خيمة صغيرة', 5000, ['خيمة 100 ضيف', 'الكراسي والطابلات']], ['خيمة كبيرة', 12000, ['خيمة 300 ضيف', 'الكراسي والطابلات', 'الضو', 'الزرابي']]],
  car: [['طوموبيل العروسة', 1500, ['طوموبيل مزوّقة', 'سائق', '4 سوايع']], ['الموكب', 4000, ['3 طوموبيلات', 'السائقين', 'الزواق']]],
  caftan: [['كراء قفطان', 800, ['قفطان واحد', 'التعديل']], ['3 قفاطن', 2000, ['3 قفاطن', 'التعديل', 'الإكسسوارات']]],
  henna: [['نقش العروسة', 800, ['اليدين والرجلين']], ['ليلة الحنة', 2000, ['العروسة', '10 ديال البنات', 'الصينية']]],
  other: [['الباقة العادية', 2000, ['الخدمة الأساسية']], ['الباقة الكاملة', 5000, ['الخدمة كاملة']]],
}
// demo only: what each trade keeps in stock
export const STOCK_SEEDS = {
  hall: [['الكراسي', 400], ['الطابلات', 40], ['الزرابي', 30]], negg: [['التكاشط', 25], ['القفاطن', 15], ['العمارية', 2], ['الحلي', 10]],
  photo: [['الكاميرات', 4], ['الضو', 6], ['الدرون', 1]], music: [['السماعات', 8], ['الميكروات', 10], ['الأورغ', 2]],
  deco: [['الكوشات', 3], ['الشمعدانات', 40], ['الورد الصناعي', 200]], tent: [['الخيام', 6], ['الكراسي', 600], ['الطابلات', 60]],
  car: [['مرسيدس بيضا', 2], ['رانج روفر', 1], ['كات كات', 2]], caftan: [['قفطان ملكي', 6], ['تكشيطة', 12], ['قفطان فاسي', 4]], other: [['الماتريال', 20]],
}
