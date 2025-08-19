import 'react-native-get-random-values';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, View, Text, Animated, StyleSheet, Dimensions, Image } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from './src/store/appStore/themeStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { useNotificationStore } from './src/store/appStore/notificationStore';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { colors } from './src/constants/colors/colors';

const { width, height } = Dimensions.get('window');

// SplashScreen component
const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const sloganFadeAnim = useRef(new Animated.Value(0)).current;
  
  const { theme } = useThemeStore();
  
  useEffect(() => {
    Animated.sequence([
      // Logo animasyonu
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Slogan animasyonu
      Animated.timing(sloganFadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, sloganFadeAnim, translateYAnim]);
  
  return (
    <View style={[styles.splashContainer, { backgroundColor: '#FFFFFF' }]}>
      
      {/* Logo ve Slogan Container */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim }
            ],
          }
        ]}
      >
          <Image
            source={require('./assets/icon.png')}
            style={{ width: 96, height: 96, marginBottom: 16 }}
            resizeMode="contain"
          />
        
        <Animated.Text 
          style={[
            styles.splashTagline, 
            { 
              color: colors.text,
              opacity: sloganFadeAnim 
            }
          ]}
        >
          Sporun sosyal hali
        </Animated.Text>
      </Animated.View>
      
      {/* Versiyon bilgisi */}
      <Animated.Text 
        style={[
          styles.versionText, 
          { 
            opacity: sloganFadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.7]
            })
          }
        ]}
      >
        versiyon 0.0.1
      </Animated.Text>
      
      {/* Developed by Divizyon */}
      <Animated.View 
        style={[
          styles.developedByContainer, 
          { 
            opacity: sloganFadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.8]
            })
          }
        ]}
      >
        <View style={styles.divizyonBadge}>
          <Text style={styles.developedByText}>
            Developed by
          </Text>
          <Image 
            source={require('./assets/images/divizyon.png')}
            style={styles.divizyonIcon}
            resizeMode="contain"
          />
          <Text style={styles.divizyonText}>
            Divizyon
          </Text>
          <Text style={styles.partnerText}> & </Text>
          <Image 
            source={require('./assets/kbb.png')}
            style={styles.kbbIcon}
            resizeMode="contain"
          />
          <Text style={styles.kbbText}>
            KBB
          </Text>
        </View>
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
    }, 3000);
    
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
    position: 'relative',
    overflow: 'hidden',
  },

  contentContainer: {
    alignItems: 'center',
    zIndex: 3,
  },
  splashLogo: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  sportText: {
    fontWeight: 'bold',
  },
  linkText: {
    fontWeight: 'bold',
  },
  splashTagline: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 50,
    marginTop: 16,
    letterSpacing: 0.5,
  },

  versionText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: '#666',
    letterSpacing: 0.5,
  },
  developedByContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divizyonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#338626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  developedByText: {
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    fontStyle: 'italic',
    marginRight: 4,
    fontWeight: '400',
  },
  divizyonIcon: {
    width: 16,
    height: 16,
    marginHorizontal: 4,
  },
  divizyonText: {
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    fontStyle: 'italic',
    fontWeight: '600',
    marginLeft: 2,
  },
  partnerText: {
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    fontWeight: '400',
    marginHorizontal: 2,
  },
  kbbIcon: {
    width: 16,
    height: 16,
    marginHorizontal: 4,
  },
  kbbText: {
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    fontStyle: 'italic',
    fontWeight: '600',
    marginLeft: 2,
  },
});
