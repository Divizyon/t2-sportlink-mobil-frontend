import { create } from 'zustand';
import { AuthState, AuthStore } from '../../types/store';
import { RegisterFormData } from '../../utils/validations/registerSchema';

/**
 * Kimlik doğrulama için Zustand store
 */
const useAuthStore = create<AuthStore>(set => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      // Burada gerçek API çağrısı yapılacak
      // Örnek olarak simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Başarılı giriş simülasyonu
      if (email === 'test@example.com' && password === 'password') {
        set({
          user: {
            id: '1',
            username: 'test_user',
            email: email,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          error: 'Geçersiz e-posta veya şifre',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: 'Giriş sırasında bir hata oluştu',
        isLoading: false,
      });
    }
  },

  register: async (data: RegisterFormData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Burada gerçek API çağrısı yapılacak
      // Örnek olarak simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Başarılı kayıt simülasyonu
      set({
        user: {
          id: '2',
          username: data.fullName.split(' ')[0].toLowerCase(),
          email: data.email,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: 'Kayıt sırasında bir hata oluştu',
        isLoading: false,
      });
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
