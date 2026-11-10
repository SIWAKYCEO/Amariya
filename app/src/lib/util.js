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
  b: CDN + 'd3a5b05a-4df5-43bb-bb18-dd06367e5f21.jpg',
  c: CDN + '42a4e807-5569-462e-85aa-475773630618.jpg',
}
const ROT = [PHOTOS.hall, PHOTOS.amariya, PHOTOS.b, PHOTOS.c, PHOTOS.a]
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
