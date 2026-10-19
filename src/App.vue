<script setup lang="ts">
import AvisoActualizacion from '@/components/AvisoActualizacion.vue'
</script>

<template>
  <div class="app-container">
    <RouterView />
    <AvisoActualizacion />
  </div>
</template>

<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
