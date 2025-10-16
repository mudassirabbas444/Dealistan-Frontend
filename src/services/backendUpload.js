import { api } from './api.js';

/**
 * Upload single image via backend
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder path (e.g., 'profiles', 'products')
 * @param {string} userId - User ID for unique naming
 * @returns {Promise<Object>} - Upload result with URL
 */
export const uploadImage = async (file, folder = 'images', userId = null) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    if (userId) {
      formData.append('userId', userId);
    }

    // Upload via backend
    const response = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      url: response.data.data.url,
      fileName: response.data.data.fileName,
      size: file.size,
      type: file.type,
      folder: response.data.data.folder
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload image');
  }
};

/**
 * Upload multiple images via backend
 * @param {File[]} files - Array of image files to upload
 * @param {string} folder - The folder path (e.g., 'profiles', 'products')
 * @param {string} userId - User ID for unique naming
 * @returns {Promise<Object>} - Upload results
 */
export const uploadMultipleImages = async (files, folder = 'images', userId = null) => {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided');
    }

    if (files.length > 10) {
      throw new Error('Maximum 10 images allowed');
    }

    // Validate all files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.name}. Only JPEG, PNG, and WebP images are allowed.`);
      }
      if (file.size > maxSize) {
        throw new Error(`File too large: ${file.name}. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
      }
    }

    // Create FormData
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    formData.append('folder', folder);
    if (userId) {
      formData.append('userId', userId);
    }

    // Upload via backend
    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      images: response.data.data.images,
      count: response.data.data.count
    };
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload images');
  }
};

/**
 * Delete image via backend
 * @param {string} fileName - The file name/path in storage
 * @returns {Promise<Object>} - Delete result
 */
export const deleteImage = async (fileName) => {
  try {
    if (!fileName) {
      throw new Error('No file name provided');
    }

    const response = await api.delete(`/upload/${encodeURIComponent(fileName)}`);
    
    return { 
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete image');
  }
};

/**
 * Validate image file before upload
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  validateImageFile
};
