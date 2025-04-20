import { useCallback } from 'react';
import { router } from 'expo-router';
import { ROUTES } from './routePaths';

/**
 * Navigasyon yardımcı hook'u
 * Expo Router'ı kullanarak navigasyon işlemlerini sağlar
 */
export const useNavigationHelpers = () => {
  /**
   * Tab sayfasına git - herhangi bir string path kabul eden genel fonksiyon
   */
  const navigateTo = useCallback((path: string) => {
    router.push(path as any);
  }, []);

  /**
   * Tab sayfasına git
   */
  const navigateToTab = useCallback((tab: 'home' | 'map' | 'facilities' | 'profile') => {
    navigateTo(`/(tabs)/${tab}`);
  }, [navigateTo]);

  /**
   * Ana sayfaya git
   */
  const navigateToHome = useCallback(() => {
    navigateTo(ROUTES.HOME);
  }, [navigateTo]);

  /**
   * Giriş sayfasına git
   */
  const navigateToSignIn = useCallback(() => {
    navigateTo(ROUTES.SIGN_IN);
  }, [navigateTo]);

  /**
   * Kayıt sayfasına git
   */
  const navigateToSignUp = useCallback(() => {
    navigateTo(ROUTES.SIGN_UP);
  }, [navigateTo]);

  /**
   * Karşılama sayfasına git
   */
  const navigateToWelcome = useCallback(() => {
    navigateTo(ROUTES.WELCOME);
  }, [navigateTo]);

  /**
   * Tab navigasyonuna git
   */
  const navigateToTabs = useCallback(() => {
    navigateTo(ROUTES.TABS);
  }, [navigateTo]);

  /**
   * Rota detay sayfasına git
   */
  const navigateToRouteDetail = useCallback((id: string) => {
    navigateTo(ROUTES.getRouteDetail(id));
  }, [navigateTo]);

  /**
   * Tesis detay sayfasına git
   */
  const navigateToFacilityDetail = useCallback((id: string) => {
    navigateTo(ROUTES.getFacilityDetail(id));
  }, [navigateTo]);

  /**
   * Bir önceki sayfaya dön
   */
  const goBack = useCallback(() => {
    router.back();
  }, []);

  /**
   * Sayfayı yeniden yükle
   * Not: Expo Router'da doğrudan refresh özelliği yok,
   * bu yüzden mevcut sayfayı replace etme yaklaşımı kullanıyoruz
   */
  const refreshPage = useCallback(() => {
    try {
      // Mevcut path'i alamadığımız için, güvenli bir yaklaşım olarak
      // aynı sayfayı replace etmeyi deniyoruz
      if (router.canGoBack()) {
        const currentPath = '/'; // Varsayılan path
        navigateTo(currentPath);
      }
    } catch (error) {
      console.warn('Sayfa yenilenirken hata:', error);
    }
  }, [navigateTo]);

  return {
    navigateTo,
    navigateToTab,
    navigateToHome,
    navigateToSignIn,
    navigateToSignUp,
    navigateToWelcome,
    navigateToTabs,
    navigateToRouteDetail,
    navigateToFacilityDetail,
    goBack,
    refreshPage,
  };
}; 