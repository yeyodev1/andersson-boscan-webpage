import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * El sitio de investigaciones (public/periodismo/) es estático: lo genera
 * Andersson con su propio build y se sube tal cual. En producción el hosting
 * resuelve solo el index.html de cada carpeta, pero el dev server de Vite se
 * come esas rutas con su fallback de SPA y devuelve el 404 de la app. Este
 * middleware las sirve como lo haría el hosting.
 */
function periodismoEstatico(): Plugin {
  return {
    name: 'periodismo-estatico',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = (req.url || '').split('?')[0]
        if (!url.startsWith('/periodismo/') || path.extname(url)) return next()
        const candidato = path.join(process.cwd(), 'public', url, 'index.html')
        if (fs.existsSync(candidato)) req.url = path.posix.join(url, 'index.html')
        next()
      })
    },
  }
}

export default defineConfig({
  server: {
    allowedHosts: ['testing-storybrand-frontend.bakano.ec'],
  },
  plugins: [vue(), periodismoEstatico()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/index.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
  },
})
