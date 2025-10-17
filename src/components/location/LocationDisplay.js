import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui';
import useLocation from '../../hooks/useLocation';
import toast from 'react-hot-toast';

const LocationDisplay = ({ 
  productLocation, 
  showDistance = true, 
  showUserLocation = true,
  className = '',
  compact = false 
}) => {
  const { location, requestLocationPermission, getCurrentLocation } = useLocation();
  const [distance, setDistance] = useState(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // Calculate distance between user location and product location
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Format distance for display
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

  // Calculate distance when both locations are available
  useEffect(() => {
    if (showDistance && location.coordinates && productLocation?.coordinates) {
      setIsCalculatingDistance(true);
      
      const dist = calculateDistance(
        location.coordinates.latitude,
        location.coordinates.longitude,
        productLocation.coordinates.latitude,
        productLocation.coordinates.longitude
      );
      
      setDistance(dist);
      setIsCalculatingDistance(false);
    }
  }, [location.coordinates, productLocation?.coordinates, showDistance]);

  const handleGetLocation = () => {
    requestLocationPermission();
  };

  const handleRefreshLocation = () => {
    getCurrentLocation();
  };

  // Show permission request if location is not available
  if (showUserLocation && !location.coordinates && !location.loading && !location.error) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium">
              Show your location to see distance from this product
            </p>
            <p className="text-xs text-blue-600 mt-1">
              We'll use this to calculate how far you are from the seller
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGetLocation}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Navigation className="h-4 w-4 mr-1" />
            Get Location
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (location.loading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-gray-600 animate-spin" />
          <div className="flex-1">
            <p className="text-sm text-gray-700">Getting your location...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (location.error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Location Error</p>
            <p className="text-xs text-red-600 mt-1">{location.error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGetLocation}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Main location display
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="space-y-3">
        {/* Product Location */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Product Location</p>
            <div className="text-sm text-gray-600 mt-1">
              {productLocation?.address && (
                <p>{productLocation.address}</p>
              )}
              {productLocation?.area && (
                <p>{productLocation.area}</p>
              )}
              {productLocation?.city && (
                <p className="font-medium">{productLocation.city}</p>
              )}
            </div>
          </div>
        </div>

        {/* User Location & Distance */}
        {showUserLocation && location.coordinates && (
          <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
            <Navigation className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900">Your Location</p>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              
              {location.address && (
                <div className="text-sm text-gray-600 mb-2">
                  {location.address.area && <p>{location.address.area}</p>}
                  {location.address.city && <p className="font-medium">{location.address.city}</p>}
                </div>
              )}

              {/* Distance Display */}
              {showDistance && (
                <div className="flex items-center gap-2">
                  {isCalculatingDistance ? (
                    <div className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin text-gray-500" />
                      <span className="text-xs text-gray-500">Calculating...</span>
                    </div>
                  ) : distance !== null ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-primary-600">
                        {formatDistance(distance)} away
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRefreshLocation}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">Distance unavailable</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compact mode - show only distance */}
        {compact && showDistance && distance !== null && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <Navigation className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-600">
              {formatDistance(distance)} away
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDisplay;
