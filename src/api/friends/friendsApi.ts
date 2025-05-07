import { apiClient } from '../apiClient';
import { ApiResponse } from '../../types/apiTypes/api.types';

// Arkadaşlık isteği tipi
export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_picture?: string;
  };
  receiver: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_picture?: string;
  };
  created_at: string;
  updated_at: string;
}

// Arkadaş önerisi tipi
export interface SuggestedFriend {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture?: string;
  email?: string;
  user_sports?: {
    id: string;
    name: string;
    icon: string;
    skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  }[];
  age?: number;
  common_friends?: number;
  common_sports?: number;
  common_events?: number;
}

// Arkadaşlık durumu tipi
export interface FriendshipStatus {
  status: 'none' | 'friend' | 'sent' | 'received';
  request?: FriendRequest;
}

// Arkadaş tipi
export interface Friend {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture?: string;
  user_sports?: {
    id: string;
    name: string;
    icon: string;
    skill_level?: string;
  }[];
  age?: number;
  friendship_date?: string;
}

// Pagination yanıt tipi
interface PaginatedResponse<T> {
  data?: T[];
  friends?: T[];
  requests?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Arkadaşlık sistemi API servisi
 */
export const friendsApi = {
  /**
   * Arkadaşlık isteği gönderir
   * @param userId Hedef kullanıcı kimliği 
   */
  sendFriendRequest: async (userId: string): Promise<ApiResponse<{ request: FriendRequest }>> => {
    try {
      const response = await apiClient.post(`/friends/request/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Arkadaşlık isteği gönderme hatası:', error);
      throw error;
    }
  },

  /**
   * Arkadaşlık isteğini kabul eder
   * @param requestId İstek kimliği
   */
  acceptFriendRequest: async (requestId: string): Promise<ApiResponse<{ friendship: any }>> => {
    try {
      const response = await apiClient.put(`/friends/accept/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Arkadaşlık isteği kabul hatası:', error);
      throw error;
    }
  },

  /**
   * Arkadaşlık isteğini reddeder
   * @param requestId İstek kimliği
   */
  rejectFriendRequest: async (requestId: string): Promise<ApiResponse<{ request: FriendRequest }>> => {
    try {
      const response = await apiClient.put(`/friends/reject/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Arkadaşlık isteği reddetme hatası:', error);
      throw error;
    }
  },

  /**
   * Arkadaşlık ilişkisini sonlandırır
   * @param userId Arkadaş kimliği
   */
  removeFriend: async (userId: string): Promise<ApiResponse<{}>> => {
    try {
      const response = await apiClient.delete(`/friends/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Arkadaş silme hatası:', error);
      throw error;
    }
  },

  /**
   * Gelen arkadaşlık isteklerini listeler
   * @param status İstek durumu (varsayılan: pending)
   * @param page Sayfa numarası
   * @param limit Sayfa başına öğe sayısı
   */
  getFriendRequests: async (
    status: 'pending' | 'accepted' | 'rejected' = 'pending',
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<FriendRequest>>> => {
    try {
      const response = await apiClient.get('/friends/requests', {
        params: { status, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Arkadaşlık istekleri getirme hatası:', error);
      throw error;
    }
  },

  /**
   * Kullanıcının arkadaşlarını listeler
   * @param page Sayfa numarası
   * @param limit Sayfa başına öğe sayısı
   */
  getFriends: async (
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Friend>>> => {
    try {
      const response = await apiClient.get('/friends', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Arkadaşlar getirme hatası:', error);
      throw error;
    }
  },

  /**
   * İki kullanıcının arkadaşlık durumunu kontrol eder
   * @param userId Hedef kullanıcı kimliği
   */
  checkFriendshipStatus: async (userId: string): Promise<ApiResponse<FriendshipStatus>> => {
    try {
      const response = await apiClient.get(`/friends/status/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Arkadaşlık durumu kontrol hatası:', error);
      throw error;
    }
  },

  /**
   * Kullanıcı için arkadaş önerileri getirir
   * @param limit Öneri sayısı (varsayılan: 5, maksimum: 20)
   */
  getSuggestedFriends: async (limit = 5): Promise<ApiResponse<{ suggestedFriends: SuggestedFriend[] }>> => {
    try {
      const response = await apiClient.get('/friends/suggestions', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Arkadaş önerileri getirme hatası:', error);
      throw error;
    }
  },

  /**
   * Arkadaşlık isteğini iptal eder
   * @param userId Hedef kullanıcı kimliği
   */
  cancelFriendRequest: async (userId: string): Promise<ApiResponse<{}>> => {
    try {
      const response = await apiClient.delete(`/friends/request/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Arkadaşlık isteği iptal hatası:', error);
      throw error;
    }
  }
}; 