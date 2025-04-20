import React, { useEffect } from 'react';
import { useAuthStore } from '../store';
import { Redirect } from 'expo-router';
import WelcomeScreen from '@/src/screens/auth/Welcome';

/**
 * Karşılama ekranı
 * Giriş ve kayıt seçenekleriyle başlangıç ekranı
 */
export default function Index() {
  const { isAuthenticated } = useAuthStore();

  // Eğer kullanıcı zaten giriş yapmışsa ana ekrana yönlendir
  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return <WelcomeScreen />;
}
