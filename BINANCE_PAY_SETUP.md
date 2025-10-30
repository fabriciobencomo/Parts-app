# Configuración de Binance Pay

Este documento explica cómo configurar Binance Pay para aceptar pagos con criptomonedas en tu aplicación.

## 📋 Requisitos Previos

1. **Cuenta de Binance**: Necesitas una cuenta verificada en Binance
2. **Cuenta Merchant**: Debes registrarte como comerciante en Binance Pay

## 🚀 Pasos para Configurar

### 1. Crear una Cuenta Merchant en Binance Pay

1. **Ir a Binance Pay Merchant**
   - Visita: https://merchant.binance.com/
   - Inicia sesión con tu cuenta de Binance

2. **Completar el Registro de Merchant**
   - Proporciona información de tu negocio
   - Completa la verificación KYB (Know Your Business)
   - Acepta los términos y condiciones

3. **Esperar Aprobación**
   - El proceso de aprobación puede tomar de 1-3 días hábiles
   - Recibirás un email cuando tu cuenta sea aprobada

### 2. Obtener las Credenciales de API

Una vez aprobada tu cuenta merchant:

1. **Ir al Dashboard de Merchant**
   - https://merchant.binance.com/dashboard

2. **Navegar a API Management**
   - En el menú lateral, selecciona "API Management"
   - Click en "Create API Key"

3. **Crear API Key**
   - Nombre: `Parts-App-Production` (o el nombre que prefieras)
   - Permisos: Selecciona "Order Management"
   - Click en "Create"

4. **Guardar las Credenciales**
   - **API Key** (Certificate SN): Copia y guarda de forma segura
   - **API Secret**: Copia y guarda de forma segura (solo se muestra una vez)
   - **Merchant ID**: Anota tu Merchant ID del dashboard

⚠️ **IMPORTANTE**: Guarda estas credenciales en un lugar seguro. El API Secret solo se muestra una vez.

### 3. Configurar Variables de Entorno

#### Opción A: Archivo `.env` (Recomendado para desarrollo)

Crea o edita el archivo `.env` en la raíz del proyecto:

```bash
# Binance Pay Configuration
EXPO_PUBLIC_BINANCE_PAY_API_KEY=tu_api_key_aqui
EXPO_PUBLIC_BINANCE_PAY_SECRET=tu_api_secret_aqui
EXPO_PUBLIC_BINANCE_PAY_MERCHANT_ID=tu_merchant_id_aqui
```

#### Opción B: Variables de entorno del sistema (Producción)

Para producción, configura las variables de entorno en tu plataforma de hosting:

```bash
EXPO_PUBLIC_BINANCE_PAY_API_KEY=tu_api_key_aqui
EXPO_PUBLIC_BINANCE_PAY_SECRET=tu_api_secret_aqui
EXPO_PUBLIC_BINANCE_PAY_MERCHANT_ID=tu_merchant_id_aqui
```

#### Opción C: `app.json` (No recomendado para producción)

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_BINANCE_PAY_API_KEY": "tu_api_key_aqui",
      "EXPO_PUBLIC_BINANCE_PAY_SECRET": "tu_api_secret_aqui",
      "EXPO_PUBLIC_BINANCE_PAY_MERCHANT_ID": "tu_merchant_id_aqui"
    }
  }
}
```

⚠️ **ADVERTENCIA DE SEGURIDAD**: Nunca subas tus credenciales a repositorios públicos.

### 4. Instalar Dependencias Adicionales

El servicio de Binance Pay requiere el módulo `crypto` para generar firmas HMAC. En React Native, necesitas un polyfill:

```bash
npm install react-native-get-random-values
npm install crypto-browserify
npm install stream-browserify
```

Luego, configura el polyfill en tu archivo principal (antes de cualquier importación):

```javascript
// En app/_layout.tsx o index.js
import 'react-native-get-random-values';
import { install } from 'react-native-quick-crypto';
install();
```

### 5. Configurar Metro Bundler

Edita `metro.config.js` para incluir los polyfills:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
};

module.exports = config;
```

### 6. Reiniciar la Aplicación

Después de configurar las variables y dependencias:

```bash
# Limpiar cache
npx expo start --clear

# O reiniciar normalmente
npx expo start
```

## 🧪 Modo de Prueba (Testnet)

Binance Pay ofrece un entorno de pruebas para desarrollo:

1. **Usar Binance Testnet**
   - URL: https://testnet.binance.vision/
   - Crea una cuenta de prueba
   - Obtén fondos de prueba (testnet faucet)

2. **Configurar URL de Testnet**
   
   En `core/payments/binance-pay-service.ts`, cambia:
   
   ```typescript
   const BINANCE_PAY_BASE_URL = 'https://bpay.binanceapi.com'; // Producción
   // a
   const BINANCE_PAY_BASE_URL = 'https://testnet.binance.vision/bpay'; // Testnet
   ```

## 💰 Criptomonedas Soportadas

Binance Pay soporta múltiples criptomonedas:

- **USDT** (Tether) - Stablecoin recomendada
- **BUSD** (Binance USD) - Stablecoin
- **BTC** (Bitcoin)
- **ETH** (Ethereum)
- **BNB** (Binance Coin)
- Y muchas más...

## 📱 Flujo de Pago

1. **Usuario selecciona Binance Pay** en el checkout
2. **Se genera una orden** con un código QR único
3. **Usuario escanea el QR** con la app de Binance
4. **Usuario confirma el pago** en su app de Binance
5. **Sistema verifica el pago** automáticamente (polling cada 5 segundos)
6. **Orden se marca como pagada** cuando se confirma el pago

## 🔒 Seguridad

### Mejores Prácticas

1. **Nunca expongas tus credenciales**
   - No las incluyas en el código fuente
   - Usa variables de entorno
   - Agrega `.env` a `.gitignore`

2. **Usa HTTPS en producción**
   - Todas las comunicaciones deben ser cifradas

3. **Valida los webhooks**
   - Verifica las firmas de los webhooks de Binance
   - Implementa verificación de IP whitelist

4. **Monitorea las transacciones**
   - Revisa regularmente el dashboard de Binance Merchant
   - Configura alertas para transacciones sospechosas

### Ejemplo de `.gitignore`

```gitignore
# Environment variables
.env
.env.local
.env.production

# Binance credentials
binance-credentials.txt
```

## 🔧 Solución de Problemas

### Error: "Binance Pay no está configurado"

**Causa**: Las variables de entorno no están configuradas correctamente.

**Solución**:
1. Verifica que las variables estén en el archivo `.env`
2. Reinicia el servidor de desarrollo
3. Verifica que los nombres de las variables sean exactos

### Error: "Invalid signature"

**Causa**: El API Secret es incorrecto o la firma no se genera correctamente.

**Solución**:
1. Verifica que el API Secret sea correcto
2. Asegúrate de que los polyfills de crypto estén instalados
3. Revisa que el timestamp esté en milisegundos

### Error: "Order expired"

**Causa**: El usuario no completó el pago dentro del tiempo límite (generalmente 15 minutos).

**Solución**:
- El usuario debe crear una nueva orden
- Considera aumentar el tiempo de expiración en la configuración

### El QR no se muestra

**Causa**: Problemas con la generación del QR o la URL.

**Solución**:
1. Verifica la consola para errores
2. Asegúrate de que la API de QR esté accesible
3. Revisa que `qrContent` se esté recibiendo correctamente

## 📊 Monitoreo y Reportes

### Dashboard de Binance Merchant

Accede a https://merchant.binance.com/dashboard para:

- Ver todas las transacciones
- Descargar reportes
- Configurar webhooks
- Gestionar reembolsos
- Ver estadísticas de ventas

### Webhooks (Opcional)

Para recibir notificaciones en tiempo real de pagos:

1. **Configurar Webhook URL** en el dashboard de Binance Merchant
2. **Implementar endpoint** en tu backend para recibir notificaciones
3. **Verificar firma** de los webhooks para seguridad

Ejemplo de webhook endpoint:

```typescript
// En tu backend
app.post('/api/webhooks/binance-pay', async (req, res) => {
  const signature = req.headers['binancepay-signature'];
  const payload = req.body;
  
  // Verificar firma
  if (verifySignature(payload, signature)) {
    // Procesar evento
    if (payload.bizType === 'PAY' && payload.bizStatus === 'PAY_SUCCESS') {
      // Actualizar orden como pagada
      await updateOrderStatus(payload.merchantTradeNo, 'paid');
    }
  }
  
  res.status(200).send('OK');
});
```

## 🌐 URLs Útiles

- **Binance Pay Merchant**: https://merchant.binance.com/
- **Documentación API**: https://developers.binance.com/docs/binance-pay/introduction
- **Soporte**: https://www.binance.com/en/support
- **Status de la API**: https://www.binance.com/en/support/announcement

## 📞 Soporte

Si tienes problemas con Binance Pay:

1. **Documentación oficial**: https://developers.binance.com/docs/binance-pay
2. **Soporte de Binance**: https://www.binance.com/en/chat
3. **Email de soporte merchant**: merchant@binance.com

## ✅ Checklist de Implementación

- [ ] Cuenta de Binance creada y verificada
- [ ] Cuenta Merchant aprobada
- [ ] API Key y Secret obtenidos
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas (crypto polyfills)
- [ ] Metro config actualizado
- [ ] Probado en modo testnet
- [ ] Probado en producción con transacción real
- [ ] Webhooks configurados (opcional)
- [ ] Monitoreo configurado

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación estará lista para aceptar pagos con criptomonedas a través de Binance Pay.

Los usuarios podrán:
- Seleccionar Binance Pay en el checkout
- Escanear un código QR con su app de Binance
- Pagar con USDT, BTC, ETH, BNB u otras criptomonedas
- Recibir confirmación instantánea del pago
