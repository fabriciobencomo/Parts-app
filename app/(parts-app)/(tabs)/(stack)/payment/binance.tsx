import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  ScrollView,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/shared/components/ThemedText';
import {
  createBinancePayOrder,
  queryBinancePayOrder,
  closeBinancePayOrder,
  BinancePaymentStatus,
} from '@/core/payments/binance-pay-service-expo';
import { useCartStore } from '@/presentation/store/useCartStore';
import { useAuthStore } from '@/presentation/store/useAuthStore';

const BinancePaymentScreen = () => {
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const { cart, total, createOrder } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [prepayId, setPrepayId] = useState<string>('');
  const [expiryTime, setExpiryTime] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<BinancePaymentStatus['status']>('PENDING');
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // Datos de la orden desde los parámetros
  const orderData = params.orderData ? JSON.parse(params.orderData as string) : null;
  const amount = parseFloat(params.amount as string) || total;

  useEffect(() => {
    initializeBinancePayment();

    return () => {
      // Limpiar el polling cuando se desmonte el componente
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const initializeBinancePayment = async () => {
    try {
      setLoading(true);

      // Generar ID único para la transacción
      const merchantTradeNo = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Crear orden en Binance Pay
      const result = await createBinancePayOrder({
        merchantTradeNo,
        totalFee: amount,
        currency: 'USD',
        productType: 'GOODS',
        productName: `Orden de ${cart?.items?.length || 0} productos`,
        productDetail: cart?.items?.map((item) => item.product?.name).join(', ') || 'Productos varios',
      });

      if (result.success && result.data) {
        setQrCodeUrl(result.data.qrContent);
        setCheckoutUrl(result.data.checkoutUrl);
        setPrepayId(result.data.prepayId);
        setExpiryTime(result.data.expireTime);

        // Iniciar polling para verificar el estado del pago
        startPaymentPolling(result.data.prepayId);
      } else {
        Alert.alert('Error', result.error || 'No se pudo crear la orden de pago');
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al inicializar el pago');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const startPaymentPolling = (prepayId: string) => {
    // Verificar el estado del pago cada 5 segundos
    const interval = setInterval(async () => {
      const result = await queryBinancePayOrder(prepayId);

      if (result.success && result.status) {
        setPaymentStatus(result.status.status);

        if (result.status.status === 'PAID') {
          clearInterval(interval);
          handlePaymentSuccess(result.status);
        } else if (result.status.status === 'EXPIRED' || result.status.status === 'CANCELED') {
          clearInterval(interval);
          handlePaymentFailure(result.status.status);
        }
      }
    }, 5000);

    setPollingInterval(interval);
  };

  const handlePaymentSuccess = async (status: BinancePaymentStatus) => {
    try {
      // Crear la orden en el backend
      if (orderData) {
        const result = await createOrder({
          ...orderData,
          paymentMethod: 'binance_pay',
          paymentStatus: 'paid',
          transactionId: status.transactionId,
        });

        if (result.success) {
          Alert.alert(
            '¡Pago Exitoso!',
            `Tu pago ha sido confirmado. Orden #${result.order?.id.slice(-8)}`,
            [
              {
                text: 'Ver mis órdenes',
                onPress: () => router.replace('/(parts-app)/(tabs)/orders'),
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error creating order after payment:', error);
    }
  };

  const handlePaymentFailure = (status: string) => {
    Alert.alert(
      'Pago no completado',
      status === 'EXPIRED' ? 'El tiempo de pago ha expirado' : 'El pago fue cancelado',
      [
        {
          text: 'Reintentar',
          onPress: () => {
            router.back();
          },
        },
        {
          text: 'Volver',
          onPress: () => router.replace('/(parts-app)/(tabs)/shop'),
          style: 'cancel',
        },
      ]
    );
  };

  const handleOpenCheckout = async () => {
    if (checkoutUrl) {
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported) {
        await Linking.openURL(checkoutUrl);
      } else {
        Alert.alert('Error', 'No se puede abrir el enlace de pago');
      }
    }
  };

  const handleCancel = async () => {
    Alert.alert('Cancelar Pago', '¿Estás seguro de que deseas cancelar este pago?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          if (prepayId) {
            await closeBinancePayOrder(prepayId);
          }
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          router.back();
        },
      },
    ]);
  };

  const getTimeRemaining = () => {
    if (!expiryTime) return '';
    const now = Date.now();
    const remaining = expiryTime - now;
    if (remaining <= 0) return 'Expirado';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F3BA2F" />
        <Text style={styles.loadingText}>Preparando pago con Binance...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#1F2937" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Pago con Binance
        </ThemedText>
      </View>

      {/* Logo de Binance */}
      <View style={styles.logoContainer}>
        <View style={styles.binanceLogo}>
          <Text style={styles.binanceText}>Binance Pay</Text>
        </View>
      </View>

      {/* Estado del pago */}
      <View style={styles.statusContainer}>
        {paymentStatus === 'PENDING' && (
          <>
            <Ionicons name="time-outline" size={48} color="#F3BA2F" />
            <Text style={styles.statusText}>Esperando pago...</Text>
            <Text style={styles.statusSubtext}>Tiempo restante: {getTimeRemaining()}</Text>
          </>
        )}
        {paymentStatus === 'PAID' && (
          <>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text style={[styles.statusText, { color: '#10B981' }]}>¡Pago Confirmado!</Text>
          </>
        )}
      </View>

      {/* Monto a pagar */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Monto a pagar</Text>
        <Text style={styles.amountValue}>${amount.toFixed(2)} USD</Text>
        <Text style={styles.amountSubtext}>≈ {amount.toFixed(2)} USDT</Text>
      </View>

      {/* Código QR */}
      {qrCodeUrl && paymentStatus === 'PENDING' && (
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Escanea el código QR</Text>
          <View style={styles.qrCodeWrapper}>
            <Image
              source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeUrl)}` }}
              style={styles.qrCode}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.qrInstructions}>
            Abre la app de Binance y escanea este código para completar el pago
          </Text>
        </View>
      )}

      {/* Botón para abrir en Binance */}
      {checkoutUrl && paymentStatus === 'PENDING' && (
        <TouchableOpacity style={styles.openBinanceButton} onPress={handleOpenCheckout}>
          <Ionicons name="open-outline" size={24} color="#FFFFFF" />
          <Text style={styles.openBinanceText}>Abrir en Binance</Text>
        </TouchableOpacity>
      )}

      {/* Instrucciones */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instrucciones:</Text>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>1.</Text>
          <Text style={styles.instructionText}>Abre tu app de Binance</Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>2.</Text>
          <Text style={styles.instructionText}>Ve a Binance Pay</Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>3.</Text>
          <Text style={styles.instructionText}>Escanea el código QR o toca "Abrir en Binance"</Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>4.</Text>
          <Text style={styles.instructionText}>Confirma el pago en tu app</Text>
        </View>
      </View>

      {/* Botón de cancelar */}
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancelar pago</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BinancePaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  binanceLogo: {
    backgroundColor: '#F3BA2F',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  binanceText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  statusSubtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
  },
  amountSubtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  qrContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  qrCodeWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  qrCode: {
    width: 250,
    height: 250,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  openBinanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3BA2F',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  openBinanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  instructionsContainer: {
    marginHorizontal: 20,
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3BA2F',
    marginRight: 12,
    width: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  cancelButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});
