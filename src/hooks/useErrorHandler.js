import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { parseError, logError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

/**
 * Custom hook for handling errors consistently across the application
 */
export const useErrorHandler = () => {
  const { user } = useAuth();

  const handleError = useCallback((error, context = '', options = {}) => {
    const {
      showToast = true,
      logToConsole = true,
      logToService = true,
      fallbackMessage = 'Something went wrong. Please try again.'
    } = options;

    // Parse error for user-friendly message
    const parsedError = parseError(error, context);
    
    // Log error for debugging
    if (logToConsole) {
      logError(error, context);
    }

    // Log to external service in production
    if (logToService && process.env.NODE_ENV === 'production') {
      logErrorToService(error, context, user);
    }

    // Show toast notification
    if (showToast) {
      toast.error(parsedError.message || fallbackMessage);
    }

    return parsedError;
  }, [user]);

  const handleAsyncError = useCallback(async (asyncFunction, context = '', options = {}) => {
    try {
      return await asyncFunction();
    } catch (error) {
      return handleError(error, context, options);
    }
  }, [handleError]);

  const handleFormError = useCallback((error, setFormErrors, context = '') => {
    const parsedError = parseError(error, context);
    
    // Set form-specific errors if available
    if (error.response?.data?.errors) {
      setFormErrors(error.response.data.errors);
    } else if (parsedError.message) {
      setFormErrors({ general: parsedError.message });
    }

    // Log error
    logError(error, context);
    
    return parsedError;
  }, []);

  const handleApiError = useCallback((error, context = '') => {
    const parsedError = parseError(error, context);
    
    // Handle specific API error cases
    if (error.response?.status === 401) {
      // Unauthorized - user might need to re-login
      toast.error('Your session has expired. Please log in again.');
      // Could trigger logout here if needed
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      // Not found
      toast.error('The requested resource was not found.');
    } else if (error.response?.status >= 500) {
      // Server error
      toast.error('Server error. Please try again later.');
    } else {
      // Other errors
      toast.error(parsedError.message || 'An error occurred. Please try again.');
    }

    logError(error, context);
    return parsedError;
  }, []);

  return {
    handleError,
    handleAsyncError,
    handleFormError,
    handleApiError
  };
};

/**
 * Log error to external service
 */
const logErrorToService = (error, context, user) => {
  try {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: user?.id || 'anonymous',
      userEmail: user?.email || 'anonymous'
    };

    // In a real app, you would send this to an error reporting service
    // like Sentry, LogRocket, or Bugsnag
    console.log('Error logged to service:', errorData);
    
    // Example: Send to error reporting service
    // errorReportingService.captureException(error, errorData);
  } catch (loggingError) {
    console.error('Failed to log error to service:', loggingError);
  }
};

export default useErrorHandler;
