import { apiClient } from '../apiClient';

import { SportResponse, SportsListResponse } from '../../types/apiTypes/api.types';

const BASE_PATH = '/sports';

export const sportsService = {
  // Tüm spor dallarını listele
  getAllSports: async (): Promise<SportsListResponse> => {
    const response = await apiClient.get(BASE_PATH);
    return response.data;
  },

  // Spor dalı detayı getir
  getSportDetail: async (sportId: string): Promise<SportResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/${sportId}`);
    return response.data;
  }
};

export default sportsService;