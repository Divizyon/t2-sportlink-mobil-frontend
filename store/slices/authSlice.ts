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
    set => ({
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
            // Önce state'i güncelle ve sayfa yönlendirmesini başlat
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });

            // Sayfa yönlendirmesini başlat (replace yerine navigate kullanarak daha hızlı)
            router.navigate('/(tabs)/home' as any);

            // Token'ı AsyncStorage'a kaydet (bunu bloke etmeden arkaplanda yap)
            AsyncStorage.setItem('authToken', response.data.token).catch(err => {
              console.error('Token kaydedilirken hata oluştu:', err);
            });

            // Kullanıcı adını da kaydet
            if (response.data.user && response.data.user.name) {
              AsyncStorage.setItem('userName', response.data.user.name).catch(err => {
                console.error('Kullanıcı adı kaydedilirken hata oluştu:', err);
              });
            }
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
            // Önce state'i güncelle ve sayfa yönlendirmesini başlat
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });

            // Sayfa yönlendirmesini başlat (replace yerine navigate kullanarak daha hızlı)
            router.navigate('/(tabs)/home' as any);

            // Token'ı AsyncStorage'a kaydet (bunu bloke etmeden arkaplanda yap)
            AsyncStorage.setItem('authToken', response.data.token).catch(err => {
              console.error('Token kaydedilirken hata oluştu:', err);
            });

            // Kullanıcı adını da kaydet
            if (response.data.user && response.data.user.name) {
              AsyncStorage.setItem('userName', response.data.user.name).catch(err => {
                console.error('Kullanıcı adı kaydedilirken hata oluştu:', err);
              });
            }
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
        // State'i hemen güncelle ve yönlendirmeyi başlat
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });

        // Çıkış yapınca başlangıç ekranına yönlendir
        router.navigate('/' as any);

        // Token ve kullanıcı adını AsyncStorage'dan sil (bunu bloke etmeden arkaplanda yap)
        AsyncStorage.removeItem('authToken').catch(err => {
          console.error('Token silinirken hata oluştu:', err);
        });

        AsyncStorage.removeItem('userName').catch(err => {
          console.error('Kullanıcı adı silinirken hata oluştu:', err);
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage', // AsyncStorage'da saklanacak anahtar
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
