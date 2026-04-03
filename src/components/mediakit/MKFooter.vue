<template>
  <footer class="mk-footer" ref="footerRef">
    <div class="mk-footer__inner">
      <div class="mk-footer__grid">

        <!-- Column 1: Brand -->
        <div class="mk-footer__col mk-footer__col--brand">
          <div class="mk-footer__brand-name">
            <span class="brand-boscan">BOSCÁN</span>
            <span class="brand-amp">&amp;</span>
            <span class="brand-moni">LA MONI</span>
          </div>
          <p class="mk-footer__tagline">Cuento historias que otros no.</p>
          <p class="mk-footer__subtext">EUREKA Media EC · Media Kit 2026</p>
        </div>

        <!-- Column 2: Navegación -->
        <div class="mk-footer__col">
          <h4 class="mk-footer__section-title">NAVEGACIÓN</h4>
          <nav class="mk-footer__links">
            <button class="mk-footer__link" @click="scrollTo('.p2')">Quiénes somos</button>
            <button class="mk-footer__link" @click="scrollTo('.p3')">Nuestra audiencia</button>
            <button class="mk-footer__link" @click="scrollTo('.p4')">Plataformas</button>
            <button class="mk-footer__link" @click="scrollTo('.p5')">Contenido comercial</button>
            <button class="mk-footer__link" @click="scrollTo('.p6')">Periodismo</button>
            <button class="mk-footer__link" @click="scrollTo('.p7')">PYMEs</button>
          </nav>
        </div>

        <!-- Column 3: Trabaja con nosotros -->
        <div class="mk-footer__col">
          <h4 class="mk-footer__section-title">TRABAJA CON NOSOTROS</h4>
          <nav class="mk-footer__links">
            <button class="mk-footer__link" @click="scrollTo('.p-form')">Publicitar con nosotros</button>
            <a class="mk-footer__link" href="mailto:andersson@otr.com.ec">Solicitar media kit</a>
            <button class="mk-footer__link" @click="scrollTo('.p-form')">Propuesta personalizada</button>
          </nav>
        </div>

        <!-- Column 4: Contacto -->
        <div class="mk-footer__col">
          <h4 class="mk-footer__section-title">CONTACTO</h4>
          <ul class="mk-footer__contact-list">
            <li class="mk-footer__contact-item">
              <i class="fa-solid fa-envelope"></i>
              <span>andersson@otr.com.ec</span>
            </li>
            <li class="mk-footer__contact-item">
              <i class="fa-solid fa-envelope"></i>
              <span>monica@otr.com.ec</span>
            </li>
            <li class="mk-footer__contact-item">
              <i class="fa-solid fa-location-dot"></i>
              <span>Toronto, Canadá</span>
            </li>
          </ul>
          <div class="mk-footer__social">
            <a href="#" class="mk-footer__social-link" aria-label="TikTok">
              <i class="fa-brands fa-tiktok"></i>
            </a>
            <a href="#" class="mk-footer__social-link" aria-label="YouTube">
              <i class="fa-brands fa-youtube"></i>
            </a>
            <a href="#" class="mk-footer__social-link" aria-label="Instagram">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="#" class="mk-footer__social-link" aria-label="X">
              <i class="fa-brands fa-x-twitter"></i>
            </a>
            <a href="#" class="mk-footer__social-link" aria-label="Spotify">
              <i class="fa-brands fa-spotify"></i>
            </a>
            <a href="#" class="mk-footer__social-link" aria-label="Facebook">
              <i class="fa-brands fa-facebook-f"></i>
            </a>
          </div>
        </div>

      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="mk-footer__bottom">
      <div class="mk-footer__bottom-inner">
        <span class="mk-footer__bottom-copy">
          &copy; 2026 Andersson y Moni Boscán · EUREKA Media EC. Todos los derechos reservados.
        </span>
        <span class="mk-footer__bottom-love">Hecho con amor desde Toronto 🍁</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const footerRef = ref<HTMLElement | null>(null)
let st: ScrollTrigger | null = null

function scrollTo(selector: string) {
  const el = document.querySelector(selector)
  if (el) gsap.to(window, { duration: 1, scrollTo: el, ease: 'power3.inOut' })
}

onMounted(() => {
  if (!footerRef.value) return

  const cols = footerRef.value.querySelectorAll('.mk-footer__col')
  const bottom = footerRef.value.querySelector('.mk-footer__bottom')

  gsap.set([cols, bottom], { opacity: 0, y: 40 })

  st = ScrollTrigger.create({
    trigger: footerRef.value,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.to(cols, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
      })
      gsap.to(bottom, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.5,
      })
    },
  })
})

onUnmounted(() => {
  st?.kill()
})
</script>

<style scoped lang="scss">
.mk-footer {
  background: #0a0a0a;
  border-top: 1px solid rgba(245, 242, 237, 0.06);
  font-family: 'DM Sans', sans-serif;

  &__inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 72px 48px 56px;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1fr;
    gap: 48px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    @media (max-width: 479px) {
      grid-template-columns: 1fr;
      gap: 36px;
    }
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  // Brand column
  &__brand-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    line-height: 1;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    gap: 6px;

    .brand-boscan {
      color: var(--mk-cream, #f5f2ed);
    }

    .brand-amp {
      color: var(--mk-red, #c8392b);
    }

    .brand-moni {
      color: var(--mk-gold, #c9a84c);
    }
  }

  &__tagline {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 13px;
    color: rgba(245, 242, 237, 0.45);
    margin: 0;
    line-height: 1.5;
  }

  &__subtext {
    font-size: 11px;
    color: rgba(245, 242, 237, 0.25);
    margin: 0;
    letter-spacing: 0.05em;
  }

  // Section titles
  &__section-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.3em;
    color: var(--mk-gold, #c9a84c);
    margin: 0 0 4px;
    text-transform: uppercase;
  }

  // Nav links
  &__links {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__link {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: left;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: rgba(245, 242, 237, 0.55);
    text-decoration: none;
    transition: color 0.25s ease;
    width: fit-content;

    &:hover {
      color: var(--mk-cream, #f5f2ed);
    }
  }

  // Contact list
  &__contact-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__contact-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: rgba(245, 242, 237, 0.55);

    i {
      color: var(--mk-gold, #c9a84c);
      font-size: 13px;
      width: 16px;
      flex-shrink: 0;
    }
  }

  // Social icons
  &__social {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
  }

  &__social-link {
    color: rgba(245, 242, 237, 0.4);
    font-size: 16px;
    text-decoration: none;
    transition: color 0.25s ease;

    &:hover {
      color: var(--mk-gold, #c9a84c);
    }
  }

  // Bottom bar
  &__bottom {
    border-top: 1px solid rgba(245, 242, 237, 0.06);
  }

  &__bottom-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 20px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    @media (max-width: 640px) {
      flex-direction: column;
      text-align: center;
      padding: 20px 24px;
    }
  }

  &__bottom-copy,
  &__bottom-love {
    font-size: 12px;
    color: rgba(245, 242, 237, 0.25);
    line-height: 1.5;
  }
}
</style>
