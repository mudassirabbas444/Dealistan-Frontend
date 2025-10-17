import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const useLocation = () => {
  const [location, setLocation] = useState({
    coordinates: null,
    address: null,
    loading: false,
    error: null,
    permission: null
  });

  const [watchId, setWatchId] = useState(null);

  // Get user's current position
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        setLocation(prev => ({
          ...prev,
          coordinates,
          loading: false,
          error: null,
          permission: 'granted'
        }));

        // Automatically get address from coordinates
        getAddressFromCoordinates(coordinates.latitude, coordinates.longitude);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        let permission = 'denied';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            permission = 'denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            permission = 'unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            permission = 'timeout';
            break;
          default:
            errorMessage = 'An unknown error occurred';
            permission = 'error';
            break;
        }

        setLocation(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
          permission
        }));

        console.error('Geolocation error:', error);
      },
      options
    );
  }, []);

  // Get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = useCallback(async (latitude, longitude) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();

      if (data && data.display_name) {
        const address = {
          full: data.display_name,
          city: data.address?.city || data.address?.town || data.address?.village || data.address?.county,
          area: data.address?.suburb || data.address?.neighbourhood || data.address?.district,
          state: data.address?.state,
          country: data.address?.country,
          postcode: data.address?.postcode,
          houseNumber: data.address?.house_number,
          road: data.address?.road
        };

        setLocation(prev => ({
          ...prev,
          address,
          error: null
        }));
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setLocation(prev => ({
        ...prev,
        error: 'Failed to get address information'
      }));
    }
  }, []);

  // Start watching location changes
  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        // Update state and determine if we should refresh the address based on previous coordinates
        setLocation(prev => {
          const previousCoordinates = prev.coordinates;
          const next = {
            ...prev,
            coordinates,
            error: null,
            permission: 'granted'
          };

          if (previousCoordinates) {
            const distance = calculateDistance(
              previousCoordinates.latitude,
              previousCoordinates.longitude,
              coordinates.latitude,
              coordinates.longitude
            );

            // Only update address if moved more than 100 meters
            if (distance > 100) {
              getAddressFromCoordinates(coordinates.latitude, coordinates.longitude);
            }
          } else {
            getAddressFromCoordinates(coordinates.latitude, coordinates.longitude);
          }

          return next;
        });
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      options
    );

    setWatchId(id);
  }, [getAddressFromCoordinates]);

  // Stop watching location changes
  const stopWatchingLocation = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Calculate distance between two coordinates (in meters)
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

    return R * c;
  };

  // Request location permission
  const requestLocationPermission = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    getCurrentLocation();
  }, [getCurrentLocation]);

  // Clear location data
  const clearLocation = useCallback(() => {
    setLocation({
      coordinates: null,
      address: null,
      loading: false,
      error: null,
      permission: null
    });
    stopWatchingLocation();
  }, [stopWatchingLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatchingLocation();
    };
  }, [stopWatchingLocation]);

  return {
    location,
    getCurrentLocation,
    requestLocationPermission,
    startWatchingLocation,
    stopWatchingLocation,
    clearLocation,
    getAddressFromCoordinates
  };
};

export default useLocation;
