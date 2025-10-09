import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, DollarSign, Tag, MapPin } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import productService from '../../services/product';
import categoryService from '../../services/category';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm();

  // Fetch categories (for select)
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryService.getCategories({ parentCategory: 'null', isActive: true, limit: 100 });
      return response.data?.categories || [];
    }
  });

  // Fetch product to edit
  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productService.getProductById(id);
      return response.product || response.data?.product || null;
    },
    enabled: !!id
  });

  // Prefill form when product loads
  useEffect(() => {
    if (productData) {
      setValue('title', productData.title || '');
      setValue('description', productData.description || '');
      setValue('price', productData.price || 0);
      setValue('category', productData.category?._id || productData.category || '');
      setValue('condition', productData.condition || 'used');
      setValue('phoneNumber', productData.phoneNumber || '');
      setValue('negotiable', !!productData.negotiable);
      setValue('tags', Array.isArray(productData.tags) ? productData.tags.join(', ') : (productData.tags || ''));
      setValue('city', productData.location?.city || '');
      setValue('area', productData.location?.area || '');
      setValue('address', productData.location?.address || '');
    }
  }, [productData, setValue]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        condition: data.condition,
        phoneNumber: data.phoneNumber,
        negotiable: !!data.negotiable,
        tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        location: {
          city: data.city,
          area: data.area || '',
          address: data.address || ''
        }
      };

      const response = await productService.updateProduct(id, payload);
      if (response.success) {
        toast.success('Product updated successfully!');
        navigate('/my-products');
      } else {
        toast.error(response.message || 'Failed to update product');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Error updating product:', err);
    }
  };

  if (!user) {
    return (
      <div className='container-custom section-padding'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Edit Product</h1>
          <p className='text-gray-600 mb-8'>Please login to continue</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='container-custom section-padding'>
        <div className='flex justify-center py-12'>
          <LoadingSpinner size='lg' />
        </div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className='container-custom section-padding'>
        <div className='text-center py-12'>
          <p className='text-red-600 mb-4'>Failed to load product</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container-custom section-padding'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Edit Product</h1>
          <p className='text-gray-600'>Update your listing details</p>
        </div>

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
                    maxLength: { value: 100, message: 'Title must be less than 100 characters' }
                  })}
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Description</label>
                <textarea
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                  rows={4}
                  placeholder='Describe your product in detail'
                  {...register('description', {
                    required: 'Description is required',
                    maxLength: { value: 2000, message: 'Description must be less than 2000 characters' }
                  })}
                />
                {errors.description && (
                  <p className='text-sm text-red-600 mt-1'>{errors.description.message}</p>
                )}
              </div>

              <div>
                <Input
                  label='Price'
                  type='number'
                  placeholder='0.00'
                  leftIcon={<DollarSign className='h-5 w-5 text-gray-400' />}
                  error={errors.price?.message}
                  {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be greater than 0' } })}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Category</label>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                  {...register('category', { required: 'Category is required' })}
                >
                  <option value=''>Select a category</option>
                  {Array.isArray(categories) && categories.map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className='text-sm text-red-600 mt-1'>{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Condition</label>
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
                  {...register('phoneNumber', { required: 'Phone number is required' })}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className='bg-white rounded-lg shadow-soft p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
              <MapPin className='h-5 w-5' />
              Location
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div>
                <Input label='City' placeholder='Enter city' error={errors.city?.message} {...register('city', { required: 'City is required' })} />
              </div>
              <div>
                <Input label='Area' placeholder='Enter area (optional)' {...register('area')} />
              </div>
              <div>
                <Input label='Address' placeholder='Enter address (optional)' {...register('address')} />
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
                <input type='checkbox' id='negotiable' className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded' {...register('negotiable')} />
                <label htmlFor='negotiable' className='ml-2 text-sm text-gray-900'>Price is negotiable</label>
              </div>
              <div>
                <Input label='Tags (optional)' placeholder='Enter tags separated by commas' {...register('tags')} />
                <p className='text-sm text-gray-500 mt-1'>Help buyers find your product with relevant tags</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end gap-4'>
            <Button type='button' variant='outline' onClick={() => navigate('/my-products')}>Cancel</Button>
            <Button type='submit'>Update Product</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;


