import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Tema renkleri
const lightColors = {
  ...MD3LightTheme.colors,
  primary: '#1D5BC2',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D6E3FF',
  onPrimaryContainer: '#001A42',
  secondary: '#2B5EA7',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D6E3FF',
  onSecondaryContainer: '#001A42',
  tertiary: '#4355B9',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#DEE0FF',
  onTertiaryContainer: '#00105C',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#F8FDFF',
  onBackground: '#191C1E',
  surface: '#F8FDFF',
  onSurface: '#191C1E',
  surfaceVariant: '#E1E2EC',
  onSurfaceVariant: '#44474F',
  outline: '#74777F',
  outlineVariant: '#C4C6D0',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#2E3133',
  inverseOnSurface: '#EFF1F3',
  inversePrimary: '#ADC6FF',
  elevation: {
    level0: 'transparent',
    level1: '#F5F9FD',
    level2: '#F3F7FB',
    level3: '#F0F4F8',
    level4: '#EEF3F7',
    level5: '#EDF1F6',
  },
  surfaceDisabled: '#19191926',
  onSurfaceDisabled: '#19191961',
  backdrop: '#000000B3',
  border: '#E1E2EC',
};

const darkColors = {
  ...MD3DarkTheme.colors,
  primary: '#ADC6FF',
  onPrimary: '#002E6A',
  primaryContainer: '#004395',
  onPrimaryContainer: '#D6E3FF',
  secondary: '#ADC6FF',
  onSecondary: '#00315B',
  secondaryContainer: '#004882',
  onSecondaryContainer: '#D6E3FF',
  tertiary: '#B9C3FF',
  onTertiary: '#192576',
  tertiaryContainer: '#303F9F',
  onTertiaryContainer: '#DEE0FF',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFB4AB',
  background: '#191C1E',
  onBackground: '#E2E2E5',
  surface: '#191C1E',
  onSurface: '#E2E2E5',
  surfaceVariant: '#44474F',
  onSurfaceVariant: '#C4C6D0',
  outline: '#8E9099',
  outlineVariant: '#44474F',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#E2E2E5',
  inverseOnSurface: '#2E3133',
  inversePrimary: '#1D5BC2',
  elevation: {
    level0: 'transparent',
    level1: '#1C2022',
    level2: '#212528',
    level3: '#242A2D',
    level4: '#272D30',
    level5: '#293033',
  },
  surfaceDisabled: '#E2E2E51F',
  onSurfaceDisabled: '#E2E2E561',
  backdrop: '#000000B3',
  border: '#44474F',
};

// Tüm uygulamada kullanılacak ortak stiller ve renkler
export const themed = {
  colors: lightColors, // Varsayılan olarak açık tema
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  // Dinamik olarak tema renklerini al
  useThemedColors: () => {
    const colorScheme = useColorScheme();
    return colorScheme === 'dark' ? darkColors : lightColors;
  },
};

// Dinamik tema hook'u
export const useThemed = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  
  return {
    ...themed,
    colors,
    isDark: colorScheme === 'dark',
  };
}; 