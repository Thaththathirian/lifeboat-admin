#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Zoho OAuth Setup Script');
console.log('==========================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ No .env file found. Creating one...\n');
  
  const envTemplate = `# Zoho OAuth Configuration
# Copy this file to .env and fill in your actual values
# ALL VALUES BELOW ARE REQUIRED - DO NOT LEAVE ANY EMPTY

# Zoho OAuth Client ID (from Zoho Developer Console)
VITE_ZOHO_CLIENT_ID=1000.20GXMY1L17S9P8A6NU7UZVCE2BGKHT

# Zoho OAuth Client Secret (from Zoho Developer Console)
VITE_ZOHO_CLIENT_SECRET=10028ea80b6b2f85b3e924f511442a56b3b25ed833

# Application URLs - FIXED REDIRECT URI
VITE_HOMEPAGE_URL=http://localhost:8082
VITE_REDIRECT_URL=http://localhost:8082/oauth/callback

# Backend API Endpoint (REQUIRED)
VITE_BACKEND_ADMIN_ENDPOINT=http://localhost/lifeboat/OAuth/Admin

# Zoho OAuth Endpoints (optional - will use defaults if not set)
VITE_ZOHO_AUTHORIZATION_URL=https://accounts.zoho.com/oauth/v2/auth
VITE_ZOHO_TOKEN_URL=https://accounts.zoho.com/oauth/v2/token
VITE_ZOHO_USER_INFO_URL=https://accounts.zoho.com/oauth/user/info

# Backend API Endpoints (optional - will use defaults if not set)
VITE_BACKEND_TOKEN_ENDPOINT=/api/zoho/oauth/token
VITE_BACKEND_USER_INFO_ENDPOINT=/api/zoho/oauth/userinfo

# OAuth Scope (optional - will use default if not set)
VITE_ZOHO_OAUTH_SCOPE=AaaServer.profile.READ
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file with OAuth configuration template');
} else {
  console.log('✅ .env file already exists');
  
  // Read and check the current .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for the redirect URI fix
  if (envContent.includes('VITE_REDIRECT_URL=http://localhost:8082/')) {
    console.log('⚠️  Found old redirect URI. Updating to new callback path...');
    
    const updatedContent = envContent.replace(
      /VITE_REDIRECT_URL=http:\/\/localhost:8082\/?/g,
      'VITE_REDIRECT_URL=http://localhost:8082/oauth/callback'
    );
    
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ Updated redirect URI to /oauth/callback');
  } else {
    console.log('✅ Redirect URI is already correctly configured');
  }
}

console.log('\n📋 Setup Checklist:');
console.log('===================');
console.log('1. ✅ Environment variables configured');
console.log('2. ⏳ Update Zoho Developer Console redirect URI to: http://localhost:8082/oauth/callback');
console.log('3. ⏳ Start development server: npm run dev');
console.log('4. ⏳ Test OAuth flow at: http://localhost:8082/admin/oauth-test');
console.log('\n🔗 Zoho Developer Console: https://api-console.zoho.com/');
console.log('📖 OAuth Fix Guide: OAUTH_REDIRECT_URI_FIX.md');

console.log('\n🚀 Next Steps:');
console.log('1. Go to Zoho Developer Console and update the redirect URI');
console.log('2. Start your development server');
console.log('3. Visit http://localhost:8082/admin/oauth-test to validate configuration');
console.log('4. Test the complete OAuth flow');

console.log('\n✨ Setup complete! Happy coding! 🎉'); 