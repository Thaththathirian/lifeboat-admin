// Zoho OAuth Configuration using environment variables only
export const ZOHO_OAUTH_CONFIG = {
  // OAuth Credentials - REQUIRED
  CLIENT_ID: import.meta.env.VITE_ZOHO_CLIENT_ID,
  CLIENT_SECRET: import.meta.env.VITE_ZOHO_CLIENT_SECRET,
  
  // Application URLs - REQUIRED
  HOMEPAGE_URL: import.meta.env.VITE_HOMEPAGE_URL,
  REDIRECT_URL: import.meta.env.VITE_REDIRECT_URL,
  
  // Zoho OAuth Endpoints - REQUIRED
  AUTHORIZATION_URL: import.meta.env.VITE_ZOHO_AUTHORIZATION_URL || 'https://accounts.zoho.com/oauth/v2/auth',
  TOKEN_URL: import.meta.env.VITE_ZOHO_TOKEN_URL || 'https://accounts.zoho.com/oauth/v2/token',
  USER_INFO_URL: import.meta.env.VITE_ZOHO_USER_INFO_URL || 'https://accounts.zoho.com/oauth/user/info',
  
  // Backend API Endpoints - REQUIRED
  BACKEND_TOKEN_ENDPOINT: import.meta.env.VITE_BACKEND_TOKEN_ENDPOINT || '/api/zoho/oauth/token',
  BACKEND_USER_INFO_ENDPOINT: import.meta.env.VITE_BACKEND_USER_INFO_ENDPOINT || '/api/zoho/oauth/userinfo',
  BACKEND_ADMIN_ENDPOINT: import.meta.env.VITE_BACKEND_ADMIN_ENDPOINT,
  
  // OAuth Scope - REQUIRED
  OAUTH_SCOPE: import.meta.env.VITE_ZOHO_OAUTH_SCOPE || 'AaaServer.profile.READ'
};

// Validation function to check if all required environment variables are set
export const validateEnvironmentVariables = (): void => {
  const requiredVars = [
    'VITE_ZOHO_CLIENT_ID',
    'VITE_ZOHO_CLIENT_SECRET',
    'VITE_HOMEPAGE_URL',
    'VITE_REDIRECT_URL',
    'VITE_BACKEND_ADMIN_ENDPOINT'
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    const errorMessage = `❌ Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  console.log('✅ All required environment variables are set');
};

// Export a function to get the configuration with validation
export const getZohoOAuthConfig = () => {
  validateEnvironmentVariables();
  return ZOHO_OAUTH_CONFIG;
};