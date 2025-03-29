import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import LoginForm from '../../components/LoginForm';
import { useThemeStore } from '../../store';

export default function LoginScreen() {
  const { isDarkMode } = useThemeStore();

  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }
    ]}>
      <LoginForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
}); 