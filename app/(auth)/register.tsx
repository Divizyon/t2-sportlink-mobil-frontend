import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useThemeStore } from '../../store';

export default function RegisterScreen() {
  const { isDarkMode } = useThemeStore();
  
  const handleRegister = () => {
    // Kayıt işlemi burada yapılacak
    // Başarılı kayıt sonrası ana ekrana yönlendirme
    router.replace('/');
  };
  
  const goToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }
    ]}>
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>
        Hesap Oluştur
      </Text>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: isDarkMode ? '#333' : '#fff',
          color: isDarkMode ? '#fff' : '#333',
        }]}
        placeholder="Kullanıcı Adı"
        placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: isDarkMode ? '#333' : '#fff',
          color: isDarkMode ? '#fff' : '#333',
        }]}
        placeholder="E-posta"
        placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
        keyboardType="email-address"
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: isDarkMode ? '#333' : '#fff',
          color: isDarkMode ? '#fff' : '#333',
        }]}
        placeholder="Şifre"
        placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.loginLink}
        onPress={goToLogin}
      >
        <Text style={[styles.loginLinkText, { color: isDarkMode ? '#4dabf7' : '#0078d7' }]}>
          Zaten hesabınız var mı? Giriş yapın
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#0078d7',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
  },
}); 