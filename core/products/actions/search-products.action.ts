import { productsApi } from '@/core/auth/api/productsApi';
import { Product } from '../interfaces/product.interface';

export interface SearchProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Buscar productos usando el endpoint del backend
 * GET /products/search?query={query}&page={page}&limit={limit}
 */
export const searchProducts = async (
  query: string, 
  page: number = 1, 
  limit: number = 20
): Promise<Product[]> => {
  try {
    console.log('🔍 Buscando productos:', { query, page, limit });

    if (!query.trim()) {
      console.log('⚠️ Query vacío, retornando array vacío');
      return [];
    }

    const { data } = await productsApi.get<SearchProductsResponse>('/products/search', {
      params: {
        query: query.trim(),
        page,
        limit
      }
    });

    console.log('✅ Productos encontrados:', {
      count: data.products?.length || 0,
      total: data.total,
      page: data.page,
      totalPages: data.totalPages
    });

    return data.products || [];
  } catch (error: any) {
    console.error('❌ Error buscando productos:', error?.response?.data || error?.message);
    
    // Si el endpoint no existe o hay error, intentar búsqueda local como fallback
    if (error?.response?.status === 404 || error?.response?.status === 501) {
      console.log('📄 Endpoint de búsqueda no disponible, usando búsqueda local');
      throw new Error('SEARCH_NOT_IMPLEMENTED');
    }
    
    throw new Error('Error al buscar productos');
  }
};

/**
 * Obtener sugerencias de búsqueda (para autocompletar)
 * GET /products/suggestions?query={query}&limit={limit}
 */
export const getSearchSuggestions = async (
  query: string,
  limit: number = 5
): Promise<Product[]> => {
  try {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    console.log('💡 Obteniendo sugerencias para:', query);

    const { data } = await productsApi.get<SearchProductsResponse>('/products/suggestions', {
      params: {
        query: query.trim(),
        limit
      }
    });

    console.log('✅ Sugerencias encontradas:', data.products?.length || 0);
    return data.products || [];
  } catch (error: any) {
    console.error('❌ Error obteniendo sugerencias:', error?.response?.data || error?.message);
    
    // Si no hay endpoint de sugerencias, retornar array vacío
    if (error?.response?.status === 404 || error?.response?.status === 501) {
      console.log('📄 Endpoint de sugerencias no disponible');
      return [];
    }
    
    return [];
  }
};
