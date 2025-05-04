import { create } from 'zustand';
import { friendsApi, Friend, SuggestedFriend, FriendRequest, FriendshipStatus } from '../../api/friends/friendsApi';
import { useApiStore } from '../appStore/apiStore';

interface FriendsState {
  // Veri
  friends: Friend[];
  suggestedFriends: SuggestedFriend[];
  friendRequests: FriendRequest[];
  
  // Pagination
  totalFriends: number;
  totalRequests: number;
  currentFriendsPage: number;
  currentRequestsPage: number;
  
  // Yükleme durumları
  isLoadingFriends: boolean;
  isLoadingSuggestions: boolean;
  isLoadingRequests: boolean;
  isProcessingRequest: boolean;
  
  // Hata durumları
  error: string | null;
  
  // İşlem sonucu mesajı
  message: string | null;
  
  // Arkadaşlık durumları önbelleği
  friendshipStatusCache: Record<string, FriendshipStatus>;

  // İşlemler
  // - Veri Alma
  fetchFriends: (page?: number, limit?: number) => Promise<void>;
  fetchSuggestedFriends: (limit?: number) => Promise<void>;
  fetchFriendRequests: (status?: 'pending' | 'accepted' | 'rejected', page?: number, limit?: number) => Promise<void>;
  checkFriendshipStatus: (userId: string) => Promise<FriendshipStatus | null>;
  
  // - Arkadaşlık İşlemleri
  sendFriendRequest: (userId: string) => Promise<boolean>;
  cancelFriendRequest: (userId: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  rejectFriendRequest: (requestId: string) => Promise<boolean>;
  removeFriend: (userId: string) => Promise<boolean>;
  
  // - State Temizleme
  clearErrors: () => void;
  clearMessage: () => void;
  resetState: () => void;
}

const initialState = {
  friends: [],
  suggestedFriends: [],
  friendRequests: [],
  totalFriends: 0,
  totalRequests: 0,
  currentFriendsPage: 1,
  currentRequestsPage: 1,
  isLoadingFriends: false,
  isLoadingSuggestions: false,
  isLoadingRequests: false,
  isProcessingRequest: false,
  error: null,
  message: null,
  friendshipStatusCache: {},
};

export const useFriendsStore = create<FriendsState>((set, get) => ({
  ...initialState,

  // Arkadaşları getir
  fetchFriends: async (page = 1, limit = 10) => {
    try {
      set({ isLoadingFriends: true, error: null });
      
      console.log(`Arkadaşlar için API isteği yapılıyor: sayfa=${page}, limit=${limit}`);
      const response = await friendsApi.getFriends(page, limit);
      console.log('Arkadaşlar API yanıtı:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log(`Toplam arkadaş sayısı: ${response.data.pagination.total}`);
        console.log(`Dönen veri sayısı: ${response.data.data.length}`);
        
        const updatedFriends = page === 1 
          ? response.data.data 
          : [...get().friends, ...response.data.data];
          
        console.log(`Güncellenmiş arkadaş listesi (${updatedFriends.length} adet):`, 
          updatedFriends.map(f => `${f.first_name} ${f.last_name}`));
        
        set({
          friends: updatedFriends,
          totalFriends: response.data.pagination.total,
          currentFriendsPage: page,
          isLoadingFriends: false,
          error: null // Başarılı durumda error'u null olarak ayarla
        });
      } else {
        console.error('Arkadaşlar başarılı yanıt dönmedi:', response.message);
        set({
          error: response.message || 'Arkadaşlar yüklenemedi',
          isLoadingFriends: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Arkadaşlar yüklenirken bir hata oluştu';
      console.error('Arkadaşlar getirme hatası:', errorMessage);
      set({
        error: errorMessage,
        isLoadingFriends: false,
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
    }
  },

  // Arkadaş önerilerini getir
  fetchSuggestedFriends: async (limit = 5) => {
    try {
      set({ isLoadingSuggestions: true, error: null });
      
      const response = await friendsApi.getSuggestedFriends(limit);
      
      if (response.success && response.data) {
        set({
          suggestedFriends: response.data.suggestedFriends,
          isLoadingSuggestions: false,
        });
      } else {
        set({
          error: response.message || 'Arkadaş önerileri yüklenemedi',
          isLoadingSuggestions: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Arkadaş önerileri yüklenirken bir hata oluştu';
      set({
        error: errorMessage,
        isLoadingSuggestions: false,
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
    }
  },

  // Arkadaşlık isteklerini getir
  fetchFriendRequests: async (status = 'pending', page = 1, limit = 10) => {
    try {
      set({ isLoadingRequests: true, error: null });
      
      const response = await friendsApi.getFriendRequests(status, page, limit);
      
      if (response.success && response.data) {
        set({
          friendRequests: page === 1 
            ? response.data.data 
            : [...get().friendRequests, ...response.data.data],
          totalRequests: response.data.pagination.total,
          currentRequestsPage: page,
          isLoadingRequests: false,
        });
      } else {
        set({
          error: response.message || 'Arkadaşlık istekleri yüklenemedi',
          isLoadingRequests: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Arkadaşlık istekleri yüklenirken bir hata oluştu';
      set({
        error: errorMessage,
        isLoadingRequests: false,
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
    }
  },

  // Arkadaşlık durumunu kontrol et
  checkFriendshipStatus: async (userId: string) => {
    try {
      // Önce önbellekte var mı kontrol et
      const cachedStatus = get().friendshipStatusCache[userId];
      if (cachedStatus) {
        return cachedStatus;
      }
      
      const response = await friendsApi.checkFriendshipStatus(userId);
      
      if (response.success && response.data) {
        // Durumu önbelleğe ekle
        const statusCache = {
          ...get().friendshipStatusCache,
          [userId]: response.data,
        };
        
        set({ friendshipStatusCache: statusCache });
        return response.data;
      }
      
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Arkadaşlık durumu kontrol edilirken bir hata oluştu';
      set({ error: errorMessage });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
      return null;
    }
  },

  // Arkadaşlık isteği gönder
  sendFriendRequest: async (userId: string) => {
    try {
      set({ isProcessingRequest: true, error: null, message: null });
      
      const response = await friendsApi.sendFriendRequest(userId);
      
      if (response.success && response.data) {
        // Arkadaşlık durumu önbelleğini güncelle
        const statusCache = {
          ...get().friendshipStatusCache,
          [userId]: { status: 'sent' as const, request: response.data.request },
        };
        
        // Önerilen arkadaşlar listesinden kullanıcıyı çıkar
        const updatedSuggestions = get().suggestedFriends.filter(
          friend => friend.id !== userId
        );
        
        set({
          message: 'Arkadaşlık isteği başarıyla gönderildi',
          friendshipStatusCache: statusCache,
          suggestedFriends: updatedSuggestions,
          isProcessingRequest: false,
        });
        
        return true;
      } else {
        set({
          error: response.message || 'Arkadaşlık isteği gönderilemedi',
          isProcessingRequest: false,
        });
        
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Arkadaşlık isteği gönderilirken bir hata oluştu';
      set({
        error: errorMessage,
        isProcessingRequest: false,
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
      return false;
    }
  },

  // Arkadaşlık isteğini iptal et
  cancelFriendRequest: async (userId: string) => {
    try {
      set({ isProcessingRequest: true, error: null, message: null });
      
      const response = await friendsApi.cancelFriendRequest(userId);
      
      if (response.success) {
        // Durumu önbellekte güncelle
        const statusCache = {
          ...get().friendshipStatusCache,
          [userId]: { status: 'none' as const },
        };
        
        set({
          friendshipStatusCache: statusCache,
          message: 'Arkadaşlık isteği iptal edildi',
          isProcessingRequest: false,
        });
        
        return true;
      } else {
        set({
          error: response.message || 'Arkadaşlık isteği iptal edilemedi',
          isProcessingRequest: false,
        });
        
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Arkadaşlık isteği iptal edilirken bir hata oluştu';
      set({
        error: errorMessage,
        isProcessingRequest: false,
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
      return false;
    }
  },

  // Arkadaşlık isteğini kabul et
  acceptFriendRequest: async (requestId: string) => {
    try {
      set({ isProcessingRequest: true, error: null, message: null });
      
      const response = await friendsApi.acceptFriendRequest(requestId);
      
      if (response.success && response.data) {
        // İlgili isteği istekler listesinden çıkar
        const updatedRequests = get().friendRequests.filter(
          request => request.id !== requestId
        );
        
        // İstek gönderen kullanıcıyı bul
        const acceptedRequest = get().friendRequests.find(
          request => request.id === requestId
        );
        
        // Yeni arkadaşı arkadaşlar listesine ekle (eğer istek bulunduysa)
        let updatedFriends = [...get().friends];
        if (acceptedRequest) {
          const senderId = acceptedRequest.sender_id;
          
          // Durumu önbellekte güncelle
          const statusCache = {
            ...get().friendshipStatusCache,
            [senderId]: { status: 'friend' as const },
          };
          
          // Yeni arkadaşı ekle
          const newFriend: Friend = {
            id: acceptedRequest.sender.id,
            first_name: acceptedRequest.sender.first_name,
            last_name: acceptedRequest.sender.last_name,
            username: acceptedRequest.sender.username,
            profile_picture: acceptedRequest.sender.profile_picture,
            friendship_date: new Date().toISOString(),
          };
          
          updatedFriends = [newFriend, ...updatedFriends];
          
          set({ friendshipStatusCache: statusCache });
        }
        
        set({
          friends: updatedFriends,
          friendRequests: updatedRequests,
          totalRequests: get().totalRequests - 1,
          totalFriends: get().totalFriends + 1,
          message: 'Arkadaşlık isteği kabul edildi',
          isProcessingRequest: false,
        });
        
        return true;
      } else {
        set({
          error: response.message || 'Arkadaşlık isteği kabul edilemedi',
          isProcessingRequest: false,
        });
        
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Arkadaşlık isteği kabul edilirken bir hata oluştu';
      set({
        error: errorMessage,
        isProcessingRequest: false,
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
      return false;
    }
  },

  // Arkadaşlık isteğini reddet
  rejectFriendRequest: async (requestId: string) => {
    try {
      set({ isProcessingRequest: true, error: null, message: null });
      
      const response = await friendsApi.rejectFriendRequest(requestId);
      
      if (response.success) {
        // İlgili isteği istekler listesinden çıkar
        const updatedRequests = get().friendRequests.filter(
          request => request.id !== requestId
        );
        
        // İstek gönderen kullanıcıyı bul
        const rejectedRequest = get().friendRequests.find(
          request => request.id === requestId
        );
        
        // Durumu önbellekte güncelle (eğer istek bulunduysa)
        if (rejectedRequest) {
          const senderId = rejectedRequest.sender_id;
          
          const statusCache = {
            ...get().friendshipStatusCache,
            [senderId]: { status: 'none' as const },
          };
          
          set({ friendshipStatusCache: statusCache });
        }
        
        set({
          friendRequests: updatedRequests,
          totalRequests: get().totalRequests - 1,
          message: 'Arkadaşlık isteği reddedildi',
          isProcessingRequest: false,
        });
        
        return true;
      } else {
        set({
          error: response.message || 'Arkadaşlık isteği reddedilemedi',
          isProcessingRequest: false,
        });
        
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Arkadaşlık isteği reddedilirken bir hata oluştu';
      set({
        error: errorMessage,
        isProcessingRequest: false,
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
      return false;
    }
  },

  // Arkadaşlığı sonlandır
  removeFriend: async (userId: string) => {
    try {
      set({ isProcessingRequest: true, error: null, message: null });
      
      const response = await friendsApi.removeFriend(userId);
      
      if (response.success) {
        // Arkadaşı listeden çıkar
        const updatedFriends = get().friends.filter(
          friend => friend.id !== userId
        );
        
        // Durumu önbellekte güncelle
        const statusCache = {
          ...get().friendshipStatusCache,
          [userId]: { status: 'none' as const },
        };
        
        set({
          friends: updatedFriends,
          totalFriends: get().totalFriends - 1,
          friendshipStatusCache: statusCache,
          message: 'Arkadaşlık başarıyla sonlandırıldı',
          isProcessingRequest: false,
        });
        
        return true;
      } else {
        set({
          error: response.message || 'Arkadaşlık sonlandırılamadı',
          isProcessingRequest: false,
        });
        
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Arkadaşlık sonlandırılırken bir hata oluştu';
      set({
        error: errorMessage,
        isProcessingRequest: false,
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
      return false;
    }
  },

  // Hataları temizle
  clearErrors: () => {
    set({ error: null });
  },

  // Mesajı temizle
  clearMessage: () => {
    set({ message: null });
  },

  // State'i sıfırla
  resetState: () => {
    set({
      ...initialState,
      error: null,
      message: null,
    });
    console.log('FriendsStore durumu sıfırlandı');
  },
})); 