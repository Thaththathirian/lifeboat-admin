# Google OAuth Setup Guide

## Current Error
```
The given origin is not allowed for the given client ID
```

This error occurs because your Google OAuth client ID is not configured to allow requests from your current domain.

## Step-by-Step Setup

### 1. **Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `Scholarship Connect`
4. Click "Create"

### 2. **Enable Google+ API**

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity Services"
3. Click on it and click "Enable"

### 3. **Create OAuth 2.0 Credentials**

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - User Type: External
   - App name: Scholarship Connect
   - User support email: your email
   - Developer contact information: your email
   - Save and continue

### 4. **Configure OAuth Client ID**

1. **Application type**: Web application
2. **Name**: Scholarship Connect Web Client
3. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:8080
   http://localhost:5173
   http://localhost:4173
   https://your-production-domain.com
   ```
4. **Authorized redirect URIs**:
   ```
   http://localhost:3000
   http://localhost:8080
   http://localhost:5173
   http://localhost:4173
   https://your-production-domain.com
   ```
5. Click "Create"

### 5. **Copy Client ID and Secret**

1. Copy the **Client ID** (starts with numbers and ends with `.apps.googleusercontent.com`)
2. Copy the **Client Secret** (starts with `GOCSPX-`)

### 6. **Update Environment Variables**

Create or update your `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your_new_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_new_client_secret_here
```

### 7. **Restart Development Server**

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

## Testing the Setup

### 1. **Check Current Configuration**
Open browser console and look for:
```
Google OAuth initialized successfully
```

### 2. **Test Authentication**
1. Click "Apply Now" button
2. Should see Google OAuth popup
3. Sign in with Google account
4. Should redirect to student dashboard

### 3. **Debug Information**
Check console for:
- `Using Google OAuth Client ID: your_client_id`
- `Google OAuth script loaded`
- `Google OAuth initialized successfully`

## Common Issues and Solutions

### Issue 1: "Origin not allowed"
**Solution**: Add your domain to "Authorized JavaScript origins"

### Issue 2: "Redirect URI mismatch"
**Solution**: Add your domain to "Authorized redirect URIs"

### Issue 3: "Client ID not found"
**Solution**: Check that your `.env` file has the correct `VITE_GOOGLE_CLIENT_ID`

### Issue 4: "API not enabled"
**Solution**: Enable Google+ API in Google Cloud Console

## Development vs Production

### Development (localhost)
```
Authorized JavaScript origins:
- http://localhost:3000
- http://localhost:8080
- http://localhost:5173
- http://localhost:4173

Authorized redirect URIs:
- http://localhost:3000
- http://localhost:8080
- http://localhost:5173
- http://localhost:4173
```

### Production
```
Authorized JavaScript origins:
- https://your-domain.com
- https://www.your-domain.com

Authorized redirect URIs:
- https://your-domain.com
- https://www.your-domain.com
```

## Security Best Practices

### 1. **Environment Variables**
- Never commit `.env` files to version control
- Use different client IDs for development and production
- Rotate client secrets regularly

### 2. **Domain Restrictions**
- Only add domains you actually use
- Remove test domains before production
- Use HTTPS in production

### 3. **API Scopes**
- Only request necessary scopes
- For this app: `openid email profile`

## Troubleshooting Checklist

- [ ] Google Cloud Project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized JavaScript origins configured
- [ ] Authorized redirect URIs configured
- [ ] Environment variables set correctly
- [ ] Development server restarted
- [ ] Browser cache cleared

## Debug Commands

### Check Environment Variables
```bash
# In your terminal
echo $VITE_GOOGLE_CLIENT_ID
```

### Check Current Origin
```javascript
// In browser console
console.log('Current origin:', window.location.origin);
console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

### Test OAuth Configuration
```javascript
// In browser console
fetch(`https://accounts.google.com/gsi/status?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}`)
  .then(response => console.log('Status:', response.status))
  .catch(error => console.error('Error:', error));
```

## Next Steps

After setting up Google OAuth:

1. **Test the authentication flow**
2. **Implement backend authentication**
3. **Add user profile management**
4. **Set up session management**
5. **Add logout functionality**

## Support

If you continue to have issues:

1. **Check Google Cloud Console** for any error messages
2. **Verify your client ID** is correct
3. **Test with a different browser**
4. **Check network tab** for failed requests
5. **Contact support** with error logs 