import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart, useCartItem, useCheckout } from '@/presentation/cart/hooks/useCart';
import { CartItem } from '@/core/cart/interfaces/cart.interface';

const CartItemComponent = ({ item }: { item: CartItem }) => {
  const { updateQuantity, remove, loading } = useCartItem(item.id);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Eliminar producto',
        '¿Estás seguro de que quieres eliminar este producto del carrito?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => remove() }
        ]
      );
    } else {
      // No await para que sea instantáneo en UI
      updateQuantity(newQuantity);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que quieres eliminar este producto del carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: remove }
      ]
    );
  };

  const product = item.product;
  const price = item.price || 0;
  const itemTotal = price * item.quantity;

  return (
    <View style={styles.cartItem}>
      <TouchableOpacity 
        style={styles.productInfo}
        onPress={() => product && router.push(`/(parts-app)/(tabs)/(stack)/part/${product.id}`)}
      >
        {product?.images && product.images.length > 0 ? (
          <Image source={{ uri: product.images[0] }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={32} color="#999" />
          </View>
        )}
        
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {product?.name || 'Producto'}
          </Text>
          {product?.brand && (
            <Text style={styles.productBrand}>{product.brand.name}</Text>
          )}
          <Text style={styles.productPrice}>${price.toFixed(2)}</Text>
          <Text style={styles.itemTotal}>Total: ${itemTotal.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.quantity - 1)}
          disabled={loading}
        >
          <Ionicons name="remove" size={16} color="#666" />
        </TouchableOpacity>
        
        <Text style={styles.quantityText}>{item.quantity}</Text>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.quantity + 1)}
          disabled={loading}
        >
          <Ionicons name="add" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
};

const ShopScreen = () => {
  const { 
    cart, 
    loading, 
    error, 
    itemCount, 
    total, 
    loadCart, 
    clearCart: clearCartAction,
    isAuthenticated 
  } = useCart();

  const handleClearCart = () => {
    Alert.alert(
      'Limpiar Carrito',
      '¿Estás seguro de que quieres eliminar todos los productos del carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar', 
          style: 'destructive', 
          onPress: async () => {
            const success = await clearCartAction();
            if (success) {
              Alert.alert('Éxito', 'Carrito limpiado exitosamente');
            }
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    if (itemCount === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de proceder al checkout');
      return;
    }
    router.push('/(parts-app)/(tabs)/(stack)/checkout');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Ionicons name="cart-outline" size={80} color="#CCC" />
        <Text style={styles.authTitle}>Inicia Sesión</Text>
        <Text style={styles.authSubtitle}>
          Necesitas iniciar sesión para ver tu carrito de compras
        </Text>
        <TouchableOpacity 
          style={styles.authButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.authButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCart}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!cart || itemCount === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#CCC" />
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptySubtitle}>
          Explora productos y agrega tus favoritos al carrito
        </Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => router.push('/(parts-app)/(tabs)/(stack)/home')}
        >
          <Text style={styles.shopButtonText}>Explorar Productos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        renderItem={({ item }) => <CartItemComponent item={item} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadCart}
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mi Carrito</Text>
            <Text style={styles.headerSubtitle}>
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
            </Text>
            {itemCount > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={styles.clearButtonText}>Limpiar Carrito</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer con total y checkout */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${(total || 0).toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            itemCount === 0 && styles.checkoutButtonDisabled
          ]}
          onPress={handleCheckout}
          disabled={itemCount === 0}
        >
          <Ionicons name="card-outline" size={18} color="#FFFFFF" style={styles.checkoutIcon} />
          <Text style={styles.checkoutButtonText}>Proceder al Pago</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  clearButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  checkoutIcon: {
    marginRight: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Estados especiales
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  authButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShopScreen;