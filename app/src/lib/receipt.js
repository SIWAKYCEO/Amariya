// Ricevuta di pagamento come immagine (PNG 1080px), stile Amariya.
import { dayLabel, money } from './util'

const C = { green: '#0F2A24', green2: '#173A32', ivory: '#F3EDE3', paper: '#FBF8F2', brass: '#C8A15A', henna: '#E0633A', ink: '#14201D', mute: '#6E7A74', line: 'rgba(15,42,36,.12)', ok: '#2F7D5B' }
const AR = (w, s) => `${w} ${s}px Alexandria, system-ui, sans-serif`
const NUM = (w, s) => `${w} ${s}px "Bricolage Grotesque Variable", Alexandria, sans-serif`
const W = 1080, PAD = 72, CX = 64

let logoImg = null
async function logo(color) {
  if (logoImg?.color === color) return logoImg.img
  const svg = (await (await fetch(`${import.meta.env.BASE_URL}logo.svg`)).text()).replaceAll('#000', color)
  const img = new Image()
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  await img.decode()
  logoImg = { color, img }
  return img
}

function star(ctx, x, y, r, color, hole) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = color
  const sq = (a) => { ctx.save(); ctx.rotate(a); ctx.fillRect(-r * 0.707, -r * 0.707, r * 1.414, r * 1.414); ctx.restore() }
  sq(0); sq(Math.PI / 4)
  if (hole) { ctx.fillStyle = hole; ctx.beginPath(); ctx.arc(0, 0, r * 0.42, 0, 7); ctx.fill() }
  ctx.restore()
}

// testo arabo allineato a destra, ridotto finché entra nella larghezza
function rt(ctx, text, x, y, font, color, max, size) {
  let s = size
  ctx.font = font(s)
  while (max && ctx.measureText(text).width > max && s > 18) { s -= 2; ctx.font = font(s) }
  ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.fillStyle = color; ctx.fillText(text, x, y)
  return ctx.measureText(text).width
}
// numero (LTR) allineato a sinistra o destra
function num(ctx, text, x, y, size, color, align = 'left', weight = 700) {
  ctx.font = NUM(weight, size); ctx.direction = 'ltr'; ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(text, x, y)
  return ctx.measureText(text).width
}
function amount(ctx, v, x, y, size, color, weight = 700) {
  // "12 500 DH" con DH più piccolo, allineato a sinistra
  const w1 = num(ctx, money(v), x, y, size, color, 'left', weight)
  num(ctx, ' DH', x + w1, y, Math.round(size * 0.48), color, 'left', 600)
}
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r) }

export async function receiptImage({ w, p, pays, total, traiteur }) {
  await Promise.all([
    document.fonts.load(AR(900, 40), 'عرس'), document.fonts.load(AR(700, 40), 'عرس'), document.fonts.load(AR(500, 40), 'عرس'),
    document.fonts.load(NUM(700, 40), '0123'),
  ]).catch(() => {})
  const idx = pays.findIndex((x) => x.id === p.id)
  const upto = pays.slice(0, idx + 1)
  const paid = upto.reduce((a, x) => a + +x.amount, 0)
  const rest = Math.max(0, total - paid)
  const history = upto.length > 1 ? upto : []
  const rows = [['العائلة', w.family], ['نهار العرس', dayLabel(w.day)], ['الضيوف', null, `${w.guests}`], ...(w.hall ? [['القاعة', w.hall]] : [])]

  const lg = await logo('rgba(243,237,227,.9)').catch(() => null)
  const probe = document.createElement('canvas').getContext('2d')
  const end = paint(probe, 4000)
  const H = end + 150
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  paint(cv.getContext('2d'), H)
  return await new Promise((res) => cv.toBlob(res, 'image/png'))

  function paint(ctx, H) {

  // fondo verde + stella in filigrana
  ctx.fillStyle = C.green; ctx.fillRect(0, 0, W, H)

  // intestazione: nome del traiteur
  rt(ctx, traiteur?.name || 'التريتور', W - PAD, 128, (s) => AR(900, s), C.ivory, W - PAD * 2 - 140, 54)
  if (traiteur?.city) rt(ctx, traiteur.city, W - PAD, 178, (s) => AR(500, s), 'rgba(243,237,227,.62)', 600, 28)
  star(ctx, PAD + 30, 112, 26, C.brass, C.green)

  // carta della ricevuta
  const top = 228, cardH = H - top - 150 + 30, x0 = CX, x1 = W - CX
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16
  ctx.fillStyle = C.paper; ctx.beginPath()
  ctx.moveTo(x0 + 28, top); ctx.lineTo(x1 - 28, top); ctx.quadraticCurveTo(x1, top, x1, top + 28)
  const zy = top + cardH, step = 36
  ctx.lineTo(x1, zy)
  for (let x = x1; x > x0; x -= step) { ctx.lineTo(x - step / 2, zy + 18); ctx.lineTo(Math.max(x0, x - step), zy) }
  ctx.lineTo(x0, top + 28); ctx.quadraticCurveTo(x0, top, x0 + 28, top); ctx.closePath(); ctx.fill()
  ctx.restore()

  const R = x1 - 56, L = x0 + 56
  let y = top + 86
  rt(ctx, 'وصل الخلاص', R, y, (s) => AR(900, s), C.ink, 500, 44)
  const no = `N° ${String(w.id).slice(0, 4).toUpperCase()}-${idx + 1}`
  num(ctx, no, L, y - 4, 26, C.mute, 'left', 600)
  y += 46
  rt(ctx, dayLabel(p.paid_on), R, y, (s) => AR(500, s), C.mute, 600, 26)

  // importo grande
  y += 52
  rrect(ctx, L, y, R - L, 230, 26); ctx.fillStyle = C.green; ctx.fill()
  rt(ctx, p.kind === 'arboun' ? 'العربون' : 'دفعة', R - 36, y + 66, (s) => AR(700, s), 'rgba(243,237,227,.75)', 400, 30)
  ctx.save(); ctx.font = NUM(750, 112)
  const amtW = ctx.measureText(money(p.amount)).width + ctx.measureText(' DH').width * 0.5
  ctx.restore()
  amount(ctx, p.amount, R - 36 - amtW, y + 180, 112, C.ivory, 750)
  // timbro «تخلّص»
  ctx.save(); ctx.translate(L + 118, y + 115); ctx.rotate(-0.18)
  ctx.strokeStyle = C.brass; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 78, 0, 7); ctx.stroke()
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 66, 0, 7); ctx.stroke()
  ctx.font = AR(900, 34); ctx.fillStyle = C.brass; ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.fillText('تخلّص', 0, 12)
  ctx.restore()

  // dettagli
  y += 230 + 40
  for (const [k, v, n] of rows) {
    y += 74
    rt(ctx, k, R, y, (s) => AR(500, s), C.mute, 300, 28)
    if (n) num(ctx, n, L, y, 34, C.ink, 'left', 700)
    else { ctx.save(); ctx.font = AR(700, 32); ctx.direction = 'rtl'; ctx.textAlign = 'left'; ctx.fillStyle = C.ink
      let s = 32; while (ctx.measureText(v).width > R - L - 260 && s > 20) { s -= 2; ctx.font = AR(700, s) }
      ctx.fillText(v, L, y); ctx.restore() }
    ctx.fillStyle = C.line; ctx.fillRect(L, y + 26, R - L, 2)
  }

  // barra pagato / totale
  y += 86
  const pct = Math.min(1, paid / (total || 1))
  rrect(ctx, L, y, R - L, 18, 9); ctx.fillStyle = 'rgba(15,42,36,.08)'; ctx.fill()
  rrect(ctx, R - (R - L) * pct, y, (R - L) * pct, 18, 9); ctx.fillStyle = rest ? C.brass : C.ok; ctx.fill()
  num(ctx, `${Math.round(pct * 100)}%`, L, y - 16, 26, C.mute, 'left', 700)

  // totali
  const tot = [['المجموع ديال العرس', total, C.ink], ['تخلّص حتى لدابا', paid, C.ok]]
  y += 30
  for (const [k, v, col] of tot) {
    y += 66
    rt(ctx, k, R, y, (s) => AR(500, s), C.mute, 420, 29)
    ctx.save(); ctx.font = NUM(700, 38); const ww = ctx.measureText(money(v)).width; ctx.restore()
    amount(ctx, v, L, y, 38, col); void ww
  }
  y += 40
  rrect(ctx, L, y, R - L, 104, 22); ctx.fillStyle = rest ? 'rgba(224,99,58,.1)' : 'rgba(47,125,91,.1)'; ctx.fill()
  if (rest) {
    rt(ctx, 'الباقي', R - 30, y + 66, (s) => AR(900, s), C.henna, 300, 36)
    amount(ctx, rest, L + 30, y + 70, 50, C.henna, 750)
  } else {
    rt(ctx, 'خالص كامل · شكرا', R - 30, y + 66, (s) => AR(900, s), C.ok, R - L - 60, 36)
  }
  y += 104

  // storico dei pagamenti
  if (history.length) {
    y += 70
    rt(ctx, 'الخلاصات', R, y, (s) => AR(700, s), C.ink, 300, 28)
    for (const h of history) {
      y += 62
      const cur = h.id === p.id
      rt(ctx, `${h.kind === 'arboun' ? 'العربون' : 'دفعة'} · ${dayLabel(h.paid_on, false)}`, R, y, (s) => AR(cur ? 700 : 500, s), cur ? C.ink : C.mute, 520, 27)
      amount(ctx, h.amount, L, y, 30, cur ? C.ink : C.mute, cur ? 750 : 600)
    }
  }

  // piè di pagina
  y += 86
  ctx.font = AR(500, 27); ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.fillStyle = C.mute
  ctx.fillText('شكرا على الثقة، الله يكمّل بالخير', W / 2, y)
  const contentEnd = y + 40
  const fy = H - 56
  ctx.font = AR(500, 24); ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(243,237,227,.55)'
  const label = 'تصاوب بـ'
  const lw = lg ? 150 : 0, gap = 14, tw = ctx.measureText(label).width
  const start = W / 2 - (tw + gap + lw) / 2
  if (lg) ctx.drawImage(lg, start, fy - 34, lw, lw / 3.295)
  ctx.fillText(label, start + lw + gap + tw, fy)
  return contentEnd
  }
}
