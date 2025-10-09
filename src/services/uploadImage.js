import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../utils/firebaseConfig';
import { UPLOAD_CONFIG } from '../constants';

/**
 * Upload a single image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder path (e.g., 'profiles', 'products')
 * @param {string} userId - User ID for unique naming
 * @returns {Promise<string>} - The download URL
 */
export const uploadImage = async (file, folder = 'images', userId = null) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    // Validate file size
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = userId 
      ? `${folder}/${userId}_${timestamp}_${randomString}.${fileExtension}`
      : `${folder}/${timestamp}_${randomString}.${fileExtension}`;

    // Create storage reference
    const storageRef = ref(storage, fileName);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url: downloadURL,
      fileName,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Upload multiple images to Firebase Storage
 * @param {File[]} files - Array of image files to upload
 * @param {string} folder - The folder path (e.g., 'profiles', 'products')
 * @param {string} userId - User ID for unique naming
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleImages = async (files, folder = 'images', userId = null) => {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided');
    }

    if (files.length > UPLOAD_CONFIG.MAX_FILES) {
      throw new Error(`Maximum ${UPLOAD_CONFIG.MAX_FILES} images allowed`);
    }

    const uploadPromises = files.map(file => uploadImage(file, folder, userId));
    const results = await Promise.all(uploadPromises);
    
    return {
      success: true,
      images: results,
      count: results.length
    };
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error(error.message || 'Failed to upload images');
  }
};

/**
 * Delete an image from Firebase Storage
 * @param {string} fileName - The file name/path in storage
 * @returns {Promise<boolean>} - Success status
 */
export const deleteImage = async (fileName) => {
  try {
    if (!fileName) {
      throw new Error('No file name provided');
    }

    const storageRef = ref(storage, fileName);
    await deleteObject(storageRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error(error.message || 'Failed to delete image');
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

  if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    errors.push('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
  }

  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    errors.push(`File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
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