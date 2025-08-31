import { useEffect } from 'react';
import { useFavoritesStore } from '@/presentation/store/useFavoritesStore';

// Hook para la lista de favoritos
export const useFavorites = () => {
  const {
    favorites,
    favoriteCount,
    loading,
    error,
    loadFavorites,
    loadFavoriteCount,
    removeFavorite,
    clearFavorites,
    setError
  } = useFavoritesStore();

  useEffect(() => {
    loadFavorites();
  }, []);

  const refreshFavorites = async () => {
    await loadFavorites();
  };

  const removeFromFavorites = async (productId: string) => {
    try {
      const success = await removeFavorite(productId);
      if (success) {
        // Product removed successfully
      }
      return success;
    } catch (error: any) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  };

  const clearAllFavorites = async () => {
    try {
      const success = await clearFavorites();
      if (success) {
        // All favorites cleared successfully
      }
      return success;
    } catch (error: any) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  };

  return {
    favorites,
    favoriteCount,
    loading,
    error,
    refreshFavorites,
    removeFromFavorites,
    clearAllFavorites,
    clearError: () => setError(null)
  };
};

// Hook para el botón de favorito (toggle)
export const useFavoriteToggle = (productId: string) => {
  const {
    favoriteStatus,
    loading,
    error,
    checkProductIsFavorite,
    toggleProductFavorite,
    updateFavoriteStatus,
    setError
  } = useFavoritesStore();

  const isFavorite = favoriteStatus[productId] || false;

  useEffect(() => {
    // Check favorite status on mount if not in cache
    if (favoriteStatus[productId] === undefined) {
      checkProductIsFavorite(productId);
    }
  }, [productId]);

  const toggleFavorite = async () => {
    try {
      const result = await toggleProductFavorite(productId);
      return result;
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  const setFavoriteStatus = (status: boolean) => {
    updateFavoriteStatus(productId, status);
  };

  return {
    isFavorite,
    loading,
    error,
    toggleFavorite,
    setFavoriteStatus,
    clearError: () => setError(null)
  };
};

// Hook para contar favoritos
export const useFavoriteCount = () => {
  const {
    favoriteCount,
    loadFavoriteCount
  } = useFavoritesStore();

  useEffect(() => {
    loadFavoriteCount();
  }, []);

  const refreshCount = async () => {
    await loadFavoriteCount();
  };

  return {
    favoriteCount,
    refreshCount
  };
};
