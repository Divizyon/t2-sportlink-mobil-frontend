import { create } from 'zustand';
import { notificationService } from '../../api/notifications';
import { Notification, NotificationSettings } from '../../types/apiTypes/notification.types';
import { notificationUtils } from '../../utils/notificationUtils';

interface NotificationState {
  // Bildirim verileri
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Bildirim ayarları
  settings: NotificationSettings;
  isSettingsLoading: boolean;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // İşlevler
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  
  // Bildirim ayarları
  fetchNotificationSettings: () => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  
  // Push notification
  registerPushNotifications: () => Promise<void>;
  unregisterPushNotifications: () => Promise<void>;
  
  // Yeni bildirim ekle (Realtime aboneliği için kullanılır)
  addNotification: (notification: Notification) => void;
  
  // Test bildirimi gönder (sadece geliştirme için)
  sendTestNotification: (title: string, body: string, type: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  
  // Varsayılan bildirim ayarları - Backend'den gerçek değerler alınabilir
  settings: {
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    newEventNearby: true,
    eventReminder: true,
    eventCanceled: true,
    eventChanged: true,
    newFollower: true,
    newComment: true,
    directMessage: true,
    mention: true,
    appUpdates: true,
    tipsEnabled: false
  },
  isSettingsLoading: false,
  
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  
  // Bildirimleri getir
  fetchNotifications: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await notificationService.getNotifications(page, limit);
      
      if (response.success && response.data) {
        set({
          notifications: page === 1 
            ? response.data.notifications 
            : [...get().notifications, ...response.data.notifications],
          pagination: response.data.pagination,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || 'Bildirimler yüklenirken bir hata oluştu',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Bildirimler yüklenirken bir hata oluştu', 
        isLoading: false 
      });
    }
  },
  
  // Bildirimleri yenile
  refreshNotifications: async () => {
    await get().fetchNotifications(1, get().pagination.limit);
    await get().fetchUnreadCount();
  },
  
  // Okunmamış bildirim sayısını getir
  fetchUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data) {
        set({ unreadCount: response.data.count });
      }
    } catch (error) {
      console.error('Okunmamış bildirim sayısı alınırken hata oluştu:', error);
    }
  },
  
  // Bildirimi okundu olarak işaretle
  markAsRead: async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      
      if (response.success) {
        // State'i güncelle
        set(state => ({
          notifications: state.notifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true } 
              : notification
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }));
      }
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata oluştu:', error);
    }
  },
  
  // Tüm bildirimleri okundu olarak işaretle
  markAllAsRead: async () => {
    try {
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        // State'i güncelle
        set(state => ({
          notifications: state.notifications.map(notification => ({ ...notification, is_read: true })),
          unreadCount: 0
        }));
      }
    } catch (error) {
      console.error('Tüm bildirimler okundu olarak işaretlenirken hata oluştu:', error);
    }
  },
  
  // Bildirim ayarlarını getir
  fetchNotificationSettings: async () => {
    set({ isSettingsLoading: true });
    
    try {
      const response = await notificationService.getNotificationSettings();
      
      if (response.success && response.data) {
        set({
          settings: response.data,
          isSettingsLoading: false
        });
      } else {
        set({ isSettingsLoading: false });
      }
    } catch (error) {
      set({ isSettingsLoading: false });
      console.error('Bildirim ayarları alınırken hata oluştu:', error);
    }
  },
  
  // Bildirim ayarlarını güncelle
  updateNotificationSettings: async (settings: Partial<NotificationSettings>) => {
    set({ isSettingsLoading: true });
    
    try {
      const response = await notificationService.updateNotificationSettings(settings);
      
      if (response.success && response.data) {
        set({
          settings: response.data,
          isSettingsLoading: false
        });
      } else {
        set({ isSettingsLoading: false });
      }
    } catch (error) {
      set({ isSettingsLoading: false });
      console.error('Bildirim ayarları güncellenirken hata oluştu:', error);
    }
  },
  
  // Push bildirimleri için kayıt ol
  registerPushNotifications: async () => {
    try {
      const token = await notificationUtils.registerForPushNotifications();
      if (token) {
        console.log('Push notification token başarıyla kaydedildi');
      }
    } catch (error) {
      console.error('Push bildirimleri için kayıt sırasında hata oluştu:', error);
    }
  },
  
  // Push bildirimlerini kaldır
  unregisterPushNotifications: async () => {
    try {
      await notificationUtils.unregisterPushNotifications();
    } catch (error) {
      console.error('Push bildirimleri kaldırılırken hata oluştu:', error);
    }
  },
  
  // Yeni bildirim ekle (Realtime aboneliği için kullanılır)
  addNotification: (notification: Notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },
  
  // Test bildirimi gönder (sadece geliştirme için)
  sendTestNotification: async (title: string, body: string, type: string) => {
    try {
      await notificationService.sendTestNotification({
        title,
        body,
        type,
        data: { testKey: 'testValue' }
      });
    } catch (error) {
      console.error('Test bildirimi gönderilirken hata oluştu:', error);
    }
  }
})); 