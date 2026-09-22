# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Vite, port 5173)
pnpm build        # Type-check + production build (vue-tsc && vite build)
pnpm preview      # Preview production build locally
```

No test runner is configured yet.

## Environment

Copy `.env.example` to `.env` and set:

```
VITE_API_BASE_URL=http://localhost:8100/api
VITE_GHL_WEBHOOK_CONTACT=<GHL contact webhook URL>
VITE_GHL_WEBHOOK_OPPORTUNITY=<GHL opportunity webhook URL>
```

## Domains

- **Primary**: `https://boscanymoni.com`
- Aliases: `monivelasquezv.com`, `anderssonboscan.ec`, `andersson-boscan.netlify.app`
- Always use `boscanymoni.com` as canonical in SEO files (sitemap, robots, llms.txt, og:url)

## Routes

| Path | View | Notes |
|------|------|-------|
| `/` | `PortadaView.vue` | Portada minimalista: logo, pareja, expedientes (carpetas) que aparecen al pasar el mouse y se pueden arrastrar, dos botones: "Quiero periodismo" → `/periodismo`, "Quiero publicidad" → `/publicidad` |
| `/periodismo` | — (estático) | Sitio de investigaciones que entrega Andersson, servido desde `public/periodismo/`. No es una ruta de Vue: ver "Periodismo" abajo. |
| `/publicidad` | `CampanaView.vue` | Funnel de ventas v3: hero, configurador de 3 pasos, recomendación, checkout por carril, briefing y chat. "Quiero publicidad" es un `<a href>` normal, igual que "Quiero periodismo": sin transición (la cortina de GSAP dejaba la página en blanco). |
| `/media-kit` | `MediaKitView.vue` | El media kit de 10 secciones. Material de apoyo, ya no es la puerta de entrada; se enlaza desde el funnel y desde "Media kit 2026" en la portada. |
| `/quienes-somos` | `QuienesSomosView.vue` | Standalone about page |
| `/agendar` | `AgendarView.vue` | GHL calendar embed (qualified leads only) |
| `/precios` | `PreciosView.vue` | Full pricing table — gated behind contact form; skips gate if `mk_contact_given` in localStorage |

## Periodismo (sitio estático, no Vue)

`public/periodismo/` es el sitio que entrega Andersson: 221 páginas — la portada,
35 expedientes y 185 transcripciones — con su propio CSS, su JS plano y su juego
WebGL en `assets/game/`. Se sube tal cual; no pasa por el build de Vite.

**No convertirlo a componentes Vue.** Ese HTML lo *genera* Andersson con
`python3 build.py` desde `content/expedientes/<caso>.json`. Un port a Vue sería
un fork que se separa en cada corrección suya. Para actualizar: él manda una
entrega nueva y se reemplaza la carpeta entera.

- Las rutas internas de la entrega son relativas, así que funciona bajo
  `/periodismo/` sin tocarle nada. Lo único reescrito son las URLs absolutas de
  SEO: `https://boscanymoni.com/` → `https://boscanymoni.com/periodismo/` en
  canonical, `og:url`, `sitemap.xml`, `feed.xml`, `llms.txt` y `robots.txt`.
  Si llega una entrega nueva, hay que repetir ese reemplazo.
- **No hay ruta `/periodismo` en el router.** Los enlaces hacia el sitio son
  `<a href>` normales, no `RouterLink`: tiene que haber navegación real del
  navegador para salir de la SPA. Las carpetas de `PortadaView` abren
  `/periodismo/investigaciones/<slug>/`.
- En dev, el plugin `periodismoEstatico` de `vite.config.ts` sirve esas rutas;
  sin él el fallback de SPA de Vite devuelve el 404 de la app. En producción lo
  resuelve el hosting, más las dos reglas de `public/_redirects`.
- Los ajustes nuestros sobre la entrega (titular del juego que no tape a los
  personajes, corcho vectorial, tarjetas más grandes, luces y flecha en
  "¿Quieres que investiguemos algo?") viven en `public/ajustes-periodismo/`,
  fuera de la carpeta de la entrega. Si llega una entrega nueva, volver a añadir
  `<link rel="stylesheet" href="/ajustes-periodismo/ajustes.css">` después de
  `game.css` en `public/periodismo/index.html`.
- `ajustes-periodismo/letra.js` sube el tamaño de letra de toda la entrega (ver
  "Tipografía" abajo) y `ajustes-periodismo/encaje.css` corrige lo poco que no
  entra con la letra grande (cabecera y lista de créditos). Los dos están
  enlazados antes de `</head>` en las 221 páginas (portada + `investigaciones/**`).
  Con una entrega nueva hay que re-inyectar ambos (`perl` sobre `</head>`), y
  subir el `?v=` al cambiar CSS o JS para saltar caché.
  `ajustes.css` sigue siendo solo de la portada: tiene reglas sobre `.obj`, `.cta`
  y `.mesa` que en un reportaje harían daño.
- `6e60fdfa0d2c5fad49aa11dbf1d063a5.txt` es la clave de IndexNow: no borrar ni
  renombrar.
- Requisitos del hosting (del documento de entrega): respuestas `206 Partial
  Content` para los audios recortados, MIME de `.m4a`, `.vtt` y `.webp`, y caché
  larga solo para `assets/`.


## Publicidad (funnel v3)

- **Nombres de archivo sin "ad" ni "publicidad".** Los bloqueadores de anuncios
  cortan cualquier descarga cuya URL parezca publicidad (`/publicidad/`, `AdChat`,
  `ads`, `banner`, `sponsor`…). Si cae un solo archivo, la vista entera no carga
  y `/publicidad` queda en blanco. Ya pasó con `components/publicidad/AdChat.vue`.
  Por eso la vista es `CampanaView.vue` y el resto `useCampana`, `useConsultas`,
  `catalogo`, `respuestas`, `ChatConsultas`. La URL `/publicidad` sí puede
  quedarse: los bloqueadores no bloquean el documento principal. Lo mismo
  aplica a clases CSS: no usar `.ad`, `.ads`, `.publicidad`, `.banner`.

- **Fuente única de verdad comercial**: `src/config/catalogo.ts` (productos, precios, reglas `AD_RULES`, categorías con brand safety, opciones del configurador). Nunca hardcodear precios en componentes.
- **Base aprobada del chat**: `src/config/respuestas.ts`. El asistente solo responde desde ahí; si no hay coincidencia confiable escala a humano (formulario → webhook contacto con tag `pregunta-humana-publicidad` + transcript).
- **Estado**: `useAdFunnel()` en `src/composables/useCampana.ts` (singleton, persiste en `localStorage.ad_funnel_state`) y `useAdChat()` en `src/composables/useConsultas.ts` (`localStorage.ad_chat`). El chat es `src/components/campana/ChatConsultas.vue`. Preguntar nunca saca al cliente del checkout.
- **Carriles**: A = 1 mes (self-serve), B = 6/12 meses bajo umbral, C = presupuesto ≥ 3000/mes + ≥ 6 meses + brand safety approved + decisor → habilita `/agendar`.
- **Webhooks**: `src/services/GhlWebhookService.ts` (fetch a `VITE_GHL_WEBHOOK_CONTACT` / `VITE_GHL_WEBHOOK_OPPORTUNITY`, con campos `ad_*` y tags del handoff). Pago online aún no integrado: el flujo A promete "enlace de pago por correo".
- **Analítica**: `trackAdEvent()` hace push a `window.dataLayer` con los eventos `ad_*` del handoff §11. `ad_zoom_booked` lo dispara `AgendarView` al detectar el booking.
- **Etapas de pipeline**: `syncStage(etapa)` en `useCampana.ts` empuja "Configurador iniciado", "Recomendación generada", "Checkout iniciado / propuesta enviada" y "Pregunta pendiente" a GHL *en cuanto se conoce el correo*, con dedupe en `localStorage.ad_stage_sent`. Sin ese push temprano GHL no puede recordar carritos abandonados (§8A): el tag `checkout-abandonado` lo aplica un workflow de GHL sobre las oportunidades que se quedan en "Checkout iniciado".
- **Candado del calendario**: el carril C escribe `localStorage.ad_zoom_unlocked`. El guard de `/agendar` bloquea a quien tenga `ad_funnel_state` sin esa llave y lo devuelve a `/publicidad`. Quien llega por el media kit (sin estado de funnel) mantiene el flujo de siempre.
- **Pago**: no hay pasarela. El carril A cierra con `ad_checkout_status: 'payment_pending'` y etapa "Pago pendiente"; el enlace de pago lo manda un workflow de GHL.

## Tipografía

El cliente pidió letra grande en todas partes y que el usuario pueda agrandarla
más desde su navegador. Dos reglas, una sola curva:

- **Todo en `rem`, nunca en `px`.** `html` se queda en `font-size: 100%`
  (`src/styles/global.scss`) para que el rem parta del tamaño que el usuario
  tenga configurado. Nunca poner ahí `62.5%` ni un valor en px: rompe el que el
  texto crezca con la configuración del navegador.
- **La curva** (misma en `src/` y en `ajustes-periodismo/letra.js`):
  `nuevo = viejo + (40 - viejo) / 4` para tamaños menores a 40px; de 40px para
  arriba no se toca. La letra chica sube mucho y los titulares casi nada, así que
  la jerarquía se mantiene. En números: 11px→1.14rem, 13px→1.23rem, 15px→1.33rem,
  17px→1.42rem, 20px→1.56rem, 24px→1.75rem, 32px→2.13rem.
- Si hay que volver a subirla, se cambia `BONO`/`TOPE` en los dos lados y se
  vuelve a medir el desborde horizontal a 1920/1440/1280/1024/834/390 px y con
  `font-size` de raíz en 16/20/24px. La app y periodismo están verificados sin
  desborde en esa matriz.

## Header Rule

**Only `MediaKitView` uses `<MKHeader />`** (its "Inicio" apunta a `/media-kit`). All other views (PortadaView, CampanaView, AgendarView, PreciosView, QuienesSomosView) have their own minimal topbar. Never add MKHeader to sub-pages — causes double header collision.

## Lead Capture Flow

1. **Modal Step 1** → contact info → fires `VITE_GHL_WEBHOOK_CONTACT` → stores `mk_contact_given` in localStorage
2. **Qualify Gate** → friendlier tone; user types `"Estoy interesado, [nombre]"`; auto-filled if returning visitor; offers "Solo quiero ver precios" escape to `/precios`
3. **Modal Step 2** → qualification form → fires `VITE_GHL_WEBHOOK_OPPORTUNITY`
4. **Success (Step 3)** → CTA to `/agendar`

**localStorage key:** `mk_contact_given` — JSON `{ nombre, apellido, correo, telefono }` — shared between modal, `/precios` gate, and `/agendar` guard

## AgendarView Guard

On mount `/agendar` checks:
1. Query params present (`firstName`/`email`/`phone`) → load calendar pre-filled
2. No params but localStorage exists → `router.replace('/agendar?firstName=...') ` (auto-fill from storage)
3. Neither → show friendly redirect screen for 3s then push to `/`

## GHL Integration

- **Contact webhook** (`VITE_GHL_WEBHOOK_CONTACT`): fires on Step 1 of lead modal
- **Opportunity webhook** (`VITE_GHL_WEBHOOK_OPPORTUNITY`): fires on Step 2 with full scoring payload
- **Calendar widget ID**: `nTTnsK8xbyunduMneyc3`
- **Booking detected via**: `postMessage` array `['msgsndr-booking-complete', {...}]`
- **Disqualification**: only if `presupuesto === 'menos_500'`
- **Pipeline**: "Media Kit Andersson y Moni" — stages: Nuevo Lead Caliente, Nuevo Lead Tibio, Lead Frío, Cita Agendada, Negociando, Ganado, Perdido

## Architecture

Vue 3 + TypeScript SPA using Composition API, Pinia, Vue Router 4, and Axios. Package manager is **pnpm**.

### Key patterns

**API layer** (`src/services/httpBase.ts`): All HTTP services extend `APIBase`. It auto-attaches `Authorization: Bearer <token>` from `localStorage.access_token`, normalizes the base URL to always end in `/api`, and dispatches a global `auth:token-expired` custom event on 401. Errors are normalized to `{ status, message, data }` (see `src/types/index.ts`). Never use axios directly — extend `APIBase` instead.

**Auth flow**: Token stored in `localStorage` as `access_token`. Router guard (`src/router/index.ts`) redirects unauthenticated users away from routes with `meta.requiresAuth`. The Pinia user store (`src/stores/user.ts`) exposes `hydrate()` (call on app boot), `setUser()`, and `clear()` (also clears localStorage).

**Styles**: Global SCSS is imported once in `main.ts`. All components get `@/styles/index.scss` auto-injected via Vite's `additionalData`, so color variables and font mixins are available everywhere without explicit imports.

**Path alias**: `@` maps to `src/`.

### Adding a new feature

1. Create a service in `src/services/` extending `APIBase`
2. Add a Pinia store in `src/stores/` if state is needed
3. Add views in `src/views/` and register routes in `src/router/index.ts` with `meta: { requiresAuth: true }` for protected routes
4. Define shared types in `src/types/index.ts`

# CLAUDE.md - Token Efficient Rules

1. Think before acting. Read existing files before writing code.
2. Be concise in output but thorough in reasoning.
3. Prefer editing over rewriting whole files.
4. Do not re-read files you have already read unless the file may have changed.
5. Test your code before declaring done.
6. No sycophantic openers or closing fluff.
7. Keep solutions simple and direct.
8. User instructions always override this file.
