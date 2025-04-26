import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';

export const DiscoverScreen: React.FC = () => {
  const { theme } = useThemeStore();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Keşfet</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Etkinlik ve spor arkadaşı bulma sayfası
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
}); 