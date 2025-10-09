import { Order, OrderDetail } from '@/core/orders/actions/order-actions';

// Configuración de Telegram Bot
const TELEGRAM_BOT_TOKEN = process.env.EXPO_PUBLIC_TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = process.env.EXPO_PUBLIC_TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID_HERE';

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

// Función para enviar mensaje a Telegram
export const sendTelegramMessage = async (message: string): Promise<boolean> => {
  try {
    const telegramMessage: TelegramMessage = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    };

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramMessage),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error enviando mensaje a Telegram:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('✅ Mensaje enviado a Telegram:', data);
    return true;
  } catch (error) {
    console.error('❌ Error en sendTelegramMessage:', error);
    return false;
  }
};

// Función para formatear la información del pedido
export const formatOrderMessage = (order: Order, customerName?: string): string => {
  const orderDate = new Date(order.createdAt).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const deliveryDate = order.deliveryDate 
    ? new Date(order.deliveryDate).toLocaleDateString('es-ES')
    : 'No especificada';

  let message = `🛒 <b>NUEVO PEDIDO RECIBIDO</b>\n\n`;
  message += `📋 <b>ID del Pedido:</b> #${order.id}\n`;
  message += `👤 <b>Cliente:</b> ${customerName || 'No especificado'}\n`;
  message += `📅 <b>Fecha del Pedido:</b> ${orderDate}\n`;
  message += `🚚 <b>Fecha de Entrega:</b> ${deliveryDate}\n`;
  message += `📍 <b>Dirección:</b> ${order.shippingAddress || 'No especificada'}\n`;
  message += `💳 <b>Método de Pago:</b> ${order.paymentMethod || 'No especificado'}\n`;
  message += `📊 <b>Estado:</b> ${order.status}\n\n`;

  // Detalles de productos
  if (order.orderDetails && order.orderDetails.length > 0) {
    message += `📦 <b>PRODUCTOS:</b>\n`;
    order.orderDetails.forEach((detail: OrderDetail, index: number) => {
      const productName = detail.product?.name || `Producto ID: ${detail.productId}`;
      const quantity = Number(detail.quantity) || 0;
      const unitPrice = Number(detail.unitPrice) || 0;
      const subtotal = (quantity * unitPrice).toFixed(2);
      
      message += `${index + 1}. ${productName}\n`;
      message += `   • Cantidad: ${quantity}\n`;
      message += `   • Precio unitario: $${unitPrice.toFixed(2)}\n`;
      message += `   • Subtotal: $${subtotal}\n\n`;
    });
  }

  // Totales
  message += `💰 <b>RESUMEN FINANCIERO:</b>\n`;
  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const taxes = Number(order.taxes) || 0;
  const total = Number(order.total) || 0;
  
  message += `• Subtotal: $${subtotal.toFixed(2)}\n`;
  if (discount > 0) {
    message += `• Descuento: -$${discount.toFixed(2)}\n`;
  }
  if (taxes > 0) {
    message += `• Impuestos: $${taxes.toFixed(2)}\n`;
  }
  message += `• <b>TOTAL: $${total.toFixed(2)}</b>\n\n`;

  // Notas adicionales
  if (order.notes) {
    message += `📝 <b>Notas:</b> ${order.notes}\n\n`;
  }

  message += `⏰ <i>Notificación automática - ${new Date().toLocaleString('es-ES')}</i>`;

  return message;
};

// Función principal para notificar nuevo pedido
export const notifyNewOrder = async (order: Order, customerName?: string): Promise<boolean> => {
  try {
    console.log('📱 Datos del pedido para Telegram:', {
      orderId: order.id,
      customerName,
      orderDetailsCount: order.orderDetails?.length || 0,
      orderDetails: order.orderDetails?.map(detail => ({
        productId: detail.productId,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        productName: detail.product?.name
      })),
      totals: {
        subtotal: order.subtotal,
        taxes: order.taxes,
        discount: order.discount,
        total: order.total
      }
    });

    const message = formatOrderMessage(order, customerName);
    return await sendTelegramMessage(message);
  } catch (error) {
    console.error('❌ Error en notifyNewOrder:', error);
    return false;
  }
};

// Función para notificar cambio de estado del pedido
export const notifyOrderStatusChange = async (
  orderId: string, 
  oldStatus: string, 
  newStatus: string, 
  customerName?: string
): Promise<boolean> => {
  try {
    const message = `🔄 <b>CAMBIO DE ESTADO DE PEDIDO</b>\n\n` +
      `📋 <b>ID del Pedido:</b> #${orderId}\n` +
      `👤 <b>Cliente:</b> ${customerName || 'No especificado'}\n` +
      `📊 <b>Estado anterior:</b> ${oldStatus}\n` +
      `📊 <b>Nuevo estado:</b> ${newStatus}\n\n` +
      `⏰ <i>${new Date().toLocaleString('es-ES')}</i>`;

    return await sendTelegramMessage(message);
  } catch (error) {
    console.error('❌ Error en notifyOrderStatusChange:', error);
    return false;
  }
};
