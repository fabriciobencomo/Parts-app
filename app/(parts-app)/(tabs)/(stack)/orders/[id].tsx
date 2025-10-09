import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/shared/components/ThemedText';
import { useOrderStore } from '@/presentation/store/useOrderStore';

const OrderDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const orderId = id as string;
  
  const { currentOrder, loading, error, loadOrderById, updateOrderStatus, clearError, clearCurrentOrder } = useOrderStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderById(orderId);
    }
    
    return () => {
      clearCurrentOrder();
    };
  }, [orderId]);

  const handleRefresh = async () => {
    if (orderId) {
      setRefreshing(true);
      await loadOrderById(orderId);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return '#F59E0B';
      case 'pagado':
        return '#10B981';
      case 'enviado':
        return '#3B82F6';
      case 'entregado':
        return '#059669';
      case 'cancelado':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'time-outline';
      case 'pagado':
        return 'card-outline';
      case 'enviado':
        return 'airplane-outline';
      case 'entregado':
        return 'checkmark-circle-outline';
      case 'cancelado':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleCancelOrder = () => {
    if (!currentOrder) return;

    Alert.alert(
      'Cancelar orden',
      '¿Estás seguro de que deseas cancelar esta orden?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            const success = await updateOrderStatus(currentOrder.id, 'cancelado');
            if (success) {
              Alert.alert('Orden cancelada', 'Tu orden ha sido cancelada exitosamente');
            }
          }
        }
      ]
    );
  };

  if (loading && !currentOrder) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>Cargando orden...</ThemedText>
      </View>
    );
  }

  if (error && !currentOrder) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <ThemedText style={styles.errorText}>Error cargando orden</ThemedText>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            clearError();
            if (orderId) loadOrderById(orderId);
          }}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentOrder) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
        <ThemedText style={styles.errorText}>Orden no encontrada</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canCancelOrder = currentOrder.status.toLowerCase() === 'pendiente';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <ThemedText type="title" style={styles.title}>
            Orden #{currentOrder.id.slice(-8).toUpperCase()}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentOrder.status) + '20' }]}>
            <Ionicons 
              name={getStatusIcon(currentOrder.status) as any} 
              size={16} 
              color={getStatusColor(currentOrder.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(currentOrder.status) }]}>
              {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
          />
        }
      >
        {/* Información general */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Información general</ThemedText>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de creación:</Text>
            <Text style={styles.infoValue}>{formatDate(currentOrder.createdAt)}</Text>
          </View>
          
          {currentOrder.deliveryDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de entrega:</Text>
              <Text style={styles.infoValue}>{formatDate(currentOrder.deliveryDate)}</Text>
            </View>
          )}
          
          {currentOrder.paymentMethod && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Método de pago:</Text>
              <Text style={styles.infoValue}>
                {currentOrder.paymentMethod.charAt(0).toUpperCase() + currentOrder.paymentMethod.slice(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Dirección de envío */}
        {currentOrder.shippingAddress && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Dirección de envío</ThemedText>
            <Text style={styles.addressText}>{currentOrder.shippingAddress}</Text>
          </View>
        )}

        {/* Notas */}
        {currentOrder.notes && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Notas</ThemedText>
            <Text style={styles.notesText}>{currentOrder.notes}</Text>
          </View>
        )}

        {/* Productos */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Productos</ThemedText>
          
          {currentOrder.orderDetails?.map((detail) => (
            <View key={detail.id} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>
                  {detail.product?.name || `Producto ${detail.productId.slice(-8)}`}
                </Text>
                <Text style={styles.productDetails}>
                  Cantidad: {detail.quantity} × ${Number(detail.unitPrice || 0).toFixed(2)}
                </Text>
              </View>
              <Text style={styles.productTotal}>
                ${Number(detail.subtotal || 0).toFixed(2)}
              </Text>
            </View>
          )) || (
            <Text style={styles.noProductsText}>No hay productos en esta orden</Text>
          )}
        </View>

        {/* Totales */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Resumen de costos</ThemedText>
          
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>${Number(currentOrder.subtotal || 0).toFixed(2)}</Text>
            </View>
            
            {(currentOrder.taxes || 0) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Envío:</Text>
                <Text style={styles.totalValue}>${Number(currentOrder.taxes || 0).toFixed(2)}</Text>
              </View>
            )}
            
            {(currentOrder.discount || 0) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Descuento:</Text>
                <Text style={[styles.totalValue, styles.discount]}>-${Number(currentOrder.discount || 0).toFixed(2)}</Text>
              </View>
            )}
            
            <View style={[styles.totalRow, styles.finalTotalRow]}>
              <Text style={styles.finalTotalLabel}>Total:</Text>
              <Text style={styles.finalTotalValue}>${Number(currentOrder.total || 0).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Acciones */}
      {canCancelOrder && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}
          >
            <Text style={styles.cancelButtonText}>Cancelar orden</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  addressText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  notesText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  productTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  noProductsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
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
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
