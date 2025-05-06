import { apiClient } from '../apiClient';
import { ApiResponse, safeApiCall } from '../apiHelpers';
import { 
  Notification, 
  NotificationResponse, 
  NotificationCountResponse, 
  NotificationSettings 
} from '../../types/apiTypes/notification.types';

/**
 * Bildirim yönetimi için API servisi
 */
export const notificationService = {
  /**
   * Bildirimleri getir
   */
  async getNotifications(page = 1, limit = 20): Promise<ApiResponse<NotificationResponse>> {
    return safeApiCall<NotificationResponse>(
      apiClient.get(`/notifications?page=${page}&limit=${limit}`),
      'Bildirimler alınırken bir hata oluştu'
    );
  },

  /**
   * Okunmamış bildirim sayısını getir
   */
  async getUnreadCount(): Promise<ApiResponse<NotificationCountResponse>> {
    return safeApiCall<NotificationCountResponse>(
      apiClient.get('/notifications/unread/count'),
      'Okunmamış bildirim sayısı alınırken bir hata oluştu'
    );
  },

  /**
   * Bildirimi okundu olarak işaretle
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    return safeApiCall<Notification>(
      apiClient.put(`/notifications/${notificationId}/read`),
      'Bildirim okundu olarak işaretlenirken bir hata oluştu'
    );
  },

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  async markAllAsRead(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return safeApiCall<{ success: boolean; message: string }>(
      apiClient.put('/notifications/read-all'),
      'Tüm bildirimler okundu olarak işaretlenirken bir hata oluştu'
    );
  },

  /**
   * Bildirim ayarlarını getir
   */
  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    return safeApiCall<NotificationSettings>(
      apiClient.get('/notifications/settings'),
      'Bildirim ayarları alınırken bir hata oluştu'
    );
  },

  /**
   * Bildirim ayarlarını güncelle
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    return safeApiCall<NotificationSettings>(
      apiClient.put('/notifications/settings', settings),
      'Bildirim ayarları güncellenirken bir hata oluştu'
    );
  },

  /**
   * Test bildirimi gönder (sadece geliştirme aşamasında kullanılır)
   */
  async sendTestNotification(
    payload: {
      title: string;
      body: string;
      type: string;
      data?: Record<string, any>;
    }
  ): Promise<ApiResponse<{ success: boolean; message: string; notificationId: string }>> {
    return safeApiCall(
      apiClient.post('/notifications/test', payload),
      'Test bildirimi gönderilirken bir hata oluştu'
    );
  }
}; 