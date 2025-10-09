import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchProducts, getSearchSuggestions } from '@/core/products/actions/search-products.action';
import { useProducts } from './useProducts';
import { Product } from '@/core/products/interfaces/product.interface';
import { useDebounce } from '@/hooks/useDebounce';
import partsApi from '@/api/parts.api.json';

/**
 * Hook para búsqueda de productos con fallback a datos locales
 */
export const useSearch = (query: string, enabled: boolean = true) => {
  const [useLocalSearch, setUseLocalSearch] = useState(false);
  const { productsQuery } = useProducts();
  
  // Debounce de 500ms para la búsqueda
  const debouncedQuery = useDebounce(query, 500);

  // Búsqueda en el backend usando query debounced
  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: enabled && !!debouncedQuery.trim() && !useLocalSearch,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      // Si es error de endpoint no implementado, no reintentar
      if (error.message === 'SEARCH_NOT_IMPLEMENTED') {
        return false;
      }
      return failureCount < 1; // Solo 1 reintento para fallar rápido
    }
  });

  // Manejar errores de búsqueda
  useEffect(() => {
    if (searchQuery.error) {
      console.log('🔄 Error en búsqueda backend, cambiando a búsqueda local:', searchQuery.error.message);
      if (searchQuery.error.message === 'SEARCH_NOT_IMPLEMENTED') {
        setUseLocalSearch(true);
      }
    }
  }, [searchQuery.error]);

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

  // Filtrar productos localmente usando query debounced
  const filteredLocalProducts = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    
    const searchTerm = debouncedQuery.toLowerCase().trim();
    return localProducts.filter(product => {
      const name = product.name.toLowerCase();
      const category = (product.category?.name || '').toLowerCase();
      const brand = (product.brand?.name || '').toLowerCase();
      
      return name.includes(searchTerm) || 
             category.includes(searchTerm) || 
             brand.includes(searchTerm);
    });
  }, [debouncedQuery, localProducts]);

  // Determinar qué resultados usar
  const results: Product[] = useLocalSearch ? filteredLocalProducts : (searchQuery.data as Product[] || []);
  const isLoading = useLocalSearch ? false : searchQuery.isLoading;
  const error = useLocalSearch ? null : searchQuery.error;

  return {
    results,
    isLoading,
    error,
    isUsingLocalSearch: useLocalSearch,
    refetch: searchQuery.refetch,
    // Estado adicional para indicar si hay diferencia entre query actual y debounced
    isTyping: query !== debouncedQuery,
    debouncedQuery
  };
};

/**
 * Hook para sugerencias de búsqueda (autocompletar)
 */
export const useSearchSuggestions = (query: string, enabled: boolean = true) => {
  const [useLocalSuggestions, setUseLocalSuggestions] = useState(false);
  const { productsQuery } = useProducts();
  
  // Debounce más corto para sugerencias (300ms)
  const debouncedQuery = useDebounce(query, 300);

  // Sugerencias del backend usando query debounced
  const suggestionsQuery = useQuery({
    queryKey: ['suggestions', debouncedQuery],
    queryFn: () => getSearchSuggestions(debouncedQuery, 5),
    enabled: enabled && !!debouncedQuery.trim() && debouncedQuery.length >= 2 && !useLocalSuggestions,
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: false // No reintentar sugerencias
  });

  // Manejar errores de sugerencias
  useEffect(() => {
    if (suggestionsQuery.error) {
      console.log('🔄 Error en sugerencias backend, usando sugerencias locales:', suggestionsQuery.error.message);
      setUseLocalSuggestions(true);
    }
  }, [suggestionsQuery.error]);

  // Sugerencias locales como fallback usando query debounced
  const localSuggestions = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) return [];
    
    const allProducts = productsQuery.data && 'pages' in productsQuery.data 
      ? productsQuery.data.pages.flat() 
      : [];

    const searchTerm = debouncedQuery.toLowerCase().trim();
    return allProducts
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.category?.name || '').toLowerCase().includes(searchTerm) ||
        (product.brand?.name || '').toLowerCase().includes(searchTerm)
      )
      .slice(0, 5); // Limitar a 5 sugerencias
  }, [debouncedQuery, productsQuery.data]);

  const suggestions: Product[] = useLocalSuggestions ? localSuggestions : (suggestionsQuery.data as Product[] || []);
  const isLoading = useLocalSuggestions ? false : suggestionsQuery.isLoading;

  return {
    suggestions,
    isLoading,
    isUsingLocalSuggestions: useLocalSuggestions
  };
};
