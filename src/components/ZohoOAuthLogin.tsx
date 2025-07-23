import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, User, AlertCircle } from 'lucide-react';
import { ZohoAuthService } from '@/utils/zohoAuth';
import { useToast } from '@/components/ui/use-toast';

interface ZohoOAuthLoginProps {
  onSuccess?: (userInfo: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function ZohoOAuthLogin({ onSuccess, onError, className = '' }: ZohoOAuthLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleZohoLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Initiating Zoho OAuth login...');

      // Validate configuration
      ZohoAuthService.validateConfiguration();

      // Generate authorization URL
      const authUrl = ZohoAuthService.generateAuthURL();
      console.log('🔗 Generated auth URL:', authUrl);

      // Redirect to Zoho OAuth
      window.location.href = authUrl;

    } catch (error) {
      console.error('❌ Zoho OAuth login error:', error);
      
      let errorMessage = 'Failed to initiate Zoho OAuth login';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      
      toast({
        title: "OAuth Error",
        description: errorMessage,
        variant: "destructive"
      });

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-xl">Admin Login</CardTitle>
        <CardDescription>
          Sign in with your Zoho account to access the admin dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Secure authentication via Zoho OAuth</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Your data is protected and encrypted</span>
          </div>
        </div>

        <Button 
          onClick={handleZohoLogin}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting to Zoho...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Sign in with Zoho
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 