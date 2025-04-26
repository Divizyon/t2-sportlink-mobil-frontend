import { AppTheme } from '../../types/theme.types';
import { colors } from '../../constants/colors/colors';

export const lightTheme: AppTheme = {
  colors: {
    ...colors,
    notification: '#FF3B30',
  },
  mode: 'light',
};