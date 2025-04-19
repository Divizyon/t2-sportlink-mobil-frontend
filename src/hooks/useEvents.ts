import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { 
  getAllEvents, 
  getEventsBySport, 
  getNearbyEvents, 
  getEventById,
  Event
} from '../../api/eventsService';

interface UseEventsProps {
  initialSportId?: number;
  maxDistance?: number;
  refreshOnFocus?: boolean;
}

export const useEvents = ({
  initialSportId,
  maxDistance = 10,
  refreshOnFocus = true
}: UseEventsProps = {}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>(initialSportId);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);

  // Kullanıcı konumunu alma
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni',
          'Yakınındaki etkinlikleri görmek için konum izni vermeniz gerekiyor.',
          [{ text: 'Tamam', style: 'default' }]
        );
        return null;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      return location.coords;
    } catch (error) {
      console.error('Konum alınamadı:', error);
      setError('Konum alınamadı');
      return null;
    }
  };

  // Tüm etkinlikleri getir
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const eventsData = await getAllEvents();
      
      // Etkinlikleri mesafeye göre sırala - yakından uzağa doğru
      const sortedEvents = [...eventsData].sort((a, b) => {
        const distanceA = parseFloat(a.distance?.replace(' km', '').replace(' m', '') || '0');
        const distanceB = parseFloat(b.distance?.replace(' km', '').replace(' m', '') || '0');
        
        // Metre cinsinden olanları kilometre cinsine çevir
        const kmFactorA = a.distance?.includes(' m') ? 0.001 : 1;
        const kmFactorB = b.distance?.includes(' m') ? 0.001 : 1;
        
        return (distanceA * kmFactorA) - (distanceB * kmFactorB);
      });
      
      setEvents(sortedEvents);
      
      // Filtreleme işlemi
      if (selectedSportId) {
        setFilteredEvents(sortedEvents.filter(event => event.sport_id === selectedSportId));
      } else if (maxDistance) {
        const nearbyEvents = sortedEvents.filter(event => {
          if (!event.distance) return true;
          
          let distanceValue = 0;
          if (event.distance.includes('km')) {
            distanceValue = parseFloat(event.distance.replace(' km', ''));
          } else {
            distanceValue = parseFloat(event.distance.replace(' m', '')) / 1000;
          }
          
          return distanceValue <= maxDistance;
        });
        
        setFilteredEvents(nearbyEvents);
      } else {
        setFilteredEvents(sortedEvents);
      }
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata oluştu:', error);
      setError('Etkinlikler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSportId, maxDistance]);

  // Belirli bir spor için etkinlikleri getir
  const filterBySport = useCallback((sportId: number | undefined) => {
    setSelectedSportId(sportId);
    
    if (!sportId) {
      setFilteredEvents(events);
      return;
    }
    
    setFilteredEvents(events.filter(event => event.sport_id === sportId));
  }, [events]);

  // Belirli bir etkinliği seç
  const selectEvent = useCallback(async (eventId: number) => {
    setIsLoading(true);
    
    try {
      const event = await getEventById(eventId);
      setSelectedEvent(event);
    } catch (error) {
      console.error('Etkinlik detayları yüklenirken hata oluştu:', error);
      setError('Etkinlik detayları yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Etkinlikleri yenile
  const refreshEvents = useCallback(async () => {
    setIsLoading(true);
    await fetchEvents();
    setIsLoading(false);
  }, [fetchEvents]);

  // İlk yükleme
  useEffect(() => {
    const initialize = async () => {
      await getUserLocation();
      await fetchEvents();
    };
    
    initialize();
  }, []);

  // Ekran her odaklandığında yenile
  useFocusEffect(
    useCallback(() => {
      if (refreshOnFocus) {
        refreshEvents();
      }
    }, [refreshOnFocus, refreshEvents])
  );

  return {
    events,
    filteredEvents,
    selectedEvent,
    isLoading,
    error,
    userLocation,
    selectEvent,
    filterBySport,
    refreshEvents,
    getUserLocation
  };
};