import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/shared/components/ThemedText';
import { useCartStore } from '@/presentation/store/useCartStore';
import { useAuthStore } from '@/presentation/store/useAuthStore';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

const CheckoutScreen = () => {
  const { cart, total, itemCount, loading, createOrder, clearError } = useCartStore();
  const { user } = useAuthStore();
  const { exchangeRate, convertToVES, formatVESAmount, isLoading: loadingRate, error: rateError } = useCurrencyConverter();
  
  const [orderData, setOrderData] = useState({
    paymentMethod: 'efectivo',
    shippingAddress: '',
    notes: '',
    deliveryDate: '',
  });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Si no hay carrito o está vacío, redirigir al carrito
    if (!cart || !cart.items || cart.items.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de proceder al checkout', [
        { text: 'Ir a comprar', onPress: () => {
          // Usar setTimeout para evitar el error de navegación antes del montaje
          setTimeout(() => {
            router.replace('/(parts-app)/(tabs)/shop');
          }, 100);
        }}
      ]);
      return;
    }
  }, [cart]);

  const updateField = (field: keyof typeof orderData, value: string) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotals = () => {
    const subtotal = total;
    const shipping = 0; // Sin costo de envío para pruebas
    const discount = 0; // Por ahora sin descuentos
    const finalTotal = subtotal + shipping - discount;
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number(finalTotal.toFixed(2))
    };
  };

  const handleCreateOrder = async () => {
    if (!orderData.shippingAddress.trim()) {
      Alert.alert('Error', 'Por favor ingresa la dirección de envío');
      return;
    }

    setSubmitting(true);
    clearError();

    try {
      const totals = calculateTotals();
      
      // Si el método de pago es Pago Móvil, redirigir a la pantalla de validación
      if (orderData.paymentMethod === 'pago_movil') {
        router.push({
          pathname: '/(parts-app)/(tabs)/(stack)/payment/pago-movil',
          params: {
            amount: totals.total.toString(),
            orderData: JSON.stringify({
              ...orderData,
              ...totals,
              status: 'pendiente',
            }),
          },
        });
        setSubmitting(false);
        return;
      }
      
      // Si el método de pago es Binance Pay, redirigir a la pantalla de pago
      if (orderData.paymentMethod === 'binance_pay') {
        router.push({
          pathname: '/(parts-app)/(tabs)/(stack)/payment/binance',
          params: {
            amount: totals.total.toString(),
            orderData: JSON.stringify({
              ...orderData,
              ...totals,
              status: 'pendiente',
            }),
          },
        });
        setSubmitting(false);
        return;
      }
      
      const result = await createOrder({
        ...orderData,
        ...totals,
        status: 'pendiente',
      });

      if (result.success && result.order) {
        Alert.alert(
          '¡Orden creada exitosamente!', 
          `Tu orden #${result.order.id.slice(-8)} ha sido creada y está pendiente de procesamiento. El stock de los productos ha sido actualizado.`,
          [
            { 
              text: 'Ver mis órdenes', 
              onPress: () => router.replace('/(parts-app)/(tabs)/orders') 
            },
            { 
              text: 'Continuar comprando', 
              onPress: () => router.replace('/(parts-app)/(tabs)/shop') 
            }
          ]
        );
      }
    } catch (error: any) {
      // Manejar específicamente errores de stock
      const errorMessage = error.message || 'No se pudo crear la orden';
      
      if (errorMessage.includes('Stock insuficiente') || errorMessage.includes('stock')) {
        Alert.alert(
          'Stock Insuficiente', 
          errorMessage + '\n\nPor favor ajusta las cantidades en tu carrito.',
          [
            { text: 'Ir al carrito', onPress: () => router.replace('/(parts-app)/(tabs)/shop') }
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
        <ThemedText style={styles.emptyText}>Tu carrito está vacío</ThemedText>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => router.replace('/(parts-app)/(tabs)/shop')}
        >
          <Text style={styles.shopButtonText}>Continuar comprando</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totals = calculateTotals();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Checkout</ThemedText>
      </View>

      {/* Resumen del pedido */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Resumen del pedido</ThemedText>
        
        {cart.items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product?.name || 'Producto'}</Text>
              <Text style={styles.itemDetails}>
                Cantidad: {item.quantity} × ${(item.price || 0).toFixed(2)}
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              ${(item.quantity * (item.price || 0)).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Información de envío */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Información de envío</ThemedText>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Dirección de envío *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ingresa tu dirección completa"
            value={orderData.shippingAddress}
            onChangeText={(value) => updateField('shippingAddress', value)}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fecha de entrega (opcional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            value={orderData.deliveryDate}
            onChangeText={(value) => updateField('deliveryDate', value)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notas adicionales (opcional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Instrucciones especiales, referencias, etc."
            value={orderData.notes}
            onChangeText={(value) => updateField('notes', value)}
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      {/* Método de pago */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Método de pago</ThemedText>
        
        <View style={styles.paymentMethods}>
          {[
            { id: 'efectivo', label: 'Efectivo', icon: 'cash-outline' },
            { id: 'tarjeta', label: 'Tarjeta', icon: 'card-outline' },
            { id: 'transferencia', label: 'Transferencia', icon: 'swap-horizontal-outline' },
            { id: 'pago_movil', label: 'Pago Móvil', icon: 'phone-portrait-outline' },
            { id: 'binance_pay', label: 'Binance Pay', icon: 'logo-bitcoin' },
          ].map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                orderData.paymentMethod === method.id && styles.paymentMethodSelected
              ]}
              onPress={() => updateField('paymentMethod', method.id)}
            >
              <View style={[
                styles.radio,
                orderData.paymentMethod === method.id && styles.radioSelected
              ]} />
              <Ionicons 
                name={method.icon as any} 
                size={20} 
                color={orderData.paymentMethod === method.id ? '#1E3A8A' : '#6B7280'} 
                style={{ marginRight: 8 }}
              />
              <Text style={[
                styles.paymentMethodText,
                orderData.paymentMethod === method.id && styles.paymentMethodTextSelected
              ]}>
                {method.label}
              </Text>
              {method.id === 'binance_pay' && (
                <View style={styles.cryptoBadge}>
                  <Text style={styles.cryptoBadgeText}>Crypto</Text>
                </View>
              )}
              {method.id === 'pago_movil' && (
                <View style={styles.vesBadge}>
                  <Text style={styles.vesBadgeText}>VES</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Totales */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Totales</ThemedText>
        
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${(totals.subtotal || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Envío:</Text>
            <Text style={styles.totalValue}>${(totals.shipping || 0).toFixed(2)}</Text>
          </View>
          {(totals.discount || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuento:</Text>
              <Text style={[styles.totalValue, styles.discount]}>-${(totals.discount || 0).toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.finalTotalRow]}>
            <Text style={styles.finalTotalLabel}>Total:</Text>
            <Text style={styles.finalTotalValue}>${(totals.total || 0).toFixed(2)}</Text>
          </View>
          
          {/* Mostrar conversión a VES si el método de pago es Pago Móvil */}
          {orderData.paymentMethod === 'pago_movil' && exchangeRate && (
            <View style={styles.vesConversionContainer}>
              <View style={styles.vesConversionRow}>
                <Text style={styles.vesLabel}>Equivalente en Bs.:</Text>
                <Text style={styles.vesValue}>{formatVESAmount(convertToVES(totals.total))}</Text>
              </View>
              <Text style={styles.vesRate}>Tasa BCV: {exchangeRate.toFixed(2)} Bs/$</Text>
              {loadingRate && (
                <Text style={styles.vesLoading}>Actualizando tasa...</Text>
              )}
              {rateError && (
                <Text style={styles.vesError}>Error al obtener tasa</Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Botón de confirmar orden */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, (submitting || loading) && styles.confirmButtonDisabled]}
          onPress={handleCreateOrder}
          disabled={submitting || loading}
        >
          <Text style={styles.confirmButtonText}>
            {submitting ? 'Creando orden...' : `Confirmar orden - $${totals.total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentMethodSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#1E3A8A',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#374151',
  },
  paymentMethodTextSelected: {
    color: '#1E3A8A',
    fontWeight: '500',
  },
  totalsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  discount: {
    color: '#059669',
  },
  finalTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 16,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  cryptoBadge: {
    backgroundColor: '#F3BA2F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  cryptoBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  vesBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  vesBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  vesConversionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  vesConversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  vesValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  vesRate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  vesLoading: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 4,
  },
  vesError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
