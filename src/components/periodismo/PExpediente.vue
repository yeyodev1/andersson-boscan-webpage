<script setup lang="ts">
import { computed } from 'vue'
import { attrsOf, innerOf } from '@/periodismo/fragment'

const props = defineProps<{ html: string }>()

const attrs = computed(() => attrsOf(props.html))
const inner = computed(() => innerOf(props.html))
</script>

<template>
  <a v-bind="attrs" v-html="inner" />
</template>
