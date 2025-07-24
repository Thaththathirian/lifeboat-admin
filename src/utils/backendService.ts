// Backend service for handling Google OAuth authentication
// This file shows how tokens are sent to the backend

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface BackendAuthResponse {
  success: boolean;
  user?: any;
  error?: string;
  token?: string;
}

interface BackendAuthRequest {
  userData: GoogleUser; // Token is sent in Authorization header, not in body
}

// Get the correct API base URL for development and production
const getApiBaseUrl = () => {
  // Use environment variable for API base URL
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost/lifeboat';
  }
  return 'http://localhost/lifeboat';
};

// Send Google OAuth token to backend for verification and user creation
export const authenticateWithBackend = async (
  googleToken: string, 
  userData: GoogleUser
): Promise<BackendAuthResponse> => {
  try {
    console.log('Sending Google JWT token to backend for verification...');
    console.log('User data:', userData);
    console.log('Token type:', typeof googleToken);
    console.log('Token length:', googleToken.length);
    
    // Get reCAPTCHA token if available
    const recaptchaToken = localStorage.getItem('recaptchaToken');
    
    // Use the correct API endpoint
    const apiUrl = `${getApiBaseUrl()}/OAuth/Student`;
    console.log('API URL:', apiUrl);
    
    // Send JWT token in Authorization header for backend verification
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${googleToken}`, // Google JWT token for verification
      },
      body: JSON.stringify({
        userData: userData, // User data for profile creation
        recaptchaToken: recaptchaToken, // reCAPTCHA token for security
        tokenType: 'google_jwt', // Indicate this is a Google JWT token
      }),
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend error response:', errorData);
      
      // Extract meaningful error message
      let errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
      
      // Handle specific error cases
      if (response.status === 401) {
        errorMessage = 'Unauthorized - Your account is not authorized to access this system';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden - You don\'t have permission to access this resource';
      } else if (response.status === 404) {
        errorMessage = 'Service not found - The requested service is currently unavailable';
      } else if (response.status === 500) {
        errorMessage = 'Server error - We\'re experiencing technical difficulties';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Backend authentication successful:', data);
    
    // Clear reCAPTCHA token after successful authentication
    localStorage.removeItem('recaptchaToken');
    
    return {
      success: true,
      user: data.user,
      token: data.token
    };
  } catch (error) {
    console.error('Backend authentication failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Backend connection failed'
    };
  }
};

// Verify user session with backend
export const verifySession = async (): Promise<BackendAuthResponse> => {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Session verification failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      user: data.user
    };
  } catch (error) {
    console.error('Session verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Session verification failed'
    };
  }
};

// Logout user from backend
export const logoutFromBackend = async (): Promise<BackendAuthResponse> => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Logout failed: ${response.status}`);
    }

    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');

    return {
      success: true
    };
  } catch (error) {
    console.error('Backend logout failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed'
    };
  }
};

// Example backend API endpoints that should be implemented:

/*
POST /api/auth/google
Headers: 
  Authorization: Bearer google_jwt_token_here
  Content-Type: application/json

Body:
{
  "userData": {
    "id": "google_user_id",
    "name": "User Name",
    "email": "user@example.com",
    "picture": "profile_picture_url"
  }
}

Response:
{
  "success": true,
  "user": {
    "id": "backend_user_id",
    "googleId": "google_user_id",
    "name": "User Name",
    "email": "user@example.com",
    "picture": "profile_picture_url",
    "status": "Profile Pending",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "backend_jwt_token"
}

GET /api/auth/verify
Headers: Authorization: Bearer backend_jwt_token

Response:
{
  "success": true,
  "user": {
    "id": "backend_user_id",
    "googleId": "google_user_id",
    "name": "User Name",
    "email": "user@example.com",
    "picture": "profile_picture_url",
    "status": "Profile Pending"
  }
}

POST /api/auth/logout
Headers: Authorization: Bearer backend_jwt_token

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
*/ 