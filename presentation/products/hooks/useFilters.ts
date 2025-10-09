import { useState, useEffect, useMemo } from 'react';
import type { Product } from '@/core/products/interfaces/product.interface';
import type { Brand } from '@/core/products/interfaces/brand.interface';
import type { Category } from '@/core/products/interfaces/category.interface';
import type { FilterOptions } from '@/presentation/shared/components/FilterModal';
import { 
  getAllBrands, 
  getAllCategories, 
  getBrandsFromProducts, 
  getCategoriesFromProducts, 
  getPriceRangeFromProducts 
} from '@/core/products/actions/filter-actions';

export const useFilters = (products: Product[] = []) => {
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    brands: [],
    categories: [],
    priceRange: { min: 0, max: 1000 },
    inStockOnly: false,
  });

  // Load brands and categories
  useEffect(() => {
    const loadFilterData = async () => {
      setLoading(true);
      try {
        // Try to get from API first
        const [brandsFromAPI, categoriesFromAPI] = await Promise.all([
          getAllBrands(),
          getAllCategories(),
        ]);

        // If API returns data, use it; otherwise extract from products
        const brands = brandsFromAPI.length > 0 
          ? brandsFromAPI 
          : getBrandsFromProducts(products);
        
        const categories = categoriesFromAPI.length > 0 
          ? categoriesFromAPI 
          : getCategoriesFromProducts(products);

        setAvailableBrands(brands);
        setAvailableCategories(categories);

        // Calculate price range from products
        const productPriceRange = getPriceRangeFromProducts(products);
        setPriceRange(productPriceRange);
        
        // Update filter price range if it's the default
        setFilters(prev => ({
          ...prev,
          priceRange: prev.priceRange.min === 0 && prev.priceRange.max === 1000 
            ? productPriceRange 
            : prev.priceRange
        }));

      } catch (error) {
        console.warn('Error loading filter data:', error);
        // Fallback to extracting from products
        setAvailableBrands(getBrandsFromProducts(products));
        setAvailableCategories(getCategoriesFromProducts(products));
        const productPriceRange = getPriceRangeFromProducts(products);
        setPriceRange(productPriceRange);
        setFilters(prev => ({ ...prev, priceRange: productPriceRange }));
      } finally {
        setLoading(false);
      }
    };

    if (products.length > 0) {
      loadFilterData();
    }
  }, [products]);

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter(product => {
      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand.id)) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category.id)) {
        return false;
      }

      // Price range filter
      const price = product.price || 0;
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }

      // Stock filter
      if (filters.inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.brands.length > 0 ||
      filters.categories.length > 0 ||
      filters.priceRange.min !== priceRange.min ||
      filters.priceRange.max !== priceRange.max ||
      filters.inStockOnly
    );
  }, [filters, priceRange]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      brands: [],
      categories: [],
      priceRange: priceRange,
      inStockOnly: false,
    });
  };

  // Apply new filters
  const applyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return {
    // Filter data
    availableBrands,
    availableCategories,
    priceRange,
    loading,
    
    // Current filters
    filters,
    hasActiveFilters,
    
    // Filtered results
    filteredProducts,
    
    // Actions
    applyFilters,
    clearFilters,
    setFilters,
  };
};
