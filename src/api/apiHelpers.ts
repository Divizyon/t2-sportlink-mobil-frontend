import { AxiosError, AxiosResponse } from 'axios';
import { tokenManager } from '../utils/tokenManager';
import { useApiStore } from '../store/appStore/apiStore';

/**
 * API yanıt tipi
 */
export interface ApiResponse<T = any> {
  data: T | null;
  success: boolean;
  message?: string;
  error?: string;
  statusCode?: number;
}

/**
 * API hatalarını işleyen yardımcı fonksiyon
 */
export const handleApiError = <T>(error: unknown, defaultMessage: string): ApiResponse<T> => {
  // API store'da global hata durumunu güncelle
  let errorMessage = defaultMessage;
  let statusCode: number | undefined;
  
  if (error instanceof AxiosError) {
    statusCode = error.response?.status;
    
    // Mevcut hata yanıtını al, API yanıt formatında ise aynen döndür
    if (error.response?.data) {
      const errorData = error.response.data as Record<string, any>;
      
      if ('success' in errorData && 'message' in errorData) {
        // Dönüş zaten API formatlı gibi görünüyor
        return error.response.data as ApiResponse<T>;
      }
      
      // Mesaj alanını kontrol et
      if ('message' in errorData) {
        errorMessage = errorData.message as string;
      } else if ('error' in errorData) {
        errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
      }
    }
    
    // 401 hatası ise token'ın geçersiz olduğunu bildir
    if (statusCode === 401) {
      errorMessage = 'Oturum süreniz dolmuş olabilir, lütfen tekrar giriş yapın.';
      
      // Eğer refresh token zaten denenmiş ve başarısız olmuşsa token'ı temizle
      // Bu kontrol apiClient.ts içinde yapılmaktadır
    }
    
    // 403 hatası yetkisiz işlem
    if (statusCode === 403) {
      errorMessage = 'Bu işlemi yapmaya yetkiniz bulunmuyor.';
    }
    
    // 404 hatası kaynak bulunamadı
    if (statusCode === 404) {
      errorMessage = 'İstenilen kaynak bulunamadı.';
    }
    
    // 422 hatası doğrulama hatası
    if (statusCode === 422) {
      errorMessage = 'Gönderilen veriler geçerli değil.';
    }
    
    // 429 hata rate limit
    if (statusCode === 429) {
      errorMessage = 'Çok fazla istek gönderdiniz. Lütfen bir süre bekleyin.';
    }
    
    // 500 sunucu hatası
    if (statusCode && statusCode >= 500) {
      errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
      useApiStore.getState().setGlobalError(errorMessage);
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  return {
    data: null,
    success: false,
    message: errorMessage,
    error: errorMessage,
    statusCode
  };
};

/**
 * API yanıtlarını işleyen ve standartlaştıran yardımcı fonksiyon
 */
export const processApiResponse = <T>(response: AxiosResponse): ApiResponse<T> => {
  const responseData = response.data;
  
  // API yanıtı standart formatta mı kontrol et
  if (typeof responseData === 'object' && responseData !== null) {
    // Başarılı yanıtları işle
    if (response.status >= 200 && response.status < 300) {
      // "success" özelliği zaten var mı?
      if ('success' in responseData) {
        // Standard API yanıt formatı
        return {
          ...responseData,
          data: responseData.data || responseData,
          statusCode: response.status
        };
      }
      
      // Supabase benzeri yanıt (session, user içeren)
      if ('user' in responseData || 'session' in responseData) {
        // Token bilgilerini user içinden veya session içinden al
        const sessionData = responseData.session || {};
        
        return {
          success: true,
          data: responseData,
          message: responseData.message || 'İşlem başarılı',
          statusCode: response.status
        };
      }
      
      // Data alanı olmayan yanıtlar için otomatik oluştur
      return {
        success: true,
        data: responseData,
        message: responseData.message || 'İşlem başarılı',
        statusCode: response.status
      };
    }
    
    // Hata yanıtları
    return {
      success: false,
      data: null,
      error: responseData.error || responseData.message || 'Bir hata oluştu',
      message: responseData.message || 'İşlem başarısız',
      statusCode: response.status
    };
  }
  
  // Tüm diğer yanıtlar için standart format oluştur
  return {
    data: responseData,
    success: response.status >= 200 && response.status < 300,
    message: response.statusText,
    statusCode: response.status
  };
};

/**
 * API tokenı işleme özel yardımcı fonksiyon 
 */
export const handleAuthTokens = async (response: AxiosResponse): Promise<void> => {
  if (!response.data) return;
  
  const data = response.data;
  
  // Doğrudan token alanı
  if (data.token || data.access_token) {
    const tokenData = {
      access_token: data.token || data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      token_type: data.token_type || 'Bearer'
    };
    
    await tokenManager.setTokenData(tokenData);
    return;
  }
  
  // Session içinde token (Supabase benzeri API'lar)
  if (data.session && (data.session.access_token || data.session.token)) {
    const session = data.session;
    const tokenData = {
      access_token: session.access_token || session.token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at || (session.expires_in ? Math.floor(Date.now() / 1000) + session.expires_in : undefined),
      token_type: session.token_type || 'Bearer'
    };
    
    await tokenManager.setTokenData(tokenData);
  }
};

/**
 * API isteklerini standart handler ile yürüten yardımcı fonksiyon
 */
export const safeApiCall = async <T>(
  apiCall: Promise<AxiosResponse<any>>,
  errorMessage: string
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall;
    
    // Token işleme
    await handleAuthTokens(response);
    
    // Yanıtı standart formata dönüştür
    return processApiResponse<T>(response);
  } catch (error) {
    return handleApiError<T>(error, errorMessage);
  }
}; 