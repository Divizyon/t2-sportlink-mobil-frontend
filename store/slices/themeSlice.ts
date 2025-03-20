import { create } from 'zustand';
import { ThemeStore } from '../../types/store';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tema ayarları için Zustand store
 * Persist middleware ile kullanıcı tercihleri cihazda saklanır
 */
const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      // State
      isDarkMode: false,

      // Actions
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
    }),
    {
      name: 'theme-storage', // AsyncStorage'da saklanacak anahtar
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useThemeStore; 