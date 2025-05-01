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
      
  
      
      // expires_at bilgisi yoksa sadece token varlığını kontrol et
      return true;
    } catch (error) {
      console.error('Token geçerliliği kontrol edilirken hata oluştu:', error);
      return false;
    }
  },
  

};

export default tokenManager;