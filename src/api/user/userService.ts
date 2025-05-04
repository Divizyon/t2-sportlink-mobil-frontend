import { apiClient } from '../apiClient';
import { ApiResponse } from '../../types/apiTypes/api.types';
import { Friend } from '../../api/friends/friendsApi';

export interface ProfileUserFriend {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string | null;
  sports?: {
    id: string;
    name: string;
    icon: string;
    skillLevel?: string;
  }[];
}

export const userService = {
  /**
   * Kullanıcı profilinden doğrudan arkadaş listesini getirir
   */
  getProfileFriends: async (): Promise<ApiResponse<{ friends: ProfileUserFriend[] }>> => {
    try {
      const response = await apiClient.get('/users/profile/friends/list');
      
      // API yanıtını dönüştür
      if (response.data.success && response.data.data) {
        const rawFriends = response.data.data.friends || [];
        
        // Gelen veriyi dönüştür (snake_case'den camelCase'e)
        const transformedFriends = rawFriends.map((friend: any) => ({
          id: friend.id,
          firstName: friend.first_name,
          lastName: friend.last_name,
          username: friend.username,
          profilePicture: friend.profile_picture,
          sports: Array.isArray(friend.sports) 
            ? friend.sports.map((sport: any) => ({
                id: sport.id,
                name: sport.name,
                icon: sport.icon,
                skillLevel: sport.skill_level
              }))
            : []
        }));
        
        return {
          success: true,
          data: {
            friends: transformedFriends
          },
          message: response.data.message || 'Arkadaş listesi başarıyla alındı.'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Arkadaş listesi getirme hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Arkadaş listesi alınamadı. Lütfen daha sonra tekrar deneyin.'
      };
    }
  }
}; 