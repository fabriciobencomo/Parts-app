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
 * Buscar productos usando el endpoint público y filtrado local
 * GET /products (endpoint público, no requiere autenticación)
 */
export const searchProducts = async (
  query: string, 
  page: number = 1, 
  limit: number = 20
): Promise<Product[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    // Usar el endpoint público para obtener todos los productos
    const { data } = await productsApi.get<Product[]>('/products');

    // Filtrar productos localmente
    const searchTerm = query.toLowerCase().trim();
    const filteredProducts = (data || []).filter(product => {
      const name = product.name.toLowerCase();
      const category = (product.category?.name || '').toLowerCase();
      const brand = (product.brand?.name || '').toLowerCase();
      
      return name.includes(searchTerm) || 
             category.includes(searchTerm) || 
             brand.includes(searchTerm);
    });

    // Aplicar paginación local
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedResults = filteredProducts.slice(start, end);

    // Solo log para primera página con resultados
    if (page === 1 && paginatedResults.length > 0) {
      console.log(`🔍 Búsqueda: "${query}" encontró ${filteredProducts.length} productos`);
    }

    return paginatedResults;
  } catch (error: any) {
    console.error('❌ Error obteniendo productos:', error?.response?.data || error?.message);
    
    // Si hay error, lanzar excepción para que use el fallback local
    if (error?.response?.status === 404 || error?.response?.status === 501 || error?.response?.status === 500) {
      console.log('📄 Endpoint público no disponible (status: ' + error?.response?.status + '), usando búsqueda local');
      throw new Error('SEARCH_NOT_IMPLEMENTED');
    }
    
    throw new Error('Error al obtener productos del servidor');
  }
};

/**
 * Obtener sugerencias de búsqueda usando el endpoint público
 * GET /products (endpoint público, filtrado local para sugerencias)
 */
export const getSearchSuggestions = async (
  query: string,
  limit: number = 5
): Promise<Product[]> => {
  try {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    // Usar el endpoint público para obtener todos los productos
    const { data } = await productsApi.get<Product[]>('/products');

    // Filtrar productos para sugerencias
    const searchTerm = query.toLowerCase().trim();
    const suggestions = (data || [])
      .filter(product => {
        const name = product.name.toLowerCase();
        const category = (product.category?.name || '').toLowerCase();
        const brand = (product.brand?.name || '').toLowerCase();
        
        return name.includes(searchTerm) || 
               category.includes(searchTerm) || 
               brand.includes(searchTerm);
      })
      .slice(0, limit); // Limitar número de sugerencias

    return suggestions;
  } catch (error: any) {
    console.error('❌ Error obteniendo sugerencias:', error?.response?.data || error?.message);
    
    // Si hay error con el endpoint público, retornar array vacío para usar fallback local
    if (error?.response?.status === 404 || error?.response?.status === 501 || error?.response?.status === 500) {
      console.log('📄 Endpoint público no disponible para sugerencias (status: ' + error?.response?.status + ')');
      return [];
    }
    
    return [];
  }
};
