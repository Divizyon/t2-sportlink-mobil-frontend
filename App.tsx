import 'react-native-get-random-values';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from './src/store/appStore/themeStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { useNotificationStore } from './src/store/appStore/notificationStore';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

// SplashScreen component
const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { theme } = useThemeStore();
  
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, scaleAnim]);
  
  return (
    <View style={[styles.splashContainer, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        <Text style={styles.splashLogo}>
          <Text style={{ color: '#4CAF50', fontSize: 40, fontWeight: 'bold' }}>Sport</Text>
          <Text style={{ color: '#2F4F4F', fontSize: 40, fontWeight: 'bold' }}>Link</Text>
        </Text>
        <Text style={[styles.splashTagline, { color: theme.colors.textSecondary }]}>
          Spora Bağlan, Hayata Bağlan!
        </Text>
      </Animated.View>
    </View>
  );
};

export default function App() {
  const { theme, isDarkMode } = useThemeStore();
  const notificationStore = useNotificationStore();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const [isLoading, setIsLoading] = useState(true);
  
  const requestPermissionsAsync = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Bildirim izni reddedildi!');
    }
  }
  
  // Uygulama ilk yüklendiğinde push bildirimleri için kayıt ol
  useEffect(() => {
    // Splash ekranının gösterilme süresi
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    // Bildirim sistemini yapılandır
    const setupNotifications = async () => {
      try {
        // Expo push token'ı kaydet
        await notificationStore.registerPushNotifications();
        
        // Bildirim dinleyicilerini ayarla
        // Önplandayken bildirim geldiğinde
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
          try {
            const data = notification.request.content.data as any;
            console.log('Önplanda bildirim alındı:', data);
            
            // Zustand store'a yeni bildirimi ekleyebiliriz
            // Eğer bildirim objesi tam değilse, unread sayısını artırıp sadece yenileme yapabiliriz
            if (data?.notificationId) {
              notificationStore.fetchUnreadCount();
            }
          } catch (error) {
            console.error('Bildirim işleme hatası:', error);
          }
        });
        
        // Bildirime tıklandığında
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          try {
            console.log('Bildirime tıklandı:', response);
            const data = response.notification.request.content.data as any;
            
            // Bildirime tıklandığında, bildirimi okundu olarak işaretle ve yönlendirme yap
            if (data?.notificationId) {
              notificationStore.markAsRead(data.notificationId);
              
              // Yönlendirme işlemleri (örneğin: etkinlik, mesaj vs.)
              if (data.type === 'event' && data.eventId) {
                // Etkinlik sayfasına yönlendir
                // navigation.navigate('EventDetail', { eventId: data.eventId });
              }
            }
          } catch (error) {
            console.error('Bildirim yanıt işleme hatası:', error);
          }
        });
      } catch (error) {
        console.error('Bildirim ayarlama hatası:', error);
      }
    };
    
    setupNotifications();
    
    // Temizlik
    return () => {
      try {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      } catch (error) {
        console.error('Bildirim temizleme hatası:', error);
      }
    };
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        {isLoading ? <SplashScreen /> : <AppNavigator />}
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  splashTagline: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 50,
    marginTop: 8,
  },
});
