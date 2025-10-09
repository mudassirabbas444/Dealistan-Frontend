import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Custom hook for authentication
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Custom hook for protected routes
export const useRequireAuth = (redirectTo = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};

// Custom hook for admin-only routes
export const useRequireAdmin = (redirectTo = '/dashboard') => {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAdmin, isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAdmin, isAuthenticated, isLoading };
};

// Custom hook for verified users only
export const useRequireVerification = (redirectTo = '/verify-email') => {
  const { isVerified, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isVerified)) {
      navigate(redirectTo, { replace: true });
    }
  }, [isVerified, isAuthenticated, isLoading, navigate, redirectTo]);

  return { isVerified, isAuthenticated, isLoading };
};
