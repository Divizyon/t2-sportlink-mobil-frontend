/**
 * Uygulama içindeki rota isimlerini sabitleyen enum
 * Bu sabitler, router.push() gibi işlemlerde yazım hatalarını önlemek için kullanılır
 */
export enum AppRoutes {
  // Ana rotalar
  WELCOME = '/',
  
  // Tab navigasyon container
  TABS = '/(tabs)',
  
  // Tab rotaları
  HOME = '/home',
  MAP = '/map',
  FACILITIES = '/facilities',
  PROFILE = '/profile',
  ROUTES = '/routes',
  
  // Auth rotaları
  SIGN_IN = '/auth/signin',
  SIGN_UP = '/auth/signup',
}

/**
 * Tab navigasyondaki sekmelerin isimleri
 */
export enum TabRoutes {
  HOME = 'home',
  MAP = 'map',
  PROFILE = 'profile',
  FACILITIES = 'facilities',
}

/**
 * Dinamik rotalar için yardımcı fonksiyonlar
 */
export const DynamicRoutes = {
  /**
   * Rota detay sayfası için url oluşturur
   * @param id - Rota ID'si
   * @returns Rota detay sayfası URL'i
   */
  getRouteDetail: (id: string): string => `/routes/${id}`,
  
  /**
   * Tesis detay sayfası için url oluşturur
   * @param id - Tesis ID'si
   * @returns Tesis detay sayfası URL'i
   */
  getFacilityDetail: (id: string): string => `/facilities/${id}`,
}; 