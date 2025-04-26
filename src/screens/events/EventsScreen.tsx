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
  RefreshControl
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
    clearMessage
  } = useEventStore();
  
  // Filtre durumu
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all');
  
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
  
  // Component mount edildiğinde etkinlikleri getir
  useEffect(() => {
    loadEvents();
    
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
  }, [activeFilter]);
  
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
    
    // Filtreye göre parametreleri ayarla
    if (activeFilter === 'active') {
      params.status = 'active';
    } else if (activeFilter === 'completed') {
      params.status = 'completed';
    } else if (activeFilter === 'upcoming') {
      // Yaklaşan etkinlikler için bugünden sonraki tarihi filtrele
      const today = new Date();
      params.startDate = today.toISOString().split('T')[0];
    }
    
    await fetchEvents(params);
  };
  
  // Yeniden yükleme
  const handleRefresh = () => {
    loadEvents();
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
  
  // Filtreleri render et
  const renderFilters = () => {
    const filters = [
      { key: 'all', label: 'Tümü', icon: 'grid-outline' },
      { key: 'active', label: 'Aktif', icon: 'flame-outline' },
      { key: 'upcoming', label: 'Yaklaşan', icon: 'calendar-outline' },
    ];
    
    return (
      <View style={styles.filterScrollContainer}>
        <View style={styles.filterWrapper}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                { 
                  backgroundColor: activeFilter === filter.key 
                    ? theme.colors.accent 
                    : theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' 
                },
                activeFilter === filter.key && styles.activeFilterButton
              ]}
              onPress={() => setActiveFilter(filter.key as any)}
            >
              <Ionicons 
                name={filter.icon as any}
                size={18}
                color={activeFilter === filter.key ? 'white' : theme.colors.text}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterText,
                  { color: activeFilter === filter.key ? 'white' : theme.colors.text }
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  // Etkinlik istatistiklerini render et
  const renderEventStats = () => {
    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statItem, { backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
          <Text style={[styles.statCount, { color: theme.colors.accent }]}>
            {totalEvents || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Toplam Etkinlik
          </Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
          <Text style={[styles.statCount, { color: theme.colors.accent }]}>
            {sortedEvents.filter(e => e.status === 'active').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Aktif
          </Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
          <Text style={[styles.statCount, { color: theme.colors.accent }]}>
            {sortedEvents.filter(e => {
              const eventDate = new Date(e.event_date);
              const today = new Date();
              return eventDate > today;
            }).length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Yaklaşan
          </Text>
        </View>
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
              : 'Etkinlik bulunamadı'
            }
          </Text>
        </View>
      </Animated.View>
      
      {/* Stats Summary */}
      <Animated.View 
        style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }],
          marginBottom: 12
        }}
      >
        {renderEventStats()}
      </Animated.View>
      
      {/* Filter tabs */}
      <Animated.View 
        style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }] 
        }}
      >
        {renderFilters()}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  filterScrollContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    marginRight: 12,
    marginBottom: 8,
  },
  activeFilterButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontWeight: '600',
    fontSize: 14,
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