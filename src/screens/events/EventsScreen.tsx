import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useProfileStore, UserSportPreference } from '../../store/userStore/profileStore';
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
  ScrollView,
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useEventStore } from '../../store/eventStore/eventStore';
import { EventList } from '../../components/EventList/EventList';
import { useNavigation } from '@react-navigation/native';
import { Event } from '../../types/eventTypes/event.types';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

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
    fetchSports,
    searchEvents,
    searchResults
  } = useEventStore();

  // Filtre durumu
  const [activeSportId, setActiveSportId] = useState<string | null>(null);

  // Arama durumu
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Tarih filtreleme durumu
  const [dateModalVisible, setDateModalVisible] = useState<boolean>(false);
  const [isDateFilterActive, setIsDateFilterActive] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(2025); // Varsayılan olarak 2025 seçili

  // Her yıl için ayrı ay seçim durumu
  const [selectedMonths2025, setSelectedMonths2025] = useState<number[]>([]);
  const [selectedMonths2026, setSelectedMonths2026] = useState<number[]>([]);

  // Aktif yıla göre seçili ayları belirleme
  const selectedMonths = useMemo(() => {
    return selectedYear === 2025 ? selectedMonths2025 : selectedMonths2026;
  }, [selectedYear, selectedMonths2025, selectedMonths2026]);

  // Kullanılabilir yıllar ve aylar
  const availableYears = [2025, 2026];
  const months = [
    { id: 0, name: 'Ocak' },
    { id: 1, name: 'Şubat' },
    { id: 2, name: 'Mart' },
    { id: 3, name: 'Nisan' },
    { id: 4, name: 'Mayıs' },
    { id: 5, name: 'Haziran' },
    { id: 6, name: 'Temmuz' },
    { id: 7, name: 'Ağustos' },
    { id: 8, name: 'Eylül' },
    { id: 9, name: 'Ekim' },
    { id: 10, name: 'Kasım' },
    { id: 11, name: 'Aralık' }
  ];

  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleFabAnim = useRef(new Animated.Value(0)).current;

  // Harita görünümü durumu
  const [mapModalVisible, setMapModalVisible] = useState<boolean>(false);

  // Konya'nın koordinatları (varsayılan harita merkezi)
  const konyaRegion = {
    latitude: 37.8719,
    longitude: 32.4844,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  // Filtreleme fonksiyonu - etkinliklerin son halini filtreler
  const applyFilters = (eventsToFilter: Event[]) => {
    if (!eventsToFilter) return [];
    
    // Önce spor filtresi
    let filteredEvents = eventsToFilter;
    
    // Artık herhangi bir status filtresi yok - tüm etkinlikleri göster
    return filteredEvents;
  };
  

  // Kullanıcının spor tercihlerindeki skillLevel'e göre etkinlikleri sıralama
  const userSportPreferences: UserSportPreference[] = useProfileStore(state => state.sportPreferences);

  // SkillLevel öncelik tablosu
  const skillLevelPriority: Record<string, number> = {
    'professional': 4,
    'advanced': 3,
    'intermediate': 2,
    'beginner': 1
  };

  const sortedEvents = useMemo(() => {
    let filteredEvents = [];

    if (isSearchActive && searchResults.length > 0) {
      filteredEvents = [...searchResults];
    } else if (!events || events.length === 0) {
      return [];
    } else {
      filteredEvents = [...events];
      if (activeSportId) {
        filteredEvents = filteredEvents.filter(event => event.sport_id === activeSportId);
      }
    }

    filteredEvents = applyFilters(filteredEvents);

    // Kullanıcının spor tercihlerinde skillLevel varsa, etkinlikleri buna göre sırala
    return filteredEvents.sort((a, b) => {
      // Etkinliklerin sporId'sine göre kullanıcının skillLevel'ını bul
      const prefA = userSportPreferences.find((pref: UserSportPreference) => pref.sportId === a.sport_id);
      const prefB = userSportPreferences.find((pref: UserSportPreference) => pref.sportId === b.sport_id);

      const skillA = prefA ? skillLevelPriority[prefA.skillLevel] : 0;
      const skillB = prefB ? skillLevelPriority[prefB.skillLevel] : 0;

      // Eğer ikisinde de skill yoksa, eski sıralama
      if (skillA === 0 && skillB === 0) {
        // Status'a göre öncelik sırası: active > completed > canceled > draft
        const statusPriority = {
          'active': 1,
          'completed': 2, 
          'canceled': 3,
          'draft': 4
        };
        const statusA = statusPriority[a.status] || 5;
        const statusB = statusPriority[b.status] || 5;
        if (statusA !== statusB) {
          return statusA - statusB;
        }
        if (a.status === 'active' || a.status === 'draft') {
          const dateA = new Date(a.event_date).getTime();
          const dateB = new Date(b.event_date).getTime();
          return dateA - dateB;
        } else {
          const createdA = new Date(a.created_at).getTime();
          const createdB = new Date(b.created_at).getTime();
          return createdB - createdA;
        }
      }

      // SkillLevel'a göre büyükten küçüğe sırala
      return skillB - skillA;
    });
  }, [events, activeSportId, searchResults, isSearchActive, userSportPreferences]);

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
    // Arama aktifse ve filtre değişirse, aramayı temizle
    if (isSearchActive) {
      setIsSearchActive(false);
      setSearchQuery('');
    }
    loadEvents();
  }, [activeSportId]);

  // Arama sorgusunun değişimine bağlı olarak arama yap
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchQuery.trim().length > 0) {
      const timeout = setTimeout(() => {
        handleSearch();
      }, 500); // Kullanıcı yazmayı bitirdikten 500ms sonra arama yap (debounce)
      setSearchTimeout(timeout);
    } else if (searchQuery === '' && isSearchActive) {
      setIsSearchActive(false);
      loadEvents(); // Arama temizlendiğinde normal etkinlikleri göster
    }

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchQuery]);

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
    let params: any = { page: 1, limit: 20, status: 'all' };

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

  // Arama işlevi
  const handleSearch = async () => {
    if (searchQuery.trim().length === 0) {
      setIsSearchActive(false);
      return;
    }

    setIsSearchActive(true);

    // API isteği atmak yerine mevcut events üzerinde yerel arama yap
    const allEvents = useEventStore.getState().events;
    const query = searchQuery.toLowerCase().trim();

    // Etkinlik içinde arama yap (başlık, açıklama, konum vb.)
    const filteredEvents = allEvents.filter(event => {
      return (
        (event.title && event.title.toLowerCase().includes(query)) ||
        (event.description && event.description.toLowerCase().includes(query)) ||
        (event.location_name && event.location_name.toLowerCase().includes(query))
      );
    });

    // Spor kategorisi filtrelemesi varsa uygula
    const results = activeSportId
      ? filteredEvents.filter(event => event.sport_id === activeSportId)
      : filteredEvents;

    // Sonuçları store'a kaydet (API çağrısı yapmadan)
    useEventStore.setState({
      searchResults: results,
      isLoading: false
    });
  };

  // Arama çubuğunu temizle
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
    loadEvents(); // Normal etkinlikleri yükle
  };

  // Yeniden yükleme durumu
  const [refreshing, setRefreshing] = useState(false);

  // Yeniden yükleme
  const handleRefresh = () => {
    setRefreshing(true);
    // Arama aktifse arama sorgusunu tekrar çalıştır
    if (isSearchActive && searchQuery.trim().length > 0) {
      handleSearch().then(() => setRefreshing(false));
    } else {
      loadEvents().then(() => setRefreshing(false));
    }
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

  // Tarih filtresini temizle
  const clearDateFilter = () => {
    setSelectedMonths2025([]);
    setSelectedMonths2026([]);
    setIsDateFilterActive(false);
    loadEvents(); // Normal etkinlikleri yükle
  };

  // Sadece seçimleri temizle (modal içinde)
  const clearSelections = () => {
    setSelectedMonths2025([]);
    setSelectedMonths2026([]);
  };

  // Ay seçme işlevi
  const toggleMonthSelection = (monthId: number) => {
    if (selectedMonths.includes(monthId)) {
      // Eğer ay zaten seçiliyse, seçimden kaldır
      if (selectedYear === 2025) {
        setSelectedMonths2025(selectedMonths2025.filter(id => id !== monthId));
      } else {
        setSelectedMonths2026(selectedMonths2026.filter(id => id !== monthId));
      }
    } else {
      // Eğer ay seçili değilse, seçime ekle
      if (selectedYear === 2025) {
        setSelectedMonths2025([...selectedMonths2025, monthId]);
      } else {
        setSelectedMonths2026([...selectedMonths2026, monthId]);
      }
    }
  };

  // Tarih filtresi uygula
  const applyDateFilter = () => {
    const hasSelectedMonths = selectedMonths2025.length > 0 || selectedMonths2026.length > 0;

    if (hasSelectedMonths) {
      setIsDateFilterActive(true);
      setDateModalVisible(false);
    } else {
      Alert.alert("Uyarı", "Lütfen en az bir ay seçin.");
    }
  };

  // Seçili ayları formatlı göster
  const getSelectedMonthsText = (): string => {
    let result = '';

    // 2025 yılı için seçili ayları formatla
    if (selectedMonths2025.length > 0) {
      const selectedMonthNames2025 = selectedMonths2025
        .map(monthId => months.find(m => m.id === monthId)?.name)
        .filter(Boolean) // null veya undefined değerleri filtrele
        .join(', ');

      result += `2025: ${selectedMonthNames2025}`;
    }

    // 2026 yılı için seçili ayları formatla
    if (selectedMonths2026.length > 0) {
      // Eğer önceki yıldan da seçim varsa bir ayraç ekle
      if (result) result += ' | ';

      const selectedMonthNames2026 = selectedMonths2026
        .map(monthId => months.find(m => m.id === monthId)?.name)
        .filter(Boolean)
        .join(', ');

      result += `2026: ${selectedMonthNames2026}`;
    }

    return result;
  };

  // Tarih filtresi modalı
  const renderDatePickerModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={dateModalVisible}
        onRequestClose={() => setDateModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDateModalVisible(false)}
        >
          <View style={[styles.modalView, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Tarihe Göre Filtrele</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Yıl Seçimi */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Yıl Seçin</Text>
              <View style={styles.yearButtonsContainer}>
                {availableYears.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearButton,
                      {
                        backgroundColor: selectedYear === year
                          ? theme.colors.accent
                          : theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                      }
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      style={[
                        styles.yearButtonText,
                        { color: selectedYear === year ? 'white' : theme.colors.text }
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Ay Seçimi - Seçilen yıla bağlı olarak gösterilir */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>
                Ay Seçin ({selectedYear} için) (Birden fazla seçilebilir)
              </Text>
              <View style={styles.monthsContainer}>
                {months.map(month => (
                  <TouchableOpacity
                    key={month.id}
                    style={[
                      styles.monthButton,
                      {
                        backgroundColor: selectedMonths.includes(month.id)
                          ? theme.colors.accent
                          : theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                      }
                    ]}
                    onPress={() => toggleMonthSelection(month.id)}
                  >
                    <Text
                      style={[
                        styles.monthButtonText,
                        { color: selectedMonths.includes(month.id) ? 'white' : theme.colors.text }
                      ]}
                    >
                      {month.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: theme.colors.accent }]}
                onPress={clearSelections}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.accent }]}>Filtreyi Temizle</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: theme.colors.accent }]}
                onPress={applyDateFilter}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

      </Modal>
    );
  };

  // Arama çubuğunu render et
  const renderSearchBar = () => {
    return (
      <View style={[styles.searchContainer, { backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Etkinlik ara..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}


      </View>
    );
  };

  // Harita modalı
  const renderMapModal = () => {
    const [mapError, setMapError] = useState<boolean>(false);

    // Haritayı yüklemeyi dene
    const handleMapRender = () => {
      try {
        return (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={konyaRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {/* Tüm etkinlikleri haritada göster */}
              {events.map(event => {
                // Sadece geçerli koordinatlara sahip etkinlikleri göster
                if (event.location_latitude && event.location_longitude) {
                  return (
                    <Marker
                      key={event.id}
                      coordinate={{
                        latitude: event.location_latitude,
                        longitude: event.location_longitude
                      }}
                      title={event.title}
                      description={event.location_name}
                      pinColor={theme.colors.accent}
                      onPress={() => {
                        setMapModalVisible(false);
                        setTimeout(() => {
                          navigation.navigate('EventDetail', { eventId: event.id });
                        }, 300);
                      }}
                    />
                  );
                }
                return null;
              })}
            </MapView>
          </View>
        );
      } catch (error) {
        // Hata durumunda true olarak ayarla
        setMapError(true);
        return null;
      }
    };

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity
              style={styles.mapBackButton}
              onPress={() => setMapModalVisible(false)}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.mapTitle, { color: theme.colors.text }]}>Etkinlik Konumları</Text>
          </View>

          {mapError ? (
            <View style={styles.mapErrorContainer}>
              <Ionicons name="map" size={50} color={theme.colors.textSecondary} style={styles.mapErrorIcon} />
              <Text style={[styles.mapErrorText, { color: theme.colors.text }]}>
                Harita yüklenirken bir hata oluştu.
              </Text>
              <Text style={[styles.mapErrorSubtext, { color: theme.colors.textSecondary }]}>
                Lütfen daha sonra tekrar deneyin veya liste görünümünden devam edin.
              </Text>
              <TouchableOpacity
                style={[styles.mapErrorButton, { backgroundColor: theme.colors.accent }]}
                onPress={() => setMapModalVisible(false)}
              >
                <Text style={styles.mapErrorButtonText}>Liste Görünümüne Dön</Text>
              </TouchableOpacity>
            </View>
          ) : handleMapRender()}
        </SafeAreaView>
      </Modal>
    );
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
          <View style={styles.headerIconsContainer}>
            <TouchableOpacity
              onPress={() => setDateModalVisible(true)}
              style={styles.filterButton}
            >
              <Ionicons
                name="calendar-outline"
                size={25}
                color={isDateFilterActive ? theme.colors.accent : theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMapModalVisible(true)}
              style={styles.filterButton}
            >
              <Ionicons
                name="map-outline"
                size={25}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: 8,
          paddingHorizontal: 16
        }}
      >
        {renderSearchBar()}
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

      {/* Date Filter */}
      {renderDatePickerModal()}

      {/* Map Modal */}
      {renderMapModal()}

      {/* Event List */}
      <EventList
        events={sortedEvents}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onEventPress={handleEventPress}
        emptyText={isDateFilterActive && (selectedMonths2025.length > 0 || selectedMonths2026.length > 0)
          ? `${getSelectedMonthsText()} için etkinlik bulunamadı.`
          : isSearchActive
            ? `"${searchQuery}" için sonuç bulunamadı.`
            : `Burada gösterilecek etkinlik bulunamadı.\nYeni bir etkinlik oluşturmak için butona dokunun.`
        }
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
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  dateFilterButton: {
    padding: 8,
    marginLeft: 4,
  },
  filterButton: {
    padding: 8,
    marginLeft: 4,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  yearButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  yearButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  monthsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    margin: 4,
    width: '30%',
    alignItems: 'center',
  },
  monthButtonText: {
    fontWeight: '500',
    fontSize: 14,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalButtonCancel: {
    borderWidth: 1,
    marginRight: 10,
  },
  modalButtonConfirm: {
    marginLeft: 10,
  },
  modalButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  mapBackButton: {
    padding: 8,
    marginRight: 12,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapErrorIcon: {
    marginBottom: 16,
  },
  mapErrorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mapErrorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  mapErrorButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  mapErrorButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginRight: 8,
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});