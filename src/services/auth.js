import apiService from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';

class AuthService {
  // Register user
  async register(userData) {
    try {
      // Validate required fields
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('Name, email, and password are required');
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password strength
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Validate name length
      if (userData.name.length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      const response = await apiService.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );

      if (response.success && response.token) {
        this.setToken(response.token);
        this.setUserData(response.user);
      }

      return response;
    } catch (error) {
      // Enhanced error handling
      if (error.type === 'validation') {
        throw new Error(error.message || 'Please check your input and try again');
      } else if (error.type === 'server') {
        throw new Error('Server error. Please try again later.');
      } else if (error.type === 'network') {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    }
  }

  // Login user
  async login(credentials) {
    try {
      // Validate required fields
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await apiService.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.success && response.token) {
        this.setToken(response.token);
        this.setUserData(response.user);
      }

      return response;
    } catch (error) {
      // Enhanced error handling
      if (error.type === 'validation') {
        throw new Error(error.message || 'Please check your credentials');
      } else if (error.type === 'unauthorized') {
        throw new Error('Invalid email or password');
      } else if (error.type === 'server') {
        throw new Error('Server error. Please try again later.');
      } else if (error.type === 'network') {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await apiService.get(API_ENDPOINTS.AUTH.PROFILE);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await apiService.put(
        API_ENDPOINTS.AUTH.UPDATE_PROFILE,
        userData
      );

      if (response.success && response.user) {
        this.setUserData(response.user);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete user account
  async deleteAccount(userId) {
    try {
      const response = await apiService.delete(
        `${API_ENDPOINTS.AUTH.DELETE_USER}?id=${userId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  logout() {
    this.removeToken();
    this.removeUserData();
  }

  // Set auth token
  setToken(token) {
    // Store token in cookie with 7 days expiration
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    document.cookie = `${STORAGE_KEYS.AUTH_TOKEN}=${token}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
  }

  // Get auth token
  getToken() {
    return this.getCookie(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Remove auth token
  removeToken() {
    document.cookie = `${STORAGE_KEYS.AUTH_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // Set user data
  setUserData(userData) {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  // Get user data
  getUserData() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Remove user data
  removeUserData() {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Check if user is admin
  isAdmin() {
    const userData = this.getUserData();
    return userData?.role === 'admin';
  }

  // Get user ID
  getUserId() {
    const userData = this.getUserData();
    return userData?.id || userData?._id;
  }

  // Get user role
  getUserRole() {
    const userData = this.getUserData();
    return userData?.role;
  }

  // Check if user is verified
  isVerified() {
    const userData = this.getUserData();
    return userData?.verified === true;
  }

  // Helper method to get cookie value
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }

  // Refresh token (if needed)
  async refreshToken() {
    try {
      // This would be implemented if your API supports token refresh
      // For now, we'll just return the current token
      return this.getToken();
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiService.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async googleAuth(idToken) {
    try {
      // Validate idToken
      if (!idToken) {
        throw new Error('Google ID token is required');
      }

      const response = await apiService.post(API_ENDPOINTS.AUTH.GOOGLE_AUTH, {
        idToken
      });

      if (response.success && response.token) {
        this.setToken(response.token);
        this.setUserData(response.user);
      }

      return response;
    } catch (error) {
      // Enhanced error handling
      if (error.type === 'validation') {
        throw new Error(error.message || 'Invalid Google authentication');
      } else if (error.type === 'unauthorized') {
        throw new Error('Google authentication failed');
      } else if (error.type === 'server') {
        throw new Error('Server error. Please try again later.');
      } else if (error.type === 'network') {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Google authentication failed. Please try again.');
      }
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      // Validate email
      if (!email) {
        throw new Error('Email is required');
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });
      return response;
    } catch (error) {
      // Enhanced error handling
      if (error.type === 'validation') {
        throw new Error(error.message || 'Please check your email address');
      } else if (error.type === 'server') {
        throw new Error('Server error. Please try again later.');
      } else if (error.type === 'network') {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to send reset email. Please try again.');
      }
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      // Validate inputs
      if (!token || !password) {
        throw new Error('Token and password are required');
      }

      // Validate password strength
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const response = await apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password,
      });
      return response;
    } catch (error) {
      // Enhanced error handling
      if (error.type === 'validation') {
        throw new Error(error.message || 'Invalid reset token or password');
      } else if (error.type === 'unauthorized') {
        throw new Error('Reset token is invalid or expired');
      } else if (error.type === 'server') {
        throw new Error('Server error. Please try again later.');
      } else if (error.type === 'network') {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to reset password. Please try again.');
      }
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await apiService.post('/users/verify-email', { token });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Resend verification email
  async resendVerificationEmail() {
    try {
      const response = await apiService.post('/users/resend-verification');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(userId, otp) {
    try {
      // Validate inputs
      if (!userId || !otp) {
        throw new Error('User ID and OTP are required');
      }

      // Validate userId format (MongoDB ObjectId)
      if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        throw new Error('Invalid user ID format');
      }

      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        throw new Error('OTP must be a 6-digit number');
      }

      const response = await apiService.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        userId,
        otp
      });

      if (response.success && response.user) {
        this.setUserData(response.user);
      }

      return response;
    } catch (error) {
      // Enhanced error handling
      if (error.type === 'validation') {
        throw new Error(error.message || 'Invalid verification code');
      } else if (error.type === 'unauthorized') {
        throw new Error('Verification failed. Please try again.');
      } else if (error.type === 'server') {
        throw new Error('Server error. Please try again later.');
      } else if (error.type === 'network') {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Verification failed. Please try again.');
      }
    }
  }

  // Resend OTP
  async resendOTP(userId) {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Validate userId format (MongoDB ObjectId)
      if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        throw new Error('Invalid user ID format');
      }

      const response = await apiService.post(API_ENDPOINTS.AUTH.RESEND_OTP, {
        userId
      });

      return response;
    } catch (error) {
      // Enhanced error handling
      if (error.type === 'validation') {
        throw new Error(error.message || 'Invalid request');
      } else if (error.type === 'unauthorized') {
        throw new Error('Unable to resend code. Please try again.');
      } else if (error.type === 'server') {
        throw new Error('Server error. Please try again later.');
      } else if (error.type === 'network') {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to resend code. Please try again.');
      }
    }
  }
}

// Create and export auth service instance
const authService = new AuthService();
export default authService;
