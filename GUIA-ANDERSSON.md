# Guía para Andersson: pedir cambios al sitio desde Claude

Este repositorio trae configurado el servidor **MCP de GitHub** (archivo
`.mcp.json`). Con eso, Claude puede leer el proyecto en GitHub, hacer cambios
y mandar la actualización directamente, sin que tengas que saber git.

## Conectarte (una sola vez)

**No necesitas cuenta de GitHub.** Diego te manda por WhatsApp un archivo
llamado `boscanymoni`: es tu **llave de acceso** al proyecto. Trátala como una
contraseña: no la reenvíes ni la pegues en correos o chats públicos.

1. Instala Claude Code: en una terminal, `npm install -g @anthropic-ai/claude-code`
   (o descarga la app de escritorio desde claude.ai/code).
2. Guarda la llave (una sola vez). Descarga el archivo `boscanymoni` que te
   mandó Diego a tu carpeta de Descargas y pega esto en la terminal:

   ```
   mkdir -p ~/.ssh
   mv ~/Downloads/boscanymoni ~/.ssh/boscanymoni
   chmod 600 ~/.ssh/boscanymoni
   ```

3. Descarga el proyecto con la llave:

   ```
   git clone -c core.sshCommand="ssh -i ~/.ssh/boscanymoni -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" git@github.com:yeyodev1/andersson-boscan-webpage.git
   cd andersson-boscan-webpage
   ```

   Con eso, publicar y deshacer cambios ya funciona sin pedirte usuario ni
   contraseña: la llave queda asociada a la carpeta del proyecto.
4. Escribe `claude` para abrir Claude Code dentro de la carpeta y pide tu
   primer cambio.

Si la llave deja de funcionar, pídele una nueva a Diego y repite los pasos
2 y 3.

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
- La llave que te dio Diego solo sirve para este proyecto. Si crees que se
  filtró, avísale de una: él la anula y te manda otra.

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
