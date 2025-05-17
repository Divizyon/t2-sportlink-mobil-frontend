import { create } from 'zustand';
import { useEventStore } from '../eventStore/eventStore';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { DistanceResult, BulkDistanceResults } from '../../api/maps/mapsApi';
import Constants from 'expo-constants';

const GOOGLE_DISTANCE_API_KEY = Constants.expoConfig?.extra?.GOOGLE_DISTANCE_API_KEY ;

// Kuş uçuşu mesafe hesaplama fonksiyonu
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

// Konum tipi
interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapsState {
  lastLocation: LocationData | null;
  isLocationServiceEnabled: boolean;
  locationPermissionStatus: Location.PermissionStatus;
  // Google API anahtarını saklama
  googleApiKey: string;
  // Mesafe hesaplama ile ilgili state özellikleri
  isCalculatingDistance: boolean;
  distanceError: string | null;
  lastCalculatedDistance: DistanceResult | null;
  // Toplu mesafe hesaplama ile ilgili state özellikleri
  isCalculatingBulkDistances: boolean;
  bulkDistanceError: string | null;
  lastCalculatedBulkDistances: BulkDistanceResults | null;
  // Metotlar
  setLastLocation: (latitude: number, longitude: number, address?: string) => void;
  setLocationServiceStatus: (isEnabled: boolean) => void;
  setLocationPermissionStatus: (status: Location.PermissionStatus) => void;
  initLocation: () => Promise<LocationData | null>;
  // Google Distance Matrix API ile mesafe hesaplama
  calculateDistance: (origin: string, destination: string, mode?: 'driving' | 'walking' | 'bicycling' | 'transit') => Promise<DistanceResult | null>;
  calculateBulkDistances: (origin: string, destinations: string[], mode?: 'driving' | 'walking' | 'bicycling' | 'transit') => Promise<BulkDistanceResults | null>;
  setGoogleApiKey: (apiKey: string) => void;
}

export const useMapsStore = create<MapsState>((set, get) => ({
  lastLocation: null,
  isLocationServiceEnabled: false,
  locationPermissionStatus: Location.PermissionStatus.UNDETERMINED,
  googleApiKey: GOOGLE_DISTANCE_API_KEY,
  isCalculatingDistance: false,
  distanceError: null,
  lastCalculatedDistance: null,
  isCalculatingBulkDistances: false,
  bulkDistanceError: null,
  lastCalculatedBulkDistances: null,
  
  // Konum bilgisini güncelle ve gerekirse yakındaki etkinlikleri yeniden yükle
  setLastLocation: (latitude: number, longitude: number, address?: string) => {
    // Önceki konumu al
    const previousLocation = get().lastLocation;
    
    if (!previousLocation) {
    } else {
      // Önceki ve yeni konum arasındaki mesafeyi hesapla
      const distanceFromPrevious = calculateHaversineDistance(
        latitude,
        longitude,
        previousLocation.latitude,
        previousLocation.longitude
      );
      
    }
    
    // Konum değişimi önemli mi kontrol et (100m'den fazla değişim varsa)
    const shouldRefreshNearbyEvents = !previousLocation || calculateHaversineDistance(
      latitude,
      longitude,
      previousLocation.latitude,
      previousLocation.longitude
    ) > 0.1; // 100m = 0.1km
    
    // Yeni konum bilgisini kaydet
          set({
            lastLocation: {
        latitude,
        longitude,
        address: address || previousLocation?.address || ''
      }
    });
    
    // Konum değişimi önemliyse yakındaki etkinlikleri yenile
    if (shouldRefreshNearbyEvents) {
          
      // Önbelleği temizle ve yakındaki etkinlikleri yeniden getir
      const eventStore = useEventStore.getState();
      eventStore.clearNearbyEventsCache();
      
      eventStore.fetchNearbyEvents({
        latitude,
        longitude,
        radius: 10 // 10km yarıçapında
      });
    } else if (previousLocation) {
    }
  },
  
  setLocationServiceStatus: (isEnabled: boolean) => {
    set({ isLocationServiceEnabled: isEnabled });
  },
  
  setLocationPermissionStatus: (status: Location.PermissionStatus) => {
    set({ locationPermissionStatus: status });
      },
      
  // Konum başlatma ve izinleri alma
  initLocation: async () => {
    try {
      // Konum servislerinin açık olup olmadığını kontrol et
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      get().setLocationServiceStatus(serviceEnabled);
      
      if (!serviceEnabled) {
        return null;
      }
      
      // Konum izinlerini iste
      const { status } = await Location.requestForegroundPermissionsAsync();
      get().setLocationPermissionStatus(status);
          
      if (status !== Location.PermissionStatus.GRANTED) {
        return null;
          }
          
      // Mevcut konumu al
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          
          // Adres bilgisini almaya çalış
      let addressStr = '';
          try {
            const addressResponse = await Location.reverseGeocodeAsync({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            });
            
            if (addressResponse && addressResponse.length > 0) {
          const address = addressResponse[0];
          addressStr = `${address.street || ''} ${address.name || ''}, ${address.district || ''}, ${address.city || ''}`;
            }
      } catch (geocodeError) {
          }
          
      // Konum bilgisini store'a kaydet
      get().setLastLocation(
        location.coords.latitude,
        location.coords.longitude,
        addressStr
      );
      

      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: addressStr
      };
        } catch (error) {
      return null;
        }
      },
      
  // API anahtarını ayarla
  setGoogleApiKey: (apiKey: string) => {
    set({ googleApiKey: apiKey });
      },
      
  // Google Distance Matrix API ile mesafe hesapla
  calculateDistance: async (origin, destination, mode = 'driving') => {
    const apiKey = get().googleApiKey;
        
    if (!apiKey) {
      set({ distanceError: 'API anahtarı bulunamadı' });
      return null;
    }
    
    
    // Hesaplama başladığında durumu güncelle
    set({ 
      isCalculatingDistance: true, 
      distanceError: null 
    });
    
    try {
      // Google Distance Matrix API URL
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=${mode}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      
      // API yanıtını kontrol et
      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const result: DistanceResult = {
          origin: origin,
          destination: destination,
          distance: data.rows[0].elements[0].distance,
          duration: data.rows[0].elements[0].duration,
          status: data.rows[0].elements[0].status
        };
        
        // Başarılı sonucu state'e kaydet
        set({ 
          isCalculatingDistance: false,
          lastCalculatedDistance: result,
          distanceError: null
        });
        
        return result;
      } else {
        
        // API yanıt vermezse, kuş uçuşu mesafe hesapla
        if (origin.includes(',') && destination.includes(',')) {
          
          const [originLat, originLng] = origin.split(',').map(coord => parseFloat(coord.trim()));
          const [destLat, destLng] = destination.split(',').map(coord => parseFloat(coord.trim()));
          
          const distance = calculateHaversineDistance(originLat, originLng, destLat, destLng);
          const distanceInMeters = distance * 1000;
          
          // Kuş uçuşu mesafe için ortalama hız 30 km/saat (8.33 m/s) varsayalım
          const durationInSeconds = distanceInMeters / 8.33;
          
          // Sonuç formatını API ile aynı şekilde döndür
          const result: DistanceResult = {
            origin: origin,
            destination: destination,
            distance: {
              text: distance < 1 ? `${Math.round(distanceInMeters)} m` : `${distance.toFixed(1)} km`,
              value: Math.round(distanceInMeters)
            },
            duration: {
              text: durationInSeconds < 60 
                ? `${Math.round(durationInSeconds)} sn` 
                : durationInSeconds < 3600 
                  ? `${Math.floor(durationInSeconds / 60)} dk` 
                  : `${Math.floor(durationInSeconds / 3600)} sa ${Math.floor((durationInSeconds % 3600) / 60)} dk`,
              value: Math.round(durationInSeconds)
            },
            status: 'OK (estimated)'
          };
          
          // Başarılı sonucu state'e kaydet
          set({ 
            isCalculatingDistance: false,
            lastCalculatedDistance: result,
            distanceError: null
          });
          
          return result;
        }
        
        // Hatayı state'e kaydet
        set({ 
          isCalculatingDistance: false,
          distanceError: `Mesafe hesaplanamadı: ${data.status || 'Bilinmeyen hata'}`
        });
        
        return null;
      }
    } catch (error) {
      // Hatayı state'e kaydet
      set({ 
        isCalculatingDistance: false,
        distanceError: `Mesafe hesaplanamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      });
      
      return null;
    }
  },
  
  calculateBulkDistances: async (origin, destinations, mode = 'driving') => {
    const apiKey = get().googleApiKey;
    
    if (!apiKey) {
      set({ bulkDistanceError: 'API anahtarı bulunamadı' });
      return null;
    }
    
    
    // Hesaplama başladığında durumu güncelle
    set({ 
      isCalculatingBulkDistances: true, 
      bulkDistanceError: null 
    });
    
    try {
      // Google Distance Matrix API URL
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destinations.join(','))}&mode=${mode}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      
      // API yanıtını kontrol et
      if (data.status === 'OK' && data.rows.length > 0 && data.rows[0].elements.length > 0) {
        const results: DistanceResult[] = data.rows[0].elements.map((element: any, index: number) => ({
          origin: origin,
          destination: destinations[index],
          distance: element.distance,
          duration: element.duration,
          status: element.status
        }));
        
        const bulkResults: BulkDistanceResults = {
          results,
          status: data.status
        };
        
        // Başarılı sonucu state'e kaydet
        set({ 
          isCalculatingBulkDistances: false,
          lastCalculatedBulkDistances: bulkResults,
          bulkDistanceError: null
        });
        
        return bulkResults;
      } else {
        // Hatayı state'e kaydet
        set({ 
          isCalculatingBulkDistances: false,
          bulkDistanceError: `Toplu mesafe hesaplanamadı: ${data.status || 'Bilinmeyen hata'}`
        });
        
        return null;
      }
    } catch (error) {
      // Hatayı state'e kaydet
      set({ 
        isCalculatingBulkDistances: false,
        bulkDistanceError: `Toplu mesafe hesaplanamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      });
      
      return null;
    }
  }
}));