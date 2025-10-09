import { create } from 'zustand';
import {
  getMyOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  type Order,
  type UpdateOrderDto,
} from '@/core/orders/actions/order-actions';

export interface OrderState {
  // Estado
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  
  // Acciones
  loadMyOrders: () => Promise<void>;
  loadOrderById: (orderId: string) => Promise<void>;
  updateOrder: (orderId: string, updateData: UpdateOrderDto) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: string) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  clearError: () => void;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  // Estado inicial
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  // Cargar mis órdenes
  loadMyOrders: async () => {
    set({ loading: true, error: null });
    
    try {
      const result = await getMyOrders();
      
      if (result.success && result.orders) {
        set({ 
          orders: result.orders, 
          loading: false 
        });
      } else {
        set({ 
          error: result.error?.message || 'Error cargando órdenes',
          loading: false 
        });
      }
    } catch (error: any) {
      console.error('Error cargando órdenes:', error);
      set({ 
        error: error.message, 
        loading: false 
      });
    }
  },

  // Cargar orden por ID
  loadOrderById: async (orderId: string) => {
    set({ loading: true, error: null });
    
    try {
      const result = await getOrderById(orderId);
      
      if (result.success && result.order) {
        set({ 
          currentOrder: result.order, 
          loading: false 
        });
      } else {
        set({ 
          error: result.error?.message || 'Error cargando orden',
          loading: false 
        });
      }
    } catch (error: any) {
      console.error('Error cargando orden:', error);
      set({ 
        error: error.message, 
        loading: false 
      });
    }
  },

  // Actualizar orden
  updateOrder: async (orderId: string, updateData: UpdateOrderDto) => {
    set({ error: null });
    
    try {
      const result = await updateOrder(orderId, updateData);
      
      if (result.success && result.order) {
        // Actualizar orden en la lista
        const { orders, currentOrder } = get();
        const updatedOrders = orders.map(order => 
          order.id === orderId ? result.order! : order
        );
        
        set({ 
          orders: updatedOrders,
          currentOrder: currentOrder?.id === orderId ? result.order : currentOrder
        });
        
        return true;
      } else {
        set({ error: result.error?.message || 'Error actualizando orden' });
        return false;
      }
    } catch (error: any) {
      console.error('Error actualizando orden:', error);
      set({ error: error.message });
      return false;
    }
  },

  // Actualizar estado de orden
  updateOrderStatus: async (orderId: string, status: string) => {
    set({ error: null });
    
    try {
      const result = await updateOrderStatus(orderId, status);
      
      if (result.success && result.order) {
        // Actualizar orden en la lista
        const { orders, currentOrder } = get();
        const updatedOrders = orders.map(order => 
          order.id === orderId ? result.order! : order
        );
        
        set({ 
          orders: updatedOrders,
          currentOrder: currentOrder?.id === orderId ? result.order : currentOrder
        });
        
        return true;
      } else {
        set({ error: result.error?.message || 'Error actualizando estado' });
        return false;
      }
    } catch (error: any) {
      console.error('Error actualizando estado:', error);
      set({ error: error.message });
      return false;
    }
  },

  // Eliminar orden
  deleteOrder: async (orderId: string) => {
    set({ error: null });
    
    try {
      const result = await deleteOrder(orderId);
      
      if (result.success) {
        // Remover orden de la lista
        const { orders, currentOrder } = get();
        const updatedOrders = orders.filter(order => order.id !== orderId);
        
        set({ 
          orders: updatedOrders,
          currentOrder: currentOrder?.id === orderId ? null : currentOrder
        });
        
        return true;
      } else {
        set({ error: result.error?.message || 'Error eliminando orden' });
        return false;
      }
    } catch (error: any) {
      console.error('Error eliminando orden:', error);
      set({ error: error.message });
      return false;
    }
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },

  // Limpiar orden actual
  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },
}));
