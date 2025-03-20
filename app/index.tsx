import React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import ThemeToggle from '../components/ThemeToggle';
import LoginForm from '../components/LoginForm';
import { useAuthStore, useThemeStore } from '../store';
import { router } from 'expo-router';
import FormButton from '../components/form/FormButton';

export default function Index() {
  // Zustand store'larından state'leri al
  const { isAuthenticated, user } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  const handleRegister = () => {
    router.push('/register');
  };

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
        <>
          <LoginForm />
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Henüz hesabınız yok mu?
            </Text>
            <FormButton
              title="Kayıt Ol"
              variant="outline"
              onPress={handleRegister}
              style={styles.registerButton}
            />
          </View>
        </>
      )}
      
      <View style={styles.infoContainer}>
        <Text style={[styles.infoTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          React Hook Form ve Yup Hakkında
        </Text>
        <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          React Hook Form, performans odaklı, esnek ve kullanımı kolay form doğrulama kütüphanesidir.
          Yup ise JavaScript için şema oluşturma ve doğrulama kütüphanesidir.
          Bu iki kütüphane birlikte kullanıldığında, form doğrulama işlemleri çok daha kolay hale gelir.
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
  registerContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    marginBottom: 8,
  },
  registerButton: {
    minWidth: 120,
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
