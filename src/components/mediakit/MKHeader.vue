<template>
  <header class="mk-header" :class="{ scrolled }">
    <!-- Brand -->
    <div class="mk-header__brand" @click="scrollTo('.p1')">
      BOSCÁN <span class="amp">&</span> LA MONI
    </div>

    <!-- Desktop nav -->
    <nav class="mk-header__nav">
      <button
        class="mk-header__link"
        :class="{ active: props.activeSection === 1 }"
        @click="scrollTo('.p2')"
      >
        Quiénes somos
      </button>
      <button
        class="mk-header__link"
        :class="{ active: props.activeSection === 2 }"
        @click="scrollTo('.p3')"
      >
        Audiencia
      </button>
      <button
        class="mk-header__link"
        :class="{ active: props.activeSection === 4 }"
        @click="scrollTo('.p5')"
      >
        Formatos
      </button>
      <button
        class="mk-header__link"
        :class="{ active: props.activeSection === 9 }"
        @click="scrollTo('.p10')"
      >
        Contacto
      </button>
      <button class="mk-header__cta" @click="scrollTo('.p-form')">
        Publicitar
      </button>
    </nav>

    <!-- Hamburger -->
    <button
      class="mk-header__hamburger"
      :class="{ open: mobileOpen }"
      @click="mobileOpen = !mobileOpen"
      aria-label="Menú"
    >
      <span />
      <span />
      <span />
    </button>
  </header>

  <!-- Mobile menu -->
  <Transition name="menu">
    <div v-if="mobileOpen" class="mk-header__mobile-menu">
      <button
        class="mk-header__link"
        :class="{ active: props.activeSection === 1 }"
        @click="navAndClose('.p2')"
      >
        Quiénes somos
      </button>
      <button
        class="mk-header__link"
        :class="{ active: props.activeSection === 2 }"
        @click="navAndClose('.p3')"
      >
        Audiencia
      </button>
      <button
        class="mk-header__link"
        :class="{ active: props.activeSection === 4 }"
        @click="navAndClose('.p5')"
      >
        Formatos
      </button>
      <button
        class="mk-header__link"
        :class="{ active: props.activeSection === 9 }"
        @click="navAndClose('.p10')"
      >
        Contacto
      </button>
      <button class="mk-header__cta" @click="navAndClose('.p-form')">
        Publicitar
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

const props = defineProps<{ activeSection?: number }>()

const scrolled = ref(false)
const mobileOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 60
}

function scrollTo(selector: string) {
  const target = document.querySelector(selector)
  if (!target) return
  gsap.to(window, {
    duration: 1,
    scrollTo: target,
    ease: 'power3.inOut',
  })
}

function navAndClose(selector: string) {
  mobileOpen.value = false
  scrollTo(selector)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped lang="scss">
.mk-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 999;
  display: flex;
  align-items: center;
  padding: 0 clamp(16px, 4vw, 48px);
  transition: background 0.4s ease, box-shadow 0.4s ease;

  &.scrolled {
    background: rgba(8, 8, 8, 0.94);
    backdrop-filter: blur(16px);
    box-shadow: 0 1px 0 rgba(245, 242, 237, 0.06);
  }
}

.mk-header__brand {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: 0.05em;
  color: var(--mk-cream);
  cursor: pointer;
  user-select: none;

  .amp {
    color: var(--mk-red);
  }
}

.mk-header__nav {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-left: auto;

  @media (max-width: 768px) {
    display: none;
  }
}

.mk-header__link {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  letter-spacing: 0.05em;
  color: rgba(245, 242, 237, 0.65);
  cursor: pointer;
  transition: color 0.2s;
  background: none;
  border: none;
  padding: 0;

  &:hover,
  &.active {
    color: var(--mk-cream);
  }

  &.active {
    border-bottom: 1px solid var(--mk-gold);
    padding-bottom: 2px;
  }
}

.mk-header__cta {
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

  &:hover {
    background: #a82d22;
    transform: translateY(-1px);
  }
}

.mk-header__hamburger {
  display: none;
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  flex-direction: column;
  gap: 5px;

  @media (max-width: 768px) {
    display: flex;
  }

  span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--mk-cream);
    transition: all 0.3s;
  }

  &.open {
    span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    span:nth-child(2) {
      opacity: 0;
    }
    span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
  }
}

.mk-header__mobile-menu {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  z-index: 998;
  background: rgba(8, 8, 8, 0.97);
  backdrop-filter: blur(16px);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid rgba(245, 242, 237, 0.06);

  .mk-header__link {
    padding: 16px 0;
    font-size: 16px;
    border-bottom: 1px solid rgba(245, 242, 237, 0.06);
  }

  .mk-header__cta {
    margin-top: 16px;
    padding: 14px;
    text-align: center;
    font-size: 15px;
  }
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
