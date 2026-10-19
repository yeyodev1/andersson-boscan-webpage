<script setup lang="ts">
/**
 * Cuando se publica una versión nueva del sitio, el visitante que lo tenga
 * abierto ve un modal bloqueante y recarga. Compara el __ID_BUILD__ del bundle
 * con dist/version.json (que escribe el plugin versionJson de vite.config.ts)
 * cada 3 minutos y al volver a la pestaña. En dev no hace nada.
 */
import { ref, onMounted, onUnmounted } from 'vue'

const hayVersionNueva = ref(false)
let intervalo: ReturnType<typeof setInterval> | undefined

async function revisarVersion() {
  if (hayVersionNueva.value) return
  try {
    const res = await fetch('/version.json', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    if (data?.id && data.id !== __ID_BUILD__) hayVersionNueva.value = true
  } catch {
    // Sin red o archivo ausente: no molestar al visitante
  }
}

function alVolverALaPestana() {
  if (document.visibilityState === 'visible') revisarVersion()
}

function actualizar() {
  window.location.reload()
}

onMounted(() => {
  if (!import.meta.env.PROD) return
  intervalo = setInterval(revisarVersion, 3 * 60 * 1000)
  document.addEventListener('visibilitychange', alVolverALaPestana)
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
  document.removeEventListener('visibilitychange', alVolverALaPestana)
})
</script>

<template>
  <Transition name="aviso-fade">
    <div v-if="hayVersionNueva" class="aviso-overlay" role="alertdialog" aria-modal="true" aria-labelledby="aviso-titulo">
      <div class="aviso-caja">
        <div class="aviso-icono"><i class="fa-solid fa-rotate"></i></div>
        <h2 id="aviso-titulo" class="aviso-titulo">El sitio se ha actualizado</h2>
        <p class="aviso-texto">
          Hay una versión nueva disponible. Actualiza para seguir navegando con la última versión.
        </p>
        <button class="aviso-boton" @click="actualizar">Actualizar ahora</button>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.aviso-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(8, 8, 8, 0.88);
  backdrop-filter: blur(4px);
}

.aviso-caja {
  max-width: 26rem;
  width: 100%;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}

.aviso-icono {
  font-size: 2.1rem;
  color: #c8392b;
  margin-bottom: 1rem;
}

.aviso-titulo {
  color: #fff;
  font-size: 1.7rem;
  margin-bottom: 0.75rem;
}

.aviso-texto {
  color: #a0a0a0;
  font-size: 1.3rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.aviso-boton {
  background: #fff;
  color: #111;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 2rem;
  font-size: 1.35rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
  }
}

.aviso-fade-enter-active,
.aviso-fade-leave-active {
  transition: opacity 0.3s ease;
}

.aviso-fade-enter-from,
.aviso-fade-leave-to {
  opacity: 0;
}
</style>
