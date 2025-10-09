import { clsx } from 'clsx';
import { format, parseISO, isValid } from 'date-fns';

// Class name utility
export const cn = (...classes) => clsx(classes);

// Format currency
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format date
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';

  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate) ? format(parsedDate, formatStr) : '';
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return '';

  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return '';

    const now = new Date();
    const diffInSeconds = Math.floor((now - parsedDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return formatDate(parsedDate);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '';
  }
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
};

// Generate slug
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

// Get file size in human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Get nested object property safely
export const getNestedValue = (obj, path, defaultValue = null) => {
  try {
    return (
      path.split('.').reduce((current, key) => current?.[key], obj) ??
      defaultValue
    );
  } catch (error) {
    return defaultValue;
  }
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Capitalize all words
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Check if object is empty
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Convert bytes to base64
export const bytesToBase64 = (bytes) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Convert base64 to blob
export const base64ToBlob = (base64, mimeType = 'image/png') => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

// Sleep function
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry function with exponential backoff
export const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(delay * Math.pow(2, i));
    }
  }
};

// Check if device is mobile
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Check if device is tablet
export const isTablet = () => {
  return /iPad|Android(?=.*Mobile)/i.test(navigator.userAgent);
};

// Get browser info
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const browsers = {
    chrome: /Chrome/i.test(userAgent),
    firefox: /Firefox/i.test(userAgent),
    safari: /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent),
    edge: /Edg/i.test(userAgent),
    opera: /Opera/i.test(userAgent),
  };

  return Object.keys(browsers).find((key) => browsers[key]) || 'unknown';
};

// Format number with commas
export const formatNumber = (num) => {
  if (num == null) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Parse query string
export const parseQueryString = (queryString) => {
  const params = {};
  const urlSearchParams = new URLSearchParams(queryString);
  for (const [key, value] of urlSearchParams) {
    params[key] = value;
  }
  return params;
};

// Build query string
export const buildQueryString = (params) => {
  const urlSearchParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (
      params[key] !== null &&
      params[key] !== undefined &&
      params[key] !== ''
    ) {
      urlSearchParams.append(key, params[key]);
    }
  });
  return urlSearchParams.toString();
};

// Check if URL is valid
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// Check if file is image
export const isImageFile = (file) => {
  const imageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return imageTypes.includes(file.type);
};

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to copy text: ', error);
    return false;
  }
};
