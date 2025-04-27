import { apiClient } from '../apiClient';

import { AnnouncementResponse, AnnouncementsListResponse } from '../../types/apiTypes/api.types';

const BASE_PATH = '/announcements';

export const announcementService = {
  // Tüm duyuruları listele
  getAnnouncements: async (params?: { 
    page?: number; 
    limit?: number;
    includeUnpublished?: boolean;
  }): Promise<AnnouncementsListResponse> => {
    const response = await apiClient.get(BASE_PATH, { params });
    return response.data;
  },

  // Duyuru detayını getir
  getAnnouncementDetail: async (announcementId: string): Promise<AnnouncementResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/${announcementId}`);
    return response.data;
  }
};

export default announcementService;