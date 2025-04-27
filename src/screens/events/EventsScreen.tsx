import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useEventStore } from '../../store/eventStore/eventStore';
import { EventList } from '../../components/EventList/EventList';
import { useNavigation } from '@react-navigation/native';
import { Event } from '../../types/eventTypes/event.types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const EventsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  
  // Event store'dan etkinlik durumunu ve metotları al
  const { 
    events, 
    totalEvents,
    currentPage,
    isLoading, 
    error,
    message,
    fetchEvents,
    clearError,
    clearMessage,
    sports,
    fetchSports
  } = useEventStore();
  
  // Filtre durumu
  const [activeSportId, setActiveSportId] = useState<string | null>(null);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleFabAnim = useRef(new Animated.Value(0)).current;
  
  // Sıralanmış etkinlikler - En yeni oluşturulanlar önce gösterilir
  const sortedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    // Tarihe göre sırala (en yeni oluşturulanlar önce)
    return [...events].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  }, [events]);
  
  // Component mount edildiğinde etkinlikleri ve spor kategorilerini getir
  useEffect(() => {
    loadEvents();
    if (!sports || sports.length === 0) {
      fetchSports();
    }
    
    // Giriş animasyonları
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleFabAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Filtre değiştiğinde etkinlikleri yeniden getir
  useEffect(() => {
    loadEvents();
  }, [activeSportId]);
  
  // Hata veya mesaj durumunda uyarı göster
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearError();
    }
    
    if (message) {
      Alert.alert('Bilgi', message);
      clearMessage();
    }
  }, [error, message]);
  
  // Etkinlikleri yükle
  const loadEvents = async () => {
    let params: any = { page: 1, limit: 20 };
    
    // Spor ID'ye göre filtreleme
    if (activeSportId) {
      params.sportId = activeSportId;
    }
    
    // Eğer events dizisi boşsa veya refresh yapılıyorsa API'den getir
    // Aksi takdirde mevcut state'i filtrele
    if (events.length === 0 || refreshing) {
      await fetchEvents(params);
    } else if (activeSportId) {
      // Mevcut events içinden aktiveSportId'ye göre filtrele
      const allEvents = useEventStore.getState().events;
      const filteredEvents = allEvents.filter(event => 
        event.sport_id === activeSportId
      );
      
      // Zustand store'u güncelle (lokal filtreleme)
      useEventStore.setState({
        events: filteredEvents,
        isLoading: false
      });
    } else {
      // Tüm etkinlikleri getir (API'ye istek atmadan, store'dan)
      // Bu durumda yalnızca ilk yüklemede API'ye istek atılacak
      const originalEvents = useEventStore.getState().events;
      useEventStore.setState({
        events: originalEvents,
        isLoading: false
      });
    }
  };
  
  // Yeniden yükleme durumu
  const [refreshing, setRefreshing] = useState(false);
  
  // Yeniden yükleme
  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents().then(() => setRefreshing(false));
  };
  
  // Etkinliğe tıklama - detay sayfasına git
  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };
  
  // Yeni etkinlik oluşturmaya git
  const handleCreateEvent = () => {
    // Prevent current fetches from continuing when navigating away
    clearError();
    navigation.navigate('CreateEvent');
  };

  // Spor ikonunu belirle
  const getSportIcon = (sportName: string = '') => {
    const lowerName = sportName.toLowerCase();
    if (lowerName.includes('futbol')) return 'football-outline';
    if (lowerName.includes('basketbol')) return 'basketball-outline';
    if (lowerName.includes('voleybol')) return 'baseball-outline';
    if (lowerName.includes('tenis')) return 'tennisball-outline';
    if (lowerName.includes('yüzme')) return 'water-outline';
    if (lowerName.includes('koşu') || lowerName.includes('kosu')) return 'walk-outline';
    if (lowerName.includes('bisiklet')) return 'bicycle-outline';
    if (lowerName.includes('e-spor') || lowerName.includes('espor')) return 'game-controller-outline';
    if (lowerName.includes('masa tenisi')) return 'tennisball-outline';
    return 'fitness-outline'; // Varsayılan
  };
  
  // Spor kategorilerini render et
  const renderSportFilters = () => {
    // API'den gelen spor kategorileri veya varsayılan kategorileri kullan
    const defaultSports = [
      { id: 'all', name: 'Tümü', icon: 'grid-outline' },
      { id: 'football', name: 'Futbol', icon: 'football-outline' },
      { id: 'basketball', name: 'Basketbol', icon: 'basketball-outline' },
      { id: 'volleyball', name: 'Voleybol', icon: 'baseball-outline' },
      { id: 'tennis', name: 'Tenis', icon: 'tennisball-outline' },
      { id: 'running', name: 'Koşu', icon: 'walk-outline' },
      { id: 'cycling', name: 'Bisiklet', icon: 'bicycle-outline' },
      { id: 'swimming', name: 'Yüzme', icon: 'water-outline' },
      { id: 'tabletennis', name: 'Masa Tenisi', icon: 'tennisball-outline' },
      { id: 'esports', name: 'E-Spor', icon: 'game-controller-outline' },
    ];
    
    // API'den gelen sporları doğru ikonlarla birlikte kullan
    let displaySports = [];
    
    if (sports && sports.length > 0) {
      // API'den gelen sporları doğru ikonlarla eşleştir
      displaySports = sports.map(sport => {
        // API'den gelen sport nesnesine Ionicons formatında icon ekle
        return {
          ...sport,
          icon: getSportIcon(sport.name)
        };
      });
      
      // Tümü filtresini başa ekle
      displaySports = [{ id: 'all', name: 'Tümü', icon: 'grid-outline' }, ...displaySports];
    } else {
      displaySports = defaultSports;
    }
    
    return (
      <View style={styles.sportFiltersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sportFiltersScroll}
        >
          {displaySports.map((sport) => {
            const isActive = sport.id === activeSportId || (sport.id === 'all' && activeSportId === null);
            const iconName = sport.icon || 'fitness-outline'; // Varsayılan ikon
            
            return (
              <TouchableOpacity
                key={sport.id}
                style={[
                  styles.sportFilterButton,
                  { 
                    backgroundColor: isActive 
                      ? theme.colors.accent 
                      : theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' 
                  }
                ]}
                onPress={() => setActiveSportId(sport.id === 'all' ? null : sport.id)}
              >
                <Ionicons 
                  name={iconName as any}
                  size={22}
                  color={isActive ? 'white' : theme.colors.text}
                />
                <Text
                  style={[
                    styles.sportFilterText,
                    { color: isActive ? 'white' : theme.colors.text }
                  ]}
                >
                  {sport.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Etkinlikler
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {totalEvents > 0 
              ? `${totalEvents} etkinlik arasından keşfet`
              : ''
            }
          </Text>
        </View>
      </Animated.View>
      
      {/* Sport filters */}
      <Animated.View 
        style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }],
          marginBottom: 8
        }}
      >
        {renderSportFilters()}
      </Animated.View>
      
      {/* Event List */}
      <EventList
        events={sortedEvents}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onEventPress={handleEventPress}
        emptyText={`Burada gösterilecek etkinlik bulunamadı.\nYeni bir etkinlik oluşturmak için butona dokunun.`}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
      />
      
      {/* Floating Action Button */}
      <Animated.View 
        style={[
          styles.fabContainer,
          {
            transform: [
              { scale: scaleFabAnim },
              { translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })}
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: theme.colors.accent }
          ]}
          onPress={handleCreateEvent}
          activeOpacity={0.8}
        >
          <View style={styles.fabContent}>
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.fabText}>Etkinlik Oluştur</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    opacity: 0.7,
  },
  sportFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sportFiltersScroll: {
    paddingVertical: 8,
    paddingRight: 24,
  },
  sportFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    marginRight: 12,
  },
  sportFilterText: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fab: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  fabText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});