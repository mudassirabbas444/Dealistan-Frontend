import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import favoriteService from '../services/favorite';
import { QUERY_KEYS } from '../constants';
import toast from 'react-hot-toast';

// Hook to get user's favorite products
export const useFavorites = (params = {}) => {
  // Memoize params to prevent unnecessary re-renders
  const memoizedParams = React.useMemo(() => params, [
    params.page,
    params.limit,
    params.sortBy,
    params.sortOrder
  ]);

  return useQuery({
    queryKey: [QUERY_KEYS.FAVORITES, memoizedParams],
    queryFn: async () => {
      const response = await favoriteService.getFavorites(memoizedParams);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: true, // Explicitly enable the query
  });
};

// Hook to get recent favorites
export const useRecentFavorites = (limit = 10) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FAVORITES, 'recent', limit],
    queryFn: async () => {
      const response = await favoriteService.getRecentFavorites(limit);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to get favorites count
export const useFavoritesCount = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FAVORITES, 'count'],
    queryFn: async () => {
      const response = await favoriteService.getFavoritesCount();
      return response.data.count;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to check if a product is in favorites
export const useFavoriteStatus = (productId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FAVORITE_STATUS, productId],
    queryFn: async () => {
      const response = await favoriteService.isProductInFavorites(productId);
      return response.data;
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to toggle favorite status
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      const response = await favoriteService.toggleFavorite(productId);
      return response;
    },
    onSuccess: (data, productId) => {
      // Invalidate and refetch favorites
      queryClient.invalidateQueries([QUERY_KEYS.FAVORITES]);
      queryClient.invalidateQueries([QUERY_KEYS.FAVORITE_STATUS, productId]);
      queryClient.invalidateQueries([QUERY_KEYS.PRODUCTS]);
      
      // Show success message
      toast.success(data.message || 'Favorite status updated');
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    },
  });
};

// Hook to add product to favorites
export const useAddToFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      const response = await favoriteService.addToFavorites(productId);
      return response;
    },
    onSuccess: (data, productId) => {
      // Invalidate and refetch favorites
      queryClient.invalidateQueries([QUERY_KEYS.FAVORITES]);
      queryClient.invalidateQueries([QUERY_KEYS.FAVORITE_STATUS, productId]);
      queryClient.invalidateQueries([QUERY_KEYS.PRODUCTS]);
      
      toast.success(data.message || 'Added to favorites');
    },
    onError: (error) => {
      console.error('Error adding to favorites:', error);
      toast.error('Failed to add to favorites');
    },
  });
};

// Hook to remove product from favorites
export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      const response = await favoriteService.removeFromFavorites(productId);
      return response;
    },
    onSuccess: (data, productId) => {
      // Invalidate and refetch favorites
      queryClient.invalidateQueries([QUERY_KEYS.FAVORITES]);
      queryClient.invalidateQueries([QUERY_KEYS.FAVORITE_STATUS, productId]);
      queryClient.invalidateQueries([QUERY_KEYS.PRODUCTS]);
      
      toast.success(data.message || 'Removed from favorites');
    },
    onError: (error) => {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites');
    },
  });
};

// Hook to clear all favorites
export const useClearAllFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await favoriteService.clearAllFavorites();
      return response;
    },
    onSuccess: (data) => {
      // Invalidate and refetch favorites
      queryClient.invalidateQueries([QUERY_KEYS.FAVORITES]);
      queryClient.invalidateQueries([QUERY_KEYS.FAVORITE_STATUS]);
      queryClient.invalidateQueries([QUERY_KEYS.PRODUCTS]);
      
      toast.success(data.message || 'All favorites cleared');
    },
    onError: (error) => {
      console.error('Error clearing favorites:', error);
      toast.error('Failed to clear favorites');
    },
  });
};

// Hook to check multiple products' favorite status
export const useMultipleProductsFavoriteStatus = (productIds) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FAVORITE_STATUS, 'multiple', productIds],
    queryFn: async () => {
      const response = await favoriteService.getMultipleProductsFavoriteStatus(productIds);
      return response.data;
    },
    enabled: Array.isArray(productIds) && productIds.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};
