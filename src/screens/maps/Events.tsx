import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../constants';
import useThemeStore from '../../../store/slices/themeSlice';
import { useEvents } from '../../hooks/useEvents';
import { formatEventDate, formatEventTime } from '../../../api/eventsService';
import EventDetailsPopup from '../../../components/modals/EventDetailsPopup';

const { width, height } = Dimensions.get('window');

/**
 * Etkinlikler Ekranı
 * Yakındaki etkinlikleri harita üzerinde gösterir ve listeler
 */
export default function EventsScreen() {
  const { isDarkMode } = useThemeStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);

  // State tanımları
  const [mapVisible, setMapVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSportFilter, setSelectedSportFilter] = useState<number | undefined>(undefined); // Default olarak "Tümü" seçeneği
  const [displayVertical, setDisplayVertical] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);

  // Spor kategorileri
  const sportCategories = [
    { id: undefined, name: 'Tümü' },
    { id: 1, name: 'Futbol' },
    { id: 2, name: 'Basketbol' },
    { id: 3, name: 'Tenis' },
    { id: 4, name: 'Voleybol' },
    { id: 6, name: 'Koşu' },
    { id: 7, name: 'Bisiklet' },
  ];

  // Etkinlik hook'unu kullan
  const { 
    filteredEvents, 
    isLoading, 
    error, 
    userLocation, 
    selectEvent,
    filterBySport,
    refreshEvents 
  } = useEvents({ maxDistance: 20 });

  // Etkinlikleri görmek için find.tsx'den geçirilen verileri al
  useEffect(() => {
    try {
      // Kullanıcı "Tümünü Gör" butonu ile yönlendirildiyse ve events parametresi ile veri geldiyse
      if (params.events) {
        const events = JSON.parse(params.events as string);
        console.log('Sıralanmış etkinlikler alındı', events.length);
        
        // Burada backend entegrasyonu için ön hazırlık - şimdilik sadece log
        // Gerçek uygulamada bu veriler kullanılacak
      }

      // Dikey görünüm parametresi kontrolü
      if (params.displayVertical === 'true') {
        setDisplayVertical(true);
        setMapVisible(false); // Dikey görünümde haritayı kapalı başlat
      }
    } catch (error) {
      console.error('Etkinlik verileri işlenemedi', error);
    }
  }, [params]);

  // Etkinlikleri mesafeye göre ilk açılışta sıralamak için params kontrolü
  useEffect(() => {
    if (params.defaultFilter === 'all') {
      // Tümü filtresini seç
      handleSportFilter(undefined);
    }
  }, [params]);

  // Yenileme işlevi
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshEvents();
    setRefreshing(false);
  };

  // Spor filtresini değiştir
  const handleSportFilter = (sportId: number | undefined) => {
    setSelectedSportFilter(sportId);
    filterBySport(sportId);
  };

  // Etkinlik detayı popup göster
  const handleShowEventDetails = (event: any) => {
    setSelectedEvent(event);
    setShowEventPopup(true);
  };

  // Etkinlik popup kapat
  const handleCloseEventPopup = () => {
    setShowEventPopup(false);
  };

  // Etkinlik detayına git
  const handleEventPress = (eventId: number) => {
    // Backend entegrasyonu yapıldığında detay ekranına yönlendirme yapılacak yerine popup göster
    const event = filteredEvents.find(e => e.id === eventId);
    if (event) {
      handleShowEventDetails(event);
    }
  };

  // Harita görünümüne git
  const handleMapMarkerPress = (eventId: number) => {
    selectEvent(eventId);
  };

  // Harita/Liste görünümünü değiştir
  const toggleView = () => {
    setMapVisible(!mapVisible);
  };

  // Eğer konum ya da etkinlikler yükleniyorsa
  if (isLoading && filteredEvents.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#0F172A' : COLORS.neutral.silver }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={[styles.loadingText, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
          Etkinlikler yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : COLORS.neutral.silver }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Başlık ve Harita/Liste Toggle */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
            Etkinlikler
          </Text>
          {!displayVertical && (
            <TouchableOpacity 
              style={[styles.viewToggleButton, { backgroundColor: isDarkMode ? '#334155' : COLORS.neutral.light }]}
              onPress={toggleView}
            >
              <Ionicons name={mapVisible ? 'list' : 'map'} size={20} color={isDarkMode ? COLORS.neutral.white : COLORS.primary} />
              <Text style={[styles.viewToggleText, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
                {mapVisible ? 'Liste' : 'Harita'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Spor filtresi */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {sportCategories.map((category) => (
          <TouchableOpacity
            key={category.id?.toString() || 'all'}
            style={[
              styles.filterButton,
              selectedSportFilter === category.id && styles.filterButtonActive,
              { 
                backgroundColor: selectedSportFilter === category.id 
                  ? COLORS.accent 
                  : (isDarkMode ? '#1E293B' : COLORS.neutral.white),
                borderColor: isDarkMode ? '#334155' : COLORS.neutral.light,
              }
            ]}
            onPress={() => handleSportFilter(category.id)}
          >
            <Text 
              style={[
                styles.filterText, 
                selectedSportFilter === category.id && styles.filterTextActive,
                { 
                  color: selectedSportFilter === category.id 
                    ? COLORS.neutral.white 
                    : (isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark)
                }
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Harita Görünümü */}
      {mapVisible && userLocation ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            {filteredEvents.map((event) => (
              <Marker
                key={event.id}
                coordinate={{
                  latitude: event.location_latitude,
                  longitude: event.location_longitude,
                }}
                title={event.title}
                description={event.location_name}
                onPress={() => handleMapMarkerPress(event.id)}
              >
                <View style={[styles.eventMarker, { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white }]}>
                  <Ionicons 
                    name={
                      event.sport_name === 'Futbol' ? 'football' : 
                      event.sport_name === 'Basketbol' ? 'basketball' :
                      event.sport_name === 'Tenis' ? 'tennisball' :
                      event.sport_name === 'Voleybol' ? 'baseball' :
                      event.sport_name === 'Koşu' ? 'walk' :
                      event.sport_name === 'Bisiklet' ? 'bicycle' : 'calendar'
                    } 
                    size={18} 
                    color={COLORS.accent}
                  />
                </View>
                <Callout tooltip>
                  <View style={[styles.callout, { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white }]}>
                    <Text style={[styles.calloutTitle, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
                      {event.title}
                    </Text>
                    <Text style={[styles.calloutTime, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                      {formatEventDate(event.event_date)} • {formatEventTime(event.start_time)}
                    </Text>
                    <Text style={[styles.calloutLocation, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                      {event.location_name}
                    </Text>
                    <Text style={[styles.calloutDistance, { color: COLORS.accent }]}>
                      {event.distance} uzaklıkta
                    </Text>
                    <TouchableOpacity 
                      style={[styles.calloutButton, { backgroundColor: COLORS.accent }]}
                      onPress={() => handleEventPress(event.id)}
                    >
                      <Text style={styles.calloutButtonText}>Detaylar</Text>
                    </TouchableOpacity>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>
      ) : !mapVisible ? (
        // Liste Görünümü
        <ScrollView 
          style={styles.eventsList}
          contentContainerStyle={styles.eventsListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.accent]} />
          }
        >
          {filteredEvents.length > 0 ? (
            displayVertical ? (
              /* Dikey kartlar - Find sayfasından gelen görünüm */
              <View style={styles.verticalEventsContainer}>
                {filteredEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.verticalEventCard,
                      { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white }
                    ]}
                    onPress={() => handleEventPress(event.id)}
                  >
                    <View style={styles.verticalEventHeader}>
                      <View style={styles.verticalCategory}>
                        <Ionicons 
                          name={
                            event.sport_name === 'Futbol' ? 'football' : 
                            event.sport_name === 'Basketbol' ? 'basketball' :
                            event.sport_name === 'Tenis' ? 'tennisball' :
                            event.sport_name === 'Voleybol' ? 'baseball' :
                            event.sport_name === 'Koşu' ? 'walk' :
                            event.sport_name === 'Bisiklet' ? 'bicycle' : 'calendar'
                          } 
                          size={20} 
                          color={COLORS.accent}
                          style={styles.verticalCategoryIcon}
                        />
                        <Text style={[styles.verticalCategoryText, { color: COLORS.accent }]}>
                          {event.sport_name}
                        </Text>
                      </View>
                      <Text style={[styles.verticalDistance, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                        {event.distance}
                      </Text>
                    </View>
                    
                    <Text style={[styles.verticalEventTitle, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
                      {event.title}
                    </Text>
                    
                    <View style={styles.verticalInfoRow}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.accent} style={styles.verticalInfoIcon} />
                      <Text style={[styles.verticalInfoText, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                        {formatEventDate(event.event_date)} • {formatEventTime(event.start_time)}
                      </Text>
                    </View>
                    
                    <View style={styles.verticalInfoRow}>
                      <Ionicons name="location-outline" size={14} color={COLORS.accent} style={styles.verticalInfoIcon} />
                      <Text style={[styles.verticalInfoText, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                        {event.location_name}
                      </Text>
                    </View>
                    
                    <View style={styles.verticalFooter}>
                      <View style={styles.verticalParticipants}>
                        <Ionicons name="people-outline" size={14} color={isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark} />
                        <Text style={[styles.verticalParticipantsText, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                          {event.current_participants}/{event.max_participants}
                        </Text>
                      </View>
                      <Text style={[styles.verticalCreator, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                        Organizatör
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              filteredEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventCard, { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white }]}
                  onPress={() => handleEventPress(event.id)}
                >
                  <View style={styles.eventCardContent}>
                    <View style={styles.eventCardLeft}>
                      <View style={[styles.eventIconContainer, { backgroundColor: isDarkMode ? '#334155' : COLORS.neutral.silver }]}>
                        <Ionicons 
                          name={
                            event.sport_name === 'Futbol' ? 'football' : 
                            event.sport_name === 'Basketbol' ? 'basketball' :
                            event.sport_name === 'Tenis' ? 'tennisball' :
                            event.sport_name === 'Voleybol' ? 'baseball' :
                            event.sport_name === 'Koşu' ? 'walk' :
                            event.sport_name === 'Bisiklet' ? 'bicycle' : 'calendar'
                          } 
                          size={28} 
                          color={COLORS.accent}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.eventCardMiddle}>
                      <Text style={[styles.eventTitle, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
                        {event.title}
                      </Text>
                      
                      <View style={styles.eventLocation}>
                        <Ionicons name="location" size={14} color={isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark} />
                        <Text style={[styles.eventLocationText, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                          {event.location_name}
                        </Text>
                      </View>
                      
                      <View style={styles.eventFooter}>
                        <View style={styles.eventParticipants}>
                          <Ionicons name="people" size={14} color={isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark} />
                          <Text style={[styles.eventParticipantsText, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                            {event.current_participants}/{event.max_participants}
                          </Text>
                        </View>
                        <Text style={[styles.eventCreatorText, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                          Organizatör
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.eventCardRight}>
                      <View style={[styles.eventSportBadge, { backgroundColor: isDarkMode ? '#334155' : COLORS.neutral.silver }]}>
                        <Text style={[styles.eventSportText, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
                          {event.sport_name}
                        </Text>
                      </View>
                      <Text style={[styles.eventDate, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                        {formatEventDate(event.event_date)}
                      </Text>
                      <Text style={[styles.eventTime, { color: isDarkMode ? COLORS.accent : COLORS.accent }]}>
                        {formatEventTime(event.start_time)}
                      </Text>
                      <Text style={[styles.eventDistance, { color: COLORS.accent, fontWeight: '600' }]}>
                        {event.distance}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={70} color={isDarkMode ? '#334155' : COLORS.neutral.light} />
              <Text style={[styles.emptyStateText, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
                {error ? `Hata: ${error}` : 'Bu kriterlere uygun etkinlik bulunamadı'}
              </Text>
              <TouchableOpacity 
                style={[styles.emptyStateButton, { backgroundColor: COLORS.accent }]}
                onPress={onRefresh}
              >
                <Text style={styles.emptyStateButtonText}>Yeniden Dene</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        // Harita yüklenemezse
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={[styles.loadingText, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
            Harita yükleniyor...
          </Text>
        </View>
      )}
      
      {/* Event Details Popup */}
      {selectedEvent && (
        <EventDetailsPopup 
          event={selectedEvent}
          visible={showEventPopup}
          onClose={handleCloseEventPopup}
          isDarkMode={isDarkMode}
          showMap={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 40 : 35,
    paddingBottom: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewToggleText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
    marginBottom: 4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    height: 28,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    borderWidth: 0,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 14,
  },
  filterTextActive: {
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  eventMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  callout: {
    width: 200,
    padding: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutTime: {
    fontSize: 12,
    marginBottom: 2,
  },
  calloutLocation: {
    fontSize: 12,
    marginBottom: 4,
  },
  calloutDistance: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  calloutButton: {
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    paddingBottom: 30,
  },
  eventCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventCardLeft: {
    flex: 1,
    alignItems: 'center',
  },
  eventIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCardMiddle: {
    flex: 3,
    paddingHorizontal: 8,
  },
  eventCardRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  eventMeta: {
    flexDirection: 'column',
  },
  eventDate: {
    fontSize: 13,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventDistance: {
    fontSize: 13,
  },
  eventSportBadge: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  eventSportText: {
    fontSize: 12,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventLocationText: {
    marginLeft: 4,
    fontSize: 13,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventParticipantsText: {
    marginLeft: 4,
    fontSize: 12,
  },
  eventCreator: {
    fontSize: 12,
  },
  eventCreatorText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  /* Dikey kart stilleri */
  verticalEventsContainer: {
    padding: 4,
  },
  verticalEventCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verticalEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  verticalCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalCategoryIcon: {
    marginRight: 6,
  },
  verticalCategoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  verticalDistance: {
    fontSize: 12,
  },
  verticalEventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  verticalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verticalInfoIcon: {
    marginRight: 8,
  },
  verticalInfoText: {
    fontSize: 14,
  },
  verticalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  verticalParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalParticipantsText: {
    fontSize: 12,
    marginLeft: 4,
  },
  verticalCreator: {
    fontSize: 12,
  },
});