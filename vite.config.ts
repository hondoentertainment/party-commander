import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE || '/'

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        injectRegister: 'auto',
        srcDir: 'src',
        filename: 'sw.ts',
        manifest: {
          name: 'Party Command Center',
          short_name: 'Party Commander',
          theme_color: '#020617',
          background_color: '#020617',
          display: 'standalone',
          start_url: base || '/',
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        },
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/')

            if (normalizedId.includes('/src/pages/ModulePages.tsx')) {
              return 'module-pages'
            }

            if (!normalizedId.includes('/node_modules/')) return undefined
            if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/')) return 'react-vendor'
            if (normalizedId.includes('/react-router/')) return 'router-vendor'
            if (normalizedId.includes('/@supabase/')) return 'supabase-vendor'
            if (normalizedId.includes('/framer-motion/')) return 'motion-vendor'
            if (normalizedId.includes('/lucide-react/')) return 'icons-vendor'
            if (normalizedId.includes('/date-fns/')) return 'date-vendor'
            return 'vendor'
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      exclude: ['**/node_modules/**', '**/e2e/**'],
    },
  }
})
