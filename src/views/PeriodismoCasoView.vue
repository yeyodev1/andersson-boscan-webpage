<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import homeData from '@/periodismo/data/home-data.json'

/**
 * PROVISIONAL. Cada expediente vive todavía como un artifact aparte de
 * Andersson, que no está compartido con nosotros. Mientras llegan, esta vista
 * evita que los 105 enlaces a /periodismo/<slug> caigan en el 404 del sitio.
 * Cuando tengamos los 35 HTML, esta vista se reemplaza por el contenido real.
 */
type Caso = { slug: string; titulo: string; anio: number }

const route = useRoute()
const caso = computed<Caso | undefined>(() =>
  (homeData.red.casos as Caso[]).find((c) => c.slug === route.params.slug),
)
</script>

<template>
  <main class="caso">
    <RouterLink class="caso__volver" to="/periodismo">← Volver a las investigaciones</RouterLink>
    <p class="caso__kicker">Expediente</p>
    <h1>{{ caso?.titulo ?? 'Expediente no encontrado' }}</h1>
    <p v-if="caso" class="caso__meta">{{ caso.anio }}</p>
    <p class="caso__nota">
      <template v-if="caso">El expediente completo se publica en los próximos días.</template>
      <template v-else>Ese expediente no está en el archivo.</template>
    </p>
  </main>
</template>

<style scoped>
.caso {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 40px clamp(20px, 5vw, 72px);
  background: #f5f0e8;
  color: #0a0a0a;
}
.caso h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(32px, 5vw, 64px);
  line-height: 1.05;
  margin: 0;
  max-width: 18ch;
}
.caso__volver { align-self: flex-start; font-size: 13px; color: inherit; text-decoration: none; opacity: .6; }
.caso__volver:hover { opacity: 1; }
.caso__kicker { margin: 0; font-size: 11px; letter-spacing: .3em; text-transform: uppercase; color: #a8121f; }
.caso__meta { margin: 0; font-family: 'IBM Plex Mono', monospace; font-size: 13px; opacity: .55; }
.caso__nota { margin: 0; max-width: 46ch; opacity: .7; }
</style>
