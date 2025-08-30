import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/presentation/store/useAuthStore';

/**
 * Navigation guard hook to prevent unauthorized access to auth pages
 * when user is authenticated
 */
export function useNavigationGuard() {
  const { status } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // If user is authenticated and trying to access auth pages
    if (status === 'authenticated') {
      const isInAuthGroup = segments[0] === 'auth';
      
      if (isInAuthGroup) {
        // User is authenticated but in auth pages, redirect to home
        console.log('🚫 Authenticated user detected in auth pages, redirecting to home');
        router.replace('/(parts-app)/(tabs)/(stack)/home');
      }
    }
  }, [status, segments]);

  return {
    isAuthenticatedInAuthPages: status === 'authenticated' && segments[0] === 'auth',
    currentSegments: segments,
    authStatus: status
  };
}