import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth';
import { useApp } from './AppContext';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const { setUser, logout: appLogout, addNotification } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Verify token is still valid by fetching profile
          const response = await authService.getProfile();
          if (response.success) {
            setUser(response.user);
          } else {
            // Token is invalid
            handleLogout();
          }
        } catch (error) {
          // Token is invalid or expired
          handleLogout();
        }
      }
    };

    checkAuth();
  }, []); // Remove setUser from dependencies to prevent infinite loop

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);

      if (response.success) {
        setUser(response.user);
        addNotification({
          type: 'success',
          title: 'Login Successful',
          message: 'Welcome back!',
        });
        return { success: true, data: response };
      } else {
        addNotification({
          type: 'error',
          title: 'Login Failed',
          message: response.message || 'Invalid credentials',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'Something went wrong',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);

      if (response.success) {
        if (response.requiresVerification) {
          // User needs to verify email
          addNotification({
            type: 'info',
            title: 'Verification Required',
            message: 'Please check your email for verification code',
          });
          return { 
            success: true, 
            data: response, 
            requiresVerification: true,
            userId: response.user.id,
            email: response.user.email
          };
        } else {
          // User is already verified (admin or special case)
          setUser(response.user);
          addNotification({
            type: 'success',
            title: 'Registration Successful',
            message: 'Account created successfully!',
          });
          return { success: true, data: response };
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Registration Failed',
          message: response.message || 'Registration failed',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Something went wrong',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    handleLogout();
    addNotification({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been logged out successfully',
    });
  };

  // Internal logout handler
  const handleLogout = () => {
    authService.logout();
    appLogout();
  };

  // Update profile function
  const updateProfile = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.updateProfile(userData);

      if (response.success) {
        setUser(response.user);
        addNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully',
        });
        return { success: true, data: response };
      } else {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: response.message || 'Failed to update profile',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Something went wrong',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    try {
      const response = await authService.changePassword(
        currentPassword,
        newPassword
      );

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Password Changed',
          message: 'Your password has been changed successfully',
        });
        return { success: true, data: response };
      } else {
        addNotification({
          type: 'error',
          title: 'Password Change Failed',
          message: response.message || 'Failed to change password',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Password Change Failed',
        message: error.message || 'Something went wrong',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Reset Link Sent',
          message: 'Password reset link has been sent to your email',
        });
        return { success: true, data: response };
      } else {
        addNotification({
          type: 'error',
          title: 'Reset Failed',
          message: response.message || 'Failed to send reset link',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Reset Failed',
        message: error.message || 'Something went wrong',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, newPassword);

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Password Reset',
          message: 'Your password has been reset successfully',
        });
        return { success: true, data: response };
      } else {
        addNotification({
          type: 'error',
          title: 'Reset Failed',
          message: response.message || 'Failed to reset password',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Reset Failed',
        message: error.message || 'Something went wrong',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify email function
  const verifyEmail = async (token) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyEmail(token);

      if (response.success) {
        // Update user data to reflect verified status
        const userData = authService.getUserData();
        if (userData) {
          const updatedUser = { ...userData, verified: true };
          setUser(updatedUser);
        }

        addNotification({
          type: 'success',
          title: 'Email Verified',
          message: 'Your email has been verified successfully',
        });
        return { success: true, data: response };
      } else {
        addNotification({
          type: 'error',
          title: 'Verification Failed',
          message: response.message || 'Failed to verify email',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Verification Failed',
        message: error.message || 'Something went wrong',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification email function
  const resendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      const response = await authService.resendVerificationEmail();

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Verification Email Sent',
          message: 'Verification email has been sent successfully',
        });
        return { success: true, data: response };
      } else {
        addNotification({
          type: 'error',
          title: 'Email Send Failed',
          message: response.message || 'Failed to send verification email',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Email Send Failed',
        message: error.message || 'Something went wrong',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP function
  const verifyOTP = async (userId, otp) => {
    setIsLoading(true);
    try {
      // Validate inputs before making API call
      if (!userId || !otp) {
        addNotification({
          type: 'error',
          title: 'Verification Failed',
          message: 'User ID and verification code are required',
        });
        return { success: false, error: 'Missing required fields' };
      }

      const response = await authService.verifyOTP(userId, otp);

      if (response.success) {
        setUser(response.user);
        addNotification({
          type: 'success',
          title: 'Email Verified',
          message: 'Your email has been verified successfully',
        });
        return { success: true, data: response };
      } else {
        addNotification({
          type: 'error',
          title: 'Verification Failed',
          message: response.message || 'Invalid verification code',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      // Enhanced error handling with specific messages
      let errorMessage = 'Something went wrong';
      let errorTitle = 'Verification Failed';

      if (error.message.includes('expired')) {
        errorMessage = 'Verification code has expired. Please request a new one.';
        errorTitle = 'Code Expired';
      } else if (error.message.includes('Invalid')) {
        errorMessage = 'Invalid verification code. Please check and try again.';
        errorTitle = 'Invalid Code';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
        errorTitle = 'Connection Error';
      } else if (error.message.includes('Server')) {
        errorMessage = 'Server error. Please try again later.';
        errorTitle = 'Server Error';
      } else {
        errorMessage = error.message || 'Verification failed. Please try again.';
      }

      addNotification({
        type: 'error',
        title: errorTitle,
        message: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP function
  const resendOTP = async (userId) => {
    setIsLoading(true);
    try {
      // Validate input before making API call
      if (!userId) {
        addNotification({
          type: 'error',
          title: 'Send Failed',
          message: 'User ID is required',
        });
        return { success: false, error: 'Missing user ID' };
      }

      const response = await authService.resendOTP(userId);

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Code Sent',
          message: 'Verification code has been sent to your email',
        });
        return { success: true, data: response };
      } else {
        addNotification({
          type: 'error',
          title: 'Send Failed',
          message: response.message || 'Failed to send verification code',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      // Enhanced error handling with specific messages
      let errorMessage = 'Something went wrong';
      let errorTitle = 'Send Failed';

      if (error.message.includes('already verified')) {
        errorMessage = 'Your email is already verified. You can proceed to login.';
        errorTitle = 'Already Verified';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
        errorTitle = 'Connection Error';
      } else if (error.message.includes('Server')) {
        errorMessage = 'Server error. Please try again later.';
        errorTitle = 'Server Error';
      } else if (error.message.includes('Invalid')) {
        errorMessage = 'Invalid request. Please try again.';
        errorTitle = 'Invalid Request';
      } else {
        errorMessage = error.message || 'Failed to send verification code. Please try again.';
      }

      addNotification({
        type: 'error',
        title: errorTitle,
        message: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth function
  const googleAuth = async (idToken) => {
    setIsLoading(true);
    try {
      const response = await authService.googleAuth(idToken);

      if (response.success) {
        setUser(response.user);
        addNotification({
          type: 'success',
          title: 'Login Successful',
          message: 'Welcome! You have been signed in successfully.',
        });
        return { success: true, data: response };
      } else {
        addNotification({
          type: 'error',
          title: 'Google Login Failed',
          message: response.message || 'Google authentication failed',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Google Login Failed',
        message: error.message || 'Something went wrong',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete account function
  const deleteAccount = async (userId) => {
    setIsLoading(true);
    try {
      const response = await authService.deleteAccount(userId);

      if (response.success) {
        handleLogout();
        addNotification({
          type: 'success',
          title: 'Account Deleted',
          message: 'Your account has been deleted successfully',
        });
        return { success: true, data: response };
      } else {
        addNotification({
          type: 'error',
          title: 'Deletion Failed',
          message: response.message || 'Failed to delete account',
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: error.message || 'Something went wrong',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    verifyOTP,
    resendOTP,
    googleAuth,
    deleteAccount,
    isAuthenticated: authService.isAuthenticated(),
    user: authService.getUserData(),
    isAdmin: authService.isAdmin(),
    isVerified: authService.isVerified(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export context for advanced usage
export { AuthContext };
