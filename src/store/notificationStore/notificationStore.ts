import { create } from 'zustand';
import { notificationService, NotificationItem, NotificationsResponse } from '../../api/notifications/notificationService';
import { subscribeToNotifications, createSecureRealtimeChannel } from '../../utils/supabaseClient';
import { NotificationManager } from '../../utils/notificationManager';

// Postgres değişikliği için tip tanımı
interface RealtimePostgresChangesPayload<T> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  errors: any;
}

// Kendi RealtimeChannel tipimizi tanımlıyoruz
type RealtimeChannel = {
  on: (eventType: string, filterObject: any, callback: Function) => RealtimeChannel;
  subscribe: (callback?: (status: string) => void) => RealtimeChannel;
  unsubscribe: () => void;
};

interface NotificationState {
  notifications: NotificationItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  unreadCount: number;
  isMarkingAsRead: Record<string, boolean>;
  realtimeChannel: RealtimeChannel | null;
  isSubscribed: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  
  // İşlemler
  fetchNotifications: (page: number, pageSize: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
  
  // Realtime işlemleri
  subscribeToRealtimeNotifications: (userId: string) => void;
  unsubscribeFromRealtimeNotifications: () => void;
  handleRealtimeNotification: (payload: RealtimePostgresChangesPayload<any>) => void;
  reconnectRealtime: (userId: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  pagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  isLoading: false,
  isRefreshing: false,
  error: null,
  unreadCount: 0,
  isMarkingAsRead: {},
  realtimeChannel: null,
  isSubscribed: false,
  connectionStatus: 'disconnected',

  // Bildirimleri getir
  fetchNotifications: async (page = 1, pageSize = 20) => {
    try {
      const isNewFetch = page === 1;
      
      if (isNewFetch) {
        set({ isRefreshing: true });
      } else {
        set({ isLoading: true });
      }
      
      const response = await notificationService.getNotifications(page, pageSize);
      
      if (response.success && response.data) {
        set((state) => {
          const newNotifications = isNewFetch
            ? response.data!.notifications
            : [...state.notifications, ...response.data!.notifications];
          
          return {
            notifications: newNotifications,
            pagination: {
              totalItems: response.data!.pagination.totalItems,
              totalPages: response.data!.pagination.totalPages,
              currentPage: response.data!.pagination.currentPage,
              pageSize,
              hasNextPage: response.data!.pagination.hasNextPage,
              hasPreviousPage: response.data!.pagination.hasPrevPage,
            }
          };
        });
      } else {
        set({
          error: response.error || 'Bildirimler yüklenirken bir hata oluştu'
        });
      }
    } catch (error) {
      set({
        error: 'Bildirimler yüklenirken beklenmeyen bir hata oluştu'
      });
      console.error('Notification fetch error:', error);
    } finally {
      set({
        isLoading: false,
        isRefreshing: false
      });
    }
  },

  // Okunmamış bildirim sayısını getir
  fetchUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount();
      
      if (response.success && response.data) {
        set({ unreadCount: response.data.count });
      }
    } catch (error) {
      console.error('Unread count fetch error:', error);
    }
  },

  // Bir bildirimi okundu olarak işaretle
  markAsRead: async (notificationId: string) => {
    const { isMarkingAsRead } = get();
    
    // Bildirim zaten okundu olarak işaretleniyorsa işlemi tekrar başlatma
    if (isMarkingAsRead[notificationId]) return;
    
    try {
      set((state) => ({
        isMarkingAsRead: { ...state.isMarkingAsRead, [notificationId]: true }
      }));
      
      // Optimistik güncelleme
      set((state) => {
        const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
        
        if (notificationIndex !== -1) {
          const updatedNotifications = [...state.notifications];
          const notification = { ...updatedNotifications[notificationIndex] };
          
          if (!notification.isRead) {
            notification.isRead = true;
            updatedNotifications[notificationIndex] = notification;
            
            return {
              notifications: updatedNotifications,
              unreadCount: Math.max(0, state.unreadCount - 1)
            };
          }
        }
        
        return state;
      });
      
      const response = await notificationService.markAsRead(notificationId);
      
      if (!response.success) {
        // İşlem başarısız olursa geri al
        set((state) => {
          const error = response.error || 'Bildirim okundu işaretlenirken bir hata oluştu';
          const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
          
          if (notificationIndex !== -1) {
            const updatedNotifications = [...state.notifications];
            const notification = { ...updatedNotifications[notificationIndex] };
            notification.isRead = false;
            updatedNotifications[notificationIndex] = notification;
            
            return {
              notifications: updatedNotifications,
              unreadCount: state.unreadCount + 1,
              error
            };
          }
          
          return { error };
        });
      }
    } catch (error) {
      set({
        error: 'Bildirim okundu işaretlenirken beklenmeyen bir hata oluştu'
      });
      console.error('Mark as read error:', error);
    } finally {
      set((state) => ({
        isMarkingAsRead: { ...state.isMarkingAsRead, [notificationId]: false }
      }));
    }
  },

  // Tüm bildirimleri okundu olarak işaretle
  markAllAsRead: async () => {
    try {
      set({ isLoading: true });
      
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        set((state) => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            isRead: true
          })),
          unreadCount: 0
        }));
      } else {
        set({
          error: response.error || 'Bildirimler okundu işaretlenirken bir hata oluştu'
        });
      }
    } catch (error) {
      set({
        error: 'Bildirimler okundu işaretlenirken beklenmeyen bir hata oluştu'
      });
      console.error('Mark all as read error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Hata mesajını temizle
  clearError: () => {
    set({ error: null });
  },

  // Realtime bildirimlere abone ol
  subscribeToRealtimeNotifications: (userId: string) => {
    const { handleRealtimeNotification, realtimeChannel } = get();
    
    // Halihazırda bir abonelik varsa öncekini kapat
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
    }
    
    // Bağlantı durumunu güncelle
    set({ connectionStatus: 'connecting' });
    NotificationManager.showConnectionStatusToast('connecting');
    
    try {
      // Güvenli Supabase realtime kanalı oluştur
      const secureChannel = createSecureRealtimeChannel(`user-notifications-${userId}`, userId)
        .on(
          'postgres_changes',
          {
            event: '*', // insert, update, delete olaylarını dinle
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          handleRealtimeNotification
        )
        .on('system', { event: 'reconnect' }, () => {
          console.log('Bağlantı yeniden kurulmaya çalışılıyor...');
          set({ connectionStatus: 'connecting' });
          NotificationManager.showConnectionStatusToast('connecting');
        })
        .on('system', { event: 'connected' }, () => {
          console.log('Realtime bağlantı başarılı');
          set({ connectionStatus: 'connected' });
          NotificationManager.showConnectionStatusToast('connected');
        })
        .on('system', { event: 'disconnected' }, () => {
          console.log('Realtime bağlantı kesildi');
          set({ connectionStatus: 'disconnected' });
          NotificationManager.showConnectionStatusToast('disconnected');
          
          // Bağlantı kesildiyse belli bir süre sonra tekrar bağlan
          setTimeout(() => {
            if (get().connectionStatus === 'disconnected') {
              get().reconnectRealtime(userId);
            }
          }, 5000); // 5 saniye sonra tekrar dene
        })
        .subscribe((status) => {
          console.log(`Realtime bildirimlere abone olundu (userId: ${userId}, status: ${status})`);
          
          if (status === 'SUBSCRIBED') {
            set({
              isSubscribed: true,
              connectionStatus: 'connected'
            });
            NotificationManager.showConnectionStatusToast('connected');
          } else if (status === 'CHANNEL_ERROR') {
            set({
              connectionStatus: 'error',
              error: 'Bildirim kanalına bağlanılamadı'
            });
            NotificationManager.showConnectionStatusToast('error');
          }
        });
      
      set({
        realtimeChannel: secureChannel
      });
    } catch (error) {
      console.error('Realtime bildirimlere abone olurken hata:', error);
      set({
        connectionStatus: 'error',
        error: 'Bildirim kanalına bağlanılamadı'
      });
      NotificationManager.showConnectionStatusToast('error');
    }
  },
  
  // Realtime bildirim aboneliğini kapat
  unsubscribeFromRealtimeNotifications: () => {
    const { realtimeChannel } = get();
    
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      set({
        realtimeChannel: null,
        isSubscribed: false,
        connectionStatus: 'disconnected'
      });
      console.log('Realtime bildirim aboneliği kapatıldı');
    }
  },
  
  // Yeniden bağlanma fonksiyonu
  reconnectRealtime: (userId: string) => {
    const { subscribeToRealtimeNotifications } = get();
    console.log('Realtime bağlantı yeniden kuruluyor...');
    subscribeToRealtimeNotifications(userId);
  },
  
  // Realtime bildirim işleyici
  handleRealtimeNotification: (payload: RealtimePostgresChangesPayload<any>) => {
    const eventType = payload.eventType;
    
    // Bildirim eklendiyse
    if (eventType === 'INSERT') {
      const newNotification = payload.new as NotificationItem;
      
      set((state) => {
        // Yeni bildirimi listenin başına ekle
        const updatedNotifications = [newNotification, ...state.notifications];
        // Okunmamış sayısını arttır
        const newUnreadCount = state.unreadCount + 1;
        
        return {
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
        };
      });
      
      // Yeni bildirim için mobil bildirim göster
      console.log('Yeni bildirim:', newNotification.title);
      
      // Push bildirimini göster
      NotificationManager.showNotificationFromRealtimeEvent({
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        data: newNotification.data
      });
    }
    
    // Bildirim güncellendiyse
    else if (eventType === 'UPDATE') {
      const updatedNotification = payload.new as NotificationItem;
      
      set((state) => {
        const notificationIndex = state.notifications.findIndex(n => n.id === updatedNotification.id);
        
        if (notificationIndex !== -1) {
          const updatedNotifications = [...state.notifications];
          updatedNotifications[notificationIndex] = updatedNotification;
          
          // Okunma durumu değiştiyse unreadCount'u güncelle
          let newUnreadCount = state.unreadCount;
          const wasRead = state.notifications[notificationIndex].isRead;
          const isNowRead = updatedNotification.isRead;
          
          if (!wasRead && isNowRead) {
            newUnreadCount = Math.max(0, state.unreadCount - 1);
          } else if (wasRead && !isNowRead) {
            newUnreadCount = state.unreadCount + 1;
          }
          
          return {
            notifications: updatedNotifications,
            unreadCount: newUnreadCount
          };
        }
        
        return state;
      });
    }
    
    // Bildirim silindiyse
    else if (eventType === 'DELETE') {
      const deletedNotification = payload.old as NotificationItem;
      
      set((state) => {
        const notifications = state.notifications.filter(n => n.id !== deletedNotification.id);
        
        // Silinen bildirim okunmadıysa unreadCount'u güncelle
        let newUnreadCount = state.unreadCount;
        if (!deletedNotification.isRead) {
          newUnreadCount = Math.max(0, state.unreadCount - 1);
        }
        
        return {
          notifications,
          unreadCount: newUnreadCount
        };
      });
    }
  }
}));