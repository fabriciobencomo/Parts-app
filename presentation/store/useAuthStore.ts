// To fix the error, install zustand by running:
// npm install zustand
import { create } from 'zustand';
import type { User } from '@/core/auth/interface/user.interface';
import { 
  authCheckStatus, 
  authLogin, 
  authRegister, 
  getUserById,
  updateUser,
  type RegisterData,
  type UpdateUserData 
} from '@/core/auth/actions/auth-actions';
import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';

export interface AuthState {
  status: AuthStatus;
  token?: string;
  user?: User;

  login: (email: string, password: string) => Promise<boolean>;
  register: (registerData: RegisterData) => Promise<boolean>;
  checkStatus: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updateData: UpdateUserData) => Promise<boolean>;
  refreshUserData: () => Promise<void>;

  changeStatus: (token?: string, user?: User) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Properties
  status: 'checking',
  token: undefined,
  user: undefined,

  // Actions
  changeStatus: async (token?: string, user?: User | null) => {
    if (!token) {
      console.log('Invalid token in changeStatus:', { hasToken: !!token, hasUser: !!user });
      set({ status: 'unauthenticated', token: undefined, user: undefined });
      await SecureStorageAdapter.removeItem('token');
      return false;
    }

    set({
      status: 'authenticated',
      token: token,
      user: user || undefined,
    });

    await SecureStorageAdapter.setItem('token', token);

    return true;
  },

  login: async (email: string, password: string) => {
    const resp = await authLogin(email, password);
    return get().changeStatus(resp?.token, resp?.user);
  },

  register: async (registerData: RegisterData) => {
    const resp = await authRegister(registerData);
    return get().changeStatus(resp?.token, resp?.user);
  },

  checkStatus: async () => {
    try {
      const resp = await authCheckStatus();
      if (resp?.token) {
        get().changeStatus(resp.token, resp.user);
        
        // If we have a token but no user data, try to load user data
        if (!resp.user && resp.token) {
          get().refreshUserData();
        }
      } else {
        // No valid response, set as unauthenticated
        set({ status: 'unauthenticated', token: undefined, user: undefined });
        await SecureStorageAdapter.removeItem('token');
      }
    } catch (error) {
      // Error occurred, set as unauthenticated
      set({ status: 'unauthenticated', token: undefined, user: undefined });
      await SecureStorageAdapter.removeItem('token');
    }
  },

  updateProfile: async (updateData: UpdateUserData) => {
    const currentUser = get().user;
    if (!currentUser?.id) return false;

    const updatedUser = await updateUser(currentUser.id, updateData);
    if (updatedUser) {
      set({ user: updatedUser });
      return true;
    }
    return false;
  },

  refreshUserData: async () => {
    const { user: currentUser, token } = get();
    
    // If we have user data, use the user ID
    if (currentUser?.id) {
      const userData = await getUserById(currentUser.id);
      if (userData) {
        set({ user: userData });
      }
      return;
    }
    
    // If we don't have user data but have a token, decode it to get user ID
    if (token && !currentUser) {
      try {
        // Import the auth actions here to avoid circular dependency
        const { authCheckStatus } = await import('@/core/auth/actions/auth-actions');
        const authData = await authCheckStatus();
        
        if (authData?.user) {
          set({ user: authData.user });
        }
      } catch (error) {
        // Could not refresh user data
      }
    }
  },

  logout: async () => {
    SecureStorageAdapter.removeItem('token');
    SecureStorageAdapter.removeItem('sessionId'); // ← Limpiar session ID también

    set({ status: 'unauthenticated', token: undefined, user: undefined });
  },
}));