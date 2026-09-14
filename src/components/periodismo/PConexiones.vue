<script setup lang="ts">
import raw from '@/periodismo/html/conexiones.html?raw'
import { innerOf } from '@/periodismo/fragment'
const inner = innerOf(raw)
</script>

<template>
  <section id="conexiones" class="hilo" v-html="inner" />
</template>
