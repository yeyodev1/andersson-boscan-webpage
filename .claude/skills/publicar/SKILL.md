---
name: publicar
description: Sube a boscanymoni.com los cambios hechos en el proyecto y confirma que quedaron en línea, o deshace la última publicación. Úsala cuando la persona diga "publica", "súbelo", "súbelo a la web", "haz commit y push", "que se vea en la página", "deshaz el último cambio", "regrésalo como estaba", o justo después de terminar un cambio que pidió para el sitio.
---

# Publicar en boscanymoni.com

Quien la usa normalmente es Andersson: no es programador. Háblale corto, en
español y sin jerga (nada de "commit", "rebase", "build"; di "guardar",
"publicar", "revisar que no se rompa nada").

Publicar = push a `main`. Vercel despliega solo en 1-2 minutos. No hay otro paso.

## Publicar un cambio

1. **Resumen y visto bueno.** Muestra en 2-4 viñetas qué cambia, en palabras
   de lo que se ve en la página. Si la persona ya dijo "publícalo" junto con el
   pedido, no vuelvas a preguntar.
2. **Revisar que no se rompa nada:** `pnpm build`. Si falla, arregla el error
   (es casi siempre del cambio recién hecho) y repite. Si no sale en dos
   intentos, no publiques: explica qué pasa y sugiere avisar a Diego.
   Si falla porque faltan dependencias, corre antes `pnpm install`.
3. **Guardar:** `git add` solo de los archivos del cambio (nunca `.env` ni
   nada de `dist/`), y `git commit` con un mensaje claro en español, estilo
   `tipo(área): qué cambió` (p. ej. `fix(publicidad): corrige el correo del pie`).
4. **Tomar la versión en línea:** `curl -s https://boscanymoni.com/version.json`
   y guarda el `id`.
5. **Subir:** `git pull --rebase` y luego `git push`. Si el pull trae
   conflictos, no los resuelvas a ciegas: `git rebase --abort`, explícale que
   Diego cambió lo mismo y que hay que coordinar.
6. **Confirmar que está en línea:** `bash scripts/esperar-deploy.sh <id del paso 4>`
   (puede tardar hasta 8 min; córrelo en segundo plano si tu entorno lo permite).
   - Si responde ✓: dile que ya está publicado y dale el enlace exacto de la
     página que cambió (`https://boscanymoni.com/...`). Recuérdale que si la
     tenía abierta, se recarga sola con un aviso.
   - Si responde ✗: el build falló en Vercel. Ofrece deshacer (abajo) y que
     avise a Diego.

## Deshacer la última publicación

1. `git log --oneline -5` y dile en palabras qué fue lo último publicado.
2. Con su visto bueno: `git revert --no-edit HEAD` (si fue una entrega de
   periodismo grande, igual sirve), luego pasos 4, 5 y 6 de arriba.
3. Nunca `git reset --hard` ni `git push --force`: están bloqueados a propósito.

## Reglas

- `public/periodismo/` no se edita a mano. Para cambiar una investigación,
  Andersson corrige en su proyecto (`build.py`) y sube la entrega con la skill
  `subir-entrega`.
- Precios y formatos de publicidad: solo en `src/config/catalogo.ts`.
- Rutas nuevas del router: también en `vercel.json` y `public/_redirects`
  (ver CLAUDE.md), o darán 404.
