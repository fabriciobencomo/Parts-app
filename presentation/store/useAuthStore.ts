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
      } else {
        // No valid response, set as unauthenticated
        set({ status: 'unauthenticated', token: undefined, user: undefined });
        await SecureStorageAdapter.removeItem('token');
      }
    } catch (error) {
      console.log('Check status error:', error);
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
    const currentUser = get().user;
    if (!currentUser?.id) return;

    const userData = await getUserById(currentUser.id);
    if (userData) {
      set({ user: userData });
    }
  },

  logout: async () => {
    SecureStorageAdapter.removeItem('token');

    set({ status: 'unauthenticated', token: undefined, user: undefined });
  },
}));