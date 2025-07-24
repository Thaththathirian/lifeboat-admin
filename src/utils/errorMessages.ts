export interface ErrorInfo {
  title: string;
  message: string;
  suggestion?: string;
  isUserFriendly: boolean;
}

export class ErrorMessageMapper {
  private static readonly errorPatterns = {
    // OAuth specific errors
    'Token exchange failed': {
      title: 'Authentication Failed',
      message: 'We couldn\'t verify your account. This might be because your session has expired or you\'re not authorized to access this system.',
      suggestion: 'Please try logging in again or contact your administrator if the problem persists.',
      isUserFriendly: true
    },
    '401': {
      title: 'Access Denied',
      message: 'You are not authorized to access this system. This could be because your account is not registered or you don\'t have the required permissions.',
      suggestion: 'Please contact your administrator to verify your account access.',
      isUserFriendly: true
    },
    '403': {
      title: 'Access Forbidden',
      message: 'You don\'t have permission to access this resource.',
      suggestion: 'Please contact your administrator if you believe this is an error.',
      isUserFriendly: true
    },
    '404': {
      title: 'Service Not Found',
      message: 'The requested service is currently unavailable.',
      suggestion: 'Please try again later or contact support if the problem persists.',
      isUserFriendly: true
    },
    '500': {
      title: 'Server Error',
      message: 'We\'re experiencing technical difficulties. Please try again in a few moments.',
      suggestion: 'If the problem continues, please contact support.',
      isUserFriendly: true
    },
    'Backend API not accessible': {
      title: 'Service Unavailable',
      message: 'The authentication service is currently unavailable.',
      suggestion: 'Please try again in a few minutes.',
      isUserFriendly: true
    },
    'Backend server not running': {
      title: 'Service Unavailable',
      message: 'The authentication service is temporarily unavailable.',
      suggestion: 'Please try again later or contact support.',
      isUserFriendly: true
    },
    'CORS': {
      title: 'Connection Error',
      message: 'Unable to connect to the authentication service.',
      suggestion: 'Please check your internet connection and try again.',
      isUserFriendly: true
    },
    'NetworkError': {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      suggestion: 'Try refreshing the page or check your network connection.',
      isUserFriendly: true
    },
    'ERR_CONNECTION_REFUSED': {
      title: 'Service Unavailable',
      message: 'The authentication service is currently unavailable.',
      suggestion: 'Please try again in a few minutes.',
      isUserFriendly: true
    },
    'Failed to fetch': {
      title: 'Connection Error',
      message: 'Unable to connect to the authentication service.',
      suggestion: 'Please check your internet connection and try again.',
      isUserFriendly: true
    },
    // Email/User not found errors
    'User not found': {
      title: 'Account Not Found',
      message: 'Your email address is not registered in our system.',
      suggestion: 'Please contact your administrator to register your account.',
      isUserFriendly: true
    },
    'Email not found': {
      title: 'Account Not Found',
      message: 'Your email address is not registered in our system.',
      suggestion: 'Please contact your administrator to register your account.',
      isUserFriendly: true
    },
    'Account not found': {
      title: 'Account Not Found',
      message: 'Your email address is not registered in our system.',
      suggestion: 'Please contact your administrator to register your account.',
      isUserFriendly: true
    },
    'User not authorized': {
      title: 'Access Denied',
      message: 'Your account is not authorized to access this system.',
      suggestion: 'Please contact your administrator to verify your account access.',
      isUserFriendly: true
    },
    'Not authorized': {
      title: 'Access Denied',
      message: 'You are not authorized to access this system.',
      suggestion: 'Please contact your administrator to verify your account access.',
      isUserFriendly: true
    },
    'Invalid credentials': {
      title: 'Invalid Login',
      message: 'The email or password you entered is incorrect.',
      suggestion: 'Please check your credentials and try again.',
      isUserFriendly: true
    },
    'Unauthorized': {
      title: 'Access Denied',
      message: 'You are not authorized to access this system.',
      suggestion: 'Please contact your administrator to verify your account access.',
      isUserFriendly: true
    },
    // OAuth specific
    'OAuth authorization failed': {
      title: 'Login Cancelled',
      message: 'The login process was cancelled or failed.',
      suggestion: 'Please try logging in again.',
      isUserFriendly: true
    },
    'No authorization code received': {
      title: 'Login Error',
      message: 'The login process was incomplete.',
      suggestion: 'Please try logging in again.',
      isUserFriendly: true
    },
    'Missing authorization code': {
      title: 'Login Error',
      message: 'The login process was incomplete.',
      suggestion: 'Please try logging in again.',
      isUserFriendly: true
    }
  };

  static mapError(error: string | Error): ErrorInfo {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Check for specific error patterns
    for (const [pattern, errorInfo] of Object.entries(this.errorPatterns)) {
      if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
        return errorInfo;
      }
    }

    // Check for HTTP status codes
    const statusMatch = errorMessage.match(/(\d{3})/);
    if (statusMatch) {
      const statusCode = statusMatch[1];
      const statusError = this.errorPatterns[statusCode];
      if (statusError) {
        return statusError;
      }
    }

    // Check for JSON error messages
    try {
      const jsonMatch = errorMessage.match(/\{.*\}/);
      if (jsonMatch) {
        const jsonError = JSON.parse(jsonMatch[0]);
        if (jsonError.message) {
          return this.mapError(jsonError.message);
        }
      }
    } catch (e) {
      // Ignore JSON parsing errors
    }

    // Default user-friendly error
    return {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again.',
      suggestion: 'If the problem persists, please contact support.',
      isUserFriendly: true
    };
  }

  static isTechnicalError(error: string | Error): boolean {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Check if it contains technical details that should be hidden
    const technicalPatterns = [
      'Backend API error:',
      'HTTP error! status:',
      'Failed to fetch',
      'CORS',
      'NetworkError',
      'ERR_CONNECTION_REFUSED',
      'fetch',
      'XMLHttpRequest',
      'Request failed',
      'Response status:',
      'Error response:',
      'Backend API call failed:',
      'Backend response status:',
      'Backend response headers:',
      'Request data:',
      'API URL:',
      'Token length:',
      'Token type:',
      'User data:',
      'Backend error response:',
      'Backend authentication failed:',
      'Backend connection failed'
    ];

    return technicalPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  static sanitizeError(error: string | Error): string {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Remove technical details and keep only user-relevant information
    let sanitized = errorMessage;
    
    // Remove JSON responses
    sanitized = sanitized.replace(/\{.*\}/g, '');
    
    // Remove technical prefixes
    sanitized = sanitized.replace(/Backend API error:\s*\d+\s*-\s*/g, '');
    sanitized = sanitized.replace(/HTTP error! status:\s*\d+/g, '');
    sanitized = sanitized.replace(/Response status:\s*\d+/g, '');
    sanitized = sanitized.replace(/Error response:\s*/g, '');
    
    // Remove technical details
    sanitized = sanitized.replace(/Failed to fetch.*$/g, '');
    sanitized = sanitized.replace(/NetworkError.*$/g, '');
    sanitized = sanitized.replace(/CORS.*$/g, '');
    sanitized = sanitized.replace(/ERR_CONNECTION_REFUSED.*$/g, '');
    
    // Clean up extra whitespace and punctuation
    sanitized = sanitized.trim().replace(/\s+/g, ' ');
    sanitized = sanitized.replace(/^[,\s-]+/, '').replace(/[,\s-]+$/, '');
    
    return sanitized || 'An error occurred';
  }
} 