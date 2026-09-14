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
| `/media-kit` | `MediaKitView.vue` | 10-section media kit (antes vivía en `/`) |
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
- `6e60fdfa0d2c5fad49aa11dbf1d063a5.txt` es la clave de IndexNow: no borrar ni
  renombrar.
- Requisitos del hosting (del documento de entrega): respuestas `206 Partial
  Content` para los audios recortados, MIME de `.m4a`, `.vtt` y `.webp`, y caché
  larga solo para `assets/`.


## Publicidad (funnel v3)

- **Fuente única de verdad comercial**: `src/config/adProducts.ts` (productos, precios, reglas `AD_RULES`, categorías con brand safety, opciones del configurador). Nunca hardcodear precios en componentes.
- **Base aprobada del chat**: `src/config/adKnowledge.ts`. El asistente solo responde desde ahí; si no hay coincidencia confiable escala a humano (formulario → webhook contacto con tag `pregunta-humana-publicidad` + transcript).
- **Estado**: `useAdFunnel()` (singleton, persiste en `localStorage.ad_funnel_state`) y `useAdChat()` (`localStorage.ad_chat`). Preguntar nunca saca al cliente del checkout.
- **Carriles**: A = 1 mes (self-serve), B = 6/12 meses bajo umbral, C = presupuesto ≥ 3000/mes + ≥ 6 meses + brand safety approved + decisor → habilita `/agendar`.
- **Webhooks**: `src/services/GhlWebhookService.ts` (fetch a `VITE_GHL_WEBHOOK_CONTACT` / `VITE_GHL_WEBHOOK_OPPORTUNITY`, con campos `ad_*` y tags del handoff). Pago online aún no integrado: el flujo A promete "enlace de pago por correo".
- **Analítica**: `trackAdEvent()` hace push a `window.dataLayer` con los eventos `ad_*` del handoff §11.

## Header Rule

**Only `MediaKitView` uses `<MKHeader />`** (its "Inicio" apunta a `/media-kit`). All other views (PortadaView, PublicidadView, AgendarView, PreciosView, QuienesSomosView) have their own minimal topbar. Never add MKHeader to sub-pages — causes double header collision.

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
