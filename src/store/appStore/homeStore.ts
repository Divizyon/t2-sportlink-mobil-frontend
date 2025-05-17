import { create } from 'zustand';
import eventService from '../../api/events/eventService';
import newsService from '../../api/news/newsService';
import sportsService from '../../api/sports/sportsService';
import announcementService from '../../api/announcements/announcementService';
import { Event, RecommendationReasonType } from '../../types/eventTypes/event.types';
import { News, Sport, Announcement } from '../../types/apiTypes/api.types';
import { useEventStore } from '../eventStore/eventStore';
import { useMapsStore } from './mapsStore';
import { useProfileStore } from '../userStore/profileStore';
import { UserSportPreference } from '../userStore/profileStore';

interface HomeStoreState {
  // Veriler
  upcomingEvents: Event[];
  recommendedEvents: Event[];
  news: News[];
  sports: Sport[];
  announcements: Announcement[];
  
  // Yükleme durumları
  isLoadingUpcomingEvents: boolean;
  isLoadingRecommendedEvents: boolean; 
  isLoadingNearbyEvents: boolean;
  isLoadingNews: boolean;
  isLoadingSports: boolean;
  isLoadingAnnouncements: boolean;
  
  // Hata durumları
  upcomingEventsError: string | null;
  recommendedEventsError: string | null;
  nearbyEventsError: string | null;
  newsError: string | null;
  sportsError: string | null;
  announcementsError: string | null;
  
  // Eylemler
  fetchUpcomingEvents: () => Promise<void>;
  fetchRecommendedEvents: () => Promise<void>;
  fetchNearbyEvents: (params: { latitude: number; longitude: number; radius: number }) => Promise<void>;
  fetchNews: () => Promise<void>;
  fetchSports: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  
  // Yenileme
  refreshAll: () => Promise<void>;
}

export const useHomeStore = create<HomeStoreState>((set, get) => ({
  // İlk değerler
  upcomingEvents: [],
  recommendedEvents: [],
  news: [],
  sports: [],
  announcements: [],
  
  // Yükleme durumları
  isLoadingUpcomingEvents: false,
  isLoadingRecommendedEvents: false,
  isLoadingNearbyEvents: false,
  isLoadingNews: false,
  isLoadingSports: false,
  isLoadingAnnouncements: false,
  
  // Hata durumları
  upcomingEventsError: null,
  recommendedEventsError: null,
  nearbyEventsError: null,
  newsError: null,
  sportsError: null,
  announcementsError: null,
  
  // Yaklaşan etkinlikleri getir - EventStore'dan filtreleyerek
  fetchUpcomingEvents: async () => {
    set({ isLoadingUpcomingEvents: true, upcomingEventsError: null });
    try {
      // EventStore'dan tüm etkinlikleri kontrol et, yoksa önce verileri yükle
      const eventStore = useEventStore.getState();
      
      if (eventStore.events.length === 0) {
        // EventStore'da veri yoksa, önce verileri yükle
        await eventStore.fetchEvents({
          status: 'active',
          page: 1,
          limit: 20 // Daha fazla etkinlik getir ki filtreleme sonrası yeteri kadar olsun
        });
      }
      
      // Şu anki tarihi ve saati al
      const now = new Date();
      
      // EventStore'dan etkinlikleri tüm filtrelere göre filtrele (active ve yaklaşan)
      const events = useEventStore.getState().events;
      
      // Başlangıç tarihi gelecek olan etkinlikleri filtrele
      const upcomingFiltered = events.filter(event => {
        // Etkinlik başlangıç ve bitiş tarihlerini alalım
        const startDate = new Date(event.start_time);
        const endDate = new Date(event.end_time);
        
        // Etkinlik başlangıç tarihi bugünden sonra olan ve durumu active olan etkinlikleri seç
        return startDate > now && event.status === 'active';
      });
      
      // Tarihe göre sırala (önce yakın tarihli etkinlikler)
      const sortedEvents = upcomingFiltered.sort((a, b) => {
        const dateA = new Date(a.start_time);
        const dateB = new Date(b.start_time);
        return dateA.getTime() - dateB.getTime();
      });
      
      set({ upcomingEvents: sortedEvents, isLoadingUpcomingEvents: false });
    } catch (error) {
      console.error('Yaklaşan etkinlikleri filtrelemede hata oluştu:', error);
      set({ 
        upcomingEventsError: 'Yaklaşan etkinlikler yüklenirken hata oluştu', 
        isLoadingUpcomingEvents: false 
      });
      
      // Yedek olarak API'den veri çekme yöntemine geri dön
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const response = await eventService.getEvents({
          status: 'active',
          page: 1,
          limit: 10
        });
        
        // Sadece tarihi bugünden sonra olan etkinlikleri filtrele
        if (response.data && response.data.events) {
          const upcomingEvents = response.data.events.filter((event: Event) => 
            new Date(event.event_date) >= new Date(today)
          );
          
          set({ upcomingEvents, isLoadingUpcomingEvents: false });
        } else {
          console.error('API yanıtı beklenen formatta değil:', response);
          set({ upcomingEvents: [], isLoadingUpcomingEvents: false });
        }
      } catch (backupError) {
        console.error('Yedek yaklaşan etkinlikleri getirirken hata oluştu:', backupError);
        set({ 
          upcomingEventsError: 'Yaklaşan etkinlikler yüklenirken hata oluştu', 
          isLoadingUpcomingEvents: false,
          upcomingEvents: [] // Hata durumunda boş dizi ata
        });
      }
    }
  },
  
  // Önerilen etkinlikleri getir
  fetchRecommendedEvents: async () => {
    set({ isLoadingRecommendedEvents: true, recommendedEventsError: null });
    try {
      // ProfileStore'dan kullanıcı tercihlerini al
      const { sportPreferences } = useProfileStore.getState();
          
      // API'den önerilen etkinlikleri doğrudan getir
      const response = await eventService.getRecommendedEvents();
      
      // API yanıtını kontrol et
      if (response.success && response.data && Array.isArray(response.data.events)) {
        const recommendedEvents = response.data.events;
        
        // Backend gelen recommendation_reason alanlarını kontrol et ve doğru tipe dönüştür
        // Eğer recommendation_reason alanı yoksa, varsayılan değerler oluştur
        const eventsWithRecommendationInfo = recommendedEvents.map(event => {
          // Eğer recommendation_reason yoksa ve sport alanı varsa, spor bazlı öneri kabul et
          if (!event.recommendation_reason && event.sport && sportPreferences) {
            const matchingSport = sportPreferences.find(pref => pref.sportId === event.sport_id);
            
            if (matchingSport) {
              return {
                ...event,
                recommendation_reason: {
                  type: 'sport_preference' as 'sport_preference',
                  sport_id: event.sport_id,
                  sport_name: event.sport?.name || 'Bilinmeyen Spor',
                  skill_level: matchingSport.skillLevel
                }
              };
            }
          }
          
          // Eğer recommendation_reason varsa, varsayılan olarak doğru tipe dönüştür
          if (event.recommendation_reason) {
            const { type } = event.recommendation_reason;
            
            if (type === 'both' || type === 'sport_preference' || type === 'friend_participation') {
              // Bu tiplerden biriyse doğru formatta
              return {
                ...event,
                recommendation_reason: {
                  ...event.recommendation_reason,
                  type: type as RecommendationReasonType
                }
              };
            }
          }
          
          // Hiçbir düzeltme gerekmiyorsa olduğu gibi döndür
          return event;
        });
        
        set({ recommendedEvents: eventsWithRecommendationInfo, isLoadingRecommendedEvents: false });
      } else {
        console.error('API yanıtı beklenen formatta değil:', response);
        set({ recommendedEvents: [], isLoadingRecommendedEvents: false });
      }
    } catch (error) {
      console.error('Önerilen etkinlikleri getirirken hata oluştu:', error);
      set({ 
        recommendedEventsError: 'Önerilen etkinlikler yüklenirken hata oluştu', 
        isLoadingRecommendedEvents: false,
        recommendedEvents: [] // Hata durumunda boş dizi
      });
    }
  },
  
  // Yakındaki etkinlikleri getir - eventStore'u kullanarak
  fetchNearbyEvents: async (params: { latitude: number; longitude: number; radius: number }) => {
    set({ isLoadingNearbyEvents: true, nearbyEventsError: null });
    try {
      // EventStore'un fetchNearbyEvents metodunu çağır
      const eventStore = useEventStore.getState();
      await eventStore.fetchNearbyEvents(params);
      
      // Yükleme durumu ve hatalarını güncelle
      set({ 
        isLoadingNearbyEvents: false,
        nearbyEventsError: eventStore.error
      });
    } catch (error) {
      console.error('Yakındaki etkinlikleri getirirken hata oluştu:', error);
      set({ 
        nearbyEventsError: error instanceof Error ? error.message : 'Yakındaki etkinlikler yüklenirken hata oluştu', 
        isLoadingNearbyEvents: false 
      });
    }
  },
  
  // Haberleri getir
  fetchNews: async () => {
    set({ isLoadingNews: true, newsError: null });
    try {
      const response = await newsService.getNews({ page: 1, limit: 5 });
      
      if (response.data) {
        const newsData = Array.isArray(response.data) ? response.data : 
                        (response.data.news ? response.data.news : []);
        
        set({ news: newsData, isLoadingNews: false });
      } else {
        set({ news: [], isLoadingNews: false });
      }
    } catch (error) {
      console.error('Haberleri getirirken hata oluştu:', error);
      set({ 
        newsError: error instanceof Error ? error.message : 'Haberler yüklenirken bir hata oluştu', 
        isLoadingNews: false,
        news: [] // Hata durumunda boş dizi
      });
    }
  },
  
  // Spor dallarını getir
  fetchSports: async () => {
    set({ isLoadingSports: true, sportsError: null });
    try {
      const response = await sportsService.getAllSports();
      
      if (response.data) {
        // Yanıt yapısını kontrol et ve sports dizisini al
        const sportsData = Array.isArray(response.data) ? response.data : 
                         (response.data.sports ? response.data.sports : []);
        
        set({ sports: sportsData, isLoadingSports: false });
      } else {
        set({ sports: [], isLoadingSports: false });
      }
    } catch (error) {
      console.error('Spor dallarını getirirken hata oluştu:', error);
      set({ 
        sportsError: error instanceof Error ? error.message : 'Spor dalları yüklenirken bir hata oluştu', 
        isLoadingSports: false,
        sports: [] // Hata durumunda boş dizi
      });
    }
  },
  
  // Duyuruları getir
  fetchAnnouncements: async () => {
    set({ isLoadingAnnouncements: true, announcementsError: null });
    try {
      const response = await announcementService.getAnnouncements({ 
        page: 1, 
        limit: 10,
        includeUnpublished: false
      });
      
      
      // API yanıt yapısını kontrol et
      if (response && response.success && response.data) {
        // İki olası yanıt yapısını kontrol et:
        // 1. data.announcements (dizi olarak çoklu duyuru)
        // 2. data (doğrudan dizi olarak duyurular)
        
        if (response.data.announcements && Array.isArray(response.data.announcements)) {
          // Çoklu duyuru durumu (dizi)
          const announcements = response.data.announcements;
          
          set({ 
            announcements: announcements, 
            isLoadingAnnouncements: false 
          });
        } 
        else if (Array.isArray(response.data)) {
          // Data doğrudan dizi ise
          set({ 
            announcements: response.data, 
            isLoadingAnnouncements: false 
          });
        }
        // Tek duyuru durumunu daha güvenli bir şekilde kontrol et
        else if (typeof response.data === 'object' && response.data !== null) {
          try {
            // API'den duyuru-benzeri bir obje gelmiş olabilir, güvenli şekilde dönüştürme yap
            const singleAnnouncement = response.data as unknown as Announcement;
            
            if (singleAnnouncement.id) {
              
              // Tek duyuruyu dizi içine koyarak state'e aktar
              set({ 
                announcements: [singleAnnouncement], 
                isLoadingAnnouncements: false 
              });
            } else {
              throw new Error('Geçersiz duyuru verileri');
            }
          } catch (formatError) {
            console.error('Duyuru verisi dönüştürme hatası:', formatError);
            set({ 
              announcements: [],
              announcementsError: 'Duyuru verileri uyumsuz formatta',
              isLoadingAnnouncements: false 
            });
          }
        }
        else {
          console.error('API yanıt yapısı beklenen formatta değil:', response);
          set({ 
            announcementsError: 'Duyuru verileri beklenmeyen formatta', 
            isLoadingAnnouncements: false,
            announcements: [] // Boş dizi ile güncelle
          });
        }
      } else {
        console.error('API yanıtı başarısız veya veri içermiyor:', response);
        set({ 
          announcementsError: response?.message || 'Duyurular alınamadı', 
          isLoadingAnnouncements: false,
          announcements: [] // Boş dizi ile güncelle
        });
      }
    } catch (error) {
      console.error('Duyuruları getirirken hata oluştu:', error);
      set({ 
        announcementsError: error instanceof Error ? error.message : 'Duyurular yüklenirken bir hata oluştu', 
        isLoadingAnnouncements: false,
        announcements: [] // Boş dizi ile güncelle
      });
    }
  },
  
  // Tüm verileri yenile
  refreshAll: async () => {
    const { 
      fetchUpcomingEvents, 
      fetchRecommendedEvents, 
      fetchNews, 
      fetchSports, 
      fetchAnnouncements,
      fetchNearbyEvents
    } = get();
    
    const fetchData = async () => {
      await Promise.all([
        fetchUpcomingEvents(),
        fetchRecommendedEvents(),
        fetchNews(),
        fetchSports(),
        fetchAnnouncements()
      ]);
      
      try {
        // Konum bilgisini maps store'dan al
        const lastLocation = useMapsStore.getState().lastLocation;
        if (lastLocation) {
          await fetchNearbyEvents({ 
            latitude: lastLocation.latitude, 
            longitude: lastLocation.longitude, 
            radius: 10 
          });
        } else {
        }
      } catch (error) {
      }
    };
    
    await fetchData();
  }
}));

