import { create } from 'zustand';
import { Cart, CartItem } from '@/core/cart/interfaces/cart.interface';
import {
  addToCart as apiAddToCart,
  getCart as apiGetCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
  checkoutCart as apiCheckoutCart,
  getCartItemCount,
  getCartTotal,
  isProductInCart,
  getProductQuantityInCart,
} from '@/core/cart/actions/cart-actions';
import { validateAndRepairCart } from '@/core/cart/actions/cart-helpers';

export interface CartState {
  // Estado
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  
  // Computed values
  itemCount: number;
  total: number;
  
  // Acciones básicas
  loadCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<boolean>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  checkout: () => Promise<any>;
  
  // Utilidades
  isProductInCart: (productId: string) => boolean;
  getProductQuantity: (productId: string) => number;
  clearError: () => void;
  
  // Estado de operaciones específicas
  addingToCart: { [productId: string]: boolean };
  setAddingToCart: (productId: string, isAdding: boolean) => void;
  updatingItem: { [itemId: string]: boolean };
  setUpdatingItem: (itemId: string, isUpdating: boolean) => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  // Estado inicial
  cart: null,
  loading: false,
  error: null,
  itemCount: 0,
  total: 0,
  addingToCart: {},
  updatingItem: {},

  // Cargar carrito del usuario
  loadCart: async () => {
    set({ loading: true, error: null });
    
    try {
      const cart = await apiGetCart(); // Ya incluye validateAndRepairCart
      
      if (cart) {
        console.log('🛒 Carrito cargado en store:', {
          id: cart.id,
          itemsCount: cart.items?.length || 0,
          items: cart.items?.map(item => ({
            id: item.id,
            price: item.price,
            productName: item.product?.name
          }))
        });
      }
      
      const itemCount = getCartItemCount(cart);
      const total = getCartTotal(cart);
      
      set({ 
        cart, 
        itemCount, 
        total, 
        loading: false 
      });
    } catch (error: any) {
      console.error('Error cargando carrito:', error);
      set({ 
        error: error.message, 
        loading: false,
        cart: null,
        itemCount: 0,
        total: 0
      });
    }
  },

  // Agregar producto al carrito
  addToCart: async (productId: string, quantity: number) => {
    const { setAddingToCart } = get();
    
    set({ error: null });
    setAddingToCart(productId, true);
    
    try {
      // Llamada al backend inmediatamente (sin actualización optimista para agregar)
      // porque necesitamos la respuesta del servidor para obtener el precio correcto
      const updatedCart = await apiAddToCart(productId, quantity);
      
      if (updatedCart) {
        console.log('🛒 Carrito recibido después de agregar:', updatedCart);
        
        // Validar y reparar el carrito recibido
        const repairedCart = await validateAndRepairCart(updatedCart);
        
        console.log('🛒 Carrito después de reparación:', repairedCart);
        
        const itemCount = getCartItemCount(repairedCart);
        const total = getCartTotal(repairedCart);
        
        set({ 
          cart: repairedCart, 
          itemCount, 
          total 
        });
      } else {
        // Si no hay carrito en respuesta, recargar
        console.warn('⚠️ No se recibió carrito actualizado, recargando...');
        await get().loadCart();
      }
      
      setAddingToCart(productId, false);
      return true;
    } catch (error: any) {
      console.error('Error agregando al carrito:', error);
      set({ error: error.message });
      setAddingToCart(productId, false);
      return false;
    }
  },

  // Actualizar cantidad de un item
  updateItemQuantity: async (itemId: string, quantity: number) => {
    const { setUpdatingItem } = get();
    
    // Marcar item como actualizándose
    setUpdatingItem(itemId, true);
    
    // Actualización optimista: actualizar UI inmediatamente
    const { cart } = get();
    if (cart && cart.items) {
      const optimisticCart = {
        ...cart,
        items: cart.items.map(item => 
          item.id === itemId 
            ? { ...item, quantity } 
            : item
        )
      };
      
      const itemCount = getCartItemCount(optimisticCart);
      const total = getCartTotal(optimisticCart);
      
      // Actualizar UI inmediatamente
      set({ 
        cart: optimisticCart, 
        itemCount, 
        total,
        error: null 
      });
    }
    
    try {
      // Llamada al backend en segundo plano
      const updatedCart = await apiUpdateCartItem(itemId, quantity);
      
      if (updatedCart) {
        const itemCount = getCartItemCount(updatedCart);
        const total = getCartTotal(updatedCart);
        
        // Actualizar con datos reales del backend
        set({ 
          cart: updatedCart, 
          itemCount, 
          total
        });
      }
      
      setUpdatingItem(itemId, false);
      return true;
    } catch (error: any) {
      console.error('Error actualizando cantidad:', error);
      
      // En caso de error, revertir a los datos originales
      if (cart) {
        const itemCount = getCartItemCount(cart);
        const total = getCartTotal(cart);
        set({ 
          cart, 
          itemCount, 
          total,
          error: error.message 
        });
      }
      
      setUpdatingItem(itemId, false);
      return false;
    }
  },

  // Remover item del carrito
  removeItem: async (itemId: string) => {
    // Actualización optimista: remover de UI inmediatamente
    const { cart } = get();
    if (cart && cart.items) {
      const optimisticCart = {
        ...cart,
        items: cart.items.filter(item => item.id !== itemId)
      };
      
      if (optimisticCart.items.length === 0) {
        // Si no quedan items, limpiar carrito
        set({ 
          cart: null, 
          itemCount: 0, 
          total: 0,
          error: null 
        });
      } else {
        const itemCount = getCartItemCount(optimisticCart);
        const total = getCartTotal(optimisticCart);
        
        set({ 
          cart: optimisticCart, 
          itemCount, 
          total,
          error: null 
        });
      }
    }
    
    try {
      const updatedCart = await apiRemoveCartItem(itemId);
      
      if (updatedCart) {
        const itemCount = getCartItemCount(updatedCart);
        const total = getCartTotal(updatedCart);
        
        set({ 
          cart: updatedCart, 
          itemCount, 
          total
        });
      } else {
        // Si no hay datos de carrito, recargar desde el servidor para confirmar
        try {
          await get().loadCart();
        } catch (reloadError) {
          console.warn('No se pudo recargar el carrito después de eliminar item');
          // Asumir carrito vacío si no se puede recargar
          set({ 
            cart: null, 
            itemCount: 0, 
            total: 0
          });
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('Error removiendo item:', error);
      
      // En caso de error, revertir a los datos originales
      if (cart) {
        const itemCount = getCartItemCount(cart);
        const total = getCartTotal(cart);
        set({ 
          cart, 
          itemCount, 
          total,
          error: error.message 
        });
      }
      
      return false;
    }
  },

  // Limpiar carrito completo
  clearCart: async () => {
    set({ loading: true, error: null });
    
    try {
      const success = await apiClearCart();
      
      if (success) {
        set({ 
          cart: null, 
          itemCount: 0, 
          total: 0, 
          loading: false 
        });
      }
      
      return success;
    } catch (error: any) {
      console.error('Error limpiando carrito:', error);
      set({ 
        error: error.message, 
        loading: false 
      });
      return false;
    }
  },

  // Procesar checkout
  checkout: async () => {
    set({ loading: true, error: null });
    
    try {
      const result = await apiCheckoutCart();
      
      // Después del checkout exitoso, limpiar carrito
      set({ 
        cart: null, 
        itemCount: 0, 
        total: 0, 
        loading: false 
      });
      
      return result;
    } catch (error: any) {
      console.error('Error en checkout:', error);
      set({ 
        error: error.message, 
        loading: false 
      });
      throw error;
    }
  },

  // Verificar si producto está en carrito
  isProductInCart: (productId: string) => {
    const { cart } = get();
    return isProductInCart(cart, productId);
  },

  // Obtener cantidad de producto en carrito
  getProductQuantity: (productId: string) => {
    const { cart } = get();
    return getProductQuantityInCart(cart, productId);
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },

  // Manejar estado de "agregando al carrito"
  setAddingToCart: (productId: string, isAdding: boolean) => {
    set((state) => ({
      addingToCart: {
        ...state.addingToCart,
        [productId]: isAdding
      }
    }));
  },

  // Manejar estado de "actualizando item"
  setUpdatingItem: (itemId: string, isUpdating: boolean) => {
    set((state) => ({
      updatingItem: {
        ...state.updatingItem,
        [itemId]: isUpdating
      }
    }));
  },
}));
