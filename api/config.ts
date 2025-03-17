import axios from 'axios';
import Constants from 'expo-constants';

// API URL'lerini environment'dan alın
const ENV = {
  development: process.env.API_URL || 'http://localhost:3000/api',
  staging: process.env.API_STAGING_URL || 'https://staging-api.yourapp.com/api',
  production: process.env.API_PRODUCTION_URL || 'https://api.yourapp.com/api',
};

// Varsayılan API URL'sini belirleyin
const apiBaseURL = ENV.development; // Geliştirme ortamı için

// Axios instance'ını oluşturun
const apiClient = axios.create({
  baseURL: apiBaseURL,
  timeout: Number(process.env.API_TIMEOUT) || 30000, // Environment'dan timeout değerini alın
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Token eklemek için
    const token = null; // Token'ı secure store'dan alabilirsiniz
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Hata yönetimi
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token expired veya invalid token
          // Logout işlemleri
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
  }
);

export default apiClient; 