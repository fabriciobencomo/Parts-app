# Integración de DolarAPI para Conversión USD a VES

## 📋 Descripción

Este proyecto integra la API de DolarAPI (https://ve.dolarapi.com) para obtener la tasa de cambio oficial del BCV (Banco Central de Venezuela) y convertir precios de USD a VES en tiempo real.

## 🚀 Características Implementadas

### 1. Servicio de DolarAPI (`core/payments/dolar-api-service.ts`)

Servicio que consume la API de DolarAPI para:
- ✅ Obtener la tasa de cambio oficial del BCV
- ✅ Convertir montos de USD a VES
- ✅ Convertir montos de VES a USD
- ✅ Formatear montos en bolívares con el símbolo Bs.
- ✅ Obtener todas las tasas de cambio disponibles

**Funciones principales:**

```typescript
// Obtener tasa del BCV
const result = await getBCVExchangeRate();
// result.data.rate contiene la tasa de cambio

// Convertir USD a VES
const vesAmount = convertUSDToVES(100, exchangeRate);

// Formatear en bolívares
const formatted = formatVES(45000.50); // "Bs. 45.000,50"
```

### 2. Hook Personalizado (`hooks/useCurrencyConverter.ts`)

Hook de React que facilita el uso de la conversión de moneda en componentes:

```typescript
const {
  exchangeRate,      // Tasa actual del BCV
  exchangeData,      // Datos completos de la tasa
  isLoading,         // Estado de carga
  error,             // Error si existe
  convertToVES,      // Función para convertir USD a VES
  formatVESAmount,   // Función para formatear en Bs.
  refreshRate,       // Función para actualizar la tasa manualmente
  lastUpdate,        // Última actualización de la tasa
} = useCurrencyConverter();
```

**Características:**
- ✅ Obtiene automáticamente la tasa al montar el componente
- ✅ Manejo de estados de carga y errores
- ✅ Funciones memoizadas para optimizar rendimiento
- ✅ Capacidad de refrescar la tasa manualmente

### 3. Componente Reutilizable (`presentation/shared/components/PriceDisplay.tsx`)

Componente para mostrar precios en USD y VES:

```typescript
<PriceDisplay 
  priceUSD={100} 
  showVES={true}
  usdStyle={{ fontSize: 24 }}
  vesStyle={{ fontSize: 16 }}
/>
```

### 4. Integración en Checkout

El componente de checkout (`app/(parts-app)/(tabs)/(stack)/checkout/index.tsx`) ahora incluye:

- ✅ Opción de pago "Pago Móvil" con badge VES
- ✅ Conversión automática del total a bolívares cuando se selecciona Pago Móvil
- ✅ Visualización de la tasa de cambio del BCV
- ✅ Indicadores de carga y error para la tasa

**Ejemplo visual en checkout:**

```
Total: $52.50
─────────────────────
Equivalente en Bs.: Bs. 2.100,00
Tasa BCV: 40.00 Bs/$
```

### 5. Integración en Detalle de Producto

El componente de detalle de producto (`app/(parts-app)/(tabs)/(stack)/part/[id].tsx`) muestra:

- ✅ Precio en USD
- ✅ Precio equivalente en VES debajo del precio en USD
- ✅ Actualización automática de la tasa

**Ejemplo visual:**

```
$100.00
Bs. 4.000,00
```

## 📦 Métodos de Pago Disponibles

El sistema ahora soporta los siguientes métodos de pago:

1. **Efectivo** 💵
2. **Tarjeta** 💳
3. **Transferencia** 🔄
4. **Pago Móvil** 📱 (VES) - ¡NUEVO!
5. **Binance Pay** ₿ (Crypto)

## 🔧 Uso en Componentes

### Ejemplo básico con el hook:

```typescript
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

const MyComponent = () => {
  const { exchangeRate, convertToVES, formatVESAmount } = useCurrencyConverter();
  
  const priceUSD = 100;
  const priceVES = convertToVES(priceUSD);
  
  return (
    <View>
      <Text>Precio: ${priceUSD}</Text>
      {exchangeRate && (
        <Text>Equivalente: {formatVESAmount(priceVES)}</Text>
      )}
    </View>
  );
};
```

### Ejemplo con el componente PriceDisplay:

```typescript
import { PriceDisplay } from '@/presentation/shared/components/PriceDisplay';

const ProductCard = ({ price }) => {
  return (
    <View>
      <PriceDisplay 
        priceUSD={price}
        showVES={true}
      />
    </View>
  );
};
```

## 🌐 API de DolarAPI

**Endpoint:** `https://ve.dolarapi.com/v1/dolares`

**Respuesta:**
```json
[
  {
    "fuente": "oficial",
    "nombre": "BCV",
    "promedio": 40.50,
    "compra": 40.45,
    "venta": 40.55,
    "fecha": "2024-01-15",
    "ultimaActualizacion": "2024-01-15T10:30:00Z"
  }
]
```

## 📝 Notas Importantes

1. **Sin autenticación requerida**: DolarAPI es una API pública y gratuita
2. **Tasa oficial del BCV**: Se utiliza la tasa oficial del Banco Central de Venezuela
3. **Actualización automática**: La tasa se obtiene al cargar cada componente que use el hook
4. **Manejo de errores**: El sistema maneja errores de conexión y muestra mensajes apropiados
5. **Rendimiento**: Las funciones están optimizadas con `useCallback` para evitar re-renders innecesarios

## 🎯 Próximos Pasos Sugeridos

- [ ] Implementar caché de la tasa de cambio (válida por X horas)
- [ ] Agregar opción para seleccionar otras tasas (paralelo, etc.)
- [ ] Mostrar histórico de tasas
- [ ] Agregar notificaciones cuando la tasa cambie significativamente
- [ ] Implementar conversión en más componentes (lista de productos, carrito, etc.)

## 🔗 Referencias

- **DolarAPI Docs**: https://ve.dolarapi.com/docs
- **BCV**: https://www.bcv.org.ve

## 💡 Ejemplo de Flujo de Pago Móvil

1. Usuario selecciona productos y va al checkout
2. Selecciona "Pago Móvil" como método de pago
3. El sistema muestra automáticamente:
   - Total en USD
   - Equivalente en VES usando la tasa del BCV
   - La tasa de cambio utilizada
4. Usuario confirma la orden
5. En el backend, la orden se guarda con `paymentMethod: "pago_movil"`
6. Usuario puede agregar la referencia del pago en las notas

## ✅ Checklist de Implementación

- [x] Crear servicio de DolarAPI
- [x] Crear hook personalizado
- [x] Integrar en checkout
- [x] Integrar en detalle de producto
- [x] Agregar opción de Pago Móvil
- [x] Crear componente reutilizable PriceDisplay
- [x] Documentación completa

---

**Última actualización**: Octubre 2024
