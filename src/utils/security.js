/**
 * Security utilities for the application
 */

// Rate limiting configuration
export const RATE_LIMITS = {
  OTP_VERIFICATION: {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },
  OTP_RESEND: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 10 * 60 * 1000, // 10 minutes
  },
  REGISTRATION: {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 10 * 60 * 1000, // 10 minutes
  },
};

// In-memory storage for rate limiting (in production, use Redis or database)
const rateLimitStore = new Map();

/**
 * Rate limiter class
 */
export class RateLimiter {
  constructor(config) {
    this.config = config;
  }

  /**
   * Check if action is allowed
   * @param {string} key - Unique identifier (e.g., userId, IP address)
   * @returns {Object} - { allowed: boolean, remainingAttempts: number, resetTime: number }
   */
  check(key) {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    if (!entry) {
      entry = {
        attempts: [],
        blocked: false,
        blockUntil: 0,
      };
      rateLimitStore.set(key, entry);
    }

    // Check if currently blocked
    if (entry.blocked && now < entry.blockUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: entry.blockUntil,
        blocked: true,
      };
    }

    // Reset block if expired
    if (entry.blocked && now >= entry.blockUntil) {
      entry.blocked = false;
      entry.blockUntil = 0;
    }

    // Clean old attempts outside the window
    entry.attempts = entry.attempts.filter(time => time > windowStart);

    const remainingAttempts = Math.max(0, this.config.maxAttempts - entry.attempts.length);

    return {
      allowed: remainingAttempts > 0,
      remainingAttempts,
      resetTime: entry.attempts.length > 0 ? entry.attempts[0] + this.config.windowMs : now + this.config.windowMs,
      blocked: false,
    };
  }

  /**
   * Record an attempt
   * @param {string} key - Unique identifier
   * @returns {Object} - Rate limit status after recording attempt
   */
  recordAttempt(key) {
    const now = Date.now();
    let entry = rateLimitStore.get(key);
    
    if (!entry) {
      entry = {
        attempts: [],
        blocked: false,
        blockUntil: 0,
      };
      rateLimitStore.set(key, entry);
    }

    // Add current attempt
    entry.attempts.push(now);

    // Check if should be blocked
    const recentAttempts = entry.attempts.filter(time => time > now - this.config.windowMs);
    if (recentAttempts.length >= this.config.maxAttempts) {
      entry.blocked = true;
      entry.blockUntil = now + this.config.blockDurationMs;
    }

    rateLimitStore.set(key, entry);

    return this.check(key);
  }

  /**
   * Reset rate limit for a key
   * @param {string} key - Unique identifier
   */
  reset(key) {
    rateLimitStore.delete(key);
  }

  /**
   * Get current status without recording attempt
   * @param {string} key - Unique identifier
   * @returns {Object} - Current rate limit status
   */
  getStatus(key) {
    return this.check(key);
  }
}

// Create rate limiter instances
export const otpVerificationLimiter = new RateLimiter(RATE_LIMITS.OTP_VERIFICATION);
export const otpResendLimiter = new RateLimiter(RATE_LIMITS.OTP_RESEND);
export const registrationLimiter = new RateLimiter(RATE_LIMITS.REGISTRATION);
export const loginLimiter = new RateLimiter(RATE_LIMITS.LOGIN);

/**
 * Sanitize user input
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate email format and check against disposable email domains
 * @param {string} email - Email address to validate
 * @returns {Object} - { isValid: boolean, isDisposable: boolean, message?: string }
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      isDisposable: false,
      message: 'Please enter a valid email address',
    };
  }

  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'temp-mail.org',
    'throwaway.email',
    'getnada.com',
    'maildrop.cc',
    'sharklasers.com',
  ];

  const domain = email.split('@')[1].toLowerCase();
  const isDisposable = disposableDomains.includes(domain);

  return {
    isValid: true,
    isDisposable,
    message: isDisposable ? 'Please use a permanent email address' : null,
  };
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {Object} - { isValid: boolean, message?: string }
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
  
  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      message: 'Please enter a valid phone number',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Check password strength
 * @param {string} password - Password to check
 * @returns {Object} - { strength: number, score: string, requirements: Object }
 */
export const checkPasswordStrength = (password) => {
  if (!password) {
    return {
      strength: 0,
      score: 'Very Weak',
      requirements: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      },
    };
  }

  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strength = Object.values(requirements).filter(Boolean).length;
  
  let score;
  if (strength <= 1) score = 'Very Weak';
  else if (strength <= 2) score = 'Weak';
  else if (strength <= 3) score = 'Fair';
  else if (strength <= 4) score = 'Good';
  else score = 'Strong';

  return {
    strength,
    score,
    requirements,
  };
};

/**
 * Generate a secure random string
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
export const generateSecureRandom = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Check if user agent is suspicious
 * @param {string} userAgent - User agent string
 * @returns {boolean} - Whether the user agent is suspicious
 */
export const isSuspiciousUserAgent = (userAgent) => {
  if (!userAgent) return true;

  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /php/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
};

/**
 * Validate OTP format
 * @param {string} otp - OTP to validate
 * @returns {boolean} - Whether OTP format is valid
 */
export const validateOTPFormat = (otp) => {
  return /^\d{6}$/.test(otp);
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} - Whether ID format is valid
 */
export const validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
