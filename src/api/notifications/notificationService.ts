import { apiClient } from '../apiClient';
import { ApiResponse, safeApiCall } from '../apiHelpers';

// Bildirim yanıt tipleri
export interface NotificationItem {
  id: string;
  type: 'event' | 'friend' | 'system' | 'message';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  image?: string;
  data?: any;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalItems: number;
  };
}

/**
 * Bildirimlerle ilgili API isteklerini yöneten servis
 */
export const notificationService = {
  /**
   * Bildirimleri listeler
   * @param page Sayfa numarası
   * @param limit Sayfa başına bildirim sayısı
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<ApiResponse<NotificationsResponse>> {
    return safeApiCall<NotificationsResponse>(
      apiClient.get(`/notifications?page=${page}&limit=${limit}`),
      'Bildirimler yüklenirken bir hata oluştu'
    );
  },

  /**
   * Okunmamış bildirim sayısını getirir
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return safeApiCall<{ count: number }>(
      apiClient.get('/notifications/unread/count'),
      'Okunmamış bildirim sayısı alınırken bir hata oluştu'
    );
  },

  /**
   * Bildirimi okundu olarak işaretler
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return safeApiCall<{ success: boolean }>(
      apiClient.patch(`/notifications/${notificationId}/read`),
      'Bildirim okundu işaretlenirken bir hata oluştu'
    );
  },

  /**
   * Tüm bildirimleri okundu olarak işaretler
   */
  async markAllAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    return safeApiCall<{ success: boolean }>(
      apiClient.patch('/notifications/read-all'),
      'Bildirimler okundu işaretlenirken bir hata oluştu'
    );
  },

  /**
   * Belirli bir bildirimi siler
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return safeApiCall<{ success: boolean }>(
      apiClient.delete(`/notifications/${notificationId}`),
      'Bildirim silinirken bir hata oluştu'
    );
  },

  /**
   * Tüm bildirimleri siler
   */
  async deleteAllNotifications(): Promise<ApiResponse<{ success: boolean }>> {
    return safeApiCall<{ success: boolean }>(
      apiClient.delete('/notifications'),
      'Bildirimler silinirken bir hata oluştu'
    );
  },

  /**
   * Bildirim tercihlerini günceller
   */
  async updateNotificationPreferences(preferences: { 
    events: boolean, 
    messages: boolean, 
    friends: boolean, 
    system: boolean 
  }): Promise<ApiResponse<{ success: boolean }>> {
    return safeApiCall<{ success: boolean }>(
      apiClient.post('/user/notification-preferences', preferences),
      'Bildirim tercihleri güncellenirken bir hata oluştu'
    );
  }
}; 