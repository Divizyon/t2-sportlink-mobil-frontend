import { apiClient } from '../apiClient';
import { ApiResponse } from '../../types/apiTypes/api.types';
import { 
  Event, 
  EventCreateRequest, 
  EventUpdateRequest, 
  EventRatingRequest,
  Sport 
} from '../../types/eventTypes/event.types';

/**
 * Etkinlik servisi - Etkinliklerle ilgili tüm API işlemleri
 * apiClient, tokenManager'dan token alarak Authorization header'ına otomatik ekler
 */
const eventService = {
  // Etkinlikleri listele
  getEvents: async (params?: { 
    page?: number;
    limit?: number;
    sportId?: string;
    status?: 'active' | 'canceled' | 'completed' | 'draft' | 'all';
  }): Promise<ApiResponse<{events: Event[], total: number, page: number, limit: number}>> => {
    try {
      // apiClient otomatik olarak authorization header'ını ekler (varsa)
      const response = await apiClient.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Etkinlikler alınırken hata:', error);
      throw error;
    }
  },

  // Etkinlik detayını getir
  getEventDetail: async (eventId: string): Promise<ApiResponse<{event: Event}>> => {
    try {
      const response = await apiClient.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Etkinlik detayı alınırken hata:', error);
      throw error;
    }
  },

  // Etkinlik oluştur
  createEvent: async (data: EventCreateRequest): Promise<ApiResponse<{event: Event}>> => {
    try {
      const response = await apiClient.post('/events', data);
      return response.data;
    } catch (error) {
      console.error('Etkinlik oluşturulurken hata:', error);
      throw error;
    }
  },

  // Etkinliği güncelle
  updateEvent: async (eventId: string, data: EventUpdateRequest): Promise<ApiResponse<{event: Event}>> => {
    try {
      const response = await apiClient.put(`/events/${eventId}`, data);
      return response.data;
    } catch (error) {
      console.error('Etkinlik güncellenirken hata:', error);
      throw error;
    }
  },

  // Etkinliği sil
  deleteEvent: async (eventId: string): Promise<ApiResponse<{}>> => {
    try {
      const response = await apiClient.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Etkinlik silinirken hata:', error);
      throw error;
    }
  },

  // Etkinliğe katıl
  joinEvent: async (eventId: string): Promise<ApiResponse<{message: string}>> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/join`);
      return response.data;
    } catch (error) {
      console.error('Etkinliğe katılırken hata:', error);
      throw error;
    }
  },

  // Etkinlikten ayrıl
  leaveEvent: async (eventId: string): Promise<ApiResponse<{message: string}>> => {
    try {
      const response = await apiClient.delete(`/events/${eventId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Etkinlikten ayrılırken hata:', error);
      throw error;
    }
  },

  // Etkinliği değerlendir
  rateEvent: async (eventId: string, data: EventRatingRequest): Promise<ApiResponse<{message: string}>> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/rate`, data);
      return response.data;
    } catch (error) {
      console.error('Etkinlik değerlendirilirken hata:', error);
      throw error;
    }
  },

  // Etkinlik değerlendirmelerini getir
  getEventRatings: async (eventId: string): Promise<ApiResponse<{ratings: any[], averageRating: number}>> => {
    try {
      const response = await apiClient.get(`/events/${eventId}/ratings`);
      return response.data;
    } catch (error) {
      console.error('Etkinlik değerlendirmeleri alınırken hata:', error);
      throw error;
    }
  },

  // Katıldığım etkinlikler
  getMyEvents: async (params?: {page?: number, limit?: number}): Promise<ApiResponse<{events: Event[], total: number, page: number, limit: number}>> => {
    try {
      const response = await apiClient.get('/events/my-events', { params });
      return response.data;
    } catch (error) {
      console.error('Katıldığım etkinlikler alınırken hata:', error);
      throw error;
    }
  },

  // Oluşturduğum etkinlikler
  getCreatedEvents: async (params?: {page?: number, limit?: number}): Promise<ApiResponse<{events: Event[], total: number, page: number, limit: number}>> => {
    try {
      const response = await apiClient.get('/events/created-events', { params });
      return response.data;
    } catch (error) {
      console.error('Oluşturduğum etkinlikler alınırken hata:', error);
      throw error;
    }
  },

  // Yakındaki etkinlikler
  getNearbyEvents: async (params: {latitude: number, longitude: number, radius?: number}): Promise<ApiResponse<{events: Event[]}>> => {
    try {
      const response = await apiClient.get('/events/nearby', { params });
      return response.data;
    } catch (error) {
      console.error('Yakındaki etkinlikler alınırken hata:', error);
      throw error;
    }
  },

  // Etkinlik ara
  searchEvents: async (params: {
    keyword?: string;
    sportId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{events: Event[], total: number, page: number, limit: number}>> => {
    try {
      const response = await apiClient.get('/events/search', { params });
      return response.data;
    } catch (error) {
      console.error('Etkinlik aranırken hata:', error);
      throw error;
    }
  },

  // Spor dallarını getir
  getSports: async (): Promise<ApiResponse<Sport[]>> => {
    try {
      const response = await apiClient.get('/sports');
      return response.data;
    } catch (error) {
      console.error('Spor dalları alınırken hata:', error);
      throw error;
    }
  },

  // Önerilen etkinlikler
  getRecommendedEvents: async (): Promise<ApiResponse<{events: Event[]}>> => {
    try {
      const response = await apiClient.get('/events/recommended');
      return response.data;
    } catch (error) {
      console.error('Önerilen etkinlikler alınırken hata:', error);
      throw error;
    }
  }
};

export { eventService };