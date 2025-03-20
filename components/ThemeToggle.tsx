import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useThemeStore } from '../store';

/**
 * Tema değiştirme bileşeni
 * Zustand store kullanarak tema değişimini yönetir
 */
const ThemeToggle = () => {
  // Zustand store'dan tema durumunu ve değiştirme fonksiyonunu al
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <Text style={[styles.text, { color: isDarkMode ? '#fff' : '#333' }]}>
        {isDarkMode ? 'Karanlık Mod' : 'Aydınlık Mod'}
      </Text>
      <Switch
        value={isDarkMode}
        onValueChange={toggleTheme}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ThemeToggle; 