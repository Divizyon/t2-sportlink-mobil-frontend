import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DistanceResult, BulkDistanceResults, mapsApi } from '../../api/maps/mapsApi';
import { useApiStore } from './apiStore';
import { useProfileStore } from '../userStore/profileStore';
import * as Location from 'expo-location';

interface MapsState {
  // Son konum bilgisi
  lastLocation: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: number; // Son güncellenme zamanı
  } | null;
  
  // Konum durumu
  locationStatus: 'unavailable' | 'permission_denied' | 'success' | 'error' | 'loading' | 'not_initialized';
  locationError: string | null;
  
  // Konum ayarları
  defaultSearchRadius: number; // Varsayılan arama yarıçapı (km)
  
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
  initLocation: () => Promise<void>; // Konumu ilk kez başlat
  refreshLocation: () => Promise<void>; // Konumu elle yenile
  setLastLocation: (latitude: number, longitude: number, address?: string) => void;
  getLastLocation: () => Promise<{latitude: number, longitude: number, address?: string} | null>; // Konum bilgisini getir
  shouldRefreshLocation: () => boolean; // Konumun yenilenmesi gerekiyor mu?
  calculateDistance: (origin: string, destination: string, mode?: string) => Promise<DistanceResult | null>;
  calculateBulkDistances: (origin: string, destinations: string[], mode?: string) => Promise<BulkDistanceResults | null>;
  clearDistanceCache: () => void;
  clearErrors: () => void;
}

// Konum yenileme eşik değerleri
const LOCATION_REFRESH_THRESHOLD_MS = 10 * 60 * 1000; // 10 dakika

// İki konum arasındaki mesafeyi hesapla (Haversine formülü)
const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

// Dereceyi radyana çevir
const toRad = (deg: number): number => {
  return deg * Math.PI / 180;
};

// Önbellek anahtarı oluşturucu
const getCacheKey = (origin: string, destination: string, mode: string = 'driving'): string => {
  return `${origin}|${destination}|${mode}`;
};

export const useMapsStore = create<MapsState>()(
  persist(
    (set, get) => ({
      lastLocation: null,
      locationStatus: 'not_initialized',
      locationError: null,
      defaultSearchRadius: 10, // 10 km varsayılan arama yarıçapı
      distanceCache: {},
      isCalculatingDistance: false,
      isCalculatingBulkDistances: false,
      distanceError: null,
      bulkDistanceError: null,
      lastCalculatedDistance: null,
      lastCalculatedBulkDistances: null,
      
      // Uygulamanın başlangıcında konum bilgisini başlat
      initLocation: async () => {
        set({ locationStatus: 'loading' });
        
        try {
          // Önce izin kontrolü
          const { status } = await Location.requestForegroundPermissionsAsync();
          
          if (status !== 'granted') {
            console.log('Konum izni verilmedi, ProfileStore varsayılan konumu kullanılacak');
            set({ locationStatus: 'permission_denied' });
            
            // Izin yoksa ProfileStore'dan varsayılan konumu al
            const profileStore = useProfileStore.getState();
            const defaultLocation = profileStore.defaultLocation;
            
            if (defaultLocation) {
              console.log('ProfileStore varsayılan konumu kullanılıyor');
              set({
                lastLocation: {
                  latitude: defaultLocation.latitude,
                  longitude: defaultLocation.longitude,
                  address: defaultLocation.locationName,
                  timestamp: Date.now()
                },
                locationStatus: 'success'
              });
              return;
            } else {
              console.log('Varsayılan konum bulunamadı, konum kullanılamıyor');
              set({ locationStatus: 'unavailable' });
              return;
            }
          }
          
          // Konum izni verildi, konumu al
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          
          // Adres bilgisini almaya çalış
          let address: string | undefined = undefined;
          try {
            const addressResponse = await Location.reverseGeocodeAsync({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            });
            
            if (addressResponse && addressResponse.length > 0) {
              const addressData = addressResponse[0];
              address = `${addressData.street || ''} ${addressData.name || ''}, ${addressData.district || ''}, ${addressData.city || ''}`.trim();
            }
          } catch (error) {
            console.error('Adres bulunamadı:', error);
          }
          
          // Konum bilgisini kaydet
          set({
            lastLocation: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              address,
              timestamp: Date.now()
            },
            locationStatus: 'success',
            locationError: null
          });
          
          console.log('Konum başarıyla alındı');
        } catch (error) {
          console.error('Konum alınamadı:', error);
          
          set({ 
            locationStatus: 'error',
            locationError: error instanceof Error ? error.message : 'Konum alınırken bir hata oluştu'
          });
          
          // Hata durumunda ProfileStore'dan varsayılan konumu almayı dene
          try {
            const profileStore = useProfileStore.getState();
            const defaultLocation = profileStore.defaultLocation;
            
            if (defaultLocation) {
              console.log('Hata durumunda ProfileStore varsayılan konumu kullanılıyor');
              set({
                lastLocation: {
                  latitude: defaultLocation.latitude,
                  longitude: defaultLocation.longitude,
                  address: defaultLocation.locationName,
                  timestamp: Date.now()
                },
                locationStatus: 'success'
              });
            }
          } catch (fallbackError) {
            console.error('Yedek konum da alınamadı:', fallbackError);
          }
        }
      },
      
      // Konumu elle yenile
      refreshLocation: async () => {
        const currentState = get();
        
        // Zaten yükleme durumundaysa tekrar çağırma
        if (currentState.locationStatus === 'loading') {
          return;
        }
        
        set({ locationStatus: 'loading' });
        
        try {
          // Konum izni kontrolü
          const { status } = await Location.getForegroundPermissionsAsync();
          
          if (status !== 'granted') {
            set({ locationStatus: 'permission_denied' });
            return;
          }
          
          // Konumu al
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          
          // Adres bilgisini almaya çalış
          let address = currentState.lastLocation?.address;
          try {
            const addressResponse = await Location.reverseGeocodeAsync({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            });
            
            if (addressResponse && addressResponse.length > 0) {
              const addressData = addressResponse[0];
              address = `${addressData.street || ''} ${addressData.name || ''}, ${addressData.district || ''}, ${addressData.city || ''}`.trim();
            }
          } catch (error) {
            console.error('Adres bulunamadı:', error);
          }
          
          // Konum bilgisini kaydet
          set({
            lastLocation: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              address,
              timestamp: Date.now()
            },
            locationStatus: 'success',
            locationError: null
          });
        } catch (error) {
          console.error('Konum yenilenirken hata:', error);
          
          set({ 
            locationStatus: 'error',
            locationError: error instanceof Error ? error.message : 'Konum yenilenirken bir hata oluştu'
          });
        }
      },
      
      // Konum bilgisini manuel olarak ayarla (örn. varsayılan konumdan veya simülasyon için)
      setLastLocation: (latitude, longitude, address) => {
        set({
          lastLocation: {
            latitude,
            longitude,
            address,
            timestamp: Date.now()
          },
          locationStatus: 'success'
        });
      },
      
      // Konum bilgisini güvenli şekilde getir
      getLastLocation: async () => {
        const state = get();
        
        // Mevcut konum varsa ve güncel ise kullan
        if (state.lastLocation && !get().shouldRefreshLocation()) {
          return {
            latitude: state.lastLocation.latitude,
            longitude: state.lastLocation.longitude,
            address: state.lastLocation.address
          };
        }
        
        // Konum yoksa veya güncel değilse yenileme işlemi başlat
        if (state.locationStatus !== 'loading') {
          await get().refreshLocation();
        }
        
        // Yenileme sonrası konum kontrolü
        const updatedState = get();
        
        if (updatedState.lastLocation) {
          return {
            latitude: updatedState.lastLocation.latitude,
            longitude: updatedState.lastLocation.longitude,
            address: updatedState.lastLocation.address
          };
        }
        
        return null;
      },
      
      // Konumun yenilenmesi gerekiyor mu kontrol et
      shouldRefreshLocation: () => {
        const state = get();
        
        // Konum yoksa yenileme gerekli
        if (!state.lastLocation) {
          return true;
        }
        
        // Son güncellemeden bu yana geçen süre
        const timeSinceLastUpdate = Date.now() - state.lastLocation.timestamp;
        
        // Eşik değerinden fazla süre geçtiyse yenileme gerekli
        return timeSinceLastUpdate > LOCATION_REFRESH_THRESHOLD_MS;
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
        set({ distanceError: null, bulkDistanceError: null, locationError: null });
      }
    }),
    {
      name: 'maps-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastLocation: state.lastLocation,
        distanceCache: state.distanceCache,
        defaultSearchRadius: state.defaultSearchRadius,
      }),
    }
  )
); 