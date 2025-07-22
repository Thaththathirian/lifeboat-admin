import { ZOHO_OAUTH_CONFIG } from '@/config/zoho-oauth';

export interface ZohoAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export class ZohoAuthService {
  static generateAuthURL(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: ZOHO_OAUTH_CONFIG.CLIENT_ID,
      scope: 'ZohoAccounts.profile.READ',
      redirect_uri: ZOHO_OAUTH_CONFIG.REDIRECT_URL,
      access_type: 'offline'
    });
    
    return `${ZOHO_OAUTH_CONFIG.AUTHORIZATION_URL}?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<ZohoAuthResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: ZOHO_OAUTH_CONFIG.CLIENT_ID,
      client_secret: ZOHO_OAUTH_CONFIG.CLIENT_SECRET,
      redirect_uri: ZOHO_OAUTH_CONFIG.REDIRECT_URL,
      code: code
    });

    const response = await fetch(ZOHO_OAUTH_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }

  static async sendTokenToAPI(token: string): Promise<void> {
    const response = await fetch(ZOHO_OAUTH_CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'location': window.location.href,
        'account-server': 'zoho'
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      throw new Error('Failed to send token to API');
    }
  }
}