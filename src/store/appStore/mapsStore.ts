import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DistanceResult, BulkDistanceResults, mapsApi } from '../../api/maps/mapsApi';
import { useApiStore } from './apiStore';

interface MapsState {
  // Son konum bilgisi
  lastLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  
  // Hesaplanan uzaklık verileri önbelleği
  distanceCache: Record<string, DistanceResult>;
  
  // Yükleme durumları
  isCalculatingDistance: boolean;
  isCalculatingBulkDistances: boolean;
  
  // Hata durumları
  distanceError: string | null;
  bulkDistanceError: string | null;
  
  // Son hesaplanan uzaklıklar
  lastCalculatedDistance: DistanceResult | null;
  lastCalculatedBulkDistances: BulkDistanceResults | null;
  
  // İşlem fonksiyonları
  setLastLocation: (latitude: number, longitude: number, address?: string) => void;
  calculateDistance: (origin: string, destination: string, mode?: string) => Promise<DistanceResult | null>;
  calculateBulkDistances: (origin: string, destinations: string[], mode?: string) => Promise<BulkDistanceResults | null>;
  clearDistanceCache: () => void;
  clearErrors: () => void;
}

// Önbellek anahtarı oluşturucu
const getCacheKey = (origin: string, destination: string, mode: string = 'driving'): string => {
  return `${origin}|${destination}|${mode}`;
};

export const useMapsStore = create<MapsState>()(
  persist(
    (set, get) => ({
      lastLocation: null,
      distanceCache: {},
      isCalculatingDistance: false,
      isCalculatingBulkDistances: false,
      distanceError: null,
      bulkDistanceError: null,
      lastCalculatedDistance: null,
      lastCalculatedBulkDistances: null,
      
      setLastLocation: (latitude, longitude, address) => {
        set({
          lastLocation: {
            latitude,
            longitude,
            address,
          },
        });
      },
      
      calculateDistance: async (origin, destination, mode = 'driving') => {
        set({ isCalculatingDistance: true, distanceError: null });
        
        try {
          // Önbellekte bu mesafe var mı kontrol et
          const cacheKey = getCacheKey(origin, destination, mode);
          const cachedResult = get().distanceCache[cacheKey];
          
          if (cachedResult) {
            set({ 
              lastCalculatedDistance: cachedResult,
              isCalculatingDistance: false 
            });
            return cachedResult;
          }
          
          // API çağrısı yap
          const response = await mapsApi.getDistance(origin, destination, mode);
          const result = response.data;
          
          // Sonucu önbelleğe ekle
          const updatedCache = { ...get().distanceCache };
          updatedCache[cacheKey] = result;
          
          set({
            distanceCache: updatedCache,
            lastCalculatedDistance: result,
            isCalculatingDistance: false
          });
          
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Mesafe hesaplanırken bir hata oluştu';
          set({ 
            distanceError: errorMessage,
            isCalculatingDistance: false 
          });
          
          useApiStore.getState().setGlobalError(errorMessage);
          return null;
        }
      },
      
      calculateBulkDistances: async (origin, destinations, mode = 'driving') => {
        set({ isCalculatingBulkDistances: true, bulkDistanceError: null });
        
        try {
          // Önbellekteki değerleri kontrol etme algoritması daha karmaşık olabilir
          // Bu örnekte basit bir yaklaşım kullanıyoruz
          
          // API çağrısı yap
          const response = await mapsApi.getBulkDistances(origin, destinations, mode);
          const result = response.data;
          
          // Sonuçları önbelleğe ekle (her bir bireysel mesafe için)
          const updatedCache = { ...get().distanceCache };
          
          if (result.results && Array.isArray(result.results)) {
            result.results.forEach(distanceResult => {
              const cacheKey = getCacheKey(distanceResult.origin, distanceResult.destination, mode);
              updatedCache[cacheKey] = distanceResult;
            });
          }
          
          set({
            distanceCache: updatedCache,
            lastCalculatedBulkDistances: result,
            isCalculatingBulkDistances: false
          });
          
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Toplu mesafe hesaplanırken bir hata oluştu';
          set({ 
            bulkDistanceError: errorMessage, 
            isCalculatingBulkDistances: false 
          });
          
          useApiStore.getState().setGlobalError(errorMessage);
          return null;
        }
      },
      
      clearDistanceCache: () => {
        set({ distanceCache: {} });
      },
      
      clearErrors: () => {
        set({ distanceError: null, bulkDistanceError: null });
      }
    }),
    {
      name: 'maps-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastLocation: state.lastLocation,
        distanceCache: state.distanceCache,
      }),
    }
  )
); 