import { apiClient } from '../apiClient';
import { ApiResponse, safeApiCall } from '../apiHelpers';

export interface DeviceResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    platform: string;
    created_at: string;
    updated_at: string;
  };
}

export interface DevicesListResponse {
  success: boolean;
  data?: {
    user: {
      created_at: string;
      updated_at: string;
      username: string;
      first_name: string;
      last_name: string;
    };
    deviceCount: number;
    devices: Array<{
      id: string;
      platform: string;
      created_at: string;
      updated_at: string;
    }>;
  };
}

/**
 * Cihaz yönetimi ile ilgili API isteklerini yöneten servis
 */
export const deviceService = {
  /**
   * Expo Push Notification Token'ı API'ye kaydet
   */
  async registerToken(token: string, platform: 'ios' | 'android' | 'expo'): Promise<ApiResponse<{ success: boolean }>> {
    return safeApiCall<{ success: boolean }>(
      apiClient.post('/devices/register', { token, platform }),
      'Token kaydedilirken bir hata oluştu'
    );
  },

  /**
   * Token'ı sil/kaldır
   */
  async unregisterToken(token: string): Promise<ApiResponse<{ success: boolean }>> {
    return safeApiCall<{ success: boolean }>(
      apiClient.post('/devices/unregister', { token }),
      'Token silinirken bir hata oluştu'
    );
  },

  /**
   * Kullanıcının tüm cihazlarını listeler
   */
  async getMyDevices(): Promise<ApiResponse<DevicesListResponse>> {
    return safeApiCall<DevicesListResponse>(
      apiClient.get('/devices/my-devices'),
      'Cihaz listesi alınırken bir hata oluştu'
    );
  }
}; 