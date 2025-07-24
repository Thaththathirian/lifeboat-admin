import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorDisplay, SimpleErrorDisplay } from '@/components/ui/error-display';
import { ErrorMessageMapper } from '@/utils/errorMessages';

export default function ErrorTestPage() {
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string>('');

  const testErrors = [
    {
      name: 'Token Exchange Failed',
      error: 'Token exchange failed',
      description: 'Simulates the OAuth token exchange failure'
    },
    {
      name: '401 Unauthorized',
      error: 'Backend API error: 401 - {"status":false,"message":"Token exchange failed","data":[]}',
      description: 'Simulates the exact error from your screenshot'
    },
    {
      name: 'User Not Found',
      error: 'User not found',
      description: 'Simulates when email is not in database'
    },
    {
      name: 'Not Authorized',
      error: 'Not authorized',
      description: 'Simulates unauthorized access'
    },
    {
      name: 'Connection Error',
      error: 'Failed to fetch',
      description: 'Simulates network connection issues'
    },
    {
      name: 'Server Error',
      error: 'Backend API error: 500 - Internal server error',
      description: 'Simulates server-side errors'
    },
    {
      name: 'CORS Error',
      error: 'Backend API not accessible due to CORS restrictions',
      description: 'Simulates CORS issues'
    }
  ];

  const testError = (error: string, type: string) => {
    setCurrentError(error);
    setErrorType(type);
  };

  const clearError = () => {
    setCurrentError(null);
    setErrorType('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Handling Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This page demonstrates the user-friendly error handling system. 
              Click on any error type to see how technical errors are converted to user-friendly messages.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testErrors.map((testError, index) => (
                <Card key={index} className="p-4">
                  <h3 className="font-semibold mb-2">{testError.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{testError.description}</p>
                  <Button 
                    onClick={() => testError(testError.error, testError.name)}
                    variant="outline"
                    size="sm"
                  >
                    Test Error
                  </Button>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={clearError} variant="outline">
                Clear Error
              </Button>
              <Button onClick={() => testError('Custom error message', 'Custom')}>
                Test Custom Error
              </Button>
            </div>
          </CardContent>
        </Card>

        {currentError && (
          <Card>
            <CardHeader>
              <CardTitle>Error Display Test - {errorType}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Full Error Display (with technical details)</h3>
                <ErrorDisplay 
                  error={currentError} 
                  showTechnicalDetails={true}
                />
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Simple Error Display</h3>
                <SimpleErrorDisplay error={currentError} />
              </div>

              <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-semibold mb-2">Error Analysis</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Original Error:</strong> {currentError}</p>
                  <p><strong>Is Technical Error:</strong> {ErrorMessageMapper.isTechnicalError(currentError) ? 'Yes' : 'No'}</p>
                  <p><strong>Sanitized Error:</strong> {ErrorMessageMapper.sanitizeError(currentError)}</p>
                  <p><strong>Mapped Title:</strong> {ErrorMessageMapper.mapError(currentError).title}</p>
                  <p><strong>Mapped Message:</strong> {ErrorMessageMapper.mapError(currentError).message}</p>
                  {ErrorMessageMapper.mapError(currentError).suggestion && (
                    <p><strong>Suggestion:</strong> {ErrorMessageMapper.mapError(currentError).suggestion}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 