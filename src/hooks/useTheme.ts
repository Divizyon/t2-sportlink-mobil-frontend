import { useCallback } from 'react';
import useThemeStore from '../../store/slices/themeSlice';

/**
 * Tema yönetimi için özel hook
 * @returns Tema durumu ve fonksiyonları
 */
export const useTheme = () => {
  const { isDarkMode, toggleTheme, setDarkMode } = useThemeStore();

  /**
   * Karanlık moda geç
   */
  const enableDarkMode = useCallback(() => {
    setDarkMode(true);
  }, [setDarkMode]);

  /**
   * Aydınlık moda geç
   */
  const enableLightMode = useCallback(() => {
    setDarkMode(false);
  }, [setDarkMode]);

  return {
    isDarkMode,
    toggleTheme,
    enableDarkMode,
    enableLightMode
  };
}; 