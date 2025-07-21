import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  RefreshCw,
  FileText,
  ExternalLink
} from 'lucide-react';
import { ValidationResult, ValidationError, ValidationWarning } from '@/services/financialValidationService';

interface ErrorDisplayProps {
  validation: ValidationResult;
  className?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

interface FieldErrorProps {
  fieldName: string;
  validation: ValidationResult;
  className?: string;
}

interface ErrorSummaryProps {
  validationResults: ValidationResult[];
  className?: string;
  title?: string;
}

interface MobileErrorToastProps {
  error: ValidationError;
  onDismiss: () => void;
  autoHide?: boolean;
  duration?: number;
}

// Main error display component
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  validation,
  className = '',
  onRetry,
  onDismiss,
  showDetails = true
}) => {
  if (validation.isValid && validation.warnings.length === 0) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Validation Passed</AlertTitle>
        <AlertDescription className="text-green-700">
          All data is valid and ready to be saved.
        </AlertDescription>
      </Alert>
    );
  }

  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Error Section */}
      {hasErrors && (
        <Alert variant="destructive" className="relative">
          <AlertCircle className="h-4 w-4" />
          <div className="flex-1">
            <AlertTitle className="flex items-center justify-between">
              <span>Validation Errors ({validation.errors.length})</span>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-auto p-1 hover:bg-red-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </AlertTitle>
            <AlertDescription className="mt-2">
              Please fix the following issues before proceeding:
            </AlertDescription>
            
            {showDetails && (
              <div className="mt-3 space-y-2">
                <ScrollArea className="max-h-32 w-full">
                  {validation.errors.map((error, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-sm py-1 px-2 bg-red-50 rounded border-l-2 border-red-300"
                    >
                      <Badge variant="destructive" className="text-xs">
                        {error.field}
                      </Badge>
                      <span className="flex-1 text-red-800">{error.message}</span>
                    </div>
                  ))}
                </ScrollArea>
                
                {onRetry && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetry}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retry Validation
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Alert>
      )}

      {/* Warning Section */}
      {hasWarnings && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">
            Warnings ({validation.warnings.length})
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            Please review the following recommendations:
          </AlertDescription>
          
          {showDetails && (
            <div className="mt-3 space-y-2">
              <ScrollArea className="max-h-24 w-full">
                {validation.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm py-1 px-2 bg-yellow-50 rounded border-l-2 border-yellow-300"
                  >
                    <Badge variant="secondary" className="text-xs">
                      {warning.field}
                    </Badge>
                    <span className="flex-1 text-yellow-800">{warning.message}</span>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </Alert>
      )}
    </div>
  );
};

// Field-specific error display
export const FieldError: React.FC<FieldErrorProps> = ({
  fieldName,
  validation,
  className = ''
}) => {
  const fieldErrors = validation.errors.filter(error => error.field === fieldName);
  const fieldWarnings = validation.warnings.filter(warning => warning.field === fieldName);

  if (fieldErrors.length === 0 && fieldWarnings.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {fieldErrors.map((error, index) => (
        <div
          key={`error-${index}`}
          className="flex items-center gap-1 text-sm text-red-600"
        >
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error.message}</span>
        </div>
      ))}
      
      {fieldWarnings.map((warning, index) => (
        <div
          key={`warning-${index}`}
          className="flex items-center gap-1 text-sm text-yellow-600"
        >
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>{warning.message}</span>
        </div>
      ))}
    </div>
  );
};

// Error summary for multiple validation results
export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  validationResults,
  className = '',
  title = 'Validation Summary'
}) => {
  const totalErrors = validationResults.reduce((sum, result) => sum + result.errors.length, 0);
  const totalWarnings = validationResults.reduce((sum, result) => sum + result.warnings.length, 0);
  const validCount = validationResults.filter(result => result.isValid).length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-semibold text-green-700">{validCount}</div>
            <div className="text-xs text-green-600">Valid</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg font-semibold text-red-700">{totalErrors}</div>
            <div className="text-xs text-red-600">Errors</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-lg font-semibold text-yellow-700">{totalWarnings}</div>
            <div className="text-xs text-yellow-600">Warnings</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-semibold text-blue-700">{validationResults.length}</div>
            <div className="text-xs text-blue-600">Total</div>
          </div>
        </div>

        {/* Detailed Results */}
        {(totalErrors > 0 || totalWarnings > 0) && (
          <>
            <Separator />
            <ScrollArea className="max-h-64 w-full">
              <div className="space-y-2">
                {validationResults.map((result, index) => (
                  <div key={index} className="p-2 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Item {index + 1}</span>
                      <div className="flex gap-1">
                        {result.errors.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {result.errors.length} errors
                          </Badge>
                        )}
                        {result.warnings.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {result.warnings.length} warnings
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {result.errors.length > 0 && (
                      <div className="space-y-1">
                        {result.errors.map((error, errorIndex) => (
                          <div key={errorIndex} className="text-xs text-red-600 pl-2 border-l-2 border-red-300">
                            <span className="font-medium">{error.field}:</span> {error.message}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {result.warnings.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {result.warnings.map((warning, warningIndex) => (
                          <div key={warningIndex} className="text-xs text-yellow-600 pl-2 border-l-2 border-yellow-300">
                            <span className="font-medium">{warning.field}:</span> {warning.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Mobile-specific error toast
export const MobileErrorToast: React.FC<MobileErrorToastProps> = ({
  error,
  onDismiss,
  autoHide = true,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:max-w-md md:left-auto md:right-4">
      <Alert variant="destructive" className="shadow-lg">
        <AlertCircle className="h-4 w-4" />
        <div className="flex-1">
          <AlertTitle className="flex items-center justify-between">
            <span className="truncate">{error.field}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-auto p-1 hover:bg-red-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertTitle>
          <AlertDescription className="text-sm">
            {error.message}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

// Loading error state
export interface LoadingErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({
  message = 'Something went wrong while loading data.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Error</h3>
      <p className="text-gray-600 mb-4 max-w-md">{message}</p>
      
      {onRetry && (
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};

// Network error component
export interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  className = ''
}) => {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>Unable to connect to the server. Please check your internet connection.</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default {
  ErrorDisplay,
  FieldError,
  ErrorSummary,
  MobileErrorToast,
  LoadingError,
  NetworkError
};
