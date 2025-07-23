# Backend API Integration

## Overview

This document explains how the frontend integrates with your backend API at `http://localhost/lifeboat/OAuth/Admin` to handle Zoho OAuth authentication. The frontend always uses real backend API calls - no mock data is used.

## API Endpoint

**URL**: `http://localhost/lifeboat/OAuth/Admin`  
**Method**: `POST`  
**Content-Type**: `application/json`

## Request Format

The frontend sends the following data to your backend API:

```typescript
interface BackendOAuthRequest {
  code: string;                    // Authorization code from Zoho
  client_id: string;              // Zoho OAuth Client ID
  client_secret: string;          // Zoho OAuth Client Secret
  redirect_uri: string;           // OAuth redirect URI
  grant_type: string;             // Always "authorization_code"
  location?: string;              // Current page URL
  accounts_server?: string;       // Zoho server region (if provided)
  timestamp: number;              // Request timestamp
  user_agent: string;             // Browser user agent
  source: string;                 // Always "frontend-oauth"
}
```

### Example Request

```json
{
  "code": "1000.abc123def456.xyz789",
  "client_id": "1000.20GXMY1L17S9P8A6NU7UZVCE2BGKHT",
  "client_secret": "10028ea80b6b2f85b3e924f511442a56b3b25ed833",
  "redirect_uri": "http://localhost:8082/admin/dashboard",
  "grant_type": "authorization_code",
  "location": "http://localhost:8082/admin/dashboard?code=1000.abc123def456.xyz789&accounts-server=https://accounts.zoho.in",
  "accounts_server": "https://accounts.zoho.in",
  "timestamp": 1703123456789,
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "source": "frontend-oauth"
}
```

## Expected Response Format

Your backend should respond with:

```typescript
interface BackendOAuthResponse {
  success: boolean;               // true if successful, false if error
  access_token?: string;          // Zoho access token
  refresh_token?: string;         // Zoho refresh token (optional)
  expires_in?: number;            // Token expiration time in seconds
  user_info?: ZohoUserInfo;      // User information from Zoho
  error?: string;                 // Error message (if success is false)
  message?: string;               // Additional message
}
```

### Example Success Response

```json
{
  "success": true,
  "access_token": "1000.abc123def456.xyz789",
  "refresh_token": "1000.refresh123.xyz789",
  "expires_in": 3600,
  "user_info": {
    "id": "123456789",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "account_id": "987654321",
    "first_name": "Admin",
    "last_name": "User",
    "display_name": "Admin User",
    "timezone": "UTC",
    "locale": "en_US"
  }
}
```

### Example Error Response

```json
{
  "success": false,
  "error": "Invalid authorization code",
  "message": "The provided authorization code has expired or is invalid"
}
```

## Backend Implementation Steps

### 1. Receive the Request

Your backend should:
- Accept POST requests to `/OAuth/Admin`
- Parse the JSON request body
- Validate required fields (code, client_id, client_secret, redirect_uri)

### 2. Exchange Code for Token

Use the received code to exchange it for an access token with Zoho:

```php
// PHP Example
$code = $_POST['code'];
$client_id = $_POST['client_id'];
$client_secret = $_POST['client_secret'];
$redirect_uri = $_POST['redirect_uri'];

$token_url = 'https://accounts.zoho.com/oauth/v2/token';
$post_data = [
    'grant_type' => 'authorization_code',
    'client_id' => $client_id,
    'client_secret' => $client_secret,
    'redirect_uri' => $redirect_uri,
    'code' => $code
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $token_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    $token_data = json_decode($response, true);
    // Process successful token response
} else {
    // Handle error
}
```

### 3. Get User Information

Use the access token to fetch user information from Zoho:

```php
// PHP Example
$access_token = $token_data['access_token'];
$user_info_url = 'https://accounts.zoho.com/oauth/user/info';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $user_info_url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $access_token,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$user_response = curl_exec($ch);
$user_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($user_http_code === 200) {
    $user_data = json_decode($user_response, true);
    // Process user information
} else {
    // Handle error
}
```

### 4. Return Response

Format and return the response to the frontend:

```php
// PHP Example
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8082');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($success) {
    echo json_encode([
        'success' => true,
        'access_token' => $token_data['access_token'],
        'refresh_token' => $token_data['refresh_token'] ?? null,
        'expires_in' => $token_data['expires_in'] ?? 3600,
        'user_info' => $user_data
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => $error_message
    ]);
}
```

## CORS Configuration

Your backend must allow CORS requests from the frontend:

```php
// PHP Example - Add these headers to your response
header('Access-Control-Allow-Origin: http://localhost:8082');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Origin, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

## Error Handling

### Common Errors

1. **Invalid Authorization Code**
   - Code has expired
   - Code has already been used
   - Code doesn't match redirect URI

2. **Invalid Client Credentials**
   - Wrong client ID or secret
   - Client not authorized for the redirect URI

3. **Network Errors**
   - Backend server not running
   - CORS issues
   - Network connectivity problems

### Error Response Format

```json
{
  "success": false,
  "error": "Invalid authorization code",
  "message": "The authorization code has expired or is invalid"
}
```

## Security Considerations

### 1. Validate Input
- Check that all required fields are present
- Validate the authorization code format
- Verify client credentials

### 2. Secure Token Storage
- Store tokens securely (encrypted)
- Implement token expiration handling
- Use HTTPS in production

### 3. CORS Configuration
- Only allow requests from trusted origins
- Limit allowed methods and headers
- Set appropriate max age

### 4. Rate Limiting
- Implement rate limiting to prevent abuse
- Log authentication attempts
- Monitor for suspicious activity

## Testing

### 1. Check Console Logs
The frontend provides detailed console logging:
- Request data (without sensitive information)
- Response status and headers
- Error messages and solutions

### 2. Test Backend Connectivity
Ensure your backend server is running and accessible:
```bash
curl -X POST http://localhost/lifeboat/OAuth/Admin \
  -H "Content-Type: application/json" \
  -d '{"test": "connection"}'
```

## Environment Variables

Set up your `.env` file with the required variables:

```env
# Zoho OAuth Configuration
VITE_ZOHO_CLIENT_ID=1000.20GXMY1L17S9P8A6NU7UZVCE2BGKHT
VITE_ZOHO_CLIENT_SECRET=10028ea80b6b2f85b3e924f511442a56b3b25ed833

# Application URLs
VITE_HOMEPAGE_URL=http://localhost:8082
VITE_REDIRECT_URL=http://localhost:8082/admin/dashboard

# Backend API endpoint
VITE_BACKEND_ADMIN_ENDPOINT=http://localhost/lifeboat/OAuth/Admin
```

## Troubleshooting

### Backend Not Responding
- Check if backend server is running
- Verify the endpoint URL is correct
- Check server logs for errors

### CORS Errors
- Ensure backend allows CORS from frontend origin
- Check that all required headers are set
- Verify preflight OPTIONS request handling

### Authentication Failures
- Verify Zoho OAuth credentials
- Check authorization code validity
- Ensure redirect URI matches exactly

### Network Errors
- Check network connectivity
- Verify firewall settings
- Test with curl or Postman first

## Real-Time Integration

The frontend now always makes real API calls to your backend:

1. **Token Exchange**: Sends authorization code to backend
2. **User Info**: Gets user data from backend
3. **Token Refresh**: Handles token refresh through backend
4. **Token Storage**: Sends tokens to backend for storage

No mock data is used - all operations are real API calls to your backend server. 