import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, X, MapPin, DollarSign, Package, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input, LoadingSpinner, LocationInput } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import productService from '../../services/product';
import categoryService from '../../services/category';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { VALIDATION, UPLOAD_CONFIG } from '../../constants';
import { sanitizeInput, validatePhone } from '../../utils/security';
import { uploadMultipleImages, validateImageFile } from '../../services/uploadImage';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [locationData, setLocationData] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      condition: 'used',
      negotiable: false
    }
  });

  // Fetch categories
  const { data: categories, error, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryService.getCategories();
      // The API returns { data: { categories: [...], total, page, pages } }
      return response.data?.categories || [];
    }
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const errors = [];
    const validImages = [];

    files.forEach((file, index) => {
      // Validate file using the utility function
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        errors.push(`Image ${index + 1}: ${validation.errors.join(', ')}`);
        return;
      }

      validImages.push({
        file,
        preview: URL.createObjectURL(file),
        id: Date.now() + Math.random() + index
      });
    });

    // Check total image count
    const totalImages = images.length + validImages.length;
    if (totalImages > UPLOAD_CONFIG.MAX_FILES) {
      errors.push(`Maximum ${UPLOAD_CONFIG.MAX_FILES} images allowed`);
      setUploadErrors(errors);
      return;
    }

    setImages(prev => [...prev, ...validImages]);
    setUploadErrors(errors);

    // Show errors if any
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const onSubmit = async (data) => {
    // Validate images
    if (!images.length) {
      toast.error('Please add at least one image');
      return;
    }

    // Validate phone number
    const phoneValidation = validatePhone(data.phoneNumber);
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.message);
      return;
    }

    // Sanitize inputs
    const sanitizedData = {
      title: sanitizeInput(data.title),
      description: sanitizeInput(data.description),
      price: parseFloat(data.price),
      category: data.category,
      condition: data.condition,
      phoneNumber: data.phoneNumber,
      negotiable: data.negotiable,
      tags: sanitizeInput(data.tags || ''),
      city: sanitizeInput(data.city),
      area: sanitizeInput(data.area || ''),
      address: sanitizeInput(data.address || ''),
    };

    // Validate price
    if (sanitizedData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Upload images to Firebase first
      const imageFiles = images.map(img => img.file);
      const uploadResult = await uploadMultipleImages(imageFiles, 'products', user?.id);
      
      if (!uploadResult.success) {
        toast.error('Failed to upload images');
        return;
      }

      // Prepare product data with Firebase image URLs
      const productData = {
        title: sanitizedData.title,
        description: sanitizedData.description,
        price: sanitizedData.price,
        category: sanitizedData.category,
        condition: sanitizedData.condition,
        phoneNumber: sanitizedData.phoneNumber,
        negotiable: sanitizedData.negotiable,
        tags: sanitizedData.tags,
        location: {
          city: locationData.city || sanitizedData.city,
          area: locationData.area || sanitizedData.area,
          address: locationData.address || sanitizedData.address,
          coordinates: locationData.coordinates
        },
        images: uploadResult.images.map(img => img.url) // Firebase URLs
      };

      const response = await productService.createProduct(productData);
      
      if (response.success) {
        toast.success('Product created successfully!');
        navigate('/my-products');
      } else {
        toast.error(response.message || 'Failed to create product');
        if (response.errors) {
          setFormErrors(response.errors);
        }
      }
    } catch (error) {
      console.error('Error creating product:', error);
      
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
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          Create Product
        </h1>
          <p className='text-gray-600 mb-8'>Please login to create a product</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container-custom section-padding'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Create New Product
          </h1>
          <p className='text-gray-600'>
            List your item for sale and reach thousands of potential buyers
          </p>
        </div>

        {/* Form Errors */}
        {Object.keys(formErrors).length > 0 && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
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

        {/* Upload Errors */}
        {uploadErrors.length > 0 && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center mb-2'>
              <AlertCircle className='h-5 w-5 text-red-600 mr-2' />
              <span className='text-sm font-medium text-red-800'>
                Upload Errors:
              </span>
            </div>
            <ul className='text-sm text-red-700 list-disc list-inside'>
              {uploadErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
          {/* Basic Information */}
          <div className='bg-white rounded-lg shadow-soft p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
              <Package className='h-5 w-5' />
              Basic Information
            </h2>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='md:col-span-2'>
                <Input
                  label='Product Title'
                  placeholder='Enter a descriptive title'
                  error={errors.title?.message}
                  {...register('title', {
                    required: 'Title is required',
                    minLength: {
                      value: 3,
                      message: 'Title must be at least 3 characters'
                    },
                    maxLength: {
                      value: VALIDATION.TITLE_MAX_LENGTH,
                      message: `Title must be less than ${VALIDATION.TITLE_MAX_LENGTH} characters`
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
                      message: 'Title contains invalid characters'
                    }
                  })}
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Description
                </label>
                <textarea
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                  rows={4}
                  placeholder='Describe your product in detail'
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters'
                    },
                    maxLength: {
                      value: VALIDATION.DESCRIPTION_MAX_LENGTH,
                      message: `Description must be less than ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`
                    }
                  })}
                />
                {errors.description && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label='Price'
                  type='number'
                  placeholder='0.00'
                  leftIcon={<DollarSign className='h-5 w-5 text-gray-400' />}
                  error={errors.price?.message}
                  {...register('price', {
                    required: 'Price is required',
                    min: {
                      value: 0.01,
                      message: 'Price must be greater than 0'
                    },
                    max: {
                      value: 999999.99,
                      message: 'Price must be less than 1,000,000'
                    },
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: 'Price must be a valid number with up to 2 decimal places'
                    }
                  })}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Category
                </label>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                  {...register('category', {
                    required: 'Category is required'
                  })}
                  disabled={isLoading}
                >
                  <option value=''>
                    {isLoading ? 'Loading categories...' : 'Select a category'}
                  </option>
                  {Array.isArray(categories) && categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {error && (
                  <p className='text-sm text-red-600 mt-1'>
                    Failed to load categories
                  </p>
                )}
                {errors.category && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Condition
                </label>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                  {...register('condition')}
                >
                  <option value='new'>New</option>
                  <option value='used'>Used</option>
                  <option value='refurbished'>Refurbished</option>
                </select>
              </div>

              <div>
                <Input
                  label='Phone Number'
                  type='tel'
                  placeholder='Your contact number'
                  error={errors.phoneNumber?.message}
                  {...register('phoneNumber', {
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
            </div>
          </div>

          {/* Images */}
          <div className='bg-white rounded-lg shadow-soft p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
              <Upload className='h-5 w-5' />
              Product Images
            </h2>
            
            <div className='space-y-4'>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                <input
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='hidden'
                  id='image-upload'
                />
                <label
                  htmlFor='image-upload'
                  className='cursor-pointer flex flex-col items-center gap-2'
                >
                  <Upload className='h-12 w-12 text-gray-400' />
                  <p className='text-gray-600'>
                    Click to upload images or drag and drop
                  </p>
                  <p className='text-sm text-gray-500'>
                    PNG, JPG up to 5MB each (max 10 images)
                  </p>
                </label>
              </div>

              {images.length > 0 && (
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {images.map((image) => (
                    <div key={image.id} className='relative'>
                      <img
                        src={image.preview}
                        alt='Preview'
                        className='w-full h-24 object-cover rounded-lg'
                      />
                      <button
                        type='button'
                        onClick={() => removeImage(image.id)}
                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className='bg-white rounded-lg shadow-soft p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
              <MapPin className='h-5 w-5' />
              Location
            </h2>
            
            <div className='space-y-6'>
              {/* Smart Location Input */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Location <span className='text-red-500'>*</span>
                </label>
                <LocationInput
                  value={locationData}
                  onChange={setLocationData}
                  placeholder="Search for your location or enter address..."
                  showCurrentLocation={true}
                  required={true}
                />
                <p className='text-sm text-gray-500 mt-2'>
                  Enter your location to help buyers find products near them
                </p>
              </div>

              {/* Fallback Manual Input */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <Input
                    label='City (fallback)'
                    placeholder='Enter city'
                    error={errors.city?.message}
                    {...register('city', {
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

                <div>
                  <Input
                    label='Area (fallback)'
                    placeholder='Enter area (optional)'
                    {...register('area', {
                      maxLength: {
                        value: 50,
                        message: 'Area must be less than 50 characters'
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9\s\-_.,]+$/,
                        message: 'Area contains invalid characters'
                      }
                    })}
                  />
                </div>

                <div>
                  <Input
                    label='Address (fallback)'
                    placeholder='Enter address (optional)'
                    {...register('address', {
                      maxLength: {
                        value: 200,
                        message: 'Address must be less than 200 characters'
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9\s\-_.,#/]+$/,
                        message: 'Address contains invalid characters'
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className='bg-white rounded-lg shadow-soft p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
              <Tag className='h-5 w-5' />
              Additional Options
            </h2>
            
            <div className='space-y-4'>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='negotiable'
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                  {...register('negotiable')}
                />
                <label htmlFor='negotiable' className='ml-2 text-sm text-gray-900'>
                  Price is negotiable
                </label>
              </div>

              <div>
                <Input
                  label='Tags (optional)'
                  placeholder='Enter tags separated by commas'
                  {...register('tags')}
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Help buyers find your product with relevant tags
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate('/products')}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;
