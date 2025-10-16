// Use backend upload service instead of direct Firebase uploads
import backendUpload from './backendUpload.js';
import { UPLOAD_CONFIG } from '../constants';

/**
 * Upload a single image via backend
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder path (e.g., 'profiles', 'products')
 * @param {string} userId - User ID for unique naming
 * @returns {Promise<Object>} - Upload result with URL
 */
export const uploadImage = async (file, folder = 'images', userId = null) => {
  return await backendUpload.uploadImage(file, folder, userId);
};

/**
 * Upload multiple images via backend
 * @param {File[]} files - Array of image files to upload
 * @param {string} folder - The folder path (e.g., 'profiles', 'products')
 * @param {string} userId - User ID for unique naming
 * @returns {Promise<Object>} - Upload results
 */
export const uploadMultipleImages = async (files, folder = 'images', userId = null) => {
  return await backendUpload.uploadMultipleImages(files, folder, userId);
};

/**
 * Delete an image via backend
 * @param {string} fileName - The file name/path in storage
 * @returns {Promise<Object>} - Delete result
 */
export const deleteImage = async (fileName) => {
  return await backendUpload.deleteImage(fileName);
};

/**
 * Validate image file before upload
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file) => {
  return backendUpload.validateImageFile(file);
};

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  validateImageFile
};