import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const BASE_TITLE = 'Boscán & La Moni'
const CANONICAL_BASE = 'https://boscanymoni.com'

const routes: Array<RouteRecordRaw> = [
  {
    // Ruta secreta del panel: no se enlaza desde ninguna página ni se lista
    // en robots/sitemap. Si se cambia, actualizar también public/_redirects,
    // GUIA-ANDERSSON.md y el logout de IntegracionesView.
    path: '/acceso-eureka',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      title: `Iniciar Sesión — Boscán & La Moni`,
      description: 'Inicia sesión para acceder a funciones exclusivas.',
      noindex: true,
    },
  },
  {
    path: '/',
    name: 'Portada',
    component: () => import('../views/PortadaView.vue'),
    meta: {
      title: `Boscán & La Moni — Periodismo de investigación y publicidad`,
      description: 'Andersson Boscán y Mónica Velásquez. Elige: quiero periodismo o quiero publicidad.',
    },
  },
  {
    path: '/publicidad',
    name: 'Publicidad',
    component: () => import('../views/CampanaView.vue'),
    meta: {
      title: `Publicidad con Boscán & La Moni — Arma tu campaña sin reunión`,
      description: 'Elige tu objetivo, mira la campaña que mejor encaja y compra sin agendar una reunión. Formatos, precios y disponibilidad en un solo lugar.',
    },
  },
  {
    path: '/media-kit',
    name: 'MediaKit',
    component: () => import('../views/MediaKitView.vue'),
    meta: {
      title: `Media Kit 2026 — Boscán & La Moni`,
      description: 'Media Kit oficial de Andersson Boscán y Mónica Velásquez: audiencia, plataformas y formatos de pauta disponibles.',
    },
  },
  {
    path: '/quienes-somos',
    name: 'QuienesSomos',
    component: () => import('../views/QuienesSomosView.vue'),
    meta: {
      title: `Quiénes somos — Andersson Boscán y Mónica Velásquez`,
      description: 'Conoce a Andersson Boscán y Mónica Velásquez, periodistas de investigación y conductores del programa diario Boscán & La Moni.',
    },
  },
  {
    path: '/precios',
    name: 'Precios',
    component: () => import('../views/PreciosView.vue'),
    meta: {
      title: `Tarifas 2026 — Boscán & La Moni`,
      description: 'Tabla de tarifas y formatos de pauta de Boscán & La Moni. Accede a precios y formatos disponibles para tu marca.',
    },
  },
  {
    path: '/agendar',
    name: 'Agendar',
    component: () => import('../views/AgendarView.vue'),
    meta: {
      title: `Agenda tu llamada — Boscán & La Moni`,
      description: 'Agenda tu llamada estratégica con el equipo de Boscán & La Moni.',
    },
  },
  {
    path: '/terminos-y-condiciones',
    name: 'TerminosCondiciones',
    component: () => import('../views/TerminosCondicionesView.vue'),
    meta: {
      title: `Términos y Condiciones — Boscán & La Moni`,
      description: 'Términos y condiciones de uso y privacidad.',
    },
  },
  {
    path: '/politica-de-privacidad',
    name: 'PoliticaPrivacidad',
    component: () => import('../views/PoliticaPrivacidadView.vue'),
    meta: {
      title: `Política de Privacidad — Boscán & La Moni`,
      description: 'Política de privacidad y protección de datos.',
    },
  },
  {
    path: '/integraciones',
    name: 'Integraciones',
    component: () => import('../views/IntegracionesView.vue'),
    meta: {
      title: `Panel de Integraciones — Boscán & La Moni`,
      description: 'Gestiona tus integraciones externas.',
      requiresAuth: true,
      noindex: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: `404 — Página no encontrada | ${BASE_TITLE}`,
      description: 'La página que buscas no existe.',
      noindex: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0, behavior: 'smooth' }
  },
})

/**
 * Metas por ruta: cada vista deja de ser un "duplicado" de la portada para
 * el crawler que ejecuta JS. El canonical, og:url, título y description se
 * actualizan en cada navegación; el HTML estático (index.html) solo trae
 * los valores de la portada.
 */
const setAttr = (selector: string, value: string) => {
  document.head.querySelector(selector)?.setAttribute('content', value)
}

router.beforeEach((to, _from, next) => {
  // Título por ruta, también en las tarjetas de compartir
  const title = (to.meta?.title as string | undefined) ?? BASE_TITLE
  document.title = title
  setAttr('meta[property="og:title"]', title)
  setAttr('meta[name="twitter:title"]', title)

  // Description por ruta
  const desc = to.meta?.description as string | undefined
  if (desc) {
    setAttr('meta[name="description"]', desc)
    setAttr('meta[property="og:description"]', desc)
    setAttr('meta[name="twitter:description"]', desc)
  }

  // Canonical y og:url por ruta (sin query ni hash)
  const canonical = CANONICAL_BASE + (to.path === '/' ? '/' : to.path.replace(/\/+$/, ''))
  let canonicalLink = document.head.querySelector('link[rel="canonical"]')
  if (!canonicalLink) {
    canonicalLink = document.createElement('link')
    canonicalLink.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalLink)
  }
  canonicalLink.setAttribute('href', canonical)
  setAttr('meta[property="og:url"]', canonical)

  // Rutas internas y 404 fuera del índice
  setAttr(
    'meta[name="robots"]',
    to.meta?.noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  )

  const hasToken = !!localStorage.getItem('access_token')
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)

  if (requiresAuth && !hasToken) {
    return next({ path: '/acceso-eureka', replace: true })
  }

  if (to.path === '/acceso-eureka' && hasToken) {
    return next({ path: '/integraciones', replace: true })
  }

  next()
})

/**
 * Si falla la descarga de una vista (deploy nuevo con otros hashes, o Vite
 * reoptimizando dependencias en dev), el router cambia el título pero deja la
 * página en blanco. Recargamos una vez hacia la ruta pedida; la marca en
 * sessionStorage evita un bucle si el archivo realmente no existe.
 */
const RELOAD_KEY = 'chunk_reload'
router.onError((err, to) => {
  const msg = String((err as Error)?.message ?? err)
  const isChunkError = /dynamically imported module|Importing a module script failed|Failed to fetch|error loading dynamically/i.test(msg)
  if (!isChunkError) return
  if (sessionStorage.getItem(RELOAD_KEY) === to.fullPath) return
  sessionStorage.setItem(RELOAD_KEY, to.fullPath)
  window.location.assign(to.fullPath)
})
router.afterEach(() => { sessionStorage.removeItem(RELOAD_KEY) })

export default router
