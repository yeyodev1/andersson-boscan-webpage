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
```

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
