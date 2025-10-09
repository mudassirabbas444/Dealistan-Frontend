import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import productService from '../../services/product';
import { formatCurrency } from '../../utils';
import { Edit, Trash2, Eye, CheckCircle, XCircle, Archive } from 'lucide-react';
import FirebaseImage from '../../components/FirebaseImage';

const MyProductsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['my-products'],
    queryFn: async () => {
      const response = await productService.getProductsBySeller(user?.id);
      return response.data?.products || [];
    },
    enabled: !!user
  });

  if (!isAuthenticated) {
    return (
      <div className='container-custom section-padding'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>My Products</h1>
          <p className='text-gray-600 mb-8'>Please login to manage your products</p>
        </div>
      </div>
    );
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setIsProcessing(true);
    try {
      const resp = await productService.deleteProduct(productId);
      if (resp.success) {
        await refetch();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkSold = async (productId) => {
    setIsProcessing(true);
    try {
      const resp = await productService.markAsSold(productId);
      if (resp.success) {
        await refetch();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='container-custom section-padding'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>My Products</h1>
          <p className='text-gray-600'>Manage, edit, and update your listings</p>
        </div>
        <Link to='/products/create'>
          <Button>Create New</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-12'>
          <LoadingSpinner size='lg' />
        </div>
      ) : error ? (
        <div className='text-center py-12'>
          <p className='text-red-600 mb-4'>Error loading products</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      ) : !Array.isArray(products) || products.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-600 mb-4'>You have not created any products yet</p>
          <Link to='/products/create'>
            <Button>Create First Product</Button>
          </Link>
        </div>
      ) : (
        <div className='overflow-x-auto bg-white rounded-lg shadow-soft'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Product</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Price</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Views</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0'>
                        {product.images?.[0]?.url ? (
                          <FirebaseImage 
                            src={product.images[0].url} 
                            alt={product.title} 
                            className='w-full h-full object-cover' 
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-gray-400 text-xs'>📷</div>
                        )}
                      </div>
                      <div>
                        <div className='font-medium text-gray-900'>{product.title}</div>
                        <div className='text-sm text-gray-500'>{product.category?.name || '–'}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-gray-900'>{formatCurrency(product.price)}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-gray-900'>{product.views || 0}</td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : product.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : product.status === 'sold'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <div className='flex items-center justify-end gap-2'>
                      <Button size='sm' variant='outline' onClick={() => navigate(`/products/${product._id}`)}>
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button size='sm' variant='outline' onClick={() => navigate(`/products/${product._id}/edit`)}>
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button size='sm' variant='outline' onClick={() => handleMarkSold(product._id)} disabled={isProcessing || product.status === 'sold'}>
                        <Archive className='h-4 w-4' />
                      </Button>
                      <Button size='sm' variant='danger' onClick={() => handleDelete(product._id)} disabled={isProcessing}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyProductsPage;


