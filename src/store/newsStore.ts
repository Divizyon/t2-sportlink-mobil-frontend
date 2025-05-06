import { create } from 'zustand';
import { Alert } from 'react-native';
import { News, Sport, NewsListResponse, NewsResponse, SportsListResponse, NewsData } from '../types/apiTypes/api.types';
import newsService from '../api/news/newsService';
import sportsService from '../api/sports/sportsService';
import { getConfigValues } from './appStore/configStore';

// News Store için type tanımları
interface NewsState {
  news: News[];
  filteredNews: News[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMorePages: boolean;
  currentPage: number;
  error: string | null;
  sportCategories: Sport[];
  selectedSportId: string;

  // API istekleri için metodlar
  fetchAllNews: (page?: number, limit?: number) => Promise<void>;
  fetchNewsBySport: (sportId: string) => Promise<void>;
  fetchNewsDetail: (newsId: string) => Promise<News | null>;
  refreshNews: () => Promise<void>;
  loadMoreNews: () => Promise<void>;
  filterNewsBySport: (sportId: string) => void;
  fetchSportCategories: () => Promise<void>;
}

// Zustand store oluşturuyoruz
export const useNewsStore = create<NewsState>((set, get) => ({
  news: [],
  filteredNews: [],
  isLoading: false,
  isRefreshing: false,
  hasMorePages: true,
  currentPage: 1,
  error: null,
  sportCategories: [],
  selectedSportId: 'all',

  // Spor kategorilerini getir
  fetchSportCategories: async () => {
    try {
      const response: SportsListResponse = await sportsService.getAllSports();
      
      if (response && response.success && response.data && response.data.sports) {
        // Tümü kategorisini ekleyerek başlayalım
        const allCategory = { id: 'all', name: 'Tümü', description: '', icon_url: '', created_at: '', updated_at: '' };
        set({ sportCategories: [allCategory, ...response.data.sports] });
      } else {
        console.error('Spor kategorileri beklendiği gibi değil:', response);
      }
    } catch (error) {
      console.error('Spor kategorileri alınırken hata oluştu:', error);
    }
  },

  // Tüm haberleri getir
  fetchAllNews: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: page === 1, error: null });
      
      const response: any = await newsService.getNews({ page, limit });
      console.log('Alınan API yanıtı:', JSON.stringify(response));
      
      // API yanıtından haber verilerini çıkar - esnek bir yaklaşım
      let newsItems: News[] = [];
      let paginationInfo = null;
      
      if (response) {
        // API yanıtı direkt bir haber listesi olabilir
        if (Array.isArray(response)) {
          newsItems = response;
        }
        // Data içinde news dizisi olabilir
        else if (response.data && Array.isArray(response.data)) {
          newsItems = response.data;
        }
        else if (response.data && response.data.news && Array.isArray(response.data.news)) {
          newsItems = response.data.news;
        }
        
        // Pagination bilgisini bul
        if (response.pagination) {
          paginationInfo = response.pagination;
        }
        else if (response.data && response.data.pagination) {
          paginationInfo = response.data.pagination;
        }
      }
      
      // Pagination bilgisi yoksa varsayılan değer kullan
      const defaultPagination = {
        page: page,
        totalPages: page + 1, // Daha fazla veri var olarak varsay
        limit: limit,
        total: newsItems.length
      };
      
      const pagination = paginationInfo || defaultPagination;
      
      if (newsItems.length > 0) {
        if (page === 1) {
          set({ 
            news: newsItems, 
            filteredNews: newsItems,
            hasMorePages: pagination.page < pagination.totalPages,
            currentPage: pagination.page
          });
        } else {
          set(state => ({ 
            news: [...state.news, ...newsItems],
            filteredNews: [...state.filteredNews, ...newsItems],
            hasMorePages: pagination.page < pagination.totalPages,
            currentPage: pagination.page
          }));
        }
      } else {
        console.warn('API yanıtından haber öğeleri alınamadı:', response);
        if (page === 1) {
          // İlk sayfa için boş liste ile başla
          set({ 
            news: [], 
            filteredNews: [],
            hasMorePages: false,
            currentPage: 1
          });
        }
      }
      
      set({ isLoading: false, isRefreshing: false });
    } catch (error) {
      console.error('Haberler alınırken hata oluştu:', error);
      set({ 
        isLoading: false, 
        isRefreshing: false,
        error: 'Haberler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.'
      });
    }
  },

  // Spor kategorisine göre haberleri getir
  fetchNewsBySport: async (sportId) => {
    try {
      if (sportId === 'all') {
        // Tüm haberleri getir
        return get().fetchAllNews();
      }
      
      set({ isLoading: true, error: null });
      
      const response: any = await newsService.getNewsBySport(sportId, { page: 1, limit: 20 });
      console.log('Spora göre API yanıtı:', JSON.stringify(response));
      
      // API yanıtından haber verilerini çıkar - esnek bir yaklaşım
      let newsItems: News[] = [];
      let paginationInfo = null;
      
      if (response) {
        // API yanıtı direkt bir haber listesi olabilir
        if (Array.isArray(response)) {
          newsItems = response;
        }
        // Data içinde news dizisi olabilir
        else if (response.data && Array.isArray(response.data)) {
          newsItems = response.data;
        }
        else if (response.data && response.data.news && Array.isArray(response.data.news)) {
          newsItems = response.data.news;
        }
        
        // Pagination bilgisini bul
        if (response.pagination) {
          paginationInfo = response.pagination;
        }
        else if (response.data && response.data.pagination) {
          paginationInfo = response.data.pagination;
        }
      }
      
      // Pagination bilgisi yoksa varsayılan değer kullan
      const defaultPagination = {
        page: 1,
        totalPages: 2, // Daha fazla veri var olarak varsay
        limit: 20,
        total: newsItems.length
      };
      
      const pagination = paginationInfo || defaultPagination;
      
      if (newsItems.length > 0) {
        set({ 
          news: newsItems, 
          filteredNews: newsItems,
          hasMorePages: pagination.page < pagination.totalPages,
          currentPage: pagination.page,
          selectedSportId: sportId
        });
      } else {
        console.warn('API yanıtından haber öğeleri alınamadı:', response);
        set({ 
          news: [], 
          filteredNews: [],
          hasMorePages: false,
          currentPage: 1,
          selectedSportId: sportId
        });
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Spor haberler alınırken hata oluştu:', error);
      set({ 
        isLoading: false,
        error: 'Haberler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.'
      });
    }
  },

  // Haber detayını getir
  fetchNewsDetail: async (newsId) => {
    try {
      const response: NewsResponse = await newsService.getNewsDetail(newsId);
      
      if (response && response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Haber detayı alınırken hata oluştu:', error);
      Alert.alert('Hata', 'Haber detayı yüklenemedi. Lütfen tekrar deneyin.');
      return null;
    }
  },

  // Yenileme fonksiyonu
  refreshNews: async () => {
    set({ isRefreshing: true });
    get().fetchAllNews(1, 10);
  },

  // Daha fazla haber yükle
  loadMoreNews: async () => {
    const { hasMorePages, isLoading, currentPage } = get();
    
    if (!hasMorePages || isLoading) return;
    
    get().fetchAllNews(currentPage + 1, 10);
  },

  // Kategori filtresi
  filterNewsBySport: (sportId) => {
    set({ selectedSportId: sportId });
    get().fetchNewsBySport(sportId);
  }
})); 