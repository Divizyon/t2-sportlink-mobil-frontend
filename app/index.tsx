import React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import ThemeToggle from '../components/ThemeToggle';
import LoginForm from '../components/LoginForm';
import { useAuthStore, useThemeStore } from '../store';

export default function Index() {
  // Zustand store'larından state'leri al
  const { isAuthenticated, user } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>
        Sportlink Mobil Uygulaması
      </Text>
      
      <ThemeToggle />
      
      <LoginForm />
      
      <View style={styles.infoContainer}>
        <Text style={[styles.infoTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          Sportlink Hakkında
        </Text>
        <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Sportlink, spor takımları için geliştirilmiş bir yönetim uygulamasıdır. Takım üyeleri, antrenörler
          ve yöneticiler için etkinlik planlaması, iletişim ve performans takibi sağlar.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  welcomeContainer: {
    backgroundColor: '#e6f7ff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
