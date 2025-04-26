import { create } from 'zustand';
import { eventService } from '../../api/events/eventApi';
import { 
  Event, 
  EventCreateRequest, 
  EventUpdateRequest, 
  EventRatingRequest,
  Sport
} from '../../types/eventTypes/event.types';
import { useApiStore } from '../appStore/apiStore';

interface EventState {
  // Etkinlik listesi
  events: Event[];
  // Sayfalama bilgileri
  totalEvents: number;
  currentPage: number;
  limit: number;
  // Detay görüntülenen etkinlik
  currentEvent: Event | null;
  // Katıldığım etkinlikler
  myEvents: Event[];
  // Oluşturduğum etkinlikler
  createdEvents: Event[];
  // Yakındaki etkinlikler
  nearbyEvents: Event[];
  // Önerilen etkinlikler
  recommendedEvents: Event[];
  // Etkinlik arama sonuçları
  searchResults: Event[];
  // Spor dalları
  sports: Sport[];
  // Durum bilgileri
  isLoading: boolean;
  error: string | null;
  message: string | null;
  
  // Metotlar
  fetchEvents: (params?: any) => Promise<void>;
  fetchEventDetail: (eventId: string) => Promise<void>;
  createEvent: (data: EventCreateRequest) => Promise<boolean>;
  updateEvent: (eventId: string, data: EventUpdateRequest) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  joinEvent: (eventId: string) => Promise<boolean>;
  leaveEvent: (eventId: string) => Promise<boolean>;
  rateEvent: (eventId: string, data: EventRatingRequest) => Promise<boolean>;
  fetchMyEvents: (params?: any) => Promise<void>;
  fetchCreatedEvents: (params?: any) => Promise<void>;
  fetchNearbyEvents: (params: {latitude: number, longitude: number, radius?: number}) => Promise<void>;
  searchEvents: (params: any) => Promise<void>;
  fetchRecommendedEvents: () => Promise<void>;
  fetchSports: () => Promise<void>;
  clearError: () => void;
  clearMessage: () => void;
  resetEventDetail: () => void;
  clearLoading: () => void; // Yeni eklenen fonksiyon
}

export const useEventStore = create<EventState>((set, get) => ({
  // Başlangıç durumu
  events: [],
  totalEvents: 0,
  currentPage: 1,
  limit: 10,
  currentEvent: null,
  myEvents: [],
  createdEvents: [],
  nearbyEvents: [],
  recommendedEvents: [],
  searchResults: [],
  sports: [],
  isLoading: false,
  error: null,
  message: null,
  
  // Etkinlikleri getir
  fetchEvents: async (params = {}) => {
    try {
      // Validate and sanitize params to prevent NaN and invalid values
      const validParams = {
        ...params,
        page: params.page ? Number(params.page) : 1, // Ensure page is a valid number
        limit: params.limit ? Number(params.limit) : 10, // Ensure limit is a valid number
      };
      
      set({ isLoading: true, error: null });
      
      const response = await eventService.getEvents(validParams);
      
      if (response.success && response.data) {
        set({ 
          events: response.data.events, 
          totalEvents: response.data.total,
          currentPage: response.data.page,
          limit: response.data.limit,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.error || 'Etkinlikler alınamadı.', 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Etkinlikler yüklenirken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Etkinlikler yüklenirken bir hata oluştu.');
    }
  },
  
  // Etkinlik detayını getir
  fetchEventDetail: async (eventId: string) => {
    try {
      set({ isLoading: true, error: null, currentEvent: null });
      
      const response = await eventService.getEventDetail(eventId);
      
      if (response.success && response.data?.event) {
        set({ 
          currentEvent: response.data.event, 
          isLoading: false 
        });
      } else {
        set({ 
          error: response.error || 'Etkinlik detayı alınamadı.', 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Etkinlik detayı yüklenirken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Etkinlik detayı yüklenirken bir hata oluştu.');
    }
  },
  
  // Etkinlik oluştur
  createEvent: async (data: EventCreateRequest) => {
    try {
      set({ isLoading: true, error: null, message: null });
      
      // Yalnızca bir kez API isteği yap
      const response = await eventService.createEvent(data);
      
      if (response.success && response.data?.event) {
        // Başarıyla oluşturulan etkinliği createdEvents listesine ekle
        const createdEvent = response.data.event;
        const currentCreatedEvents = get().createdEvents;
        
        set({ 
          createdEvents: [createdEvent, ...currentCreatedEvents],
          message: 'Etkinlik başarıyla oluşturuldu.',
          isLoading: false 
        });
        return true;
      } else {
        set({ 
          error: response.error || 'Etkinlik oluşturulamadı.', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Etkinlik oluşturulurken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Etkinlik oluşturulurken bir hata oluştu.');
      return false;
    }
  },
  
  // Etkinliği güncelle
  updateEvent: async (eventId: string, data: EventUpdateRequest) => {
    try {
      set({ isLoading: true, error: null, message: null });
      
      const response = await eventService.updateEvent(eventId, data);
      
      if (response.success && response.data?.event) {
        // Güncellenmiş etkinliği currentEvent'e ayarla
        set({ 
          currentEvent: response.data.event,
          message: 'Etkinlik başarıyla güncellendi.',
          isLoading: false 
        });
        
        // Eğer events listesinde güncellenecek etkinlik varsa onu da güncelle
        const currentEvents = get().events;
        const updatedEvents = currentEvents.map(event => 
          event.id === eventId ? response.data?.event : event
        );
        
        // Eğer createdEvents listesinde varsa onu da güncelle
        const currentCreatedEvents = get().createdEvents;
        const updatedCreatedEvents = currentCreatedEvents.map(event => 
          event.id === eventId ? response.data?.event : event
        );
        
        set({ 
          events: updatedEvents.filter((event): event is Event => event !== undefined),
          createdEvents: updatedCreatedEvents.filter((event): event is Event => event !== undefined)
        });
        
        return true;
      } else {
        set({ 
          error: response.error || 'Etkinlik güncellenemedi.', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Etkinlik güncellenirken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Etkinlik güncellenirken bir hata oluştu.');
      return false;
    }
  },
  
  // Etkinliği sil
  deleteEvent: async (eventId: string) => {
    try {
      set({ isLoading: true, error: null, message: null });
      
      const response = await eventService.deleteEvent(eventId);
      
      if (response.success) {
        // Etkinliği events, myEvents ve createdEvents listelerinden kaldır
        const currentEvents = get().events.filter(event => event.id !== eventId);
        const currentMyEvents = get().myEvents.filter(event => event.id !== eventId);
        const currentCreatedEvents = get().createdEvents.filter(event => event.id !== eventId);
        
        set({ 
          events: currentEvents,
          myEvents: currentMyEvents,
          createdEvents: currentCreatedEvents,
          message: 'Etkinlik başarıyla silindi.',
          isLoading: false 
        });
        
        // Eğer silinen etkinlik, şu anda görüntülenen etkinlikse currentEvent'i null yap
        if (get().currentEvent?.id === eventId) {
          set({ currentEvent: null });
        }
        
        return true;
      } else {
        set({ 
          error: response.error || 'Etkinlik silinemedi.', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Etkinlik silinirken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Etkinlik silinirken bir hata oluştu.');
      return false;
    }
  },
  
  // Etkinliğe katıl
  joinEvent: async (eventId: string) => {
    try {
      set({ isLoading: true, error: null, message: null });
      
      const response = await eventService.joinEvent(eventId);
      
      if (response.success) {
        // Etkinliği myEvents listesine ekle
        const currentEvent = get().currentEvent;
        
        if (currentEvent && currentEvent.id === eventId) {
          // currentEvent'i güncelle (katılımcı sayısı ve katılım durumu)
          set({ 
            currentEvent: {
              ...currentEvent,
              current_participants: currentEvent.current_participants + 1,
              is_joined: true
            }
          });
        }
        
        // Etkinlik detayını tekrar çek
        await get().fetchEventDetail(eventId);
        // Katıldığım etkinlikleri güncelle
        await get().fetchMyEvents();
        
        set({ 
          message: response.message || 'Etkinliğe başarıyla katıldınız.',
          isLoading: false 
        });
        return true;
      } else {
        set({ 
          error: response.error || 'Etkinliğe katılma işlemi başarısız oldu.', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Etkinliğe katılırken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Etkinliğe katılırken bir hata oluştu.');
      return false;
    }
  },
  
  // Etkinlikten ayrıl
  leaveEvent: async (eventId: string) => {
    try {
      set({ isLoading: true, error: null, message: null });
      
      const response = await eventService.leaveEvent(eventId);
      
      if (response.success) {
        // Etkinliği myEvents listesinden çıkar
        const currentEvent = get().currentEvent;
        
        if (currentEvent && currentEvent.id === eventId) {
          // currentEvent'i güncelle (katılımcı sayısı ve katılım durumu)
          set({ 
            currentEvent: {
              ...currentEvent,
              current_participants: currentEvent.current_participants - 1,
              is_joined: false
            }
          });
        }
        
        // Etkinlik detayını tekrar çek
        await get().fetchEventDetail(eventId);
        // Katıldığım etkinlikleri güncelle
        await get().fetchMyEvents();
        
        set({ 
          message: response.message || 'Etkinlikten başarıyla ayrıldınız.',
          isLoading: false 
        });
        return true;
      } else {
        set({ 
          error: response.error || 'Etkinlikten ayrılma işlemi başarısız oldu.', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Etkinlikten ayrılırken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Etkinlikten ayrılırken bir hata oluştu.');
      return false;
    }
  },
  
  // Etkinliği değerlendir
  rateEvent: async (eventId: string, data: EventRatingRequest) => {
    try {
      set({ isLoading: true, error: null, message: null });
      
      const response = await eventService.rateEvent(eventId, data);
      
      if (response.success) {
        // Değerlendirme başarılı
        set({ 
          message: response.message || 'Değerlendirmeniz kaydedildi.',
          isLoading: false 
        });
        
        // Etkinlik detayını tekrar çek
        await get().fetchEventDetail(eventId);
        
        return true;
      } else {
        set({ 
          error: response.error || 'Değerlendirme kaydedilemedi.', 
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Değerlendirme yapılırken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Değerlendirme yapılırken bir hata oluştu.');
      return false;
    }
  },
  
  // Katıldığım etkinlikleri getir
  fetchMyEvents: async (params = {}) => {
    try {
      // Validate and ensure params have correct types
      const validParams = {
        ...params,
        page: params.page ? Number(params.page) : 1, // Ensure page is a valid number
      };
      
      set({ isLoading: true, error: null });
      
      const response = await eventService.getMyEvents(validParams);
      
      if (response.success && response.data) {
        set({ 
          myEvents: response.data.events, 
          isLoading: false 
        });
      } else {
        set({ 
          error: response.error || 'Katıldığım etkinlikler alınamadı.', 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Katıldığım etkinlikler yüklenirken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Katıldığım etkinlikler yüklenirken bir hata oluştu.');
    }
  },
  
  // Oluşturduğum etkinlikleri getir
  fetchCreatedEvents: async (params = {}) => {
    try {
      // Validate and ensure params have correct types
      const validParams = {
        ...params,
        page: params.page ? Number(params.page) : 1, // Ensure page is a valid number
        limit: params.limit ? Number(params.limit) : 10, // Ensure limit is a valid number
      };
      
      set({ isLoading: true, error: null });
      
      const response = await eventService.getCreatedEvents(validParams);
      
      if (response.success && response.data) {
        set({ 
          createdEvents: response.data.events, 
          isLoading: false 
        });
      } else {
        set({ 
          error: response.error || 'Oluşturduğum etkinlikler alınamadı.', 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Oluşturduğum etkinlikler yüklenirken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Oluşturduğum etkinlikler yüklenirken bir hata oluştu.');
    }
  },
  
  // Yakındaki etkinlikleri getir
  fetchNearbyEvents: async (params: {latitude: number, longitude: number, radius?: number}) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await eventService.getNearbyEvents(params);
      
      if (response.success && response.data) {
        set({ 
          nearbyEvents: response.data.events, 
          isLoading: false 
        });
      } else {
        set({ 
          error: response.error || 'Yakındaki etkinlikler alınamadı.', 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Yakındaki etkinlikler yüklenirken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Yakındaki etkinlikler yüklenirken bir hata oluştu.');
    }
  },
  
  // Etkinlik ara
  searchEvents: async (params = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await eventService.searchEvents(params);
      
      if (response.success && response.data) {
        set({ 
          searchResults: response.data.events, 
          isLoading: false 
        });
      } else {
        set({ 
          error: response.error || 'Arama sonuçları alınamadı.', 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Etkinlik aranırken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Etkinlik aranırken bir hata oluştu.');
    }
  },
  
  // Önerilen etkinlikleri getir
  fetchRecommendedEvents: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await eventService.getRecommendedEvents();
      
      if (response.success && response.data) {
        set({ 
          recommendedEvents: response.data.events, 
          isLoading: false 
        });
      } else {
        set({ 
          error: response.error || 'Önerilen etkinlikler alınamadı.', 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Önerilen etkinlikler yüklenirken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Önerilen etkinlikler yüklenirken bir hata oluştu.');
    }
  },
  
  // Spor dallarını getir
  fetchSports: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await eventService.getSports();
      
      if (response.success && response.data) {
        set({ 
          sports: response.data, // Doğrudan data'yı kullan, sports alt nesnesi yok
          isLoading: false 
        });
      } else {
        set({ 
          error: response.error || 'Spor dalları alınamadı.', 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Spor dalları yüklenirken bir hata oluştu.', 
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError('Spor dalları yüklenirken bir hata oluştu.');
    }
  },
  
  // Hata temizleme
  clearError: () => set({ error: null }),
  
  // Mesaj temizleme
  clearMessage: () => set({ message: null }),
  
  // Etkinlik detayını sıfırla
  resetEventDetail: () => set({ currentEvent: null }),
  
  // Yükleme durumunu sıfırla
  clearLoading: () => set({ isLoading: false })
}));