import * as SecureStore from 'expo-secure-store';
import { authService } from '../api/auth';

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
}

// Token verileri için sabit anahtarlar
const TOKEN_KEYS = {
  TOKEN_DATA: 'auth_token_data',
  ACCESS_TOKEN: 'auth_token'
};

/**
 * Token işlemleri için merkezi yönetim
 */
export const tokenManager = {
  /**
   * Token'ı ve ilgili bilgileri SecureStore'a kaydetme
   */
  setTokenData: async (tokenData: TokenData): Promise<void> => {
    try {
      if (!tokenData.access_token) {
        throw new Error('Geçersiz token verisi');
      }
      
      await SecureStore.setItemAsync(TOKEN_KEYS.TOKEN_DATA, JSON.stringify(tokenData));
      // Ana token için uyumluluk amacıyla eski key'i de koruyalım
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, tokenData.access_token);
    } catch (error) {
      console.error('Token kaydedilirken hata oluştu:', error);
      throw error;
    }
  },

  /**
   * Token bilgilerini SecureStore'dan alma
   */
  getTokenData: async (): Promise<TokenData | null> => {
    try {
      // Önce yeni format ile deneyelim
      const tokenDataStr = await SecureStore.getItemAsync(TOKEN_KEYS.TOKEN_DATA);
      
      if (tokenDataStr) {
        return JSON.parse(tokenDataStr);
      } 
      
      // Yeni format yoksa, eski format kontrol edilir
      const legacyToken = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
      console.log('Legacy token kontrol ediliyor:', legacyToken ? 'var' : 'yok');
      
      if (legacyToken) {
        const tokenData: TokenData = {
          access_token: legacyToken
        };
        
        // Eski token'ı yeni formata çevir ve kaydet
        await tokenManager.setTokenData(tokenData);
        return tokenData;
      }
      
      return null;
    } catch (error) {
      console.error('Token bilgileri alınırken hata oluştu:', error);
      return null;
    }
  },

  /**
   * Access token'ı doğrudan alma
   */
  getToken: async (): Promise<string | null> => {
    try {
      // Önce eski yöntemi deneyelim (UYUMLULUK için)
      const legacyToken = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
      
      // Yeni formatta token verisi almayı deneyelim
      const tokenDataStr = await SecureStore.getItemAsync(TOKEN_KEYS.TOKEN_DATA);
      
      if (tokenDataStr) {
        try {
          const tokenData = JSON.parse(tokenDataStr);
          console.log('TokenData bulundu:', tokenData ? 'token veri mevcut' : 'token veri yok');
          
          if (tokenData && tokenData.access_token) {
            // Süre kontrolü yapalım, eğer token süresi yakında dolacaksa yenilemeyi deneyelim
            if (tokenData.expires_at) {
              const currentTime = Math.floor(Date.now() / 1000);
              
        

              // Eğer token süresi zaten dolmuşsa
              if (currentTime >= tokenData.expires_at) {
                console.log('Token süresi dolmuş!');
                return null;
              }
            }
            
            return tokenData.access_token;
          }
        } catch (parseError) {
          console.error('Token verisi JSON parse hatası:', parseError);
        }
      }
      
      // Yeni format yoksa eski formata bakalım
      if (legacyToken) {
        console.log('Legacy token bulundu');
        return legacyToken;
      }
      
      console.log('Token bulunamadı');
      return null;
    } catch (error) {
      console.error('Token alınırken hata oluştu:', error);
      return null;
    }
  },

  /**
   * Token'ı SecureStore'dan silme
   */
  removeToken: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.TOKEN_DATA);
    } catch (error) {
      console.error('Token silinirken hata oluştu:', error);
      throw error;
    }
  },

  /**
   * Token geçerliliğini kontrol etme
   */
  isTokenValid: async (): Promise<boolean> => {
    try {
      const tokenData = await tokenManager.getTokenData();
      
      // Token verisi yoksa geçersiz
      if (!tokenData || !tokenData.access_token) {
        return false;
      }
      
      // Expiration süresi belirtilmişse kontrol et
      if (tokenData.expires_at) {
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Eğer token son 5 dakika içinde sona erecekse yenilemeyi dene
        if (tokenData.expires_at - currentTime < 300 && tokenData.refresh_token) {
          const refreshed = await tokenManager.refreshToken();
          if (!refreshed) {
            return false;
          }
          return true;
        }
        
        return currentTime < tokenData.expires_at;
      }
      
      // expires_at bilgisi yoksa sadece token varlığını kontrol et
      return true;
    } catch (error) {
      console.error('Token geçerliliği kontrol edilirken hata oluştu:', error);
      return false;
    }
  },
  
  /**
   * Token yenilemesi için yardımcı fonksiyon
   */
  refreshToken: async (): Promise<boolean> => {
    try {
      const tokenData = await tokenManager.getTokenData();
      if (!tokenData || !tokenData.refresh_token) {
        return false;
      }
      
      // Refresh token kullanarak yeni token alma
      const response = await authService.refreshToken(tokenData.refresh_token);
      
      if (response.success && response.data) {
        // Token değerlerini kontrol et ve varsayılan değerler ata
        const accessToken = response.data.token || response.data.access_token;
        
        // Erişim token'ı yoksa başarısız kabul et
        if (!accessToken) {
          return false;
        }
        
        // Yeni token bilgilerini kaydet
        const newTokenData: TokenData = {
          access_token: accessToken,
          refresh_token: response.data.refresh_token || tokenData.refresh_token,
          expires_at: response.data.expires_at,
          token_type: response.data.token_type || 'Bearer'
        };
        
        await tokenManager.setTokenData(newTokenData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token yenilenirken hata oluştu:', error);
      return false;
    }
  },
};

export default tokenManager;