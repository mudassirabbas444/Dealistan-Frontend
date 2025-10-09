import apiService from './api';
import { API_ENDPOINTS } from '../constants';

class ProductService {
  // Create product
  async createProduct(productData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.PRODUCTS.CREATE,
        productData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get all products
  async getProducts(params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const endpoint = queryString
        ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
        : API_ENDPOINTS.PRODUCTS.LIST;

      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get product by ID
  async getProductById(productId) {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.PRODUCTS.GET_BY_ID}?id=${productId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get products by seller
  async getProductsBySeller(sellerId, params = {}) {
    try {
      const queryString = this.buildQueryString({ sellerId, ...params });
      const response = await apiService.get(
        `${API_ENDPOINTS.PRODUCTS.GET_BY_SELLER}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Search products
  async searchProducts(searchParams) {
    try {
      const queryString = this.buildQueryString(searchParams);
      const response = await apiService.get(
        `${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update product
  async updateProduct(productId, updateData) {
    try {
      const response = await apiService.put(
        `${API_ENDPOINTS.PRODUCTS.UPDATE}?id=${productId}`,
        updateData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete product
  async deleteProduct(productId) {
    try {
      const response = await apiService.delete(
        `${API_ENDPOINTS.PRODUCTS.DELETE}?id=${productId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Mark product as sold
  async markAsSold(productId) {
    try {
      const response = await apiService.patch(
        `${API_ENDPOINTS.PRODUCTS.MARK_SOLD}?id=${productId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get featured products
  async getFeaturedProducts(params = {}) {
    try {
      const queryString = this.buildQueryString({
        isFeatured: true,
        ...params,
      });
      const response = await apiService.get(
        `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(categoryId, params = {}) {
    try {
      const queryString = this.buildQueryString({
        category: categoryId,
        ...params,
      });
      const response = await apiService.get(
        `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get products by condition
  async getProductsByCondition(condition, params = {}) {
    try {
      const queryString = this.buildQueryString({ condition, ...params });
      const response = await apiService.get(
        `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get products by price range
  async getProductsByPriceRange(minPrice, maxPrice, params = {}) {
    try {
      const queryString = this.buildQueryString({
        minPrice,
        maxPrice,
        ...params,
      });
      const response = await apiService.get(
        `${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get products by location
  async getProductsByLocation(location, params = {}) {
    try {
      const queryString = this.buildQueryString({ location, ...params });
      const response = await apiService.get(
        `${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get recently added products
  async getRecentProducts(params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiService.get(
        `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get popular products (by views)
  async getPopularProducts(params = {}) {
    try {
      const queryString = this.buildQueryString({
        sort: 'views',
        order: 'desc',
        ...params,
      });
      const response = await apiService.get(
        `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Upload product images
  async uploadProductImages(productId, images) {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const response = await apiService.upload(
        `/products/${productId}/images`,
        formData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete product image
  async deleteProductImage(productId, imageId) {
    try {
      const response = await apiService.delete(
        `/products/${productId}/images/${imageId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Increment product views
  async incrementViews(productId) {
    try {
      const response = await apiService.patch(`/products/${productId}/views`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Add product to favorites
  async addToFavorites(productId) {
    try {
      const response = await apiService.post(`/products/${productId}/favorite`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Remove product from favorites
  async removeFromFavorites(productId) {
    try {
      const response = await apiService.delete(
        `/products/${productId}/favorite`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user's favorite products
  async getFavoriteProducts(params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiService.get(
        `/products/favorites?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Report product
  async reportProduct(productId, reportData) {
    try {
      const response = await apiService.post(
        `/products/${productId}/report`,
        reportData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get product statistics (for seller)
  async getProductStats(productId) {
    try {
      const response = await apiService.get(`/products/${productId}/stats`);
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

// Create and export product service instance
const productService = new ProductService();
export default productService;
