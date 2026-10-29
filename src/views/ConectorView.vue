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

@media (max-width: 30rem) {
  .enlace {
    flex-direction: column;
  }
}
</style>
