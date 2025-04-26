import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from './src/store/appStore/themeStore';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const { theme, isDarkMode } = useThemeStore();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
