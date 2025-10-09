import { useState, useEffect } from 'react';

/**
 * Hook que retrasa la actualización de un valor hasta que haya pasado un tiempo sin cambios
 * @param value - Valor a debounce
 * @param delay - Tiempo de retraso en milisegundos
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configurar un timer que actualice el valor debounced después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timeout si el valor cambia antes de que se ejecute
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
