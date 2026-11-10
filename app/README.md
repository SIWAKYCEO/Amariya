# Amariya app

Gestionale per traiteur marocchini (darija, RTL): العراسات · الخدامة · الكليان · الفلوس.
React 19 + Vite + Supabase (project `tonxmajfvgflvlkkutou`, tabelle `amr_*`), PWA installabile, pronto per Capacitor (Play Store / App Store).

## Sviluppo
```
npm install
npm run dev            # http://localhost:5173/?demo=1  → dati finti, nessun login
npm run build          # output in dist/
```
Demo sempre attiva in una build: `VITE_DEMO=1 npm run build`.

## Deploy web (Vercel o Cloudflare Pages)
- Framework: Vite · Build command: `npm run build` · Output: `dist`
- SPA fallback: `public/_redirects` (Cloudflare). Su Vercel non serve nulla: tutto è in `index.html` e l'app usa `history.state`.

## Nuovo cliente traiteur (accesso con link, senza password)
Nel SQL editor di Supabase:
```sql
select * from amr_admin_new_traiteur('تريتور الياقوت', 'سطات', 'مراد', '212661000000');
```
Restituisce `token`: il link da mandare su WhatsApp è `https://<dominio>/i/<token>` (valido 30 giorni).
L'edge function `amariya-redeem` crea l'utente e apre la sessione. Nuovo link per lo stesso membro:
`select amr_admin_new_invite('<member_id>');`

## Da web app ad app negli store (Capacitor)
Il codice è già pronto: percorsi relativi (`base: './'`), niente router lato server, link WhatsApp/telefono aperti con `_system`, safe-area iPhone gestite.
```
npm i @capacitor/android @capacitor/ios
npx cap add android      # serve Android Studio
npx cap add ios          # serve un Mac con Xcode
npm run cap:sync         # build + copia in android/ e ios/
npx cap open android     # → genera l'AAB per Play Store
```
appId: `ma.amariya.app` (in `capacitor.config.json`). Per l'icona store usare `public/icon.svg` → `npx @capacitor/assets generate`.

## Struttura
- `src/lib/data.js` — store unico, scritture ottimistiche su Supabase (o localStorage in demo), regole: totale, pagato, resto, serveur necessari (1 ogni 20 ospiti, minimo 2), problemi.
- `src/screens/` — Weddings (home), NewWedding (3 passi + devis), WeddingFile, Staff, Clients, Money, Settings.
- Schema DB: migration `amariya_app_v1` su Supabase (tabelle `amr_*`, RLS con `amr_my_traiteur()`).
