import apiService from './api';
import { API_ENDPOINTS } from '../constants';

class CategoryService {
  // Create category
  async createCategory(categoryData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.CATEGORIES.CREATE,
        categoryData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get all categories
  async getCategories(params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const endpoint = queryString
        ? `${API_ENDPOINTS.CATEGORIES.LIST}?${queryString}`
        : API_ENDPOINTS.CATEGORIES.LIST;

      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get category by ID
  async getCategoryById(categoryId) {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.CATEGORIES.GET_BY_ID}?id=${categoryId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update category
  async updateCategory(categoryId, updateData) {
    try {
      const response = await apiService.put(
        `${API_ENDPOINTS.CATEGORIES.UPDATE}?id=${categoryId}`,
        updateData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete category
  async deleteCategory(categoryId) {
    try {
      const response = await apiService.delete(
        `${API_ENDPOINTS.CATEGORIES.DELETE}?id=${categoryId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get root categories (categories without parent)
  async getRootCategories(params = {}) {
    try {
      const queryString = this.buildQueryString({
        parentCategory: null,
        ...params,
      });
      const response = await apiService.get(
        `${API_ENDPOINTS.CATEGORIES.LIST}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get subcategories by parent category
  async getSubcategories(parentCategoryId, params = {}) {
    try {
      const queryString = this.buildQueryString({
        parentCategory: parentCategoryId,
        ...params,
      });
      const response = await apiService.get(
        `${API_ENDPOINTS.CATEGORIES.LIST}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get category hierarchy (tree structure)
  async getCategoryHierarchy() {
    try {
      const response = await apiService.get('/categories/hierarchy');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Search categories
  async searchCategories(searchTerm, params = {}) {
    try {
      const queryString = this.buildQueryString({
        search: searchTerm,
        ...params,
      });
      const response = await apiService.get(
        `${API_ENDPOINTS.CATEGORIES.LIST}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get active categories only
  async getActiveCategories(params = {}) {
    try {
      const queryString = this.buildQueryString({ isActive: true, ...params });
      const response = await apiService.get(
        `${API_ENDPOINTS.CATEGORIES.LIST}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug) {
    try {
      const response = await apiService.get(`/categories/slug/${slug}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get category statistics
  async getCategoryStats(categoryId) {
    try {
      const response = await apiService.get(`/categories/${categoryId}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Reorder categories
  async reorderCategories(categoryOrders) {
    try {
      const response = await apiService.put('/categories/reorder', {
        categoryOrders,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Toggle category status (active/inactive)
  async toggleCategoryStatus(categoryId) {
    try {
      const response = await apiService.patch(
        `/categories/${categoryId}/toggle-status`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Upload category icon
  async uploadCategoryIcon(categoryId, iconFile) {
    try {
      const formData = new FormData();
      formData.append('icon', iconFile);

      const response = await apiService.upload(
        `/categories/${categoryId}/icon`,
        formData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete category icon
  async deleteCategoryIcon(categoryId) {
    try {
      const response = await apiService.delete(
        `/categories/${categoryId}/icon`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get category breadcrumb
  async getCategoryBreadcrumb(categoryId) {
    try {
      const response = await apiService.get(
        `/categories/${categoryId}/breadcrumb`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get popular categories (by product count)
  async getPopularCategories(params = {}) {
    try {
      const queryString = this.buildQueryString({
        sort: 'productCount',
        order: 'desc',
        ...params,
      });
      const response = await apiService.get(
        `${API_ENDPOINTS.CATEGORIES.LIST}?${queryString}`
      );
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

// Create and export category service instance
const categoryService = new CategoryService();
export default categoryService;
