import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { ZohoAuthService } from '@/utils/zohoAuth';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleOAuthCallback(code);
    }
  }, [searchParams]);

  const handleOAuthCallback = async (code: string) => {
    setIsLoading(true);
    try {
      // Exchange code for token
      const tokenResponse = await ZohoAuthService.exchangeCodeForToken(code);
      
      // Send token to API
      await ZohoAuthService.sendTokenToAPI(tokenResponse.access_token);
      
      // Store admin session
      localStorage.setItem('adminAuth', JSON.stringify({
        token: tokenResponse.access_token,
        type: 'admin',
        timestamp: Date.now()
      }));
      
      toast({
        title: 'Login Successful',
        description: 'Welcome to the admin dashboard.',
      });
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      console.error('OAuth error:', error);
      toast({
        title: 'Login Failed',
        description: 'Unable to complete authentication. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    const authURL = ZohoAuthService.generateAuthURL();
    window.location.href = authURL;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Access the admin dashboard with Zoho OAuth</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleLogin} 
            className="w-full" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Login with Zoho
              </>
            )}
          </Button>
          
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={() => navigate('/')}>
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}