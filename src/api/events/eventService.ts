import { apiClient } from '../apiClient';

import { 
  EventResponse, 
  EventsListResponse, 
  EventCreateRequest, 
  EventUpdateRequest,
  EventRatingRequest
} from '../../types/eventTypes/event.types';

const BASE_PATH = '/events';

export const eventService = {
  // Etkinlikleri listele
  getEvents: async (params?: { 
    page?: number; 
    limit?: number; 
    sportId?: string; 
    status?: string 
  }): Promise<EventsListResponse> => {
    const response = await apiClient.get(BASE_PATH, { params });
    return response.data;
  },

  // Etkinlik detayı getir
  getEventDetail: async (eventId: string): Promise<EventResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/${eventId}`);
    return response.data;
  },

  // Etkinlik oluştur
  createEvent: async (eventData: EventCreateRequest): Promise<EventResponse> => {
    const response = await apiClient.post(BASE_PATH, eventData);
    return response.data;
  },

  // Etkinlik güncelle
  updateEvent: async (eventId: string, eventData: EventUpdateRequest): Promise<EventResponse> => {
    const response = await apiClient.put(`${BASE_PATH}/${eventId}`, eventData);
    return response.data;
  },

  // Etkinlik sil
  deleteEvent: async (eventId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${eventId}`);
  },

  // Etkinliğe katıl
  joinEvent: async (eventId: string): Promise<void> => {
    await apiClient.post(`${BASE_PATH}/${eventId}/join`);
  },

  // Etkinlikten ayrıl
  leaveEvent: async (eventId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${eventId}/leave`);
  },

  // Yakındaki etkinlikleri getir
  getNearbyEvents: async (params: { 
    latitude: number; 
    longitude: number; 
    radius: number 
  }): Promise<EventsListResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/nearby`, { params });
    return response.data;
  },

  // Önerilen etkinlikleri getir
  getRecommendedEvents: async (): Promise<EventsListResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/recommended`);
    return response.data;
  },

  // Etkinlik değerlendir
  rateEvent: async (eventId: string, ratingData: EventRatingRequest): Promise<void> => {
    await apiClient.post(`${BASE_PATH}/${eventId}/rate`, ratingData);
  },

  // Katıldığım etkinlikler
  getMyEvents: async (params?: { page?: number; limit?: number }): Promise<EventsListResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/my-events`, { params });
    return response.data;
  },

  // Oluşturduğum etkinlikler
  getCreatedEvents: async (params?: { page?: number; limit?: number }): Promise<EventsListResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/created-events`, { params });
    return response.data;
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
  }): Promise<EventsListResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/search`, { params });
    return response.data;
  }
};

export default eventService;