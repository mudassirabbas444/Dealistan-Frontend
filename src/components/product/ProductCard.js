import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFavoriteStatus, useToggleFavorite } from '../../hooks/useFavorites';
import { formatCurrency, formatRelativeTime } from '../../utils';
import FirebaseImage from '../FirebaseImage';
import { LocationDisplay } from '../location';

const ProductCard = ({ product, viewMode = 'grid', showFavoriteButton = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: favoriteStatus } = useFavoriteStatus(product?._id);
  const toggleFavorite = useToggleFavorite();

  const handleProductClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking favorite button
    if (user) {
      toggleFavorite.mutate(product._id);
    } else {
      navigate('/login');
    }
  };

  const isFavorite = favoriteStatus?.isFavorite || false;
  const isLoggedIn = !!user;

  if (viewMode === 'list') {
    return (
      <div
        className='bg-white rounded-lg shadow-soft p-4 hover:shadow-medium transition-shadow cursor-pointer'
        onClick={handleProductClick}
      >
        <div className='flex gap-4'>
          <div className='w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative'>
            {product.images?.[0]?.url ? (
              <FirebaseImage
                src={product.images[0].url}
                alt={product.title}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-gray-400 text-xs'>
                No Image
              </div>
            )}
            {showFavoriteButton && (
              <button
                onClick={handleFavoriteClick}
                className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-3 w-3 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='text-lg font-semibold text-gray-900 mb-1 truncate'>
              {product.title}
            </h3>
            <p className='text-gray-600 text-sm mb-2 line-clamp-2'>
              {product.description}
            </p>
        <div className='flex items-center gap-2 text-xs text-gray-500 mb-2'>
          {product.location?.city && (
            <div className='flex items-center gap-1'>
              <MapPin className='h-3 w-3' />
              {product.location.city}
            </div>
          )}
          <div className='flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            {formatRelativeTime(product.postedAt)}
          </div>
        </div>
        {product.location && (
          <div className='mb-2'>
            <LocationDisplay 
              productLocation={product.location}
              showDistance={true}
              showUserLocation={false}
              compact={true}
              className="text-xs"
            />
          </div>
        )}
            <div className='flex justify-between items-center'>
              <span className='text-xl font-bold text-primary-600'>
                {formatCurrency(product.price)}
              </span>
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
      </div>
    );
  }

  return (
    <div
      className='bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-medium transition-shadow cursor-pointer relative'
      onClick={handleProductClick}
    >
      <div className='h-40 bg-gray-200 overflow-hidden relative'>
        {product.images?.[0]?.url ? (
          <FirebaseImage
            src={product.images[0].url}
            alt={product.title}
            className='w-full h-full object-cover hover:scale-105 transition-transform'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-gray-400'>
            No Image
          </div>
        )}
        {showFavoriteButton && (
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
      <div className='p-4'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
          {product.title}
        </h3>
        <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
          {product.description}
        </p>
        <div className='flex items-center gap-2 text-xs text-gray-500 mb-3'>
          {product.location?.city && (
            <div className='flex items-center gap-1'>
              <MapPin className='h-3 w-3' />
              {product.location.city}
            </div>
          )}
          <div className='flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            {formatRelativeTime(product.postedAt)}
          </div>
        </div>
        {product.location && (
          <div className='mb-3'>
            <LocationDisplay 
              productLocation={product.location}
              showDistance={true}
              showUserLocation={false}
              compact={true}
              className="text-xs"
            />
          </div>
        )}
        <div className='flex justify-between items-center'>
          <span className='text-xl font-bold text-primary-600'>
            {formatCurrency(product.price)}
          </span>
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
  );
};

export default ProductCard;
