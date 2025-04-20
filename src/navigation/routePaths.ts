/**
 * Router path'lerini string olarak tanımlayan modül
 * Bu, router.push/replace işlemlerinde kullanılırken string yazım hatalarını önler
 */

/**
 * Ana router path'leri
 */
export const ROUTES = {
  // Ana rotalar
  WELCOME: '/',
  
  // Tab navigasyon container
  TABS: '/(tabs)',
  
  // Tab rotaları
  HOME: '/home',
  MAP: '/map',
  FACILITIES: '/facilities',
  PROFILE: '/profile',
  ROUTES: '/routes',
  
  // Auth rotaları
  SIGN_IN: '/auth/signin',
  SIGN_UP: '/auth/signup',
  
  // Dinamik rotalar için helper fonksiyonlar
  getRouteDetail: (id: string) => `/routes/${id}`,
  getFacilityDetail: (id: string) => `/facilities/${id}`,
} as const;

/**
 * Tab router path'leri
 */
export const TAB_ROUTES = {
  HOME: 'home',
  MAP: 'map',
  FACILITIES: 'facilities',
  PROFILE: 'profile',
} as const; 