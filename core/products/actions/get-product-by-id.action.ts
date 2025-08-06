import { API_URL, productsApi } from "@/core/auth/api/productsApi";
import { Product } from '../interfaces/product.interface'

export const getProductById = async(id: string): Promise<Product> => {
  try {
    const { data } = await productsApi.get<any>('/products/' + id);
    return {
      ...data,
      images: Array.isArray(data.images) ? data.images : 
              Array.isArray(data.image) ? data.image : 
              data.image ? [data.image] : []
    };
  } catch (error) {
    console.log(error);
    throw new Error('Product not found');
  }
}