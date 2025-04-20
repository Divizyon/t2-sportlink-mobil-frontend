import { useState, useCallback, useRef, MutableRefObject } from 'react';
import MapView, { Region } from 'react-native-maps';
import { Point, calculateTotalDistance } from '@/src/utils/calculations';
import { useLocation } from './useLocation';

/**
 * Harita üzerinde bir rotayı temsil eden tip
 */
export interface Route {
  id: string;
  name: string;
  distance: number; // kilometre
  duration: number; // dakika
  points: Point[];
  difficulty: 'kolay' | 'orta' | 'zor';
  type: 'koşu' | 'bisiklet' | 'yürüyüş';
}

/**
 * Harita işlemlerini yöneten özel hook
 * @returns Harita işlemleri ve durumu
 */
export const useMap = () => {
  // Konum hook'unu kullan
  const { location } = useLocation();
  
  // Map referansı
  const mapRef = useRef<MapView | null>(null);
  
  // State'ler
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [currentRoutePoints, setCurrentRoutePoints] = useState<Point[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  
  /**
   * Harita üzerine basıldığında rota noktası ekle
   */
  const handleMapPress = useCallback((event: any) => {
    if (!isCreatingRoute) return;
    
    const newPoint = event.nativeEvent.coordinate;
    setCurrentRoutePoints((prevPoints) => [...prevPoints, newPoint]);
  }, [isCreatingRoute]);

  /**
   * Yeni rota oluşturmayı başlat
   */
  const startCreatingRoute = useCallback(() => {
    setIsCreatingRoute(true);
    setCurrentRoutePoints([]);
  }, []);

  /**
   * Rota oluşturmayı iptal et
   */
  const cancelRouteCreation = useCallback(() => {
    setIsCreatingRoute(false);
    setCurrentRoutePoints([]);
  }, []);

  /**
   * Rota oluşturmayı tamamla
   * @param name - Rota adı
   * @param type - Aktivite tipi
   */
  const finishRouteCreation = useCallback((name: string, type: 'koşu' | 'bisiklet' | 'yürüyüş') => {
    if (currentRoutePoints.length < 2) {
      return false;
    }

    const distance = calculateTotalDistance(currentRoutePoints);
    
    // Aktivite tipine göre ortalama hızlar
    const speeds = {
      'koşu': 10, // km/saat
      'bisiklet': 15, // km/saat
      'yürüyüş': 5, // km/saat
    };
    
    // Tahmini süreyi hesapla
    const durationHours = distance / speeds[type];
    const duration = Math.round(durationHours * 60); // dakikaya çevir
    
    // Zorluk seviyesi belirleme
    let difficulty: 'kolay' | 'orta' | 'zor' = 'kolay';
    if (distance > 10) {
      difficulty = 'zor';
    } else if (distance > 5) {
      difficulty = 'orta';
    }
    
    // Yeni rota oluştur
    const newRoute: Route = {
      id: Date.now().toString(),
      name,
      distance,
      duration,
      points: currentRoutePoints,
      difficulty,
      type,
    };
    
    // Routes state'ini güncelle
    setRoutes((prevRoutes) => [...prevRoutes, newRoute]);
    setSelectedRoute(newRoute);
    setIsCreatingRoute(false);
    setCurrentRoutePoints([]);
    
    return true;
  }, [currentRoutePoints]);

  /**
   * Bir rotayı görüntüle ve haritada merkeze al
   */
  const viewRoute = useCallback((route: Route) => {
    setSelectedRoute(route);
    
    if (mapRef.current && route.points.length > 0) {
      // Rota sınırlarını hesapla
      const latitudes = route.points.map(p => p.latitude);
      const longitudes = route.points.map(p => p.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      // Haritayı sınırlar içine al
      mapRef.current.fitToCoordinates(route.points, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, []);

  /**
   * İlk konuma git
   */
  const goToCurrentLocation = useCallback(() => {
    if (mapRef.current && location) {
      const region: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [location]);

  return {
    mapRef,
    routes,
    selectedRoute,
    isCreatingRoute,
    currentRoutePoints,
    handleMapPress,
    startCreatingRoute,
    cancelRouteCreation,
    finishRouteCreation,
    viewRoute,
    setSelectedRoute,
    goToCurrentLocation,
  };
}; 