import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { ZohoAuthService } from '@/utils/zohoAuth';
import { getZohoOAuthConfig } from '@/config/zoho-oauth';
import { useToast } from '@/components/ui/use-toast';

interface ConfigStatus {
  name: string;
  value: string;
  status: 'valid' | 'invalid' | 'missing';
  required: boolean;
}

export default function AdminOAuthTest() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus[]>([]);
  const [authUrl, setAuthUrl] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateConfiguration = () => {
    setIsValidating(true);
    const config = getZohoOAuthConfig();
    const status: ConfigStatus[] = [];

    // Check required environment variables
    const requiredVars = [
      { name: 'VITE_ZOHO_CLIENT_ID', value: config.CLIENT_ID, required: true },
      { name: 'VITE_ZOHO_CLIENT_SECRET', value: config.CLIENT_SECRET, required: true },
      { name: 'VITE_HOMEPAGE_URL', value: config.HOMEPAGE_URL, required: true },
      { name: 'VITE_REDIRECT_URL', value: config.REDIRECT_URL, required: true },
      { name: 'VITE_BACKEND_ADMIN_ENDPOINT', value: config.BACKEND_ADMIN_ENDPOINT, required: true },
    ];

    requiredVars.forEach(({ name, value, required }) => {
      status.push({
        name,
        value: value || 'Not set',
        status: value ? 'valid' : 'missing',
        required
      });
    });

    // Check optional variables
    const optionalVars = [
      { name: 'VITE_ZOHO_AUTHORIZATION_URL', value: config.AUTHORIZATION_URL },
      { name: 'VITE_ZOHO_TOKEN_URL', value: config.TOKEN_URL },
      { name: 'VITE_ZOHO_USER_INFO_URL', value: config.USER_INFO_URL },
      { name: 'VITE_ZOHO_OAUTH_SCOPE', value: config.OAUTH_SCOPE },
    ];

    optionalVars.forEach(({ name, value }) => {
      status.push({
        name,
        value: value || 'Using default',
        status: value ? 'valid' : 'invalid',
        required: false
      });
    });

    setConfigStatus(status);

    // Generate auth URL
    try {
      ZohoAuthService.validateConfiguration();
      const url = ZohoAuthService.generateAuthURL();
      setAuthUrl(url);
      toast({
        title: "Configuration Valid",
        description: "All required settings are properly configured.",
      });
    } catch (error) {
      setAuthUrl('');
      toast({
        title: "Configuration Error",
        description: error instanceof Error ? error.message : "Configuration validation failed",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'missing':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'border-green-200 bg-green-50';
      case 'invalid':
        return 'border-red-200 bg-red-50';
      case 'missing':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="main-content-container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">OAuth Configuration Test</h2>
        <Button onClick={validateConfiguration} disabled={isValidating}>
          {isValidating ? 'Validating...' : 'Validate Configuration'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
            <CardDescription>
              Check if all required environment variables are properly set
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {configStatus.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(item.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      <span className="font-medium">{item.name}</span>
                      {item.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 max-w-xs truncate">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* OAuth URL Test */}
        <Card>
          <CardHeader>
            <CardTitle>OAuth Authorization URL</CardTitle>
            <CardDescription>
              Test the generated OAuth authorization URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authUrl ? (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Configuration is valid. You can test the OAuth flow by clicking the button below.
                  </AlertDescription>
                </Alert>
                
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">Generated Auth URL:</p>
                  <p className="text-xs break-all">{authUrl}</p>
                </div>

                <Button 
                  onClick={() => window.open(authUrl, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test OAuth Flow
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Click "Validate Configuration" to generate the OAuth URL
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Environment Variables</h4>
              <p className="text-sm text-gray-600 mb-2">
                Make sure all required environment variables are set in your <code>.env</code> file:
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                VITE_ZOHO_CLIENT_ID=your_client_id<br/>
                VITE_ZOHO_CLIENT_SECRET=your_client_secret<br/>
                VITE_HOMEPAGE_URL=http://localhost:8082<br/>
                VITE_REDIRECT_URL=http://localhost:8082/oauth/callback<br/>
                VITE_BACKEND_ADMIN_ENDPOINT=your_backend_url
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Zoho Developer Console</h4>
              <p className="text-sm text-gray-600 mb-2">
                In your Zoho Developer Console, make sure the redirect URI is set to:
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                http://localhost:8082/oauth/callback
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Testing</h4>
              <p className="text-sm text-gray-600">
                Click "Validate Configuration" to check your setup, then "Test OAuth Flow" to initiate the OAuth process.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 