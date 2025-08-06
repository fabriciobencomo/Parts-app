import { getProductById } from "@/core/products/actions/get-product-by-id.action"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export const useProduct = (productId: string) => {
  console.log('[useProduct] called with productId:', productId);

  const productQuery = useQuery({
    queryKey: ['products', productId],
    queryFn: () => {
      console.log('[useProduct] getProductById called with:', productId);
      return getProductById(productId);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  return {
    productQuery,
  }
}