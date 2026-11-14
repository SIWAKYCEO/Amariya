// Demo data (?demo=1): a believable traiteur in Settat with weddings around today
import { addDays, dayKey } from './util'

export function demoSeed() {
  const d = (n) => dayKey(addDays(new Date(), n))
  const id = (p, n) => `${p}-${n}`
  const packages = [
    { id: 'p1', name: 'العادي', price: 250, items: ['البسطيلة ديال الدجاج', 'الدجاج بالزيتون', 'الفواكه', 'الحلويات والأتاي'], sort: 0 },
    { id: 'p2', name: 'الملكي', price: 380, items: ['البسطيلة ديال الحوت', 'المشوي', 'الدجاج بالزيتون', 'الفواكه', 'الحلويات والأتاي', 'العصير'], sort: 1 },
  ]
  const W = [
    ['عائلة بنعلي', '212661234567', 0, '20:00', 'قاعة النخيل', 'سطات', 200, 'p2', [{ label: 'نكافة', amount: 6000 }]],
    ['عائلة الإدريسي', '212662345678', 0, '21:00', 'دار العائلة', 'برشيد', 180, 'p1', []],
    ['عائلة الصديقي', '212663456789', 2, '20:30', 'قاعة الأفراح', 'سطات', 250, 'p2', [{ label: 'ديكور', amount: 4000 }]],
    ['عائلة العلوي', '212664567890', 6, '20:00', 'قاعة الياقوت', 'الدار البيضاء', 400, 'p2', [{ label: 'نكافة', amount: 8000 }]],
    ['عائلة الحسني', '212665678901', 13, '19:30', 'قاعة النخيل', 'سطات', 150, 'p1', []],
    ['عائلة التازي', '212666789012', -5, '20:00', 'قاعة الأفراح', 'سطات', 220, 'p1', []],
    ['عائلة بنعلي', '212661234567', -40, '20:00', 'دار العائلة', 'سطات', 120, 'p1', []],
  ]
  const weddings = W.map(([family, phone, n, time, hall, city, guests, pk, extras], i) => {
    const p = packages.find((x) => x.id === pk)
    return { id: id('w', i), family, phone, day: d(n), time, hall, city, guests, package_id: pk, package_name: p.name, price: p.price, extras, notes: i === 0 ? 'العروسة بغات الحلويات بلا سكر بزاف' : '', status: n < 0 ? 'done' : i === 4 ? 'devis' : 'confirmed', created_at: new Date(Date.now() - (60 - i) * 864e5).toISOString() }
  })
  const payments = [
    ['w-0', 40000, -30], ['w-0', 30000, -3], ['w-1', 15000, -20], ['w-2', 30000, -12], ['w-3', 50000, -8],
    ['w-5', 55000, -25], ['w-5', 0, -5], ['w-6', 30000, -45],
  ].filter((x) => x[1] > 0).map(([wedding_id, amount, n], i) => ({ id: id('pay', i), wedding_id, amount, kind: i === 0 ? 'arboun' : 'payment', paid_on: d(n), created_at: new Date().toISOString() }))
  const S = [['يوسف', 'serveur', 300], ['حمزة', 'serveur', 300], ['أيوب', 'serveur', 300], ['عبد الرحيم', 'serveur', 300], ['مهدي', 'serveur', 300], ['إلياس', 'serveur', 300], ['أنس', 'serveur', 300], ['زكرياء', 'serveur', 300], ['رشيد', 'serveur', 300], ['سعيد', 'serveur', 300], ['خديجة', 'neggafa', 0], ['للا فاطمة', 'cuisine', 500], ['الشاف عزيز', 'chef', 800]]
  const staff = S.map(([name, role, rate], i) => ({ id: id('s', i), name, role, rate, phone: '2126' + String(70000000 + i * 1234567).slice(0, 8), active: true }))
  const A = [
    ['w-0', [0, 'ok'], [1, 'ok'], [2, 'ok'], [3, 'ok'], [4, 'ok'], [5, 'ok'], [6, 'ok'], [7, 'ok'], [8, 'ok'], [9, 'asked'], [10, 'ok'], [11, 'ok'], [12, 'ok']],
    ['w-1', [0, 'ok'], [1, 'ok'], [2, 'ok'], [3, 'ok'], [4, 'ok'], [5, 'ok'], [6, 'no'], [11, 'ok']],
    ['w-2', [0, 'ok'], [1, 'asked'], [2, 'asked'], [12, 'ok']],
  ]
  const assignments = A.flatMap(([w, ...rows]) => rows.map(([s, status]) => ({ id: `a-${w}-${s}`, wedding_id: w, staff_id: id('s', s), status, pay: staff[s].rate })))
  const expenses = [
    ['اللحم والدجاج', 18000, -3, 'w-0'], ['الخضرة والفواكه', 6500, -2, 'w-0'], ['كرا الطباسل', 2500, -10, null], ['المازوط', 1200, -1, null],
  ].map(([label, amount, n, wedding_id], i) => ({ id: id('e', i), label, amount, spent_on: d(n), wedding_id, created_at: new Date().toISOString() }))
  return {
    traiteur: { id: 't1', name: 'تريتور الياقوت', city: 'سطات', phone: '212661000000', slug: 'demo', bio: 'تريتور فسطات من 2012 · العراسات والخطوبات والعقيقة', public_on: true, arboun_pct: 30, plan: 'free',
      pay: { bank: 'CIH Bank', rib: '230 780 1234567890123456 78', holder: 'مراد الياقوتي', cashplus_name: 'مراد الياقوتي', cashplus_phone: '0661000000' } },
    me: { id: 'm1', name: 'مراد', role: 'owner' },
    packages, weddings: weddings.map((w, i) => ({ ...w, pub_token: 'demo-token-' + i + '-xxxxxxxx', reminded: {} })), payments, staff, assignments, expenses,
    requests: [
      { id: 'r1', name: 'سلمى بنجلون', phone: '212670112233', day: d(40), guests: 180, package_id: 'p2', note: 'بغينا نعرفو واش كاين البسطيلة ديال الحوت', status: 'new', created_at: new Date(Date.now() - 3600e3).toISOString() },
      { id: 'r2', name: 'عائلة المرابط', phone: '212661445566', day: d(65), guests: 250, package_id: 'p1', note: '', status: 'new', created_at: new Date(Date.now() - 26 * 3600e3).toISOString() },
    ],
    items: [['الطباسل', 600], ['الكيسان', 800], ['الفرشيطات والمغارف', 900], ['الطيفورات', 60], ['الطناجر الكبار', 12], ['البرّادات', 40]].map(([name, qty], i) => ({ id: 'it' + i, name, qty })),
    witems: [['w-0', 0, 400], ['w-0', 1, 500], ['w-0', 3, 40], ['w-1', 0, 300], ['w-1', 3, 30], ['w-5', 0, 350, 340, 4]].map(([wedding_id, k, qty_out, qty_back = null, broken = 0], i) => ({ id: 'wi' + i, wedding_id, item_id: 'it' + k, qty_out, qty_back, broken })),
    proofs: [{ id: 'pr1', wedding_id: 'w-4', amount: 10000, method: 'cashplus', path: '', demo_url: '', payer: 'عائلة الحسني', status: 'pending', created_at: new Date(Date.now() - 2 * 3600e3).toISOString() }],
  }
}
