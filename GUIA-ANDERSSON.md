# Guía para Andersson: pedir cambios al sitio desde Claude

Este repositorio trae configurado el servidor **MCP de GitHub** (archivo
`.mcp.json`). Con eso, Claude puede leer el proyecto en GitHub, hacer cambios
y mandar la actualización directamente, sin que tengas que saber git.

## Conectarte (una sola vez)

**No necesitas cuenta de GitHub.** Diego te pasa por WhatsApp un **token de
acceso** (una clave larga que empieza con `github_pat_`). Trátalo como una
contraseña: no lo pegues en correos, chats públicos ni en el sitio.

1. Instala Claude Code: en una terminal, `npm install -g @anthropic-ai/claude-code`
   (o descarga la app de escritorio desde claude.ai/code).
2. Descarga el proyecto con el token (reemplaza `TU_TOKEN`):

   ```
   git clone https://x-access-token:TU_TOKEN@github.com/yeyodev1/andersson-boscan-webpage.git
   cd andersson-boscan-webpage
   ```

   Con eso, publicar y deshacer cambios ya funciona sin pedirte usuario ni
   contraseña: el token queda guardado en la carpeta del proyecto.
3. Deja el token disponible también para las herramientas de GitHub de Claude
   (una sola vez; reemplaza `TU_TOKEN`):

   ```
   echo 'export GITHUB_PAT=TU_TOKEN' >> ~/.zshrc
   ```

   Cierra y vuelve a abrir la terminal después de hacerlo.
4. Escribe `claude` para abrir Claude Code dentro de la carpeta y pide tu
   primer cambio.

Si el token caduca o deja de funcionar, pídele uno nuevo a Diego y repite los
pasos 2 y 3 (o pídele a Claude: "actualiza el token del proyecto a ...").

## Pedir un cambio

Escríbelo en lenguaje normal, como un mensaje:

> "Cambia el correo de contacto del pie de página a pauta@..."
> "En la página de publicidad, el texto del primer paso debería decir..."
> "Sube la última entrega de periodismo que está en esta carpeta."

Y para mandarlo al proyecto:

> "Haz commit y súbelo a GitHub."

Claude hace el cambio, lo confirma contigo y lo empuja al repositorio. El
hosting publica automáticamente lo que llega a la rama `main`.

## Reglas de la casa (importantes)

- **No toques `public/periodismo/` a mano**: esa carpeta es tu propia entrega
  generada con `build.py`; se reemplaza entera con cada entrega nueva.
- Los precios y formatos viven en `src/config/catalogo.ts`: si cambias un
  precio, pídelo ahí ("cambia el precio del TikTok patrocinado a...").
- Si algo sale raro, dile a Claude "deshaz el último cambio" o avísale a Diego
  (dreyes@bakano.ec).
- El token que te dio Diego solo sirve para este proyecto. Si crees que se
  filtró, avísale de una: él lo anula y te manda otro.

## Tu acceso al panel del sitio

En **https://boscanymoni.com/acceso-eureka** (ruta secreta: no está enlazada
desde ninguna página ni aparece en buscadores) puedes entrar con tu correo
anderssonboscan@gmail.com y tu clave. De ahí pasas al panel de integraciones,
donde también está el resumen de cómo pedir cambios con Claude.

## Publicar y deshacer cambios

- **Publicar**: dile a Claude "haz commit con un mensaje claro y pushea a main".
  La primera vez Claude te pedirá confirmar los comandos de git: elige
  "permitir siempre" y no te vuelve a preguntar.
- **Deshacer**: "revierte el último commit y pushea". Eso regresa el sitio a
  como estaba antes.
- Cuando se publica una versión nueva, los visitantes que tengan el sitio
  abierto ven un aviso de "sitio actualizado" y se les recarga la página.
