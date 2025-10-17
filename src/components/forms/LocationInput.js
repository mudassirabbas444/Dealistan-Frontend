import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Navigation } from 'lucide-react';
import { Button, Input } from '../ui';
import locationService from '../../services/location';
import useLocation from '../../hooks/useLocation';
import toast from 'react-hot-toast';

const LocationInput = ({ 
  value = {}, 
  onChange, 
  placeholder = "Enter location...",
  showCurrentLocation = true,
  className = "",
  required = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  const { location, requestLocationPermission } = useLocation();
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize search query from value
  useEffect(() => {
    if (value?.address?.full) {
      setSearchQuery(value.address.full);
    } else if (value?.city) {
      setSearchQuery(value.city);
    }
  }, [value]);

  // Search for locations with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await locationService.searchLocations(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching locations:', error);
        toast.error('Failed to search locations');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion) => {
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    
    const locationData = {
      city: suggestion.address.city,
      area: suggestion.address.area,
      address: suggestion.display_name,
      coordinates: suggestion.coordinates
    };

    onChange(locationData);
  };

  // Handle manual address input
  const handleAddressSubmit = async () => {
    if (!searchQuery.trim()) return;

    setIsGeocoding(true);
    try {
      const result = await locationService.getCoordinatesFromAddress(searchQuery);
      
      if (result) {
        const locationData = {
          city: result.address.city,
          area: result.address.area,
          address: result.address.full,
          coordinates: {
            latitude: result.latitude,
            longitude: result.longitude
          }
        };
        onChange(locationData);
        toast.success('Location updated successfully');
      } else {
        toast.error('Location not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast.error('Failed to get location details');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle current location
  const handleCurrentLocation = async () => {
    if (!location.coordinates) {
      await requestLocationPermission();
      return;
    }

    setIsGeocoding(true);
    try {
      const address = await locationService.getAddressFromCoordinates(
        location.coordinates.latitude,
        location.coordinates.longitude
      );

      if (address) {
        const locationData = {
          city: address.city,
          area: address.area,
          address: address.full,
          coordinates: {
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude
          }
        };
        
        setSearchQuery(address.full);
        onChange(locationData);
        toast.success('Current location set successfully');
      }
    } catch (error) {
      console.error('Error getting current location address:', error);
      toast.error('Failed to get current location address');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Clear location
  const clearLocation = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onChange({});
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddressSubmit();
              }
            }}
            leftIcon={<MapPin className="h-5 w-5 text-gray-400" />}
            rightIcon={
              searchQuery && (
                <button
                  onClick={clearLocation}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )
            }
            required={required}
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.display_name}
                      </p>
                      {suggestion.address.city && (
                        <p className="text-xs text-gray-500 mt-1">
                          {suggestion.address.city}
                          {suggestion.address.state && `, ${suggestion.address.state}`}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Loading indicator */}
          {(isSearching || isGeocoding) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>

        {/* Current Location Button */}
        {showCurrentLocation && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCurrentLocation}
            disabled={isGeocoding}
            className="px-3"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected Location Display */}
      {value?.address && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Selected Location
              </p>
              <p className="text-sm text-green-700 mt-1">
                {value.address}
              </p>
              {value.coordinates && (
                <p className="text-xs text-green-600 mt-1">
                  Coordinates: {value.coordinates.latitude.toFixed(6)}, {value.coordinates.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInput;
