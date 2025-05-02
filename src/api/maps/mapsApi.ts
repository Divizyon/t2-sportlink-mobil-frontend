import { apiClient } from '../apiClient';
import { AxiosResponse } from 'axios';

export interface DistanceResult {
  origin: string;
  destination: string;
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  status: string;
}

export interface BulkDistanceResults {
  results: DistanceResult[];
  status: string;
}

export const mapsApi = {
  /**
   * İki konum arasındaki mesafeyi hesaplar
   * @param origin Başlangıç noktası (adres veya "lat,lng" formatında)
   * @param destination Hedef nokta (adres veya "lat,lng" formatında)
   * @param mode Ulaşım modu (driving, walking, bicycling, transit)
   * @returns Mesafe ve süre bilgisi
   */
  getDistance: (origin: string, destination: string, mode: string = 'driving'): Promise<AxiosResponse<DistanceResult>> => {
    return apiClient.get('/maps/distance', {
      params: { origin, destination, mode }
    });
  },

  /**
   * Bir noktadan birden fazla hedefe olan mesafeleri hesaplar
   * @param origin Başlangıç noktası (adres veya "lat,lng" formatında)
   * @param destinations Hedef noktalar dizisi (adres veya "lat,lng" formatında)
   * @param mode Ulaşım modu (driving, walking, bicycling, transit)
   * @returns Mesafe ve süre bilgileri
   */
  getBulkDistances: (origin: string, destinations: string[], mode: string = 'driving'): Promise<AxiosResponse<BulkDistanceResults>> => {
    return apiClient.post('/maps/bulk-distances', {
      origin,
      destinations,
      mode
    });
  }
}; 