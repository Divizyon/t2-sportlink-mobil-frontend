import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, AuthStore } from '../../types/store';
import { RegisterFormData } from '../../utils/validations/registerSchema';
import authService from '../../api/authService';
import { router } from 'expo-router';

/**
 * Kimlik doğrulama için Zustand store
 * Persist middleware ile kullanıcı bilgileri cihazda saklanır
 */
const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login(email, password);
          
          if (response.success && response.data) {
            // Token'ı AsyncStorage'a kaydet
            await AsyncStorage.setItem('authToken', response.data.token);
            
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            
            // Giriş başarılı olduğunda direkt ana sayfaya yönlendir
            router.replace('/(tabs)/home' as any);
          } else {
            set({
              error: response.message || 'Giriş yapılamadı',
              isLoading: false,
            });
          }
        } catch (error) {
          let errorMessage = 'Giriş sırasında bir hata oluştu';
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      register: async (data: RegisterFormData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(data);
          
          if (response.success && response.data) {
            // Token'ı AsyncStorage'a kaydet
            await AsyncStorage.setItem('authToken', response.data.token);
            
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            
            // Kayıt başarılı olduğunda direkt ana sayfaya yönlendir 
            router.replace('/(tabs)/home' as any);
          } else {
            set({
              error: response.message || 'Kayıt yapılamadı',
              isLoading: false,
            });
          }
        } catch (error) {
          let errorMessage = 'Kayıt sırasında bir hata oluştu';
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      logout: async () => {
        // Token'ı AsyncStorage'dan sil
        await AsyncStorage.removeItem('authToken');
        
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Çıkış yapınca başlangıç ekranına yönlendir
        router.replace('/' as any);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage', // AsyncStorage'da saklanacak anahtar
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore; 