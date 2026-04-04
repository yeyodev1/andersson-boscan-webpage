<template>
  <section class="mk-section p10" ref="sectionEl">
    <div class="p10__bg" ref="bgEl"></div>
    <div class="p10__overlay"></div>

    <div class="p10__content" ref="contentEl">
      <div class="p10__label" ref="labelEl">Contacto comercial</div>
      <h2 class="p10__title" ref="titleEl">
        ¿TU MARCA QUIERE<br>LLEGAR A <span class="accent">MILLONES?</span>
      </h2>
      <div class="p10__rule" ref="ruleEl"></div>

      <button class="p10__cta-btn" @click="openModal">
        <i class="fa-solid fa-rocket"></i>
        Comenzar mi campaña ahora
      </button>
      <router-link to="/precios" class="p10__precios-link">
        <i class="fa-solid fa-table-list"></i> Ver tabla de tarifas completa
      </router-link>

      <div class="p10__emails" ref="emailsEl">
        <p class="p10__emails-label">Escríbenos directamente</p>
        <div class="p10__email-row" v-for="contact in contacts" :key="contact.who">
          <div class="p10__email-who">{{ contact.who }}</div>
          <a :href="`mailto:${contact.email}`" class="p10__email">
            <i class="fa-solid fa-envelope"></i>
            {{ contact.email }}
          </a>
        </div>
      </div>

      <div class="p10__socials">
        <a href="#" class="p10__social"><i class="fa-brands fa-tiktok"></i></a>
        <a href="#" class="p10__social"><i class="fa-brands fa-youtube"></i></a>
        <a href="#" class="p10__social"><i class="fa-brands fa-instagram"></i></a>
        <a href="#" class="p10__social"><i class="fa-brands fa-x-twitter"></i></a>
        <a href="#" class="p10__social"><i class="fa-brands fa-spotify"></i></a>
        <a href="#" class="p10__social"><i class="fa-brands fa-facebook"></i></a>
      </div>

      <div class="p10__sub" ref="subEl">
        Tiempo de respuesta: 24–48 horas · Propuestas personalizadas disponibles
      </div>

      <div class="p10__footer-brand" ref="brandEl">
        Andersson y Moni Boscán · Mónica Velásquez · Eurekaproductions · Media Kit 2026
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { useLeadModal } from '@/composables/useLeadModal'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const { openModal } = useLeadModal()
const sectionEl = ref<HTMLElement | null>(null)
const bgEl      = ref<HTMLElement | null>(null)
const labelEl   = ref<HTMLElement | null>(null)
const titleEl   = ref<HTMLElement | null>(null)
const ruleEl    = ref<HTMLElement | null>(null)
const subEl     = ref<HTMLElement | null>(null)
const brandEl   = ref<HTMLElement | null>(null)

const contacts = [
  { who: 'Andersson y Moni', email: 'andersson@otr.com.ec' },
  { who: 'Mónica',           email: 'monica@otr.com.ec' },
]

onMounted(() => {
  // Parallax
  ScrollTrigger.create({
    trigger: sectionEl.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      if (bgEl.value) gsap.set(bgEl.value, { yPercent: self.progress * 30 })
    },
  })

  const tl = gsap.timeline({
    scrollTrigger: { trigger: sectionEl.value, start: 'top 70%', once: true },
    defaults: { ease: 'power3.out' },
  })

  tl.from(labelEl.value, { y: 20, opacity: 0, duration: 0.6 })
    .from(titleEl.value, { y: 60, opacity: 0, duration: 1, ease: 'power4.out' }, '-=0.3')
    .from(ruleEl.value, { scaleX: 0, transformOrigin: 'left', duration: 0.9 }, '-=0.5')
    .from('.p10__cta-btn', { y: 30, opacity: 0, duration: 0.8 }, '-=0.3')
    .from('.p10__email-row', { y: 30, opacity: 0, stagger: 0.15, duration: 0.7 }, '-=0.5')
    .from(subEl.value, { y: 15, opacity: 0, duration: 0.6 }, '-=0.3')
    .from(brandEl.value, { opacity: 0, duration: 0.8 }, '-=0.2')
})
</script>

<style lang="scss" scoped>
.p10 {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: -10%;
    background: url('/images/p10-photo.png') center / cover no-repeat;
    will-change: transform;
    filter: grayscale(30%);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(8,8,8,0.96) 0%,
      rgba(140,20,12,0.5) 50%,
      rgba(8,8,8,0.96) 100%
    );
  }

  &__content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: clamp(48px, 8vh, 80px) clamp(20px, 5vw, 60px);
    max-width: 700px;
    width: 100%;
  }

  &__label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--mk-gold);
    font-weight: 700;
    margin-bottom: 24px;
  }

  &__title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 7vw, 96px);
    line-height: 0.92;
    color: var(--mk-cream);
    margin-bottom: 40px;

    .accent {
      color: var(--mk-red);
      display: block;
    }
  }

  &__rule {
    height: 3px;
    background: linear-gradient(to right, transparent, var(--mk-red), transparent);
    margin-bottom: 48px;
  }

  &__cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 20px 48px;
    background: var(--mk-red);
    border: 2px solid var(--mk-red);
    border-radius: 4px;
    color: var(--mk-cream);
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(18px, 2.5vw, 26px);
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 16px;

    i { font-size: 0.85em; }

    &:hover {
      background: transparent;
      color: var(--mk-red);
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(200,57,43,0.4);
    }
  }

  &__precios-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: rgba(245,242,237,0.4);
    text-decoration: none;
    margin-bottom: 48px;
    transition: color 0.2s;
    border-bottom: 1px solid rgba(245,242,237,0.15);
    padding-bottom: 2px;

    &:hover { color: var(--mk-gold); border-color: var(--mk-gold); }
    i { font-size: 12px; }
  }

  &__emails {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 40px;
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 8px;
    overflow: hidden;
    background: rgba(201,168,76,0.04);
  }

  &__emails-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(201,168,76,0.6);
    font-weight: 700;
    padding: 14px 24px 0;
    margin: 0;
  }

  &__email-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px 24px 20px;
    border-bottom: 1px solid rgba(201,168,76,0.12);
    transition: background 0.2s;

    &:last-child { border-bottom: none; }

    &:hover { background: rgba(201,168,76,0.06); }
  }

  &__email-who {
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 12px;
    color: rgba(245,242,237,0.45);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__email {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(17px, 3.5vw, 22px);
    font-weight: 500;
    color: var(--mk-gold);
    text-decoration: none;
    letter-spacing: 0.01em;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: color 0.2s;

    i { font-size: 0.75em; opacity: 0.7; }

    &:hover { color: var(--mk-cream); }
  }

  &__sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--mk-dimmer);
    margin-bottom: 48px;
  }

  &__socials {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 32px;
  }

  &__social {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(245,242,237,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--mk-dim);
    font-size: 16px;
    text-decoration: none;
    transition: border-color 0.3s, color 0.3s, background 0.3s, transform 0.3s;

    &:hover {
      border-color: var(--mk-red);
      color: var(--mk-cream);
      background: rgba(200,57,43,0.15);
      transform: translateY(-3px);
    }
  }

  &__footer-brand {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(245,242,237,0.2);
    border-top: 1px solid rgba(245,242,237,0.08);
    padding-top: 24px;
  }
}
</style>
