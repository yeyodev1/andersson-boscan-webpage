<script setup lang="ts">
import raw from '@/periodismo/html/quienes-somos.html?raw'
import { innerOf } from '@/periodismo/fragment'
const inner = innerOf(raw)
</script>

<template>
  <section id="quienes-somos" class="quienes" v-html="inner" />
</template>
