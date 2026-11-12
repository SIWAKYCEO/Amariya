export const pad = (n) => String(n).padStart(2, '0')
export const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const todayKey = () => dayKey(new Date())
export const daysFromToday = (k) => Math.round((fromKey(k) - fromKey(todayKey())) / 86400000)

export const DAYS = ['الحد', 'الثنين', 'الثلاث', 'الربع', 'الخميس', 'الجمعة', 'السبت']
export const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر']

export function dayLabel(k, withDay = true) {
  const d = fromKey(k)
  return `${withDay ? DAYS[d.getDay()] + ' ' : ''}${d.getDate()} ${MONTHS[d.getMonth()]}`
}
export function relDay(k) {
  const n = daysFromToday(k)
  if (n === 0) return 'اليوم'
  if (n === 1) return 'غدا'
  if (n === -1) return 'البارح'
  if (n > 1 && n < 7) return DAYS[fromKey(k).getDay()]
  if (n >= 7) return `بعد ${n} يوم`
  return dayLabel(k, false)
}

export const money = (n) => Math.round(n || 0).toLocaleString('fr-FR').replace(/[  ]/g, ' ')

export function normPhone(raw) {
  if (!raw) return ''
  let s = String(raw).trim()
  const plus = s.startsWith('+') || s.startsWith('00')
  s = s.replace(/\D/g, '')
  if (s.startsWith('00')) s = s.slice(2)
  if (!plus && s.length === 10 && s.startsWith('0')) s = '212' + s.slice(1)
  if (!plus && s.length === 9 && /^[5-7]/.test(s)) s = '212' + s
  return s
}
export function prettyPhone(p) {
  if (!p) return ''
  if (p.startsWith('212') && p.length === 12) {
    const l = '0' + p.slice(3)
    return `${l.slice(0, 2)} ${l.slice(2, 4)} ${l.slice(4, 6)} ${l.slice(6, 8)} ${l.slice(8, 10)}`
  }
  return '+' + p
}
export const waLink = (phone, text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
export const telLink = (phone) => `tel:+${phone}`

// opens WhatsApp / phone; inside the native app (Capacitor) _system leaves the webview
export function openExternal(url) { window.open(url, '_system') || (location.href = url) }

const CDN = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3EwI7DLWorMb9W5PVQhWvn3Gxvb/'
export const PHOTOS = {
  hall: CDN + 'e86c486f-3b7d-4960-8ee7-97537b38271c.jpg',
  amariya: CDN + 'a20b1226-d2ee-485d-9819-badaf81d6b5b.jpg',
  kitchen: CDN + '59569914-f5b1-43be-a97b-1f352b0acb7a.jpg',
  a: CDN + '1fcdfa8b-cba8-4d91-b6f6-5d69119e5992.jpg',
  b: CDN + '39eba763-bc05-4665-aae3-ecdd5b2a33cb.jpg',
  c: CDN + '42a4e807-5569-462e-85aa-475773630618.jpg',
  // Gemini photos (nov 2026): hall at night, catering spread, bride hands, traiteur kitchen
  hall2: CDN + '5f90ae54-588e-4b9f-b796-16019e12a39e.jpg',
  food: CDN + '7d9edf02-6fff-43aa-a69d-415dc8ea2b93.jpg',
  bride: CDN + 'f5c6a91f-b8fd-40bf-aee5-4dd0ce89b714.jpg',
  prep: CDN + 'c463c508-3072-48bf-8037-947da6bf7291.jpg',
}
// square crops taken from the 572x1024 photos with CSS (no extra files)
const crop = (img, x, y, w) => ({ img, x, y, w })
export const CROPS = {
  meat: crop('prep', 15, 760, 170), chick: crop('prep', 190, 700, 180), veg: crop('prep', 10, 490, 180), spice: crop('prep', 425, 600, 140),
  sweet: crop('food', 358, 615, 214), pastilla: crop('food', 71, 645, 240), tajine: crop('food', 143, 372, 200),
}
export const cropStyle = (k) => {
  const c = CROPS[k]; if (!c) return {}
  const W = 572, H = 1024
  return { backgroundImage: `url(${PHOTOS[c.img]})`, backgroundSize: `${(W / c.w) * 100}% auto`, backgroundPosition: `${(c.x / (W - c.w)) * 100}% ${(c.y / (H - c.w)) * 100}%` }
}
// expense label -> photo crop
export const expenseCrop = (label = '') => /لحم|لحوم|غنم|خروف/.test(label) ? 'meat' : /دجاج|فراخ/.test(label) ? 'chick' : /خضر|فواكه/.test(label) ? 'veg' : /حلو|حلويات|سكر/.test(label) ? 'sweet' : /عطرية|توابل|زعفران/.test(label) ? 'spice' : null
const ROT = [PHOTOS.hall, PHOTOS.amariya, PHOTOS.b, PHOTOS.c, PHOTOS.a]
// first meaningful letter of a name (skips «عائلة», «الشاف», the article «ال»)
export const initial = (n = '') => { const w = n.replace(/^(عائلة|الشاف|للا|السيد|مدام)\s+/, '').trim(); return (w.replace(/^ال(?=\S{2})/, '') || w).slice(0, 1) }
export const photoFor = (id = '') => ROT[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % ROT.length]

export const ROLES = {
  serveur: 'سرباي',
  neggafa: 'نكافة',
  cuisine: 'كوزينة',
  chef: 'شاف',
  other: 'آخر',
}
export const ROLES_PL = { serveur: 'السرباية', neggafa: 'النكافة', cuisine: 'الكوزينة', chef: 'الشاف', other: 'آخرين' }

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'صباح الخير'
  if (h < 18) return 'السلام'
  return 'مسا الخير'
}
