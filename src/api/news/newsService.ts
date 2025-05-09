import { apiClient } from '../apiClient';

import { NewsResponse, NewsListResponse } from '../../types/apiTypes/api.types';

const BASE_PATH = '/news';

export const newsService = {
  // Tüm haberleri listele
  getNews: async (params?: { 
    page?: number; 
    limit?: number
  }): Promise<NewsListResponse> => {
    try {
      const response = await apiClient.get(BASE_PATH, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Haber detayı getir
  getNewsDetail: async (newsId: string): Promise<NewsResponse> => {
    try {
      const response = await apiClient.get(`${BASE_PATH}/${newsId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Spora göre haberleri getir
  getNewsBySport: async (sportId: string, params?: { 
    page?: number; 
    limit?: number 
  }): Promise<NewsListResponse> => {
    try {
      const response = await apiClient.get(`${BASE_PATH}/sport/${sportId}`, { params });
      console.log('API Yanıt (getNewsBySport):', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('API Hatası (getNewsBySport):', error);
      throw error;
    }
  }
};

export default newsService;