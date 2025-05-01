import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getConfigValues } from '../store/appStore/configStore';
import { tokenManager } from '../utils/tokenManager';
import { useApiStore } from '../store/appStore/apiStore';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Config değerlerini al
const { apiBaseUrl, apiTimeout, isDebugMode } = getConfigValues();

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF koruması için
  },
  timeout: apiTimeout,
  withCredentials: true, // CORS için cookie gönderimi (gerekirse)
});

// İnternet bağlantısını kontrol et
NetInfo.addEventListener((state: NetInfoState) => {
  useApiStore.getState().setOfflineStatus(!state.isConnected);
});

// Hata ayıklama için istek ve yanıt bilgilerini logla (sadece development ortamında)
apiClient.interceptors.request.use(
  request => {
    const requestId = useApiStore.getState().addRequest({
      url: `${request.baseURL || ''}${request.url || ''}`,
      method: request.method?.toUpperCase() || 'GET',
    });
    
    // Request ID'yi sonraki interceptor'lar için ekle
    request.headers['X-Request-ID'] = requestId;
    
    if (isDebugMode) {
      console.log('API İstek URL:', `${request.baseURL || ''}${request.url || ''}`);
      console.log('API İstek Metodu:', request.method?.toUpperCase());
      console.log('API İstek Header:', JSON.stringify(request.headers));
      
      if (request.data) {
        // Hassas verileri loglamadan önce maske uygula
        const maskedData = maskSensitiveData(request.data);
        console.log('API İstek Verisi:', JSON.stringify(maskedData));
      }
    }
    
    return request;
  },
  error => {
    if (isDebugMode) {
      console.error('API İstek Hatası:', error.message);
    }
    return Promise.reject(error);
  }
);

// Request interceptor - her istekte token ekle
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // İnternet bağlantısı kontrolü
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('İnternet bağlantısı yok.');
      }
      
      const token = await tokenManager.getToken();
      console.log('Token alındı:', token ? 'Token mevcut' : 'Token yok', 
                  token ? `Token uzunluğu: ${token.length}` : '');
      
      if (token) {
        // Token formatını kontrol et (bazı API'ler "Bearer " öneki olmadan token bekleyebilir)
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header eklendi:', config.headers.Authorization);
      } else {
        console.log('Token bulunamadı, Authorization header eklenemedi');
      }
      return config;
    } catch (error) {
      // Hata durumunda API store'da işlem güncelle
      if (config.headers && config.headers['X-Request-ID']) {
        const requestId = config.headers['X-Request-ID'] as string;
        useApiStore.getState().failRequest(requestId, error instanceof Error ? error.message : 'İstek hatası');
      }
      console.error('Token eklenirken hata:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - yanıtları ve hata durumlarını işle
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // İşlemi API store'da tamamla
    if (response.config.headers && response.config.headers['X-Request-ID']) {
      const requestId = response.config.headers['X-Request-ID'] as string;
      useApiStore.getState().completeRequest(requestId, response.status);
    }
    
    if (isDebugMode) {
      console.log('API Yanıt Durumu:', response.status);
      console.log('API Yanıt Verisi:', JSON.stringify(response.data));
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean, headers?: any };
    
    // İşlemi API store'da hata ile güncelle
    if (originalRequest?.headers?.['X-Request-ID']) {
      const requestId = originalRequest.headers['X-Request-ID'] as string;
      const errorMessage = error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data 
        ? (error.response.data as { message?: string }).message 
        : error.message || 'API isteği başarısız';
      
      useApiStore.getState().failRequest(requestId, errorMessage || 'API isteği başarısız');
    }
    
    if (isDebugMode) {
      console.error('API Yanıt Hatası:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
 
    
    // 5xx sunucu hataları için genel hata bildirimlerini ayarla
    if (error.response?.status && error.response.status >= 500) {
      useApiStore.getState().setGlobalError('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
    }
    
    return Promise.reject(error);
  }
);

// Hassas verileri maskeleme fonksiyonu
function maskSensitiveData(data: any): any {
  if (!data) return data;
  
  // Nesne kopya oluşturma
  const maskedData = { ...data };
  
  // Hassas alanların maskesi
  const sensitiveFields = ['password', 'token', 'access_token', 'refresh_token', 'secret', 'key', 'cardNumber', 'cvv'];
  
  // Hassas alanları maskele
  Object.keys(maskedData).forEach(key => {
    if (sensitiveFields.includes(key.toLowerCase())) {
      maskedData[key] = '***MASKED***';
    } else if (typeof maskedData[key] === 'object' && maskedData[key] !== null) {
      // İç içe nesneleri recursive olarak kontrol et
      maskedData[key] = maskSensitiveData(maskedData[key]);
    }
  });
  
  return maskedData;
}

export { apiClient };