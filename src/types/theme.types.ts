/**
 * Tema renkleri tipi
 */
export interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
  silver: string;
  white: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  border: string;
  shadow: string;
  notification: string;
}

/**
 * Tema modu tipi
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Tema tipi
 */
export interface AppTheme {
  colors: ThemeColors;
  mode: ThemeMode;
  spacing?: {
    small: number;
    medium: number;
    large: number;
  };
}

/**
 * Tema durum yönetimi
 */
export interface ThemeState {
  theme: AppTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}