import { apiClient } from '../apiClient';
import { ApiResponse } from '../../types/apiTypes/api.types';
import { 
  UserStats, 
  UserSportPreference,
  UserLocation,
  FriendSummary,
  ProfileSettings,
  UserInfo,
  Friend
} from '../../store/userStore/profileStore';

interface ProfileResponse {
  userInfo: UserInfo;
  stats: UserStats;
  sportPreferences: UserSportPreference[];
  defaultLocation?: UserLocation;
  friendsSummary?: FriendSummary;
  settings?: ProfileSettings;
  friends?: Friend[];
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
            id: userData.id,
            firstName: userData.first_name,
            lastName: userData.last_name,
            username: userData.username,
            email: userData.email,
            phone: userData.phone,
            profilePicture: userData.profile_picture,
            role: userData.role,
            createdAt: userData.created_at
          },
          stats: {
            createdEventsCount: userData.stats.createdEventsCount,
            participatedEventsCount: userData.stats.participatedEventsCount,
            averageRating: userData.stats.averageRating,
            friendsCount: userData.stats.friendsCount
          },
          sportPreferences: Array.isArray(userData.user_sports) 
            ? userData.user_sports.map((sportData: any) => ({
                sportId: sportData.sport_id,
                sportName: sportData.sport ? sportData.sport.name : 'Bilinmeyen Spor',
                skillLevel: sportData.skill_level || 'beginner',
                icon: sportData.sport ? sportData.sport.icon : undefined,
              }))
            : [],
          defaultLocation: userData.default_location_latitude && userData.default_location_longitude ? {
            latitude: userData.default_location_latitude,
            longitude: userData.default_location_longitude,
            locationName: 'Kullanıcı Konumu'
          } : undefined,
          friends: Array.isArray(userData.friends) ? userData.friends : []
        };
        
        console.log('Spor tercihleri dönüştürüldü:', transformedData.sportPreferences);
        
        return {
          success: true,
          data: transformedData,
          message: apiData.message || 'Profil bilgileri başarıyla getirildi.'
        };
      }
      
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
      // Frontend'den gelen camelCase verileri snake_case'e dönüştür
      const snakeCaseData = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone
      };

      const response = await apiClient.put('/users/profile', snakeCaseData);
      const apiData = response.data;

      // Backend yanıtını frontend formatına dönüştür
      if (apiData.success && apiData.data) {
        const userData = apiData.data;
        return {
          success: true,
          data: {
            userInfo: {
              id: userData.id,
              firstName: userData.first_name || '',
              lastName: userData.last_name || '',
              username: userData.username || '',
              email: userData.email || '',
              phone: userData.phone || undefined,
              profilePicture: userData.profile_picture || undefined,
              role: userData.role,
              createdAt: userData.created_at
            }
          },
          message: apiData.message || 'Profil bilgileri başarıyla güncellendi.'
        };
      }

      return apiData;
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
      const response = await apiClient.put('/users/profile', imageData, {
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
   * Tek bir spor tercihi ekler veya günceller
   */
  updateSportPreferences: async (preference: UserSportPreference): Promise<ApiResponse<{ sportPreferences: UserSportPreference[] }>> => {
    try {
      // Tercihi backend formatına dönüştür - sadece sportId ve skillLevel gönder
      const backendPreference = {
        sportId: preference.sportId,
        skillLevel: preference.skillLevel
      };
      
      console.log('Backend\'e gönderilecek spor tercihi:', JSON.stringify(backendPreference, null, 2));
      
      // API'ye sadece sportId ve skillLevel bilgilerini gönder
      const response = await apiClient.post('/users/profile/sport-interest', backendPreference);
      
      // Backend yanıtını frontend formatına dönüştür
      if (response.data.success && response.data.data && response.data.data.user_sports) {
        // Backend'den dönen spor tercihlerini dönüştür
        const sportPreferences = response.data.data.user_sports.map((sportData: any) => ({
          sportId: sportData.sport_id,
          sportName: sportData.sport ? sportData.sport.name : 'Bilinmeyen Spor',
          skillLevel: sportData.skill_level || 'beginner',
          icon: sportData.sport ? sportData.sport.icon : undefined,
        }));
        
        console.log('Backend\'den dönen spor tercihleri:', sportPreferences);
        
        return {
          success: true,
          data: { sportPreferences },
          message: response.data.message || 'Spor tercihi başarıyla güncellendi.'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Spor tercihi güncelleme hatası:', error);
      return {
        success: false,
        error: 'Spor tercihiniz güncellenemedi. Lütfen daha sonra tekrar deneyin.'
      };
    }
  },

  /**
   * Bir spor tercihini kaldırır
   */
  removeSportPreference: async (sportId: string): Promise<ApiResponse<{ sportPreferences: UserSportPreference[] }>> => {
    try {
      console.log('Kaldırılacak spor tercihi ID:', sportId);
      
      // API'ye sportId gönder
      const response = await apiClient.delete(`/users/profile/sport-interest/${sportId}`);
      
      // Backend yanıtını frontend formatına dönüştür
      if (response.data.success && response.data.data && response.data.data.user_sports) {
        // Backend'den dönen spor tercihlerini dönüştür
        const sportPreferences = response.data.data.user_sports.map((sportData: any) => ({
          sportId: sportData.sport_id,
          sportName: sportData.sport ? sportData.sport.name : 'Bilinmeyen Spor',
          skillLevel: sportData.skill_level || 'beginner',
          icon: sportData.sport ? sportData.sport.icon : undefined,
        }));
        
        console.log('Backend\'den spor tercihi kaldırıldıktan sonra dönen tercihler:', sportPreferences);
        
        return {
          success: true,
          data: { sportPreferences },
          message: response.data.message || 'Spor tercihi başarıyla kaldırıldı.'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Spor tercihi kaldırma hatası:', error);
      return {
        success: false,
        error: 'Spor tercihiniz kaldırılamadı. Lütfen daha sonra tekrar deneyin.'
      };
    }
  },

  /**
   * Kullanıcı konum bilgisini günceller
   */
  updateUserLocation: async (location: UserLocation): Promise<ApiResponse<{ defaultLocation: UserLocation }>> => {
    try {
      // Frontend'den gelen koordinat verilerini backend formatına dönüştür
      const requestData = {
        latitude: location.latitude,
        longitude: location.longitude,
        locationName: location.locationName || 'Kullanıcı Konumu'
      };

      const response = await apiClient.put('/users/profile/location', requestData);
      const apiData = response.data;

      if (apiData.success && apiData.data) {
        return {
          success: true,
          data: {
            defaultLocation: {
              latitude: apiData.data.defaultLocation?.latitude || location.latitude,
              longitude: apiData.data.defaultLocation?.longitude || location.longitude,
              locationName: apiData.data.defaultLocation?.locationName || location.locationName
            }
          },
          message: apiData.message || 'Konum bilgisi başarıyla güncellendi.'
        };
      }

      return apiData;
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