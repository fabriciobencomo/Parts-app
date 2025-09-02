/**
 * Helpers para formatear valores de manera segura
 */

/**
 * Formatea un precio de manera segura
 * @param price - El precio a formatear
 * @param defaultValue - Valor por defecto si price es undefined/null
 * @returns String formateado del precio
 */
export const formatPrice = (price: number | undefined | null, defaultValue: number = 0): string => {
  const safePrice = price ?? defaultValue;
  return safePrice.toFixed(2);
};

/**
 * Formatea un precio con símbolo de moneda
 * @param price - El precio a formatear
 * @param currency - Símbolo de moneda (por defecto $)
 * @param defaultValue - Valor por defecto si price es undefined/null
 * @returns String formateado del precio con moneda
 */
export const formatCurrency = (
  price: number | undefined | null, 
  currency: string = '$', 
  defaultValue: number = 0
): string => {
  return `${currency}${formatPrice(price, defaultValue)}`;
};

/**
 * Formatea un número de manera segura
 * @param value - El valor a formatear
 * @param defaultValue - Valor por defecto si value es undefined/null
 * @returns Número seguro
 */
export const formatNumber = (value: number | undefined | null, defaultValue: number = 0): number => {
  return value ?? defaultValue;
};

/**
 * Verifica si un precio es válido
 * @param price - El precio a verificar
 * @returns true si el precio es válido
 */
export const isValidPrice = (price: number | undefined | null): boolean => {
  return price !== null && price !== undefined && !isNaN(price) && price >= 0;
};
