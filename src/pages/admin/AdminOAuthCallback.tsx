import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ZohoAuthService } from '@/utils/zohoAuth';
import { useToast } from '@/components/ui/use-toast';

interface OAuthState {
  status: 'loading' | 'success' | 'error';
  message: string;
  error?: string;
  userInfo?: any;
}

export default function AdminOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<OAuthState>({
    status: 'loading',
    message: 'Processing OAuth callback...'
  });

  useEffect(() => {
    const handleOAuthCallback = async () => {
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
          setState({
            status: 'error',
            message: 'OAuth authorization failed',
            error: error
          });
          return;
        }

        // Check if authorization code is present
        if (!code) {
          console.error('❌ No authorization code received');
          setState({
            status: 'error',
            message: 'No authorization code received from Zoho',
            error: 'Missing authorization code'
          });
          return;
        }

        console.log('✅ Authorization code received, exchanging for token...');
        setState({
          status: 'loading',
          message: 'Exchanging authorization code for access token...'
        });

        // Exchange code for token with domain suffix
        const tokenResponse = await ZohoAuthService.exchangeCodeForToken(code, domainSuffix);
        console.log('✅ Token received:', tokenResponse);

        setState({
          status: 'loading',
          message: 'Getting user information...'
        });

        // Get user information
        const userInfo = await ZohoAuthService.getUserInfo(tokenResponse.access_token);
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

        // Send token to backend API
        setState({
          status: 'loading',
          message: 'Sending token to backend API...'
        });

        await ZohoAuthService.sendTokenToAPI(tokenResponse.access_token);
        console.log('✅ Token sent to backend API');

        setState({
          status: 'success',
          message: 'OAuth authentication successful!',
          userInfo: userInfo
        });

        toast({
          title: "Authentication Successful",
          description: `Welcome back, ${userInfo.name}!`,
        });

        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          navigate('/admin/dashboard', { replace: true });
        }, 2000);

      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        
        let errorMessage = 'An unexpected error occurred during authentication';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        setState({
          status: 'error',
          message: 'OAuth authentication failed',
          error: errorMessage
        });

        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, toast]);

  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
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
      case 'success':
        return 'border-green-200 bg-green-50';
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
            {state.status === 'success' && 'Authentication Successful'}
            {state.status === 'error' && 'Authentication Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            {state.message}
          </p>

          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {state.error}
              </AlertDescription>
            </Alert>
          )}

          {state.status === 'success' && state.userInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">User Information</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Name:</strong> {state.userInfo.name}</p>
                <p><strong>Email:</strong> {state.userInfo.email}</p>
                <p><strong>ID:</strong> {state.userInfo.id}</p>
              </div>
            </div>
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