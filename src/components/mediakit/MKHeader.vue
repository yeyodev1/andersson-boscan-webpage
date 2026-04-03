<template>
  <header class="mkh" :class="{ scrolled, 'menu-is-open': menuOpen }">
    <!-- Brand -->
    <div class="mkh__brand" @click="goHome">
      BOSCÁN <span class="mkh__brand-amp">&</span> LA MONI
    </div>

    <!-- Desktop inline nav — always visible -->
    <nav class="mkh__inline-nav">
      <button class="mkh__inline-cta" @click="openModal">Publicitar</button>
    </nav>

    <!-- Hamburger -->
    <button
      class="mkh__burger"
      :class="{ open: menuOpen }"
      @click="toggleMenu"
      :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
    >
      <span class="mkh__burger-bar mkh__burger-bar--top"></span>
      <span class="mkh__burger-bar mkh__burger-bar--mid"></span>
      <span class="mkh__burger-bar mkh__burger-bar--bot"></span>
    </button>
  </header>

  <!-- Full-screen overlay -->
  <Teleport to="body">
    <div class="mkh__overlay" ref="overlayEl" :class="{ visible: menuOpen }" :aria-hidden="!menuOpen">

      <!-- Background layers -->
      <div class="mkh__overlay-bg"></div>
      <div class="mkh__overlay-grain"></div>
      <div class="mkh__overlay-glow mkh__overlay-glow--red"></div>
      <div class="mkh__overlay-glow mkh__overlay-glow--gold"></div>

      <!-- Main nav -->
      <nav class="mkh__menu">
        <div
          class="mkh__menu-item"
          :class="{ 'mkh__menu-item--active': isActive(item) }"
          v-for="item in navItems"
          :key="item.label"
          ref="itemEls"
          @click="handleNav(item)"
        >
          <span class="mkh__menu-num">{{ item.num }}</span>
          <span class="mkh__menu-label">
            {{ item.label }}
            <span v-if="item.action === 'scroll' && route.path !== '/'" class="mkh__menu-hint">↗ Home</span>
          </span>
          <span class="mkh__menu-arrow"><i class="fa-solid fa-arrow-right"></i></span>
        </div>

        <!-- CTA special item -->
        <div class="mkh__menu-item mkh__menu-item--cta" ref="ctaItemEl" @click="handleCta">
          <span class="mkh__menu-num">06</span>
          <span class="mkh__menu-label">Publicitar</span>
          <span class="mkh__menu-arrow"><i class="fa-solid fa-handshake"></i></span>
        </div>
      </nav>

      <!-- Footer strip -->
      <div class="mkh__overlay-footer" ref="footerEl">
        <div class="mkh__overlay-footer-brand">EUREKA MEDIA EC · 2026</div>
        <div class="mkh__overlay-footer-socials">
          <a href="https://www.instagram.com/anderssonboscan/?hl=es" target="_blank" rel="noopener" class="mkh__overlay-social">
            <i class="fa-brands fa-instagram"></i>
          </a>
          <a href="https://www.youtube.com/@anderssonboscan" target="_blank" rel="noopener" class="mkh__overlay-social">
            <i class="fa-brands fa-youtube"></i>
          </a>
          <a href="https://x.com/anderssonboscan" target="_blank" rel="noopener" class="mkh__overlay-social">
            <i class="fa-brands fa-x-twitter"></i>
          </a>
          <a href="https://www.instagram.com/monivelasquezv/" target="_blank" rel="noopener" class="mkh__overlay-social">
            <i class="fa-brands fa-instagram"></i>
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { useLeadModal } from '@/composables/useLeadModal'

gsap.registerPlugin(ScrollToPlugin)

const router  = useRouter()
const route   = useRoute()
const { openModal } = useLeadModal()

defineProps<{ activeSection?: number }>()

const scrolled  = ref(false)
const menuOpen  = ref(false)
const overlayEl = ref<HTMLElement | null>(null)
const itemEls   = ref<HTMLElement[]>([])
const ctaItemEl = ref<HTMLElement | null>(null)
const footerEl  = ref<HTMLElement | null>(null)

const navItems = [
  { num: '01', label: 'Inicio',        action: 'home',   target: '/' },
  { num: '02', label: 'Quiénes somos', action: 'route',  target: '/quienes-somos' },
  { num: '03', label: 'Audiencia',     action: 'scroll', target: '.p3' },
  { num: '04', label: 'Formatos',      action: 'scroll', target: '.p5' },
  { num: '05', label: 'Contacto',      action: 'scroll', target: '.p10' },
]

function onScroll() { scrolled.value = window.scrollY > 60 }

function isActive(item: typeof navItems[number]) {
  if (item.action === 'home') return route.path === '/'
  if (item.action === 'route') return route.path === item.target
  return false
}

function goHome() {
  if (route.path !== '/') router.push('/')
  else gsap.to(window, { duration: 0.75, scrollTo: { y: 0 }, ease: 'power2.inOut' })
}

function scrollTo(selector: string) {
  const target = document.querySelector(selector)
  if (!target) return
  gsap.to(window, { duration: 0.75, scrollTo: { y: target, offsetY: 64 }, ease: 'power2.inOut' })
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function handleNav(item: typeof navItems[number]) {
  closeMenu()
  setTimeout(() => {
    if (item.action === 'home') {
      if (route.path !== '/') router.push('/')
      else gsap.to(window, { duration: 0.75, scrollTo: { y: 0 }, ease: 'power2.inOut' })
    } else if (item.action === 'route') {
      router.push(item.target)
    } else {
      if (route.path !== '/') {
        router.push('/').then(() => setTimeout(() => scrollTo(item.target), 300))
      } else {
        scrollTo(item.target)
      }
    }
  }, 450)
}

function handleCta() {
  closeMenu()
  setTimeout(() => openModal(), 500)
}

function closeMenu() { menuOpen.value = false }

// ── GSAP animations ──────────────────────────────────────
let openTl: gsap.core.Timeline | null = null
let closeTl: gsap.core.Timeline | null = null

function animateOpen() {
  if (closeTl) closeTl.kill()
  const allItems = [...(itemEls.value ?? []), ctaItemEl.value].filter(Boolean)

  openTl = gsap.timeline()
  openTl
    .set(overlayEl.value, { display: 'flex' })
    .fromTo(overlayEl.value, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' })
    .fromTo('.mkh__overlay-glow--red', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0)
    .fromTo('.mkh__overlay-glow--gold', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' }, 0.1)
    .fromTo(allItems, { y: 60, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
      { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.2)
    .fromTo(footerEl.value, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.7)
  document.body.style.overflow = 'hidden'
}

function animateClose() {
  if (openTl) openTl.kill()
  const allItems = [...(itemEls.value ?? []), ctaItemEl.value].filter(Boolean)

  closeTl = gsap.timeline({
    onComplete: () => { gsap.set(overlayEl.value, { display: 'none' }) },
  })
  closeTl
    .to(allItems, { y: -30, opacity: 0, stagger: 0.04, duration: 0.35, ease: 'power2.in' })
    .to(overlayEl.value, { opacity: 0, duration: 0.3, ease: 'none' }, 0.1)
  document.body.style.overflow = ''
}

watch(menuOpen, async (val) => {
  await nextTick()
  if (val) animateOpen()
  else animateClose()
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  // Initially hide overlay
  if (overlayEl.value) gsap.set(overlayEl.value, { display: 'none', opacity: 0 })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped lang="scss">
// ── Header bar ─────────────────────────────────────────────
.mkh {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 64px;
  z-index: 1100;
  display: flex;
  align-items: center;
  padding: 0 clamp(20px, 4vw, 48px);
  transition: background 0.4s, box-shadow 0.4s;

  &.scrolled {
    background: rgba(8,8,8,0.95);
    backdrop-filter: blur(20px);
    box-shadow: 0 1px 0 rgba(245,242,237,0.06);
  }

  &.menu-is-open {
    background: rgba(8,8,8,0.95);
    backdrop-filter: blur(20px);
    box-shadow: 0 1px 0 rgba(245,242,237,0.08);
  }

  &__brand {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 0.06em;
    color: var(--mk-cream);
    cursor: pointer;
    user-select: none;
    position: relative;
    z-index: 1101;

    &-amp { color: var(--mk-red); }
  }

  &__inline-nav {
    display: flex;
    align-items: center;
    gap: 32px;
    margin-left: auto;
    margin-right: 24px;
    position: relative;
    z-index: 1101;

    @media (max-width: 768px) { display: none; }
  }

  &__inline-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    letter-spacing: 0.05em;
    color: rgba(245,242,237,0.6);
    background: none; border: none;
    cursor: pointer;
    transition: color 0.2s;
    padding: 0;
    &:hover { color: var(--mk-cream); }
  }

  &__inline-cta {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mk-cream);
    background: var(--mk-red);
    border: none;
    border-radius: 4px;
    padding: 9px 20px;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    &:hover { background: #a82d22; transform: translateY(-1px); }
  }

  // ── Hamburger ──
  &__burger {
    position: relative;
    z-index: 1101;
    margin-left: auto;
    width: 40px;
    height: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;

    @media (min-width: 769px) {
      margin-left: 0; // inline nav already has margin-right
    }

    &-bar {
      display: block;
      height: 1.5px;
      background: var(--mk-cream);
      transition: all 0.4s cubic-bezier(0.77, 0, 0.175, 1);
      transform-origin: center;

      &--top { width: 28px; }
      &--mid { width: 20px; margin-left: -4px; /* left-aligned short bar */ }
      &--bot { width: 28px; }
    }

    &.open {
      .mkh__burger-bar--top { transform: translateY(7.5px) rotate(45deg); width: 28px; }
      .mkh__burger-bar--mid { opacity: 0; transform: scaleX(0); }
      .mkh__burger-bar--bot { transform: translateY(-7.5px) rotate(-45deg); width: 28px; }
    }
  }
}

// ── Full-screen overlay ────────────────────────────────────
.mkh__overlay {
  position: fixed;
  inset: 0;
  z-index: 1099;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;

  &-bg {
    position: absolute;
    inset: 0;
    background: #060606;
  }

  &-grain {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
    opacity: 0.5;
    pointer-events: none;
  }

  &-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;

    &--red {
      width: 600px;
      height: 600px;
      top: -100px;
      right: -100px;
      background: radial-gradient(circle, rgba(200,57,43,0.12) 0%, transparent 70%);
    }

    &--gold {
      width: 500px;
      height: 500px;
      bottom: -80px;
      left: -80px;
      background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
    }
  }
}

// ── Menu items ─────────────────────────────────────────────
.mkh__menu {
  position: relative;
  z-index: 2;
  padding: clamp(64px, 10vh, 100px) clamp(32px, 8vw, 120px);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mkh__menu-item {
  display: flex;
  align-items: baseline;
  gap: clamp(16px, 2vw, 28px);
  padding: clamp(16px, 2.5vh, 24px) 0;
  border-bottom: 1px solid rgba(245,242,237,0.06);
  cursor: pointer;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 1px;
    background: var(--mk-red);
    transition: width 0.4s ease;
  }

  &:hover::before { width: 100%; }

  &:hover .mkh__menu-label {
    color: var(--mk-cream);
    transform: translateX(8px);
  }

  &:hover .mkh__menu-arrow {
    opacity: 1;
    transform: translateX(0);
  }

  &:hover .mkh__menu-num { color: var(--mk-red); }

  &--active {
    &::before { width: 40px; background: var(--mk-red); }
    .mkh__menu-label { color: var(--mk-cream); }
    .mkh__menu-num { color: var(--mk-red); }
  }

  &--cta {
    border-bottom: none;
    margin-top: clamp(8px, 1.5vh, 16px);

    &::before { background: var(--mk-gold); }

    .mkh__menu-label {
      color: var(--mk-gold) !important;
    }

    &:hover .mkh__menu-num { color: var(--mk-gold); }
  }
}

.mkh__menu-num {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(11px, 1.2vw, 14px);
  font-weight: 700;
  letter-spacing: 0.2em;
  color: rgba(245,242,237,0.2);
  transition: color 0.3s;
  flex-shrink: 0;
  padding-bottom: 4px;
}

.mkh__menu-label {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3rem, 7vw, 6.5rem);
  line-height: 1;
  color: rgba(245,242,237,0.75);
  letter-spacing: 0.02em;
  transition: color 0.3s, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.mkh__menu-hint {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(10px, 1vw, 12px);
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(201,168,76,0.5);
  padding: 3px 8px;
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 100px;
  line-height: 1.4;
  transition: color 0.3s, border-color 0.3s;

  .mkh__menu-item:hover & {
    color: var(--mk-gold);
    border-color: rgba(201,168,76,0.5);
  }
}

.mkh__menu-arrow {
  font-size: clamp(20px, 2.5vw, 32px);
  color: var(--mk-red);
  opacity: 0;
  transform: translateX(-12px);
  transition: opacity 0.3s, transform 0.3s;
  flex-shrink: 0;
}

.mkh__menu-item--cta .mkh__menu-arrow {
  color: var(--mk-gold);
}

// ── Overlay footer ─────────────────────────────────────────
.mkh__overlay-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px clamp(32px, 8vw, 120px);
  border-top: 1px solid rgba(245,242,237,0.06);

  &-brand {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(245,242,237,0.25);
  }

  &-socials {
    display: flex;
    gap: 20px;
  }
}

.mkh__overlay-social {
  font-size: 18px;
  color: rgba(245,242,237,0.3);
  text-decoration: none;
  transition: color 0.2s, transform 0.2s;

  &:hover {
    color: var(--mk-cream);
    transform: translateY(-2px);
  }
}
</style>
