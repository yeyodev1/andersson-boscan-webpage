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
| `/periodismo` | `PeriodismoView.vue` | Componentes Vue reales (ver "Periodismo" abajo). Migrado desde el artifact "Investigaciones · Boscán & La Moni"; ya no hay iframe ni HTML estático. |
| `/periodismo/:slug` | `PeriodismoCasoView.vue` | **Provisional.** Cada uno de los 35 expedientes vive todavía como artifact aparte de Andersson, no compartido. Esta vista evita que los 105 enlaces caigan en el 404. |
| `/publicidad` | `PublicidadView.vue` | Funnel v3 (ver `~/Downloads/handoff-desarrollador-sistema-ventas-publicidad-boscan-la-moni-v3-2026-09-06.md`): hero → configurador (objetivo, duración, datos) → máx. 2 recomendaciones → checkout por carril (A compra / B propuesta / C key account → `/agendar`) → briefing. Chat "Tengo una pregunta" siempre visible. |
| `/media-kit` | `MediaKitView.vue` | 10-section media kit (antes vivía en `/`) |
| `/quienes-somos` | `QuienesSomosView.vue` | Standalone about page |
| `/agendar` | `AgendarView.vue` | GHL calendar embed (qualified leads only) |
| `/precios` | `PreciosView.vue` | Full pricing table — gated behind contact form; skips gate if `mk_contact_given` in localStorage |

## Periodismo (migrado del artifact)

El artifact original era un documento suelto de 6 MB. Se partió así:

- `src/periodismo/html/` — un fragmento por sección, más `html/expedientes/NNN-<slug>.html` (uno por expediente, 35).
- `src/periodismo/styles/` — el CSS del artifact tal cual, más `_ua-defaults.css`, que devuelve dentro de `.home` los márgenes que borra el reset global `* { margin: 0 }` de `styles/index.scss`. Sin eso los párrafos quedan pegados.
- `src/periodismo/scripts/` — los 8 módulos vanilla (`BM3D`, física, avatares, escenografía, `BMGame`, portada, comportamientos, montaje). Eran IIFE que corrían al parsearse; se envolvieron en `export default function init()`.
- `src/periodismo/data/` — `home-data.json` (35 casos + 54 personas), `structured-data.json`, `slug-map.json` y `head-meta.html` como referencia.
- `public/periodismo/assets/` — los ~95 data-URIs extraídos a archivos, más los 6 sprites del juego.

`src/periodismo/runtime.ts` es el ciclo de vida: inyecta las fuentes de Google que el artifact cargaba en su `<head>` (sin ellas el titular se desborda), el CSS y el JSON-LD al montar, los retira al desmontar, y llama a los `init()` en el orden del documento original. `PeriodismoView` añade `body.home` (el CSS depende de esa clase) y destruye el juego WebGL en `onBeforeUnmount` vía `window.portadaJugable.destroy()`.

**Reglas:**
- El marcado no se reescribe a mano: los componentes montan los fragmentos con `v-html` para conservarlo igual al artifact. Para cambiar contenido, se edita el fragmento.
- El CSS del artifact usa selectores genéricos (`.obj`, `.mesa`, `.wrap`) y toca `html`/`body`. Nunca importarlo globalmente: solo se inyecta mientras la vista está montada.
- Verificado contra el artifact original: mismas seis secciones, 35 expedientes, misma altura de documento y cero diferencia de píxeles en las seis capturas.


## Publicidad (funnel v3)

- **Fuente única de verdad comercial**: `src/config/adProducts.ts` (productos, precios, reglas `AD_RULES`, categorías con brand safety, opciones del configurador). Nunca hardcodear precios en componentes.
- **Base aprobada del chat**: `src/config/adKnowledge.ts`. El asistente solo responde desde ahí; si no hay coincidencia confiable escala a humano (formulario → webhook contacto con tag `pregunta-humana-publicidad` + transcript).
- **Estado**: `useAdFunnel()` (singleton, persiste en `localStorage.ad_funnel_state`) y `useAdChat()` (`localStorage.ad_chat`). Preguntar nunca saca al cliente del checkout.
- **Carriles**: A = 1 mes (self-serve), B = 6/12 meses bajo umbral, C = presupuesto ≥ 3000/mes + ≥ 6 meses + brand safety approved + decisor → habilita `/agendar`.
- **Webhooks**: `src/services/GhlWebhookService.ts` (fetch a `VITE_GHL_WEBHOOK_CONTACT` / `VITE_GHL_WEBHOOK_OPPORTUNITY`, con campos `ad_*` y tags del handoff). Pago online aún no integrado: el flujo A promete "enlace de pago por correo".
- **Analítica**: `trackAdEvent()` hace push a `window.dataLayer` con los eventos `ad_*` del handoff §11.

## Header Rule

**Only `MediaKitView` uses `<MKHeader />`** (its "Inicio" apunta a `/media-kit`). All other views (PortadaView, PeriodismoView, PublicidadView, AgendarView, PreciosView, QuienesSomosView) have their own minimal topbar. Never add MKHeader to sub-pages — causes double header collision.

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
