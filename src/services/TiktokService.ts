import APIBase from './httpBase'

export interface TiktokAccount {
  open_id: string;
  union_id?: string;
  avatar_url?: string;
  display_name?: string;
  username?: string;
  connected?: boolean;
  access_expires_at?: number;
  refresh_expires_at?: number;
}

class TiktokService extends APIBase {
  public async getAccounts(): Promise<TiktokAccount[]> {
    const response = await this.get<{ success: boolean; data: TiktokAccount[] }>('tiktok/accounts')
    return response.data.data
  }

  // Solo manda el code: el client_secret vive en el backend (el repo es público).
  public async exchangeToken(code: string, redirectUri: string): Promise<any> {
    const response = await this.post<any>('tiktok/token', {
      code,
      redirect_uri: redirectUri
    })
    return response.data
  }

  public async deleteAccount(openId: string): Promise<void> {
    await this.delete(`tiktok/accounts/${openId}`)
  }
}

export const tiktokService = new TiktokService()
