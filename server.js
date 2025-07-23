import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000 to avoid conflicts

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost',
    'http://localhost/google-firebase-auth',
    'http://localhost:8080',
    'http://localhost:8082' // Add support for the current development port
  ],
  credentials: true
}));

// Serve static files from the dist folder
app.use('/google-firebase-auth', express.static(path.join(__dirname, 'dist')));

// Health check endpoint (must come before SPA catch-all)
app.get('/google-firebase-auth/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      frontend: 'http://localhost/google-firebase-auth/',
      api: 'http://localhost/google-firebase-auth/google_auth'
    }
  });
});

// Google OAuth API endpoint
app.post('/google-firebase-auth/google_auth', express.json(), async (req, res) => {
  try {
    console.log('Google OAuth API called');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Extract the Google JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }
    
    const googleToken = authHeader.substring(7);
    console.log('Google token received (length):', googleToken.length);
    
    // For now, just return a success response
    // You can add actual Google token verification here
    res.json({
      success: true,
      user: {
        id: 'backend_user_123',
        googleId: 'google_user_123',
        name: req.body.userData?.name || 'Test User',
        email: req.body.userData?.email || 'test@example.com',
        picture: req.body.userData?.picture || 'https://via.placeholder.com/150',
        status: 'Profile Pending',
        createdAt: new Date().toISOString()
      },
      token: 'backend_session_token_' + Date.now()
    });
    
  } catch (error) {
    console.error('Google OAuth API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Zoho OAuth token exchange proxy endpoint
app.post('/api/zoho/oauth/token', express.json(), async (req, res) => {
  try {
    const { code, client_id, client_secret, redirect_uri, grant_type = 'authorization_code', refresh_token } = req.body;
    
    console.log('Zoho OAuth token exchange request received');
    console.log('Grant type:', grant_type);
    console.log('Code:', code ? 'present' : 'missing');
    console.log('Refresh token:', refresh_token ? 'present' : 'missing');
    console.log('Client ID:', client_id ? 'present' : 'missing');
    
    // Validate required parameters based on grant type
    if (grant_type === 'authorization_code') {
      if (!code || !client_id || !client_secret || !redirect_uri) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Missing required parameters for authorization_code grant'
        });
      }
    } else if (grant_type === 'refresh_token') {
      if (!refresh_token || !client_id || !client_secret) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Missing required parameters for refresh_token grant'
        });
      }
    }
    
    // Prepare the token exchange request
    const params = new URLSearchParams({
      grant_type,
      client_id,
      client_secret
    });
    
    if (grant_type === 'authorization_code') {
      params.append('redirect_uri', redirect_uri);
      params.append('code', code);
    } else if (grant_type === 'refresh_token') {
      params.append('refresh_token', refresh_token);
    }
    
    // Make the request to Zoho's token endpoint
    const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
    console.log('Making request to:', tokenUrl);
    console.log('Parameters:', params.toString());
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    const responseText = await response.text();
    console.log('Zoho response status:', response.status);
    console.log('Zoho response:', responseText);
    
    if (!response.ok) {
      console.error('Zoho token exchange failed:', response.status, responseText);
      return res.status(response.status).json({
        error: 'token_exchange_failed',
        error_description: `Zoho returned ${response.status}: ${responseText}`
      });
    }
    
    // Parse the response
    let tokenResponse;
    try {
      tokenResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Zoho response:', parseError);
      return res.status(500).json({
        error: 'invalid_response',
        error_description: 'Invalid JSON response from Zoho'
      });
    }
    
    console.log('Token exchange successful');
    res.json(tokenResponse);
    
  } catch (error) {
    console.error('Zoho OAuth proxy error:', error);
    res.status(500).json({
      error: 'internal_error',
      error_description: error.message
    });
  }
});

// Zoho user info proxy endpoint
app.get('/api/zoho/oauth/userinfo', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'invalid_request',
        error_description: 'Missing or invalid Authorization header'
      });
    }
    
    const accessToken = authHeader.substring(7);
    console.log('Zoho user info request received');
    console.log('Access token:', accessToken ? 'present' : 'missing');
    
    // Make the request to Zoho's user info endpoint
    const userInfoUrl = 'https://accounts.zoho.com/oauth/user/info';
    console.log('Making request to:', userInfoUrl);
    
    const response = await fetch(userInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    const responseText = await response.text();
    console.log('Zoho user info response status:', response.status);
    console.log('Zoho user info response:', responseText);
    
    if (!response.ok) {
      console.error('Zoho user info failed:', response.status, responseText);
      return res.status(response.status).json({
        error: 'user_info_failed',
        error_description: `Zoho returned ${response.status}: ${responseText}`
      });
    }
    
    // Parse the response
    let userInfo;
    try {
      userInfo = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Zoho user info response:', parseError);
      return res.status(500).json({
        error: 'invalid_response',
        error_description: 'Invalid JSON response from Zoho'
      });
    }
    
    console.log('User info retrieved successfully');
    res.json(userInfo);
    
  } catch (error) {
    console.error('Zoho user info proxy error:', error);
    res.status(500).json({
      error: 'internal_error',
      error_description: error.message
    });
  }
});

// Handle the root path for the application
app.get('/google-firebase-auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Handle all routes for the SPA (Single Page Application) - must be last
app.get('/google-firebase-auth/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost/google-firebase-auth/`);
  console.log(`🔗 API: http://localhost/google-firebase-auth/google_auth`);
  console.log(`❤️  Health: http://localhost/google-firebase-auth/health`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('   GET  /google-firebase-auth/          - Frontend application');
  console.log('   POST /google-firebase-auth/google_auth - Google OAuth API');
  console.log('   GET  /google-firebase-auth/health     - Health check');
  console.log('   POST /api/zoho/oauth/token          - Zoho OAuth token exchange');
  console.log('   GET  /api/zoho/oauth/userinfo      - Zoho user info');
  console.log('');
  console.log('🔧 For development, you can also access:');
  console.log('   http://localhost:8080/ (Vite dev server)');
}); 