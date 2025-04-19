/**
 * Navigasyon tiplerini tanımlayan dosya
 */
import { Route } from '@/src/hooks/useMap';

/**
 * Tüm navigasyon rotalarının parametrelerini tanımlayan tip
 */
export type RootStackParamList = {
  // Tab Navigasyonu
  '(tabs)': undefined;
  
  // Ana rotalar
  index: undefined; // Karşılama ekranı
  
  // Tab routes
  'home': undefined;
  'map': undefined;
  'facilities': undefined;
  'profile': undefined;
  'routes': undefined;
  
  // Auth rotaları
  'auth/signin': undefined;
  'auth/signup': {
    email?: string;
    redirectTo?: keyof RootStackParamList;
  };
  
  // Detay rotaları
  'routes/[id]': {
    id: string;
    route?: Route;
  };
  'facilities/[id]': {
    id: string;
  };
};

/**
 * Tab navigasyonundaki sekmeleri tanımlayan tip
 */
export type TabParamList = {
  home: undefined;
  map: undefined;
  facilities: undefined;
  profile: undefined;
};

/**
 * Auth navigasyonunu tanımlayan tip
 */
export type AuthStackParamList = {
  signin: undefined;
  signup: {
    email?: string;
    redirectTo?: keyof RootStackParamList;
  };
};

/**
 * Router tiplemesi için yardımcı tip
 */
export type AppRouterInstance = {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  refresh: () => void;
  forward: () => void;
}; 