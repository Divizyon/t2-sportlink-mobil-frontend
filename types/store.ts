/**
 * Store için tip tanımlamaları
 */
import { RegisterFormData } from '../utils/validations/registerSchema';

// Kullanıcı tipi örneği
export interface User {
  id: string;
  username: string;
  email: string;
  name: string; // Kullanıcının adı
  // Diğer kullanıcı özellikleri
}

// Auth store tipi
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth store aksiyonları
export interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Tam Auth store tipi
export type AuthStore = AuthState & AuthActions;

// Tema store tipi örneği
export interface ThemeState {
  isDarkMode: boolean;
}

export interface ThemeActions {
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export type ThemeStore = ThemeState & ThemeActions;
