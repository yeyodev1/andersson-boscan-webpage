import APIBase from './httpBase'

class AuthService extends APIBase {
  public async login(email: string, password: string): Promise<any> {
    const response = await this.post<any>('auth/login', { email, password })
    return response.data
  }
}

export const authService = new AuthService()
