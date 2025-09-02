import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCart } from '../hooks/useCart';

interface CartDebugProps {
  show?: boolean;
}

export const CartDebug: React.FC<CartDebugProps> = ({ show = __DEV__ }) => {
  const { cart, itemCount, total, loading, error } = useCart();

  if (!show) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Debug del Carrito</Text>
      <Text style={styles.info}>Items: {itemCount}</Text>
      <Text style={styles.info}>Total: ${(total || 0).toFixed(2)}</Text>
      <Text style={styles.info}>Loading: {loading ? 'Sí' : 'No'}</Text>
      <Text style={styles.info}>Error: {error || 'Ninguno'}</Text>
      
      {cart?.items && (
        <View style={styles.itemsList}>
          <Text style={styles.subtitle}>Items en carrito:</Text>
          {cart.items.map((item, index) => {
            const hasPrice = item.price && item.price > 0;
            const hasProduct = !!item.product;
            const subtotal = (item.price || 0) * item.quantity;
            
            return (
              <Text key={item.id} style={[styles.item, !hasPrice && styles.errorItem]}>
                {index + 1}. {item.product?.name || `ID: ${item.productId}`} {!hasProduct && '❌'}
                {'\n'}   Precio: ${(item.price || 0).toFixed(2)} {!hasPrice && '⚠️'}
                {'\n'}   Cantidad: {item.quantity}
                {'\n'}   Subtotal: ${subtotal.toFixed(2)}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  info: {
    color: 'white',
    fontSize: 11,
    marginBottom: 2,
  },
  itemsList: {
    marginTop: 8,
  },
  item: {
    color: '#CCC',
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 12,
  },
  errorItem: {
    color: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 4,
    borderRadius: 4,
  },
});

export default CartDebug;
