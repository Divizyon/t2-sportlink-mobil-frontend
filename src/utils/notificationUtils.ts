import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { deviceService } from '../api/devices/deviceService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Expo-device yüklü değilse bir alternatif sağlayalım
let Device = { isDevice: true };
try {
  Device = require('expo-device');
} catch (error) {
  console.warn('expo-device modülü yüklenemedi. Bazı özellikler çalışmayabilir.');
}

const PUSH_TOKEN_KEY = 'expo_push_notification_token';

// Bildirimler için davranış ayarla (uygulamanın önplanında iken)
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

// Android cihazlar için bildirim kanalı oluştur
async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'SportLink',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      console.log('Android bildirim kanalı oluşturuldu');
    } catch (error) {
      console.error('Bildirim kanalı oluşturulurken hata:', error);
    }
  }
}

/**
 * Push bildirimleri için yardımcı fonksiyonlar
 */
export const notificationUtils = {
  /**
   * Push bildirim izinlerini iste ve token al
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Daha önce kaydedilmiş bir token var mı kontrol et
      const existingToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (existingToken) {
        console.log('Mevcut token kullanılıyor:', existingToken);
        return existingToken;
      }

      // Android için bildirim kanalı oluştur
      await setupNotificationChannel();
      
      // İzinleri kontrol et
      let permissionGranted = false;
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          console.log('Bildirim izni isteniyor...');
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        permissionGranted = finalStatus === 'granted';
      } catch (error) {
        console.error('Bildirim izni alınırken hata:', error);
      }
      
      if (!permissionGranted) {
        console.log('Bildirim izni alınamadı');
        return null;
      }
      
      console.log('Bildirim izni alındı, token talep ediliyor');
      
      // Expo Project ID'yi al
      const projectId = 
        Constants.expoConfig?.extra?.eas?.projectId || 
        "a5ef1d73-6a20-40b3-9fb9-37fba05f8d61"; // Fall-back ID
      
      let token = null;
      try {
        // Expo Push Token'ı al
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId
        });
        token = tokenData.data;
        console.log('Push token başarıyla alındı:', token);
      } catch (error) {
        console.error('Token alınırken hata:', error);
        return null;
      }
      
      if (!token) {
        console.error('Token alınamadı');
        return null;
      }
      
      try {
        // Token'ı API'ye kaydet
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        await deviceService.registerToken(token, platform);
        
        // Token'ı local storage'a kaydet
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
        
        return token;
      } catch (error) {
        console.error('Token kaydetme hatası:', error);
        return token; // Yine de token'ı döndür
      }
    } catch (error) {
      console.error('Push notification token alınırken beklenmeyen hata:', error);
      return null;
    }
  },
  
  /**
   * Mevcut token'ı sil/kaldır
   */
  async unregisterPushNotifications(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      
      if (token) {
        await deviceService.unregisterToken(token);
        await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
      }
      
      return true;
    } catch (error) {
      console.error('Push notification token silinirken hata oluştu:', error);
      return false;
    }
  },
  
  /**
   * Mevcut kayıtlı token'ı al
   */
  async getStoredPushToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    } catch (error) {
      console.error('Token alınırken hata oluştu:', error);
      return null;
    }
  }
}; 