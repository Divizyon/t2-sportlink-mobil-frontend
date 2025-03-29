import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useThemeStore, useAuthStore } from '../../store';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { isDarkMode } = useThemeStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    router.replace('/');
  };
  
  const handleLogin = () => {
    router.push('/(auth)/login');
  };
  
  if (!isAuthenticated) {
    return (
      <View style={[
        styles.container, 
        { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }
      ]}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>
          Giriş Yapılmadı
        </Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666', marginBottom: 20 }]}>
          Profil bilgilerinizi görüntülemek için lütfen giriş yapın.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }
    ]}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/150' }} 
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#333' }]}>
          {user?.username || 'Kullanıcı'}
        </Text>
        <Text style={[styles.email, { color: isDarkMode ? '#ccc' : '#666' }]}>
          {user?.email || 'kullanici@ornek.com'}
        </Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.infoTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          Profil Bilgileri
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Üyelik:</Text>
          <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#333' }]}>Premium</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Takım:</Text>
          <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#333' }]}>Sportlink FC</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Pozisyon:</Text>
          <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#333' }]}>Antrenör</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  infoContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
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
}); 