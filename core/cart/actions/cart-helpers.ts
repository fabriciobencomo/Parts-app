import { productsApi } from '@/core/auth/api/productsApi';
import { Cart, CartItem } from '../interfaces/cart.interface';
import { Product } from '@/core/products/interfaces/product.interface';

/**
 * Función para enriquecer items del carrito con información de productos
 * cuando el precio no está disponible
 */
export const enrichCartItems = async (cart: Cart): Promise<Cart> => {
  if (!cart.items || cart.items.length === 0) {
    return cart;
  }

  console.log('🔍 Enriqueciendo items del carrito...');

  const enrichedItems: CartItem[] = await Promise.all(
    cart.items.map(async (item) => {
      // Log detallado del item original
      console.log('🔍 Item original recibido:', {
        ...item,
        allKeys: Object.keys(item),
        productIdValue: item.productId,
        productIdType: typeof item.productId
      });

      // Si el item ya tiene precio y información del producto, retornarlo tal como está
      if (item.price && item.price > 0 && item.product) {
        return item;
      }

      try {
        // Intentar diferentes formas de obtener el productId
        let productId = item.productId;
        
        // Verificar si el productId está en otro campo
        if (!productId) {
          const itemAsAny = item as any;
          productId = itemAsAny.product_id || itemAsAny.Product?.id || itemAsAny.product?.id;
          console.log('🔍 ProductId alternativo encontrado:', productId);
        }

        if (!productId) {
          console.warn('⚠️ No se pudo encontrar productId en el item:', item);
          return item;
        }

        // Obtener información del producto desde el endpoint de productos
        console.log(`📦 Obteniendo producto ${productId}...`);
        const { data: product } = await productsApi.get<Product>(`/products/${productId}`);
        
        const enrichedItem: CartItem = {
          ...item,
          productId: productId, // Asegurar que el productId esté presente
          price: item.price || product.price || 0, // Usar precio del carrito o del producto
          product: product
        };

        console.log(`✅ Producto enriquecido:`, {
          id: item.id,
          productId: enrichedItem.productId,
          originalPrice: item.price,
          productPrice: product.price,
          finalPrice: enrichedItem.price,
          productName: product.name
        });

        return enrichedItem;
      } catch (error) {
        console.warn(`⚠️ No se pudo obtener información del producto:`, error);
        return item; // Retornar item original si hay error
      }
    })
  );

  const enrichedCart: Cart = {
    ...cart,
    items: enrichedItems
  };

  console.log('✅ Carrito enriquecido completado');
  return enrichedCart;
};

/**
 * Función para validar y reparar datos del carrito
 */
export const validateAndRepairCart = async (cart: Cart | null): Promise<Cart | null> => {
  if (!cart) return null;

  console.log('🔧 Validando y reparando carrito...');

  // Verificar si algún item necesita reparación
  const needsRepair = cart.items.some(item => 
    !item.price || 
    item.price === 0 || 
    !item.product
  );

  if (needsRepair) {
    console.log('🛠️ Carrito necesita reparación');
    return await enrichCartItems(cart);
  }

  console.log('✅ Carrito no necesita reparación');
  return cart;
};

/**
 * Función para logging detallado del carrito
 */
export const logCartDetails = (cart: Cart | null, context: string = '') => {
  console.group(`📊 Cart Details ${context}`);
  
  if (!cart) {
    console.log('❌ Carrito es null/undefined');
    console.groupEnd();
    return;
  }

  console.log('🆔 Cart ID:', cart.id);
  console.log('👤 User ID:', cart.userId);
  console.log('📦 Items Count:', cart.items?.length || 0);
  console.log('💰 Total:', cart.total);

  // Log de la estructura completa del carrito
  console.log('🔍 Estructura completa del carrito:', JSON.stringify(cart, null, 2));

  if (cart.items && cart.items.length > 0) {
    console.group('📋 Items detallados:');
    cart.items.forEach((item, index) => {
      console.log(`${index + 1}. Item completo:`, {
        ...item,
        allKeys: Object.keys(item),
        productIdExists: 'productId' in item,
        productIdValue: item.productId,
        priceExists: 'price' in item,
        priceValue: item.price,
        hasProduct: !!item.product,
        productName: item.product?.name || 'Sin nombre'
      });
    });
    console.groupEnd();
  }

  console.groupEnd();
};
