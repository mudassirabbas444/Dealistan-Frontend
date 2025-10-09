/**
 * Google OAuth authentication component
 */

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const GoogleAuth = ({ onSuccess, onError, text = "Continue with Google", className = "" }) => {
  const { googleAuth } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      
      if (!credential) {
        throw new Error('No credential received from Google');
      }

      // Show loading toast
      const loadingToast = toast.loading('Signing you in...');

      // Call the auth service
      const result = await googleAuth(credential);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message || 'Welcome! You have been signed in successfully.');
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        throw new Error(result.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      
      // Show error toast
      toast.error(error.message || 'Google authentication failed. Please try again.');
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google OAuth error:', error);
    toast.error('Google authentication failed. Please try again.');
    
    if (onError) {
      onError(error);
    }
  };

  return (
    <div className={`google-auth-container ${className}`}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        auto_select={false}
        theme="outline"
        size="large"
        text={text}
        shape="rectangular"
        logo_alignment="left"
        width="100%"
        locale="en"
      />
    </div>
  );
};

export default GoogleAuth;
