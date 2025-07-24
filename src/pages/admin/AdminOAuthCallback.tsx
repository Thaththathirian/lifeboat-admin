import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, XCircle, AlertCircle } from 'lucide-react';
import { ZohoAuthService } from '@/utils/zohoAuth';
import { useToast } from '@/components/ui/use-toast';
import { ErrorMessageMapper, ErrorInfo } from '@/utils/errorMessages';
import { ErrorDisplay } from '@/components/ui/error-display';

interface OAuthState {
  status: 'loading' | 'error';
  message: string;
  error?: string;
  errorInfo?: ErrorInfo;
}

export default function AdminOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<OAuthState>({
    status: 'loading',
    message: 'Processing OAuth callback...'
  });
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check if this callback has already been processed
      const callbackId = searchParams.get('code');
      const processedKey = `oauth_processed_${callbackId}`;
      
      if (sessionStorage.getItem(processedKey)) {
        console.log('🔍 OAuth callback already processed, skipping...');
        return;
      }
      
      // Prevent multiple calls
      if (isProcessingRef.current) {
        console.log('🔍 OAuth callback already in progress, skipping...');
        return;
      }
      
      // Check if we have a code parameter
      if (!callbackId) {
        console.log('🔍 No authorization code found in URL, skipping...');
        return;
      }
      
      console.log('🔍 Starting OAuth callback processing for code:', callbackId);
      
      isProcessingRef.current = true;
      sessionStorage.setItem(processedKey, 'true');
      
      try {
        console.log('🔍 OAuth callback initiated');
        
        // Get the authorization code from URL parameters
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const accountsServer = searchParams.get('accounts-server');
        const location = searchParams.get('location');
        
        // Extract domain suffix from location parameter
        let domainSuffix = '';
        if (location) {
          // location parameter contains the domain suffix directly (e.g., "in", "com")
          // Add dot prefix for location field
          domainSuffix = '.' + location;
        } else if (accountsServer) {
          // Extract domain from accounts-server - only 7 possible Zoho data centers
          if (accountsServer.includes('zoho.eu')) {
            domainSuffix = '.eu';
          } else if (accountsServer.includes('zoho.com.au')) {
            domainSuffix = '.com.au';
          } else if (accountsServer.includes('zoho.jp')) {
            domainSuffix = '.jp';
          } else if (accountsServer.includes('zoho.uk')) {
            domainSuffix = '.uk';
          } else if (accountsServer.includes('zohocloud.ca')) {
            domainSuffix = '.ca';
          } else if (accountsServer.includes('zoho.sa')) {
            domainSuffix = '.sa';
          } else if (accountsServer.includes('zoho.com')) {
            domainSuffix = '.com';
          } else {
            // Default to com if no match found
            domainSuffix = '.com';
          }
        }
        
        console.log('🔍 Extracted domain suffix:', domainSuffix);

        console.log('🔍 URL Parameters:', {
          code: code ? 'present' : 'missing',
          error: error || 'none',
          accountsServer: accountsServer || 'none',
          location: location || 'none'
        });

        // Check for OAuth errors
        if (error) {
          console.error('❌ OAuth error received:', error);
          const errorInfo = ErrorMessageMapper.mapError(error);
          setState({
            status: 'error',
            message: errorInfo.title,
            error: error,
            errorInfo: errorInfo
          });
          return;
        }

        // Check if authorization code is present
        if (!code) {
          console.error('❌ No authorization code received');
          const errorInfo = ErrorMessageMapper.mapError('Missing authorization code');
          setState({
            status: 'error',
            message: errorInfo.title,
            error: 'Missing authorization code',
            errorInfo: errorInfo
          });
          return;
        }

        console.log('✅ Authorization code received, sending to backend...');
        setState({
          status: 'loading',
          message: 'Sending authorization code to backend...'
        });

        // Send code to backend API (this handles the complete OAuth flow)
        const tokenResponse = await ZohoAuthService.sendCodeToBackend(code, domainSuffix);
        console.log('✅ Backend authentication successful:', tokenResponse);

        setState({
          status: 'loading',
          message: 'Processing user information...'
        });

        // Get user information from the backend response
        let userInfo = tokenResponse.user_info;
        if (!userInfo) {
          // Create default user info if not provided by backend
          console.log('⚠️ No user info provided by backend, creating default user info');
          userInfo = {
            id: 'admin',
            name: 'Admin User',
            email: 'admin@lifeboat.com',
            role: 'admin'
          };
        }
        
        console.log('✅ User info received:', userInfo);

        // Store authentication data
        const authData = {
          type: 'admin',
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_in: tokenResponse.expires_in,
          user_info: userInfo,
          timestamp: Date.now()
        };

        localStorage.setItem('adminAuth', JSON.stringify(authData));
        console.log('✅ Authentication data stored');

        toast({
          title: "Authentication Successful",
          description: `Welcome back, ${userInfo.name}!`,
        });

        // Redirect to admin dashboard immediately
        navigate('/admin/dashboard', { replace: true });

      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        
        // Clear the processed flag on error so user can retry
        sessionStorage.removeItem(processedKey);
        
        const errorInfo = ErrorMessageMapper.mapError(error);
        
        setState({
          status: 'error',
          message: errorInfo.title,
          error: error instanceof Error ? error.message : String(error),
          errorInfo: errorInfo
        });

        toast({
          title: errorInfo.title,
          description: errorInfo.message,
          variant: "destructive"
        });
      } finally {
        isProcessingRef.current = false;
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, toast]);

  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return <AlertCircle className="h-8 w-8 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl">
            {state.status === 'loading' && 'Processing Authentication'}
            {state.status === 'error' && (state.errorInfo?.title || 'Authentication Failed')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            {state.status === 'error' && state.errorInfo 
              ? state.errorInfo.message 
              : state.message
            }
          </p>

          {state.status === 'error' && state.error && (
            <ErrorDisplay 
              error={state.error} 
              showTechnicalDetails={true}
            />
          )}

          {state.status === 'error' && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Go to Home
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          )}

          {state.status === 'loading' && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Please wait while we complete your authentication...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 