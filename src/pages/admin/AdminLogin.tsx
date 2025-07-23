import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ZohoAuthService } from '@/utils/zohoAuth';
import { getZohoOAuthConfig } from '@/config/zoho-oauth';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  useEffect(() => {
    // Check if this is an OAuth callback
    const code = searchParams.get('code');
    const regionOrServer = searchParams.get('accounts-server') || searchParams.get('location');
    
    if (code) {
      handleOAuthCallback(code, regionOrServer);
    }
  }, [searchParams]);

  const handleOAuthCallback = async (code: string, regionOrServer?: string) => {
    setIsProcessingOAuth(true);
    console.log('🔍 Processing OAuth callback...');
    console.log('🔍 Code:', code);
    console.log('🔍 Region/Server:', regionOrServer);

    try {
      // Validate configuration
      ZohoAuthService.validateConfiguration();

      // Exchange code for token
      const tokenResponse = await ZohoAuthService.exchangeCodeForToken(code, regionOrServer);
      console.log('✅ Token exchange successful:', tokenResponse);

      // Get user info
      const userInfo = await ZohoAuthService.getUserInfo(tokenResponse.access_token);
      console.log('✅ User info retrieved:', userInfo);

      // Store authentication data
      const authData = {
        type: 'admin',
        user: userInfo,
        token: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expires_in,
        timestamp: Date.now()
      };

      localStorage.setItem('adminAuth', JSON.stringify(authData));
      console.log('✅ Authentication data stored');

      // Send token to backend API (optional)
      try {
        await ZohoAuthService.sendTokenToAPI(tokenResponse.access_token);
        console.log('✅ Token sent to backend API');
      } catch (error) {
        console.warn('⚠️ Failed to send token to backend API:', error);
        // Don't fail the login process if backend is not available
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userInfo.name}!`,
      });

      // Redirect to dashboard
      navigate('/admin/dashboard', { replace: true });

    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
      // Redirect back to login page
      navigate('/admin/login', { replace: true });
    } finally {
      setIsProcessingOAuth(false);
    }
  };

  const handleZohoLogin = () => {
    setIsLoading(true);
    console.log('🔍 Initiating Zoho OAuth login...');

    try {
      // Validate configuration
      ZohoAuthService.validateConfiguration();

      // Generate auth URL
      const authURL = ZohoAuthService.generateAuthURL();
      console.log('🔗 Redirecting to:', authURL);

      // Redirect to Zoho OAuth
      window.location.href = authURL;

    } catch (error) {
      console.error('❌ Login initiation error:', error);
      toast({
        title: "Configuration Error",
        description: error instanceof Error ? error.message : "Failed to initiate login",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (isProcessingOAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Processing login...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = getZohoOAuthConfig();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleZohoLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Login with Zoho
              </>
            )}
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            <p>This will redirect you to Zoho for authentication</p>
            <p className="mt-1">Redirect URL: {config.REDIRECT_URL}</p>
            <p className="mt-1">Environment: {import.meta.env.MODE}</p>
            <p className="mt-1">Backend API: {config.BACKEND_ADMIN_ENDPOINT}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin; 