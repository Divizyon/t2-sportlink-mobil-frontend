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
        DeepVision Mobil Uygulaması
      </Text>

      <ThemeToggle />

      {isAuthenticated ? (
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeText, { color: isDarkMode ? '#fff' : '#333' }]}>
            Hoş geldiniz, {user?.username}!
          </Text>
          <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
            Başarıyla giriş yaptınız. Zustand state yönetimi çalışıyor.
          </Text>
        </View>
      ) : (
        <LoginForm />
      )}

      <View style={styles.infoContainer}>
        <Text style={[styles.infoTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          Zustand Hakkında
        </Text>
        <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Zustand, React uygulamaları için basit ve hızlı bir state yönetim kütüphanesidir. Redux'a
          göre daha az boilerplate kod gerektirir ve React hooks API'si ile uyumludur.
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
  infoContainer: {
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 24,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  welcomeContainer: {
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    marginVertical: 16,
    padding: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
