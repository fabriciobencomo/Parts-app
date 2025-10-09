import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/shared/components/ThemedText';
import { useOrderStore } from '@/presentation/store/useOrderStore';
import { Order } from '@/core/orders/actions/order-actions';

const OrdersScreen = () => {
  const { orders, loading, error, loadMyOrders, clearError } = useOrderStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyOrders();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyOrders();
    setRefreshing(false);
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
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleOrderPress = (order: Order) => {
    router.push(`/(parts-app)/(tabs)/(stack)/orders/${order.id}`);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <ThemedText style={styles.errorText}>Error cargando órdenes</ThemedText>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            clearError();
            loadMyOrders();
          }}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Mis Órdenes</ThemedText>
      </View>

      {loading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Cargando órdenes...</ThemedText>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
          <ThemedText style={styles.emptyText}>No tienes órdenes aún</ThemedText>
          <Text style={styles.emptySubtext}>
            Cuando realices tu primera compra, aparecerá aquí
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.replace('/(parts-app)/(tabs)/shop')}
          >
            <Text style={styles.shopButtonText}>Comenzar a comprar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1E3A8A']}
              tintColor="#1E3A8A"
            />
          }
        >
          {orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => handleOrderPress(order)}
              activeOpacity={0.7}
            >
              {/* Header de la orden */}
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>
                    Orden #{order.id.slice(-8).toUpperCase()}
                  </Text>
                  <Text style={styles.orderDate}>
                    {formatDate(order.createdAt)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Ionicons 
                    name={getStatusIcon(order.status) as any} 
                    size={16} 
                    color={getStatusColor(order.status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Detalles de la orden */}
              <View style={styles.orderDetails}>
                <View style={styles.orderSummary}>
                  <Text style={styles.itemCount}>
                    {order.orderDetails?.length || 0} {(order.orderDetails?.length || 0) === 1 ? 'producto' : 'productos'}
                  </Text>
                  <Text style={styles.orderTotal}>
                    ${(Number(order.total) || 0).toFixed(2)}
                  </Text>
                </View>

                {order.shippingAddress && (
                  <View style={styles.addressContainer}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {order.shippingAddress}
                    </Text>
                  </View>
                )}

                {order.paymentMethod && (
                  <View style={styles.paymentContainer}>
                    <Ionicons name="card-outline" size={16} color="#6B7280" />
                    <Text style={styles.paymentText}>
                      {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Indicador de navegación */}
              <View style={styles.navigationIndicator}>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
  scrollView: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderDetails: {
    gap: 8,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentText: {
    fontSize: 14,
    color: '#6B7280',
  },
  navigationIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});
