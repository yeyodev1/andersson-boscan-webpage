<template>
  <section class="mk-section p9" ref="sectionEl">
    <!-- Left: Pricing table -->
    <div class="p9__left" ref="leftEl">
      <div class="p9__eyebrow">Formatos disponibles</div>
      <h2 class="p9__title">TODOS LOS<br>FORMATOS,<br>UN VISTAZO</h2>

      <table class="p9__table" ref="tableEl">
        <thead>
          <tr>
            <th>Formato</th>
            <th>Alcance estimado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableRows" :key="row.name" :class="{ highlight: row.highlight }">
            <td>
              <div class="p9__tf-name">{{ row.name }}</div>
              <div class="p9__tf-reach-sub">{{ row.sub }}</div>
            </td>
            <td class="p9__tf-reach">{{ row.reach }}</td>
          </tr>
        </tbody>
      </table>

      <div class="p9__discount">Contáctanos para recibir una propuesta personalizada para tu marca.</div>
    </div>

    <!-- Right: Why your brand belongs here -->
    <div class="p9__right" ref="rightEl">
      <div class="p9__why-label">Por qué tu marca pertenece aquí</div>
      <div class="p9__why-items">
        <div class="p9__wi" v-for="item in whyItems" :key="item.n">
          <div class="p9__wi-n"><i :class="item.icon"></i></div>
          <div class="p9__wi-body">
            <div class="p9__wi-title">{{ item.title }}</div>
            <div class="p9__wi-text">{{ item.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const sectionEl = ref<HTMLElement | null>(null)
const leftEl    = ref<HTMLElement | null>(null)
const rightEl   = ref<HTMLElement | null>(null)

const tableRows = [
  { name: 'Comercial IA en programa ⭐',  sub: '5 plataformas · 22 ep/mes · mín. 6 meses · cupos limitados', reach: '~10M imp./mes',   highlight: true },
  { name: 'Diario de Boscán para la Marca', sub: '~500K reproducciones',                                     reach: '~500K reprod.',   highlight: false },
  { name: 'TikTok Patrocinado',          sub: '926K seg. · audiencia 18–35 años',                            reach: '~200K reprod.',   highlight: false },
  { name: 'Video Dedicado YouTube',      sub: 'Video completo alineado a valores de marca',                   reach: '100K vistas/día', highlight: false },
  { name: 'Video culinario · Ambos canales', sub: 'Andersson + Mónica · 1 video/mes',                        reach: '+1M reprod.',     highlight: false },
  { name: 'Video culinario · Paquete mensual', sub: '2 videos/mes · mín. 6 meses',                           reach: '+2M reprod.',     highlight: false },
  { name: 'Plan PYMEs · Leads automatizados', sub: '100K+ reproducciones · 200–500 leads directos',          reach: 'Leads directos',  highlight: false },
  { name: 'Auspiciante Podcast Spotify', sub: '85K oyentes · 22 ep/mes · mención exclusiva',                 reach: '+150K reprod.',   highlight: false },
  { name: 'Mención Stories',             sub: 'Instagram · Facebook · ajustado a tu audiencia',              reach: 'Orgánico',        highlight: false },
]

const whyItems = [
  { n: '01', icon: 'fa-solid fa-shield-halved',  title: 'Credibilidad que se transfiere',     text: 'Una marca en el contenido de Boscán hereda su autoridad periodística. No es publicidad — es respaldo del periodista más creíble de Ecuador.' },
  { n: '02', icon: 'fa-solid fa-users',           title: 'Audiencia que no se puede comprar',  text: '88.7M impresiones orgánicas. Cada seguidor eligió estar ahí. Cero publicidad pagada para construir esta comunidad.' },
  { n: '03', icon: 'fa-solid fa-calendar-check',  title: 'Todos los días, 5 plataformas',      text: 'El programa diario garantiza presencia continua. Tu marca no aparece una vez — acompaña a la audiencia cada mañana.' },
  { n: '04', icon: 'fa-brands fa-whatsapp',       title: 'Leads reales para PYMEs',            text: 'CPL de $3–$8 frente a $15–$45 del promedio de Meta Ads. Pagas por personas que ya quieren saber más de ti.' },
  { n: '05', icon: 'fa-solid fa-microphone',      title: 'Dos voces, alcance duplicado',       text: 'Andersson y Moni + Mónica combina audiencias. Más de 1M de reproducciones por video culinario.' },
  { n: '06', icon: 'fa-solid fa-earth-americas',  title: 'Latam sin fronteras desde Canadá',   text: 'Ecuador, Colombia, Venezuela, Argentina, México — sin restricciones institucionales. Cobertura panlatina real.' },
]

onMounted(() => {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: sectionEl.value, start: 'top 70%', once: true },
    defaults: { ease: 'power3.out' },
  })

  tl.from(leftEl.value?.querySelectorAll('.p9__eyebrow, .p9__title') ?? [], {
      y: 30, opacity: 0, stagger: 0.12, duration: 0.7,
    })
    .from('tbody tr', { y: 20, opacity: 0, stagger: 0.06, duration: 0.5 }, '-=0.3')
    .from('.p9__discount', { opacity: 0, duration: 0.5 }, '-=0.1')
    .from(rightEl.value, { x: 40, opacity: 0, duration: 0.9 }, '-=0.8')
    .from('.p9__wi', { y: 20, opacity: 0, stagger: 0.1, duration: 0.6 }, '-=0.6')
})
</script>

<style lang="scss" scoped>
.p9 {
  min-height: 100vh;
  display: flex;
  background: #080808;
  padding: clamp(40px, 8vh, 80px) clamp(20px, 5vw, 60px);
  gap: 60px;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 40px;
  }

  &__left {
    flex: 1.2;
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 0; // allow table to shrink
  }

  &__eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--mk-gold);
    font-weight: 700;
    margin-bottom: 16px;
  }

  &__title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(40px, 4.5vw, 64px);
    line-height: 0.92;
    color: var(--mk-cream);
    margin-bottom: 36px;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    th {
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--mk-gold);
      font-weight: 700;
      padding: 0 8px 12px;
      border-bottom: 1px solid rgba(201,168,76,0.3);
      text-align: left;

      &.right { text-align: right; }
    }

    tr {
      border-bottom: 1px solid rgba(245,242,237,0.06);
      transition: background 0.2s;

      &:hover { background: rgba(245,242,237,0.03); }

      &.highlight {
        background: rgba(200,57,43,0.06);
        .p9__tf-name { color: var(--mk-cream); }
        .p9__tf-price { color: var(--mk-red); }
      }
    }

    td {
      padding: 10px 8px;
      vertical-align: middle;
    }
  }

  &__tf-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--mk-dim);
    line-height: 1.3;
  }

  &__tf-reach-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: var(--mk-dimmer);
  }

  &__tf-reach {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: rgba(245,242,237,0.3);
    white-space: nowrap;

    @media (max-width: 600px) {
      display: none;
    }
  }

  &__tf-price {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    color: var(--mk-cream);
    text-align: right;
    line-height: 1;
  }

  &__tf-unit {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: var(--mk-dimmer);
    text-align: right;
  }

  &__discount {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: rgba(245,242,237,0.25);
    margin-top: 16px;
    line-height: 1.5;
  }

  .right { text-align: right; }

  &__right {
    flex: 1;
    padding-top: 8px;
  }

  &__why-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--mk-gold);
    font-weight: 700;
    margin-bottom: 28px;
  }

  &__why-items {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__wi {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  &__wi-n {
    font-size: 20px;
    color: var(--mk-red);
    line-height: 1;
    min-width: 28px;
    flex-shrink: 0;
    padding-top: 2px;
  }

  &__wi-title {
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: var(--mk-cream);
    margin-bottom: 4px;
  }

  &__wi-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--mk-dim);
    line-height: 1.6;
  }
}
</style>
