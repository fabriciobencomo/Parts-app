import { Stack } from 'expo-router';
import { useAuthStore } from '@/presentation/store/useAuthStore';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  const { status } = useAuthStore();

  // If user is authenticated, redirect to main app
  if (status === 'authenticated') {
    return <Redirect href="/(parts-app)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,  // Disable swipe gestures
        animation: 'none',      // Disable transition animations
      }}
    >
      <Stack.Screen
        name="welcome/index"
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login/index"
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register/index"
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
    </Stack>
  );
}