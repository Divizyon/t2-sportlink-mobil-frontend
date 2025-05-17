import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getConfigValues } from '../store/appStore/configStore';
import { tokenManager } from '../utils/tokenManager';
import { useApiStore } from '../store/appStore/apiStore';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Özel istek konfigürasyonu türü
interface ExtendedRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  headers?: any;
}

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

// Hassas verileri maskeleyen yardımcı fonksiyon
function maskSensitiveData(data: any): any {
  if (!data) return data;
  
  const maskedData = { ...data };
  
  // Hassas alanları maskele
  if (maskedData.password) maskedData.password = '********';
  if (maskedData.current_password) maskedData.current_password = '********';
  if (maskedData.new_password) maskedData.new_password = '********';
  
  return maskedData;
}

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
  
      if (request.data) {
        // Hassas verileri loglamadan önce maske uygula
        const maskedData = maskSensitiveData(request.data);
      }
    }
    
    return request;
  },
  error => {
    if (isDebugMode) {
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
     
      if (token) {
        // Token formatını kontrol et (bazı API'ler "Bearer " öneki olmadan token bekleyebilir)
        config.headers.Authorization = `Bearer ${token}`;
      } else {
      }
      return config;
    } catch (error) {
      // Hata durumunda API store'da işlem güncelle
      if (config.headers && config.headers['X-Request-ID']) {
        const requestId = config.headers['X-Request-ID'] as string;
        useApiStore.getState().failRequest(requestId, error instanceof Error ? error.message : 'İstek hatası');
      }
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token yenileme işlemi için bir flag
let isRefreshing = false;

// Bekleyen istekleri tutan dizi
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// Response interceptor - yanıtları ve hata durumlarını işle
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // İşlemi API store'da tamamla
    if (response.config.headers && response.config.headers['X-Request-ID']) {
      const requestId = response.config.headers['X-Request-ID'] as string;
      useApiStore.getState().completeRequest(requestId, response.status);
    }
    
 
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedRequestConfig;
    
    // İşlemi API store'da hata ile güncelle
    if (originalRequest?.headers?.['X-Request-ID']) {
      const requestId = originalRequest.headers['X-Request-ID'] as string;
      const errorMessage = error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data 
        ? (error.response.data as { message?: string }).message 
        : error.message || 'API isteği başarısız';
      
      useApiStore.getState().failRequest(requestId, errorMessage || 'API isteği başarısız');
    }
    
    // 404 hatası için özel işlem - bu durumda sadece hatayı iletip işlemi sonlandırabiliriz
    if (error.response?.status === 404) {
    
      return Promise.reject(error);
    }
   
    // 401 hatası (yetkisiz) ve istek henüz yenilenmemişse token yenileme işlemi yap
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Token hatası yanıt verisini kontrol et
      const responseData = error.response?.data as any;
      if (responseData?.code === 'REFRESH_TOKEN_ERROR' || 
          responseData?.details?.includes('Already Used')) {
        await tokenManager.removeToken();
        useApiStore.getState().setAuthError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
        return Promise.reject(error);
      }
      
      // İstek belli bir sayıdan fazla tekrar edilmişse döngüyü kır
      if (originalRequest._retryCount && originalRequest._retryCount >= 2) {
        await tokenManager.removeToken();
        useApiStore.getState().setAuthError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
        return Promise.reject(error);
      }

      // Refresh token kullanarak token yenilemeyi dene
      try {
        // Eğer halihazırda bir yenileme işlemi yoksa
        if (!isRefreshing) {
          isRefreshing = true;
          
          // Token verilerini al
          const tokenData = await tokenManager.getTokenData();
          
          if (tokenData?.refresh_token) {
            try {
              // Refresh token ile yeni token al
              const newToken = await tokenManager.refreshAccessToken(tokenData.refresh_token);
              
              if (newToken) {
                // Bekleyen tüm istekleri yeni token ile çözümle
                pendingRequests.forEach(request => request.resolve(newToken));
                pendingRequests = [];
                
                // Orijinal isteği yeni token ile tekrar gönder
                originalRequest._retry = true;
                // Yeniden deneme sayısını artır
                originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                
                isRefreshing = false;
                return apiClient(originalRequest);
              } else {
                // Token yenileme başarısız, bekleyen istekleri reddet
                pendingRequests.forEach(request => request.reject(new Error('Token yenileme başarısız')));
                pendingRequests = [];
                
                isRefreshing = false;
                // Kullanıcı oturumunu sonlandır
                await tokenManager.removeToken();
                useApiStore.getState().setAuthError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
                return Promise.reject(error);
              }
            } catch (refreshError) {
              console.error('Token yenileme sırasında hata:', refreshError);
              // Bekleyen istekleri reddet
              pendingRequests.forEach(request => request.reject(refreshError));
              pendingRequests = [];
              
              isRefreshing = false;
              // Kullanıcı oturumunu sonlandır
              await tokenManager.removeToken();
              useApiStore.getState().setAuthError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
              return Promise.reject(error);
            }
          } else {
            isRefreshing = false;
            await tokenManager.removeToken();
            useApiStore.getState().setAuthError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
            return Promise.reject(error);
          }
        } else {
          // Eğer halihazırda bir token yenileme işlemi devam ediyorsa
          // İsteği kuyruğa ekle ve yenileme tamamlandığında tekrar dene
          return new Promise((resolve, reject) => {
            pendingRequests.push({
              resolve: (newToken: string) => {
                originalRequest._retry = true;
                // Yeniden deneme sayısını artır
                originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                resolve(apiClient(originalRequest));
              },
              reject
            });
          });
        }
      } catch (refreshError) {
        isRefreshing = false;
        // Tüm token verilerini temizle
        await tokenManager.removeToken();
        useApiStore.getState().setAuthError('Oturum hatası. Lütfen tekrar giriş yapın.');
        return Promise.reject(error);
      }
    }
    
    // 5xx sunucu hataları için genel hata bildirimlerini ayarla
    if (error.response?.status && error.response.status >= 500) {
      useApiStore.getState().setGlobalError('Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.');
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };