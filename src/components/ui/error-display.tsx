import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { ErrorMessageMapper, ErrorInfo } from '@/utils/errorMessages';

interface ErrorDisplayProps {
  error: string | Error | null;
  showTechnicalDetails?: boolean;
  className?: string;
}

export function ErrorDisplay({ 
  error, 
  showTechnicalDetails = false,
  className = ""
}: ErrorDisplayProps) {
  if (!error) return null;

  const errorInfo = ErrorMessageMapper.mapError(error);
  const errorMessage = typeof error === 'string' ? error : error.message;
  const isTechnical = ErrorMessageMapper.isTechnicalError(error);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* User-friendly error message */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {errorInfo.message}
        </AlertDescription>
      </Alert>

      {/* Suggestion if available */}
      {errorInfo.suggestion && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {errorInfo.suggestion}
          </AlertDescription>
        </Alert>
      )}

      {/* Technical details (optional) */}
      {showTechnicalDetails && isTechnical && (
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            Show technical details
          </summary>
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs font-mono">
              {ErrorMessageMapper.sanitizeError(errorMessage)}
            </AlertDescription>
          </Alert>
        </details>
      )}
    </div>
  );
}

export function SimpleErrorDisplay({ 
  error, 
  className = ""
}: ErrorDisplayProps) {
  if (!error) return null;

  const errorInfo = ErrorMessageMapper.mapError(error);

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {errorInfo.message}
      </AlertDescription>
    </Alert>
  );
} 