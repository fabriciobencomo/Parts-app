import { create } from 'zustand';
import type { Favorite } from '@/core/favorites/actions/favorites-actions';
import {
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite,
  getUserFavorites,
  getFavoriteCount,
  clearAllFavorites,
  toggleFavorite
} from '@/core/favorites/actions/favorites-actions';

export interface FavoritesState {
  // State
  favorites: Favorite[];
  favoriteCount: number;
  loading: boolean;
  error: string | null;
  favoriteStatus: Record<string, boolean>; // Cache for product favorite status

  // Actions
  loadFavorites: () => Promise<void>;
  loadFavoriteCount: () => Promise<void>;
  checkProductIsFavorite: (productId: string) => Promise<boolean>;
  addFavorite: (productId: string) => Promise<boolean>;
  removeFavorite: (productId: string) => Promise<boolean>;
  toggleProductFavorite: (productId: string) => Promise<{ isFavorite: boolean; message: string }>;
  clearFavorites: () => Promise<boolean>;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateFavoriteStatus: (productId: string, isFavorite: boolean) => void;
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  // Initial state
  favorites: [],
  favoriteCount: 0,
  loading: false,
  error: null,
  favoriteStatus: {},

  // Load all user favorites
  loadFavorites: async () => {
    set({ loading: true, error: null });
    
    try {
      const favorites = await getUserFavorites();
      
      // Build favorite status cache
      const favoriteStatus: Record<string, boolean> = {};
      favorites.forEach(fav => {
        favoriteStatus[fav.productId] = true;
      });
      
      set({ 
        favorites, 
        favoriteCount: favorites.length,
        favoriteStatus: { ...get().favoriteStatus, ...favoriteStatus },
        loading: false 
      });
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      set({ 
        error: error.message || 'Error al cargar favoritos', 
        loading: false 
      });
    }
  },

  // Load favorite count
  loadFavoriteCount: async () => {
    try {
      const count = await getFavoriteCount();
      set({ favoriteCount: count });
    } catch (error: any) {
      console.error('Error loading favorite count:', error);
    }
  },

  // Check if a specific product is favorite
  checkProductIsFavorite: async (productId: string) => {
    const currentStatus = get().favoriteStatus[productId];
    
    // Return cached status if available
    if (currentStatus !== undefined) {
      return currentStatus;
    }
    
    try {
      const isFavorite = await checkIsFavorite(productId);
      get().updateFavoriteStatus(productId, isFavorite);
      return isFavorite;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  // Add product to favorites
  addFavorite: async (productId: string) => {
    set({ loading: true, error: null });
    
    try {
      const favorite = await addToFavorites(productId);
      
      if (favorite) {
        const currentFavorites = get().favorites;
        const updatedFavorites = [favorite, ...currentFavorites];
        
        set({ 
          favorites: updatedFavorites,
          favoriteCount: updatedFavorites.length,
          loading: false 
        });
        
        get().updateFavoriteStatus(productId, true);
        return true;
      }
      
      set({ loading: false });
      return false;
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      set({ 
        error: error.message || 'Error al agregar favorito', 
        loading: false 
      });
      return false;
    }
  },

  // Remove product from favorites
  removeFavorite: async (productId: string) => {
    set({ loading: true, error: null });
    
    try {
      const success = await removeFromFavorites(productId);
      
      if (success) {
        const currentFavorites = get().favorites;
        const updatedFavorites = currentFavorites.filter(fav => fav.productId !== productId);
        
        set({ 
          favorites: updatedFavorites,
          favoriteCount: updatedFavorites.length,
          loading: false 
        });
        
        get().updateFavoriteStatus(productId, false);
        return true;
      }
      
      set({ loading: false });
      return false;
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      set({ 
        error: error.message || 'Error al remover favorito', 
        loading: false 
      });
      return false;
    }
  },

  // Toggle favorite status
  toggleProductFavorite: async (productId: string) => {
    set({ loading: true, error: null });
    
    try {
      const result = await toggleFavorite(productId);
      
      if (result.isFavorite) {
        // Product was added to favorites
        await get().loadFavorites(); // Reload to get complete data
      } else {
        // Product was removed from favorites
        const currentFavorites = get().favorites;
        const updatedFavorites = currentFavorites.filter(fav => fav.productId !== productId);
        
        set({ 
          favorites: updatedFavorites,
          favoriteCount: updatedFavorites.length
        });
      }
      
      get().updateFavoriteStatus(productId, result.isFavorite);
      set({ loading: false });
      
      return result;
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      set({ 
        error: error.message || 'Error al cambiar estado de favorito', 
        loading: false 
      });
      throw error;
    }
  },

  // Clear all favorites
  clearFavorites: async () => {
    set({ loading: true, error: null });
    
    try {
      const success = await clearAllFavorites();
      
      if (success) {
        set({ 
          favorites: [],
          favoriteCount: 0,
          favoriteStatus: {},
          loading: false 
        });
        return true;
      }
      
      set({ loading: false });
      return false;
    } catch (error: any) {
      console.error('Error clearing favorites:', error);
      set({ 
        error: error.message || 'Error al limpiar favoritos', 
        loading: false 
      });
      return false;
    }
  },

  // Utility actions
  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  updateFavoriteStatus: (productId: string, isFavorite: boolean) => {
    const currentStatus = get().favoriteStatus;
    set({ 
      favoriteStatus: { 
        ...currentStatus, 
        [productId]: isFavorite 
      } 
    });
  },
}));
