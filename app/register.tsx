import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useAuthStore, useThemeStore } from '../store';
import { router } from 'expo-router';
import RegisterForm from '../components/RegisterForm';
import FormButton from '../components/form/FormButton';

export default function Register() {
  const { register, isLoading, error } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  // Kayıt başarılı olduğunda, ana sayfaya yönlendirilecek
  // Bu isAuthenticated değiştiğinde App.tsx içinde yönlendirme ile hallediliyor

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>
        DeepVision Uygulaması
      </Text>
      
      <RegisterForm 
        onRegister={register}
        isLoading={isLoading}
        error={error || undefined}
      />
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Zaten bir hesabınız var mı?
        </Text>
        <FormButton
          title="Giriş Yap"
          variant="outline"
          onPress={handleBackToLogin}
          style={styles.loginButton}
        />
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
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginBottom: 8,
  },
  loginButton: {
    minWidth: 120,
  }
}); 