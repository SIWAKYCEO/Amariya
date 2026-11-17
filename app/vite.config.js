import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base '/' works on the web (also on /i/<token> links) and inside Capacitor, which serves the app from the root
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', 'favicon-64.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'maskable-512.png'],
      manifest: {
        name: 'Amariya · عمّارية',
        short_name: 'Amariya',
        description: 'العراسات، الخدامة، الكليان والفلوس ديال التريتور ديالك',
        lang: 'ar', dir: 'rtl', start_url: './', scope: './', display: 'standalone',
        background_color: '#0F2A24', theme_color: '#0F2A24',
        id: '/', orientation: 'portrait', categories: ['business', 'productivity'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // the page itself is never served from the old cache: always the newest one from the network,
        // the saved copy only when offline (so a fresh deploy can never leave a blank screen)
        globPatterns: ['**/*.{js,css,woff2,svg}'],
        navigateFallback: null,
        skipWaiting: true, clientsClaim: true, cleanupOutdatedCaches: true,
        runtimeCaching: [{ urlPattern: ({ request }) => request.mode === 'navigate', handler: 'NetworkFirst', options: { cacheName: 'pages', networkTimeoutSeconds: 4, expiration: { maxEntries: 8 } } }, { urlPattern: /cloudfront\.net\/.*\.jpg$/, handler: 'CacheFirst', options: { cacheName: 'photos', expiration: { maxEntries: 40 } } }],
      },
    }),
  ],
})
