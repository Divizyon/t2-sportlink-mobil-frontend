import { apiClient } from '../apiClient';
import { ApiResponse } from '../../types/apiTypes/api.types';
import { 
  UserStats, 
  UserSportPreference,
  UserLocation,
  FriendSummary,
  ProfileSettings
} from '../../store/userStore/profileStore';

interface ProfileResponse {
  userInfo: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  };
  stats: UserStats;
  sportPreferences: UserSportPreference[];
  defaultLocation: UserLocation;
  friendsSummary: FriendSummary;
}

interface UpdateProfileInfoRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const userProfileService = {
  /**
   * Kullanıcı profil bilgilerini getirir
   */
  getProfile: async (): Promise<ApiResponse<ProfileResponse>> => {
    try {
      const response = await apiClient.get('/users/profile');
      const apiData = response.data;
      
      // Backend yanıtını uygun formata dönüştür
      if (apiData.success && apiData.data) {
        const userData = apiData.data;
        
        // Dönüştürülmüş veri yapısı oluştur
        const transformedData: ProfileResponse = {
          userInfo: {
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            username: userData.username || '',
            email: userData.email || '',
            phone: userData.phone || undefined,
            profilePicture: userData.profile_picture || undefined,
          },
          stats: {
            joinedEventsCount: userData.joined_events_count || 0,
            createdEventsCount: userData.created_events_count || 0,
            rating: userData.rating || 0,
            reviewCount: userData.review_count || 0,
            favoriteEventType: userData.favorite_event_type || undefined,
          },
          sportPreferences: Array.isArray(userData.user_sports) 
            ? userData.user_sports.map((sport: any) => ({
                sportId: sport.sport_id || sport.id || '',
                sportName: sport.sport_name || sport.name || '',
                skillLevel: sport.skill_level || 'beginner',
                icon: sport.icon || undefined,
              }))
            : [],
          defaultLocation: {
            latitude: userData.default_location_latitude || 0,
            longitude: userData.default_location_longitude || 0,
            locationName: userData.default_location_name || 'Belirtilmemiş',
          },
          friendsSummary: {
            totalFriends: userData.total_friends || 0,
            pendingRequests: userData.pending_requests || 0,
            mostActiveWith: userData.most_active_with || undefined,
          }
        };
        
        return {
          success: true,
          data: transformedData,
          message: apiData.message || 'Profil bilgileri başarıyla getirildi.'
        };
      }
      
      // Başarısız yanıt durumunda orijinal yanıtı döndür
      return apiData;
    } catch (error) {
      console.error('Profil bilgisi getirme hatası:', error);
      return {
        success: false,
        error: 'Profil bilgileriniz alınamadı. Lütfen daha sonra tekrar deneyin.'
      };
    }
  },

  /**
   * Profil bilgilerini günceller
   */
  updateProfile: async (data: UpdateProfileInfoRequest): Promise<ApiResponse<{ userInfo: ProfileResponse['userInfo'] }>> => {
    try {
      const response = await apiClient.put('/users/profile', data);
      return response.data;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      return {
        success: false,
        error: 'Profil bilgileriniz güncellenemedi. Lütfen daha sonra tekrar deneyin.'
      };
    }
  },

  /**
   * Profil fotoğrafını günceller
   */
  updateProfilePicture: async (imageData: FormData): Promise<ApiResponse<{ profilePicture: string }>> => {
    try {
      const response = await apiClient.put('/users/profile/avatar', imageData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Profil fotoğrafı güncelleme hatası:', error);
      return {
        success: false,
        error: 'Profil fotoğrafınız güncellenemedi. Lütfen daha sonra tekrar deneyin.'
      };
    }
  },

  /**
   * Spor tercihlerini günceller
   */
  updateSportPreferences: async (preferences: UserSportPreference[]): Promise<ApiResponse<{ sportPreferences: UserSportPreference[] }>> => {
    try {
      const response = await apiClient.put('/users/profile/sports', { sportPreferences: preferences });
      return response.data;
    } catch (error) {
      console.error('Spor tercihleri güncelleme hatası:', error);
      return {
        success: false,
        error: 'Spor tercihleriniz güncellenemedi. Lütfen daha sonra tekrar deneyin.'
      };
    }
  },

  /**
   * Varsayılan konum bilgisini günceller
   */
  updateDefaultLocation: async (location: UserLocation): Promise<ApiResponse<{ defaultLocation: UserLocation }>> => {
    try {
      const response = await apiClient.put('/users/profile/location', location);
      return response.data;
    } catch (error) {
      console.error('Konum güncelleme hatası:', error);
      return {
        success: false,
        error: 'Konum bilginiz güncellenemedi. Lütfen daha sonra tekrar deneyin.'
      };
    }
  },

  /**
   * Kullanıcı etkinlik istatistiklerini getirir
   */
  getUserStats: async (): Promise<ApiResponse<{ stats: UserStats }>> => {
    try {
      const response = await apiClient.get('/users/profile/stats');
      return response.data;
    } catch (error) {
      console.error('Kullanıcı istatistikleri getirme hatası:', error);
      return {
        success: false,
        error: 'İstatistikleriniz alınamadı. Lütfen daha sonra tekrar deneyin.'
      };
    }
  },

  /**
   * Arkadaşlık durumu bilgilerini getirir
   */
  getFriendsInfo: async (): Promise<ApiResponse<{ friendsSummary: FriendSummary }>> => {
    try {
      const response = await apiClient.get('/users/profile/friends');
      return response.data;
    } catch (error) {
      console.error('Arkadaşlık bilgileri getirme hatası:', error);
      return {
        success: false,
        error: 'Arkadaşlık bilgileriniz alınamadı. Lütfen daha sonra tekrar deneyin.'
      };
    }
  },

  /**
   * Şifre değiştirme
   */
  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.put('/users/profile/password', data);
      return response.data;
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      return {
        success: false,
        error: 'Şifreniz değiştirilemedi. Lütfen daha sonra tekrar deneyin.'
      };
    }
  }
}; 