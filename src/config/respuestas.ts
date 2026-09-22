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
    keywords: ['precio', 'cuesta', 'costo', 'tarifa', 'vale', 'valor', 'usd', 'dolar', 'presupuesto'],
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
    keywords: ['plataforma', 'red', 'redes', 'tiktok', 'youtube', 'instagram', 'facebook', 'spotify', 'donde', 'canal', 'publica'],
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
    keywords: ['tiempo', 'cuando', 'demora', 'tarda', 'plazo', 'semana', 'dias', 'rapido', 'fecha', 'disponib', 'cupo'],
    question: '¿Cuánto tarda en publicarse?',
    answer: 'Un TikTok patrocinado o un video dedicado tarda entre 2 y 4 semanas desde la aprobación del guion. El Plan PYMEs es inmediato. El Comercial IA y el podcast dependen del cupo disponible (5 marcas y 1 auspiciante, respectivamente). Al armar tu campaña eliges una fecha tentativa y te confirmamos.',
  },
  {
    id: 'pago',
    keywords: ['pago', 'pagar', 'paga', 'pagan', 'tarjeta', 'transferencia', 'factura', 'metodo', 'paypal', 'cobr'],
    question: '¿Cómo se paga?',
    answer: 'Campañas de un mes: pago online al confirmar (te enviamos el enlace de pago al correo junto con la confirmación). Contratos de 6 y 12 meses: firma electrónica y pago tras aceptar la propuesta. Emitimos factura de Eureka Productions Cía. Ltda.',
  },
  {
    id: 'audiencia',
    keywords: ['audiencia', 'seguidor', 'impresion', 'alcance', 'reproducci', 'gente', 'pais', 'edad', 'demograf'],
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
    keywords: ['exclusiv', 'competidor', 'categoria', 'restriccion', 'prohibid', 'permitid', 'apuesta', 'casino', 'alcohol', 'cripto', 'politic'],
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
    keywords: ['reporte', 'metrica', 'informe', 'estadistica'],
    question: '¿Recibo reporte de resultados?',
    answer: 'Sí. Cada formato incluye un reporte con las métricas indicadas en su tarjeta (impresiones, reproducciones, interacciones o leads). Lo recibes al cierre de la campaña o mensualmente en contratos largos.',
  },
]

/** Normaliza texto: minúsculas, sin tildes */
export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * Posición de la primera palabra de la pregunta que empieza con la clave
 * (o de la frase, si la clave tiene espacios). -1 si no aparece.
 * Se compara por inicio de palabra para que "credito" no active "red" ni
 * "cuantos seguidores" caiga en precios.
 */
function keywordPos(words: string[], text: string, k: string): number {
  if (k.includes(' ')) return text.indexOf(k)
  const i = words.findIndex(w => w.startsWith(k))
  return i === -1 ? -1 : i
}

/** Devuelve la mejor entrada o null si no hay coincidencia confiable */
export function findAnswer(question: string): KnowledgeEntry | null {
  const q = normalize(question).replace(/[^a-z0-9ñ\s]/g, ' ')
  const words = q.split(/\s+/).filter(Boolean)
  let best: { e: KnowledgeEntry; hits: number; first: number } | null = null
  for (const e of AD_KNOWLEDGE) {
    // Se cuentan palabras distintas: "resultado" y "resultados" sobre la misma
    // palabra no deben sumar dos.
    const matched = new Set<number>()
    for (const k of e.keywords) {
      const pos = keywordPos(words, q, k)
      if (pos !== -1) matched.add(k.includes(' ') ? -1 - pos : pos)
    }
    const hits = matched.size
    if (!hits) continue
    const first = Math.min(...[...matched].map(p => (p < 0 ? 0 : p)))
    // Más coincidencias gana; en empate, el tema que aparece primero en la pregunta.
    if (!best || hits > best.hits || (hits === best.hits && first < best.first)) best = { e, hits, first }
  }
  if (!best) return null
  // Una sola coincidencia en una pregunta larga suele ser un caso particular:
  // mejor escalar a humano que responder algo genérico.
  if (best.hits === 1 && words.length > 7) return null
  return best.e
}

export const AD_ESCALATION_MESSAGE =
  'Esta pregunta sí necesita que la revisemos nosotros. Déjame tus datos y te respondemos en nuestro próximo bloque de atención comercial. No necesitas agendar una reunión.'
