import { useCallback } from 'react';
import { router } from 'expo-router';
import useAuthStore from '../../store/slices/authSlice';
import { AppRoutes } from '@/src/constants';

/**
 * Kimlik doğrulama işlemlerini yöneten custom hook
 * @returns Auth işlemleri ve durum
 */
export const useAuth = () => {
  // Auth state'ini Zustand store'dan al
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error,
    login: loginStore,
    logout: logoutStore,
    clearError: clearErrorStore
  } = useAuthStore();

  /**
   * Kullanıcı girişi
   * @param username - Kullanıcı adı
   * @param password - Şifre
   */
  const login = useCallback(async (username: string, password: string) => {
    try {
      await loginStore(username, password);
      // Başarılı giriş sonrası ana sayfaya yönlendir
      router.replace(AppRoutes.TABS as any);
    } catch (error) {
      // Hata zaten store tarafından yakalanıyor
      console.error('Giriş yapılamadı:', error);
    }
  }, [loginStore]);

  /**
   * Kullanıcı çıkışı
   */
  const logout = useCallback(() => {
    logoutStore();
    // Çıkış sonrası karşılama ekranına yönlendir
    router.replace(AppRoutes.WELCOME as any);
  }, [logoutStore]);

  /**
   * Hata mesajını temizle
   */
  const clearError = useCallback(() => {
    clearErrorStore();
  }, [clearErrorStore]);

  /**
   * Kimlik doğrulama durumunu kontrol et ve gerekirse yönlendir
   * @param requiredAuth - Kimlik doğrulama gerekli mi
   * @param redirectTo - Yönlendirilecek sayfa
   */
  const checkAuth = useCallback((requiredAuth: boolean = true, redirectTo?: string) => {
    // Kimlik doğrulama gerekli ancak kullanıcı giriş yapmamışsa
    if (requiredAuth && !isAuthenticated) {
      router.replace((redirectTo || AppRoutes.SIGN_IN) as any);
      return false;
    }
    
    // Kimlik doğrulama gerekli değil ancak kullanıcı giriş yapmışsa
    if (!requiredAuth && isAuthenticated) {
      router.replace((redirectTo || AppRoutes.TABS) as any);
      return false;
    }
    
    return true;
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    checkAuth
  };
}; 