<script setup lang="ts">
import raw from '@/periodismo/html/investiguemos.html?raw'
import { innerOf } from '@/periodismo/fragment'
const inner = innerOf(raw)
</script>

<template>
  <section id="investiguemos" class="tips" v-html="inner" />
</template>
