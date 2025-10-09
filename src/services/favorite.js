import apiService from './api';
import { API_ENDPOINTS } from '../constants';

class FavoriteService {
  // Add product to favorites
  async addToFavorites(productId) {
    try {
      const response = await apiService.post(
        `/favorites/add/${productId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Remove product from favorites
  async removeFromFavorites(productId) {
    try {
      const response = await apiService.delete(
        `/favorites/remove/${productId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Toggle favorite status
  async toggleFavorite(productId) {
    try {
      const response = await apiService.patch(
        `/favorites/toggle/${productId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user's favorite products
  async getFavorites(params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const endpoint = queryString
        ? `/favorites?${queryString}`
        : '/favorites';

      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get recent favorites
  async getRecentFavorites(limit = 10) {
    try {
      const response = await apiService.get(
        `/favorites/recent?limit=${limit}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get favorites count
  async getFavoritesCount() {
    try {
      const response = await apiService.get('/favorites/count');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Check if product is in favorites
  async isProductInFavorites(productId) {
    try {
      const response = await apiService.get(
        `/favorites/check/${productId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Check multiple products' favorite status
  async getMultipleProductsFavoriteStatus(productIds) {
    try {
      const response = await apiService.post(
        '/favorites/check-multiple',
        { productIds }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Clear all favorites
  async clearAllFavorites() {
    try {
      const response = await apiService.delete('/favorites/clear');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Helper method to build query string
  buildQueryString(params) {
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(key, item));
        } else {
          searchParams.append(key, value);
        }
      }
    });

    return searchParams.toString();
  }
}

// Create and export favorite service instance
const favoriteService = new FavoriteService();
export default favoriteService;
