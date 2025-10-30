# Integración de API de Pago Móvil BDV

## 📋 Descripción

Este proyecto integra la **API de Conciliación del Banco de Venezuela (BDV)** para validar pagos móviles en tiempo real. La API permite verificar que un pago móvil se haya realizado correctamente antes de confirmar una orden.

## 🔑 Características Clave

- ✅ **Validación en tiempo real** de pagos móviles
- ✅ **Conciliación automática** con el BDV
- ✅ **Soporte multi-banco** (BDV, Mercantil, Banesco, Provincial, etc.)
- ✅ **Conversión automática** USD → VES usando tasa BCV
- ✅ **Interfaz amigable** para ingresar datos del pago
- ✅ **Validación de formato** de datos (cédula, teléfono, fecha, importe)

## 🚀 Configuración

### 1. Variables de Entorno

Agrega las siguientes variables en tu archivo `.env`:

```bash
# BDV Pago Móvil Configuration
EXPO_PUBLIC_BDV_API_URL=https://bdvconciliacionqa.banvenez.com:444/getMovement
EXPO_PUBLIC_BDV_API_KEY=96R7T1T5J2134T5YFC2GF15SDFG4BD1Z
EXPO_PUBLIC_BDV_TELEFONO_DESTINO=04127141363
```

**Importante:**
- `BDV_API_URL`: URL del endpoint de conciliación (QA o Producción)
- `BDV_API_KEY`: API Key proporcionada por el BDV
- `BDV_TELEFONO_DESTINO`: Número de teléfono que recibirá los pagos móviles

### 2. Endpoint de la API

**URL (QA):** `https://bdvconciliacionqa.banvenez.com:444/getMovement`

**Método:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "X-API-Key": "96R7T1T5J2134T5YFC2GF15SDFG4BD1Z"
}
```

## 📦 Archivos Implementados

### 1. **Servicio BDV** (`core/payments/bdv-pago-movil-service.ts`)

Servicio principal que maneja la comunicación con la API del BDV:

```typescript
import { validatePagoMovil } from '@/core/payments/bdv-pago-movil-service';

const result = await validatePagoMovil({
  cedulaPagador: "V27037606",
  telefonoPagador: "04127141363",
  telefonoDestino: "04127141363",
  referencia: "123456789",
  fechaPago: "2024-10-24",
  importe: "120.00",
  bancoOrigen: "0102",
  reqCed: false
});

if (result.validated) {
  console.log('✅ Pago validado:', result.amount);
}
```

**Funciones principales:**

- `validatePagoMovil()`: Valida un pago móvil contra la API
- `formatCedula()`: Formatea cédulas venezolanas (agrega prefijo V/E/J/G)
- `formatPhoneNumber()`: Formatea números de teléfono (11 dígitos)
- `formatImporte()`: Formatea montos con 2 decimales y punto
- `formatFechaPago()`: Formatea fechas en formato YYYY-MM-DD
- `getBankName()`: Obtiene el nombre del banco por su código

### 2. **Pantalla de Validación** (`app/(parts-app)/(tabs)/(stack)/payment/pago-movil.tsx`)

Interfaz completa para que el usuario ingrese los datos del pago móvil:

**Características:**
- ✅ Muestra el monto en USD y VES
- ✅ Muestra el teléfono destino
- ✅ Formulario para datos del pago (cédula, teléfono, referencia, fecha)
- ✅ Selector de banco origen
- ✅ Validación de formato en tiempo real
- ✅ Indicadores de carga durante validación
- ✅ Mensajes de éxito/error claros

### 3. **Integración en Checkout** (`app/(parts-app)/(tabs)/(stack)/checkout/index.tsx`)

El checkout ahora redirige a la pantalla de validación cuando se selecciona "Pago Móvil":

```typescript
if (orderData.paymentMethod === 'pago_movil') {
  router.push({
    pathname: '/(parts-app)/(tabs)/(stack)/payment/pago-movil',
    params: {
      amount: totals.total.toString(),
      orderData: JSON.stringify(orderData),
    },
  });
}
```

## 📝 Parámetros de la API

### Request (JSON de Entrada)

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `cedulaPagador` | string | "V27037606" | Cédula del pagador (con prefijo V/E/J/G) |
| `telefonoPagador` | string | "04127141363" | Teléfono de quien ejecuta el pago (11 dígitos) |
| `telefonoDestino` | string | "04127141363" | Teléfono de quien recibe el pago (11 dígitos) |
| `referencia` | string | "123456789" | Número de referencia de la transacción |
| `fechaPago` | string | "2024-10-24" | Fecha del pago (formato YYYY-MM-DD) |
| `importe` | string | "120.00" | Monto del pago (usar punto para decimales) |
| `bancoOrigen` | string | "0102" | Código del banco origen (4 dígitos) |
| `reqCed` | boolean | false | true solo para BDV-BDV, false en otros casos |

### Response (JSON de Salida)

**Respuesta Exitosa (código 1000):**
```json
{
  "code": 1000,
  "message": "Monto: 120.00 - estatus: Transaccion realizada",
  "data": {
    "status": "1000",
    "amount": "120.00",
    "reason": "Transaccion realizada"
  },
  "status": 200
}
```

**Respuesta de Error (código 1010):**
```json
{
  "code": 1010,
  "message": "No se pudo validar el movimiento: monto: 120.00 - estatus: Transaccion realizada",
  "data": null,
  "status": 200
}
```

## 🏦 Códigos de Bancos Soportados

```typescript
export const BANK_CODES = {
  BDV: '0102',        // Banco de Venezuela
  MERCANTIL: '0105',  // Banco Mercantil
  BANESCO: '0134',    // Banesco
  PROVINCIAL: '0108', // Banco Provincial
  BOD: '0116',        // Banco Occidental de Descuento
  EXTERIOR: '0115',   // Banco Exterior
  BICENTENARIO: '0175', // Banco Bicentenario
  VENEZUELA: '0104',  // Banco de Venezuela
  BANCARIBE: '0114',  // Bancaribe
  BNC: '0191',        // Banco Nacional de Crédito
};
```

## 🔄 Flujo de Usuario

1. **Usuario selecciona productos** y va al checkout
2. **Selecciona "Pago Móvil"** como método de pago
3. Sistema muestra:
   - Total en USD
   - Equivalente en VES (usando tasa BCV)
   - Teléfono destino para el pago
4. **Usuario realiza el pago móvil** desde su banco
5. **Usuario ingresa datos** en la app:
   - Cédula del pagador
   - Teléfono del pagador
   - Número de referencia
   - Fecha del pago
   - Banco origen
6. **Sistema valida el pago** con la API del BDV
7. Si es exitoso:
   - ✅ Crea la orden automáticamente
   - ✅ Guarda los datos del pago en las notas
   - ✅ Muestra confirmación al usuario
8. Si falla:
   - ❌ Muestra mensaje de error
   - ❌ Permite reintentar

## 💡 Ejemplos de Uso

### Validar un Pago Móvil

```typescript
import {
  validatePagoMovil,
  formatCedula,
  formatPhoneNumber,
  formatImporte,
} from '@/core/payments/bdv-pago-movil-service';

const validarPago = async () => {
  const result = await validatePagoMovil({
    cedulaPagador: formatCedula('27037606'),      // "V27037606"
    telefonoPagador: formatPhoneNumber('4127141363'), // "04127141363"
    telefonoDestino: '04127141363',
    referencia: '123456789',
    fechaPago: '2024-10-24',
    importe: formatImporte(120.50),               // "120.50"
    bancoOrigen: '0102',
    reqCed: false,
  });

  if (result.validated) {
    console.log('✅ Pago validado exitosamente');
    console.log('Monto:', result.amount);
    console.log('Razón:', result.reason);
  } else {
    console.log('❌ Pago no validado:', result.error);
  }
};
```

### Formatear Datos

```typescript
import {
  formatCedula,
  formatPhoneNumber,
  formatImporte,
  formatFechaPago,
} from '@/core/payments/bdv-pago-movil-service';

// Formatear cédula
const cedula = formatCedula('12345678');        // "V12345678"
const cedulaE = formatCedula('E12345678');      // "E12345678"

// Formatear teléfono
const phone = formatPhoneNumber('4127141363');  // "04127141363"
const phone2 = formatPhoneNumber('04127141363'); // "04127141363"

// Formatear importe
const amount = formatImporte(120.5);            // "120.50"
const amount2 = formatImporte(100);             // "100.00"

// Formatear fecha
const date = formatFechaPago(new Date());       // "2024-10-24"
```

## ⚠️ Validaciones Importantes

### 1. Formato de Fecha
❌ **Incorrecto:** `2024/10/24` o `24-10-2024`  
✅ **Correcto:** `2024-10-24`

### 2. Formato de Importe
❌ **Incorrecto:** `120` o `120,50`  
✅ **Correcto:** `120.00` o `120.50`

### 3. Formato de Teléfono
❌ **Incorrecto:** `4127141363` (10 dígitos)  
✅ **Correcto:** `04127141363` (11 dígitos con 0 inicial)

### 4. Formato de Cédula
❌ **Incorrecto:** `12345678` (sin prefijo)  
✅ **Correcto:** `V12345678` o `E12345678`

## 🔐 Seguridad

- ✅ API Key se almacena en variables de entorno
- ✅ No se almacenan datos sensibles en el frontend
- ✅ Validación de formato antes de enviar a la API
- ✅ Manejo seguro de errores
- ✅ Los datos del pago se guardan encriptados en las notas de la orden

## 🧪 Testing

### Datos de Prueba (QA)

```typescript
const testData = {
  cedulaPagador: "V27037606",
  telefonoPagador: "04127141363",
  telefonoDestino: "04127141363",
  referencia: "123456789",
  fechaPago: "2024-10-24",
  importe: "120.00",
  bancoOrigen: "0102",
  reqCed: false
};
```

### Casos de Prueba

1. **Pago exitoso:** Usar datos correctos → Código 1000
2. **Fecha incorrecta:** Usar formato `2024/10/24` → Código 1010
3. **Referencia inválida:** Usar referencia inexistente → Código 1010
4. **Monto incorrecto:** Usar monto diferente → Código 1010

## 📊 Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 1000 | ✅ Transacción validada exitosamente |
| 1010 | ❌ No se pudo validar el movimiento |
| 200 | Status HTTP OK |

## 🎯 Próximos Pasos Sugeridos

- [ ] Implementar caché de validaciones (evitar duplicados)
- [ ] Agregar histórico de pagos móviles validados
- [ ] Implementar notificaciones push al validar pago
- [ ] Agregar soporte para múltiples teléfonos destino
- [ ] Implementar webhook para notificaciones del BDV
- [ ] Agregar dashboard de conciliación

## 🔗 Referencias

- **API de Conciliación BDV**: Documentación interna del banco
- **DolarAPI**: https://ve.dolarapi.com (para conversión USD→VES)

## ✅ Checklist de Implementación

- [x] Crear servicio de API BDV
- [x] Agregar variables de entorno
- [x] Crear pantalla de validación
- [x] Integrar en flujo de checkout
- [x] Implementar validaciones de formato
- [x] Agregar manejo de errores
- [x] Crear documentación completa
- [x] Integrar con conversión USD→VES

---

**Última actualización**: Octubre 2024

## 💬 Soporte

Para problemas con la API del BDV, contactar al equipo de soporte del banco.
Para problemas con la implementación, revisar los logs en la consola.
