import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from './src/store/appStore/themeStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import * as Notifications from 'expo-notifications';
import { NotificationManager } from './src/utils/notificationManager';

export default function App() {
  const { theme, isDarkMode } = useThemeStore();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Push bildirimleri için kurulum ve izinleri yönet
  useEffect(() => {
    // Bildirimlere kayıt ol
    registerForNotifications();

    // Bildirim geldiğinde tetiklenen listener
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Yeni bildirim alındı:', notification);
    });

    // Bildirime tıklandığında tetiklenen listener
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Bildirime yanıt:', response);
      
      // Burada bildirime tıklandığında yapılacak işlemler tanımlanabilir
      // Örneğin belirli bir sayfaya yönlendirme
      const data = response.notification.request.content.data;
      console.log('Bildirim verisi:', data);
    });

    // Component unmount olduğunda listener'ları temizle
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Bildirim izinlerini iste
  const registerForNotifications = async () => {
    try {
      const token = await NotificationManager.registerForPushNotificationsAsync();
      if (token) {
        console.log('Push token alındı:', token);
        // Token'ı API'ye gönderip kullanıcıyla ilişkilendirme işlemi burada yapılabilir
      }
    } catch (error) {
      console.error('Push token hatası:', error);
    }
  };

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
