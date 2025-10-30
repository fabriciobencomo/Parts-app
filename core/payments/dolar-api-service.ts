/**
 * Servicio para obtener la tasa de cambio USD a VES desde DolarAPI
 * Documentación: https://ve.dolarapi.com/docs
 */

const DOLAR_API_BASE_URL = 'https://ve.dolarapi.com/v1';

export interface DolarAPIRate {
  fuente: string;
  nombre: string;
  promedio: number;
  compra: number;
  venta: number;
  fecha: string;
  ultimaActualizacion: string;
}

export interface ExchangeRateData {
  rate: number;
  source: string;
  lastUpdate: string;
  buy: number;
  sell: number;
}

/**
 * Obtiene la tasa de cambio oficial del BCV (Banco Central de Venezuela)
 */
export const getBCVExchangeRate = async (): Promise<{
  success: boolean;
  data?: ExchangeRateData;
  error?: string;
}> => {
  try {
    const response = await fetch(`${DOLAR_API_BASE_URL}/dolares`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DolarAPIRate[] = await response.json();
    
    // Buscar la tasa oficial del BCV
    const bcvRate = data.find(
      item => item.fuente === 'oficial' || item.nombre.toLowerCase().includes('bcv')
    );

    if (!bcvRate) {
      return {
        success: false,
        error: 'No se encontró la tasa del BCV',
      };
    }

    const exchangeData: ExchangeRateData = {
      rate: bcvRate.promedio,
      source: bcvRate.fuente,
      lastUpdate: bcvRate.ultimaActualizacion,
      buy: bcvRate.compra,
      sell: bcvRate.venta,
    };

    console.log('✅ Tasa BCV obtenida:', exchangeData.rate);
    return { success: true, data: exchangeData };
  } catch (error: any) {
    console.error('❌ Error obteniendo tasa del BCV:', error);
    return {
      success: false,
      error: error.message || 'Error al obtener la tasa de cambio',
    };
  }
};

/**
 * Convierte un monto de USD a VES usando la tasa del BCV
 */
export const convertUSDToVES = (
  amountUSD: number,
  exchangeRate: number
): number => {
  return Number((amountUSD * exchangeRate).toFixed(2));
};

/**
 * Convierte un monto de VES a USD usando la tasa del BCV
 */
export const convertVESToUSD = (
  amountVES: number,
  exchangeRate: number
): number => {
  return Number((amountVES / exchangeRate).toFixed(2));
};

/**
 * Formatea un monto en bolívares con el símbolo Bs.
 */
export const formatVES = (amount: number): string => {
  return `Bs. ${amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Obtiene todas las tasas de cambio disponibles
 */
export const getAllExchangeRates = async (): Promise<{
  success: boolean;
  data?: DolarAPIRate[];
  error?: string;
}> => {
  try {
    const response = await fetch(`${DOLAR_API_BASE_URL}/dolares`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DolarAPIRate[] = await response.json();
    
    console.log('✅ Tasas de cambio obtenidas:', data.length);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Error obteniendo tasas de cambio:', error);
    return {
      success: false,
      error: error.message || 'Error al obtener las tasas de cambio',
    };
  }
};
