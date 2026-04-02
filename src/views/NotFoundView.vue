<template>
  <div class="nf">
    <div class="nf__bg"></div>
    <div class="nf__overlay"></div>
    <div class="nf__content" ref="contentEl">
      <div class="nf__code" ref="codeEl">404</div>
      <div class="nf__rule" ref="ruleEl"></div>
      <div class="nf__title" ref="titleEl">Página no encontrada</div>
      <p class="nf__sub" ref="subEl">Esta ruta no existe. Te redirigimos al inicio en <span class="nf__count">{{ countdown }}</span>s</p>
      <router-link to="/" class="nf__btn" ref="btnEl">Volver al inicio →</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'

const router = useRouter()
const codeEl    = ref<HTMLElement | null>(null)
const ruleEl    = ref<HTMLElement | null>(null)
const titleEl   = ref<HTMLElement | null>(null)
const subEl     = ref<HTMLElement | null>(null)
const btnEl     = ref<HTMLElement | null>(null)
const countdown = ref(5)

let interval: ReturnType<typeof setInterval>

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.from(codeEl.value, { y: -60, opacity: 0, duration: 1, ease: 'power4.out' })
    .from(ruleEl.value, { scaleX: 0, transformOrigin: 'left', duration: 0.8 }, '-=0.4')
    .from(titleEl.value, { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
    .from(subEl.value,   { y: 15, opacity: 0, duration: 0.5 }, '-=0.3')
    .from(btnEl.value,   { y: 10, opacity: 0, duration: 0.5 }, '-=0.2')

  interval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(interval)
      router.push('/')
    }
  }, 1000)
})

onUnmounted(() => clearInterval(interval))
</script>

<style lang="scss" scoped>
.nf {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #080808;
  font-family: 'DM Sans', sans-serif;

  &__bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, rgba(200,57,43,0.08) 0%, transparent 70%);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(245,242,237,0.012) 2px,
      rgba(245,242,237,0.012) 4px
    );
    pointer-events: none;
  }

  &__content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 40px;
  }

  &__code {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(120px, 20vw, 240px);
    line-height: 0.85;
    color: #c8392b;
    letter-spacing: -0.02em;
    text-shadow: 0 0 80px rgba(200,57,43,0.3);
    margin-bottom: 24px;
  }

  &__rule {
    height: 2px;
    width: 80px;
    background: linear-gradient(to right, #c8392b, #c9a84c);
    margin: 0 auto 28px;
  }

  &__title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(24px, 4vw, 40px);
    color: #f5f2ed;
    letter-spacing: 0.05em;
    margin-bottom: 16px;
  }

  &__sub {
    font-size: 15px;
    color: rgba(245,242,237,0.5);
    margin-bottom: 40px;
    line-height: 1.6;
  }

  &__count {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    color: #c9a84c;
  }

  &__btn {
    display: inline-block;
    padding: 14px 36px;
    border: 1px solid rgba(200,57,43,0.5);
    color: #f5f2ed;
    text-decoration: none;
    font-size: 13px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 700;
    transition: background 0.3s, border-color 0.3s, color 0.3s;

    &:hover {
      background: #c8392b;
      border-color: #c8392b;
      color: #f5f2ed;
    }
  }
}
</style>
