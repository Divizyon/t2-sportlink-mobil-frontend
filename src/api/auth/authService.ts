import { apiClient } from '../apiClient';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../types/userTypes/auth.types';
import { ApiResponse, safeApiCall } from '../apiHelpers';
import { tokenManager } from '../../utils/tokenManager';

/**
 * Kimlik doğrulama ile ilgili API isteklerini yöneten servis
 */
export const authService = {
  /**
   * Kullanıcı kaydı yapar
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return safeApiCall<AuthResponse>(
      apiClient.post('/auth/register', data),
      'Kayıt sırasında bir hata oluştu'
    );
  },

  /**
   * Kullanıcı girişi yapar
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return safeApiCall<AuthResponse>(
      apiClient.post('/auth/login', data),
      'Giriş sırasında bir hata oluştu'
    );
  },

  /**
   * E-posta doğrulama işlemi
   */
  async verifyEmail(token: string): Promise<ApiResponse<AuthResponse>> {
    return safeApiCall<AuthResponse>(
      apiClient.get(`/auth/verify-email?token=${token}`),
      'E-posta doğrulama sırasında bir hata oluştu'
    );
  },

  /**
   * Token ile otomatik doğrulama
   */
  async validateToken(): Promise<ApiResponse<AuthResponse>> {
    return safeApiCall<AuthResponse>(
      apiClient.get('/auth/me'),
      'Token doğrulama sırasında bir hata oluştu'
    );
  },

  /**
   * Kullanıcı çıkışı yapar
   */
  async logout(): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await safeApiCall<AuthResponse>(
        apiClient.post('/auth/logout'),
        'Çıkış sırasında bir hata oluştu'
      );
      
      // Her durumda token'ı sil
      await tokenManager.removeToken();
      
      return response;
    } catch (error) {
      // Hata olsa bile token'ı sil
      await tokenManager.removeToken();
      
      throw error;
    }
  },

  /**
   * Şifre sıfırlama e-postası gönderir
   */
  async forgotPassword(email: string): Promise<ApiResponse<AuthResponse>> {
    return safeApiCall<AuthResponse>(
      apiClient.post('/auth/forgot-password', { email }),
      'Şifre sıfırlama işlemi sırasında bir hata oluştu'
    );
  },

  /**
   * Şifre sıfırlama işlemini tamamlar
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<AuthResponse>> {
    return safeApiCall<AuthResponse>(
      apiClient.post('/auth/reset-password', {
        token,
        password: newPassword
      }),
      'Şifre değiştirme işlemi sırasında bir hata oluştu'
    );
  },
  
  /**
   * Refresh token ile yeni access token alır
   * @param refreshToken Yenileme için kullanılacak refresh token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return safeApiCall<AuthResponse>(
      apiClient.post('/auth/refresh-token', {
        refresh_token: refreshToken
      }),
      'Token yenilenirken bir hata oluştu'
    );
  }
}; 