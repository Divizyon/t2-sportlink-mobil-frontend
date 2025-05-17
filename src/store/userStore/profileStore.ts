import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sport, Event } from '../../types/eventTypes/event.types';
import { useApiStore } from '../appStore/apiStore';
import { userProfileService } from '../../api/user/userProfileService';

// Profil için tip tanımları
export interface UserStats {
  createdEventsCount: number;
  participatedEventsCount: number;
  averageRating: number;
  friendsCount: number;
}

export interface UserSportPreference {
  sportId: string;
  sportName: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  icon?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  locationName: string;
}

export interface FriendSummary {
  totalFriends: number;
  pendingRequests: number;
  mostActiveWith?: string;
}

export interface Friend {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

export interface ProfileSettings {
  notificationsEnabled: boolean;
  eventNotificationsEnabled: boolean;
  messageNotificationsEnabled: boolean;
  friendRequestNotificationsEnabled: boolean;
  darkMode: boolean;
  preferredRadius: number; // Etkinlik arama yarıçapı (km)
  privacySettings: {
    showLocation: boolean;
    showActivity: boolean;
    showFriends: boolean;
  };
}

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  profilePicture?: string | null;
  role: string;
  createdAt: string;
}

interface ProfileState {
  // Ana veriler
  userInfo: UserInfo | null;
  stats: UserStats | null;
  sportPreferences: UserSportPreference[];
  defaultLocation: UserLocation | null;
  friendsSummary: FriendSummary | null;
  profileSettings: ProfileSettings;
  friends: Friend[]; // Arkadaş listesi
  upcomingEvents: Event[]; // Yaklaşan etkinlikler
  pastEvents: Event[]; // Geçmiş etkinlikler
  
  // Yükleme ve hata durumları
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  successMessage: string | null;

  // İşlemler
  fetchUserProfile: () => Promise<void>;
  updateUserInfo: (info: Partial<ProfileState['userInfo']>) => Promise<boolean>;
  updateProfilePicture: (imageUri: string) => Promise<boolean>;
  updateSportPreference: (preference: UserSportPreference) => Promise<boolean>;
  removeSportPreference: (sportId: string) => Promise<boolean>;
  updateDefaultLocation: (location: UserLocation) => Promise<boolean>;
  updateProfileSettings: (settings: Partial<ProfileSettings>) => Promise<boolean>;
  updateUserLocation: (location: UserLocation) => Promise<boolean>;
  
  // Yardımcı metotlar
  clearErrors: () => void;
  clearMessages: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Başlangıç durumu
  userInfo: null,
  stats: null,
  sportPreferences: [],
  defaultLocation: null,
  friendsSummary: null,
  friends: [], // Boş arkadaş listesi
  upcomingEvents: [], // Boş yaklaşan etkinlikler listesi
  pastEvents: [], // Boş geçmiş etkinlikler listesi
  profileSettings: {
    notificationsEnabled: true,
    eventNotificationsEnabled: true,
    messageNotificationsEnabled: true,
    friendRequestNotificationsEnabled: true,
    darkMode: false,
    preferredRadius: 5,
    privacySettings: {
      showLocation: true,
      showActivity: true,
      showFriends: true,
    }
  },
  
  isLoading: false,
  isUpdating: false,
  error: null,
  successMessage: null,

  // Kullanıcı profil bilgilerini getir
  fetchUserProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // API isteği kimliği oluştur
      const apiRequestId = useApiStore.getState().addRequest({
        url: '/users/profile',
        method: 'GET'
      });
      
      // API servisini çağır
      const response = await userProfileService.getProfile();
      
      // API isteği tamamlandı
      useApiStore.getState().completeRequest(apiRequestId, 200);
      
      if (response.success && response.data) {
        // Profil ayarlarını AsyncStorage'dan al (varsa)
        const storedSettings = await AsyncStorage.getItem('@profile_settings');
        let profileSettings = get().profileSettings;
        
        if (storedSettings) {
          profileSettings = { ...profileSettings, ...JSON.parse(storedSettings) };
        }
        
        // State'i güncelle
        set({
          userInfo: response.data.userInfo,
          stats: response.data.stats,
          sportPreferences: response.data.sportPreferences,
          defaultLocation: response.data.defaultLocation,
          friendsSummary: response.data.friendsSummary,
          friends: response.data.friends || [], // Arkadaş listesini kaydet
          upcomingEvents: response.data.upcomingEvents || [], // Yaklaşan etkinlikleri kaydet
          pastEvents: response.data.pastEvents || [], // Geçmiş etkinlikleri kaydet
          profileSettings,
          isLoading: false
        });
      } else {
        throw new Error(response.error || 'Profil bilgileri alınamadı');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profil bilgileri alınamadı';
      
      // API isteği başarısız
      useApiStore.getState().setGlobalError(errorMessage);
      
      set({
        error: errorMessage,
        isLoading: false
      });
    }
  },

  // Kullanıcı bilgilerini güncelle
  updateUserInfo: async (info) => {
    try {
      set({ isUpdating: true, error: null, successMessage: null });
      
      // API isteği kimliği oluştur
      const apiRequestId = useApiStore.getState().addRequest({
        url: '/users/profile',
        method: 'PUT'
      });
      
      // API servisini çağır
      const response = await userProfileService.updateProfile({
        firstName: info?.firstName,
        lastName: info?.lastName,
        phone: info?.phone
      });
      
      // API isteği tamamlandı
      useApiStore.getState().completeRequest(apiRequestId, 200);
      
      if (response.success && response.data) {
        // State'i güncelle
        set({
          userInfo: { ...get().userInfo, ...response.data.userInfo } as ProfileState['userInfo'],
          isUpdating: false,
          successMessage: response.message || 'Profil bilgileri başarıyla güncellendi.'
        });
        
        return true;
      } else {
        throw new Error(response.error || 'Profil güncellenemedi');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profil güncellenemedi';
      
      // API isteği başarısız
      useApiStore.getState().setGlobalError(errorMessage);
      
      set({
        error: errorMessage,
        isUpdating: false
      });
      
      return false;
    }
  },

  // Profil resmini güncelle
  updateProfilePicture: async (imageUri) => {
    try {
      set({ isUpdating: true, error: null, successMessage: null });
      
      // FormData oluştur
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg'
      } as any);
      
      // API isteği kimliği oluştur
      const apiRequestId = useApiStore.getState().addRequest({
        url: '/users/profile/avatar',
        method: 'PUT'
      });
      
      // API servisini çağır
      const response = await userProfileService.updateProfilePicture(formData);
      
      // API isteği tamamlandı
      useApiStore.getState().completeRequest(apiRequestId, 200);
      
      if (response.success && response.data) {
        // State'i güncelle
        set({
          userInfo: { ...get().userInfo, profilePicture: response.data.profilePicture } as ProfileState['userInfo'],
          isUpdating: false,
          successMessage: response.message || 'Profil fotoğrafı başarıyla güncellendi.'
        });
        
        return true;
      } else {
        throw new Error(response.error || 'Profil fotoğrafı güncellenemedi');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profil fotoğrafı güncellenemedi';
      
      // API isteği başarısız
      useApiStore.getState().setGlobalError(errorMessage);
      
      set({
        error: errorMessage,
        isUpdating: false
      });
      
      return false;
    }
  },

  // Spor tercihlerini güncelle - tek spor ekleme/güncelleme
  updateSportPreference: async (preference) => {
    try {
      set({ isUpdating: true, error: null, successMessage: null });
      
      
      // API isteği kimliği oluştur
      const apiRequestId = useApiStore.getState().addRequest({
        url: '/users/profile/sport',
        method: 'PUT'
      });
      
      // API servisini çağır
      const response = await userProfileService.updateSportPreferences(preference);
      
      // API isteği tamamlandı
      useApiStore.getState().completeRequest(apiRequestId, 200);
      
      if (response.success && response.data) {
        
        // Eksik alan kontrolü yap
        const validatedPreferences = response.data.sportPreferences.map(pref => ({
          ...pref,
          // Eğer sportName yoksa, sports listesinden bul veya "Bilinmeyen Spor" kullan
          sportName: pref.sportName || "Bilinmeyen Spor"
        }));
        
        // State'i güncelle - backend'den dönen tüm tercihleri kullan
        set({
          sportPreferences: validatedPreferences,
          isUpdating: false,
          successMessage: response.message || 'Spor tercihi başarıyla güncellendi.'
        });
        
        return true;
      } else {
        throw new Error(response.error || 'Spor tercihi güncellenemedi');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Spor tercihi güncellenemedi';
      
      // API isteği başarısız
      useApiStore.getState().setGlobalError(errorMessage);
      
      set({
        error: errorMessage,
        isUpdating: false
      });
      
      return false;
    }
  },

  // Spor tercihini kaldır
  removeSportPreference: async (sportId) => {
    try {
      set({ isUpdating: true, error: null, successMessage: null });
      
      // API isteği kimliği oluştur
      const apiRequestId = useApiStore.getState().addRequest({
        url: `/users/profile/sport/${sportId}`,
        method: 'DELETE'
      });
      
      // API servisini çağır
      const response = await userProfileService.removeSportPreference(sportId);
      
      // API isteği tamamlandı
      useApiStore.getState().completeRequest(apiRequestId, 200);
      
      if (response.success && response.data) {
        // State'i güncelle - backend'den dönen tüm tercihleri kullan
        set({
          sportPreferences: response.data.sportPreferences,
          isUpdating: false,
          successMessage: response.message || 'Spor tercihi başarıyla kaldırıldı.'
        });
        
        return true;
      } else {
        throw new Error(response.error || 'Spor tercihi kaldırılamadı');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Spor tercihi kaldırılamadı';
      
      // API isteği başarısız
      useApiStore.getState().setGlobalError(errorMessage);
      
      set({
        error: errorMessage,
        isUpdating: false
      });
      
      return false;
    }
  },

  // Varsayılan konumu güncelle
  updateDefaultLocation: async (location) => {
    try {
      set({ isUpdating: true, error: null, successMessage: null });
      
      // API isteği kimliği oluştur
      const apiRequestId = useApiStore.getState().addRequest({
        url: '/users/profile/location',
        method: 'PUT'
      });
      
      // API servisini çağır
      const response = await userProfileService.updateUserLocation(location);
      
      // API isteği tamamlandı
      useApiStore.getState().completeRequest(apiRequestId, 200);
      
      if (response.success && response.data) {
        // State'i güncelle
        set({
          defaultLocation: response.data.defaultLocation,
          isUpdating: false,
          successMessage: response.message || 'Konum bilgisi başarıyla güncellendi.'
        });
        
        return true;
      } else {
        throw new Error(response.error || 'Konum bilgisi güncellenemedi');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Konum bilgisi güncellenemedi';
      
      // API isteği başarısız
      useApiStore.getState().setGlobalError(errorMessage);
      
      set({
        error: errorMessage,
        isUpdating: false
      });
      
      return false;
    }
  },

  // Profil ayarlarını güncelle
  updateProfileSettings: async (settings) => {
    try {
      set({ isUpdating: true, error: null, successMessage: null });
      
      // Yeni profil ayarlarını hazırla
      const updatedSettings = { ...get().profileSettings, ...settings };
      
      // AsyncStorage'da ayarları güncelle
      await AsyncStorage.setItem('@profile_settings', JSON.stringify(updatedSettings));
      
      // State'i güncelle
      set({
        profileSettings: updatedSettings,
        isUpdating: false,
        successMessage: 'Profil ayarları başarıyla güncellendi.'
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profil ayarları güncellenemedi';
      
      set({
        error: errorMessage,
        isUpdating: false
      });
      
      return false;
    }
  },

  // Konum bilgisini güncelle
  updateUserLocation: async (location: UserLocation) => {
    try {
      set({ isUpdating: true, error: null, successMessage: null });
      
      // API isteği kimliği oluştur
      const apiRequestId = useApiStore.getState().addRequest({
        url: '/users/profile/location',
        method: 'PUT'
      });
      
      // API servisini çağır - updateDefaultLocation yerine updateUserLocation kullan
      const response = await userProfileService.updateUserLocation(location);
      
      // API isteği tamamlandı
      useApiStore.getState().completeRequest(apiRequestId, 200);
      
      if (response.success && response.data) {
        // State'i güncelle
        set({
          defaultLocation: response.data.defaultLocation,
          isUpdating: false,
          successMessage: response.message || 'Konum bilgisi başarıyla güncellendi.'
        });
        
        return true;
      } else {
        throw new Error(response.error || 'Konum bilgisi güncellenemedi');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Konum bilgisi güncellenemedi';
      
      // API isteği başarısız
      useApiStore.getState().setGlobalError(errorMessage);
      
      set({
        error: errorMessage,
        isUpdating: false
      });
      
      return false;
    }
  },

  // Hata mesajlarını temizle
  clearErrors: () => set({ error: null }),
  
  // Başarı mesajlarını temizle
  clearMessages: () => set({ successMessage: null })
})); 