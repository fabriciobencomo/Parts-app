import { productsApi } from '@/core/auth/api/productsApi';
import type { Brand } from '../interfaces/brand.interface';
import type { Category } from '../interfaces/category.interface';

// Get all brands
export const getAllBrands = async (): Promise<Brand[]> => {
  try {
    const { data } = await productsApi.get<Brand[]>('/brands');
    return data || [];
  } catch (error) {
    console.warn('Error fetching brands:', error);
    return [];
  }
};

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const { data } = await productsApi.get<Category[]>('/categories');
    return data || [];
  } catch (error) {
    console.warn('Error fetching categories:', error);
    return [];
  }
};

// Get brands from existing products (fallback if API doesn't exist)
export const getBrandsFromProducts = (products: any[]): Brand[] => {
  const brandMap = new Map<string, Brand>();
  
  products.forEach(product => {
    if (product.brand && product.brand.id) {
      brandMap.set(product.brand.id, product.brand);
    }
  });
  
  return Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

// Get categories from existing products (fallback if API doesn't exist)
export const getCategoriesFromProducts = (products: any[]): Category[] => {
  const categoryMap = new Map<string, Category>();
  
  products.forEach(product => {
    if (product.category && product.category.id) {
      categoryMap.set(product.category.id, product.category);
    }
  });
  
  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

// Get price range from products
export const getPriceRangeFromProducts = (products: any[]): { min: number; max: number } => {
  if (!products.length) return { min: 0, max: 1000 };
  
  const prices = products.map(p => p.price || 0).filter(p => p > 0);
  if (!prices.length) return { min: 0, max: 1000 };
  
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices))
  };
};
