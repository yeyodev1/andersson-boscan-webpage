import APIBase from './httpBase'

export interface InstagramAccount {
  ig_account_id: string;
  page_id?: string;
  username: string;
  followers_count?: number;
  profile_picture_url?: string;
  access_token: string;
}

class InstagramService extends APIBase {
  public async getAccounts(): Promise<InstagramAccount[]> {
    const response = await this.get<{ success: boolean; data: InstagramAccount[] }>('instagram/accounts')
    const res = response as any;
    return res.data.data || res.data;
  }

  public async exchangeToken(shortLivedToken: string, clientId: string, clientSecret: string): Promise<any> {
    const response = await this.post<any>('instagram/exchange-token', {
      client_id: clientId,
      client_secret: clientSecret,
      short_lived_token: shortLivedToken
    })
    return response.data
  }

  public async deleteAccount(accountId: string): Promise<void> {
    await this.delete(`instagram/accounts/${accountId}`)
  }
}

export const instagramService = new InstagramService()
