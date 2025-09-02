import { useEffect } from 'react';
import { useCartStore } from '@/presentation/store/useCartStore';
import { useAuthStore } from '@/presentation/store/useAuthStore';

/**
 * Hook principal para manejar el carrito
 * Carga automáticamente el carrito cuando el usuario está autenticado
 */
export const useCart = () => {
  const { status } = useAuthStore();
  
  const {
    cart,
    loading,
    error,
    itemCount,
    total,
    loadCart,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    checkout,
    isProductInCart,
    getProductQuantity,
    clearError,
    addingToCart,
  } = useCartStore();

  // Cargar carrito automáticamente cuando el usuario está autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      loadCart();
    }
  }, [status, loadCart]);

  return {
    // Estado
    cart,
    loading,
    error,
    itemCount,
    total,
    
    // Acciones
    loadCart,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    checkout,
    
    // Utilidades
    isProductInCart,
    getProductQuantity,
    clearError,
    
    // Estado de operaciones
    addingToCart,
    
    // Estado de autenticación
    isAuthenticated: status === 'authenticated',
  };
};

/**
 * Hook específico para agregar productos al carrito
 * Incluye manejo de estados de carga y errores
 */
export const useAddToCart = (productId: string) => {
  const { 
    addToCart, 
    addingToCart, 
    isProductInCart, 
    getProductQuantity,
    error,
    clearError 
  } = useCart();

  const isLoading = addingToCart[productId] || false;
  const isInCart = isProductInCart(productId);
  const quantity = getProductQuantity(productId);

  const handleAddToCart = async (quantity: number = 1) => {
    clearError();
    return await addToCart(productId, quantity);
  };

  return {
    addToCart: handleAddToCart,
    isLoading,
    isInCart,
    quantity,
    error,
    clearError,
  };
};

/**
 * Hook para el contador de items del carrito
 * Útil para mostrar badges en iconos del carrito
 */
export const useCartCount = () => {
  const { itemCount, loading } = useCart();

  return {
    count: itemCount,
    loading,
    hasItems: itemCount > 0,
  };
};

/**
 * Hook para operaciones de checkout
 * Maneja el proceso completo de compra
 */
export const useCheckout = () => {
  const { 
    cart, 
    total, 
    itemCount, 
    checkout, 
    loading, 
    error, 
    clearError 
  } = useCart();

  const canCheckout = cart && itemCount > 0 && total > 0;

  const handleCheckout = async () => {
    if (!canCheckout) {
      throw new Error('El carrito está vacío');
    }
    
    try {
      clearError();
      const result = await checkout();
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    // Estado
    cart,
    total,
    itemCount,
    loading,
    error,
    canCheckout,
    
    // Acciones
    checkout: handleCheckout,
    clearError,
  };
};

/**
 * Hook para manejar items individuales del carrito
 * Útil para componentes de lista de carrito
 */
export const useCartItem = (itemId: string) => {
  const { 
    cart, 
    updateItemQuantity, 
    removeItem, 
    error, 
    clearError,
    updatingItem 
  } = useCartStore();

  const item = cart?.items?.find(item => item.id === itemId);
  const isUpdating = updatingItem[itemId] || false;

  const updateQuantity = async (quantity: number) => {
    if (quantity <= 0) {
      return await removeItem(itemId);
    }
    return await updateItemQuantity(itemId, quantity);
  };

  const remove = async () => {
    return await removeItem(itemId);
  };

  return {
    item,
    loading: isUpdating,
    error,
    updateQuantity,
    remove,
    clearError,
  };
};
