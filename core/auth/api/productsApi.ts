import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import axios from 'axios'
import { Platform } from 'react-native';


const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

export const API_URL = 
  (STAGE === 'prod')
    ? process.env.EXPO_PUBLIC_API_URL || 'https://your-backend-api.com'
    : (Platform.OS) === 'ios'
      ? process.env.EXPO_PUBLIC_API_URL_IOS || 'http://localhost:3000'
      : process.env.EXPO_PUBLIC_API_URL_ANDROID || 'http://10.0.2.2:3000'

// Log the API URL for debugging
console.log('🌐 API Configuration:', {
  stage: STAGE,
  platform: Platform.OS,
  apiUrl: API_URL
});

// Helpers to safely serialize and redact sensitive information from logs
const safeJson = (value: any) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return undefined;
  }
};

const redactHeaders = (headers: any) => {
  if (!headers) return undefined;
  const h = { ...(headers as Record<string, any>) };
  const entries = Object.entries(h).map(([k, v]) => [String(k).toLowerCase(), v]) as [string, any][];
  const redacted: Record<string, any> = {};
  for (const [k, v] of entries) {
    if (['authorization', 'cookie', 'set-cookie', 'x-api-key'].includes(k)) {
      redacted[k] = '[REDACTED]';
    } else {
      redacted[k] = v;
    }
  }
  return redacted;
};

const redactData = (data: any) => {
  if (!data) return undefined;
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    if (parsed && typeof parsed === 'object') {
      const clone: Record<string, any> = Array.isArray(parsed) ? [...parsed] : { ...parsed };
      const sensitiveKeys = new Set(['password', 'pass', 'token', 'accessToken', 'refreshToken', 'secret']);
      for (const key of Object.keys(clone)) {
        if (sensitiveKeys.has(key)) clone[key] = '[REDACTED]';
      }
      return clone;
    }
    return parsed;
  } catch {
    if (typeof data === 'string' && data.length > 500) return data.slice(0, 500) + '…(truncated)';
    return data;
  }
};

const productsApi = axios.create({
  baseURL: API_URL
})

productsApi.interceptors.request.use(async(config) => {
  
  const token = await SecureStorageAdapter.getItem('token')
  const sessionId = await SecureStorageAdapter.getItem('sessionId')

  if(token){
    config.headers.Authorization = 'Bearer ' + token
  }

  if(sessionId){
    config.headers['X-Session-Id'] = sessionId
    const masked = String(sessionId).length > 8
      ? `${String(sessionId).slice(0, 4)}****${String(sessionId).slice(-4)}`
      : '[REDACTED]'
    console.log('📤 Enviando Session ID en request:', masked)
  }

  return config
})

productsApi.interceptors.response.use(
  (response) => {
    // Log exitoso solo para debugging si es necesario
    console.log('✅ API Response:', {
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      status: response.status
    });
    return response;
  },
  (error) => {
    // Diferenciar entre errores con respuesta (4xx/5xx) y errores de red/timeout
    const hasResponse = !!error?.response;

    const fullUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
    const method = error.config?.method?.toUpperCase();
    const status = error.response?.status;

    const logBase = {
      url: fullUrl || error.config?.url,
      method,
      status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
    };

    if (!hasResponse) {
      console.error('🌐 Network/Timeout Error:', {
        ...logBase,
        code: error.code,
        requestHeaders: redactHeaders(error.config?.headers),
      });
      return Promise.reject(error);
    }

    const sanitized = {
      ...logBase,
      requestHeaders: redactHeaders(error.config?.headers),
      requestData: redactData(error.config?.data),
      responseData: redactData(error.response?.data),
      responseHeaders: safeJson(error.response?.headers),
    };

    if (status && status >= 500) {
      console.error('🔥 Backend 5xx Error:', sanitized);
    } else if (status && status >= 400) {
      console.warn('⚠️ Client 4xx Error:', sanitized);
    } else {
      console.error('❌ API Error (Unknown status):', sanitized);
    }

    return Promise.reject(error);
  }
);

export {productsApi}