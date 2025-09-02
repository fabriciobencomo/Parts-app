import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchProducts, getSearchSuggestions } from '@/core/products/actions/search-products.action';
import { useProducts } from './useProducts';
import { Product } from '@/core/products/interfaces/product.interface';
import partsApi from '@/api/parts.api.json';

/**
 * Hook para búsqueda de productos con fallback a datos locales
 */
export const useSearch = (query: string, enabled: boolean = true) => {
  const [useLocalSearch, setUseLocalSearch] = useState(false);
  const { productsQuery } = useProducts();

  // Búsqueda en el backend
  const searchQuery = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchProducts(query),
    enabled: enabled && !!query.trim() && !useLocalSearch,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      // Si es error de endpoint no implementado, no reintentar
      if (error.message === 'SEARCH_NOT_IMPLEMENTED') {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: any) => {
      if (error.message === 'SEARCH_NOT_IMPLEMENTED') {
        console.log('🔄 Cambiando a búsqueda local');
        setUseLocalSearch(true);
      }
    }
  });

  // Búsqueda local como fallback
  const localProducts = useMemo(() => {
    if (!productsQuery.data) return [];
    
    // Extraer productos de la estructura de páginas infinitas
    const allProducts = 'pages' in productsQuery.data 
      ? productsQuery.data.pages.flat() 
      : Array.isArray(productsQuery.data) 
        ? productsQuery.data 
        : [];

    // Si no hay productos del backend, usar datos locales
    if (allProducts.length === 0) {
      return partsApi.autoParts.map(part => ({
        ...part,
        id: part.id.toString(),
        images: part.image,
        category: {
          id: '1',
          name: part.category
        },
        brand: {
          id: '1',
          name: part.manufacturer,
          img: ''
        },
        model: '',
        description: '',
        warrantyMonths: 12,
        warrantyStart: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }

    return allProducts;
  }, [productsQuery.data]);

  // Filtrar productos localmente
  const filteredLocalProducts = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    return localProducts.filter(product => {
      const name = product.name.toLowerCase();
      const category = (product.category?.name || '').toLowerCase();
      const brand = (product.brand?.name || '').toLowerCase();
      
      return name.includes(searchTerm) || 
             category.includes(searchTerm) || 
             brand.includes(searchTerm);
    });
  }, [query, localProducts]);

  // Determinar qué resultados usar
  const results: Product[] = useLocalSearch ? filteredLocalProducts : (searchQuery.data || []);
  const isLoading = useLocalSearch ? false : searchQuery.isLoading;
  const error = useLocalSearch ? null : searchQuery.error;

  return {
    results,
    isLoading,
    error,
    isUsingLocalSearch: useLocalSearch,
    refetch: searchQuery.refetch
  };
};

/**
 * Hook para sugerencias de búsqueda (autocompletar)
 */
export const useSearchSuggestions = (query: string, enabled: boolean = true) => {
  const [useLocalSuggestions, setUseLocalSuggestions] = useState(false);
  const { productsQuery } = useProducts();

  // Sugerencias del backend
  const suggestionsQuery = useQuery({
    queryKey: ['suggestions', query],
    queryFn: () => getSearchSuggestions(query, 5),
    enabled: enabled && !!query.trim() && query.length >= 2 && !useLocalSuggestions,
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: false,
    onError: () => {
      setUseLocalSuggestions(true);
    }
  });

  // Sugerencias locales como fallback
  const localSuggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const allProducts = productsQuery.data && 'pages' in productsQuery.data 
      ? productsQuery.data.pages.flat() 
      : [];

    const searchTerm = query.toLowerCase().trim();
    return allProducts
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.category?.name || '').toLowerCase().includes(searchTerm) ||
        (product.brand?.name || '').toLowerCase().includes(searchTerm)
      )
      .slice(0, 5); // Limitar a 5 sugerencias
  }, [query, productsQuery.data]);

  const suggestions: Product[] = useLocalSuggestions ? localSuggestions : (suggestionsQuery.data || []);
  const isLoading = useLocalSuggestions ? false : suggestionsQuery.isLoading;

  return {
    suggestions,
    isLoading,
    isUsingLocalSuggestions: useLocalSuggestions
  };
};
