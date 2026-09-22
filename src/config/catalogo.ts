/**
 * FUENTE ÚNICA DE VERDAD COMERCIAL — Publicidad Boscán & La Moni
 *
 * Todo el frontend de /publicidad lee precios, entregables y reglas desde aquí.
 * Nunca hardcodear precios en componentes. Editar este archivo (o reemplazarlo
 * por un fetch a CMS/GHL cuando exista backend) es la única forma de cambiar
 * la oferta comercial.
 */

export type AdGoal = 'alcance' | 'leads' | 'presencia' | 'especial'
export type AdDuration = 1 | 6 | 12
export type BrandSafety = 'approved' | 'manual_review' | 'rejected'

export interface AdProduct {
  product_id: string
  name: string
  /** Para qué resultado sirve (texto comercial corto) */
  result: string
  objective_tags: AdGoal[]
  /** Precio en USD. `price_unit` explica la base del precio. */
  price: number | null
  price_unit: 'mes' | 'unica_vez' | 'por_video' | 'campana' | 'consultar'
  /** Duraciones (meses) en las que se puede contratar */
  duration_options: AdDuration[]
  /** Mínimo de meses cuando aplica (ej. Comercial IA: 6) */
  min_months?: number
  deliverables: string[]
  platforms: string[]
  frequency: string
  production_included: boolean
  production_note?: string
  revision_limit: number
  metrics_included: string[]
  reach: string
  availability: string
  category_restrictions: string[]
  self_serve_enabled: boolean
  zoom_eligible: boolean
  active: boolean
  featured?: boolean
}

export const AD_PRODUCTS: AdProduct[] = [
  {
    product_id: 'comercial-ia-programa',
    name: 'Comercial IA en el programa',
    result: 'Presencia diaria junto a Boscán & La Moni, 22 episodios al mes',
    objective_tags: ['presencia', 'alcance'],
    price: 3000,
    price_unit: 'mes',
    duration_options: [6, 12],
    min_months: 6,
    deliverables: [
      'Comercial ultrarrealista producido con IA (20–30 s)',
      'Inserción en los 22 episodios mensuales del programa',
      'Adaptación vertical y horizontal',
    ],
    platforms: ['YouTube', 'Facebook', 'Instagram', 'TikTok', 'Spotify'],
    frequency: 'Diaria · 22 episodios/mes',
    production_included: true,
    production_note: 'Guion y producción del comercial incluidos. Assets de marca los envía el cliente.',
    revision_limit: 2,
    metrics_included: ['Impresiones por plataforma', 'Reporte mensual consolidado'],
    reach: '~10M impresiones/mes',
    availability: 'Solo 5 marcas simultáneas · consultar cupo',
    category_restrictions: [],
    self_serve_enabled: false,
    zoom_eligible: true,
    active: true,
    featured: true,
  },
  {
    product_id: 'diario-boscan-marca',
    name: 'Diario de Boscán para la marca',
    result: 'Recordación masiva con una historia contada por Andersson',
    objective_tags: ['alcance'],
    price: 3000,
    price_unit: 'unica_vez',
    duration_options: [1],
    deliverables: [
      'Intro viral diaria con historia integrada de la marca',
      'Publicación en el programa y en redes de Andersson',
    ],
    platforms: ['YouTube', 'TikTok', 'Instagram', 'Facebook'],
    frequency: '1 emisión',
    production_included: true,
    revision_limit: 1,
    metrics_included: ['Reproducciones', 'Alcance estimado'],
    reach: '~500K reproducciones',
    availability: 'Según agenda editorial',
    category_restrictions: [],
    self_serve_enabled: true,
    zoom_eligible: false,
    active: true,
  },
  {
    product_id: 'tiktok-patrocinado',
    name: 'TikTok patrocinado',
    result: 'Viralidad con audiencia 18–35',
    objective_tags: ['alcance', 'leads'],
    price: 2500,
    price_unit: 'por_video',
    duration_options: [1, 6, 12],
    deliverables: [
      'Video 30–90 s con guion de nuestro equipo',
      'Aprobación de guion por la marca',
      'Publicación en TikTok de Andersson (926K seguidores)',
    ],
    platforms: ['TikTok'],
    frequency: '1 video',
    production_included: true,
    revision_limit: 2,
    metrics_included: ['Reproducciones', 'Interacciones', 'Alcance'],
    reach: '~200K reproducciones',
    availability: '2–3 semanas desde aprobación',
    category_restrictions: [],
    self_serve_enabled: true,
    zoom_eligible: false,
    active: true,
  },
  {
    product_id: 'video-culinario-mensual',
    name: 'Video culinario · Andersson + Mónica',
    result: 'Doble audiencia con contenido de estilo de vida',
    objective_tags: ['alcance', 'presencia'],
    price: 2000,
    price_unit: 'mes',
    duration_options: [1, 6, 12],
    deliverables: [
      '1 video culinario al mes con integración de producto',
      'Publicación simultánea en ambos canales',
    ],
    platforms: ['YouTube', 'TikTok'],
    frequency: 'Mensual',
    production_included: true,
    revision_limit: 1,
    metrics_included: ['Reproducciones por canal', 'Reporte mensual'],
    reach: '+1M reproducciones',
    availability: 'Según calendario de grabación',
    category_restrictions: ['alcohol'],
    self_serve_enabled: true,
    zoom_eligible: true,
    active: true,
  },
  {
    product_id: 'video-dedicado-youtube',
    name: 'Video dedicado en YouTube',
    result: 'Explicación a fondo alineada a los valores de la marca',
    objective_tags: ['presencia', 'especial'],
    price: 1200,
    price_unit: 'unica_vez',
    duration_options: [1],
    deliverables: ['Video completo dedicado en el canal de Andersson'],
    platforms: ['YouTube'],
    frequency: '1 video',
    production_included: true,
    revision_limit: 1,
    metrics_included: ['Vistas', 'Retención'],
    reach: '100K vistas/día en el canal',
    availability: '3–4 semanas',
    category_restrictions: [],
    self_serve_enabled: true,
    zoom_eligible: false,
    active: true,
  },
  {
    product_id: 'podcast-auspiciante',
    name: 'Auspiciante exclusivo · Podcast Boscán',
    result: 'Presencia sostenida en audio, sin competencia',
    objective_tags: ['presencia'],
    price: 1200,
    price_unit: 'mes',
    duration_options: [1, 6, 12],
    deliverables: ['Mención exclusiva al inicio de los 22 episodios del mes'],
    platforms: ['Spotify'],
    frequency: '22 episodios/mes',
    production_included: true,
    revision_limit: 1,
    metrics_included: ['Reproducciones mensuales'],
    reach: '+150K reproducciones/mes',
    availability: 'Un solo auspiciante · consultar cupo',
    category_restrictions: [],
    self_serve_enabled: true,
    zoom_eligible: false,
    active: true,
  },
  {
    product_id: 'plan-pymes-leads',
    name: 'Plan PYMEs · Leads automatizados',
    result: 'Clientes potenciales directos a tu WhatsApp o web',
    objective_tags: ['leads'],
    price: 1500,
    price_unit: 'campana',
    duration_options: [1],
    deliverables: [
      'Mención en Reel',
      'Automatización de DM: cada comentario genera un lead',
      'Entrega de leads a WhatsApp o sitio web',
    ],
    platforms: ['Instagram', 'Facebook'],
    frequency: '1 campaña',
    production_included: true,
    revision_limit: 1,
    metrics_included: ['Reproducciones', 'Leads generados', 'CPL'],
    reach: '200–500 leads directos',
    availability: 'Inmediata',
    category_restrictions: [],
    self_serve_enabled: true,
    zoom_eligible: false,
    active: true,
  },
  {
    product_id: 'mencion-stories',
    name: 'Mención en Stories',
    result: 'Recomendación orgánica si encaja con la audiencia',
    objective_tags: ['alcance', 'especial'],
    price: null,
    price_unit: 'consultar',
    duration_options: [1],
    deliverables: ['Mención en Stories de Instagram y Facebook'],
    platforms: ['Instagram', 'Facebook'],
    frequency: 'Puntual',
    production_included: false,
    production_note: 'El cliente provee el material.',
    revision_limit: 0,
    metrics_included: ['Vistas'],
    reach: 'Orgánico',
    availability: 'Según encaje editorial',
    category_restrictions: [],
    self_serve_enabled: false,
    zoom_eligible: false,
    active: true,
  },
]

/** Reglas de negocio (handoff v3 §2, §6) */
export const AD_RULES = {
  /** Umbral cuenta estratégica */
  strategic_monthly_budget: 3000,
  strategic_min_months: 6,
  strategic_contract_value: 18000,
  /** Rango general informado */
  range_min: 1500,
  range_max: 3000,
  /** Calendario */
  meeting_minutes: 25,
  timezone: 'America/Toronto',
  /** Pipeline GHL */
  pipeline_name: 'Publicidad Boscán & La Moni',
  pipeline_strategic: 'Cuentas estratégicas · Publicidad',
}

/** Categorías con revisión previa de brand safety (handoff v3 §9) */
export const AD_CATEGORIES: { value: string; label: string; brand_safety: BrandSafety }[] = [
  { value: 'consumo',       label: 'Consumo masivo / retail',          brand_safety: 'approved' },
  { value: 'tecnologia',    label: 'Tecnología / apps',                brand_safety: 'approved' },
  { value: 'servicios',     label: 'Servicios profesionales',          brand_safety: 'approved' },
  { value: 'educacion',     label: 'Educación',                        brand_safety: 'approved' },
  { value: 'turismo',       label: 'Turismo / hospitalidad',           brand_safety: 'approved' },
  { value: 'alimentos',     label: 'Alimentos y bebidas',              brand_safety: 'approved' },
  { value: 'inmobiliario',  label: 'Inmobiliario / construcción',      brand_safety: 'approved' },
  { value: 'finanzas',      label: 'Banca / fintech',                  brand_safety: 'manual_review' },
  { value: 'salud',         label: 'Salud / farmacéutica',             brand_safety: 'manual_review' },
  { value: 'alcohol',       label: 'Alcohol',                          brand_safety: 'manual_review' },
  { value: 'apuestas',      label: 'Apuestas / casinos',               brand_safety: 'manual_review' },
  { value: 'cripto',        label: 'Criptomonedas',                    brand_safety: 'manual_review' },
  { value: 'politica',      label: 'Política / partidos',              brand_safety: 'manual_review' },
  { value: 'gobierno',      label: 'Gobierno / instituciones públicas', brand_safety: 'manual_review' },
  { value: 'otro',          label: 'Otra categoría',                   brand_safety: 'manual_review' },
]

export const AD_GOALS: { value: AdGoal; label: string; hint: string }[] = [
  { value: 'alcance',   label: 'Alcance y recordación',                     hint: 'Que mucha gente vea tu marca junto a nosotros.' },
  { value: 'leads',     label: 'Leads / clientes',                          hint: 'Personas que te escriban o compren.' },
  { value: 'presencia', label: 'Presencia sostenida junto a Boscán & La Moni', hint: 'Estar todos los días, por meses.' },
  { value: 'especial',  label: 'Tengo algo especial en mente',              hint: 'Un formato distinto. Lo revisamos contigo.' },
]

export const AD_DURATIONS: { value: AdDuration; label: string; hint: string }[] = [
  { value: 1,  label: 'Una campaña / un mes', hint: 'Compra directa, sin reunión.' },
  { value: 6,  label: '6 meses',              hint: 'Propuesta automática con revisión.' },
  { value: 12, label: '12 meses',             hint: 'Mejor tarifa por continuidad.' },
]

export const AD_BUDGETS: { value: string; label: string; monthly: number }[] = [
  { value: 'menos_1500', label: 'Menos de USD 1.500 / mes',   monthly: 1000 },
  { value: '1500_3000',  label: 'USD 1.500 – 3.000 / mes',    monthly: 1500 },
  { value: '3000_mas',   label: 'USD 3.000 o más / mes',      monthly: 3000 },
]

export const AD_COUNTRIES = [
  'Ecuador', 'Colombia', 'Venezuela', 'México', 'Perú', 'Argentina', 'Chile',
  'Estados Unidos', 'Canadá', 'España', 'Panamá', 'Otro',
]

export function formatPrice(p: AdProduct): string {
  if (p.price === null) return 'Consultar'
  const n = `USD ${p.price.toLocaleString('es-EC')}`
  switch (p.price_unit) {
    case 'mes':       return `${n} / mes`
    case 'unica_vez': return `${n} · única vez`
    case 'por_video': return `${n} · por video`
    case 'campana':   return `${n} · campaña`
    default:          return n
  }
}

/**
 * Recomendación: máximo 2 productos según objetivo, duración y presupuesto.
 */
export function recommendProducts(goal: AdGoal, duration: AdDuration, monthlyBudget: number): AdProduct[] {
  const active = AD_PRODUCTS.filter(p => p.active)
  const byGoal = active.filter(p => p.objective_tags.includes(goal))
  const byDuration = byGoal.filter(p => p.duration_options.includes(duration))

  const scored = byDuration.map(p => {
    let score = 0
    if (p.objective_tags[0] === goal) score += 3
    if (p.featured) score += 1
    if (p.price !== null && p.price <= monthlyBudget) score += 2
    if (p.price !== null && p.price > monthlyBudget * 1.5) score -= 2
    if (p.self_serve_enabled && duration === 1) score += 1
    return { p, score }
  }).sort((a, b) => b.score - a.score)

  const picks = scored.slice(0, 2).map(s => s.p)
  if (picks.length < 2) {
    // Rellenar con lo más cercano al objetivo aunque no calce la duración
    const rest = byGoal.filter(p => !picks.includes(p))
    picks.push(...rest.slice(0, 2 - picks.length))
  }
  return picks.slice(0, 2)
}
