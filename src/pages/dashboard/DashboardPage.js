import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  Eye, 
  MessageCircle, 
  Heart, 
  Plus, 
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useFavoritesCount } from '../../hooks/useFavorites';
import productService from '../../services/product';
import messageService from '../../services/message';
import { formatCurrency, formatRelativeTime } from '../../utils';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();

  // Fetch user's products
  const {
    data: userProducts,
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['user-products'],
    queryFn: async () => {
      const response = await productService.getProductsBySeller(user?.id);
      return response.data?.products || [];
    },
    enabled: !!user
  });

  // Fetch user's messages
  const {
    data: userMessages,
    isLoading: messagesLoading,
    error: messagesError
  } = useQuery({
    queryKey: ['user-messages'],
    queryFn: async () => {
      const response = await messageService.getConversations();
      const raw = response?.data?.conversations || response.data?.data?.conversations || [];
      // Normalize to a consistent shape used by MessagesPage
      return raw.map((c) => ({
        otherUser: c?.otherUser || { _id: c?._id, name: c?.otherUser?.name || 'User' },
        product: c?.lastMessage?.product || c.productInfo?.[0] || null,
        latestMessage: c.lastMessage,
        unreadCount: c.unreadCount || 0,
      }));
    },
    enabled: !!user
  });

  // Fetch user's favorites count
  const {
    data: favoritesCount,
    isLoading: favoritesLoading,
    error: favoritesError
  } = useFavoritesCount();

  if (!isAuthenticated) {
    return (
      <div className='container-custom section-padding'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Dashboard</h1>
          <p className='text-gray-600 mb-8'>Please login to access your dashboard</p>
        </div>
      </div>
    );
  }

  const isLoading = productsLoading || messagesLoading || favoritesLoading;
  const hasError = productsError || messagesError || favoritesError;

  // Calculate stats
  const productsArray = Array.isArray(userProducts) ? userProducts : [];
  const messagesArray = Array.isArray(userMessages) ? userMessages : [];
  
  const totalProducts = productsArray.length;
  const activeProducts = productsArray.filter(p => p.status === 'approved').length;
  const pendingProducts = productsArray.filter(p => p.status === 'pending').length;
  const soldProducts = productsArray.filter(p => p.status === 'sold').length;
  const totalViews = productsArray.reduce((sum, p) => sum + (p.views || 0), 0);
  const recentProducts = productsArray.slice(0, 5);
  const recentMessages = messagesArray.slice(0, 5);

  if (isLoading) {
    return (
      <div className='container-custom section-padding'>
        <div className='flex justify-center py-12'>
          <LoadingSpinner size='lg' />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className='container-custom section-padding'>
        <div className='text-center py-12'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Error Loading Dashboard</h1>
          <p className='text-gray-600 mb-8'>Something went wrong while loading your dashboard data.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container-custom section-padding'>
      {/* Header */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Welcome back, {user?.name}!
          </h1>
          <p className='text-gray-600'>
            Here's an overview of your account and activities
          </p>
        </div>
        <Link to='/products/create'>
          <Button className='mt-4 md:mt-0'>
            <Plus className='h-5 w-5 mr-2' />
            Sell New Item
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-lg shadow-soft p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Products</p>
              <p className='text-2xl font-bold text-gray-900'>{totalProducts}</p>
            </div>
            <div className='p-3 bg-primary-100 rounded-lg'>
              <Package className='h-6 w-6 text-primary-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-soft p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Active Products</p>
              <p className='text-2xl font-bold text-gray-900'>{activeProducts}</p>
            </div>
            <div className='p-3 bg-green-100 rounded-lg'>
              <CheckCircle className='h-6 w-6 text-green-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-soft p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Views</p>
              <p className='text-2xl font-bold text-gray-900'>{totalViews}</p>
            </div>
            <div className='p-3 bg-blue-100 rounded-lg'>
              <Eye className='h-6 w-6 text-blue-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-soft p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Favorites</p>
              <p className='text-2xl font-bold text-gray-900'>{favoritesCount || 0}</p>
            </div>
            <div className='p-3 bg-red-100 rounded-lg'>
              <Heart className='h-6 w-6 text-red-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-white rounded-lg shadow-soft p-6 mb-8'>
        <h2 className='text-xl font-semibold text-gray-900 mb-6'>Quick Actions</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Link to='/products/create'>
            <div className='p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer'>
              <div className='flex items-center gap-3'>
                <Plus className='h-8 w-8 text-primary-600' />
                <div>
                  <h3 className='font-medium text-gray-900'>Sell Item</h3>
                  <p className='text-sm text-gray-600'>Create a new product listing</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to='/my-products'>
            <div className='p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer'>
              <div className='flex items-center gap-3'>
                <Package className='h-8 w-8 text-primary-600' />
                <div>
                  <h3 className='font-medium text-gray-900'>My Products</h3>
                  <p className='text-sm text-gray-600'>Manage your listings</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to='/favorites'>
            <div className='p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer'>
              <div className='flex items-center gap-3'>
                <Heart className='h-8 w-8 text-red-600' />
                <div>
                  <h3 className='font-medium text-gray-900'>Favorites</h3>
                  <p className='text-sm text-gray-600'>View your saved items</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to='/messages'>
            <div className='p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer'>
              <div className='flex items-center gap-3'>
                <MessageCircle className='h-8 w-8 text-primary-600' />
                <div>
                  <h3 className='font-medium text-gray-900'>Messages</h3>
                  <p className='text-sm text-gray-600'>View your conversations</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Recent Products */}
        <div className='bg-white rounded-lg shadow-soft p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Recent Products</h2>
            <Link to='/my-products'>
              <Button variant='outline' size='sm'>
                View All
              </Button>
            </Link>
          </div>

          {productsArray.length === 0 ? (
            <div className='text-center py-8'>
              <Package className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 mb-4'>No products yet</p>
              <Link to='/products/create'>
                <Button size='sm'>
                  <Plus className='h-4 w-4 mr-2' />
                  Create First Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className='space-y-4'>
              {recentProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className='block'
                >
                  <div className='flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
                    <div className='w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0'>
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center text-gray-400 text-xs'>
                          📷
                        </div>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-medium text-gray-900 truncate'>
                        {product.title}
                      </h3>
                      <div className='flex items-center gap-3 text-sm text-gray-500'>
                        <span>{formatCurrency(product.price)}</span>
                        <span>•</span>
                        <span>{product.views || 0} views</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className='bg-white rounded-lg shadow-soft p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Recent Messages</h2>
            <Link to='/messages'>
              <Button variant='outline' size='sm'>
                View All
              </Button>
            </Link>
          </div>

          {messagesArray.length === 0 ? (
            <div className='text-center py-8'>
              <MessageCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600 mb-4'>No messages yet</p>
              <p className='text-sm text-gray-500'>
                Start selling to receive messages from buyers
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {recentMessages.map((conversation) => (
                <Link
                  to={`/messages?user=${conversation.otherUser?._id}`}
                  key={conversation.otherUser?._id}
                >
                  <div className='flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
                    <div className='w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0'>
                      <span className='text-primary-600 font-semibold text-lg'>
                        {conversation.otherUser?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-medium text-gray-900 truncate'>
                        {conversation.otherUser?.name || 'Unknown User'}
                      </h3>
                      {conversation.product && (
                        <p className='text-xs text-gray-500 truncate'>
                          {conversation.product.title}
                        </p>
                      )}
                      <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {conversation.latestMessage?.content || ''}
                      </p>
                      <div className='flex items-center gap-2 text-xs text-gray-500 mt-1'>
                        <Clock className='h-3 w-3' />
                        {formatRelativeTime(conversation.latestMessage?.createdAt)}
                        {conversation.unreadCount > 0 && (
                          <>
                            <span>•</span>
                            <span className='text-primary-600 font-medium'>Unread</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Status Overview */}
      {totalProducts > 0 && (
        <div className='bg-white rounded-lg shadow-soft p-6 mt-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>Product Status Overview</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center p-4 bg-green-50 rounded-lg'>
              <CheckCircle className='h-8 w-8 text-green-600 mx-auto mb-2' />
              <p className='text-2xl font-bold text-green-600'>{activeProducts}</p>
              <p className='text-sm text-gray-600'>Active Products</p>
            </div>
            <div className='text-center p-4 bg-yellow-50 rounded-lg'>
              <Clock className='h-8 w-8 text-yellow-600 mx-auto mb-2' />
              <p className='text-2xl font-bold text-yellow-600'>{pendingProducts}</p>
              <p className='text-sm text-gray-600'>Pending Review</p>
            </div>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <TrendingUp className='h-8 w-8 text-gray-600 mx-auto mb-2' />
              <p className='text-2xl font-bold text-gray-600'>{soldProducts}</p>
              <p className='text-sm text-gray-600'>Sold Items</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
