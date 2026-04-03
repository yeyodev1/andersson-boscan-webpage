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
