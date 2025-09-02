import { productsApi } from '@/core/auth/api/productsApi';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, CartResponse } from '../interfaces/cart.interface';
import { validateAndRepairCart, logCartDetails } from './cart-helpers';

/**
 * Agregar producto al carrito
 * POST /cart/add
 */
export const addToCart = async (productId: string, quantity: number): Promise<Cart | null> => {
  try {
    const requestData: AddToCartRequest = {
      productId,
      quantity
    };

    console.log('🛒 Agregando al carrito:', requestData);

    const { data } = await productsApi.post<CartResponse>('/cart/add', requestData);
    
    console.log('✅ Producto agregado al carrito:', data);
    return data.cart;
  } catch (error: any) {
    console.error('❌ Error agregando al carrito:', error?.response?.data || error?.message);
    
    // Manejar errores específicos
    if (error?.response?.status === 400) {
      throw new Error(error?.response?.data?.message || 'Cantidad no válida o stock insuficiente');
    }
    if (error?.response?.status === 404) {
      throw new Error('Producto no encontrado');
    }
    if (error?.response?.status === 401) {
      throw new Error('Debes iniciar sesión para agregar productos al carrito');
    }
    
    throw new Error('Error al agregar producto al carrito');
  }
};

/**
 * Obtener carrito del usuario
 * GET /cart
 */
export const getCart = async (): Promise<Cart | null> => {
  try {
    console.log('🛒 Obteniendo carrito del usuario...');

    const { data } = await productsApi.get<Cart>('/cart');
    
    logCartDetails(data, '(respuesta inicial del servidor)');
    
    // Validar y reparar el carrito si es necesario
    const repairedCart = await validateAndRepairCart(data);
    
    if (repairedCart !== data) {
      logCartDetails(repairedCart, '(después de reparación)');
    }
    
    return repairedCart;
  } catch (error: any) {
    console.error('❌ Error obteniendo carrito:', error?.response?.data || error?.message);
    console.error('❌ Status code:', error?.response?.status);
    
    if (error?.response?.status === 401) {
      throw new Error('Debes iniciar sesión para ver tu carrito');
    }
    
    // Si no hay carrito, retornar null en lugar de error
    if (error?.response?.status === 404) {
      console.log('ℹ️ No hay carrito para este usuario (404)');
      return null;
    }
    
    throw new Error('Error al obtener el carrito');
  }
};

/**
 * Actualizar cantidad de un item del carrito
 * PUT /cart/item/{itemId}
 */
export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart | null> => {
  try {
    const requestData: UpdateCartItemRequest = {
      quantity
    };

    console.log('🛒 Actualizando item del carrito:', { itemId, quantity });

    const { data } = await productsApi.put<CartResponse>(`/cart/item/${itemId}`, requestData);
    
    console.log('✅ Item actualizado:', data);
    return data.cart;
  } catch (error: any) {
    console.error('❌ Error actualizando item del carrito:', error?.response?.data || error?.message);
    
    if (error?.response?.status === 400) {
      throw new Error(error?.response?.data?.message || 'Cantidad no válida o stock insuficiente');
    }
    if (error?.response?.status === 404) {
      throw new Error('Item del carrito no encontrado');
    }
    if (error?.response?.status === 401) {
      throw new Error('No tienes permisos para modificar este carrito');
    }
    
    throw new Error('Error al actualizar item del carrito');
  }
};

/**
 * Eliminar un item del carrito
 * DELETE /cart/item/{itemId}
 */
export const removeCartItem = async (itemId: string): Promise<Cart | null> => {
  try {
    console.log('🛒 Eliminando item del carrito:', itemId);
    console.log('🔗 URL:', `/cart/item/${itemId}`);

    const response = await productsApi.delete(`/cart/item/${itemId}`);
    console.log('📱 Respuesta del servidor:', response.status, response.data);
    
    // Si la respuesta es 204 (No Content), significa que se eliminó exitosamente
    // pero no hay datos de carrito (carrito vacío)
    if (response.status === 204 || !response.data) {
      console.log('✅ Item eliminado - carrito ahora vacío');
      return null;
    }
    
    console.log('✅ Item eliminado - carrito actualizado:', response.data);
    return response.data as Cart;
  } catch (error: any) {
    console.error('❌ Error eliminando item del carrito:', error?.response?.data || error?.message);
    console.error('❌ Status code:', error?.response?.status);
    console.error('❌ URL intentada:', `/cart/item/${itemId}`);
    
    if (error?.response?.status === 404) {
      throw new Error('Item del carrito no encontrado');
    }
    if (error?.response?.status === 401) {
      throw new Error('No tienes permisos para modificar este carrito');
    }
    
    throw new Error('Error al eliminar item del carrito');
  }
};

/**
 * Limpiar todo el carrito
 * DELETE /cart
 */
export const clearCart = async (): Promise<boolean> => {
  try {
    console.log('🛒 Limpiando carrito completo...');

    await productsApi.delete('/cart');
    
    console.log('✅ Carrito limpiado exitosamente');
    return true;
  } catch (error: any) {
    console.error('❌ Error limpiando carrito:', error?.response?.data || error?.message);
    
    if (error?.response?.status === 401) {
      throw new Error('No tienes permisos para limpiar este carrito');
    }
    
    throw new Error('Error al limpiar el carrito');
  }
};

/**
 * Procesar checkout (compra)
 * POST /cart/checkout
 */
export const checkoutCart = async (): Promise<any> => {
  try {
    console.log('🛒 Procesando checkout...');

    const { data } = await productsApi.post('/cart/checkout');
    
    console.log('✅ Checkout procesado exitosamente:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error en checkout:', error?.response?.data || error?.message);
    
    if (error?.response?.status === 400) {
      throw new Error(error?.response?.data?.message || 'Carrito vacío o productos sin stock');
    }
    if (error?.response?.status === 401) {
      throw new Error('Debes iniciar sesión para procesar la compra');
    }
    
    throw new Error('Error al procesar la compra');
  }
};

/**
 * Función auxiliar para obtener el número total de items en el carrito
 */
export const getCartItemCount = (cart: Cart | null): number => {
  if (!cart || !cart.items) return 0;
  return cart.items.reduce((total, item) => total + (item.quantity || 0), 0);
};

/**
 * Función auxiliar para obtener el total del carrito
 */
export const getCartTotal = (cart: Cart | null): number => {
  if (!cart || !cart.items) {
    console.log('📊 Cart total: 0 (no cart or items)');
    return 0;
  }
  
  let total = 0;
  cart.items.forEach((item, index) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    const itemTotal = price * quantity;
    total += itemTotal;
    
    console.log(`📊 Item ${index + 1}: ${item.product?.name || item.productId} - $${price} x ${quantity} = $${itemTotal}`);
  });
  
  console.log(`📊 Cart total calculated: $${total.toFixed(2)}`);
  return total;
};

/**
 * Función auxiliar para verificar si un producto está en el carrito
 */
export const isProductInCart = (cart: Cart | null, productId: string): boolean => {
  if (!cart || !cart.items) return false;
  return cart.items.some(item => item.productId === productId);
};

/**
 * Función auxiliar para obtener la cantidad de un producto en el carrito
 */
export const getProductQuantityInCart = (cart: Cart | null, productId: string): number => {
  if (!cart || !cart.items) return 0;
  const item = cart.items.find(item => item.productId === productId);
  return item ? item.quantity : 0;
};
