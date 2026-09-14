<script setup lang="ts">
import raw from '@/periodismo/html/topbar.html?raw'
import { innerOf } from '@/periodismo/fragment'
const inner = innerOf(raw)
</script>

<template>
  <header class="topbar" v-html="inner" />
</template>
