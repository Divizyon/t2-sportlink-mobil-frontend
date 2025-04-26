export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
  silver: string;
  white: string;
  background: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  border: string;
  shadow: string;
}

export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  colors: ThemeColors;
  mode: ThemeMode;
} 