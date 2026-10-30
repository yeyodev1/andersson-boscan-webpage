<script setup lang="ts">
import { ref } from 'vue'

// Página /mcp: con el código, entrega la URL del conector MCP del sitio para
// pegarla en Claude. El código se valida en /api/acceso-mcp (nunca aquí).
const codigo = ref('')
const url = ref('')
const error = ref('')
const cargando = ref(false)
const copiado = ref(false)

async function entrar() {
  if (!codigo.value.trim() || cargando.value) return
  cargando.value = true
  error.value = ''
  try {
    const r = await fetch('/api/acceso-mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: codigo.value.trim() }),
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(d.error || 'No se pudo verificar el código.')
    url.value = d.url
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    cargando.value = false
  }
}

async function copiar() {
  await navigator.clipboard.writeText(url.value)
  copiado.value = true
  setTimeout(() => (copiado.value = false), 2500)
}

// ── Subir archivos para Claude ───────────────────────────────────────────
// Claude no puede mandar fotos por el conector: Andersson las sube aquí
// (/api/subir) y Claude las publica con ver_subidas + publicar_cambios.
// Vercel acepta hasta 4.5 MB por petición: las fotos más pesadas se achican.
const MAX = 4_000_000
const IGNORAR = /(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db|\.git)(\/|$)/

type Pieza = { ruta: string; datos: Blob }
const piezas = ref<Pieza[]>([])
const rechazados = ref<string[]>([])
const subiendo = ref(false)
const progreso = ref('')
const errorSubida = ref('')
const subidos = ref<string[]>([])
const arrastrando = ref(false)

const mb = (n: number) => `${(n / 1e6).toFixed(1)} MB`

async function achicar(ruta: string, datos: Blob): Promise<Blob | null> {
  const tipo = /\.png$/i.test(ruta) ? 'image/png' : /\.webp$/i.test(ruta) ? 'image/webp' : 'image/jpeg'
  const img = await createImageBitmap(datos).catch(() => null)
  if (!img) return null
  for (let escala = Math.min(1, 3000 / Math.max(img.width, img.height)); escala > 0.1; escala *= 0.8) {
    const lienzo = document.createElement('canvas')
    lienzo.width = Math.round(img.width * escala)
    lienzo.height = Math.round(img.height * escala)
    lienzo.getContext('2d')!.drawImage(img, 0, 0, lienzo.width, lienzo.height)
    const b = await new Promise<Blob | null>((r) => lienzo.toBlob(r, tipo, 0.85))
    if (b && b.size <= MAX) return b
  }
  return null
}

async function agregar(ruta: string, datos: Blob) {
  ruta = ruta.replace(/\\/g, '/').replace(/^\/+/, '')
  if (!ruta || IGNORAR.test(ruta)) return
  if (/\.zip$/i.test(ruta)) {
    const { unzipSync } = await import('fflate')
    const dentro = unzipSync(new Uint8Array(await datos.arrayBuffer()))
    for (const [nombre, bytes] of Object.entries(dentro))
      if (!nombre.endsWith('/')) await agregar(nombre, new Blob([bytes as Uint8Array<ArrayBuffer>]))
    return
  }
  if (datos.size > MAX && /\.(jpe?g|png|webp)$/i.test(ruta)) {
    const chica = await achicar(ruta, datos)
    if (chica) datos = chica
  }
  if (datos.size > MAX) {
    const video = /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(ruta)
    rechazados.value.push(
      `${ruta} (${mb(datos.size)}): ${video ? 'los videos van en YouTube; pásale el enlace a Claude' : 'pesa más de 4 MB; compártelo en Google Drive y pásale el enlace a Claude'}`,
    )
    return
  }
  piezas.value = [...piezas.value.filter((p) => p.ruta !== ruta), { ruta, datos }]
}

async function elegir(e: Event) {
  const input = e.target as HTMLInputElement
  subidos.value = []
  for (const f of Array.from(input.files ?? [])) await agregar(f.webkitRelativePath || f.name, f)
  input.value = ''
}

// Al soltar carpetas, el navegador entrega "entradas" que hay que recorrer.
async function leerEntrada(entrada: FileSystemEntry, base = ''): Promise<void> {
  if (entrada.isFile) {
    const f = await new Promise<File>((r, x) => (entrada as FileSystemFileEntry).file(r, x))
    return agregar(base + f.name, f)
  }
  const lector = (entrada as FileSystemDirectoryEntry).createReader()
  for (;;) {
    const lote = await new Promise<FileSystemEntry[]>((r, x) => lector.readEntries(r, x))
    if (!lote.length) return
    for (const hijo of lote) await leerEntrada(hijo, `${base}${entrada.name}/`)
  }
}

async function soltar(e: DragEvent) {
  arrastrando.value = false
  subidos.value = []
  const entradas = Array.from(e.dataTransfer?.items ?? [])
    .map((i) => i.webkitGetAsEntry())
    .filter((x): x is FileSystemEntry => !!x)
  for (const x of entradas) await leerEntrada(x)
}

async function enviar(cuerpo: BodyInit, json = false) {
  for (let intento = 0; ; intento++) {
    const r = await fetch('/api/subir', {
      method: 'POST',
      headers: { 'x-codigo': codigo.value.trim(), 'Content-Type': json ? 'application/json' : 'application/octet-stream' },
      body: cuerpo,
    })
    const d = await r.json().catch(() => ({}))
    if (r.status === 429 && intento < 2) {
      progreso.value = 'GitHub pidió una pausa; sigo en un minuto…'
      await new Promise((ok) => setTimeout(ok, 60_000))
      continue
    }
    if (!r.ok) throw new Error(d.error || 'No se pudo subir.')
    return d
  }
}

async function subir() {
  if (!piezas.value.length || subiendo.value) return
  subiendo.value = true
  errorSubida.value = ''
  try {
    const hechos: { ruta: string; sha: string }[] = []
    for (const [i, p] of piezas.value.entries()) {
      progreso.value = `Subiendo ${i + 1} de ${piezas.value.length}: ${p.ruta}`
      const { sha } = await enviar(p.datos)
      hechos.push({ ruta: p.ruta, sha })
    }
    progreso.value = 'Guardando…'
    await enviar(JSON.stringify({ archivos: hechos }), true)
    subidos.value = hechos.map((h) => h.ruta)
    piezas.value = []
    rechazados.value = []
  } catch (e) {
    errorSubida.value = (e as Error).message
  } finally {
    subiendo.value = false
    progreso.value = ''
  }
}
</script>

<template>
  <main class="conector">
    <div class="caja">
      <h1>Conecta tu página a Claude</h1>

      <form v-if="!url" class="paso" @submit.prevent="entrar">
        <label for="codigo">Escribe tu código de acceso</label>
        <input
          id="codigo"
          v-model="codigo"
          type="password"
          inputmode="numeric"
          autocomplete="off"
          autofocus
          placeholder="Código"
        />
        <button type="submit" :disabled="cargando || !codigo.trim()">
          {{ cargando ? 'Verificando…' : 'Entrar' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <template v-else>
        <p class="intro">Copia este enlace. Es tu llave para cambiar la página desde Claude: no lo compartas.</p>
        <div class="enlace">
          <code>{{ url }}</code>
          <button type="button" @click="copiar">{{ copiado ? '¡Copiado!' : 'Copiar' }}</button>
        </div>

        <ol class="pasos">
          <li>Abre <a href="https://claude.ai/settings/connectors" target="_blank" rel="noopener">claude.ai → Configuración → Conectores</a>.</li>
          <li>Toca <strong>Agregar conector personalizado</strong>.</li>
          <li>Nombre: <strong>Mi página web</strong>. URL: pega el enlace. Toca <strong>Agregar</strong>.</li>
          <li>Abre un chat nuevo y pide lo que quieras: <em>"En mi página, cambia el correo del pie a… y publícalo"</em>.</li>
        </ol>

        <p class="nota">
          Claude hace el cambio, lo publica y te avisa cuando ya se ve en boscanymoni.com (1-2 minutos).
          Si algo no te gusta: <em>"deshaz lo último que publicaste en mi página"</em>.
          Funciona en la web, en la app de escritorio y en el celular.
        </p>

        <section class="subir">
          <h2>Subir fotos, audios o una nota completa</h2>
          <p class="nota">
            Claude no puede recibir fotos por el conector. Súbelas aquí (archivos sueltos, una carpeta o un .zip)
            y luego dile en el chat: <em>"Ya subí los archivos, publícalos en…"</em>.
            Hasta 4 MB por archivo; las fotos más pesadas se achican solas. Los videos van en YouTube.
          </p>

          <div
            class="zona"
            :class="{ activa: arrastrando }"
            @dragover.prevent="arrastrando = true"
            @dragleave="arrastrando = false"
            @drop.prevent="soltar"
          >
            <span>Arrastra aquí archivos, carpetas o un .zip</span>
            <div class="botones">
              <label class="boton">Elegir archivos<input type="file" multiple hidden @change="elegir" /></label>
              <label class="boton">Elegir carpeta<input type="file" webkitdirectory hidden @change="elegir" /></label>
            </div>
          </div>

          <ul v-if="piezas.length" class="lista">
            <li v-for="p in piezas" :key="p.ruta">{{ p.ruta }} <small>{{ mb(p.datos.size) }}</small></li>
          </ul>
          <ul v-if="rechazados.length" class="lista rechazados">
            <li v-for="r in rechazados" :key="r">{{ r }}</li>
          </ul>

          <button v-if="piezas.length" type="button" :disabled="subiendo" @click="subir">
            {{ subiendo ? 'Subiendo…' : `Subir ${piezas.length} archivo${piezas.length === 1 ? '' : 's'}` }}
          </button>
          <p v-if="progreso" class="nota">{{ progreso }}</p>
          <p v-if="errorSubida" class="error">{{ errorSubida }}</p>
          <p v-if="subidos.length" class="listo">
            ✓ Listo: {{ subidos.length }} archivo{{ subidos.length === 1 ? '' : 's' }} esperando a Claude.
            Vuelve al chat y dile qué hacer con ellos.
          </p>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped lang="scss">
.conector {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1.25rem;
  background: #0a0a0a;
  color: #fff;
}

.caja {
  width: 100%;
  max-width: 40rem;
  background: #161616;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2.25rem 2rem;
}

h1 {
  font-size: 2rem;
  line-height: 1.2;
  margin: 0 0 1.5rem;
}

.paso {
  display: grid;
  gap: 0.85rem;

  label {
    font-size: 1.15rem;
    color: #bdbdbd;
  }
}

input {
  font: inherit;
  font-size: 1.4rem;
  letter-spacing: 0.15em;
  padding: 0.9rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: #0d0d0d;
  color: #fff;

  &:focus {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
}

button {
  font: inherit;
  font-size: 1.15rem;
  font-weight: 600;
  padding: 0.9rem 1.25rem;
  border: 0;
  border-radius: 0.6rem;
  background: #fff;
  color: #0a0a0a;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}

.error {
  color: #ff7b7b;
  font-size: 1.1rem;
  margin: 0;
}

.intro,
.nota {
  font-size: 1.15rem;
  line-height: 1.6;
  color: #bdbdbd;
}

.enlace {
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
  margin: 1rem 0 1.75rem;

  code {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 0.6rem;
    background: #0d0d0d;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}

.pasos {
  font-size: 1.15rem;
  line-height: 1.7;
  padding-left: 1.4rem;
  margin: 0 0 1.25rem;

  a {
    color: #fff;
  }
}

.subir {
  margin-top: 2.25rem;
  padding-top: 1.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  gap: 1rem;

  h2 {
    font-size: 1.5rem;
    margin: 0;
  }

  .nota {
    margin: 0;
  }
}

.zona {
  display: grid;
  gap: 1rem;
  justify-items: center;
  text-align: center;
  padding: 1.75rem 1rem;
  border: 2px dashed rgba(255, 255, 255, 0.25);
  border-radius: 0.8rem;
  font-size: 1.15rem;
  color: #bdbdbd;

  &.activa {
    border-color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }
}

.botones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.boton {
  font-size: 1.05rem;
  font-weight: 600;
  padding: 0.7rem 1.1rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  cursor: pointer;

  &:focus-within {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
}

.lista {
  margin: 0;
  padding-left: 1.2rem;
  max-height: 14rem;
  overflow: auto;
  font-size: 1rem;
  line-height: 1.6;
  overflow-wrap: anywhere;

  small {
    color: #8a8a8a;
  }

  &.rechazados {
    color: #ff7b7b;
  }
}

.listo {
  margin: 0;
  font-size: 1.15rem;
  color: #8be28b;
}

@media (max-width: 30rem) {
  .enlace {
    flex-direction: column;
  }
}
</style>
