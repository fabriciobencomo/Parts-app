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
    const isInAuthGroup = segments[0] === 'auth';
    const isInMainApp = segments[0] === '(parts-app)';
    
    // If user is authenticated and trying to access auth pages
    if (status === 'authenticated' && isInAuthGroup) {
      // User is authenticated but in auth pages, redirect to home
      router.replace('/(parts-app)');
    }
    
    // If user is unauthenticated and trying to access main app
    if (status === 'unauthenticated' && isInMainApp) {
      // User is not authenticated but in main app, redirect to auth
      router.replace('/auth/welcome');
    }
  }, [status, segments]);

  return {
    isAuthenticatedInAuthPages: status === 'authenticated' && segments[0] === 'auth',
    currentSegments: segments,
    authStatus: status
  };
}