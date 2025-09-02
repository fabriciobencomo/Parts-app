import { Product } from '@/core/products/interfaces/product.interface';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number; // Precio al momento de agregar (histórico)
  createdAt: Date;
  updatedAt: Date;
  product?: Product; // Información completa del producto
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  cart: Cart;
  message?: string;
}
