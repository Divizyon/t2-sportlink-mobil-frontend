import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { deviceService } from '../api/devices/deviceService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      if (existingToken) return existingToken;

      // İzinleri kontrol et
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      // İzin yoksa iste
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      // İzin yoksa çık
      if (finalStatus !== 'granted') {
        console.log('Push bildirimleri için izin alınamadı!');
        return null;
      }
      
      // Expo Push Token'ı al
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID || "", // Expo project ID
      });
      
      console.log('Push token alındı:', token);
      
      // Token'ı API'ye kaydet
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      await deviceService.registerToken(token, platform);
      
      // Token'ı local storage'a kaydet
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      
      return token;
    } catch (error) {
      console.error('Push notification token alınırken hata oluştu:', error);
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