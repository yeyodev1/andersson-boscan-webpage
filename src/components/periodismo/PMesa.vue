<script setup lang="ts">
import raw from '@/periodismo/html/mesa.html?raw'
import { innerOfBlock, expedientes } from '@/periodismo/fragment'
import PExpediente from './PExpediente.vue'

const mesaHead = innerOfBlock(raw, '<div class="mesa__head">')
const corchoHead = innerOfBlock(raw, '<div class="corcho__head">')
const casos = expedientes()
</script>

<template>
  <section id="mesa" class="mesa">
    <div class="wrap">
      <div class="mesa__head" v-html="mesaHead" />
      <div class="mesa__corcho">
        <div class="corcho__head" v-html="corchoHead" />
        <div class="mesa__grid">
          <PExpediente v-for="(html, i) in casos" :key="i" :html="html" />
        </div>
      </div>
      <p class="mesa__leyenda mono">Cada nota amarilla dice qué provocó la investigación.</p>
    </div>
  </section>
</template>
