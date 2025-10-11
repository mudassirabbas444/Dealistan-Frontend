import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Layout } from './components';
import AdminRoute from './components/layout';
import AdminLayout from './components/layout/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkErrorBoundary from './components/NetworkErrorBoundary';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/user/ProfilePage';
import ProductsPage from './pages/product/ProductsPage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import CreateProductPage from './pages/product/CreateProductPage';
import EditProductPage from './pages/product/EditProductPage';
import CategoriesPage from './pages/category/CategoriesPage';
import MessagesPage from './pages/message/MessagesPage';
import FavoritesPage from './pages/favorite/FavoritesPage';
import MyProductsPage from './pages/product/MyProductsPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  console.log('REACT_APP_GOOGLE_CLIENT_ID:', googleClientId);
  
  if (!googleClientId) {
    console.error('REACT_APP_GOOGLE_CLIENT_ID is not set!');
  }
  
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <NetworkErrorBoundary>
            <GoogleOAuthProvider clientId={googleClientId}>
              <AppProvider>
                <AuthProvider>
                  <SocketProvider>
                    <Router>
                    <div className='App'>
                      <Routes>
                  {/* Public Routes */}
                  <Route path='/' element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path='search' element={<SearchPage />} />
                    <Route path='categories' element={<CategoriesPage />} />
                    <Route path='products' element={<ProductsPage />} />
                    <Route
                      path='products/:id'
                      element={<ProductDetailPage />}
                    />
                  </Route>

                  {/* Auth Routes */}
                  <Route path='/login' element={<LoginPage />} />
                  <Route path='/register' element={<RegisterPage />} />
                  <Route path='/verify-email' element={<VerifyEmailPage />} />
                  <Route path='/forgot-password' element={<ForgotPasswordPage />} />
                  <Route path='/reset-password' element={<ResetPasswordPage />} />

                  {/* Protected Routes */}
                  <Route path='/' element={<Layout />}>
                    <Route path='dashboard' element={<DashboardPage />} />
                    <Route path='my-products' element={<MyProductsPage />} />
                    <Route path='profile' element={<ProfilePage />} />
                    <Route
                      path='products/create'
                      element={<CreateProductPage />}
                    />
                    <Route
                      path='products/:id/edit'
                      element={<EditProductPage />}
                    />
                    <Route path='messages' element={<MessagesPage />} />
                    <Route path='favorites' element={<FavoritesPage />} />
                  </Route>

              {/* Admin Routes */}
              <Route path='/admin/login' element={<AdminLoginPage />} />
              <Route
                path='/admin'
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path='users' element={<AdminUsersPage />} />
                <Route path='products' element={<AdminProductsPage />} />
                <Route path='categories' element={<AdminCategoriesPage />} />
              </Route>

                        {/* 404 Route */}
                        <Route path='*' element={<NotFoundPage />} />
                      </Routes>
                    </div>
                  </Router>
                </SocketProvider>
              </AuthProvider>
            </AppProvider>
            </GoogleOAuthProvider>
          </NetworkErrorBoundary>
        </ErrorBoundary>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
