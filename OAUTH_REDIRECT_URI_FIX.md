# OAuth Redirect URI Fix Guide

## Problem
You're getting an "Invalid Redirect Uri" error from Zoho OAuth because the redirect URI in your OAuth URL doesn't match what's configured in your Zoho Developer Console.

## Current Issue
- **Current Redirect URI**: `http://localhost:8082/`
- **Required Redirect URI**: `http://localhost:8082/oauth/callback`

## Solution

### 1. Update Environment Variables

Create or update your `.env` file with the correct redirect URI:

```env
# Zoho OAuth Configuration
VITE_ZOHO_CLIENT_ID=1000.20GXMY1L17S9P8A6NU7UZVCE2BGKHT
VITE_ZOHO_CLIENT_SECRET=10028ea80b6b2f85b3e924f511442a56b3b25ed833

# Application URLs - FIXED
VITE_HOMEPAGE_URL=http://localhost:8082
VITE_REDIRECT_URL=http://localhost:8082/oauth/callback

# Backend API Endpoint
VITE_BACKEND_ADMIN_ENDPOINT=http://localhost/lifeboat/OAuth/Admin

# Zoho OAuth Endpoints (optional)
VITE_ZOHO_AUTHORIZATION_URL=https://accounts.zoho.com/oauth/v2/auth
VITE_ZOHO_TOKEN_URL=https://accounts.zoho.com/oauth/v2/token
VITE_ZOHO_USER_INFO_URL=https://accounts.zoho.com/oauth/user/info

# OAuth Scope
VITE_ZOHO_OAUTH_SCOPE=AaaServer.profile.READ
```

### 2. Update Zoho Developer Console

1. Go to [Zoho Developer Console](https://api-console.zoho.com/)
2. Navigate to your OAuth client
3. Update the **Redirect URI** to: `http://localhost:8082/oauth/callback`
4. Save the changes

### 3. New OAuth Flow Components

I've created the following components to handle the OAuth flow properly:

#### A. OAuth Callback Handler (`/src/pages/admin/AdminOAuthCallback.tsx`)
- Handles the OAuth redirect at `/oauth/callback`
- Processes the authorization code
- Exchanges code for access token
- Stores authentication data
- Redirects to admin dashboard

#### B. OAuth Login Component (`/src/components/ZohoOAuthLogin.tsx`)
- Clean login interface
- Initiates OAuth flow
- Handles errors gracefully

#### C. OAuth Test Page (`/src/pages/admin/AdminOAuthTest.tsx`)
- Validates configuration
- Tests OAuth URL generation
- Provides debugging information

### 4. Updated Routes

The following routes have been added:

```typescript
// OAuth callback route (public)
<Route path="/oauth/callback" element={<AdminOAuthCallback />} />

// OAuth test route (protected)
<Route path="/admin/oauth-test" element={<AdminOAuthTest />} />
```

### 5. Testing the Fix

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Access the OAuth test page**:
   - Go to `http://localhost:8082/admin/oauth-test`
   - Click "Validate Configuration"
   - Check that all environment variables are properly set

3. **Test the OAuth flow**:
   - Click "Test OAuth Flow" to generate the authorization URL
   - The URL should now use the correct redirect URI: `http://localhost:8082/oauth/callback`

4. **Complete the OAuth flow**:
   - You'll be redirected to Zoho for authentication
   - After successful authentication, you'll be redirected back to `/oauth/callback`
   - The callback handler will process the authentication and redirect you to the admin dashboard

### 6. Expected OAuth URL

The generated OAuth URL should look like this:

```
https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=1000.20GXMY1L17S9P8A6NU7UZVCE2BGKHT&scope=AaaServer.profile.READ&redirect_uri=http%3A%2F%2Flocalhost%3A8082%2Foauth%2Fcallback&access_type=offline
```

Notice the redirect_uri is now properly encoded as `http%3A%2F%2Flocalhost%3A8082%2Foauth%2Fcallback` (which decodes to `http://localhost:8082/oauth/callback`).

### 7. Troubleshooting

If you still get errors:

1. **Check environment variables**: Use the OAuth test page to validate your configuration
2. **Verify Zoho settings**: Make sure the redirect URI in Zoho Developer Console matches exactly
3. **Clear browser cache**: Sometimes cached OAuth responses can cause issues
4. **Check console logs**: The OAuth components include detailed logging for debugging

### 8. Security Notes

- The OAuth callback route (`/oauth/callback`) is public and doesn't require authentication
- The callback handler validates the authorization code before processing
- Authentication data is stored securely in localStorage
- The backend API endpoint is called to validate tokens

### 9. Next Steps

After implementing this fix:

1. Test the complete OAuth flow
2. Verify that users can successfully authenticate
3. Check that the admin dashboard is accessible after authentication
4. Monitor the backend API calls to ensure tokens are being processed correctly

## Summary

The main issue was that your OAuth redirect URI was set to `http://localhost:8082/` but Zoho was expecting `http://localhost:8082/oauth/callback`. By updating both the environment variables and the Zoho Developer Console settings, and implementing proper OAuth callback handling, the OAuth flow should now work correctly. 