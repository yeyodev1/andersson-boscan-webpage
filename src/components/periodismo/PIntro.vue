<script setup lang="ts">
import raw from '@/periodismo/html/intro.html?raw'
import { innerOf } from '@/periodismo/fragment'
const inner = innerOf(raw)
</script>

<template>
  <div id="intro" class="intro" aria-hidden="true" v-html="inner" />
</template>
