<template>
  <div class="qs-root">
    <MKHeader />
    <MKPageQuienes />
    <MKFooter />
    <MKLeadModal />
  </div>
</template>

<script setup lang="ts">
import MKHeader from '@/components/mediakit/MKHeader.vue'
import MKPageQuienes from '@/components/mediakit/MKPageQuienes.vue'
import MKFooter from '@/components/mediakit/MKFooter.vue'
import MKLeadModal from '@/components/mediakit/MKLeadModal.vue'
</script>

<style lang="scss">
.qs-root {
  background: #080808;
  color: #f5f2ed;
  min-height: 100vh;
  --mk-red: #c8392b;
  --mk-red-dark: #8a1f14;
  --mk-gold: #c9a84c;
  --mk-cream: #f5f2ed;
  --mk-black: #080808;
  --mk-dim: rgba(245,242,237,0.6);
  --mk-dimmer: rgba(245,242,237,0.38);
}
</style>
