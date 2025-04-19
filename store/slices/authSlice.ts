import { create } from 'zustand';
import { AuthState, AuthStore } from '../../types/store';

/**
 * Kimlik doğrulama için Zustand store
 */
const useAuthStore = create<AuthStore>((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Burada gerçek API çağrısı yapılacak
      // Örnek olarak simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Başarılı giriş simülasyonu
      if (username === 'test' && password === 'password') {
        set({
          user: {
            id: '1',
            username,
            email: 'test@example.com',
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          error: 'Geçersiz kullanıcı adı veya şifre',
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