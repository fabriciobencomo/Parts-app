import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

interface PriceDisplayProps {
  priceUSD: number;
  showVES?: boolean;
  usdStyle?: object;
  vesStyle?: object;
  containerStyle?: object;
}

/**
 * Componente reutilizable para mostrar precios en USD y VES
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  priceUSD,
  showVES = true,
  usdStyle,
  vesStyle,
  containerStyle,
}) => {
  const { exchangeRate, convertToVES, formatVESAmount, isLoading } = useCurrencyConverter();

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.priceUSD, usdStyle]}>${priceUSD.toFixed(2)}</Text>
      {showVES && exchangeRate && (
        <View style={styles.vesContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <Text style={[styles.priceVES, vesStyle]}>
              {formatVESAmount(convertToVES(priceUSD))}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  priceUSD: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  vesContainer: {
    marginTop: 2,
  },
  priceVES: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});
