import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../components';
import NotificationContainer from '../../components/common/NotificationContainer';
import { ROUTES, VALIDATION } from '../../constants';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyOTP, resendOTP, isLoading } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(null);

  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const otpValue = watch('otp');

  // Initialize OTP expiry timer (10 minutes)
  useEffect(() => {
    if (userId) {
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
      setOtpExpiry(expiryTime);
    }
  }, [userId]);

  // Auto-format OTP input
  useEffect(() => {
    if (otpValue) {
      const formattedOTP = otpValue.replace(/\D/g, '').slice(0, 6);
      setValue('otp', formattedOTP);
    }
  }, [otpValue, setValue]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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

  // Redirect if no userId or invalid params
  useEffect(() => {
    if (!userId || !email) {
      navigate(ROUTES.REGISTER);
    }
  }, [userId, email, navigate]);

  // Validate userId format
  useEffect(() => {
    if (userId && !/^[0-9a-fA-F]{24}$/.test(userId)) {
      navigate(ROUTES.REGISTER);
    }
  }, [userId, navigate]);

  const onSubmit = useCallback(async (data) => {
    if (!userId || isBlocked) return;

    // Check if OTP has expired
    if (otpExpiry && new Date() > otpExpiry) {
      setValue('otp', '');
      return;
    }

    const result = await verifyOTP(userId, data.otp);
    
    if (result.success) {
      setVerificationSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 2000);
    } else {
      // Handle failed attempts
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      if (newAttemptCount >= 3) {
        setIsBlocked(true);
        setBlockTime(300); // 5 minutes block
        setAttemptCount(0);
      }
      
      // Clear OTP input on failure
      setValue('otp', '');
    }
  }, [userId, isBlocked, otpExpiry, verifyOTP, attemptCount, setValue, navigate]);

  const handleResendOTP = useCallback(async () => {
    if (!userId || resendCooldown > 0 || isBlocked) return;

    setIsResending(true);
    try {
      const result = await resendOTP(userId);
      if (result.success) {
        setResendCooldown(60); // 60 seconds cooldown
        setAttemptCount(0); // Reset attempt count
        // Reset OTP expiry
        const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
        setOtpExpiry(expiryTime);
      }
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    } finally {
      setIsResending(false);
    }
  }, [userId, resendCooldown, isBlocked, resendOTP]);

  // Check if OTP has expired
  const isOtpExpired = otpExpiry && new Date() > otpExpiry;

  if (verificationSuccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <div className='mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <h2 className='text-3xl font-extrabold text-gray-900 mb-2'>
              Email Verified!
            </h2>
            <p className='text-gray-600'>
              Your email has been successfully verified. Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isOtpExpired) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <div className='mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
              <AlertCircle className='h-8 w-8 text-red-600' />
            </div>
            <h2 className='text-3xl font-extrabold text-gray-900 mb-2'>
              Code Expired
            </h2>
            <p className='text-gray-600 mb-6'>
              The verification code has expired. Please request a new one.
            </p>
            <Button
              onClick={handleResendOTP}
              disabled={isResending || resendCooldown > 0}
              className='w-full'
            >
              {isResending ? 'Sending...' : 'Get New Code'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-xl'>D</span>
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Verify your email
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            We've sent a 6-digit verification code to
          </p>
          {email && (
            <p className='text-center text-sm font-medium text-primary-600'>
              {email}
            </p>
          )}
        </div>

        {/* Security Warning */}
        {attemptCount > 0 && (
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <Shield className='h-5 w-5 text-yellow-600 mr-2' />
              <span className='text-sm font-medium text-yellow-800'>
                Security Notice
              </span>
            </div>
            <p className='text-xs text-yellow-700 mt-1'>
              {attemptCount === 1 && '1 failed attempt. 2 more attempts remaining.'}
              {attemptCount === 2 && '2 failed attempts. 1 more attempt remaining.'}
              {attemptCount >= 3 && 'Too many failed attempts. Please wait before trying again.'}
            </p>
          </div>
        )}

        {/* Block Warning */}
        {isBlocked && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <AlertCircle className='h-5 w-5 text-red-600 mr-2' />
              <span className='text-sm font-medium text-red-800'>
                Account Temporarily Blocked
              </span>
            </div>
            <p className='text-xs text-red-700 mt-1'>
              Too many failed attempts. Please wait {Math.floor(blockTime / 60)}:{(blockTime % 60).toString().padStart(2, '0')} before trying again.
            </p>
          </div>
        )}

        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='otp' className='block text-sm font-medium text-gray-700 mb-2'>
                Verification Code
              </label>
              <Input
                id='otp'
                type='text'
                placeholder='Enter 6-digit code'
                maxLength={6}
                className='text-center text-2xl font-mono tracking-widest'
                leftIcon={<Mail className='h-5 w-5 text-gray-400' />}
                error={errors.otp?.message}
                disabled={isBlocked}
                {...register('otp', {
                  required: 'Verification code is required',
                  minLength: {
                    value: 6,
                    message: 'Code must be 6 digits',
                  },
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Code must contain only numbers',
                  },
                  validate: {
                    notExpired: () => !isOtpExpired || 'Verification code has expired',
                  },
                })}
              />
            </div>
          </div>

          <div className='space-y-4'>
            <Button
              type='submit'
              className='w-full'
              loading={isLoading}
              disabled={!otpValue || otpValue.length !== 6 || isBlocked || isOtpExpired}
            >
              {isBlocked ? 'Blocked' : 'Verify Email'}
            </Button>

            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>
                Didn't receive the code?
              </p>
              <button
                type='button'
                onClick={handleResendOTP}
                disabled={isResending || resendCooldown > 0 || isBlocked}
                className='inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed'
              >
                {isResending ? (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : isBlocked ? (
                  'Resend Blocked'
                ) : (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Resend Code
                  </>
                )}
              </button>
            </div>

            <div className='text-center'>
              <button
                type='button'
                onClick={() => navigate(ROUTES.REGISTER)}
                className='inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-500'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Registration
              </button>
            </div>
          </div>
        </form>

        <div className='text-center'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-center justify-center mb-2'>
              <Mail className='h-5 w-5 text-blue-600 mr-2' />
              <span className='text-sm font-medium text-blue-800'>
                Check your email
              </span>
            </div>
            <p className='text-xs text-blue-700'>
              The verification code will expire in 10 minutes. Make sure to check your spam folder if you don't see it in your inbox.
            </p>
          </div>
        </div>
      </div>
      <NotificationContainer />
    </div>
  
  );
};

export default VerifyEmailPage;
