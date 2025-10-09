/**
 * Comprehensive error handling utilities for the application
 */

// Error types mapping
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown',
};

// Error messages mapping
export const ERROR_MESSAGES = {
  [ERROR_TYPES.VALIDATION]: {
    title: 'Validation Error',
    message: 'Please check your input and try again.',
  },
  [ERROR_TYPES.UNAUTHORIZED]: {
    title: 'Authentication Required',
    message: 'Please log in to continue.',
  },
  [ERROR_TYPES.FORBIDDEN]: {
    title: 'Access Denied',
    message: 'You do not have permission to perform this action.',
  },
  [ERROR_TYPES.NOT_FOUND]: {
    title: 'Not Found',
    message: 'The requested resource was not found.',
  },
  [ERROR_TYPES.SERVER]: {
    title: 'Server Error',
    message: 'Server error. Please try again later.',
  },
  [ERROR_TYPES.NETWORK]: {
    title: 'Connection Error',
    message: 'Network error. Please check your connection.',
  },
  [ERROR_TYPES.TIMEOUT]: {
    title: 'Request Timeout',
    message: 'Request timed out. Please try again.',
  },
  [ERROR_TYPES.UNKNOWN]: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
};

// OTP specific error messages
export const OTP_ERROR_MESSAGES = {
  EXPIRED: {
    title: 'Code Expired',
    message: 'Verification code has expired. Please request a new one.',
  },
  INVALID: {
    title: 'Invalid Code',
    message: 'Invalid verification code. Please check and try again.',
  },
  NOT_FOUND: {
    title: 'No Code Found',
    message: 'No verification code found. Please request a new one.',
  },
  ALREADY_VERIFIED: {
    title: 'Already Verified',
    message: 'Your email is already verified. You can proceed to login.',
  },
  TOO_MANY_ATTEMPTS: {
    title: 'Too Many Attempts',
    message: 'Too many failed attempts. Please wait before trying again.',
  },
};

// Registration specific error messages
export const REGISTRATION_ERROR_MESSAGES = {
  EMAIL_EXISTS: {
    title: 'Email Already Exists',
    message: 'An account with this email already exists. Please use a different email or try logging in.',
  },
  PHONE_EXISTS: {
    title: 'Phone Already Exists',
    message: 'An account with this phone number already exists. Please use a different phone number.',
  },
  WEAK_PASSWORD: {
    title: 'Weak Password',
    message: 'Password is too weak. Please choose a stronger password.',
  },
  INVALID_EMAIL: {
    title: 'Invalid Email',
    message: 'Please enter a valid email address.',
  },
  DISPOSABLE_EMAIL: {
    title: 'Invalid Email',
    message: 'Please use a permanent email address.',
  },
};

/**
 * Parse error and return user-friendly message
 * @param {Error} error - The error object
 * @param {string} context - The context where error occurred (e.g., 'otp', 'registration')
 * @returns {Object} - Formatted error with title and message
 */
export const parseError = (error, context = null) => {
  if (!error) {
    return ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];
  }

  // Handle specific context errors
  if (context === 'otp') {
    return parseOTPError(error);
  }

  if (context === 'registration') {
    return parseRegistrationError(error);
  }

  // Handle API error types
  if (error.type && ERROR_MESSAGES[error.type]) {
    return {
      ...ERROR_MESSAGES[error.type],
      message: error.message || ERROR_MESSAGES[error.type].message,
    };
  }

  // Handle specific error messages
  const errorMessage = error.message?.toLowerCase() || '';

  if (errorMessage.includes('expired')) {
    return OTP_ERROR_MESSAGES.EXPIRED;
  }

  if (errorMessage.includes('invalid') || errorMessage.includes('incorrect')) {
    return {
      title: 'Invalid Input',
      message: error.message || 'Please check your input and try again.',
    };
  }

  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return ERROR_MESSAGES[ERROR_TYPES.NETWORK];
  }

  if (errorMessage.includes('timeout')) {
    return ERROR_MESSAGES[ERROR_TYPES.TIMEOUT];
  }

  if (errorMessage.includes('server') || errorMessage.includes('internal')) {
    return ERROR_MESSAGES[ERROR_TYPES.SERVER];
  }

  if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
    return ERROR_MESSAGES[ERROR_TYPES.UNAUTHORIZED];
  }

  if (errorMessage.includes('forbidden') || errorMessage.includes('permission')) {
    return ERROR_MESSAGES[ERROR_TYPES.FORBIDDEN];
  }

  if (errorMessage.includes('not found')) {
    return ERROR_MESSAGES[ERROR_TYPES.NOT_FOUND];
  }

  // Default to unknown error
  return {
    ...ERROR_MESSAGES[ERROR_TYPES.UNKNOWN],
    message: error.message || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN].message,
  };
};

/**
 * Parse OTP specific errors
 * @param {Error} error - The error object
 * @returns {Object} - Formatted error with title and message
 */
export const parseOTPError = (error) => {
  const errorMessage = error.message?.toLowerCase() || '';

  if (errorMessage.includes('expired')) {
    return OTP_ERROR_MESSAGES.EXPIRED;
  }

  if (errorMessage.includes('invalid')) {
    return OTP_ERROR_MESSAGES.INVALID;
  }

  if (errorMessage.includes('not found') || errorMessage.includes('no otp')) {
    return OTP_ERROR_MESSAGES.NOT_FOUND;
  }

  if (errorMessage.includes('already verified')) {
    return OTP_ERROR_MESSAGES.ALREADY_VERIFIED;
  }

  if (errorMessage.includes('too many attempts')) {
    return OTP_ERROR_MESSAGES.TOO_MANY_ATTEMPTS;
  }

  return parseError(error);
};

/**
 * Parse registration specific errors
 * @param {Error} error - The error object
 * @returns {Object} - Formatted error with title and message
 */
export const parseRegistrationError = (error) => {
  const errorMessage = error.message?.toLowerCase() || '';

  if (errorMessage.includes('email already exists') || errorMessage.includes('email exists')) {
    return REGISTRATION_ERROR_MESSAGES.EMAIL_EXISTS;
  }

  if (errorMessage.includes('phone already exists') || errorMessage.includes('phone exists')) {
    return REGISTRATION_ERROR_MESSAGES.PHONE_EXISTS;
  }

  if (errorMessage.includes('weak password') || errorMessage.includes('password too weak')) {
    return REGISTRATION_ERROR_MESSAGES.WEAK_PASSWORD;
  }

  if (errorMessage.includes('invalid email') || errorMessage.includes('email format')) {
    return REGISTRATION_ERROR_MESSAGES.INVALID_EMAIL;
  }

  if (errorMessage.includes('disposable') || errorMessage.includes('temporary email')) {
    return REGISTRATION_ERROR_MESSAGES.DISPOSABLE_EMAIL;
  }

  return parseError(error);
};

/**
 * Log error for debugging (in development)
 * @param {Error} error - The error object
 * @param {string} context - The context where error occurred
 */
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, error);
  }
};

/**
 * Check if error is retryable
 * @param {Error} error - The error object
 * @returns {boolean} - Whether the error is retryable
 */
export const isRetryableError = (error) => {
  const errorMessage = error.message?.toLowerCase() || '';
  const errorType = error.type;

  // Network and timeout errors are retryable
  if (errorType === ERROR_TYPES.NETWORK || errorType === ERROR_TYPES.TIMEOUT) {
    return true;
  }

  // Server errors (5xx) are retryable
  if (errorType === ERROR_TYPES.SERVER) {
    return true;
  }

  // Specific retryable error messages
  const retryableMessages = [
    'network',
    'connection',
    'timeout',
    'server error',
    'internal server error',
    'service unavailable',
  ];

  return retryableMessages.some(msg => errorMessage.includes(msg));
};

/**
 * Get retry delay based on attempt number
 * @param {number} attempt - The attempt number (1-based)
 * @returns {number} - Delay in milliseconds
 */
export const getRetryDelay = (attempt) => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
  const baseDelay = 1000;
  const maxDelay = 30000;
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 1000;
  return delay + jitter;
};
