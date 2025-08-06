import { getProducts } from "@/core/products/actions/get-products.actions";
import { useInfiniteQuery } from "@tanstack/react-query";
import partsApi from '@/api/parts.api.json';
import { Product } from '@/core/products/interfaces/product.interface';

// Datos locales como fallback
const getLocalProducts = (): Product[] => {
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
};

export const useProducts = () => {
  const productsQuery = useInfiniteQuery({
    queryKey: ['products', 'infinite'],
    queryFn: async ({pageParam}) => {
      try {
        return await getProducts(20, pageParam * 20);
      } catch (error) {
        console.log('Server not available, using local data');
        // Si el servidor no está disponible, usar datos locales
        const localProducts = getLocalProducts();
        const start = pageParam * 20;
        const end = start + 20;
        return localProducts.slice(start, end);
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return allPages.length
    }
  });

  return {
      productsQuery,
      //methods 
      loadNextPage: () => productsQuery.fetchNextPage()
  }
};