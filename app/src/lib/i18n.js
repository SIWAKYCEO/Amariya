// Language and currency for traiteurs outside Morocco.
// Darija + DH (the default) changes NOTHING: the translator never starts.
// Français / English and other currencies are applied on top of the darija UI:
// every text the app shows is looked up in the dictionary (exact text, then patterns,
// then word by word for dates), and amounts in DH get the traiteur's currency symbol.
import { EX } from './i18n_dict'
import { applyVocab, vocabOn } from './trades'

export const LANGS = [['ar', 'الدارجة'], ['fr', 'Français'], ['en', 'English']]
// every currency in the world: the most used first, then all the others (names and symbols come from the phone)
const TOP = [['MAD', 'DH', 'درهم (DH)'], ['EUR', '€', 'Euro (€)'], ['USD', '$', 'US Dollar ($)'], ['GBP', '£', 'Pound (£)'], ['AED', 'AED', 'Dirham émirati (AED)'],
  ['SAR', 'SAR', 'Riyal saoudien (SAR)'], ['QAR', 'QAR', 'Riyal qatari (QAR)'], ['KWD', 'KWD', 'Dinar koweïtien (KWD)'], ['BHD', 'BHD', 'Dinar bahreïni (BHD)'],
  ['OMR', 'OMR', 'Rial omanais (OMR)'], ['CAD', 'CA$', 'Dollar canadien (CA$)'], ['CHF', 'CHF', 'Franc suisse (CHF)'], ['TND', 'TND', 'Dinar tunisien (TND)'],
  ['DZD', 'DA', 'Dinar algérien (DA)'], ['EGP', 'E£', 'Livre égyptienne (E£)'], ['TRY', '₺', 'Lira (₺)']]
const ALL_CODES = (() => { try { return Intl.supportedValuesOf('currency') } catch { return [] } })()
const symOf = (c) => { try { return new Intl.NumberFormat('en', { style: 'currency', currency: c, currencyDisplay: 'narrowSymbol' }).formatToParts(1).find((x) => x.type === 'currency')?.value || c } catch { return c } }
let curName = (c) => c
try { const dn = new Intl.DisplayNames(['fr'], { type: 'currency' }); curName = (c) => dn.of(c) || c } catch { /* old phone */ }
export const CURRENCIES = [...TOP, ...ALL_CODES.filter((c) => !TOP.some((t) => t[0] === c)).map((c) => { const y = /^[A-Z]{3}$/.test(symOf(c)) || symOf(c).length > 3 ? c : symOf(c); return [c, y, `${curName(c)} (${y === c ? c : y + ' · ' + c})`] })]
const SYM = Object.fromEntries(CURRENCIES.map((c) => [c[0], c[1]]))
// country calling code → currency (used when someone signs up from abroad)
const CC_CUR = { 973: 'BHD', 968: 'OMR', 962: 'JOD', 961: 'LBP', 964: 'IQD', 218: 'LYD', 222: 'MRU', 46: 'SEK', 47: 'NOK', 45: 'DKK', 48: 'PLN', 43: 'EUR', 30: 'EUR', 358: 'EUR', 7: 'RUB', 91: 'INR', 92: 'PKR', 61: 'AUD', 64: 'NZD', 27: 'ZAR', 55: 'BRL', 52: 'MXN', 81: 'JPY', 86: 'CNY', 82: 'KRW', 221: 'XOF', 225: 'XOF', 234: 'NGN', 212: 'MAD', 33: 'EUR', 34: 'EUR', 39: 'EUR', 32: 'EUR', 31: 'EUR', 49: 'EUR', 352: 'EUR', 353: 'EUR', 351: 'EUR', 41: 'CHF', 44: 'GBP', 1: 'USD', 971: 'AED', 966: 'SAR', 974: 'QAR', 965: 'KWD', 216: 'TND', 213: 'DZD', 20: 'EGP', 90: 'TRY' }
export const currencyForPhone = (p) => {
  const d = String(p || '').replace(/\D/g, '')
  const cc = Object.keys(CC_CUR).sort((a, b) => b.length - a.length).find((c) => d.startsWith(c))
  return cc ? CC_CUR[cc] : 'MAD'
}

const get = (k) => { try { return localStorage.getItem(k) } catch { return null } }
const put = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k) } catch { /* private mode */ } }

export let LANG = 'ar'
export let CUR = 'MAD'
export const isDefault = () => LANG === 'ar' && CUR === 'MAD' && !vocabOn()
export const curSym = () => SYM[CUR] || 'DH'

// ?lang=fr&cur=EUR from the sign-up page wins, then what this phone saved
export function initPrefs() {
  const q = new URLSearchParams(location.search)
  const ql = q.get('lang'), qc = q.get('cur')
  if (ql && ['ar', 'fr', 'en'].includes(ql)) put('amr_lang', ql)
  if (qc && SYM[qc]) put('amr_cur', qc)
  const l = get('amr_lang'), c = get('amr_cur')
  LANG = ['fr', 'en'].includes(l) ? l : 'ar'
  CUR = SYM[c] ? c : 'MAD'
}
// public pages (devis link, shop window) follow the traiteur, not the visitor
export function applyPrefsOf(t) {
  if (!t) return
  const l = ['fr', 'en'].includes(t.lang) ? t.lang : 'ar', c = SYM[t.currency] ? t.currency : 'MAD'
  if (l === LANG && c === CUR) return
  LANG = l; CUR = c
  startTranslator()
}
// settings screen: save on this phone (and the caller saves it on the account), then reload clean
export function setPrefs(lang, cur, reload = true) {
  put('amr_lang', lang === 'ar' ? null : lang)
  put('amr_cur', cur === 'MAD' ? null : cur)
  if (reload) location.reload()
}
// account has a language/currency saved but this phone doesn't yet (new phone, reinstall)
export function adoptAccountPrefs(t) {
  if (!t || get('amr_prefs_synced') === t.id) return
  put('amr_prefs_synced', t.id)
  const l = ['fr', 'en'].includes(t.lang) ? t.lang : null, c = SYM[t.currency] && t.currency !== 'MAD' ? t.currency : null
  if ((l && l !== LANG) || (c && c !== CUR)) setPrefs(l || LANG, c || CUR)
}

/* ---------------- text translation ---------------- */
const IDX = () => (LANG === 'fr' ? 0 : 1)
const AR = /[؀-ۿ]/
const DAYS = { 'الحد': ['dimanche', 'Sunday'], 'الثنين': ['lundi', 'Monday'], 'الثلاث': ['mardi', 'Tuesday'], 'الربع': ['mercredi', 'Wednesday'], 'الخميس': ['jeudi', 'Thursday'], 'الجمعة': ['vendredi', 'Friday'], 'السبت': ['samedi', 'Saturday'] }
const MONTHS = { 'يناير': ['janvier', 'January'], 'فبراير': ['février', 'February'], 'مارس': ['mars', 'March'], 'أبريل': ['avril', 'April'], 'ماي': ['mai', 'May'], 'يونيو': ['juin', 'June'], 'يوليوز': ['juillet', 'July'], 'غشت': ['août', 'August'], 'شتنبر': ['septembre', 'September'], 'أكتوبر': ['octobre', 'October'], 'نونبر': ['novembre', 'November'], 'دجنبر': ['décembre', 'December'] }
// words that can still sit inside composed text (dates, units)
const WORDS = {
  ...DAYS, ...MONTHS,
  'اليوم': ["aujourd'hui", 'today'], 'غدا': ['demain', 'tomorrow'], 'البارح': ['hier', 'yesterday'],
  'ضيف': ['invités', 'guests'], 'درهم': ['DH', 'DH'], 'عرس': ['mariage', 'wedding'], 'العرس': ['le mariage', 'the wedding'],
  'العربون': ["l'acompte", 'the deposit'], 'الباقي': ['le reste', 'the balance'], 'الخلاص': ['le paiement', 'the payment'],
  'دفعة': ['versement', 'payment'], 'خلاص': ['paiement', 'payment'], 'مع': ['à', 'at'], 'ليلة': ['soirée', 'night'], 'ليالي': ['soirées', 'nights'],
  'عراسات': ['mariages', 'weddings'], 'خدام': ['employés', 'staff'], 'والأثمنة': ['et prix', 'and prices'], 'التجربة': ['Démo', 'Demo'],
  'التريتور': ['le traiteur', 'the caterer'], 'المينو': ['le menu', 'the menu'], 'العقد': ['le contrat', 'the contract'], 'الدوفي': ['le devis', 'the quote'],
}
const WORD_RE = new RegExp(`(^|[\\s(،:·])(${Object.keys(WORDS).sort((a, b) => b.length - a.length).join('|')})(?=$|[\\s)،.:؟!·])`, 'g')

// [darija pattern, français, english] — $1… are translated again on their own
const P = [
  [/^(\d+) ضيف$/, '$1 invités', '$1 guests'],
  [/^ · (\d+) ضيف$/, ' · $1 invités', ' · $1 guests'],
  [/^👥 (\d+) ضيف$/, '👥 $1 invités', '👥 $1 guests'],
  [/^(\d+) عراسات · $/, '$1 mariages · ', '$1 weddings · '],
  [/^(\d+) ما عطاوش العربون$/, '$1 sans acompte', '$1 without deposit'],
  [/^(\d+) طلبات دوفي جداد$/, '$1 nouvelles demandes de devis', '$1 new quote requests'],
  [/^(\d+) ضيف × ([\d\s.,  ]+) درهم$/, '$1 invités × $2 DH', '$1 guests × $2 DH'],
  [/^الباقي: (.+) DH$/, 'Reste : $1 DH', 'Balance: $1 DH'],
  [/^تخلّص حتى لدابا: (.+) DH$/, "Payé jusqu'ici : $1 DH", 'Paid so far: $1 DH'],
  [/^العائلة: (.+)$/, 'Famille : $1', 'Family: $1'],
  [/^العراسات اللي فاتو \((\d+)\)$/, 'Mariages passés ($1)', 'Past weddings ($1)'],
  [/^العربون باش تتحجز الداتة \((\d+)%\)$/, 'Acompte pour réserver la date ($1 %)', 'Deposit to book the date ($1%)'],
  [/^العربون كيحجز ليك النهار\. (\d+)% من المجموع\.$/, "L'acompte réserve la date. $1 % du total.", 'The deposit books the date. $1% of the total.'],
  [/^العرس: (.+)$/, 'Mariage : $1', 'Wedding: $1'],
  [/^المينو · (.*)$/, 'Menu · $1', 'Menu · $1'],
  [/^النتائج \((\d+)\)$/, 'Résultats ($1)', 'Results ($1)'],
  [/^بعد (\d+) ساعات$/, 'Dans $1 h', 'In $1 h'],
  [/^بعد (\d+) دقيقة$/, 'Dans $1 min', 'In $1 min'],
  [/^بعد (\d+) (?:أيام|يوم)$/, 'Dans $1 jours', 'In $1 days'],
  [/^قبل (\d+) دقيقة$/, 'Il y a $1 min', '$1 min ago'],
  [/^قبل (\d+) ساعة$/, 'Il y a $1 h', '$1 h ago'],
  [/^قبل (\d+) أيام$/, 'Il y a $1 jours', '$1 days ago'],
  [/^تسجّل ⁦?(.+?) DH⁩?(?: فعرس (.*))?$/, 'Enregistré $1 DH $2', 'Recorded $1 DH $2'],
  [/^تسجّل: خلّصتي (.+)$/, 'Enregistré : $1 payé', 'Recorded: $1 paid'],
  [/^رجوع (.+)$/, 'Retour $1', 'Return $1'],
  [/^رجع (\d+)(.*)$/, 'Revenu $1$2', 'Back $1$2'],
  [/^ · تهرّس (\d+)$/, ' · cassé $1', ' · broken $1'],
  [/^عندك (Pro|Premium|Ultra)$/, 'Vous avez $1', 'You have $1'],
  [/^و (\d+) آخرين خاصهم تفكير بالباقي$/, 'et $1 autres à relancer pour le reste', 'and $1 more to remind about the balance'],
  [/^💰 المجموع: (.+) DH$/, '💰 Total : $1 DH', '💰 Total: $1 DH'],
  [/^📅 (.+?) مع (.+?)(?: · (.+))?$/, '📅 $1 à $2 · $3', '📅 $1 at $2 · $3'],
  [/^📣 عرس (.+)$/, '📣 Mariage $1', '📣 Wedding $1'],
  [/^🛒 لائحة الشرا · عرس (.+) \((\d+) ضيف\)$/, '🛒 Liste de courses · mariage $1 ($2 invités)', '🛒 Shopping list · wedding $1 ($2 guests)'],
  [/^🧾 وصل · (.+)$/, '🧾 Reçu · $1', '🧾 Receipt · $1'],
  [/^👥 (\d+) ضيف · (.+) \((.+) DH للضيف\) = (.+) DH$/, '👥 $1 invités · $2 ($3 DH par invité) = $4 DH', '👥 $1 guests · $2 ($3 DH per guest) = $4 DH'],
  [/^• (.+): (.+) DH للضيف(.*)$/, '• $1 : $2 DH par invité$3', '• $1: $2 DH per guest$3'],
  [/^🏦 (.+) · (.*)$/, '🏦 $1 · $2', '🏦 $1 · $2'],
  [/^التريتور: (.+)$/, 'Traiteur : $1', 'Caterer: $1'],
  [/^الله يكمّل بالخير، (.+)$/, 'Tous nos vœux, $1', 'Best wishes, $1'],
  [/^كنفكّروكم بلي العرس نهار (.+) وباقي (.+) DH\.$/, 'Petit rappel : le mariage est le $1 et il reste $2 DH.', 'A reminder: the wedding is on $1 and $2 DH is still due.'],
  [/^كنفكّروكم بلي باقي (.+) DH ديال العرس\.$/, 'Petit rappel : il reste $1 DH pour le mariage.', 'A reminder: $1 DH is still due for the wedding.'],
  [/^المينو (.+): (.+) DH للضيف، يعني تقريبا (.+) DH\.$/, 'Menu $1 : $2 DH par invité, soit environ $3 DH.', 'Menu $1: $2 DH per guest, about $3 DH in total.'],
  [/^باش نحجزو ليكم النهار كنطلبو عربون (\d+)% من المجموع\.$/, 'Pour réserver la date, nous demandons un acompte de $1 % du total.', 'To book the date we ask for a $1% deposit.'],
  [/^باقي (.+) درهم ديال الخلاص، كيتخلّص كامل قبل ما تبدا الخدمة نهار العرس\.$/, 'Il reste $1 DH à payer, à régler en totalité avant le début du service le jour du mariage.', '$1 DH remains, to be paid in full before service starts on the wedding day.'],
  [/^الداتة ديال العرس \((.+)\) كتتحجز غير ملّي يتخلّص العربون: (.+) درهم\.$/, "La date du mariage ($1) n'est réservée qu'après le paiement de l'acompte : $2 DH.", 'The wedding date ($1) is only booked once the deposit is paid: $2 DH.'],
  [/^الباقي \((.+) درهم من بعد العربون\) كيتخلّص كامل قبل ما تبدا الخدمة نهار العرس\.$/, "Le reste ($1 DH après l'acompte) est à régler en totalité avant le début du service le jour du mariage.", 'The balance ($1 DH after the deposit) is paid in full before service starts on the wedding day.'],
  [/^شوف المينوهات والنهارات الخاوين ديال (.+):$/, 'Voici les menus et les dates libres de $1 :', 'Here are the menus and free dates of $1:'],
  [/^هادو المينوهات ديال (.+):$/, 'Voici les menus de $1 :', 'Here are the menus of $1:'],
  [/^هادا الدوفي ديال العرس من (.+):$/, 'Voici le devis du mariage de la part de $1 :', 'Here is the wedding quote from $1:'],
  [/^تقدرو تخلّصو وتصيفطو الوصل من هنا: (.+)$/, 'Vous pouvez payer et envoyer le reçu ici : $1', 'You can pay and send the receipt here: $1'],
  [/^شوف الصور والنهارات الخاوين: (.+)$/, 'Voir les photos et les dates libres : $1', 'See photos and free dates: $1'],
  [/^تقدرو تخلّصو هنا:$/, 'Vous pouvez payer ici :', 'You can pay here:'],
  [/^الدوفي كامل وكيفاش تخلّصو العربون:$/, "Le devis complet et comment payer l'acompte :", 'The full quote and how to pay the deposit:'],
  [/^ها (العقد|الدوفي) ديال العرس فـ PDF\.$/, 'Voici $1 du mariage en PDF.', 'Here is $1 for the wedding as a PDF.'],
  [/^هادا الدوفي ديال العرس، ومنو تقدرو تخلّصو (الباقي|العربون) وتصيفطو الوصل:$/, 'Voici le devis du mariage : vous pouvez y payer $1 et envoyer le reçu :', 'Here is the wedding quote: you can pay $1 and send the receipt there:'],
  [/^هادي الصفحة ديال (.+): المينوهات، الأثمنة والنهارات الخاوين، وتقدر تطلب الدوفي مباشرة:$/, 'Voici la page de $1 : menus, prix et dates libres, et vous pouvez demander un devis directement :', 'This is the page of $1: menus, prices and free dates, and you can ask for a quote directly:'],
  [/^السلام (.+?)، خلّصتك (.+) درهم ديال (\d+) (?:ليلة|ليالي) \((.+)\)\. الله يعطيك الصحة 🙏$/, 'Bonjour $1, je viens de te payer $2 DH pour $3 soirée(s) ($4). Merci beaucoup 🙏', 'Hi $1, I just paid you $2 DH for $3 night(s) ($4). Thank you 🙏'],
  [/^السلام (.+?)، عندنا عرس نهار (.+?) مع (.+?)\. واش معانا؟$/, 'Bonjour $1, on a un mariage le $2 à $3. Tu es disponible ?', 'Hi $1, we have a wedding on $2 at $3. Are you available?'],
  [/^السلام عليكم، بغيت نخلّص (الباقي|العربون) ديال عرس (.+)\. كيفاش؟$/, 'Bonjour, je voudrais payer $1 du mariage $2. Comment faire ?', 'Hello, I would like to pay $1 for the $2 wedding. How?'],
  [/^السلام عليكم، صيفطت الوصل ديال (الخلاص|العربون) \((.+) DH\) ديال عرس (.+) 🙏$/, "Bonjour, j'ai envoyé le reçu pour $1 ($2 DH) du mariage $3 🙏", 'Hello, I sent the receipt for $1 ($2 DH) for the $3 wedding 🙏'],
  [/^معاك (.+?)، توصّلنا بالطلب ديالك(.*)$/, "C'est $1, nous avons bien reçu votre demande$2", 'This is $1, we received your request$2'],
  [/^تفعّل (.+) فالتجربة$/, '$1 activé dans la démo', '$1 unlocked in the demo'],
  [/^(.+) ما خلّصوش العربون$/, "$1 n'a pas payé l'acompte", '$1 has not paid the deposit'],
  [/^خلّص (\d+) من الخدامة$/, "Payer $1 membres de l'équipe", 'Pay $1 staff members'],
  [/^المجموع (.+) درهم$/, 'Total $1 DH', 'Total $1 DH'],
  [/^ناقصين (\d+) ف ?(السرباية|الفريق) ديال (.+)$/, 'Il manque $1 ($2) pour $3', '$1 missing ($2) for $3'],
  [/^الفريق ديال (.+) باقي ما تأكّد$/, "L'équipe de $1 n'est pas encore confirmée", "$1's team is not confirmed yet"],
  [/^العرس (.+)، والنهار ماشي محجوز$/, 'Mariage $1, la date n\'est pas réservée', 'Wedding $1, the date is not booked'],
  [/^(\d+) ما عطاوش العربون$/, "$1 n'ont pas payé l'acompte", '$1 have not paid the deposit'],
  [/^عراسات (.+)$/, 'Mariages de $1', 'Weddings in $1'],
  [/^كيفاش بغيتي تخلّص (.+)؟$/, 'Comment voulez-vous payer $1 ?', 'How do you want to pay for $1?'],
  [/^خلّص (.+) بالكارطة$/, 'Payer $1 par carte', 'Pay $1 by card'],
  [/^خلّص (.+) بـ CashPlus$/, 'Payer $1 avec CashPlus', 'Pay $1 with CashPlus'],
  [/^خلّص (Pro|Ultra|Premium)$/, 'Payer $1', 'Pay $1'],
  [/^باقة (Pro|Ultra|Premium)$/, 'Formule $1', '$1 plan'],
  [/^دير التحويل ديال (.+) درهم من البنك ولا من التطبيق ديال البنك$/, 'Faites le virement de $1 DH depuis votre banque ou son application', 'Transfer $1 DH from your bank or its app'],
  [/^صيفط لينا صورة الوصل فالواتساب، ونفعّلو ليك (.+) فنفس النهار$/, 'Envoyez-nous la photo du reçu sur WhatsApp, et nous activons $1 le jour même', 'Send us the receipt photo on WhatsApp, and we turn $1 on the same day'],
  [/^وصلتي لـ (\d+) عراسات جداد هاد الشهر$/, 'Vous avez atteint $1 nouveaux mariages ce mois-ci', 'You reached $1 new weddings this month'],
  [/^السلام عليكم (.+?)( 🌿)?$/, 'Bonjour $1$2', 'Hello $1$2'],
  [/^السلام (.+)$/, 'Bonjour $1', 'Hi $1'],
  [/^العرس (.+)$/, 'Mariage $1', 'Wedding $1'],
  [/^(العربون|خلاص|دفعة): (.+) DH · (.+)$/, '$1 : $2 DH · $3', '$1: $2 DH · $3'],
  [/^بهاد الرقم غادي يولّي المخلّص كثر من المجموع بـ (.+)\. تأكّد من الرقم\.$/, 'Avec ce montant, le payé dépasserait le total de $1. Vérifiez le chiffre.', 'With this amount, paid would exceed the total by $1. Check the amount.'],
  [/^هادا كثر من الباقي بـ (.+)\. تأكّد من الرقم\.$/, 'Ce montant dépasse le reste de $1. Vérifiez le chiffre.', 'This is more than the balance by $1. Check the amount.'],
  [/^العربون كثر من المجموع \((.+)\)\. تأكّد من الرقم\.$/, "L'acompte dépasse le total ($1). Vérifiez le chiffre.", 'The deposit is more than the total ($1). Check the amount.'],
]

function one0(s) {
  const k = s.trim()
  if (!k || !AR.test(k)) return s
  const lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0]
  const ex = EX[k]
  if (ex) return lead + ex[IDX()] + trail
  for (const [re, fr, en] of P) {
    const m = k.match(re)
    if (m) {
      const tpl = LANG === 'fr' ? fr : en
      return lead + tpl.replace(/\$(\d)/g, (_, i) => (m[+i] != null ? one(m[+i]) : '')).replace(/\s+·\s*$/, '').trimEnd() + trail
    }
  }
  if (k.includes(' · ')) return lead + k.split(' · ').map(one).join(' · ') + trail
  return s.replace(WORD_RE, (_, pre, w) => pre + WORDS[w][IDX()])
}
// a list joined with the Arabic comma reads «a، b» once its words are translated: give it a normal comma
const ARL = /[\u0621-\u064A\u0671-\u06D3]/
function one(s) { const o = one0(s); return o.includes('،') && !ARL.test(o) ? o.replace(/،/g, ',') : o }
const money = (s) => {
  if (CUR === 'MAD') return s
  const sym = curSym()
  return s.replace(/\bDH\b/g, sym).replace(/درهم|دراهم/g, sym)
}
// translate a whole text (WhatsApp messages, PDF lines): line by line
export function tr(text, { keepCur = false } = {}) {
  if (isDefault() || text == null) return text
  let s = String(text)
  if (LANG !== 'ar') s = s.split('\n').map(one).join('\n')
  s = applyVocab(s)
  return keepCur ? s : money(s)
}

/* ---------------- live translation of the screen ---------------- */
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE'])
const done = new WeakMap() // text node → the text we put there
const orig = new WeakMap() // text node → the darija it had before we translated it
const origAttr = new WeakMap() // element → { attribute: darija }
let obs = null
function keep(el) {
  for (let e = el; e; e = e.parentElement) {
    if (e.dataset?.keep != null || SKIP.has(e.tagName) || e.isContentEditable) return 'all'
    if (e.dataset?.keepCur != null) return 'cur'
  }
  return ''
}
function fixText(n) {
  const cur = n.data
  if (done.get(n) === cur) return
  const k = keep(n.parentElement)
  if (k === 'all') return
  const out = tr(cur, { keepCur: k === 'cur' })
  done.set(n, out)
  if (out !== cur) { orig.set(n, cur); n.data = out }
}
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt']
function fixEl(el) {
  if (el.nodeType !== 1 || keep(el) === 'all') return
  for (const a of ATTRS) {
    const v = el.getAttribute(a)
    if (v && AR.test(v)) { const out = tr(v); if (out !== v) { const o = origAttr.get(el) || {}; o[a] = v; origAttr.set(el, o); el.setAttribute(a, out) } }
  }
}
function walk(root) {
  if (root.nodeType === 3) return fixText(root)
  if (root.nodeType !== 1) return
  fixEl(root)
  const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
  for (let n = it.nextNode(); n; n = it.nextNode()) n.nodeType === 3 ? fixText(n) : fixEl(n)
}
let origTitle = null
export function startTranslator() {
  if (origTitle === null) origTitle = document.title
  if (isDefault()) return
  if (LANG !== 'ar') { document.documentElement.lang = LANG; document.documentElement.dir = 'ltr'; document.documentElement.classList.add('ltr') }
  if (obs) obs.disconnect()
  walk(document.body)
  if (origTitle) document.title = tr(origTitle)
  obs = new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'characterData') fixText(m.target)
      else if (m.type === 'attributes') fixEl(m.target)
      else m.addedNodes.forEach(walk)
    }
  })
  obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS })
}

// change language right away, on the same screen: put back the darija we replaced, then translate again
export function switchLang(l) {
  if (obs) { obs.disconnect(); obs = null }
  const it = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
  for (let n = it.nextNode(); n; n = it.nextNode()) {
    if (n.nodeType === 3) {
      if (orig.has(n) && done.get(n) === n.data) n.data = orig.get(n)
      orig.delete(n); done.delete(n)
    } else {
      const o = origAttr.get(n)
      if (o) { for (const a in o) n.setAttribute(a, o[a]); origAttr.delete(n) }
    }
  }
  if (origTitle) document.title = origTitle
  LANG = ['fr', 'en'].includes(l) ? l : 'ar'
  const h = document.documentElement
  h.lang = LANG; h.dir = LANG === 'ar' ? 'rtl' : 'ltr'; h.classList.toggle('ltr', LANG !== 'ar')
  put('amr_lang', LANG === 'ar' ? null : LANG)
  startTranslator()
}
