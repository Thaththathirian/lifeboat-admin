# Scholarship Connect - Admin Portal

A React-based admin portal for managing scholarship programs with Zoho OAuth integration.

## 🚀 Quick Start

### Prerequisites
- Node.js & npm installed
- Zoho Developer Console access
- Backend API endpoint ready

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd lifeboat-admin

# Step 3: Install dependencies
npm i

# Step 4: Set up environment variables
cp zoho-env-template.txt .env
# Edit .env with your actual Zoho credentials

# Step 5: Start the development server
npm run dev
```

## 🔐 Environment Setup

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# Zoho OAuth Credentials (REQUIRED)
VITE_ZOHO_CLIENT_ID=your_zoho_client_id
VITE_ZOHO_CLIENT_SECRET=your_zoho_client_secret

# Application URLs (REQUIRED)
VITE_HOMEPAGE_URL=http://localhost:8082
VITE_REDIRECT_URL=http://localhost:8082/

# Backend API (REQUIRED)
VITE_BACKEND_ADMIN_ENDPOINT=http://localhost/lifeboat/OAuth/Admin
```

### Security Features

- ✅ **No hardcoded secrets** - All sensitive data in environment variables
- ✅ **Validation on startup** - App fails fast if required variables missing
- ✅ **Clear error messages** - Easy to identify configuration issues
- ✅ **Environment-specific config** - Different values for dev/production

## 🔧 Configuration

### Zoho OAuth Setup

1. **Create OAuth App** in Zoho Developer Console
2. **Set Redirect URL** to `http://localhost:8082/`
3. **Copy credentials** to your `.env` file
4. **Configure backend** to handle OAuth callbacks

### Backend API Requirements

Your backend at `VITE_BACKEND_ADMIN_ENDPOINT` must:

- Accept POST requests with OAuth authorization code
- Handle CORS from your frontend domain
- Exchange code for token with Zoho
- Return user data in expected format

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/          # UI components
├── pages/              # Page components
│   └── admin/         # Admin pages
├── config/             # Configuration
├── utils/              # Utilities
└── types/              # TypeScript types
```

### Key Features
- **Single-page OAuth login** - Direct Zoho authentication
- **Protected routes** - Admin-only access
- **Real-time validation** - Environment variable checks
- **Error handling** - Comprehensive error management

## 🛡️ Security

### Environment Variables Only
- No hardcoded credentials in source code
- All sensitive data in `.env` file
- Validation prevents missing variables
- Safe for version control

### OAuth Flow
1. User visits landing page
2. Clicks "Login with Zoho"
3. Redirected to Zoho OAuth
4. Returns with authorization code
5. Code sent to backend API
6. User authenticated and redirected to dashboard

## 📚 Documentation

- [Security Improvements](SECURITY_IMPROVEMENTS.md) - Environment variable setup
- [Backend API Integration](BACKEND_API_INTEGRATION.md) - API requirements
- [Environment Setup](ENVIRONMENT_SETUP.md) - Detailed setup guide

## 🚀 Deployment

### Development
```sh
npm run dev
```

### Production
```sh
npm run build
npm run preview
```

### Environment Variables for Production
```env
VITE_HOMEPAGE_URL=https://yourdomain.com
VITE_REDIRECT_URL=https://yourdomain.com/
VITE_BACKEND_ADMIN_ENDPOINT=https://yourdomain.com/api/oauth/admin
```

## 🛠️ Technologies

- **Frontend**: React, TypeScript, Vite
- **UI**: shadcn-ui, Tailwind CSS
- **Authentication**: Zoho OAuth 2.0
- **State Management**: React hooks, localStorage
- **Build Tool**: Vite

## 📝 License

This project is part of the Scholarship Connect platform.

---

**Note**: Never commit your `.env` file to version control. Use `.env.example` for templates.
