// Location service for geocoding and location-related operations
class LocationService {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org';
  }

  // Get coordinates from address (forward geocoding)
  async getCoordinatesFromAddress(address) {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch coordinates');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: {
            full: result.display_name,
            city: result.address?.city || result.address?.town || result.address?.village || result.address?.county,
            area: result.address?.suburb || result.address?.neighbourhood || result.address?.district,
            state: result.address?.state,
            country: result.address?.country,
            postcode: result.address?.postcode,
            houseNumber: result.address?.house_number,
            road: result.address?.road
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      throw error;
    }
  }

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoordinates(latitude, longitude) {
    try {
      const response = await fetch(
        `${this.baseUrl}/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();

      if (data && data.display_name) {
        return {
          full: data.display_name,
          city: data.address?.city || data.address?.town || data.address?.village || data.address?.county,
          area: data.address?.suburb || data.address?.neighbourhood || data.address?.district,
          state: data.address?.state,
          country: data.address?.country,
          postcode: data.address?.postcode,
          houseNumber: data.address?.house_number,
          road: data.address?.road
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      throw error;
    }
  }

  // Search for locations (autocomplete)
  async searchLocations(query, limit = 5) {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1&countrycodes=us,ca,gb,au,in`
      );

      if (!response.ok) {
        throw new Error('Failed to search locations');
      }

      const data = await response.json();

      return data.map(result => ({
        display_name: result.display_name,
        address: {
          city: result.address?.city || result.address?.town || result.address?.village || result.address?.county,
          area: result.address?.suburb || result.address?.neighbourhood || result.address?.district,
          state: result.address?.state,
          country: result.address?.country,
          postcode: result.address?.postcode,
        },
        coordinates: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        }
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  }

  // Calculate distance between two coordinates (in meters)
  calculateDistance(lat1, lon1, lat2, lon2) {
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
  }

  // Format distance for display
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }

  // Validate coordinates
  isValidCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }
}

export default new LocationService();
