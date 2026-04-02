---
name: Project Overview
description: High-level context for the Andersson Boscan frontend app — stack, status, and conventions
type: project
---

Vue 3 + TypeScript SPA (Vite 7, Pinia, Vue Router 4, Axios, GSAP 3) for the Andersson Boscan client, managed by Bakano.

**Why:** Client frontend project. A Media Kit page for "BOSCÁN & LA MONI 2026" has been built as the first major feature.

**How to apply:** Follow the existing layered pattern: services extend APIBase, state in Pinia stores, views in src/views, components in src/components/. Package manager is pnpm. No test runner configured yet.

## MediaKit feature (completed 2026-04-02)
- Route: `/mediakit`
- 10 full-screen sections, each a Vue SFC in `src/components/mediakit/`
- GSAP ScrollTrigger animations per section (parallax, stagger, counter bars)
- GSAP ScrollToPlugin for dot navigation
- 10 images extracted from the original HTML and saved to `public/images/` as actual files (no base64)
- Fonts: Bebas Neue, DM Sans, Playfair Display (loaded in MediaKitView non-scoped style)
- Color scheme: red #c8392b, gold #c9a84c, cream #f5f2ed, black #080808

## Images in public/images/
p1-cover.png, p2-photo.png, p3-hero.png, p4-photo-1.png, p4-photo-2.jpg,
p5-photo.jpg, p6-photo.png, p7-photo.png, p8-photo.png, p10-photo.png

Key env var: `VITE_API_BASE_URL` (defaults to `http://localhost:8100/api`).
Auth token stored in `localStorage` as `access_token`.
