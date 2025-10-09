# Configuración de Notificaciones de Telegram

Este documento explica cómo configurar las notificaciones de Telegram para recibir alertas cuando se creen nuevos pedidos.

## 📋 Pasos para Configurar

### 1. Crear un Bot de Telegram

1. **Abrir Telegram** y buscar `@BotFather`
2. **Iniciar conversación** con BotFather
3. **Crear nuevo bot** enviando `/newbot`
4. **Elegir nombre** para tu bot (ej: "Parts App Notifications")
5. **Elegir username** para tu bot (ej: "parts_app_notifications_bot")
6. **Copiar el token** que te proporciona BotFather

### 2. Obtener tu Chat ID

#### Opción A: Usando tu bot
1. **Busca tu bot** en Telegram usando el username que creaste
2. **Envía cualquier mensaje** a tu bot (ej: "Hola")
3. **Abre en navegador**: `https://api.telegram.org/bot<TU_BOT_TOKEN>/getUpdates`
4. **Busca el "chat"** en la respuesta JSON
5. **Copia el "id"** (será un número como `123456789`)

#### Opción B: Usando @userinfobot
1. **Buscar** `@userinfobot` en Telegram
2. **Enviar** `/start`
3. **Copiar tu User ID**

### 3. Configurar Variables de Entorno

#### En archivo `.env` (recomendado):
```bash
EXPO_PUBLIC_TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
EXPO_PUBLIC_TELEGRAM_CHAT_ID=123456789
```

#### En `app.json` (alternativa):
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_TELEGRAM_BOT_TOKEN": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",
      "EXPO_PUBLIC_TELEGRAM_CHAT_ID": "123456789"
    }
  }
}
```

### 4. Reiniciar la Aplicación

Después de configurar las variables:
```bash
# Detener el servidor de desarrollo
# Ctrl + C

# Reiniciar
npx expo start
```

## 🔧 Configuración para Grupos (Opcional)

Si quieres recibir notificaciones en un grupo:

1. **Crear grupo** en Telegram
2. **Agregar tu bot** al grupo
3. **Hacer admin al bot** (opcional, para garantizar que pueda enviar mensajes)
4. **Enviar mensaje** en el grupo mencionando al bot: `@tu_bot_username hola`
5. **Obtener Chat ID del grupo** usando: `https://api.telegram.org/bot<TU_BOT_TOKEN>/getUpdates`
6. **Usar el Chat ID del grupo** (será negativo, ej: `-123456789`)

## 📱 Tipos de Notificaciones

### Nuevo Pedido
```
🛒 NUEVO PEDIDO RECIBIDO

📋 ID del Pedido: #12345
👤 Cliente: Juan Pérez
📅 Fecha del Pedido: 27/09/2025 23:30
🚚 Fecha de Entrega: 28/09/2025
📍 Dirección: Av. Bolívar 123, Valencia
💳 Método de Pago: Efectivo
📊 Estado: pendiente

📦 PRODUCTOS:
1. Filtro de Aceite
   • Cantidad: 2
   • Precio unitario: $15.00
   • Subtotal: $30.00

💰 RESUMEN FINANCIERO:
• Subtotal: $30.00
• Impuestos: $2.50
• TOTAL: $32.50
```

### Cambio de Estado
```
🔄 CAMBIO DE ESTADO DE PEDIDO

📋 ID del Pedido: #12345
👤 Cliente: Juan Pérez
📊 Estado anterior: pendiente
📊 Nuevo estado: en_proceso
```

## 🛠️ Solución de Problemas

### Bot no envía mensajes
- ✅ Verificar que el token sea correcto
- ✅ Verificar que el Chat ID sea correcto
- ✅ Asegurarse de haber enviado al menos un mensaje al bot
- ✅ Verificar que las variables de entorno estén configuradas

### Mensajes no llegan al grupo
- ✅ Verificar que el bot esté en el grupo
- ✅ Verificar que el bot tenga permisos para enviar mensajes
- ✅ Usar el Chat ID negativo del grupo

### Variables de entorno no se cargan
- ✅ Reiniciar el servidor de desarrollo
- ✅ Verificar que las variables empiecen con `EXPO_PUBLIC_`
- ✅ Verificar sintaxis del archivo `.env`

## 🔒 Seguridad

- ❌ **NO** subir el token del bot a repositorios públicos
- ✅ **SÍ** usar variables de entorno
- ✅ **SÍ** agregar `.env` al `.gitignore`
- ✅ **SÍ** usar tokens diferentes para desarrollo y producción

## 📞 Soporte

Si tienes problemas con la configuración:
1. Verificar que BotFather haya creado el bot correctamente
2. Probar el bot manualmente enviando mensajes
3. Verificar los logs de la aplicación para errores de Telegram
4. Consultar la documentación oficial de Telegram Bot API
