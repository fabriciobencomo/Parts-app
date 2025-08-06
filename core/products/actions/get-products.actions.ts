import { API_URL, productsApi } from "@/core/auth/api/productsApi";
import { Product } from "../interfaces/product.interface";

export const getProducts = async(limit = 20, offset = 0) => {

  try {
    const { data } = await productsApi.get<Product[]>('/products', {
      params: {
        limit,
        offset
      }
    });
    return data.map(product => (
      { ...product, 
      }
    ));
  } catch (error) {
    if (error.response) {
      console.log('Response error:', error.response.data);
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('Request error:', error.request);
    } else {
      console.log('General error:', error.message);
    }
    return [];
  }
}