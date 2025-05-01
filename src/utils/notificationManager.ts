import * as Notifications from 'expo-notifications';
import { Platform, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bildirimlerin uygulama içinden ve dışından nasıl görüneceğini yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Expo push token'ını kaydet ve bildir
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    // Android 13+ için bildirim izinleri
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Cihaz token'ını getir
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // İzin yoksa iste
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Yine izin yoksa bildir
  if (finalStatus !== 'granted') {
    console.log('Push bildirimleri için izin alınamadı!');
    return;
  }

  // Expo push token'ını getir
  try {
    token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch (error) {
    console.error('Expo push token alınamadı:', error);
    return null;
  }
}

// Tüm bildirimleri kapat
async function dismissAllNotifications() {
  await Notifications.dismissAllNotificationsAsync();
}

// Uygulama badge sayısını ayarla
async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

// Yerel bildirim gönderme fonksiyonu
export async function sendLocalNotification(title: string, body: string, data?: any) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
    },
    trigger: null, // Hemen göster
  });
}

// Bildirim okunduğunda çalışan fonksiyon
export function addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Yeni bildirim geldiğinde çalışan fonksiyon
export function addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
  return Notifications.addNotificationReceivedListener(callback);
}

// Bildirim durumunu ekranda göster
export function showConnectionStatusToast(status: 'connected' | 'disconnected' | 'connecting' | 'error') {
  if (Platform.OS === 'android') {
    switch (status) {
      case 'connected':
        ToastAndroid.showWithGravity(
          'Bildirim sistemine bağlandı',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );
        break;
      case 'disconnected':
        ToastAndroid.showWithGravity(
          'Bildirim bağlantısı kesildi. Yeniden bağlanılıyor...',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );
        break;
      case 'connecting':
        ToastAndroid.showWithGravity(
          'Bildirim sistemine bağlanılıyor...',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );
        break;
      case 'error':
        ToastAndroid.showWithGravity(
          'Bildirim sistemine bağlanılamadı!',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM
        );
        break;
    }
  }
  // iOS için Alert Component'i kullanılabilir veya başka bir bildirim sistemi
}

// Supabase Realtime'dan gelen verilerle bildirim göster
export async function showNotificationFromRealtimeEvent(notification: {
  title: string;
  message: string;
  type: string;
  data?: any;
}) {
  // Bildirim tiplerine göre farklı ikonlar belirleyebiliriz
  let icon = '';
  switch (notification.type) {
    case 'event':
      icon = '🗓️';
      break;
    case 'friend':
      icon = '👥';
      break;
    case 'message':
      icon = '💬';
      break;
    case 'system':
      icon = 'ℹ️';
      break;
    default:
      icon = '🔔';
  }
  
  // Bildirimi göster
  await sendLocalNotification(
    `${icon} ${notification.title}`,
    notification.message,
    notification.data
  );
  
  // Okunmamış bildirim sayısını güncelle
  const currentBadge = await Notifications.getBadgeCountAsync();
  await Notifications.setBadgeCountAsync(currentBadge + 1);
}

// Bildirimleri yönetecek ana sınıf
export const NotificationManager = {
  registerForPushNotificationsAsync,
  sendLocalNotification,
  addNotificationResponseListener,
  addNotificationReceivedListener,
  dismissAllNotifications,
  setBadgeCount,
  showNotificationFromRealtimeEvent,
  showConnectionStatusToast,
}; 