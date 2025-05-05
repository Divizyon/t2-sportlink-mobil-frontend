import { apiClient } from '../apiClient';
import { ApiResponse } from '../../types/apiTypes/api.types';

// Mesaj tipi
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
}

// Konuşma katılımcısı tipi
export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
  is_admin: boolean;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
}

// Konuşma tipi
export interface Conversation {
  id: string;
  name?: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  participants: ConversationParticipant[];
  messages: Message[]; // Son mesaj burada bulunur
  unread_count?: number; // Okunmamış mesaj sayısı (frontend tarafında hesaplanır)
}

// Sayfalama yanıtı
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Okunmamış mesaj sayısı yanıt tipi
export interface UnreadMessagesCountResponse {
  count: number;
}

export const messageApi = {
  /**
   * Kullanıcıya ait konuşmaları getirir
   */
  async getConversations(limit: number = 10, offset: number = 0): Promise<ApiResponse<Conversation[]>> {
    try {
      const response = await apiClient.get('/messages/conversations', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Konuşmalar getirilirken hata:', error);
      throw error;
    }
  },

  /**
   * Konuşmaya ait mesajları getirir
   */
  async getConversationMessages(conversationId: string, limit: number = 20, offset: number = 0): Promise<ApiResponse<Message[]>> {
    try {
      const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Mesajlar getirilirken hata:', error);
      throw error;
    }
  },

  /**
   * Yeni bir konuşma oluşturur
   */
  async createConversation(userIds: string[], name?: string, isGroup: boolean = false): Promise<ApiResponse<Conversation>> {
    try {
      const response = await apiClient.post('/messages/conversations', {
        userIds,
        name,
        isGroup
      });
      return response.data;
    } catch (error) {
      console.error('Konuşma oluşturulurken hata:', error);
      throw error;
    }
  },

  /**
   * Mesaj gönderir
   */
  async sendMessage(conversationId: string, content: string, mediaUrl?: string): Promise<ApiResponse<Message>> {
    try {
      const response = await apiClient.post('/messages/messages', {
        conversationId,
        content,
        mediaUrl
      });
      return response.data;
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      throw error;
    }
  },

  /**
   * Medya içeren mesaj gönderir
   */
  async sendMediaMessage(conversationId: string, content: string, mediaFile: File): Promise<ApiResponse<Message>> {
    try {
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('content', content);
      formData.append('media', mediaFile);

      const response = await apiClient.post('/messages/messages/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Medya mesajı gönderilirken hata:', error);
      throw error;
    }
  },

  /**
   * Mesajları okundu olarak işaretler
   */
  async markMessagesAsRead(messageIds: string[]): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const response = await apiClient.post('/messages/messages/read', {
        messageIds
      });
      return response.data;
    } catch (error) {
      console.error('Mesajlar okundu olarak işaretlenirken hata:', error);
      throw error;
    }
  },

  /**
   * Konuşmadan ayrılır
   */
  async leaveConversation(conversationId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const response = await apiClient.delete(`/messages/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Konuşmadan ayrılırken hata:', error);
      throw error;
    }
  },

  /**
   * Okunmamış mesaj sayısını getirir
   */
  async getUnreadMessagesCount(): Promise<ApiResponse<UnreadMessagesCountResponse>> {
    try {
      const response = await apiClient.get('/messages/unread-count');
      return response.data;
    } catch (error) {
      console.error('Okunmamış mesaj sayısını getirme hatası:', error);
      throw error;
    }
  }
}; 