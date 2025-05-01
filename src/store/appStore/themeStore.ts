import { create } from 'zustand';
import { colors } from '../../constants/colors/colors';
import { AppTheme, ThemeState } from '../../types/theme.types';

// Light ve dark tema tanımları
const lightTheme: AppTheme = {
  colors: {
    ...colors,
    cardBackground: '#FFFFFF',
    notification: '#FF3B30',
  },
  mode: 'light'
};

const darkTheme: AppTheme = {
  colors: {
    ...colors,
    background: '#121212',
    cardBackground: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#BBBBBB',
    primary: '#273C75',
    secondary: '#192A56',
    accent: '#338626',
    dark: '#333333',
    light: '#484848',
    silver: '#666666',
    border: '#444444',
    shadow: 'rgba(0, 0, 0, 0.3)',
    white: '#FFFFFF',
    notification: '#FF453A',
  },
  mode: 'dark'
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => set((state) => ({ 
    isDarkMode: !state.isDarkMode,
    theme: !state.isDarkMode ? darkTheme : lightTheme
  })),
}));