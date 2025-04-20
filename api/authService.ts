import axios from 'axios';
import { API_URL } from './config';
import { User } from '../types/store';
import { RegisterFormData } from '../utils/validations/registerSchema';

// API yanıt tipi tanımlamaları
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: any[];
}

/**
 * Auth API servisi
 * Backend authentication endpoint'lerine istek gönderen servis
 */
const authService = {
  /**
   * Kullanıcı girişi
   * @param email - Kullanıcı e-posta
   * @param password - Kullanıcı şifre
   * @returns Promise<AuthResponse> - Auth yanıt objesi
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
        email,
        password,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // API'den gelen hata yanıtını döndür
        return error.response.data as AuthResponse;
      }

      // Network hatası veya beklenmeyen hata
      throw new Error('Sunucuya bağlanırken bir hata oluştu');
    }
  },

  /**
   * Kullanıcı kaydı
   * @param userData - Kayıt formu verileri
   * @returns Promise<AuthResponse> - Auth yanıt objesi
   */
  register: async (userData: RegisterFormData): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, userData);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // API'den gelen hata yanıtını döndür
        return error.response.data as AuthResponse;
      }

      // Network hatası veya beklenmeyen hata
      throw new Error('Sunucuya bağlanırken bir hata oluştu');
    }
  },
};

export default authService;
