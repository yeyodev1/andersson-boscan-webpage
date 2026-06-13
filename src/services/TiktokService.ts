import APIBase from './httpBase'

export interface TiktokAccount {
  open_id: string;
  union_id?: string;
  avatar_url?: string;
  display_name?: string;
  username?: string;
  access_token: string;
}

class TiktokService extends APIBase {
  public async getAccounts(): Promise<TiktokAccount[]> {
    const response = await this.get<{ success: boolean; data: TiktokAccount[] }>('tiktok/accounts')
    return response.data.data
  }

  public async exchangeToken(code: string, clientKey: string, clientSecret: string, redirectUri: string): Promise<any> {
    const response = await this.post<any>('tiktok/token', {
      client_key: clientKey,
      client_secret: clientSecret,
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
