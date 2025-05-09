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
            ? userData.user_sports.map((sport: any) => ({
                sportId: sport.sport_id || sport.id || '',
                sportName: sport.sport_name || sport.name || '',
                skillLevel: sport.skill_level || 'beginner',
                icon: sport.icon || undefined,
              }))
            : [],
          defaultLocation: userData.default_location_latitude && userData.default_location_longitude ? {
            latitude: userData.default_location_latitude,
            longitude: userData.default_location_longitude,
            locationName: 'Kullanıcı Konumu'
          } : undefined,
          friends: Array.isArray(userData.friends) ? userData.friends : []
        };
        
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
      // Doğru endpoint: /users/profile/avatar
      const response = await apiClient.put('/users/profile/avatar', imageData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const apiData = response.data;
      
      // Backend yanıtını kontrol et
      if (apiData.success && apiData.data) {
        return {
          success: true,
          data: {
            profilePicture: apiData.data.profile_picture || ''
          },
          message: apiData.message || 'Profil fotoğrafı başarıyla güncellendi.'
        };
      }
      
      return apiData;
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
      // Gelen veriyi görelim
      console.log('Frontend sportPreferences input:', JSON.stringify(preferences, null, 2));
      
      // Kullanıcı spor tercihlerini backend formatına dönüştür
      // Backend sadece sportId ve skillLevel alanlarını bekliyor
      const backendFormat = preferences.map(pref => ({
        sportId: pref.sportId,
        skillLevel: pref.skillLevel
      }));
      
      console.log('Backend\'e gönderilecek format:', JSON.stringify(backendFormat, null, 2));
      
      // API isteği gönder
      const response = await apiClient.put('/users/profile/sports', backendFormat);
      console.log('Backend yanıtı:', JSON.stringify(response.data, null, 2));
      
      const apiData = response.data;
      
      // Backend yanıtını kontrol et
      if (apiData.success) {
        console.log('Başarılı API yanıtı');
        
        // Backend'den gelen veriyi frontend formatına dönüştür
        let transformedSports: UserSportPreference[] = [];
        
        if (apiData.data && Array.isArray(apiData.data)) {
          // Doğrudan dizi olarak gelen veri
          transformedSports = apiData.data.map((sport: any) => ({
            sportId: sport.sport_id || (sport.sport && sport.sport.id) || '',
            sportName: sport.sport_name || (sport.sport && sport.sport.name) || '',
            skillLevel: sport.skill_level || 'beginner',
            icon: sport.icon || (sport.sport && sport.sport.icon) || undefined
          }));
        } else if (apiData.data && apiData.data.sports && Array.isArray(apiData.data.sports)) {
          // { sports: [] } formatında gelen veri
          transformedSports = apiData.data.sports.map((sport: any) => ({
            sportId: sport.id || sport.sportId || '',
            sportName: sport.name || sport.sportName || '',
            skillLevel: sport.skillLevel || sport.skill_level || 'beginner',
            icon: sport.icon || undefined
          }));
        }
        
        console.log('Dönüştürülmüş spor tercihleri:', JSON.stringify(transformedSports, null, 2));
        
        return {
          success: true,
          data: {
            sportPreferences: transformedSports
          },
          message: apiData.message || 'Spor tercihleri başarıyla güncellendi.'
        };
      }
      
      // Hata durumu
      console.error('API başarısız cevap:', apiData);
      return {
        success: false,
        error: apiData.message || 'Spor tercihleri güncellenemedi.'
      };
    } catch (error) {
      console.error('Spor tercihleri güncelleme hatası:', error);
      
      // Kapsamlı hata mesajı oluştur
      const errorMessage = error instanceof Error 
        ? `Spor tercihleri güncellenemedi: ${error.message}`
        : 'Spor tercihleri güncellenemedi. Lütfen daha sonra tekrar deneyin.';
      
      return {
        success: false,
        error: errorMessage
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