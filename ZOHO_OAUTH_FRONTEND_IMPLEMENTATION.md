# Zoho OAuth Frontend Implementation

## Overview

This implementation provides a complete frontend-only Zoho OAuth flow for the admin portal. The backend integration is left for separate implementation.

## Flow Overview

1. **Frontend redirects user to Zoho OAuth Login** ✅
2. **Zoho redirects back with a code** ✅
3. **Frontend sends code to backend** (Mock implementation)
4. **Backend exchanges code for access_token** (Mock implementation)
5. **Backend uses access_token to fetch user info** (Mock implementation)
6. **Backend sends user data back to frontend** (Mock implementation)

## Configuration

### Zoho OAuth Settings
- **Client ID**: `1000.20GXMY1L17S9P8A6NU7UZVCE2BGKHT`
- **Client Secret**: `10028ea80b6b2f85b3e924f511442a56b3b25ed833`
- **Homepage**: `http://localhost:8081`
- **Redirect URL**: `http://localhost:8081/admin/dashboard`
- **Scope**: `AaaServer.profile.READ`

## Implementation Details

### 1. Configuration (`src/config/zoho-oauth.ts`)
```typescript
export const ZOHO_OAUTH_CONFIG = {
  CLIENT_ID: '1000.20GXMY1L17S9P8A6NU7UZVCE2BGKHT',
  CLIENT_SECRET: '10028ea80b6b2f85b3e924f511442a56b3b25ed833',
  HOMEPAGE_URL: 'http://localhost:8081',
  REDIRECT_URL: 'http://localhost:8081/admin/dashboard',
  AUTHORIZATION_URL: 'https://accounts.zoho.com/oauth/v2/auth',
  TOKEN_URL: 'https://accounts.zoho.com/oauth/v2/token',
  USER_INFO_URL: 'https://accounts.zoho.com/oauth/user/info',
  // Backend endpoints (to be implemented)
  BACKEND_TOKEN_ENDPOINT: '/api/zoho/oauth/token',
  BACKEND_USER_INFO_ENDPOINT: '/api/zoho/oauth/userinfo',
  BACKEND_ADMIN_ENDPOINT: 'http://localhost/lifeboat/OAuth/Admin'
};
```

### 2. OAuth Service (`src/utils/zohoAuth.ts`)
- **`generateAuthURL()`**: Creates Zoho OAuth authorization URL
- **`exchangeCodeForToken()`**: Exchanges authorization code for access token (mock)
- **`getUserInfo()`**: Fetches user information from Zoho (mock)
- **`sendTokenToAPI()`**: Sends token to backend API (mock)

### 3. Admin Login Component (`src/pages/admin/AdminLogin.tsx`)
- Handles OAuth callback processing
- Stores authentication data in localStorage
- Redirects to dashboard on success
- Shows loading states during authentication

### 4. Route Protection (`src/App.tsx`)
- `ProtectedAdminRoute`: Checks for valid authentication
- Redirects to `/admin/login` if not authenticated
- Handles logout functionality

## Usage

### Starting the Application
```bash
npm run dev
```

### Accessing Admin Portal
1. Navigate to `http://localhost:8081`
2. Click "Go to Admin Login"
3. Click "Login with Zoho"
4. Complete Zoho authentication
5. Redirected to admin dashboard

### OAuth Flow Steps

#### Step 1: Initiate Login
- User clicks "Login with Zoho"
- Frontend generates authorization URL
- Redirects to Zoho OAuth page

#### Step 2: Zoho Authentication
- User authenticates with Zoho
- Zoho redirects back with authorization code
- URL: `http://localhost:8081/admin/dashboard?code=...`

#### Step 3: Process Callback
- `AdminLogin` component detects OAuth callback
- Extracts authorization code from URL
- Calls `ZohoAuthService.exchangeCodeForToken()`

#### Step 4: Token Exchange (Mock)
- Frontend simulates token exchange
- Returns mock access token and refresh token
- In production, this would call your backend API

#### Step 5: Get User Info (Mock)
- Frontend simulates fetching user information
- Returns mock user data
- In production, this would call your backend API

#### Step 6: Store Authentication
- Stores authentication data in localStorage
- Includes user info, tokens, and metadata
- Sets up admin session

#### Step 7: Redirect to Dashboard
- Redirects to `/admin/dashboard`
- User sees protected admin interface

## Mock Implementation

The current implementation uses mock responses for:
- Token exchange
- User info retrieval
- Backend API calls

This allows frontend development and testing without a backend server.

### Mock Responses

#### Token Exchange
```typescript
{
  access_token: 'mock_access_token_' + Date.now(),
  token_type: 'Bearer',
  expires_in: 3600,
  scope: 'AaaServer.profile.READ',
  refresh_token: 'mock_refresh_token_' + Date.now(),
  api_domain: 'accounts.zoho.com'
}
```

#### User Info
```typescript
{
  id: 'zoho_user_' + Date.now(),
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  picture: 'https://via.placeholder.com/150',
  account_id: 'mock_account_id',
  first_name: 'Admin',
  last_name: 'User',
  display_name: 'Admin User',
  timezone: 'UTC',
  locale: 'en_US'
}
```

## Backend Integration Points

When implementing the backend, replace these mock functions:

### 1. Token Exchange
Replace `exchangeCodeForToken()` to call your backend:
```typescript
// Current (mock)
const mockTokenResponse = { /* mock data */ };

// Future (backend)
const response = await fetch('/api/zoho/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code, client_id, client_secret, redirect_uri })
});
```

### 2. User Info
Replace `getUserInfo()` to call your backend:
```typescript
// Current (mock)
const mockUserInfo = { /* mock data */ };

// Future (backend)
const response = await fetch('/api/zoho/oauth/userinfo', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### 3. API Integration
Replace `sendTokenToAPI()` to call your backend:
```typescript
// Current (mock)
console.log('Mock API call');

// Future (backend)
const response = await fetch('http://localhost/lifeboat/OAuth/Admin', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ token, timestamp, source: 'frontend-oauth' })
});
```

## Security Considerations

### Frontend Security
- ✅ OAuth configuration validation
- ✅ Secure token storage in localStorage
- ✅ Protected route implementation
- ✅ Automatic logout on authentication failure

### Backend Security (To Implement)
- 🔄 Secure token exchange with client secret
- 🔄 User info validation
- 🔄 Session management
- 🔄 Token refresh handling

## Error Handling

### Configuration Errors
- Invalid OAuth settings
- Missing client credentials
- Incorrect redirect URLs

### Authentication Errors
- Invalid authorization codes
- Token exchange failures
- User info retrieval failures

### Network Errors
- Backend API unavailability
- CORS issues
- Network timeouts

## Testing

### Manual Testing
1. Start development server: `npm run dev`
2. Navigate to `http://localhost:8081`
3. Click "Go to Admin Login"
4. Click "Login with Zoho"
5. Complete OAuth flow
6. Verify dashboard access

### Console Logging
The implementation includes extensive console logging:
- 🔍 Configuration validation
- 🔗 OAuth URL generation
- ✅ Token exchange success
- ✅ User info retrieval
- ❌ Error handling

## Development Notes

### Current Status
- ✅ Frontend OAuth flow complete
- ✅ Mock backend responses
- ✅ Route protection
- ✅ Authentication state management
- 🔄 Backend integration pending

### Next Steps
1. Implement backend API endpoints
2. Replace mock responses with real API calls
3. Add proper error handling for backend failures
4. Implement token refresh logic
5. Add session management

## File Structure

```
src/
├── config/
│   └── zoho-oauth.ts          # OAuth configuration
├── utils/
│   └── zohoAuth.ts            # OAuth service
├── pages/
│   ├── LandingPage.tsx        # Landing page
│   └── admin/
│       └── AdminLogin.tsx     # Admin login component
└── App.tsx                    # Route protection
```

## Troubleshooting

### Common Issues

#### 1. OAuth Configuration Errors
- Check client ID and secret
- Verify redirect URL matches Zoho settings
- Ensure correct scope is used

#### 2. Redirect Issues
- Verify redirect URL in Zoho console
- Check for URL encoding issues
- Ensure HTTPS for production

#### 3. Authentication Failures
- Check browser console for errors
- Verify OAuth callback processing
- Check localStorage for auth data

#### 4. Route Protection Issues
- Verify authentication data format
- Check route protection logic
- Ensure proper redirects

## Production Considerations

### Environment Variables
Move sensitive data to environment variables:
```typescript
CLIENT_ID: process.env.REACT_APP_ZOHO_CLIENT_ID,
CLIENT_SECRET: process.env.REACT_APP_ZOHO_CLIENT_SECRET,
```

### HTTPS Requirements
- Zoho OAuth requires HTTPS in production
- Update redirect URLs accordingly
- Configure SSL certificates

### Backend Integration
- Implement proper backend API endpoints
- Add CORS configuration
- Implement secure token handling
- Add session management

### Error Monitoring
- Add error tracking (Sentry, etc.)
- Implement proper logging
- Add user feedback mechanisms 