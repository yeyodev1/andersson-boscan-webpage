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
| `/` | `MediaKitView.vue` | 10-section media kit |
| `/quienes-somos` | `QuienesSomosView.vue` | Standalone about page |
| `/agendar` | `AgendarView.vue` | GHL calendar embed (qualified leads only) |
| `/precios` | `PreciosView.vue` | Full pricing table — gated behind contact form; skips gate if `mk_contact_given` in localStorage |

## Header Rule

**Only `MediaKitView` uses `<MKHeader />`**. All other views (AgendarView, PreciosView, QuienesSomosView) have their own minimal topbar. Never add MKHeader to sub-pages — causes double header collision.

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
