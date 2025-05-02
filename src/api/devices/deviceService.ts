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
   * Cihaz token'ını kaydeder
   */
  async registerToken(token: string, platform: string): Promise<ApiResponse<DeviceResponse>> {
    return safeApiCall<DeviceResponse>(
      apiClient.post('/devices/register', { token, platform }),
      'Cihaz kaydı sırasında bir hata oluştu'
    );
  },

  /**
   * Cihaz token'ını siler
   */
  async unregisterToken(token: string): Promise<ApiResponse<DeviceResponse>> {
    return safeApiCall<DeviceResponse>(
      apiClient.post('/devices/unregister', { token }),
      'Cihaz kaydı silme sırasında bir hata oluştu'
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