import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API URL'si - doğrudan localhost:3000 kullan
export const API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';

console.log('API URL:', API_URL); // Debugging için

// Axios instance'ını oluşturun
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: Number(process.env.API_TIMEOUT) || 30000, // Environment'dan timeout değerini alın
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async config => {
    // Token'ı AsyncStorage'dan al
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // Hata yönetimi
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token expired veya invalid token
          // Logout işlemleri
          await AsyncStorage.removeItem('authToken');
          break;
        case 404:
          // Resource not found
          break;
        case 500:
          // Server error
          break;
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
