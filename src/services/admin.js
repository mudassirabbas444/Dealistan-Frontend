import apiService from './api';
import { API_ENDPOINTS } from '../constants';

class AdminService {
  async getUsers(params = {}) {
    const search = this.buildQueryString(params);
    const endpoint = search ? `/users/?${search}` : `/users/`;
    return apiService.get(endpoint);
  }

  async getProducts(params = {}) {
    const search = this.buildQueryString(params);
    const endpoint = search ? `${API_ENDPOINTS.PRODUCTS.LIST}?${search}` : API_ENDPOINTS.PRODUCTS.LIST;
    return apiService.get(endpoint);
  }

  async getCategories(params = {}) {
    const search = this.buildQueryString(params);
    const endpoint = search ? `${API_ENDPOINTS.CATEGORIES.LIST}?${search}` : API_ENDPOINTS.CATEGORIES.LIST;
    return apiService.get(endpoint);
  }

  async getConversations(params = {}) {
    const search = this.buildQueryString(params);
    const endpoint = search ? `${API_ENDPOINTS.MESSAGES.GET_CONVERSATIONS}?${search}` : API_ENDPOINTS.MESSAGES.GET_CONVERSATIONS;
    return apiService.get(endpoint);
  }

  async deleteUser(userId) {
    return apiService.delete(`/users/delete-user?id=${userId}`);
  }

  async updateUser(userId, data) {
    // Reuse profile update endpoint for admin edit (server strips role/verified)
    return apiService.put(`/users/update-profile?id=${userId}`, data);
  }

  async createCategory(data) {
    return apiService.post('/categories/add-category', data);
  }

  async updateCategory(categoryId, data) {
    return apiService.put(`/categories/update-category?id=${categoryId}`, data);
  }

  async deleteCategory(categoryId) {
    return apiService.delete(`/categories/delete-category?id=${categoryId}`);
  }

  buildQueryString(params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        if (Array.isArray(v)) v.forEach((item) => sp.append(k, item)); else sp.append(k, v);
      }
    });
    return sp.toString();
  }
}

const adminService = new AdminService();
export default adminService;


