import { AppTheme } from '../../types/appTypes/theme.types';
import { colors } from '../../constants/colors/colors';

export const darkTheme: AppTheme = {
  colors: {
    ...colors,
    primary: '#273C75',
    secondary: '#192A56',
    background: '#121212',
    text: '#FFFFFF',
    textSecondary: '#a0a0a0',
    border: '#2c2c2c',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  mode: 'dark',
}; 