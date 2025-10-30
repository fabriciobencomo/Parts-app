import crypto from 'crypto';

// Configuración de Binance Pay
const BINANCE_PAY_API_KEY = process.env.EXPO_PUBLIC_BINANCE_PAY_API_KEY || '';
const BINANCE_PAY_SECRET = process.env.EXPO_PUBLIC_BINANCE_PAY_SECRET || '';
const BINANCE_PAY_MERCHANT_ID = process.env.EXPO_PUBLIC_BINANCE_PAY_MERCHANT_ID || '';
const BINANCE_PAY_BASE_URL = 'https://bpay.binanceapi.com';

export interface BinancePayOrderRequest {
  merchantTradeNo: string; // ID único de la orden
  totalFee: number; // Monto total
  currency: string; // USD, EUR, etc.
  productType: string; // Tipo de producto
  productName: string; // Nombre del producto
  productDetail?: string; // Detalles del producto
  returnUrl?: string; // URL de retorno después del pago
  cancelUrl?: string; // URL de cancelación
}

export interface BinancePayOrderResponse {
  status: string;
  code: string;
  data: {
    prepayId: string;
    terminalType: string;
    expireTime: number;
    qrcodeLink: string;
    qrContent: string;
    checkoutUrl: string;
    deeplink: string;
    universalUrl: string;
  };
  errorMessage?: string;
}

export interface BinancePaymentStatus {
  status: 'PENDING' | 'PAID' | 'CANCELED' | 'ERROR' | 'REFUNDING' | 'REFUNDED' | 'EXPIRED';
  transactionId?: string;
  transactionTime?: number;
  amount?: number;
  currency?: string;
}

/**
 * Genera la firma HMAC SHA512 requerida por Binance Pay
 */
const generateSignature = (timestamp: number, nonce: string, body: string): string => {
  const payload = `${timestamp}\n${nonce}\n${body}\n`;
  const signature = crypto
    .createHmac('sha512', BINANCE_PAY_SECRET)
    .update(payload)
    .digest('hex')
    .toUpperCase();
  return signature;
};

/**
 * Genera un nonce aleatorio
 */
const generateNonce = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Crea una orden de pago en Binance Pay
 */
export const createBinancePayOrder = async (
  orderRequest: BinancePayOrderRequest
): Promise<{ success: boolean; data?: BinancePayOrderResponse['data']; error?: string }> => {
  try {
    if (!BINANCE_PAY_API_KEY || !BINANCE_PAY_SECRET) {
      console.error('❌ Binance Pay credentials not configured');
      return {
        success: false,
        error: 'Binance Pay no está configurado. Por favor contacta al administrador.',
      };
    }

    const timestamp = Date.now();
    const nonce = generateNonce();
    const body = JSON.stringify(orderRequest);
    const signature = generateSignature(timestamp, nonce, body);

    const response = await fetch(`${BINANCE_PAY_BASE_URL}/binancepay/openapi/v2/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': timestamp.toString(),
        'BinancePay-Nonce': nonce,
        'BinancePay-Certificate-SN': BINANCE_PAY_API_KEY,
        'BinancePay-Signature': signature,
      },
      body,
    });

    const result: BinancePayOrderResponse = await response.json();

    if (result.status === 'SUCCESS' && result.data) {
      console.log('✅ Binance Pay order created:', result.data.prepayId);
      return { success: true, data: result.data };
    } else {
      console.error('❌ Binance Pay order failed:', result.errorMessage || result.code);
      return {
        success: false,
        error: result.errorMessage || 'Error al crear la orden de pago',
      };
    }
  } catch (error: any) {
    console.error('❌ Error creating Binance Pay order:', error);
    return {
      success: false,
      error: error.message || 'Error de conexión con Binance Pay',
    };
  }
};

/**
 * Consulta el estado de una orden de pago en Binance Pay
 */
export const queryBinancePayOrder = async (
  prepayId: string
): Promise<{ success: boolean; status?: BinancePaymentStatus; error?: string }> => {
  try {
    if (!BINANCE_PAY_API_KEY || !BINANCE_PAY_SECRET) {
      return {
        success: false,
        error: 'Binance Pay no está configurado',
      };
    }

    const timestamp = Date.now();
    const nonce = generateNonce();
    const body = JSON.stringify({ prepayId });
    const signature = generateSignature(timestamp, nonce, body);

    const response = await fetch(`${BINANCE_PAY_BASE_URL}/binancepay/openapi/v2/order/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': timestamp.toString(),
        'BinancePay-Nonce': nonce,
        'BinancePay-Certificate-SN': BINANCE_PAY_API_KEY,
        'BinancePay-Signature': signature,
      },
      body,
    });

    const result = await response.json();

    if (result.status === 'SUCCESS' && result.data) {
      const paymentStatus: BinancePaymentStatus = {
        status: result.data.status,
        transactionId: result.data.transactionId,
        transactionTime: result.data.transactionTime,
        amount: result.data.totalFee,
        currency: result.data.currency,
      };

      console.log('✅ Binance Pay order status:', paymentStatus.status);
      return { success: true, status: paymentStatus };
    } else {
      return {
        success: false,
        error: result.errorMessage || 'Error al consultar el estado del pago',
      };
    }
  } catch (error: any) {
    console.error('❌ Error querying Binance Pay order:', error);
    return {
      success: false,
      error: error.message || 'Error de conexión',
    };
  }
};

/**
 * Cierra/cancela una orden de pago en Binance Pay
 */
export const closeBinancePayOrder = async (
  prepayId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!BINANCE_PAY_API_KEY || !BINANCE_PAY_SECRET) {
      return {
        success: false,
        error: 'Binance Pay no está configurado',
      };
    }

    const timestamp = Date.now();
    const nonce = generateNonce();
    const body = JSON.stringify({ prepayId });
    const signature = generateSignature(timestamp, nonce, body);

    const response = await fetch(`${BINANCE_PAY_BASE_URL}/binancepay/openapi/v2/order/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': timestamp.toString(),
        'BinancePay-Nonce': nonce,
        'BinancePay-Certificate-SN': BINANCE_PAY_API_KEY,
        'BinancePay-Signature': signature,
      },
      body,
    });

    const result = await response.json();

    if (result.status === 'SUCCESS') {
      console.log('✅ Binance Pay order closed');
      return { success: true };
    } else {
      return {
        success: false,
        error: result.errorMessage || 'Error al cancelar la orden',
      };
    }
  } catch (error: any) {
    console.error('❌ Error closing Binance Pay order:', error);
    return {
      success: false,
      error: error.message || 'Error de conexión',
    };
  }
};

/**
 * Convierte USD a criptomoneda (estimación aproximada)
 * En producción, deberías usar la API de Binance para obtener tasas reales
 */
export const convertUSDToCrypto = (
  usdAmount: number,
  cryptoCurrency: 'BTC' | 'ETH' | 'USDT' | 'BNB'
): number => {
  // Tasas aproximadas (deberías obtenerlas de la API de Binance en tiempo real)
  const rates = {
    BTC: 0.000025, // 1 USD ≈ 0.000025 BTC (asumiendo BTC a $40,000)
    ETH: 0.00040, // 1 USD ≈ 0.0004 ETH (asumiendo ETH a $2,500)
    USDT: 1.0, // 1 USD = 1 USDT
    BNB: 0.0025, // 1 USD ≈ 0.0025 BNB (asumiendo BNB a $400)
  };

  return usdAmount * rates[cryptoCurrency];
};
