import React, { useState } from 'react';
import { Image, AlertCircle } from 'lucide-react';

/**
 * Firebase Image Component with error handling and loading states
 */
const FirebaseImage = ({ 
  src, 
  alt = 'Image', 
  className = '', 
  fallbackIcon = null,
  onError = null,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError();
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    // Force reload by adding timestamp
    setImageSrc(`${src}?t=${Date.now()}`);
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className='text-center p-4'>
          {fallbackIcon || (
            <AlertCircle className='h-8 w-8 text-gray-400 mx-auto mb-2' />
          )}
          <p className='text-sm text-gray-500 mb-2'>Failed to load image</p>
          <button
            onClick={handleRetry}
            className='text-xs text-primary-600 hover:text-primary-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
          <div className='w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin' />
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
};

export default FirebaseImage;
