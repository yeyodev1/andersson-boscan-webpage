import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const BASE_TITLE = 'Andersson y Moni Boscán — Media Kit 2026'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'MediaKit',
    component: () => import('../views/MediaKitView.vue'),
    meta: {
      title: `Media Kit 2026 — Andersson y Moni Boscán | Periodismo Digital LATAM`,
      description: 'Media Kit oficial de Andersson y Moni Boscán. 88.7M impresiones mensuales, 910K seguidores TikTok, programa noticioso más viral de LATAM.',
    },
  },
  {
    path: '/quienes-somos',
    name: 'QuienesSomos',
    component: () => import('../views/QuienesSomosView.vue'),
    meta: {
      title: `Quiénes somos — Andersson y Moni Boscán | Media Kit 2026`,
      description: 'Conoce a Andersson Boscán y Mónica Velásquez — el equipo detrás del programa noticioso más viral de LATAM.',
    },
  },
  {
    path: '/agendar',
    name: 'Agendar',
    component: () => import('../views/AgendarView.vue'),
    meta: {
      title: `Agenda tu llamada — Andersson y Moni Boscán | Media Kit 2026`,
      description: 'Agenda tu llamada estratégica con el equipo de Andersson y Moni Boscán.',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: `404 — Página no encontrada | ${BASE_TITLE}`,
      description: 'La página que buscas no existe.',
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

router.beforeEach((to, _from, next) => {
  // Set page title
  const title = to.meta?.title as string | undefined
  if (title) document.title = title

  // Set meta description
  const desc = to.meta?.description as string | undefined
  if (desc) {
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', desc)
  }

  const hasToken = !!localStorage.getItem('access_token')
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)

  if (requiresAuth && !hasToken) {
    return next({ path: '/login', replace: true })
  }

  if (to.path === '/login' && hasToken) {
    return next({ path: '/', replace: true })
  }

  next()
})

export default router
