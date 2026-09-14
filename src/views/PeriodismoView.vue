<script setup lang="ts">
import { onBeforeUnmount, onMounted, nextTick } from 'vue'

import PIntro from '@/components/periodismo/PIntro.vue'
import PTopbar from '@/components/periodismo/PTopbar.vue'
import PPortadaJugable from '@/components/periodismo/PPortadaJugable.vue'
import PMesa from '@/components/periodismo/PMesa.vue'
import PConsecuencias from '@/components/periodismo/PConsecuencias.vue'
import PConexiones from '@/components/periodismo/PConexiones.vue'
import PInvestiguemos from '@/components/periodismo/PInvestiguemos.vue'
import PQuienesSomos from '@/components/periodismo/PQuienesSomos.vue'
import PFooter from '@/components/periodismo/PFooter.vue'

import tituloJuego from '@/periodismo/html/titulo-juego.html?raw'
import { montarEstilos, desmontarEstilos, montarScripts, desmontarScripts } from '@/periodismo/runtime'

/**
 * Investigaciones · Boscán & La Moni.
 *
 * El marcado viene de los fragmentos en `src/periodismo/html/` (uno por
 * sección, más uno por expediente) y el comportamiento de los módulos en
 * `src/periodismo/scripts/`. Ver `src/periodismo/runtime.ts`.
 */
onMounted(async () => {
  montarEstilos()
  document.body.classList.add('home')
  await nextTick()
  montarScripts()
})

onBeforeUnmount(() => {
  desmontarScripts()
  document.body.classList.remove('home')
  desmontarEstilos()
})
</script>

<template>
  <div class="periodismo">
    <PIntro />
    <PTopbar />
    <PPortadaJugable />
    <PMesa />
    <PConsecuencias />
    <PConexiones />
    <PInvestiguemos />
    <PQuienesSomos />
    <PFooter />
    <!-- Plantilla del titular que el juego clona sobre la portada. -->
    <div hidden v-html="tituloJuego" />
  </div>
</template>
