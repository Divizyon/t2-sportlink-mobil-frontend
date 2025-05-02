import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { persist, createJSONStorage } from 'zustand/middleware';
import { deviceService, DevicesListResponse } from '../../api/devices';

interface Device {
  id: string;
  platform: string;
  created_at: string;
  updated_at: string;
}

interface DeviceState {
  isLoading: boolean;
  error: string | null;
  deviceToken: string | null;
  allDevices: Device[];
  deviceCount: number;
  
  // Metotlar
  generateDeviceToken: () => Promise<string>;
  registerDeviceToken: (platform?: string) => Promise<boolean>;
  unregisterDeviceToken: () => Promise<boolean>;
  fetchMyDevices: () => Promise<boolean>;
  clearError: () => void;
}

// Device token'ı için AsyncStorage anahtarı
const DEVICE_TOKEN_KEY = '@device_token';

// UUID oluşturma fonksiyonu
const generateUUID = () => {
  // UUID v4 formatı için rastgele değerler oluştur
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, 
          v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Cihaz store'u
export const useDeviceStore = create<DeviceState>((set, get) => ({
  isLoading: false,
  error: null,
  deviceToken: null,
  allDevices: [],
  deviceCount: 0,
  
  // Cihaz için benzersiz bir token oluştur
  generateDeviceToken: async () => {
    try {
      // Önce varolan token'ı kontrol et
      const existingToken = await AsyncStorage.getItem(DEVICE_TOKEN_KEY);
      if (existingToken) {
        set({ deviceToken: existingToken });
        return existingToken;
      }
      
      // UUID v4 benzeri bir token oluştur
      const uuid = generateUUID();
      
      // Token'ı kaydet
      await AsyncStorage.setItem(DEVICE_TOKEN_KEY, uuid);
      set({ deviceToken: uuid });
      
      return uuid;
    } catch (error) {
      console.error('Cihaz token oluşturma hatası:', error);
      
      // Hata durumunda rastgele bir token oluştur
      const fallbackToken = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      await AsyncStorage.setItem(DEVICE_TOKEN_KEY, fallbackToken);
      set({ deviceToken: fallbackToken });
      
      return fallbackToken;
    }
  },
  
  // Device token'ı sunucuya kaydet
  registerDeviceToken: async (platform = Platform.OS) => {
    set({ isLoading: true, error: null });
    
    try {
      // Önce token'ı getir veya oluştur
      const token = await get().generateDeviceToken();
      
      // Token'ı API ile kaydet
      const response = await deviceService.registerToken(token, platform);
      
      if (response.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.error || 'Cihaz kaydı başarısız oldu', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Cihaz kaydı sırasında bir hata oluştu';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  // Device token'ı sunucudan sil
  unregisterDeviceToken: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const token = get().deviceToken;
      
      if (!token) {
        set({ 
          error: 'Silinecek cihaz token\'ı bulunamadı',
          isLoading: false 
        });
        return false;
      }
      
      const response = await deviceService.unregisterToken(token);
      
      if (response.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.error || 'Cihaz kaydı silme başarısız oldu',
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Cihaz kaydı silme sırasında bir hata oluştu';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  // Kullanıcının tüm cihazlarını getir
  fetchMyDevices: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await deviceService.getMyDevices();
      
      if (response.success && response.data) {
        set({ 
          allDevices: response.data.data?.devices || [],
          deviceCount: response.data.data?.deviceCount || 0,
          isLoading: false 
        });
        return true;
      } else {
        set({ 
          error: response.error || 'Cihaz listesi alınamadı',
          isLoading: false,
          allDevices: [],
          deviceCount: 0
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Cihaz listesi alınırken bir hata oluştu';
      set({ 
        error: errorMessage, 
        isLoading: false,
        allDevices: [],
        deviceCount: 0
      });
      return false;
    }
  },
  
  // Hata temizleme
  clearError: () => set({ error: null })
})); 