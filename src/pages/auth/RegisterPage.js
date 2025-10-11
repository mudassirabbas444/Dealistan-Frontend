import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components';
import GoogleAuth from '../../components/auth/GoogleAuth';
import NotificationContainer from '../../components/common/NotificationContainer';
import { VALIDATION, ROUTES } from '../../constants';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');
  const email = watch('email');
  const phone = watch('phone');

  // Password strength calculation
  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 6) strength += 1;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  // Block timer
  useEffect(() => {
    if (blockTime > 0) {
      const timer = setTimeout(() => {
        setBlockTime(blockTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isBlocked) {
      setIsBlocked(false);
    }
  }, [blockTime, isBlocked]);

  const onSubmit = async (data) => {
    if (isBlocked) return;

    console.log('Registration attempt:', data);
    const result = await registerUser(data);
    console.log('Registration result:', result);
    
    if (result.success) {
      if (result.requiresVerification) {
        console.log('Redirecting to verification page');
        // Redirect to email verification page
        navigate(`/verify-email?userId=${result.userId}&email=${encodeURIComponent(result.email)}`);
      } else {
        console.log('Redirecting to dashboard');
        // User is already verified, go to dashboard
        navigate('/dashboard');
      }
    } else {
      console.log('Registration failed:', result.error);
      // Handle failed registration attempts
      const newAttempts = registrationAttempts + 1;
      setRegistrationAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsBlocked(true);
        setBlockTime(300); // 5 minutes block
        setRegistrationAttempts(0);
      }
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
            Create your account
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Or{' '}
            <Link
              to='/login'
              className='font-medium text-primary-600 hover:text-primary-500'
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Security Warnings */}
        {registrationAttempts > 0 && (
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <AlertCircle className='h-5 w-5 text-yellow-600 mr-2' />
              <span className='text-sm font-medium text-yellow-800'>
                Security Notice
              </span>
            </div>
            <p className='text-xs text-yellow-700 mt-1'>
              {registrationAttempts === 1 && '1 failed attempt. 2 more attempts remaining.'}
              {registrationAttempts === 2 && '2 failed attempts. 1 more attempt remaining.'}
              {registrationAttempts >= 3 && 'Too many failed attempts. Please wait before trying again.'}
            </p>
          </div>
        )}

        {/* Block Warning */}
        {isBlocked && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <AlertCircle className='h-5 w-5 text-red-600 mr-2' />
              <span className='text-sm font-medium text-red-800'>
                Registration Temporarily Blocked
              </span>
            </div>
            <p className='text-xs text-red-700 mt-1'>
              Too many failed attempts. Please wait {Math.floor(blockTime / 60)}:{(blockTime % 60).toString().padStart(2, '0')} before trying again.
            </p>
          </div>
        )}

        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <Input
              label='Full Name'
              type='text'
              autoComplete='name'
              placeholder='Enter your full name'
              leftIcon={<User className='h-5 w-5 text-gray-400' />}
              error={errors.name?.message}
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: VALIDATION.NAME_MIN_LENGTH,
                  message: `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`,
                },
                maxLength: {
                  value: VALIDATION.NAME_MAX_LENGTH,
                  message: `Name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`,
                },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: 'Name can only contain letters and spaces',
                },
              })}
            />

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
                  value: VALIDATION.EMAIL_REGEX,
                  message: 'Please enter a valid email address',
                },
                validate: {
                  notDisposable: (value) => {
                    const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
                    const domain = value.split('@')[1];
                    return !disposableDomains.includes(domain) || 'Please use a permanent email address';
                  },
                },
              })}
            />

            <Input
              label='Phone Number'
              type='tel'
              autoComplete='tel'
              placeholder='Enter your phone number'
              leftIcon={<Phone className='h-5 w-5 text-gray-400' />}
              error={errors.phone?.message}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: VALIDATION.PHONE_REGEX,
                  message: 'Please enter a valid phone number',
                },
                minLength: {
                  value: 10,
                  message: 'Phone number must be at least 10 digits',
                },
                maxLength: {
                  value: 15,
                  message: 'Phone number must be less than 15 digits',
                },
              })}
            />

            <Input
              label='City'
              type='text'
              autoComplete='address-level2'
              placeholder='Enter your city'
              leftIcon={<MapPin className='h-5 w-5 text-gray-400' />}
              error={errors.city?.message}
              {...register('city', {
                required: 'City is required',
                minLength: {
                  value: 2,
                  message: 'City must be at least 2 characters',
                },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: 'City can only contain letters and spaces',
                },
              })}
            />


            <Input
              label='Password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='new-password'
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
                  value: VALIDATION.PASSWORD_MIN_LENGTH,
                  message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
                },
                validate: {
                  hasUpperCase: (value) => /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                  hasLowerCase: (value) => /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
                  hasNumber: (value) => /[0-9]/.test(value) || 'Password must contain at least one number',
                },
              })}
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className='space-y-2'>
                <div className='flex items-center space-x-2'>
                  <div className='flex-1 bg-gray-200 rounded-full h-2'>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength <= 2
                          ? 'bg-red-500'
                          : passwordStrength <= 4
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength / 6) * 100}%` }}
                    />
                  </div>
                  <span className='text-xs text-gray-600'>
                    {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 4 ? 'Medium' : 'Strong'}
                  </span>
                </div>
                <div className='text-xs text-gray-600'>
                  {passwordStrength < 3 && 'Password should be stronger for better security'}
                </div>
              </div>
            )}

            <Input
              label='Confirm Password'
              type='password'
              autoComplete='new-password'
              placeholder='Confirm your password'
              leftIcon={<Lock className='h-5 w-5 text-gray-400' />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
            />
          </div>

          <div className='flex items-center'>
            <input
              id='terms'
              name='terms'
              type='checkbox'
              className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
              {...register('terms', {
                required: 'You must accept the terms and conditions',
              })}
            />
            <label htmlFor='terms' className='ml-2 block text-sm text-gray-900'>
              I agree to the{' '}
              <Link
                to='/terms'
                className='font-medium text-primary-600 hover:text-primary-500'
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to='/privacy'
                className='font-medium text-primary-600 hover:text-primary-500'
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className='text-sm text-red-600'>{errors.terms.message}</p>
          )}

          <div>
            <Button
              type='submit'
              size='lg'
              fullWidth
              loading={isLoading}
              disabled={isLoading || isBlocked}
            >
              {isBlocked ? 'Registration Blocked' : 'Create Account'}
            </Button>
          </div>

          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              Already have an account?{' '}
              <Link
                to={ROUTES.LOGIN}
                className='font-medium text-primary-600 hover:text-primary-500'
              >
                Sign in here
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
            <GoogleAuth 
              onSuccess={(result) => {
                if (result.success) {
                  navigate(ROUTES.DASHBOARD);
                }
              }}
              text="Sign up with Google"
            />
          </div>
        </div>
      </div>
      <NotificationContainer />
    </div>
  
  );
};

export default RegisterPage;
