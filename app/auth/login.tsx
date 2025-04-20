import { View, StyleSheet, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useEffect } from 'react';
import LoginForm from '../../components/LoginForm';
import { useAuthStore, useThemeStore } from '../../store';
import { router } from 'expo-router';

/**
 * Login rotası - signin sayfasına yönlendirir
 */
export default function Login() {
  const { isAuthenticated } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('map' as any);
    } else {
      router.replace('signin' as any);
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }
    ]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={[
              styles.logo,
              { color: isDarkMode ? '#fff' : '#333' }
            ]}>
              SportLink
            </Text>
            <Text style={[
              styles.subtitle,
              { color: isDarkMode ? '#aaa' : '#666' }
            ]}>
              Spor tesislerini keşfet ve bağlan
            </Text>
            
            <LoginForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
}); 