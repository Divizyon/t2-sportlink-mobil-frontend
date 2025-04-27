import { apiClient } from '../apiClient';

import { NewsResponse, NewsListResponse } from '../../types/apiTypes/api.types';

const BASE_PATH = '/news';

export const newsService = {
  // Tüm haberleri listele
  getNews: async (params?: { 
    page?: number; 
    limit?: number
  }): Promise<NewsListResponse> => {
    const response = await apiClient.get(BASE_PATH, { params });
    return response.data;
  },

  // Haber detayı getir
  getNewsDetail: async (newsId: string): Promise<NewsResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/${newsId}`);
    return response.data;
  },

  // Spora göre haberleri getir
  getNewsBySport: async (sportId: string, params?: { 
    page?: number; 
    limit?: number 
  }): Promise<NewsListResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/sport/${sportId}`, { params });
    return response.data;
  }
};

export default newsService;