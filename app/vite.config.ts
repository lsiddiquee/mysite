import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

// GitHub Pages has no server-side rewrites, so deep links (e.g. /blog/hello)
// would 404. Copying index.html -> 404.html lets the SPA router take over.
function spaFallback() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const index = resolve(dist, 'index.html')
      if (existsSync(index)) {
        copyFileSync(index, resolve(dist, '404.html'))
      }
    },
  }
}

export default defineConfig({
  // Custom apex domain serves from root, so base stays '/'.
  base: '/',
  plugins: [react(), tailwindcss(), spaFallback()],
})
