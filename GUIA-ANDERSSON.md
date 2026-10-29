# Guía para Andersson: cambiar tu página web desde Claude

Le pides los cambios a Claude en lenguaje normal, él los hace, revisa que no
se rompa nada, los publica en **boscanymoni.com** y te avisa cuando ya están
en línea (1-2 minutos). No necesitas saber programar ni tener cuenta de GitHub.

## Preparar tu computadora (una sola vez, ~15 min)

Necesitas una cuenta de Claude con plan Pro o Max (la misma de claude.ai).

1. **Instala Claude Code.** Abre la app Terminal y pega:

   ```
   curl -fsSL https://claude.ai/install.sh | bash
   ```

2. **Instala las herramientas del proyecto** (pnpm y Node):

   ```
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   ```

   Cierra la Terminal, ábrela de nuevo y pega:

   ```
   pnpm env use --global lts
   ```

3. **Guarda tu llave.** Diego te manda por WhatsApp un archivo llamado
   `boscanymoni`: es tu llave de acceso al proyecto. Trátala como una
   contraseña: no la reenvíes. Descárgalo a tu carpeta de Descargas y pega:

   ```
   mkdir -p ~/.ssh
   mv ~/Downloads/boscanymoni ~/.ssh/boscanymoni
   chmod 600 ~/.ssh/boscanymoni
   ```

4. **Descarga el proyecto:**

   ```
   cd ~
   git clone -c core.sshCommand="ssh -i ~/.ssh/boscanymoni -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" git@github.com:yeyodev1/andersson-boscan-webpage.git
   cd andersson-boscan-webpage
   pnpm install
   ```

   Si la Mac te pide instalar "herramientas de línea de comandos", acepta y
   vuelve a pegar el `git clone`.

5. **Abre Claude** dentro del proyecto:

   ```
   claude
   ```

   La primera vez te pide iniciar sesión con tu cuenta de Claude y te pregunta
   si confías en la carpeta: di que sí.

## Cada vez que quieras cambiar algo

Abre la Terminal y pega:

```
cd ~/andersson-boscan-webpage && claude
```

Al abrir, Claude trae solo la última versión de la página. Luego pide lo que
quieras, como si fuera un mensaje:

> "Cambia el correo de contacto del pie de página a pauta@..."
> "En la página de publicidad, el primer paso debería decir..."
> "Sube el precio del TikTok patrocinado a 900."
> "Publícalo."

Claude hace el cambio, te lo resume, lo publica y te confirma con el enlace
cuando ya se ve en la web. Si lo pides todo junto ("cambia X y publícalo"),
no te vuelve a preguntar.

### Subir tus investigaciones

Cuando generes el sitio con tu `build.py` (un expediente nuevo o una
corrección), dile:

> "Sube mi entrega nueva de periodismo, está en Descargas."

Puede ser la carpeta que sale de `build.py` o un `.zip`. Claude reemplaza el
sitio de investigaciones, le vuelve a poner los ajustes de diseño y de letra
grande, actualiza la lista para buscadores e IA, y lo publica. Si en la
entrega falta algún expediente que hoy está publicado, te pregunta antes de
quitarlo.

### Si algo sale mal

> "Deshaz lo último que publicaste."

Claude regresa la página a como estaba antes y lo publica. Si se traba o algo
se ve raro, avísale a Diego (dreyes@bakano.ec).

## Reglas de la casa

- Las investigaciones se corrigen **en tu proyecto de `build.py`** y se suben
  como entrega nueva; Claude no las edita a mano dentro de la página.
- Los precios y formatos de publicidad viven en un solo lugar
  (`src/config/catalogo.ts`); Claude ya lo sabe.
- La llave solo abre este proyecto. Si crees que se filtró, avísale a Diego:
  él la anula al instante y te manda otra (repites los pasos 3 y 4).

## Tu acceso al panel del sitio

En **https://boscanymoni.com/acceso-eureka** (ruta secreta: no está enlazada
desde ninguna página ni aparece en buscadores) entras con tu correo
anderssonboscan@gmail.com y tu clave. De ahí pasas al panel de integraciones.

Cuando se publica una versión nueva, quien tenga la página abierta ve un aviso
de "sitio actualizado" y se le recarga sola.
