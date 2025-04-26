import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useAuthStore } from '../../store/userStore/authStore';

export const ProfileScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user, logout } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Profilim</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {user?.username || 'Kullanıcı'}
        </Text>
        
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
}); 