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
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Amariya · عمّارية',
        short_name: 'Amariya',
        description: 'العراسات، الخدامة، الكليان والفلوس ديال التريتور ديالك',
        lang: 'ar', dir: 'rtl', start_url: './', scope: './', display: 'standalone',
        background_color: '#0F2A24', theme_color: '#0F2A24',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg}'],
        navigateFallback: 'index.html',
        runtimeCaching: [{ urlPattern: /cloudfront\.net\/.*\.jpg$/, handler: 'CacheFirst', options: { cacheName: 'photos', expiration: { maxEntries: 40 } } }],
      },
    }),
  ],
})
