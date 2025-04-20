import apiClient from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipleri tanımlayalım
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      profile_picture?: string;
    };
    token: string;
  };
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone: string;
}

/**
 * Kullanıcı girişi yapar
 * @param loginData Giriş verileri
 * @returns API yanıtı
 */
export const login = async (loginData: LoginData): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', loginData);
    
    // Token'ı yerel depolamaya kaydet
    if (response.data.success && response.data.data?.token) {
      await AsyncStorage.setItem('token', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Sunucu yanıtı varsa onu döndür
    if (error.response) {
      return error.response.data as LoginResponse;
    }
    
    // Diğer hatalar için genel hata mesajı
    return {
      success: false,
      message: 'Bağlantı hatası, lütfen internet bağlantınızı kontrol edin',
      error: error.message
    };
  }
};

/**
 * Yeni kullanıcı kaydeder
 * @param registerData Kayıt verileri
 * @returns API yanıtı
 */
export const register = async (registerData: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/auth/register', registerData);
    return response.data;
  } catch (error: any) {
    console.error('Register error:', error);
    
    // Sunucu yanıtı varsa onu döndür
    if (error.response) {
      return error.response.data as RegisterResponse;
    }
    
    // Diğer hatalar için genel hata mesajı
    return {
      success: false,
      message: 'Bağlantı hatası, lütfen internet bağlantınızı kontrol edin',
      error: error.message
    };
  }
};

/**
 * Kullanıcı çıkışı yapar
 */
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/**
 * Token'ı yerel depolamadan alır
 * @returns Token değeri veya null
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Get token error:', error);
    return null;
  }
};

/**
 * Kullanıcı bilgilerini yerel depolamadan alır
 * @returns Kullanıcı bilgileri veya null
 */
export const getUser = async () => {
  try {
    const userString = await AsyncStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}; 