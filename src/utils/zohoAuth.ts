import { ZOHO_OAUTH_CONFIG, getZohoOAuthConfig } from '@/config/zoho-oauth';

export interface ZohoAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  refresh_token?: string;
  api_domain?: string;
}

export interface ZohoUserInfo {
  id: string;
  name: string;
  email: string;
  role?: string;
  [key: string]: any;
}

export interface BackendOAuthRequest {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  grant_type: string;
  location?: string;
  accounts_server?: string;
  domain_suffix?: string;
  timestamp: number;
  user_agent: string;
  source: string;
}

export interface BackendOAuthResponse {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user_info?: ZohoUserInfo;
  error?: string;
  message?: string;
}

export class ZohoAuthService {
  // Get configuration with validation
  private static getConfig() {
    return getZohoOAuthConfig();
  }

  // Helper to get Zoho domain based on region or accounts-server
  static getZohoDomain(regionOrServer?: string): string {
    if (!regionOrServer) return 'accounts.zoho.com';
    // If full URL is given (accounts-server param), extract host
    try {
      if (regionOrServer.startsWith('http')) {
        const url = new URL(regionOrServer);
        return url.host;
      }
    } catch {}
    // If region is given (e.g., 'in'), build domain
    if (regionOrServer.length <= 4 && regionOrServer !== 'com') {
      return `accounts.zoho.${regionOrServer}`;
    }
    // fallback
    return 'accounts.zoho.com';
  }

  // Build Zoho OAuth URLs dynamically
  static getAuthorizationUrl(domain?: string) {
    return `https://${domain || 'accounts.zoho.com'}/oauth/v2/auth`;
  }
  static getTokenUrl(domain?: string) {
    return `https://${domain || 'accounts.zoho.com'}/oauth/v2/token`;
  }

  static validateConfiguration(domain?: string): void {
    const config = this.getConfig();
    const authUrl = this.getAuthorizationUrl(domain);
    const tokenUrl = this.getTokenUrl(domain);
    
    console.log('🔍 Validating Zoho OAuth configuration...');
    console.log('🔍 Environment validation:', import.meta.env.VITE_ZOHO_CLIENT_ID ? '✅ Set' : '❌ Missing');
    
    if (!authUrl.includes('accounts.zoho.')) {
      console.error('❌ AUTHORIZATION_URL must use accounts.zoho.* domain');
      throw new Error('Zoho OAuth configuration error: AUTHORIZATION_URL must use accounts.zoho.* domain');
    }
    if (!tokenUrl.includes('accounts.zoho.')) {
      console.error('❌ TOKEN_URL must use accounts.zoho.* domain');
      throw new Error('Zoho OAuth configuration error: TOKEN_URL must use accounts.zoho.* domain');
    }
    if (config.OAUTH_SCOPE !== 'AaaServer.profile.READ') {
      console.error('❌ OAUTH_SCOPE must be AaaServer.profile.READ, not ZohoAccounts.profile.READ');
      throw new Error('Zoho OAuth configuration error: Scope must be AaaServer.profile.READ');
    }
    console.log('✅ Zoho OAuth configuration is valid');
    console.log('📍 Authorization URL:', authUrl);
    console.log('📍 Token URL:', tokenUrl);
    console.log('📍 Scope:', config.OAUTH_SCOPE);
    console.log('📍 Backend API:', config.BACKEND_ADMIN_ENDPOINT);
  }

  static generateAuthURL(domain?: string): string {
    const config = this.getConfig();
    this.validateConfiguration(domain);

    // Force .com domain to avoid region mismatch issues
    const authDomain = 'accounts.zoho.com';
    console.log('🔍 Generating auth URL with domain:', authDomain);
    console.log('🔍 Using redirect URI:', config.REDIRECT_URL);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.CLIENT_ID,
      scope: config.OAUTH_SCOPE,
      redirect_uri: config.REDIRECT_URL,
      access_type: 'offline'
    });

    const authURL = `${this.getAuthorizationUrl(authDomain)}?${params.toString()}`;
    console.log('🔗 Generated auth URL:', authURL);
    console.log('🔗 Decoded redirect_uri:', decodeURIComponent(params.get('redirect_uri') || ''));
    return authURL;
  }

  static async exchangeCodeForToken(code: string, regionOrServer?: string): Promise<ZohoAuthResponse> {
    const config = this.getConfig();
    const domain = this.getZohoDomain(regionOrServer);
    this.validateConfiguration(domain);
    
    console.log('🔍 Exchanging code for token...');
    console.log('🔍 Domain:', domain);
    console.log('🔍 Code:', code);
    console.log('🔍 Backend endpoint:', config.BACKEND_ADMIN_ENDPOINT);
    
    // Send code to backend API
    console.log('🔍 Making API call to backend...');
    return await this.sendCodeToBackend(code, regionOrServer);
  }

  static async sendCodeToBackend(code: string, regionOrServer?: string): Promise<ZohoAuthResponse> {
    const config = this.getConfig();
    const domain = this.getZohoDomain(regionOrServer);
    
    console.log('🔍 Sending code to backend API...');
    console.log('🔍 Backend endpoint:', config.BACKEND_ADMIN_ENDPOINT);
    console.log('🔍 Domain suffix:', regionOrServer);
    
    const requestData: BackendOAuthRequest = {
      code: code,
      client_id: config.CLIENT_ID,
      client_secret: config.CLIENT_SECRET,
      redirect_uri: config.REDIRECT_URL,
      grant_type: 'authorization_code',
      location: regionOrServer || '',
      accounts_server: regionOrServer || undefined,
      domain_suffix: regionOrServer || undefined,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      source: 'frontend-oauth'
    };

    console.log('🔍 Request data:', {
      ...requestData,
      client_secret: '[HIDDEN]' // Don't log sensitive data
    });

    try {
      const response = await fetch(config.BACKEND_ADMIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(requestData),
        mode: 'cors',
        credentials: 'omit'
      });

      console.log('🔍 Backend response status:', response.status);
      console.log('🔍 Backend response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend API error:', response.status, response.statusText);
        console.error('❌ Error response:', errorText);
        throw new Error(`Backend API error: ${response.status} - ${errorText}`);
      }

      const backendResponse: BackendOAuthResponse = await response.json();
      console.log('✅ Backend API response:', backendResponse);

      if (!backendResponse.success) {
        throw new Error(backendResponse.error || backendResponse.message || 'Backend API returned error');
      }

      // Convert backend response to ZohoAuthResponse format
      const tokenResponse: ZohoAuthResponse = {
        access_token: backendResponse.access_token || '',
        token_type: 'Bearer',
        expires_in: backendResponse.expires_in || 3600,
        scope: config.OAUTH_SCOPE,
        refresh_token: backendResponse.refresh_token,
        api_domain: domain
      };

      console.log('✅ Code sent to backend successfully');
      console.log('🔍 Token response:', tokenResponse);
      return tokenResponse;

    } catch (error) {
      console.error('❌ Backend API call failed:', error);
      
      // Handle different types of errors
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        console.warn('⚠️ CORS error: Backend endpoint not accessible from frontend');
        console.warn('⚠️ Solution: Ensure backend allows CORS from frontend origin');
        throw new Error('Backend API not accessible due to CORS restrictions');
      }
      
      if (error.message.includes('NetworkError') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        console.warn('⚠️ Connection refused: Backend server not running');
        console.warn('⚠️ Solution: Start the backend server at', config.BACKEND_ADMIN_ENDPOINT);
        throw new Error('Backend server not running');
      }
      
      throw error;
    }
  }

  static async refreshToken(refreshToken: string, regionOrServer?: string): Promise<ZohoAuthResponse> {
    const config = this.getConfig();
    const domain = this.getZohoDomain(regionOrServer);
    this.validateConfiguration(domain);
    
    console.log('🔍 Refreshing token...');
    console.log('🔍 Domain:', domain);
    console.log('🔍 Backend endpoint:', config.BACKEND_ADMIN_ENDPOINT);
    
    // Send refresh token to backend API
    console.log('🔍 Making API call to backend for token refresh...');
    
    const requestData = {
      grant_type: 'refresh_token',
      client_id: config.CLIENT_ID,
      client_secret: config.CLIENT_SECRET,
      refresh_token: refreshToken,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      source: 'frontend-oauth'
    };

    try {
      const response = await fetch(config.BACKEND_ADMIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(requestData),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend refresh API error:', response.status, response.statusText);
        console.error('❌ Error response:', errorText);
        throw new Error(`Backend refresh API error: ${response.status} - ${errorText}`);
      }

      const backendResponse: BackendOAuthResponse = await response.json();
      console.log('✅ Backend refresh API response:', backendResponse);

      if (!backendResponse.success) {
        throw new Error(backendResponse.error || backendResponse.message || 'Backend refresh API returned error');
      }

      // Convert backend response to ZohoAuthResponse format
      const tokenResponse: ZohoAuthResponse = {
        access_token: backendResponse.access_token || '',
        token_type: 'Bearer',
        expires_in: backendResponse.expires_in || 3600,
        scope: config.OAUTH_SCOPE,
        refresh_token: backendResponse.refresh_token || refreshToken,
        api_domain: domain
      };

      console.log('✅ Token refresh successful');
      console.log('🔍 Refresh response:', tokenResponse);
      return tokenResponse;

    } catch (error) {
      console.error('❌ Backend refresh API call failed:', error);
      throw error;
    }
  }

  static async getUserInfo(accessToken: string): Promise<ZohoUserInfo> {
    const config = this.getConfig();
    console.log('🔍 Getting user info...');
    console.log('🔍 Using access token:', accessToken ? 'present' : 'missing');
    console.log('🔍 Backend endpoint:', config.BACKEND_USER_INFO_ENDPOINT);
    
    // Get user info from backend API
    console.log('🔍 Making API call to backend for user info...');
    
    try {
      const response = await fetch(config.BACKEND_USER_INFO_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
          'X-Requested-With': 'XMLHttpRequest'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend user info API error:', response.status, response.statusText);
        console.error('❌ Error response:', errorText);
        throw new Error(`Backend user info API error: ${response.status} - ${errorText}`);
      }

      const userInfo: ZohoUserInfo = await response.json();
      console.log('✅ User info retrieved successfully');
      console.log('🔍 User info:', userInfo);
      return userInfo;

    } catch (error) {
      console.error('❌ Backend user info API call failed:', error);
      throw error;
    }
  }

  static async sendTokenToAPI(token: string): Promise<void> {
    const config = this.getConfig();
    console.log('🔍 Sending token to API...');
    console.log('🔍 Target endpoint:', config.BACKEND_ADMIN_ENDPOINT);
    
    // Send token to backend API
    console.log('🔍 Making API call to backend...');
    
    try {
      const response = await fetch(config.BACKEND_ADMIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          token: token,
          timestamp: Date.now(),
          source: 'frontend-oauth',
          userAgent: navigator.userAgent,
          location: window.location.href
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend token API error:', response.status, response.statusText);
        console.error('❌ Error response:', errorText);
        throw new Error(`Backend token API error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Token sent to backend successfully');
      console.log('🔍 API response:', responseData);

    } catch (error) {
      console.error('❌ Backend token API call failed:', error);
      
      // Handle different types of errors
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        console.warn('⚠️ CORS error: Backend endpoint not accessible from frontend');
        console.warn('⚠️ Solution: Ensure backend allows CORS from frontend origin');
        throw new Error('Backend API not accessible due to CORS restrictions');
      }
      
      if (error.message.includes('NetworkError') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        console.warn('⚠️ Connection refused: Backend server not running');
        console.warn('⚠️ Solution: Start the backend server at', config.BACKEND_ADMIN_ENDPOINT);
        throw new Error('Backend server not running');
      }
      
      throw error;
    }
  }
}