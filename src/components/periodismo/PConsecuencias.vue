<script setup lang="ts">
import raw from '@/periodismo/html/consecuencias.html?raw'
import { innerOf } from '@/periodismo/fragment'
const inner = innerOf(raw)
</script>

<template>
  <section id="consecuencias" class="libro" v-html="inner" />
</template>
