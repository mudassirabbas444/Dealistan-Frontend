import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/auth';
import { formatRelativeTime } from '../../utils';
import toast from 'react-hot-toast';
import { VALIDATION } from '../../constants';
import { sanitizeInput, validateEmail, validatePhone } from '../../utils/security';
import { uploadImage, validateImageFile } from '../../services/uploadImage';

const ProfilePage = () => {
  const { user, updateProfile, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    formState: { isDirty }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || ''
    }
  });

  const watchedValues = watch();

  // Track changes
  useEffect(() => {
    if (user) {
      const hasChanges = 
        watchedValues.name !== user.name ||
        watchedValues.email !== user.email ||
        watchedValues.phone !== user.phone ||
        watchedValues.city !== user.city;
      setHasChanges(hasChanges);
    }
  }, [watchedValues, user]);

  // Fetch user profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await authService.getProfile();
      return response.user;
    },
    enabled: !!user
  });

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    reset();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user?.id) return;

    setIsUploadingAvatar(true);
    try {
      const result = await uploadImage(avatarFile, 'profiles', user.id);
      
      if (result.success) {
        // Update profile with new avatar URL
        const updateResult = await updateProfile({ avatar: result.url });
        
        if (updateResult.success) {
          toast.success('Profile picture updated successfully!');
          setAvatarFile(null);
          setAvatarPreview(null);
          refetch();
        } else {
          toast.error('Failed to update profile picture');
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data) => {
    // Validate email
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.message);
      return;
    }

    // Validate phone number
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.message);
      return;
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(data.name),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      city: sanitizeInput(data.city)
    };

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const result = await updateProfile(sanitizedData);
      if (result.success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        refetch();
      } else {
        toast.error(result.error || 'Failed to update profile');
        if (result.errors) {
          setFormErrors(result.errors);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className='container-custom section-padding'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Profile</h1>
          <p className='text-gray-600 mb-8'>Please login to view your profile</p>
        </div>
      </div>
    );
  }

  if (profileLoading || authLoading) {
    return (
      <div className='container-custom section-padding'>
        <div className='flex justify-center py-12'>
          <LoadingSpinner size='lg' />
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className='container-custom section-padding'>
        <div className='text-center py-12'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Error Loading Profile</h1>
          <p className='text-gray-600 mb-8'>Something went wrong while loading your profile.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const currentUser = profile || user;

  return (
    <div className='container-custom section-padding'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-soft p-8 mb-8'>
          <div className='flex flex-col md:flex-row items-center md:items-start gap-6'>
            {/* Avatar */}
            <div className='relative'>
              <div className='w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden'>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt='Preview'
                    className='w-full h-full rounded-full object-cover'
                  />
                ) : currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className='w-full h-full rounded-full object-cover'
                  />
                ) : (
                  <span className='text-primary-600 font-semibold text-3xl'>
                    {currentUser.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              
              {isEditing && (
                <div className='absolute bottom-0 right-0 flex flex-col gap-1'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleAvatarChange}
                    className='hidden'
                    id='avatar-upload'
                  />
                  <label
                    htmlFor='avatar-upload'
                    className='w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors cursor-pointer'
                  >
                    <Camera className='h-4 w-4' />
                  </label>
                  
                  {avatarFile && (
                    <button
                      onClick={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                      className='w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50'
                    >
                      {isUploadingAvatar ? (
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                      ) : (
                        <CheckCircle className='h-4 w-4' />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className='flex-1 text-center md:text-left'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                {currentUser.name}
              </h1>
              <p className='text-gray-600 mb-4'>{currentUser.email}</p>
              
              {/* Verification Status */}
              <div className='flex items-center justify-center md:justify-start gap-2 mb-4'>
                {currentUser.verified ? (
                  <div className='flex items-center gap-1 text-green-600'>
                    <CheckCircle className='h-4 w-4' />
                    <span className='text-sm font-medium'>Verified Account</span>
                  </div>
                ) : (
                  <div className='flex items-center gap-1 text-yellow-600'>
                    <Shield className='h-4 w-4' />
                    <span className='text-sm font-medium'>Unverified Account</span>
                  </div>
                )}
                {currentUser.role === 'admin' && (
                  <span className='px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium'>
                    Admin
                  </span>
                )}
              </div>

              {/* Member Since */}
              <p className='text-sm text-gray-500'>
                Member since {formatRelativeTime(currentUser.createdAt)}
              </p>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <Button onClick={handleEdit} variant='outline'>
                <Edit3 className='h-4 w-4 mr-2' />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className='bg-white rounded-lg shadow-soft p-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>
            Profile Information
          </h2>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              {/* Form Errors */}
              {Object.keys(formErrors).length > 0 && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <div className='flex items-center mb-2'>
                    <AlertCircle className='h-5 w-5 text-red-600 mr-2' />
                    <span className='text-sm font-medium text-red-800'>
                      Please fix the following errors:
                    </span>
                  </div>
                  <ul className='text-sm text-red-700 list-disc list-inside'>
                    {Object.entries(formErrors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <Input
                    label='Full Name'
                    placeholder='Enter your full name'
                    leftIcon={<User className='h-5 w-5 text-gray-400' />}
                    error={errors.name?.message}
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: VALIDATION.NAME_MIN_LENGTH,
                        message: `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`
                      },
                      maxLength: {
                        value: VALIDATION.NAME_MAX_LENGTH,
                        message: `Name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`
                      },
                      pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message: 'Name can only contain letters and spaces'
                      }
                    })}
                  />
                </div>

                <div>
                  <Input
                    label='Email Address'
                    type='email'
                    placeholder='Enter your email'
                    leftIcon={<Mail className='h-5 w-5 text-gray-400' />}
                    error={errors.email?.message}
                    disabled
                    {...register('email')}
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <Input
                    label='Phone Number'
                    type='tel'
                    placeholder='Enter your phone number'
                    leftIcon={<Phone className='h-5 w-5 text-gray-400' />}
                    error={errors.phone?.message}
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: VALIDATION.PHONE_REGEX,
                        message: 'Please enter a valid phone number'
                      },
                      minLength: {
                        value: 10,
                        message: 'Phone number must be at least 10 digits'
                      },
                      maxLength: {
                        value: 15,
                        message: 'Phone number must be less than 15 digits'
                      }
                    })}
                  />
                </div>

                <div>
                  <Input
                    label='City'
                    placeholder='Enter your city'
                    leftIcon={<MapPin className='h-5 w-5 text-gray-400' />}
                    error={errors.city?.message}
                    {...register('city', {
                      required: 'City is required',
                      minLength: {
                        value: 2,
                        message: 'City must be at least 2 characters'
                      },
                      maxLength: {
                        value: 50,
                        message: 'City must be less than 50 characters'
                      },
                      pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message: 'City can only contain letters and spaces'
                      }
                    })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-4 pt-6 border-t border-gray-200'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className='h-4 w-4 mr-2' />
                  Cancel
                </Button>
                <Button
                  type='submit'
                  loading={isSubmitting}
                  disabled={isSubmitting || !hasChanges}
                >
                  <Save className='h-4 w-4 mr-2' />
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
                  <User className='h-5 w-5 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-500'>Full Name</p>
                    <p className='font-medium text-gray-900'>{currentUser.name}</p>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
                  <Mail className='h-5 w-5 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-500'>Email Address</p>
                    <p className='font-medium text-gray-900'>{currentUser.email}</p>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
                  <Phone className='h-5 w-5 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-500'>Phone Number</p>
                    <p className='font-medium text-gray-900'>
                      {currentUser.phone || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
                  <MapPin className='h-5 w-5 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-500'>City</p>
                    <p className='font-medium text-gray-900'>
                      {currentUser.city || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
                  <Calendar className='h-5 w-5 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-500'>Member Since</p>
                    <p className='font-medium text-gray-900'>
                      {formatRelativeTime(currentUser.createdAt)}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
                  <Shield className='h-5 w-5 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-500'>Account Status</p>
                    <p className='font-medium text-gray-900'>
                      {currentUser.verified ? 'Verified' : 'Unverified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Settings */}
        {!isEditing && (
          <div className='bg-white rounded-lg shadow-soft p-8 mt-8'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6'>
              Account Settings
            </h2>
            
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                <div>
                  <h3 className='font-medium text-gray-900'>Change Password</h3>
                  <p className='text-sm text-gray-600'>Update your account password</p>
                </div>
                <Button variant='outline' size='sm'>
                  Change
                </Button>
              </div>

              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                <div>
                  <h3 className='font-medium text-gray-900'>Email Verification</h3>
                  <p className='text-sm text-gray-600'>
                    {currentUser.verified 
                      ? 'Your email is verified' 
                      : 'Verify your email address'
                    }
                  </p>
                </div>
                {!currentUser.verified && (
                  <Button variant='outline' size='sm'>
                    Verify
                  </Button>
                )}
              </div>

              <div className='flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50'>
                <div>
                  <h3 className='font-medium text-red-900'>Delete Account</h3>
                  <p className='text-sm text-red-600'>
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant='outline' size='sm' className='border-red-300 text-red-700 hover:bg-red-50'>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
