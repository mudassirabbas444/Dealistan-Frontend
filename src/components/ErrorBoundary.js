import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now() + Math.random()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // In a real app, you would send this to an error reporting service
    // like Sentry, LogRocket, or Bugsnag
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.props.userId || 'anonymous'
      };

      // Example: Send to error reporting service
      // errorReportingService.captureException(error, errorData);
      
      console.log('Error logged to service:', errorData);
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-md w-full space-y-8'>
            <div className='text-center'>
              <div className='mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                <AlertTriangle className='h-8 w-8 text-red-600' />
              </div>
              <h2 className='text-3xl font-extrabold text-gray-900 mb-2'>
                Oops! Something went wrong
              </h2>
              <p className='text-gray-600 mb-6'>
                We're sorry, but something unexpected happened. Please try again or go back to the home page.
              </p>
              
              <div className='space-y-4'>
                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                  <Button
                    onClick={this.handleRetry}
                    className='flex items-center justify-center'
                  >
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Try Again
                  </Button>
                  <Button
                    variant='outline'
                    onClick={this.handleGoHome}
                    className='flex items-center justify-center'
                  >
                    <Home className='h-4 w-4 mr-2' />
                    Go Home
                  </Button>
                </div>
                
                {isDevelopment && (
                  <details className='mt-6 text-left'>
                    <summary className='cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900'>
                      Error Details (Development Only)
                    </summary>
                    <div className='mt-2 p-4 bg-gray-100 rounded-lg text-xs font-mono text-gray-800 overflow-auto max-h-64'>
                      <div className='mb-2'>
                        <strong>Error:</strong> {error && error.toString()}
                      </div>
                      {errorInfo && (
                        <div className='mb-2'>
                          <strong>Component Stack:</strong>
                          <pre className='whitespace-pre-wrap mt-1'>
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                      {error && error.stack && (
                        <div>
                          <strong>Stack Trace:</strong>
                          <pre className='whitespace-pre-wrap mt-1'>
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
