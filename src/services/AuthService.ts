import APIBase from './httpBase'

/**
 * Acceso directo al panel /integraciones sin backend, pedido por el cliente.
 * En el repo no vive ninguna credencial: VITE_ACCESO_DIRECTO_HASH es el
 * SHA-256 de `correo:contraseña` y se define en el .env local y en las
 * variables de entorno del hosting. Aun así es un candado de cliente, no un
 * sistema de auth: el panel no debe guardar nada sensible mientras exista.
 */
const ACCESO_DIRECTO_HASH =
  (import.meta.env.VITE_ACCESO_DIRECTO_HASH as string | undefined) ?? ''

async function sha256Hex(texto: string): Promise<string> {
  const data = new TextEncoder().encode(texto)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

class AuthService extends APIBase {
  public async login(email: string, password: string): Promise<any> {
    if (ACCESO_DIRECTO_HASH) {
      try {
        const hash = await sha256Hex(`${email.trim().toLowerCase()}:${password}`)
        if (hash === ACCESO_DIRECTO_HASH) {
          return { token: `local-directo-${Date.now()}` }
        }
      } catch {
        // crypto.subtle no disponible (http sin localhost): sigue al backend
      }
    }

    const response = await this.post<any>('auth/login', { email, password })
    return response.data
  }
}

export const authService = new AuthService()
