import { create } from 'zustand';
import { colors } from '../../constants/colors/colors';

// Tema tipleri
interface AppTheme {
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    light: string;
    silver: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    border: string;
    shadow: string;
  };
  mode: 'light' | 'dark';
}

// Light ve dark tema tanımları
const lightTheme: AppTheme = {
  colors: {
    ...colors
  },
  mode: 'light'
};

const darkTheme: AppTheme = {
  colors: {
    ...colors,
    background: '#121212',
    text: '#FFFFFF',
    textSecondary: '#BBBBBB',
    primary: '#273C75',
    secondary: '#192A56',
    accent: '#44BD32',
    dark: '#333333',
    light: '#484848',
    silver: '#666666',
    border: '#444444',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  mode: 'dark'
};

interface ThemeState {
  theme: AppTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => set((state) => ({ 
    isDarkMode: !state.isDarkMode,
    theme: !state.isDarkMode ? darkTheme : lightTheme
  })),
})); 