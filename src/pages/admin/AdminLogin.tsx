import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ZohoAuthService } from '@/utils/zohoAuth';
import { getZohoOAuthConfig } from '@/config/zoho-oauth';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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