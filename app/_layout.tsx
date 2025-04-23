import { Slot, Stack } from 'expo-router';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import '@/global.css';
import React from 'react';

/**
 * Ana uygulama layoutu
 * Tüm ekranları kapsayan temel stack yapısı
 * Stack Navigator kullanarak router performansını iyileştirdik
 */
export default function RootLayout() {
  return (
    <OptimizedGluestackProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 200,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: 'fade',
            animationDuration: 100, // Daha hızlı geçiş
            gestureEnabled: false, // Geri kaydırma devre dışı
          }}
        />
      </Stack>
    </OptimizedGluestackProvider>
  );
}

// Gereksiz yeniden renderlamaları önlemek için memoize edilmiş provider
const OptimizedGluestackProvider = React.memo(function OptimizedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GluestackUIProvider config={config}>{children}</GluestackUIProvider>;
});
