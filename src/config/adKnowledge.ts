/**
 * BASE APROBADA para el asistente comercial "Tengo una pregunta".
 *
 * El asistente SOLO responde desde estas entradas (handoff v3 §3).
 * Si ninguna coincide, escala a tarea humana asincrónica.
 * Nunca inventa descuentos, fechas ni condiciones fuera del tarifario.
 */

export interface KnowledgeEntry {
  id: string
  /** Palabras clave (minúsculas, sin tildes) que activan la respuesta */
  keywords: string[]
  /** Pregunta sugerida (chip) */
  question: string
  answer: string
}

export const AD_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'precios',
    keywords: ['precio', 'cuesta', 'costo', 'tarifa', 'cuanto', 'valor', 'usd', 'dolar'],
    question: '¿Cuánto cuesta pautar con ustedes?',
    answer: 'Los paquetes van de USD 1.200 a USD 3.000 según el formato. Una campaña puntual (un mes) se compra directo en esta página. Para 6 o 12 meses generamos una propuesta automática. Arma tu campaña arriba y verás el precio exacto del formato recomendado.',
  },
  {
    id: 'reunion',
    keywords: ['reunion', 'zoom', 'llamada', 'cita', 'agendar', 'hablar', 'meeting', 'calendario'],
    question: '¿Necesito una reunión para comprar?',
    answer: 'No. Las campañas de un mes se compran sin reunión. Los contratos de 6 y 12 meses los revisamos de forma asincrónica y te respondemos por escrito. Reservamos una llamada de 25 minutos solo para cuentas estratégicas (USD 3.000/mes por 6 meses o más), y en ese caso el sistema te la habilita solo al final.',
  },
  {
    id: 'plataformas',
    keywords: ['plataforma', 'red', 'redes', 'tiktok', 'youtube', 'instagram', 'facebook', 'spotify', 'donde', 'canal'],
    question: '¿En qué plataformas se publica?',
    answer: 'Según el formato: el Comercial IA sale en YouTube, Facebook, Instagram, TikTok y Spotify (22 episodios al mes). El TikTok patrocinado va en TikTok (926K seguidores). El video culinario sale en YouTube y TikTok de ambos canales. El podcast se emite en Spotify. Cada tarjeta de producto detalla sus plataformas.',
  },
  {
    id: 'entregables',
    keywords: ['entregable', 'entregables', 'incluye', 'que recibo', 'produccion', 'guion', 'material'],
    question: '¿Qué incluye la producción?',
    answer: 'En todos los formatos (excepto Mención en Stories) el guion y la producción los hace nuestro equipo. Tú envías los assets de marca (logo, producto, puntos clave) y apruebas el guion antes de publicar.',
  },
  {
    id: 'revisiones',
    keywords: ['revision', 'revisiones', 'cambio', 'cambios', 'aprobar', 'aprobacion', 'corregir'],
    question: '¿Cuántas revisiones tengo?',
    answer: 'Apruebas el guion antes de producir. Después, cada formato incluye entre 1 y 2 rondas de revisión (está indicado en cada tarjeta). Cambios adicionales se cotizan aparte.',
  },
  {
    id: 'tiempos',
    keywords: ['tiempo', 'cuando', 'demora', 'plazo', 'semana', 'dias', 'rapido', 'fecha', 'disponibilidad', 'cupo'],
    question: '¿Cuánto tarda en publicarse?',
    answer: 'Un TikTok patrocinado o un video dedicado tarda entre 2 y 4 semanas desde la aprobación del guion. El Plan PYMEs es inmediato. El Comercial IA y el podcast dependen del cupo disponible (5 marcas y 1 auspiciante, respectivamente). Al armar tu campaña eliges una fecha tentativa y te confirmamos.',
  },
  {
    id: 'pago',
    keywords: ['pago', 'pagar', 'tarjeta', 'transferencia', 'factura', 'metodo', 'paypal', 'cobro'],
    question: '¿Cómo se paga?',
    answer: 'Campañas de un mes: pago online al confirmar (te enviamos el enlace de pago al correo junto con la confirmación). Contratos de 6 y 12 meses: firma electrónica y pago tras aceptar la propuesta. Emitimos factura de Eureka Productions Cía. Ltda.',
  },
  {
    id: 'audiencia',
    keywords: ['audiencia', 'seguidores', 'impresiones', 'alcance', 'reproducciones', 'gente', 'pais', 'edad', 'demograf'],
    question: '¿Qué audiencia tienen?',
    answer: '88,7M de impresiones mensuales, 926K seguidores en TikTok, 404K en X y 85K oyentes de podcast. Audiencia principalmente de Ecuador, Colombia, Venezuela, Argentina y México, con fuerte peso en 18–45 años. El media kit completo tiene el detalle por plataforma.',
  },
  {
    id: 'resultados',
    keywords: ['garantia', 'garantizan', 'resultado', 'resultados', 'ventas', 'roi', 'funciona'],
    question: '¿Garantizan resultados?',
    answer: 'No garantizamos ventas ni cifras específicas: es publicidad orgánica en contenido editorial. Sí entregamos métricas reales de cada pieza (impresiones, reproducciones, leads cuando aplica) en el reporte incluido. El Plan PYMEs históricamente genera 200–500 leads directos por campaña.',
  },
  {
    id: 'exclusividad',
    keywords: ['exclusividad', 'exclusivo', 'competencia', 'competidor', 'categoria', 'restriccion', 'prohibido', 'permitido'],
    question: '¿Hay exclusividad por categoría?',
    answer: 'El podcast tiene un solo auspiciante y el Comercial IA admite 5 marcas simultáneas. Categorías como banca, salud, alcohol, apuestas, cripto, política y gobierno pasan por una revisión rápida antes del pago. Si tu marca compite con un anunciante activo, te lo decimos antes de cobrar.',
  },
  {
    id: 'descuento',
    keywords: ['descuento', 'rebaja', 'promocion', 'oferta', 'negociar', 'mas barato'],
    question: '¿Hacen descuentos?',
    answer: 'No manejamos descuentos sobre el tarifario. La mejor tarifa por unidad está en los contratos de 12 meses. Si tu caso es especial, deja tu pregunta y lo revisamos nosotros por escrito.',
  },
  {
    id: 'reporte',
    keywords: ['reporte', 'metrica', 'metricas', 'informe', 'estadistica', 'datos'],
    question: '¿Recibo reporte de resultados?',
    answer: 'Sí. Cada formato incluye un reporte con las métricas indicadas en su tarjeta (impresiones, reproducciones, interacciones o leads). Lo recibes al cierre de la campaña o mensualmente en contratos largos.',
  },
]

/** Normaliza texto: minúsculas, sin tildes */
export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** Devuelve la mejor entrada o null si no hay coincidencia confiable */
export function findAnswer(question: string): KnowledgeEntry | null {
  const q = normalize(question)
  const words = q.split(/\s+/).filter(Boolean).length
  let best: { e: KnowledgeEntry; hits: number } | null = null
  for (const e of AD_KNOWLEDGE) {
    const hits = e.keywords.reduce((n, k) => n + (q.includes(k) ? 1 : 0), 0)
    if (hits > 0 && (!best || hits > best.hits)) best = { e, hits }
  }
  if (!best) return null
  // Una sola coincidencia en una pregunta larga suele ser un caso particular:
  // mejor escalar a humano que responder algo genérico.
  if (best.hits === 1 && words > 7) return null
  return best.e
}

export const AD_ESCALATION_MESSAGE =
  'Esta pregunta sí necesita que la revisemos nosotros. Déjame tus datos y te respondemos en nuestro próximo bloque de atención comercial. No necesitas agendar una reunión.'
