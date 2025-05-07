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
import { useMapsStore } from '../appStore/mapsStore';

// Event tipini genişlet - mesafe bilgisi için
interface EventWithDistance extends Event {
  latitude?: number;
  longitude?: number;
  distance_info?: {
    distance: number;
    duration: number;
  };
}

// Kuş uçuşu mesafe hesaplama fonksiyonu (haversine formülü)
const calculateHaversineDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Kilometre cinsinden mesafe
  
  return distance;
};

// Derece cinsinden değeri radyana çevirir
const toRad = (deg: number): number => {
  return deg * Math.PI / 180;
};

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
  
  // Önbellek bilgileri
  lastNearbyEventsTimestamp: number | null;
  lastNearbyEventsLocation: { latitude: number, longitude: number } | null;
  
  // Metotlar
  fetchEvents: (params?: any) => Promise<void>;
  fetchEventDetail: (eventId: string) => Promise<void>;
  createEvent: (data: EventCreateRequest) => Promise<boolean>;
  updateEvent: (eventId: string, data: EventUpdateRequest) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  joinEvent: (eventId: string, options?: { invitation_code?: string }) => Promise<boolean>;
  leaveEvent: (eventId: string) => Promise<boolean>;
  rateEvent: (eventId: string, data: EventRatingRequest) => Promise<boolean>;
  fetchMyEvents: (params?: any) => Promise<void>;
  fetchCreatedEvents: (params?: any) => Promise<void>;
  fetchNearbyEvents: (params: {latitude: number, longitude: number, radius?: number}) => Promise<void>;
  searchEvents: (params: any) => Promise<void>;
  fetchRecommendedEvents: () => Promise<void>;
  fetchSports: () => Promise<void>;
  fetchAllEventsByDistance: (useLocation?: boolean) => Promise<void>;
  clearError: () => void;
  clearMessage: () => void;
  resetEventDetail: () => void;
  clearLoading: () => void;
  clearNearbyEventsCache: () => void;
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
  
  // Önbellek başlangıç değerleri
  lastNearbyEventsTimestamp: null,
  lastNearbyEventsLocation: null,
  
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
          error: response.message || 'Etkinlikler alınamadı.', 
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
          error: response.message || 'Etkinlik detayı alınamadı.', 
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
          error: response.message || 'Etkinlik oluşturulamadı.', 
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
          error: response.message || 'Etkinlik güncellenemedi.', 
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
          error: response.message || 'Etkinlik silinemedi.', 
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
  joinEvent: async (eventId: string, options?: { invitation_code?: string }) => {
    try {
      set({ isLoading: true, error: null, message: null });
      
      // Davet kodu varsa özel API endpoint'i kullan
      const response = options?.invitation_code 
        ? await eventService.joinPrivateEvent(eventId, options.invitation_code)
        : await eventService.joinEvent(eventId);
      
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
        // API'den gelen hata mesajını düzgün şekilde göster
        set({ 
          error: response.message || 'Etkinliğe katılma işlemi başarısız oldu.', 
          isLoading: false 
        });
        return false;
      }
    } catch (error: any) {
      // Hata mesajını daha anlaşılır hale getir
      let errorMessage = 'Etkinliğe katılırken bir hata oluştu.';
      
      // Axios hatası mı kontrol et
      if (error.response) {
        // API'nin döndüğü hata mesajı varsa onu kullan
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          // HTTP durum koduna göre hata mesajı oluştur
          switch (error.response.status) {
            case 400:
              errorMessage = 'Geçersiz istek. Lütfen tekrar deneyin.';
              break;
            case 401:
              errorMessage = 'Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.';
              break;
            case 403:
              errorMessage = 'Geçersiz davet kodu. Lütfen doğru kodu girdiğinizden emin olun.';
              break;
            case 404:
              errorMessage = 'Etkinlik bulunamadı.';
              break;
            case 409:
              errorMessage = 'Bu etkinliğe zaten katılmış olabilirsiniz.';
              break;
            default:
              errorMessage = `Bir hata oluştu (${error.response.status}). Lütfen tekrar deneyin.`;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      
      // API Store'da global hata mesajını güncelle
      useApiStore.getState().setGlobalError(errorMessage);
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
          error: response.message || 'Etkinlikten ayrılma işlemi başarısız oldu.', 
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
          error: response.message || 'Değerlendirme kaydedilemedi.', 
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
          error: response.message || 'Katıldığım etkinlikler alınamadı.', 
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
          error: response.message || 'Oluşturduğum etkinlikler alınamadı.', 
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
    const { 
      lastNearbyEventsTimestamp, 
      lastNearbyEventsLocation, 
      nearbyEvents 
    } = get();
    
    const now = Date.now();
    const CACHE_TTL = 5 * 60 * 1000; // 5 dakika (ms cinsinden)
    const DISTANCE_THRESHOLD = 0.1; // 100 metre (km cinsinden)
    
    // Önbellek kontrolü: Son sorgudan bu yana 5 dakikadan az zaman geçtiyse
    // ve kullanıcı 100m'den daha az hareket ettiyse önbellekteki veriyi kullan
    if (
      lastNearbyEventsTimestamp && 
      lastNearbyEventsLocation &&
      nearbyEvents.length > 0 &&
      now - lastNearbyEventsTimestamp < CACHE_TTL && 
      calculateHaversineDistance(
        params.latitude,
        params.longitude,
        lastNearbyEventsLocation.latitude,
        lastNearbyEventsLocation.longitude
      ) < DISTANCE_THRESHOLD
    ) {
      console.log('Yakındaki etkinlikler önbellekten kullanılıyor');
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const response = await eventService.getNearbyEvents(params);
      
      if (response.success && response.data) {
        // Verileri kaydet ve aynı zamanda önbellek bilgilerini güncelle
        set({ 
          nearbyEvents: response.data.events, 
          isLoading: false,
          lastNearbyEventsTimestamp: now,
          lastNearbyEventsLocation: {
            latitude: params.latitude,
            longitude: params.longitude
          }
        });
      } else {
        set({ 
          error: response.message || 'Yakındaki etkinlikler alınamadı.', 
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
          error: response.message || 'Arama sonuçları alınamadı.', 
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
          error: response.message || 'Önerilen etkinlikler alınamadı.', 
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
          error: response.message || 'Spor dalları alınamadı.', 
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
  
  // Tüm etkinlikleri mesafeye göre sıralama
  fetchAllEventsByDistance: async (useLocation: boolean = true) => {
    console.log('Tüm etkinlikler mesafeye göre sıralanıyor...');
    
    try {
      set({ isLoading: true, error: null });
      
      // Önce tüm aktif etkinlikleri getir
      const response = await eventService.getEvents({ 
        status: 'active',
        page: 1,
        limit: 100 // Daha fazla etkinlik almak için limit yüksek tutuldu
      });
      
      if (!response.success || !response.data || !response.data.events) {
        throw new Error('Etkinlikler alınamadı');
      }
      
      // Tip dönüşümü: Event[] -> EventWithDistance[]
      let events = response.data.events as EventWithDistance[];
      console.log(`Toplam ${events.length} etkinlik alındı, mesafeye göre sıralanıyor...`);
      
      // Konum bilgisini al
      const mapsStore = useMapsStore.getState();
      const location = mapsStore.lastLocation;
      
      if (location && useLocation) {
        // Kullanıcının konumu varsa, her etkinliğe mesafe bilgisi ekle
        events = events.map(event => {
          // Etkinliğin konum bilgisi yoksa, hesaplama yapma
          if (!event.latitude || !event.longitude) {
            return {
              ...event,
              distance_info: {
                distance: Number.MAX_SAFE_INTEGER, // Çok uzak bir mesafe olarak işaretle
                duration: 0
              }
            };
          }
          
          // Mesafeyi hesapla
          const distance = calculateHaversineDistance(
            location.latitude,
            location.longitude,
            event.latitude,
            event.longitude
          );
          
          // Metre cinsinden mesafe (km * 1000)
          const distanceInMeters = distance * 1000;
          
          // Ortalama yürüme hızı: 5 km/saat = 1.38 m/s
          // Koşma hızı: 10 km/saat = 2.77 m/s
          // Araba hızı: 40 km/saat = 11.11 m/s (şehir içi)
          
          // Arabayla tahmini süre (saniye)
          const durationInSeconds = distanceInMeters / 11.11;
          
          return {
            ...event,
            distance_info: {
              distance: distanceInMeters, // metre cinsinden mesafe
              duration: durationInSeconds // saniye cinsinden süre
            }
          };
        });
        
        // Yakın etkinlikleri önce göster
        events.sort((a, b) => {
          const distanceA = a.distance_info?.distance || Number.MAX_SAFE_INTEGER;
          const distanceB = b.distance_info?.distance || Number.MAX_SAFE_INTEGER;
          return distanceA - distanceB;
        });
        
        console.log('Etkinlikler mesafeye göre sıralandı');
      } else {
        // Kullanıcının konumu yoksa veya kullanılmayacaksa, tarihe göre sırala
        events.sort((a, b) => {
          const dateA = new Date(a.event_date);
          const dateB = new Date(b.event_date);
          return dateA.getTime() - dateB.getTime();
        });
        
        console.log('Etkinlikler tarihe göre sıralandı (konum bilgisi kullanılmadı)');
      }
      
      // Hem nearbyEvents hem de events listelerini güncelle
      set({ 
        nearbyEvents: events, 
        events: events,
        isLoading: false 
      });
      
      console.log('Etkinlikler başarıyla güncellendi');
    } catch (error) {
      console.error('Etkinlikleri mesafeye göre sıralama hatası:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Etkinlikleri yüklerken bir hata oluştu.', 
        isLoading: false 
      });
    }
  },
  
  // Hata temizleme
  clearError: () => set({ error: null }),
  
  // Mesaj temizleme
  clearMessage: () => set({ message: null }),
  
  // Etkinlik detayını sıfırla
  resetEventDetail: () => set({ currentEvent: null }),
  
  // Yükleme durumunu sıfırla
  clearLoading: () => set({ isLoading: false }),
  
  // Yakındaki etkinlikler önbelleğini temizle
  clearNearbyEventsCache: () => set({ 
    lastNearbyEventsTimestamp: null,
    lastNearbyEventsLocation: null
  })
}));