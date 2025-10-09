import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle,
  Eye,
  Shield,
  CheckCircle,
  Star
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useFavoriteStatus, useToggleFavorite } from '../../hooks/useFavorites';
import productService from '../../services/product';
import messageService from '../../services/message';
import { formatCurrency, formatRelativeTime } from '../../utils';
import toast from 'react-hot-toast';
import FirebaseImage from '../../components/FirebaseImage';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isMessaging, setIsMessaging] = useState(false);
  
  // Favorite functionality
  const { data: favoriteStatus } = useFavoriteStatus(id);
  const toggleFavorite = useToggleFavorite();

  // Fetch product details
  const {
    data: product,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productService.getProductById(id);
      return response.product;
    },
    enabled: !!id
  });

  // Increment view count when product loads
  React.useEffect(() => {
    if (product && user) {
      // You can add a view increment API call here
    }
  }, [product, user]);

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user || !product) return;

    if (user.id === product.seller._id || user.id === product.seller) {
      toast.error('You cannot message yourself');
      return;
    }

    setIsMessaging(true);
    try {
      // Ensure conversation exists by sending a lightweight initial message
      const response = await messageService.sendMessage({
        receiver: product.seller._id || product.seller,
        product: product._id,
        content: `Hi! I'm interested in your product "${product.title}". Is it still available?`
      });

      // Navigate to messages page targeting the seller
      if (response.success) {
        const sellerId = product.seller._id || product.seller;
        navigate(`/messages?user=${sellerId}`);
      } else {
        toast.error(response.message || 'Failed to initiate chat');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      console.error('Error sending message:', error);
    } finally {
      setIsMessaging(false);
    }
  };

  const handleFavoriteClick = () => {
    if (isAuthenticated) {
      toggleFavorite.mutate(id);
    } else {
      navigate('/login');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className='container-custom section-padding'>
        <div className='flex justify-center py-12'>
          <LoadingSpinner size='lg' />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className='container-custom section-padding'>
        <div className='text-center py-12'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Product Not Found</h1>
          <p className='text-gray-600 mb-8'>The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className='h-5 w-5 mr-2' />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const seller = product.seller;
  const isOwner = user && (user.id === seller._id || user.id === seller);

  return (
    <div className='container-custom section-padding'>
      <div className='max-w-7xl mx-auto'>
        {/* Back Button */}
        <Button
          variant='outline'
          onClick={() => navigate(-1)}
          className='mb-6'
        >
          <ArrowLeft className='h-5 w-5 mr-2' />
          Back
        </Button>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Product Images */}
          <div className='lg:col-span-2'>
            <div className='card card-hover overflow-hidden'>
              {product.images && product.images.length > 0 ? (
                <div className='space-y-4'>
                  {/* Main Image */}
                  <div className='aspect-[4/3] bg-gray-100 overflow-hidden max-h-96 mx-auto'>
                    <FirebaseImage
                      src={product.images[selectedImage]?.url}
                      alt={product.title}
                      className='w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-105'
                    />
                  </div>
                  
                  {/* Thumbnail Images */}
                  {product.images.length > 1 && (
                    <div className='flex gap-2 overflow-x-auto pb-2 custom-scrollbar'>
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 focus-ring ${
                            selectedImage === index
                              ? 'border-transparent ring-2 ring-primary-500'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <FirebaseImage
                            src={image.url}
                            alt={`${product.title} ${index + 1}`}
                            className='w-full h-full object-cover'
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className='aspect-[4/3] bg-gray-100 flex items-center justify-center max-h-96 mx-auto'>
                  <div className='text-center text-gray-400'>
                    <div className='text-6xl mb-4'>📷</div>
                    <p>No images available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className='space-y-6 lg:sticky lg:top-24 h-fit'>
            {/* Header */}
            <div className='card p-6 card-hover'>
              <div className='flex items-start justify-between mb-4'>
                <h1 className='text-2xl font-bold text-gray-900 flex-1 mr-4'>
                  {product.title}
        </h1>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleShare}
                  >
                    <Share2 className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={favoriteStatus?.isFavorite ? 'primary' : 'outline'}
                    size='sm'
                    onClick={handleFavoriteClick}
                  >
                    <Heart className={`h-4 w-4 ${favoriteStatus?.isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              <div className='flex items-center gap-4 text-sm text-gray-500 mb-4'>
                <div className='flex items-center gap-1'>
                  <Eye className='h-4 w-4' />
                  {product.views || 0} views
                </div>
                <div className='flex items-center gap-1'>
                  <Clock className='h-4 w-4' />
                  {formatRelativeTime(product.postedAt)}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  product.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : product.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </span>
              </div>

              <div className='text-3xl font-bold text-primary-600 mb-4'>
                {formatCurrency(product.price)}
                {product.negotiable && (
                  <span className='text-sm font-normal text-gray-500 ml-2'>
                    (Negotiable)
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              {!isOwner && (
                <div className='space-y-3'>
                  <Button
                    size='lg'
                    onClick={handleContactSeller}
                    loading={isMessaging}
                    disabled={isMessaging}
                    className='w-full'
                  >
                    <MessageCircle className='h-5 w-5 mr-2' />
                    Contact Seller
                  </Button>
                  <Button
                    variant='outline'
                    size='lg'
                    className='w-full'
                  >
                    <Phone className='h-5 w-5 mr-2' />
                    {product.phoneNumber}
                  </Button>
                </div>
              )}

              {isOwner && (
                <div className='space-y-3'>
                  <Button
                    size='lg'
                    onClick={() => navigate(`/products/${product._id}/edit`)}
                    className='w-full'
                  >
                    Edit Product
                  </Button>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className='card p-6 card-hover'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Seller Information</h3>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center'>
                  <span className='text-primary-600 font-semibold text-lg'>
                    {seller.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className='flex-1'>
                  <h4 className='font-medium text-gray-900'>{seller.name}</h4>
                  <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span>Verified Seller</span>
                  </div>
                </div>
              </div>
              {seller.city && (
                <div className='flex items-center gap-2 text-sm text-gray-500 mt-3'>
                  <MapPin className='h-4 w-4' />
                  {seller.city}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className='mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-6'>
            {/* Description */}
            <div className='card p-6 card-hover'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Description</h3>
              <div className='prose max-w-none'>
                <p className='text-gray-600 whitespace-pre-wrap'>{product.description}</p>
              </div>
            </div>

            {/* Product Details */}
            <div className='card p-6 card-hover'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Product Details</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-gray-500'>Condition</span>
                  <p className='font-medium capitalize'>{product.condition}</p>
                </div>
                <div>
                  <span className='text-sm text-gray-500'>Category</span>
                  <p className='font-medium'>{product.category?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className='text-sm text-gray-500'>Posted</span>
                  <p className='font-medium'>{formatRelativeTime(product.postedAt)}</p>
                </div>
                <div>
                  <span className='text-sm text-gray-500'>Views</span>
                  <p className='font-medium'>{product.views || 0}</p>
                </div>
              </div>
              {product.tags && product.tags.length > 0 && (
                <div className='mt-4'>
                  <span className='text-sm text-gray-500'>Tags</span>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='space-y-6'>
            {/* Location */}
            {product.location && (
              <div className='card p-6 card-hover'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Location</h3>
                <div className='flex items-center gap-2 text-gray-600'>
                  <MapPin className='h-5 w-5 text-primary-600' />
                  <div>
                    {product.location.address && (
                      <p>{product.location.address}</p>
                    )}
                    {product.location.area && (
                      <p>{product.location.area}</p>
                    )}
                    {product.location.city && (
                      <p className='font-medium'>{product.location.city}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Safety Tips */}
            <div className='bg-blue-50 rounded-lg p-6 card-hover'>
              <h3 className='text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Safety Tips
              </h3>
              <ul className='text-sm text-blue-800 space-y-2'>
                <li>• Meet in a public place</li>
                <li>• Inspect the item before payment</li>
                <li>• Don't send money in advance</li>
                <li>• Trust your instincts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
