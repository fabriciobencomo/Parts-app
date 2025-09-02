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
    console.log('📤 Enviando Session ID en request:', sessionId)
  }

  return config
})
export {productsApi}