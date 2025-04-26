import { AppTheme } from '../../types/theme.types';
import { colors } from '../../constants/colors/colors';

export const darkTheme: AppTheme = {
  colors: {
    ...colors,
    background: '#121212',
    cardBackground: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#BBBBBB',
    primary: '#273C75',
    secondary: '#192A56',
    dark: '#333333',
    light: '#484848',
    silver: '#666666',
    border: '#444444',
    shadow: 'rgba(0, 0, 0, 0.3)',
    notification: '#FF453A',
  },
  mode: 'dark',
};