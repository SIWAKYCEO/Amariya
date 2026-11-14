// Devis and contract as a real PDF (A4), drawn on canvas so the darija is shaped correctly,
// with the traiteur's logo and the Amariya look. One page for the devis, two for the contract.
import { jsPDF } from 'jspdf'
import { dayLabel, money, normPhone, prettyPhone } from './util'
import { paidOf, totalOf } from './data'

const C = { green: '#0F2A24', green2: '#173A32', ivory: '#F3EDE3', paper: '#FBF8F2', brass: '#C8A15A', brassL: '#F1E6CF', ink: '#14201D', mute: '#6E7A74', line: 'rgba(15,42,36,.12)', ok: '#2F7D5B' }
const AR = (w, s) => `${w} ${s}px Alexandria, system-ui, sans-serif`
const NUM = (w, s) => `${w} ${s}px "Bricolage Grotesque Variable", Alexandria, sans-serif`
const W = 1240, H = 1754, M = 96, R = W - M, L = M

function text(ctx, t, x, y, font, color, align = 'right', dir = 'rtl') {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.direction = dir; ctx.fillText(t, x, y)
  return ctx.measureText(t).width
}
function fit(ctx, t, x, y, f, size, color, max, align = 'right') {
  let s = size; ctx.font = f(s)
  while (ctx.measureText(t).width > max && s > 16) { s -= 2; ctx.font = f(s) }
  return text(ctx, t, x, y, f(s), color, align)
}
// wrap right-to-left text into lines of max width; returns the y after the last line
function para(ctx, t, x, y, font, color, max, lh) {
  ctx.font = font
  // keep numbers like "24 600" on one line
  const words = String(t).replace(/(\d) (?=\d)/g, '$1\u00A0').split(/ +/)
  let line = ''
  for (const wd of words) {
    const next = line ? line + ' ' + wd : wd
    if (ctx.measureText(next).width > max && line) { text(ctx, line, x, y, font, color); y += lh; line = wd } else line = next
  }
  if (line) { text(ctx, line, x, y, font, color); y += lh }
  return y
}
function dh(ctx, v, x, y, size, color, weight = 700, align = 'left') {
  const a = money(v), small = Math.round(size * 0.5)
  ctx.font = NUM(weight, size); const wa = ctx.measureText(a).width
  ctx.font = NUM(600, small); const wd = ctx.measureText(' DH').width
  const x0 = align === 'left' ? x : x - wa - wd
  text(ctx, a, x0, y, NUM(weight, size), color, 'left', 'ltr')
  text(ctx, ' DH', x0 + wa, y, NUM(600, small), color, 'left', 'ltr')
  return wa + wd
}
const rr = (ctx, x, y, w, h, r, fill) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill() }
function star(ctx, x, y, r, color, hole) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = color
  const sq = (a) => { ctx.save(); ctx.rotate(a); ctx.fillRect(-r * 0.707, -r * 0.707, r * 1.414, r * 1.414); ctx.restore() }
  sq(0); sq(Math.PI / 4)
  if (hole) { ctx.fillStyle = hole; ctx.beginPath(); ctx.arc(0, 0, r * 0.42, 0, 7); ctx.fill() }
  ctx.restore()
}
async function img(src) {
  if (!src) return null
  try { const i = new Image(); i.crossOrigin = 'anonymous'; i.src = src; await i.decode(); return i } catch { return null }
}

function header(ctx, { tr, logo, title, no, date, small }) {
  const h = small ? 190 : 300
  ctx.fillStyle = C.green; ctx.fillRect(0, 0, W, h)
  // zellige star watermark
  ctx.globalAlpha = 0.06; star(ctx, 40, h / 2, small ? 110 : 170, C.brass, C.green); ctx.globalAlpha = 1
  const ls = small ? 92 : 132, ly = (h - ls) / 2
  let nameR = R
  if (logo) {
    ctx.save(); ctx.beginPath(); ctx.roundRect(R - ls, ly, ls, ls, 28); ctx.fillStyle = C.ivory; ctx.fill(); ctx.clip()
    const k = Math.min(ls / logo.width, ls / logo.height) * 0.86
    ctx.drawImage(logo, R - ls / 2 - (logo.width * k) / 2, ly + ls / 2 - (logo.height * k) / 2, logo.width * k, logo.height * k)
    ctx.restore(); nameR = R - ls - 34
  }
  fit(ctx, tr?.name || 'التريتور', nameR, h / 2 + (small ? 4 : -4), (s) => AR(900, s), small ? 40 : 56, C.ivory, nameR - L - 380)
  if (!small) {
    let x = nameR
    if (tr?.city) x -= text(ctx, tr.city, x, h / 2 + 52, AR(500, 27), 'rgba(243,237,227,.7)') + 18
    if (tr?.city && tr?.phone) x -= text(ctx, '·', x, h / 2 + 52, AR(500, 27), 'rgba(243,237,227,.5)') + 18
    if (tr?.phone) text(ctx, prettyPhone(tr.phone), x, h / 2 + 52, NUM(600, 26), 'rgba(243,237,227,.7)', 'right', 'ltr')
  }
  // document title on the left
  text(ctx, title, L, h / 2 + (small ? 6 : -2), AR(900, small ? 46 : 62), C.brass, 'left')
  if (!small) {
    text(ctx, no, L, h / 2 + 50, NUM(600, 24), 'rgba(243,237,227,.6)', 'left', 'ltr')
    text(ctx, date, L, h / 2 + 88, AR(500, 23), 'rgba(243,237,227,.6)', 'left')
  }
  return h
}
function footer(ctx, page, pages) {
  ctx.fillStyle = C.line; ctx.fillRect(L, H - 96, R - L, 2)
  text(ctx, 'مصاوب ب Amariya · amariya.ma', R, H - 54, AR(500, 21), C.mute)
  if (pages > 1) text(ctx, `${page} / ${pages}`, L, H - 54, NUM(600, 21), C.mute, 'left', 'ltr')
}

function section(ctx, t, y) { text(ctx, t, R, y, AR(900, 30), C.green); ctx.fillStyle = C.brass; ctx.fillRect(R - 54, y + 16, 54, 4); return y + 52 }

function page1(ctx, d, kind) {
  const { w, tr, pkg, total, arboun, paid, rest } = d
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H)
  let y = header(ctx, { tr, logo: d.logo, title: kind === 'contract' ? 'عقد العرس' : 'دوفي', no: `N° ${String(w.id).slice(0, 6).toUpperCase()}`, date: dayLabel(new Date().toISOString().slice(0, 10)) }) + 76

  // event details, two columns
  y = section(ctx, 'معلومات العرس', y)
  const info = [['العائلة', w.family], ['التيليفون', w.phone ? prettyPhone(w.phone) : '—', true], ['نهار العرس', dayLabel(w.day)], ['الوقت', w.time || '—', true], ['القاعة', [w.hall, w.city].filter(Boolean).join('، ') || '—'], ['عدد الضياف', String(w.guests), true]]
  const colW = (R - L - 40) / 2
  info.forEach(([k, v, ltr], i) => {
    const cx = i % 2 === 0 ? R : R - colW - 40, yy = y + Math.floor(i / 2) * 92
    text(ctx, k, cx, yy + 6, AR(500, 22), C.mute)
    if (ltr) text(ctx, v, cx, yy + 46, NUM(700, 30), C.ink, 'right', 'ltr')
    else fit(ctx, v, cx, yy + 46, (s) => AR(700, s), 30, C.ink, colW - 10)
    ctx.fillStyle = C.line; ctx.fillRect(cx - colW, yy + 66, colW, 2)
  })
  y += 3 * 92 + 40

  // menu
  y = section(ctx, `المينو · ${w.package_name || pkg?.name || ''}`, y)
  const items = (pkg?.items || []).join('  ·  ')
  if (items) y = para(ctx, items, R, y + 4, AR(500, 26), C.ink, R - L, 44) + 10

  // price table
  y += 20
  const rows = [[`${w.guests} ضيف × ${money(w.price)} درهم`, (+w.guests || 0) * (+w.price || 0)], ...(w.extras || []).map((e) => [e.label, +e.amount || 0])]
  rows.forEach(([k, v]) => {
    rr(ctx, L, y, R - L, 76, 18, 'rgba(15,42,36,.04)')
    fit(ctx, k, R - 28, y + 49, (s) => AR(500, s), 27, C.ink, R - L - 320)
    dh(ctx, v, L + 28, y + 50, 30, C.ink)
    y += 88
  })
  rr(ctx, L, y, R - L, 96, 22, C.green)
  text(ctx, 'المجموع', R - 30, y + 61, AR(900, 32), C.ivory)
  dh(ctx, total, L + 30, y + 64, 44, C.brass, 750)
  y += 128

  // deposit box
  rr(ctx, L, y, R - L, paid > 0 ? 176 : 132, 22, C.brassL)
  text(ctx, `العربون باش تتحجز الداتة (${tr?.arboun_pct || 30}%)`, R - 30, y + 54, AR(700, 27), C.ink)
  dh(ctx, arboun, L + 30, y + 56, 34, C.ink)
  text(ctx, paid > 0 ? 'تخلّص حتى لدابا' : 'الباقي من بعد العربون', R - 30, y + 106, AR(500, 25), '#5A4A2A')
  dh(ctx, paid > 0 ? paid : total - arboun, L + 30, y + 108, 30, paid > 0 ? C.ok : '#5A4A2A')
  if (paid > 0) { text(ctx, 'الباقي', R - 30, y + 152, AR(700, 25), C.ink); dh(ctx, rest, L + 30, y + 154, 30, C.ink) }
  y += (paid > 0 ? 176 : 132) + 44

  // how to pay
  const pay = tr?.pay || {}
  const ways = [pay.rib && [`${pay.bank || 'البنك'}${pay.holder ? ' · ' + pay.holder : ''}`, pay.rib], pay.cashplus_phone && [`CashPlus${pay.cashplus_name ? ' · ' + pay.cashplus_name : ''}`, prettyPhone(normPhone(pay.cashplus_phone))], pay.wafacash_phone && [`Wafacash${pay.wafacash_name ? ' · ' + pay.wafacash_name : ''}`, prettyPhone(normPhone(pay.wafacash_phone))]].filter(Boolean)
  if (ways.length && y < H - 330) {
    y = section(ctx, 'كيفاش تخلّصو', y)
    for (const [k, v] of ways) { text(ctx, k, R, y + 6, AR(500, 23), C.mute); text(ctx, v, L, y + 6, NUM(700, 27), C.ink, 'left', 'ltr'); y += 50 }
    y += 10
  }
  if (kind !== 'contract' && y < H - 170) {
    para(ctx, 'هاد الدوفي صالح 15 يوم. الداتة كتتحجز غير ملّي يتخلّص العربون.', R, Math.max(y + 20, H - 170), AR(500, 23), C.mute, R - L, 38)
  }
}

function page2(ctx, d) {
  const { w, tr, arboun, total } = d
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H)
  let y = header(ctx, { tr, logo: d.logo, title: 'عقد العرس', small: true }) + 80
  y = section(ctx, 'الشروط', y)
  const clauses = [
    `الداتة ديال العرس (${dayLabel(w.day)}) كتتحجز غير ملّي يتخلّص العربون: ${money(arboun)} درهم.`,
    'إلا تلغى العرس من جيهة العائلة، العربون ما كيرجعش.',
    'العدد النهائي ديال الضياف كيتعطى 10 أيام قبل العرس. كل ضيف زايد كيتحسب بنفس الثمن ديال الضيف.',
    d.paid > 0 ? `باقي ${money(d.rest)} درهم ديال الخلاص، كيتخلّص كامل قبل ما تبدا الخدمة نهار العرس.` : `الباقي (${money(Math.max(0, total - arboun))} درهم من بعد العربون) كيتخلّص كامل قبل ما تبدا الخدمة نهار العرس.`,
    'التريتور مسؤول على الماكلة والخدمة اللي مكتوبين فهاد العقد، فالوقت والبلاصة اللي متافقين عليهم.',
    'الماتريال ديال التريتور اللي تهرّس من عند الضياف كيتحسب على العائلة بالثمن ديالو.',
  ]
  clauses.forEach((c, i) => {
    rr(ctx, R - 46, y - 30, 46, 46, 14, C.green)
    text(ctx, String(i + 1), R - 23, y + 2, NUM(700, 24), C.brass, 'center', 'ltr')
    y = para(ctx, c, R - 70, y, AR(500, 27), C.ink, R - L - 70, 46) + 22
  })
  if (w.notes) { y += 10; y = section(ctx, 'ملاحظات', y); y = para(ctx, w.notes, R, y, AR(500, 26), C.ink, R - L, 44) + 10 }

  // signatures
  y = Math.max(y + 50, H - 520)
  const bw = (R - L - 40) / 2
  for (const [i, label, who] of [[0, 'توقيع التريتور', tr?.name || ''], [1, 'توقيع العائلة', w.family]]) {
    const x = i === 0 ? R - bw : L
    ctx.strokeStyle = 'rgba(15,42,36,.25)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.roundRect(x, y, bw, 250, 22); ctx.stroke(); ctx.setLineDash([])
    text(ctx, label, x + bw - 28, y + 50, AR(700, 26), C.green)
    fit(ctx, who, x + bw - 28, y + 88, (s) => AR(500, s), 23, C.mute, bw - 56)
    text(ctx, 'التاريخ: ……………………', x + bw - 28, y + 222, AR(500, 21), C.mute)
  }
}

export async function weddingPdf(w, s, kind = 'devis') {
  await Promise.all([AR(900, 40), AR(700, 40), AR(500, 40)].map((f) => document.fonts.load(f, 'عرس')).concat(document.fonts.load(NUM(700, 40), '0123'))).catch(() => {})
  const tr = s.traiteur, pkg = s.packages.find((p) => p.id === w.package_id)
  const total = totalOf(w), paid = paidOf(w, s.payments)
  const d = { w, tr, pkg, total, paid, rest: Math.max(0, total - paid), arboun: Math.round((total * (tr?.arboun_pct || 30)) / 100), logo: await img(tr?.logo) }
  const pages = kind === 'contract' ? [page1, page2] : [page1]
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  pages.forEach((fn, i) => {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H
    const ctx = cv.getContext('2d')
    fn(ctx, d, kind); footer(ctx, i + 1, pages.length)
    if (i) pdf.addPage()
    pdf.addImage(cv.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 595.28, 841.89)
  })
  const name = `${kind === 'contract' ? 'aqd' : 'devis'}-${String(w.family).replace(/\s+/g, '-')}.pdf`
  return new File([pdf.output('blob')], name, { type: 'application/pdf' })
}
