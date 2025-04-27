import { create } from 'zustand';
import eventService from '../../api/events/eventService';
import newsService from '../../api/news/newsService';
import sportsService from '../../api/sports/sportsService';
import announcementService from '../../api/announcements/announcementService';
import { Event } from '../../types/eventTypes/event.types';
import { News, Sport, Announcement } from '../../types/apiTypes/api.types';
import { useEventStore } from '../eventStore/eventStore';

interface HomeStoreState {
  // Veriler
  upcomingEvents: Event[];
  recommendedEvents: Event[];
  nearbyEvents: Event[];
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
  nearbyEvents: [],
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
        const upcomingEvents = response.data.filter(event => 
          new Date(event.event_date) >= new Date(today)
        );
        
        set({ upcomingEvents, isLoadingUpcomingEvents: false });
      } catch (backupError) {
        console.error('Yedek yaklaşan etkinlikleri getirirken hata oluştu:', backupError);
        set({ 
          upcomingEventsError: 'Yaklaşan etkinlikler yüklenirken hata oluştu', 
          isLoadingUpcomingEvents: false 
        });
      }
    }
  },
  
  // Önerilen etkinlikleri getir
  fetchRecommendedEvents: async () => {
    set({ isLoadingRecommendedEvents: true, recommendedEventsError: null });
    try {
      // EventStore'un recommended etkinliklerini kullan
      const eventStore = useEventStore.getState();
      
      // EventStore'da önerilen etkinlikler yoksa, önce verileri yükle
      if (eventStore.recommendedEvents.length === 0) {
        await eventStore.fetchRecommendedEvents();
      }
      
      const recommendedEvents = useEventStore.getState().recommendedEvents;
      set({ recommendedEvents, isLoadingRecommendedEvents: false });
    } catch (error) {
      console.error('Önerilen etkinlikleri getirirken hata oluştu:', error);
      set({ 
        recommendedEventsError: 'Önerilen etkinlikler yüklenirken hata oluştu', 
        isLoadingRecommendedEvents: false 
      });
      
      // Yedek olarak direkt API'den çekme yöntemine geri dön
      try {
        const response = await eventService.getRecommendedEvents();
        set({ recommendedEvents: response.data, isLoadingRecommendedEvents: false });
      } catch (backupError) {
        console.error('Yedek önerilen etkinlikleri getirirken hata oluştu:', backupError);
        set({ 
          recommendedEventsError: 'Önerilen etkinlikler yüklenirken hata oluştu', 
          isLoadingRecommendedEvents: false 
        });
      }
    }
  },
  
  // Yakındaki etkinlikleri getir
  fetchNearbyEvents: async (params: { latitude: number; longitude: number; radius: number }) => {
    set({ isLoadingNearbyEvents: true, nearbyEventsError: null });
    try {
      // EventStore'un nearby etkinliklerini kullan
      const eventStore = useEventStore.getState();
      
      // EventStore'da yakındaki etkinlikler yoksa, önce verileri yükle
      if (eventStore.nearbyEvents.length === 0) {
        await eventStore.fetchNearbyEvents(params);
      }
      
      const nearbyEvents = useEventStore.getState().nearbyEvents;
      set({ nearbyEvents, isLoadingNearbyEvents: false });
    } catch (error) {
      console.error('Yakındaki etkinlikleri getirirken hata oluştu:', error);
      set({ 
        nearbyEventsError: 'Yakındaki etkinlikler yüklenirken hata oluştu', 
        isLoadingNearbyEvents: false 
      });
      
      // Yedek olarak direkt API'den çekme yöntemine geri dön
      try {
        const response = await eventService.getNearbyEvents(params);
        set({ nearbyEvents: response.data.events, isLoadingNearbyEvents: false });
      } catch (backupError) {
        console.error('Yedek yakındaki etkinlikleri getirirken hata oluştu:', backupError);
        set({ 
          nearbyEventsError: 'Yakındaki etkinlikler yüklenirken hata oluştu', 
          isLoadingNearbyEvents: false 
        });
      }
    }
  },
  
  // Haberleri getir
  fetchNews: async () => {
    set({ isLoadingNews: true, newsError: null });
    try {
      const response = await newsService.getNews({ page: 1, limit: 5 });
      
      if (response.data && response.data.length > 0) {
        console.log('Haber verileri başarıyla alındı:', response.data.length);
        set({ news: response.data, isLoadingNews: false });
      } else {
        console.log('API\'den haber verisi gelmedi, mock veri kullanılıyor');
        // API'den veri gelmezse mock verileri kullan
      }
    } catch (error) {
      console.error('Haberleri getirirken hata oluştu:', error);
      // Hata durumunda mock verileri kullan
      console.log('Hata durumunda mock haber verileri kullanılıyor');
     
    }
  },
  
  // Spor dallarını getir
  fetchSports: async () => {
    set({ isLoadingSports: true, sportsError: null });
    try {
      const response = await sportsService.getAllSports();
      
      if (response.data && response.data.length > 0) {
        console.log('Spor kategorileri başarıyla alındı:', response.data.length);
        set({ sports: response.data, isLoadingSports: false });
      } else {
        console.log('API\'den spor kategori verisi gelmedi, mock veri kullanılıyor');
        // API'den veri gelmezse mock verileri kullan
      }
    } catch (error) {
      console.error('Spor dallarını getirirken hata oluştu:', error);
      // Hata durumunda mock verileri kullan
      console.log('Hata durumunda mock spor kategorileri kullanılıyor');
    
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
      
      console.log('Announcements API yanıtı alındı, işleniyor...');
      
      // API yanıt yapısını kontrol et
      if (response && response.success && response.data) {
        // Doğru API yanıt yapısı: response.data.announcements şeklinde bir dizi
        if (response.data.announcements && Array.isArray(response.data.announcements)) {
          const announcements = response.data.announcements;
          console.log('Duyurular başarıyla yüklendi:', announcements.length);
          
          set({ 
            announcements: announcements, 
            isLoadingAnnouncements: false 
          });
        } else {
          console.error('API yanıt yapısı beklenen formatta değil:', response);
          set({ 
            announcementsError: 'Duyuru verileri beklenmeyen formatta', 
            isLoadingAnnouncements: false 
          });
        }
      } else {
        console.error('API yanıtı başarısız veya veri içermiyor:', response);
        set({ 
          announcementsError: response.message || 'Duyurular alınamadı', 
          isLoadingAnnouncements: false 
        });
      }
    } catch (error) {
      console.error('Duyuruları getirirken hata oluştu:', error);
      set({ 
        announcementsError: error instanceof Error ? error.message : 'Duyurular yüklenirken bir hata oluştu', 
        isLoadingAnnouncements: false 
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
      fetchAnnouncements 
    } = get();
    
    // Konum bilgisi varsa yakındaki etkinlikleri de getir
    const fetchData = async () => {
      await Promise.all([
        fetchUpcomingEvents(),
        fetchRecommendedEvents(),
        fetchNews(),
        fetchSports(),
        fetchAnnouncements()
      ]);
      
      try {
        // Burada cihazın konum bilgisi alınıyor olsaydı
        // API çağrısını yapacaktık, konum bilgisi mock olarak verildi
        const { fetchNearbyEvents } = get();
        await fetchNearbyEvents({ 
          latitude: 41.0082, 
          longitude: 28.9784, 
          radius: 10 
        });
      } catch (error) {
        console.error('Konum erişiminde hata:', error);
      }
    };
    
    await fetchData();
  }
}));

