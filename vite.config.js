import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const ignoredPaths = [
  '**/coqui/**',
  '**/dist/**',
  '**/.cache/**',
  '**/.git/**',
  '**/__pycache__/**',
  '**/coverage/**',
  '**/supabase/.temp/**',
]

// https://vite.dev/config/
export default defineConfig({
  cacheDir: join(tmpdir(), 'thesis-assistant-vite-cache'),
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    allowedHosts: ['.trycloudflare.com'],
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws',
    },
    watch: {
      ignored: ignoredPaths,
    },
  },
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: true,
  },
  optimizeDeps: {
    entries: ['index.html', 'src/main.jsx'],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
