# Environment Variables Setup Guide

## Overview

This guide explains how to set up environment variables for the Zoho OAuth implementation. Environment variables are used to store sensitive configuration data like client IDs, secrets, and URLs.

## Quick Setup

### 1. Create Environment File

Copy the template file to create your `.env` file:

```bash
cp zoho-env-template.txt .env
```

### 2. Edit Environment File

Open the `.env` file and update the values with your actual Zoho OAuth credentials:

```env
# Zoho OAuth Configuration
VITE_ZOHO_CLIENT_ID=1000.20GXMY1L17S9P8A6NU7UZVCE2BGKHT
VITE_ZOHO_CLIENT_SECRET=10028ea80b6b2f85b3e924f511442a56b3b25ed833
VITE_HOMEPAGE_URL=http://localhost:8082
VITE_REDIRECT_URL=http://localhost:8082/admin/dashboard
VITE_USE_MOCK_OAUTH=true
```

### 3. Restart Development Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_ZOHO_CLIENT_ID` | Zoho OAuth Client ID | `1000.20GXMY1L17S9P8A6NU7UZVCE2BGKHT` |
| `VITE_ZOHO_CLIENT_SECRET` | Zoho OAuth Client Secret | `10028ea80b6b2f85b3e924f511442a56b3b25ed833` |
| `VITE_HOMEPAGE_URL` | Application homepage URL | `http://localhost:8082` |
| `VITE_REDIRECT_URL` | OAuth redirect URL | `http://localhost:8082/admin/dashboard` |

### Optional Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_ZOHO_AUTHORIZATION_URL` | Zoho authorization endpoint | `https://accounts.zoho.com/oauth/v2/auth` |
| `VITE_ZOHO_TOKEN_URL` | Zoho token endpoint | `https://accounts.zoho.com/oauth/v2/token` |
| `VITE_ZOHO_USER_INFO_URL` | Zoho user info endpoint | `https://accounts.zoho.com/oauth/user/info` |
| `VITE_ZOHO_OAUTH_SCOPE` | OAuth scope | `AaaServer.profile.READ` |
| `VITE_USE_MOCK_OAUTH` | Enable mock responses for development | `true` |
| `VITE_BACKEND_TOKEN_ENDPOINT` | Backend token exchange endpoint | `/api/zoho/oauth/token` |
| `VITE_BACKEND_USER_INFO_ENDPOINT` | Backend user info endpoint | `/api/zoho/oauth/userinfo` |
| `VITE_BACKEND_ADMIN_ENDPOINT` | Backend admin endpoint | `http://localhost/lifeboat/OAuth/Admin` |

## Development vs Production

### Development Environment

For development, you can use mock responses:

```env
VITE_USE_MOCK_OAUTH=true
```

This allows you to test the OAuth flow without a backend server.

### Production Environment

For production, disable mock responses and set up real backend endpoints:

```env
VITE_USE_MOCK_OAUTH=false
VITE_BACKEND_TOKEN_ENDPOINT=https://your-api.com/api/zoho/oauth/token
VITE_BACKEND_USER_INFO_ENDPOINT=https://your-api.com/api/zoho/oauth/userinfo
VITE_BACKEND_ADMIN_ENDPOINT=https://your-api.com/OAuth/Admin
```

## Security Best Practices

### 1. Never Commit .env Files

Add `.env` to your `.gitignore` file:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 2. Use Different Values for Different Environments

Create separate environment files for different environments:

- `.env.development` - Development environment
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

### 3. Validate Environment Variables

The application includes validation to check for required environment variables:

```typescript
// This will show warnings if required variables are missing
validateEnvironmentVariables();
```

## Troubleshooting

### Missing Environment Variables

If you see warnings about missing environment variables:

1. Check that your `.env` file exists
2. Verify the variable names start with `VITE_`
3. Restart the development server after making changes

### Environment Variables Not Loading

If environment variables are not being loaded:

1. Make sure the `.env` file is in the project root
2. Check that variable names start with `VITE_` (required for Vite)
3. Restart the development server

### Production Deployment

For production deployment:

1. Set up environment variables on your hosting platform
2. Disable mock OAuth mode: `VITE_USE_MOCK_OAUTH=false`
3. Configure real backend endpoints
4. Use HTTPS URLs for all endpoints

## Example .env File

```env
# Zoho OAuth Configuration
VITE_ZOHO_CLIENT_ID=1000.20GXMY1L17S9P8A6NU7UZVCE2BGKHT
VITE_ZOHO_CLIENT_SECRET=10028ea80b6b2f85b3e924f511442a56b3b25ed833

# Application URLs
VITE_HOMEPAGE_URL=http://localhost:8082
VITE_REDIRECT_URL=http://localhost:8082/admin/dashboard

# Zoho OAuth Endpoints
VITE_ZOHO_AUTHORIZATION_URL=https://accounts.zoho.com/oauth/v2/auth
VITE_ZOHO_TOKEN_URL=https://accounts.zoho.com/oauth/v2/token
VITE_ZOHO_USER_INFO_URL=https://accounts.zoho.com/oauth/user/info

# Backend API Endpoints
VITE_BACKEND_TOKEN_ENDPOINT=/api/zoho/oauth/token
VITE_BACKEND_USER_INFO_ENDPOINT=/api/zoho/oauth/userinfo
VITE_BACKEND_ADMIN_ENDPOINT=http://localhost/lifeboat/OAuth/Admin

# OAuth Scope
VITE_ZOHO_OAUTH_SCOPE=AaaServer.profile.READ

# Development Mode
VITE_USE_MOCK_OAUTH=true
```

## Validation

The application will automatically validate environment variables and show:

- ✅ Green checkmark for properly set variables
- ⚠️ Warning for missing variables (with fallback values)
- ❌ Error for critical configuration issues

Check the browser console for validation messages when the application starts. 