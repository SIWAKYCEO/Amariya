// small payment marks drawn in SVG (no external images): Visa, Mastercard, CashPlus wordmark, bank
export const Visa = () => (
  <svg className="pmk" viewBox="0 0 48 30" aria-label="Visa"><rect width="48" height="30" rx="5" fill="#fff" /><text x="24" y="20" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="13" fontStyle="italic" fontWeight="900" fill="#1A1F71" letterSpacing="-.3">VISA</text></svg>
)
export const Mastercard = () => (
  <svg className="pmk" viewBox="0 0 48 30" aria-label="Mastercard"><rect width="48" height="30" rx="5" fill="#fff" /><circle cx="19.5" cy="15" r="8.5" fill="#EB001B" /><circle cx="28.5" cy="15" r="8.5" fill="#F79E1B" /><path d="M24 7.8a8.5 8.5 0 0 1 0 14.4a8.5 8.5 0 0 1 0-14.4z" fill="#FF5F00" /></svg>
)
export const CashPlus = () => (
  <svg className="pmk wide" viewBox="0 0 84 30" aria-label="Cash Plus"><rect width="84" height="30" rx="5" fill="#fff" /><circle cx="13" cy="15" r="7.5" fill="#0E5A4A" /><path d="M13 7.5a7.5 7.5 0 0 1 0 15z" fill="#F6C200" /><text x="24" y="19.5" fontFamily="Arial Black, Arial, sans-serif" fontSize="10.5" fontWeight="900" fill="#0E5A4A">CASH</text><text x="56" y="19.5" fontFamily="Arial Black, Arial, sans-serif" fontSize="10.5" fontWeight="900" fill="#E9B200">PLUS</text></svg>
)
export const Bank = () => (
  <svg className="pmk" viewBox="0 0 48 30" aria-label="Bank"><rect width="48" height="30" rx="5" fill="#fff" /><path d="M14 12.5L24 7l10 5.5H14zM16 14h3v7h-3zM22.5 14h3v7h-3zM29 14h3v7h-3zM13.5 22.5h21v1.8h-21z" fill="#2B3A55" /></svg>
)
