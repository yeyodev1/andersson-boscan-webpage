<script setup lang="ts">
import raw from '@/periodismo/html/footer.html?raw'
import { innerOf } from '@/periodismo/fragment'
const inner = innerOf(raw)
</script>

<template>
  <footer class="footer footer--mesa" v-html="inner" />
</template>
