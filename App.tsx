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
  const bgCircleAnim = useRef(new Animated.Value(0)).current;
  const leafFadeAnim = useRef(new Animated.Value(0)).current;
  const leafTranslateAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const { theme } = useThemeStore();

  // Sportif ikon URL'si
  const leafImageUrl = "https://cdn.pixabay.com/photo/2018/05/17/14/53/plant-3408820_1280.png";
  
  // Pulse animasyonu için
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);
  
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
        Animated.timing(bgCircleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      // Yaprak animasyonu
      Animated.parallel([
        Animated.timing(leafFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(leafTranslateAnim, {
          toValue: 0,
          friction: 6,
          tension: 40,
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
  }, [fadeAnim, scaleAnim, sloganFadeAnim, bgCircleAnim, leafFadeAnim, leafTranslateAnim, translateYAnim]);
  
  return (
    <View style={[styles.splashContainer, { backgroundColor: '#FFFFFF' }]}>
      {/* Arkaplan çemberleri */}
      <Animated.View style={[
        styles.backgroundCircle,
        {
          opacity: bgCircleAnim,
          transform: [
            { scale: bgCircleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1.5]
            })}
          ]
        }
      ]} />
      
      <Animated.View style={[
        styles.secondaryBackgroundCircle,
        {
          opacity: bgCircleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.6]
          }),
          transform: [
            { scale: pulseAnim }
          ]
        }
      ]} />
      
      {/* Yaprağın konumlandırılması */}
      <Animated.Image 
        source={{ uri: leafImageUrl }} 
        style={[
          styles.leafImage,
          {
            opacity: leafFadeAnim,
            transform: [
              { translateY: leafTranslateAnim },
              { translateX: leafTranslateAnim },
              { rotate: '-15deg' }
            ]
          }
        ]}
        resizeMode="contain"
      />
      
      {/* İkinci süs yaprağı */}
      <Animated.Image 
        source={{ uri: leafImageUrl }} 
        style={[
          styles.secondaryLeafImage,
          {
            opacity: leafFadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.4]
            }),
            transform: [
              { translateY: leafTranslateAnim },
              { translateX: -leafTranslateAnim },
              { rotate: '25deg' }
            ]
          }
        ]}
        resizeMode="contain"
      />
      
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
        <Text style={styles.splashLogo}>
          <Text style={[styles.sportText, { color: colors.accent }]}>Sport</Text>
          <Text style={[styles.linkText, { color: colors.accentDark }]}>Link</Text>
        </Text>
        
        <Animated.Text 
          style={[
            styles.splashTagline, 
            { 
              color: colors.text,
              opacity: sloganFadeAnim 
            }
          ]}
        >
          sporun sosyal hali
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
  backgroundCircle: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    borderRadius: width,
    backgroundColor: 'rgba(51, 134, 38, 0.06)', // Accent renk (yeşil) tonunda transparan arka plan
    zIndex: 1,
  },
  secondaryBackgroundCircle: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(51, 134, 38, 0.1)', // Accent renk (yeşil) tonunda daha koyu transparan arka plan
    zIndex: 1,
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
  leafImage: {
    position: 'absolute',
    width: 150,
    height: 150,
    top: height * 0.1,
    right: width * 0.15,
    zIndex: 2,
    opacity: 0.7,
  },
  secondaryLeafImage: {
    position: 'absolute',
    width: 100,
    height: 100,
    bottom: height * 0.15,
    left: width * 0.15,
    zIndex: 2,
    opacity: 0.4,
  },
  versionText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: '#666',
    letterSpacing: 0.5,
  },
});
