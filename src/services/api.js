import axios from 'axios';
import Cookies from 'js-cookie';
import { API_CONFIG, STORAGE_KEYS, TOAST_MESSAGES, API_ENDPOINTS } from '../constants';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      const reqUrl = error?.config?.url || '';
      const onAdminLogin = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/admin/login');
      const isAuthLogin = typeof reqUrl === 'string' && reqUrl.includes(API_ENDPOINTS.AUTH.LOGIN);
      // Do not redirect away from admin login (or login endpoint requests)
      if (!(onAdminLogin || isAuthLogin)) {
        Cookies.remove(STORAGE_KEYS.AUTH_TOKEN);
        Cookies.remove(STORAGE_KEYS.USER_DATA);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API service class
class ApiService {
  // Generic request methods
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(url, data = {}, config = {}) {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(url, data = {}, config = {}) {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch(url, data = {}, config = {}) {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // File upload
  async upload(url, formData, config = {}) {
    try {
      const response = await api.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config.headers,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    const { response } = error;

    if (response) {
      // Server responded with error status
      const { status, data } = response;

      switch (status) {
        case 400:
          return {
            type: 'validation',
            message: data.message || TOAST_MESSAGES.ERROR.VALIDATION,
            errors: data.errors || [],
            status,
          };
        case 401:
          return {
            type: 'unauthorized',
            message: data?.message || TOAST_MESSAGES.ERROR.UNAUTHORIZED,
            status,
          };
        case 403:
          return {
            type: 'forbidden',
            message: data?.message || 'You do not have permission to perform this action.',
            status,
            response: { data } // Include response data for special handling
          };
        case 404:
          return {
            type: 'not_found',
            message: TOAST_MESSAGES.ERROR.NOT_FOUND,
            status,
          };
        case 422:
          return {
            type: 'validation',
            message: data.message || TOAST_MESSAGES.ERROR.VALIDATION,
            errors: data.errors || [],
            status,
          };
        case 500:
          return {
            type: 'server',
            message: 'Internal server error. Please try again later.',
            status,
          };
        default:
          return {
            type: 'unknown',
            message: data.message || TOAST_MESSAGES.ERROR.GENERIC,
            status,
          };
      }
    } else if (error.request) {
      // Network error
      return {
        type: 'network',
        message: TOAST_MESSAGES.ERROR.NETWORK,
        status: 0,
      };
    } else {
      // Other error
      return {
        type: 'unknown',
        message: TOAST_MESSAGES.ERROR.GENERIC,
        status: 0,
      };
    }
  }
}

// Create and export API service instance
const apiService = new ApiService();
export default apiService;

// Export axios instance for direct use if needed
export { api };
