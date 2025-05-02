import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useMapsStore } from '../../store/appStore/mapsStore';
import { useEventStore } from '../../store/eventStore/eventStore';
import { useApiStore } from '../../store/appStore/apiStore';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { DistanceInfo } from './DistanceInfo';
import { DistanceResult } from '../../api/maps/mapsApi';
import { Event as EventType } from '../../types/eventTypes/event.types';

// EventType tipinde gelen harita uyumlu Event tipi
interface MapEvent extends EventType {
  // Event türüne gerekli alanları ekliyoruz - API'den gelen veriyle uyumlu olmalı
  latitude: number;
  longitude: number;
}

interface NearbyEventsMapProps {
  userLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  initialRegion?: Region;
  onEventSelect?: (event: MapEvent) => void;
  transportMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

export const NearbyEventsMap: React.FC<NearbyEventsMapProps> = ({
  userLocation,
  initialRegion,
  onEventSelect,
  transportMode = 'driving'
}) => {
  // State
  const [region, setRegion] = useState<Region>(initialRegion || {
    latitude: 41.0082,  // Istanbul default
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [eventDistances, setEventDistances] = useState<Record<string, DistanceResult>>({});
  
  // Store hooks
  const { isLoading: isApiLoading } = useApiStore();
  const { nearbyEvents, fetchNearbyEvents } = useEventStore();
  const isLoadingEvents = useEventStore((state) => state.isLoading);
  const { 
    lastLocation,
    setLastLocation,
    calculateBulkDistances,
    isCalculatingBulkDistances 
  } = useMapsStore();
  
  // API'den gelen EventType'ı MapEvent tipine dönüştürme
  const mapEvents: MapEvent[] = nearbyEvents?.map(event => ({
    ...event,
    latitude: event.location_latitude,
    longitude: event.location_longitude
  })) || [];
  
  // Effect to set user location
  useEffect(() => {
    if (userLocation) {
      setLastLocation(userLocation.latitude, userLocation.longitude, userLocation.address);
      setRegion({
        ...region,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
    }
  }, [userLocation]);
  
  // Effect to load nearby events when location changes
  useEffect(() => {
    if (lastLocation) {
      fetchNearbyEvents({
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
        radius: 20
      }); // 20km radius
    }
  }, [lastLocation]);
  
  // Effect to calculate distances to events
  useEffect(() => {
    calculateEventDistances();
  }, [mapEvents, lastLocation, transportMode]);
  
  // Function to calculate distances to all events
  const calculateEventDistances = async () => {
    if (!lastLocation || !mapEvents || mapEvents.length === 0) return;
    
    const origin = `${lastLocation.latitude},${lastLocation.longitude}`;
    const destinations = mapEvents.map(event => 
      `${event.latitude},${event.longitude}`
    );
    
    const result = await calculateBulkDistances(origin, destinations, transportMode);
    
    // Store distances with event IDs as keys
    if (result && result.results) {
      const newDistances: Record<string, DistanceResult> = {};
      
      result.results.forEach((distance, index) => {
        const event = mapEvents[index];
        if (event) {
          newDistances[event.id] = distance;
        }
      });
      
      setEventDistances(newDistances);
    }
  };
  
  // Handler for marker press
  const handleMarkerPress = (event: MapEvent) => {
    setSelectedEvent(event);
    if (onEventSelect) {
      onEventSelect(event);
    }
  };
  
  // Render loading state
  if ((isLoadingEvents || isCalculatingBulkDistances) && (!mapEvents || mapEvents.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D5BC2" />
        <Text style={styles.loadingText}>Etkinlikler yükleniyor...</Text>
      </View>
    );
  }
  
  // Render empty state
  if (!mapEvents || mapEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="location-outline" size={48} color="#888" />
        <Text style={styles.emptyText}>Yakında etkinlik bulunamadı</Text>
        <Button 
          mode="contained" 
          onPress={() => lastLocation && fetchNearbyEvents({
            latitude: lastLocation.latitude,
            longitude: lastLocation.longitude,
            radius: 50
          })}
          style={styles.retryButton}
        >
          Daha Geniş Alanda Ara
        </Button>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {mapEvents.map(event => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude
            }}
            title={event.title}
            description={event.description?.substring(0, 50) + '...'}
            onPress={() => handleMarkerPress(event)}
            pinColor={selectedEvent?.id === event.id ? '#1D5BC2' : '#2B5EA7'}
          />
        ))}
      </MapView>
      
      {selectedEvent && lastLocation && (
        <View style={styles.eventInfoContainer}>
          <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
          <Text style={styles.eventDescription} numberOfLines={2}>
            {selectedEvent.description || 'Açıklama bulunmuyor'}
          </Text>
          
          <DistanceInfo
            origin={`${lastLocation.latitude},${lastLocation.longitude}`}
            destination={`${selectedEvent.latitude},${selectedEvent.longitude}`}
            transportMode={transportMode}
            style={styles.distanceInfo}
          />
          
          <Button 
            mode="contained" 
            onPress={() => onEventSelect && onEventSelect(selectedEvent)}
            style={styles.viewButton}
          >
            Etkinlik Detayları
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    marginBottom: 20,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
  eventInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  distanceInfo: {
    marginBottom: 15,
  },
  viewButton: {
    marginTop: 5,
  },
}); 