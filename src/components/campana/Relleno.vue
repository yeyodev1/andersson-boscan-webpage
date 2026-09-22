<template>
  <div class="fill" :class="{ 'is-full': done === total }" role="status" aria-live="polite">
    <div class="fill__bar"><span :style="{ transform: `scaleX(${total ? done / total : 0})` }"></span></div>
    <span class="fill__txt">
      <template v-if="done === total">Todo listo <i aria-hidden="true">✓</i></template>
      <template v-else><b :key="done">{{ done }}</b> de {{ total }} datos listos</template>
    </span>
  </div>
</template>

<script setup lang="ts">
/** Cuántos campos obligatorios lleva el formulario: da sensación de avance mientras se llena */
defineProps<{ done: number; total: number }>()
</script>

<style lang="scss" scoped>
$red: #c8392b;
$ink: #0b0b0b;

.fill {
  display: flex; align-items: center; gap: 14px; margin: -8px 0 22px;
  &__bar {
    flex: 1; height: 3px; border-radius: 3px; background: rgba(0,0,0,.07); overflow: hidden;
    span {
      display: block; height: 100%; background: $red; transform-origin: left;
      transition: transform .5s cubic-bezier(.2,.8,.2,1), background-color .4s ease;
    }
  }
  &__txt {
    font-size: 1.12rem; letter-spacing: .12em; text-transform: uppercase; color: rgba(11,11,11,.5); white-space: nowrap;
    b { display: inline-block; font-weight: 600; color: $ink; animation: bump .35s cubic-bezier(.2,.8,.2,1); }
    i { font-style: normal; display: inline-block; animation: bump .4s cubic-bezier(.2,.8,.2,1); }
  }
  &.is-full {
    .fill__bar span { background: $ink; }
    .fill__txt { color: $ink; }
  }
}

@keyframes bump {
  0% { transform: translateY(6px); opacity: 0; }
  100% { transform: none; opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .fill__bar span { transition: none; }
  .fill__txt b, .fill__txt i { animation: none; }
}
</style>
