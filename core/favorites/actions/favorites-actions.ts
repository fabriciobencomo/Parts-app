import { productsApi } from '@/core/auth/api/productsApi';
import type { Product } from '@/core/products/interfaces/product.interface';

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface FavoriteCreateRequest {
  productId: string;
}

// Agregar producto a favoritos
export const addToFavorites = async (productId: string): Promise<Favorite | null> => {
  try {
    const { data } = await productsApi.post<Favorite>('/favorites', {
      productId
    });

    return data;
  } catch (error: any) {
    
    // Handle 409 Conflict (already in favorites)
    if (error.response?.status === 409) {
      throw new Error('El producto ya está en favoritos');
    }
    
    throw new Error('Error al agregar a favoritos');
  }
};

// Remover producto de favoritos
export const removeFromFavorites = async (productId: string): Promise<boolean> => {
  try {
    await productsApi.delete(`/favorites/product/${productId}`);

    return true;
  } catch (error: any) {
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      throw new Error('Producto no encontrado en favoritos');
    }
    
    throw new Error('Error al remover de favoritos');
  }
};

// Verificar si un producto es favorito
export const checkIsFavorite = async (productId: string): Promise<boolean> => {
  try {
    const { data } = await productsApi.get<boolean>(`/favorites/check/${productId}`);
    return data;
  } catch (error) {
    return false;
  }
};

// Obtener todos los favoritos del usuario
export const getUserFavorites = async (): Promise<Favorite[]> => {
  try {
    const { data } = await productsApi.get<Favorite[]>('/favorites');
    
    // Si los favoritos no incluyen información completa del producto,
    // necesitamos obtener esa información por separado
    if (data && data.length > 0 && !data[0].product) {
      const favoritesWithProducts = await Promise.all(
        data.map(async (favorite) => {
          try {
            const { data: product } = await productsApi.get(`/products/${favorite.productId}`);
            return {
              ...favorite,
              product: product
            };
          } catch (error) {
            console.warn(`Failed to fetch product ${favorite.productId}:`, error);
            return favorite; // Return original if product fetch fails
          }
        })
      );
      
      return favoritesWithProducts;
    }
    
    return data || [];
  } catch (error: any) {
    console.warn('Error fetching favorites:', error?.message);
    return [];
  }
};

// Contar favoritos del usuario
export const getFavoriteCount = async (): Promise<number> => {
  try {
    const { data } = await productsApi.get<number>('/favorites/count');
    return data;
  } catch (error) {
    return 0;
  }
};

// Obtener favorito específico por ID
export const getFavoriteById = async (favoriteId: string): Promise<Favorite | null> => {
  try {
    const { data } = await productsApi.get<Favorite>(`/favorites/${favoriteId}`);
    return data;
  } catch (error) {
    return null;
  }
};

// Limpiar todos los favoritos
export const clearAllFavorites = async (): Promise<boolean> => {
  try {
    await productsApi.delete('/favorites/clear');
    return true;
  } catch (error) {
    return false;
  }
};

// Toggle favorite - optimized version that tries to add first, then remove if conflict
export const toggleFavoriteOptimized = async (productId: string, currentStatus: boolean): Promise<{ isFavorite: boolean; message: string }> => {
  try {
    if (currentStatus) {
      // Currently favorited, remove it
      await removeFromFavorites(productId);
      return { 
        isFavorite: false, 
        message: 'Producto removido de favoritos' 
      };
    } else {
      // Not currently favorited, add it
      await addToFavorites(productId);
      return { 
        isFavorite: true, 
        message: 'Producto agregado a favoritos' 
      };
    }
  } catch (error: any) {
    throw error;
  }
};

// Legacy toggle favorite - kept for backward compatibility
export const toggleFavorite = async (productId: string): Promise<{ isFavorite: boolean; message: string }> => {
  try {
    // Primero verificar si ya es favorito
    const isFavorite = await checkIsFavorite(productId);
    
    if (isFavorite) {
      // Remover de favoritos
      await removeFromFavorites(productId);
      return { 
        isFavorite: false, 
        message: 'Producto removido de favoritos' 
      };
    } else {
      // Agregar a favoritos
      await addToFavorites(productId);
      return { 
        isFavorite: true, 
        message: 'Producto agregado a favoritos' 
      };
    }
  } catch (error: any) {
    throw error;
  }
};
