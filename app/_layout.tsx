import { DarkTheme, DefaultTheme, ThemeProvider, useTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { configureReanimatedLogger } from 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Desactivar modo estricto de Reanimated
configureReanimatedLogger({ strict: false });

import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SFUITextBold: require('../assets/fonts/SFUIText-Bold.ttf'),
    SFUITextBoldItalic: require('../assets/fonts/SFUIText-BoldItalic.ttf'),
    SFUITextHeavy: require('../assets/fonts/SFUIText-Heavy.ttf'),
    SFUITextHeavyItalic: require('../assets/fonts/SFUIText-HeavyItalic.ttf'),
    SFUITextLight: require('../assets/fonts/SFUIText-Light.ttf'),
    SFUITextLightItalic: require('../assets/fonts/SFUIText-LightItalic.ttf'),
    SFUITextMedium: require('../assets/fonts/SFUIText-Medium.ttf'),
    SFUITextMediumItalic: require('../assets/fonts/SFUIText-MediumItalic.ttf'),
    SFUITextRegular: require('../assets/fonts/SFUIText-Regular.ttf'),
    SFUITextRegularItalic: require('../assets/fonts/SFUIText-RegularItalic.ttf'),
    SFUITextSemibold: require('../assets/fonts/SFUIText-Semibold.ttf'),
    SFUITextSemiboldItalic: require('../assets/fonts/SFUIText-SemiboldItalic.ttf')
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* <Stack.Screen name="/" options={{ headerShown: false }} /> */}
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
