import { productsApi } from '../api/productsApi';
import { User } from '../interface/user.interface';
import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';

// Simple JWT decoder (only for reading payload, not for security validation)
const decodeJWT = (token: string) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.log('Error decoding JWT:', error);
    return null;
  }
};

// Get user by ID with specific token (for auth flow)
const getUserByIdWithToken = async (id: string, token: string) => {
  try {
    const { data } = await productsApi.get<User>(`/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return data;
  } catch (error) {
    console.log('Error fetching user by ID with token:', error);
    return null;
  }
};

// Get user by ID (requires auth) - moved here to be used by returnUserToken
const getUserByIdInternal = async (id: string) => {
  try {
    const { data } = await productsApi.get<User>(`/user/${id}`);
    return data;
  } catch (error) {
    console.log('Error fetching user by ID:', error);
    return null;
  }
};

export interface AuthResponse {
  access_token: string;
  sessionId?: string; // ← Añadir sessionId opcional
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    phoneVerified: boolean;
    avatar?: string;
    createdAt: string;
  };
}

const returnUserToken = async (
  data: AuthResponse
): Promise<{
  user: User;
  token: string;
} | null> => {
  const { access_token, sessionId, user: userData } = data;
  
  // Guardar sessionId si viene en la respuesta
  if (sessionId) {
    try {
      await SecureStorageAdapter.setItem('sessionId', sessionId);
      console.log('✅ Session ID guardado:', sessionId);
    } catch (error) {
      console.log('❌ Error guardando session ID:', error);
    }
  }

  let userId: string = '';

  // Get user ID from response or JWT
  if (userData && userData.id) {
    userId = userData.id;
    console.log('Using user ID from response:', userId);
  } else {
    console.log('No user data in response, decoding from JWT...');
    const decoded = decodeJWT(access_token);
    console.log('Decoded JWT payload:', decoded);
    
    if (decoded && (decoded.sub || decoded.id)) {
      userId = decoded.sub || decoded.id;
      console.log('Using user ID from JWT:', userId);
    }
  }

  // Add safety checks for userId
  if (!userId) {
    throw new Error('Unable to get user ID from response or JWT');
  }

  // Fetch complete user data from API using the access token
  console.log('🔍 Fetching complete user data from /user/' + userId + ' with token');
  try {
    const completeUserData = await getUserByIdWithToken(userId, access_token);
    
    if (!completeUserData) {
      throw new Error('Failed to fetch user data from API');
    }

    console.log('✅ Complete user data fetched:', completeUserData);

    const user: User = {
      id: completeUserData.id,
      email: completeUserData.email || '',
      name: completeUserData.name || '',
      role: completeUserData.role || 'user',
      isActive: completeUserData.isActive ?? true,
      phoneVerified: completeUserData.phoneVerified ?? false,
      avatar: completeUserData.avatar,
      createdAt: completeUserData.createdAt ? new Date(completeUserData.createdAt) : new Date(),
      password: '', // This should not be stored on client
      address: completeUserData.address || '',
      phoneNumber: completeUserData.phoneNumber || '',
      direction: completeUserData.direction || '',
      latitude: completeUserData.latitude,
      longitude: completeUserData.longitude,
      phoneVerificationCode: completeUserData.phoneVerificationCode,
      updatedAt: completeUserData.updatedAt ? new Date(completeUserData.updatedAt) : new Date(),
    };

    console.log('🎯 Final user object created:', user);

    return {
      user,
      token: access_token,
    };
  } catch (error) {
    console.log('❌ Error fetching user data:', error);
    throw new Error('Failed to fetch complete user data');
  }
};

export const authLogin = async (email: string, password: string) => {
  email = email.toLowerCase();

  console.log('🔐 Attempting login with:', { 
    email, 
    endpoint: '/auth/login',
    baseURL: productsApi.defaults.baseURL 
  });

  try {
    const { data } = await productsApi.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    console.log('✅ Login API response:', data);

    if (!data) {
      console.log('❌ No data received from login API');
      return null;
    }

    if (!data.access_token) {
      console.log('❌ No access_token in response:', data);
      return null;
    }

    console.log('🎯 Login successful, processing user data...');
    return await returnUserToken(data);
  } catch (error) {
    console.log('❌ Login error:', error);
    if (error.response) {
      console.log('Response data:', error.response.data);
      console.log('Response status:', error.response.status);
    }
    return null;
  }
};

export const authCheckStatus = async () => {
  try {
    // Check if we have a stored token
    const storedToken = await SecureStorageAdapter.getItem('token');
    
    if (!storedToken) {
      return null;
    }
    
    // Try to decode the JWT to get user ID
    const decoded = decodeJWT(storedToken);
    if (!decoded || (!decoded.sub && !decoded.id)) {
      // Invalid token, remove it
      await SecureStorageAdapter.removeItem('token');
      return null;
    }
    
    const userId = decoded.sub || decoded.id;
    
    // Try to fetch current user data
    try {
      const userData = await getUserByIdWithToken(userId, storedToken);
      if (userData) {
        const user: User = {
          id: userData.id,
          email: userData.email || '',
          name: userData.name || '',
          role: userData.role || 'user',
          isActive: userData.isActive ?? true,
          phoneVerified: userData.phoneVerified ?? false,
          avatar: userData.avatar,
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
          password: '', // This should not be stored on client
          address: userData.address || '',
          phoneNumber: userData.phoneNumber || '',
          direction: userData.direction || '',
          latitude: userData.latitude,
          longitude: userData.longitude,
          phoneVerificationCode: userData.phoneVerificationCode,
          updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
        };
        
        return {
          token: storedToken,
          user: user
        };
      }
    } catch (fetchError) {
      // If we can't fetch user data but token is valid, return with token only
      // The user data will be loaded when needed
      return {
        token: storedToken,
        user: null
      };
    }
    
    return {
      token: storedToken,
      user: null
    };
  } catch (error) {
    // Remove invalid token
    await SecureStorageAdapter.removeItem('token');
    return null;
  }
};

export interface RegisterData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  phoneVerified?: boolean;
  address?: string;
  direction?: string;
}

// SMS DTOs
export type SendCodeResponse = { success: boolean; message: string; phone: string };
export type VerifyCodeResponse = { valid: boolean; message: string };

// Función para obtener session ID actual
export const getCurrentSessionId = async (): Promise<string | null> => {
  try {
    return await SecureStorageAdapter.getItem('sessionId');
  } catch (error) {
    console.log('Error obteniendo session ID:', error);
    return null;
  }
};

// Función para limpiar session ID
export const clearSessionId = async (): Promise<void> => {
  try {
    await SecureStorageAdapter.removeItem('sessionId');
    console.log('Session ID limpiado');
  } catch (error) {
    console.log('Error limpiando session ID:', error);
  }
};

// User registration using POST /user endpoint (direct create)
export const authRegister = async (registerData: RegisterData) => {
  try {
    const { data } = await productsApi.post<any>('/user', {
      name: registerData.fullName,
      email: registerData.email.toLowerCase(),
      password: registerData.password,
      phoneNumber: registerData.phone,
      direction: registerData.direction || undefined,
      address: registerData.address || undefined,
    });

    if (!data) {
      console.log('No data received from register API');
      return null;
    }

    console.log('📝 Register API response:', data);

    // If backend returns the auth payload directly
    if (data && typeof data === 'object' && 'access_token' in data) {
      return await returnUserToken(data as AuthResponse);
    }

    // Some backends return just the created user; attempt automatic login to obtain token
    if (data && typeof data === 'object' && 'id' in data) {
      console.log('ℹ️ Register returned user object without token. Attempting auto-login...');
      try {
        const { data: loginData } = await productsApi.post<AuthResponse>('/auth/login', {
          email: registerData.email.toLowerCase(),
          password: registerData.password,
        });

        if (loginData?.access_token) {
          // Pass along minimal user info if available
          const minimalUser = {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role,
            isActive: data.isActive,
            phoneVerified: data.phoneVerified,
            avatar: data.avatar,
            createdAt: data.createdAt,
          } as AuthResponse['user'];

          return await returnUserToken({ ...loginData, user: minimalUser });
        }

        console.log('❌ Auto-login did not return access_token');
        return null;
      } catch (loginError) {
        console.log('❌ Auto-login after register failed:', loginError);
        return null;
      }
    }

    console.log('❌ Unexpected register response shape.');
    return null;
  } catch (error) {
    console.log('Register error:', error);
    return null;
  }
};

// Additional user management actions

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const { data } = await productsApi.get<User[]>('/user');
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Get user by ID (requires auth) - public export
export const getUserById = async (id: string) => {
  return await getUserByIdInternal(id);
};

// Update user (requires auth)
export interface UpdateUserData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  direction?: string;
  latitude?: number;
  longitude?: number;
  vehicleInfo?: string;
}

export const updateUser = async (id: string, updateData: UpdateUserData) => {
  try {
    const { data } = await productsApi.patch<User>(`/user/${id}`, updateData);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Activate/deactivate user (requires auth)
export const toggleUserActive = async (id: string, isActive: boolean) => {
  try {
    const { data } = await productsApi.patch<User>(`/user/${id}/active`, {
      isActive
    });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Send SMS verification code
export const sendSMSCode = async (phone: string): Promise<{ success: boolean; error?: any; data?: SendCodeResponse }> => {
  try {
    const { data } = await productsApi.post<SendCodeResponse>('/auth/send-sms-code', { phone });
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || { message: error.message, statusCode: error.response?.status },
    };
  }
};

// Verify SMS code
export const verifySMSCode = async (phone: string, code: string): Promise<VerifyCodeResponse> => {
  try {
    const { data } = await productsApi.post<VerifyCodeResponse>('/auth/verify-sms-code', { phone, code });
    return data;
  } catch (error: any) {
    return {
      valid: false,
      message: error.response?.data?.message || 'Error al verificar el código',
    };
  }
};