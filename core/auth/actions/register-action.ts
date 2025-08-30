import { productsApi } from '../api/productsApi';
import { User } from '../interface/user.interface';

// Simple JWT decoder (only for reading payload, not for security validation)
const decodeJWT = (token: string) => {
  try {
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
  const { access_token, user: userData } = data;

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
    const { data } = await productsApi.get<AuthResponse>('/auth/check-status');

    if (!data) {
      console.log('No data received from check-status API');
      return null;
    }

    return await returnUserToken(data);
  } catch (error) {
    console.log('Check status error:', error);
    return null;
  }
};

export interface RegisterData {
  fullName: string;
  cedula: string;
  phone: string;
  email: string;
  vehicleInfo: string;
  password: string;
}

// User registration using POST /user endpoint
export const authRegister = async (registerData: RegisterData) => {
  try {
    const { data } = await productsApi.post<AuthResponse>('/user', {
      name: registerData.fullName,
      email: registerData.email.toLowerCase(),
      password: registerData.password,
      phoneNumber: registerData.phone,
      cedula: registerData.cedula,
      vehicleInfo: registerData.vehicleInfo,
    });

    if (!data) {
      console.log('No data received from register API');
      return null;
    }

    return await returnUserToken(data);
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