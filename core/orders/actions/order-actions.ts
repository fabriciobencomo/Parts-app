import { productsApi } from '@/core/auth/api/productsApi';
import { notifyNewOrder, notifyOrderStatusChange } from '@/core/notifications/telegram-service';

// DTOs para órdenes
export interface CreateOrderDto {
  customerId?: string; // Opcional, el backend usa el usuario autenticado
  deliveryDate?: string; // ISO string
  status?: string;
  subtotal: number;
  taxes?: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  shippingAddress?: string;
  notes?: string;
  orderDetails: CreateOrderDetailDto[];
}

export interface CreateOrderDetailDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateOrderDto {
  deliveryDate?: string;
  taxes?: number;
  discount?: number;
  paymentMethod?: string;
  shippingAddress?: string;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  deliveryDate?: string;
  status: string;
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
  paymentMethod?: string;
  shippingAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: any;
  orderDetails?: OrderDetail[];
}

export interface OrderDetail {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: any;
}

// Crear orden con todos los detalles (Opción 1 - recomendada)
export const createOrderWithDetails = async (orderData: CreateOrderDto, customerName?: string): Promise<{ success: boolean; order?: Order; error?: any }> => {
  try {
    const { data } = await productsApi.post<Order>('/orders', orderData);
    console.log('✅ Order created with details:', data);
    
    // Enviar notificación a Telegram
    try {
      const notificationSent = await notifyNewOrder(data, customerName);
      if (notificationSent) {
        console.log('✅ Notificación de Telegram enviada correctamente');
      } else {
        console.log('⚠️ No se pudo enviar la notificación de Telegram');
      }
    } catch (notificationError) {
      console.error('❌ Error enviando notificación de Telegram:', notificationError);
      // No fallar la creación del pedido si falla la notificación
    }
    
    return { success: true, order: data };
  } catch (error: any) {
    console.error('❌ Error creating order:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message, statusCode: error.response?.status },
    };
  }
};

// Crear orden vacía (Opción 2)
export const createEmptyOrder = async (orderData: Omit<CreateOrderDto, 'orderDetails'>): Promise<{ success: boolean; order?: Order; error?: any }> => {
  try {
    const { data } = await productsApi.post<Order>('/orders', orderData);
    console.log('✅ Empty order created:', data);
    return { success: true, order: data };
  } catch (error: any) {
    console.error('❌ Error creating empty order:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message, statusCode: error.response?.status },
    };
  }
};

// Agregar detalle a orden existente
export const addOrderDetail = async (orderId: string, detail: CreateOrderDetailDto): Promise<{ success: boolean; detail?: OrderDetail; error?: any }> => {
  try {
    const { data } = await productsApi.post<OrderDetail>(`/order-details/${orderId}`, detail);
    console.log('✅ Order detail added:', data);
    return { success: true, detail: data };
  } catch (error: any) {
    console.error('❌ Error adding order detail:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message, statusCode: error.response?.status },
    };
  }
};

// Recalcular totales de la orden
export const calculateOrderTotal = async (orderId: string): Promise<{ success: boolean; order?: Order; error?: any }> => {
  try {
    const { data } = await productsApi.patch<Order>(`/orders/${orderId}/calculate-total`);
    console.log('✅ Order total recalculated:', data);
    return { success: true, order: data };
  } catch (error: any) {
    console.error('❌ Error calculating order total:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message, statusCode: error.response?.status },
    };
  }
};

// Obtener órdenes del usuario autenticado
export const getMyOrders = async (): Promise<{ success: boolean; orders?: Order[]; error?: any }> => {
  try {
    const { data } = await productsApi.get<Order[]>('/orders/my-orders');
    console.log('✅ My orders retrieved:', data);
    return { success: true, orders: data };
  } catch (error: any) {
    console.error('❌ Error getting my orders:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message, statusCode: error.response?.status },
    };
  }
};

// Obtener orden por ID
export const getOrderById = async (orderId: string): Promise<{ success: boolean; order?: Order; error?: any }> => {
  try {
    const { data } = await productsApi.get<Order>(`/orders/${orderId}`);
    console.log('✅ Order retrieved:', data);
    return { success: true, order: data };
  } catch (error: any) {
    console.error('❌ Error getting order:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message, statusCode: error.response?.status },
    };
  }
};

// Actualizar orden
export const updateOrder = async (orderId: string, updateData: UpdateOrderDto): Promise<{ success: boolean; order?: Order; error?: any }> => {
  try {
    const { data } = await productsApi.patch<Order>(`/orders/${orderId}`, updateData);
    console.log('✅ Order updated:', data);
    return { success: true, order: data };
  } catch (error: any) {
    console.error('❌ Error updating order:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message, statusCode: error.response?.status },
    };
  }
};

// Actualizar estado de la orden
export const updateOrderStatus = async (orderId: string, status: string, customerName?: string): Promise<{ success: boolean; order?: Order; error?: any }> => {
  try {
    // Primero obtener el estado actual
    const currentOrderResult = await getOrderById(orderId);
    const oldStatus = currentOrderResult.order?.status || 'Desconocido';
    
    const { data } = await productsApi.patch<Order>(`/orders/${orderId}/status`, { status });
    console.log('✅ Order status updated:', data);
    
    // Enviar notificación a Telegram sobre el cambio de estado
    try {
      const notificationSent = await notifyOrderStatusChange(orderId, oldStatus, status, customerName);
      if (notificationSent) {
        console.log('✅ Notificación de cambio de estado enviada a Telegram');
      } else {
        console.log('⚠️ No se pudo enviar la notificación de cambio de estado');
      }
    } catch (notificationError) {
      console.error('❌ Error enviando notificación de cambio de estado:', notificationError);
      // No fallar la actualización si falla la notificación
    }
    
    return { success: true, order: data };
  } catch (error: any) {
    console.error('❌ Error updating order status:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message, statusCode: error.response?.status },
    };
  }
};

// Eliminar orden
export const deleteOrder = async (orderId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    await productsApi.delete(`/orders/${orderId}`);
    console.log('✅ Order deleted');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error deleting order:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message, statusCode: error.response?.status },
    };
  }
};

// Eliminar detalle de orden
export const deleteOrderDetail = async (detailId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    await productsApi.delete(`/order-details/${detailId}`);
    console.log('✅ Order detail deleted');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error deleting order detail:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message, statusCode: error.response?.status },
    };
  }
};
