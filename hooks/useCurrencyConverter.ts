import { useState, useEffect, useCallback } from 'react';
import {
  getBCVExchangeRate,
  convertUSDToVES,
  formatVES,
  ExchangeRateData,
} from '../core/payments/dolar-api-service';

interface UseCurrencyConverterReturn {
  exchangeRate: number | null;
  exchangeData: ExchangeRateData | null;
  isLoading: boolean;
  error: string | null;
  convertToVES: (amountUSD: number) => number;
  formatVESAmount: (amount: number) => string;
  refreshRate: () => Promise<void>;
  lastUpdate: string | null;
}

/**
 * Hook personalizado para manejar la conversión de USD a VES
 * Obtiene automáticamente la tasa del BCV al montar el componente
 * y proporciona funciones para convertir y formatear montos
 */
export const useCurrencyConverter = (): UseCurrencyConverterReturn => {
  const [exchangeData, setExchangeData] = useState<ExchangeRateData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene la tasa de cambio del BCV
   */
  const fetchExchangeRate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getBCVExchangeRate();

    if (result.success && result.data) {
      setExchangeData(result.data);
      setError(null);
    } else {
      setError(result.error || 'Error al obtener la tasa de cambio');
      setExchangeData(null);
    }

    setIsLoading(false);
  }, []);

  /**
   * Obtiene la tasa al montar el componente
   */
  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  /**
   * Convierte un monto de USD a VES
   */
  const convertToVES = useCallback(
    (amountUSD: number): number => {
      if (!exchangeData) return 0;
      return convertUSDToVES(amountUSD, exchangeData.rate);
    },
    [exchangeData]
  );

  /**
   * Formatea un monto en bolívares
   */
  const formatVESAmount = useCallback((amount: number): string => {
    return formatVES(amount);
  }, []);

  /**
   * Refresca la tasa de cambio manualmente
   */
  const refreshRate = useCallback(async () => {
    await fetchExchangeRate();
  }, [fetchExchangeRate]);

  return {
    exchangeRate: exchangeData?.rate || null,
    exchangeData,
    isLoading,
    error,
    convertToVES,
    formatVESAmount,
    refreshRate,
    lastUpdate: exchangeData?.lastUpdate || null,
  };
};
