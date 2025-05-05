import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRequest, RegisterRequest } from '../../types/userTypes/auth.types';
import { User } from '../../types/userTypes/user.types';
import { authService } from '../../api/auth';
import { tokenManager } from '../../utils/tokenManager';
import { useApiStore } from '../appStore/apiStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRegistering: boolean;
  error: string | null;
  message: string | null;
  
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  clearMessages: () => void;
}

// Auth store that manages authentication state
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isRegistering: false,
  error: null,
  message: null,

  // Kullanıcı girişi
  login: async (data: LoginRequest) => {
    try {
      set({ isLoading: true, error: null, message: null });
      
      const response = await authService.login(data);
      
      if (response.success && response.data?.user) {
        // Kullanıcı bilgilerini kaydet
        await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
        
        // Token bilgisini doğru şekilde kaydet
        if (response.data.session) {
          const session = response.data.session;
          await tokenManager.setTokenData({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at || 
                         (session.expires_in ? Math.floor(Date.now() / 1000) + session.expires_in : undefined),
            token_type: session.token_type || 'Bearer'
          });
        }
        
        set({ 
          user: response.data.user, 
          isAuthenticated: true, 
          isLoading: false,
          message: response.message || 'Giriş başarılı!'
        });
        return true;
      } else {
        set({ 
          error: response.error || 'Kullanıcı bilgileri alınamadı.', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      let errorMessage = 'Giriş yapılırken bir sorun oluştu.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
      return false;
    }
  },

  // Kullanıcı kaydı
  register: async (data: RegisterRequest) => {
    set({ isLoading: true, isRegistering: true, error: null });
    try {
      const response = await authService.register(data);
      
      if (response.success) {
        set({ 
          message: response.message || 'Kayıt başarılı! Giriş yapabilirsiniz.',
          isLoading: false, 
          isRegistering: false 
        });
        return true;
      } else {
        set({ 
          error: response.error || 'Kayıt yapılamadı.',
          isLoading: false, 
          isRegistering: false
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Kayıt sırasında bir hata oluştu.';
      
      set({ 
        isLoading: false,
        isRegistering: false,
        error: errorMessage
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
      return false;
    }
  },

  // Kullanıcı çıkışı
  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      // Kullanıcı verisini temizle
      await AsyncStorage.removeItem('@user_data');
      
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error) {
      console.error('Çıkış yaparken hata:', error);
      
      // Hata olsa bile kullanıcı oturumunu sonlandır
      await AsyncStorage.removeItem('@user_data');
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  // Token kontrolü ve otomatik giriş
  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Tüm token verilerini kontrol et
      const tokenData = await tokenManager.getTokenData();
      
      // Token yoksa oturum yok demektir
      if (!tokenData || !tokenData.access_token) {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
        return;
      }
      
      // Token geçerliliğini kontrol et
      const isValid = await tokenManager.isTokenValid();
      
      if (isValid) {
        // Token geçerliyse, kullanıcı bilgisini kontrol et
        const userStr = await AsyncStorage.getItem('@user_data');
        
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            set({ 
              user: userData, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return;
          } catch (parseError) {
            console.error('Kullanıcı verisi doğru formatta değil:', parseError);
          }
        }
        
        // Kullanıcı verisi yoksa ama token geçerliyse API'den kullanıcı bilgisini al
        try {
          const response = await authService.validateToken();
          
          if (response.success && response.data?.user) {
            await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
            
            set({ 
              user: response.data.user, 
              isAuthenticated: true,
              isLoading: false
            });
            return;
          }
        } catch (apiError) {
          console.error('API\'den kullanıcı verisi alınırken hata:', apiError);
          // API hatası durumunda tokenları temizle
          await tokenManager.removeToken();
        }
      }
      
      // Token geçersiz veya kullanıcı bilgisi yoksa, oturumu kapat
      await AsyncStorage.removeItem('@user_data');
      await tokenManager.removeToken(); // Tüm token verilerini temizle
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? 
        error.message : 
        'Oturum durumu kontrol edilirken bir sorun oluştu.';
      
      // Hata durumunda tüm token ve oturum verilerini temizle  
      await AsyncStorage.removeItem('@user_data');
      await tokenManager.removeToken();
        
      set({ 
        error: errorMessage,
        isLoading: false,
        user: null,
        isAuthenticated: false
      });
    }
  },

  // Hata temizleme
  clearError: () => set({ error: null }),
  
  // Mesaj temizleme
  clearMessages: () => set({ message: null })
})); 