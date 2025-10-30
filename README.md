# Parts App - E-commerce con Múltiples Métodos de Pago 🛒

Aplicación de e-commerce desarrollada con [Expo](https://expo.dev) y React Native que incluye integración con múltiples métodos de pago incluyendo Binance Pay, Pago Móvil BDV y conversión automática USD→VES.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## 💳 Métodos de Pago Integrados

Esta aplicación incluye múltiples métodos de pago:

- **Efectivo** 💵
- **Tarjeta** 💳
- **Transferencia** 🔄
- **Pago Móvil BDV** 📱 - Con validación en tiempo real
- **Binance Pay** ₿ - Pagos con criptomonedas

### Documentación de Integraciones

- **[Pago Móvil BDV](./BDV_PAGO_MOVIL_SETUP.md)** - API de Conciliación del Banco de Venezuela
- **[Conversión USD→VES](./DOLAR_API_SETUP.md)** - Integración con DolarAPI para tasa BCV
- **[Binance Pay](./BINANCE_PAY_SETUP.md)** - Pagos con criptomonedas
- **[Notificaciones Telegram](./TELEGRAM_SETUP.md)** - Sistema de notificaciones

## 🔧 Configuración

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configura las variables de entorno necesarias:
   - API del backend
   - Credenciales de Binance Pay (opcional)
   - API Key de BDV Pago Móvil
   - Token de Telegram Bot (opcional)

3. Instala las dependencias y ejecuta la app (ver sección "Get started" arriba)

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
