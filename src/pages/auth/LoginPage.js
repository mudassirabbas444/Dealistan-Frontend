import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components';
import GoogleAuth from '../../components/auth/GoogleAuth';
import NotificationContainer from '../../components/common/NotificationContainer';
import { ROUTES } from '../../constants';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log('LoginPage onSubmit called with:', data);
    const result = await login(data);
    console.log('LoginPage login result:', result);
    
    if (result.success) {
      console.log('Login successful, redirecting to dashboard');
      navigate(ROUTES.DASHBOARD);
    } else if (result.requiresVerification) {
      console.log('Login requires verification, redirecting to verification page');
      // Redirect to email verification page
      navigate(`/verify-email?userId=${result.userId}&email=${encodeURIComponent(result.email)}`);
    }
  };

  const handleGoogleSuccess = (result) => {
    if (result.success) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-xl'>D</span>
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Sign in to your account
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Or{' '}
            <Link
              to={ROUTES.REGISTER}
              className='font-medium text-primary-600 hover:text-primary-500'
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <Input
              label='Email address'
              type='email'
              autoComplete='email'
              placeholder='Enter your email'
              leftIcon={<Mail className='h-5 w-5 text-gray-400' />}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />

            <Input
              label='Password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              placeholder='Enter your password'
              leftIcon={<Lock className='h-5 w-5 text-gray-400' />}
              rightIcon={
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              }
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
              />
              <label
                htmlFor='remember-me'
                className='ml-2 block text-sm text-gray-900'
              >
                Remember me
              </label>
            </div>

            <div className='text-sm'>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className='font-medium text-primary-600 hover:text-primary-500'
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type='submit'
              size='lg'
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </div>

          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              Don't have an account?{' '}
              <Link
                to={ROUTES.REGISTER}
                className='font-medium text-primary-600 hover:text-primary-500'
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>

        {/* Google OAuth */}
        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-gray-50 text-gray-500'>Or continue with</span>
            </div>
          </div>
          <div className='mt-6'>
            <GoogleAuth onSuccess={handleGoogleSuccess} />
          </div>
        </div>
      </div>
      <NotificationContainer />
    </div>
  );
};

export default LoginPage;
