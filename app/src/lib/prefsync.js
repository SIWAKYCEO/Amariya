// keeps language/currency the same on every phone of the account
import { saveTraiteur } from './data'
import { CUR, LANG, adoptAccountPrefs, currencyForPhone, isDefault, setPrefs } from './i18n'

export function syncPrefs(t) {
  if (!t) return
  if (t.lang || t.currency) return adoptAccountPrefs(t)
  if (!isDefault()) { saveTraiteur({ lang: LANG, currency: CUR }).catch(() => {}); return }
  // signed up from abroad before languages existed: their currency, and French/English if the phone speaks it
  const cur = currencyForPhone(t.phone)
  if (cur === 'MAD') return
  const nl = (navigator.language || '').slice(0, 2)
  const lang = nl === 'fr' ? 'fr' : nl === 'en' ? 'en' : 'ar'
  saveTraiteur({ lang, currency: cur }).catch(() => {}).finally(() => setPrefs(lang, cur))
}
