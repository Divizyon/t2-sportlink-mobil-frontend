import React, { useState, useEffect } from 'react';
import { Platform, Animated, Modal, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { COLORS } from '../../src/constants';
import useThemeStore from '../../store/slices/themeSlice';
import { useFacilities } from '../../src/hooks/useFacilities';
import EventDetailsPopup from '../../components/modals/EventDetailsPopup';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Image,
  VStack,
  HStack,
  Box,
  Center,
  Button,
  Badge,
  Pressable,
} from '@gluestack-ui/themed';

// Etkinlik için tip tanımı
interface Event {
  id: number;
  title: string;
  location: string;
  distance: string;
  date: string;
  participants: string;
  sportType: string;
  creator: string;
  description?: string; // Etkinlik açıklaması - opsiyonel
}

// Tesis için tip tanımı
interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  distance: string;
  rating?: number;
  image?: string | undefined;
}

// Arama için dummy veri ekleyelim
const dummySearchData = [
  {
    id: 101,
    title: 'Halı Saha Maçı',
    type: 'Etkinlik',
    sportType: 'Futbol',
    location: 'Beşiktaş Halı Saha',
  },
  {
    id: 102,
    title: 'Basketbol Turnuvası',
    type: 'Etkinlik',
    sportType: 'Basketbol',
    location: 'Kadıköy Sahası',
  },
  {
    id: 103,
    title: 'Tenis Kulübü',
    type: 'Tesis',
    sportType: 'Tenis',
    location: 'Şişli Tenis Kortları',
  },
  { id: 104, title: 'Fitness Club', type: 'Tesis', sportType: 'Fitness', location: 'Beşiktaş' },
  {
    id: 105,
    title: 'Yüzme Antrenmanı',
    type: 'Etkinlik',
    sportType: 'Yüzme',
    location: 'Olimpik Havuz',
  },
];

/**
 * Bul tab ekranı
 * Kullanıcıların etkinlik, tesis ve spor arkadaşları aramasını sağlar
 */
export default function FindTab() {
  const { isDarkMode } = useThemeStore();
  const [showFacilitiesSkeleton, setShowFacilitiesSkeleton] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSportFilter, setSelectedSportFilter] = useState<string | null>(null);
  // Katılınan etkinlikleri takip etmek için bir state ekleyelim
  const [joinedEventIds, setJoinedEventIds] = useState<number[]>([]);
  // Bağlantı kurulan spor arkadaşlarını takip etmek için state
  const [connectedPartnerIds, setConnectedPartnerIds] = useState<string[]>([]);
  // Bağlantı isteği gönderildiğinde animasyon için state
  const [requestSuccessAnimation] = useState(new Animated.Value(0));
  // Bağlantı isteği gönderilen partner ID'sini takip etmek için
  const [connectionRequestSentTo, setConnectionRequestSentTo] = useState<string | null>(null);

  // Tarih filtresi için basit state'ler - DateTimePicker olmadan
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const pathname = usePathname();

  // Bul tab'ına gelince ekranı sıfırla
  useEffect(() => {
    // Bottom bardaki "Bul" butonuna basıldığında pathname değişmese bile
    // handleResetView fonksiyonu _layout.tsx'deki handler sayesinde çağrılacak
    if (pathname === '/(tabs)/find') {
      handleResetView();
    }
  }, [pathname]);

  // Ekranı tamamen sıfırlama işlevi
  const handleResetView = () => {
    setShowAllEvents(false);
    setSelectedSportFilter(null);
    setSearchQuery('');
    setSearchResults([]);
    if (showEventPopup) {
      setShowEventPopup(false);
      setSelectedEvent(null);
    }
  };

  // Search query değiştiğinde
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const results = dummySearchData.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.sportType.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query),
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleShowEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowEventPopup(true);
  };

  const handleCloseEventPopup = () => {
    setShowEventPopup(false);
  };

  // Etkinliğe katılma işlemini gerçekleştiren fonksiyon
  const handleJoinEvent = (eventId: number) => {
    // Etkinliğe katılma durumunu kaydet
    setJoinedEventIds(prevIds => [...prevIds, eventId]);
  };

  // Etkinlikten ayrılma işlemini gerçekleştiren fonksiyon
  const handleLeaveEvent = (eventId: number) => {
    // Etkinlikten ayrılma durumunu kaydet
    setJoinedEventIds(prevIds => prevIds.filter(id => id !== eventId));
  };

  // Yakındaki spor arkadaşları için dummy veri
  const sportsPartners = [
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      age: 28,
      distance: '1.2 km',
      sport: 'Futbol',
      avatar: null, // Gerçek uygulamada burada avatar URL'si olacak
    },
    {
      id: '2',
      name: 'Ayşe Kaya',
      age: 24,
      distance: '1.5 km',
      sport: 'Tenis',
      avatar: null,
    },
    {
      id: '3',
      name: 'Mehmet Demir',
      age: 30,
      distance: '2.0 km',
      sport: 'Basketbol',
      avatar: null,
    },
  ];

  // Yakındaki etkinlikler için dummy veriler
  const nearbyEvents: Event[] = [
    {
      id: 1,
      title: 'Halı Saha Maçı',
      location: 'Beşiktaş Halı Saha',
      distance: '1.5 km',
      date: 'Yarın, 10:00',
      participants: '8/14',
      sportType: 'Futbol',
      creator: 'Ahmet Y.',
      description:
        'Haftasonu eğlenceli bir maç yapmak için toplanıyoruz. Her seviyeden oyuncu katılabilir. Takımlar yerinde oluşturulacak. Katılım ücreti kişi başı 30 TL olup, maç sonrası içecekler dahildir.',
    },
    {
      id: 2,
      title: 'Basketbol Turnuvası',
      location: 'Kadıköy Basketbol Sahası',
      distance: '3.2 km',
      date: 'Cumartesi, 15:00',
      participants: '6/12',
      sportType: 'Basketbol',
      creator: 'Ayşe K.',
      description:
        'Sokak basketbolu etkinliğimize davetlisiniz. 3x3 formatında oynanacak, kazanan takıma küçük ödüller var. Başlangıç ve orta seviye oyuncular için uygundur.',
    },
    {
      id: 3,
      title: 'Tenis Etkinliği',
      location: 'İstanbul Tenis Kulübü',
      distance: '4.7 km',
      date: 'Pazar, 09:00',
      participants: '4/8',
      sportType: 'Tenis',
      creator: 'Mehmet D.',
      description:
        'Haftalık tenis buluşmamıza katılmak ister misiniz? Kort ücreti ortak karşılanacaktır. Raketinizi getirmeniz yeterlidir. Her seviyeden oyuncuyu bekliyoruz.',
    },
    {
      id: 4,
      title: 'Yüzme Buluşması',
      location: 'Olimpik Yüzme Havuzu',
      distance: '6.3 km',
      date: 'Pazartesi, 18:30',
      participants: '5/10',
      sportType: 'Yüzme',
      creator: 'Can A.',
      description:
        'Havuzda grup halinde yüzme antrenmanı yapacağız. Temel yüzme teknikleri gösterilecek ve kondisyon çalışması yapılacaktır. Yüzme bonesi ve gözlüğünüzü getirmeyi unutmayın.',
    },
    {
      id: 5,
      title: 'Bisiklet Turu',
      location: 'Belgrad Ormanı',
      distance: '8.1 km',
      date: 'Çarşamba, 08:00',
      participants: '12/20',
      sportType: 'Bisiklet',
      creator: 'Zeynep T.',
      description:
        "Doğa içinde yaklaşık 25km'lik bir parkurda bisiklet süreceğiz. Orta zorlukta bir parkur olup, kendi bisikletinizi getirmeniz gerekmektedir. Kask takmak zorunludur.",
    },
  ];

  // Etkinlikleri mesafeye göre sırala
  const sortedEvents = [...nearbyEvents].sort((a, b) => {
    const distanceA = parseFloat(a.distance.split(' ')[0]);
    const distanceB = parseFloat(b.distance.split(' ')[0]);
    return distanceA - distanceB;
  });

  // Spor türlerine göre filtreleme işlevi
  const sportTypes = ['Tümü', ...Array.from(new Set(nearbyEvents.map(event => event.sportType)))];

  // Tarihe göre filtreleme fonksiyonu - basitleştirilmiş sürüm
  const filteredEventsByDate = (events: Event[]) => {
    if (!selectedDate) return events;

    // Şimdilik hiç filtreleme yapmayalım, hataları düzeltmek için
    return events;
  };

  // Tarih filtresini temizle
  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  // Filtrelenmiş etkinlikler - önce arama sonra spor türü filtrelemesi
  const filteredEvents = sortedEvents.filter(event => {
    // Arama filtresi
    if (
      searchQuery &&
      !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.sportType.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Spor türü filtresi
    if (
      selectedSportFilter &&
      selectedSportFilter !== 'Tümü' &&
      event.sportType !== selectedSportFilter
    ) {
      return false;
    }

    return true;
  });

  // Ana liste görünümünde filtrelenmiş etkinlikler
  const allFilteredEvents = filteredEventsByDate(filteredEvents);

  // Yakındaki tesisler için dummy veri
  const dummyFacilities: Facility[] = [
    {
      id: '1',
      name: 'Fitness Club',
      type: 'Spor Salonu',
      address: 'Beşiktaş, İstanbul',
      distance: '0.8 km',
      rating: 4.7,
      image: undefined,
    },
    {
      id: '2',
      name: 'Olimpik Yüzme Havuzu',
      type: 'Yüzme Tesisi',
      address: 'Kadıköy, İstanbul',
      distance: '1.3 km',
      rating: 4.2,
      image: undefined,
    },
    {
      id: '3',
      name: 'Tenis Kortları',
      type: 'Tenis Kulübü',
      address: 'Şişli, İstanbul',
      distance: '2.5 km',
      rating: 4.5,
      image: undefined,
    },
    {
      id: '4',
      name: 'CrossFit Box',
      type: 'Spor Salonu',
      address: 'Etiler, İstanbul',
      distance: '3.1 km',
      rating: 4.8,
      image: undefined,
    },
    {
      id: '5',
      name: 'Basketbol Sahası',
      type: 'Açık Alan Tesis',
      address: 'Levent, İstanbul',
      distance: '3.6 km',
      rating: 4.0,
      image: undefined,
    },
  ];

  // Filtrelenmiş tesisler
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // İlk yükleme için
  useEffect(() => {
    // Backend bağlantısı yerine dummy veri kullanıyoruz
    setTimeout(() => {
      setFilteredFacilities(dummyFacilities);
      setIsLoading(false);
    }, 1500); // 1.5 saniye gecikme ile yükleme simülasyonu
  }, []);

  // İlk yüklemede skeleton ekranı göster
  useEffect(() => {
    if (filteredFacilities.length > 0 || (!isLoading && filteredFacilities.length === 0)) {
      setShowFacilitiesSkeleton(false);
    }
  }, [filteredFacilities, isLoading]);

  // Tümünü Gör butonuna tıklanınca
  const handleShowAllEvents = () => {
    setShowAllEvents(true);
    setSelectedSportFilter('Tümü'); // Varsayılan olarak "Tümü" seçilsin
  };

  // Tesisleri yükle/görüntüle
  const handleExploreFacilities = () => {
    // Tesisleri yeniden yükle
    setShowFacilitiesSkeleton(true);
    setIsLoading(true);

    // Backend bağlantısı yerine dummy veri yenileme simülasyonu
    setTimeout(() => {
      // Mesafe bilgisine göre sırala - en yakındakiler önce
      const sortedFacilities = [...dummyFacilities].sort((a, b) => {
        const distanceA = parseFloat(a.distance.split(' ')[0]);
        const distanceB = parseFloat(b.distance.split(' ')[0]);
        return distanceA - distanceB;
      });

      setFilteredFacilities(sortedFacilities);
      setIsLoading(false);
    }, 1000);
  };

  // Normal arayüze dönme işlevi
  const handleReturnToMainView = () => {
    setShowAllEvents(false);
    setSelectedSportFilter(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Arama kutusunu temizleme işlevi
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Spor arkadaşıyla bağlantı kurma işlemini gerçekleştiren fonksiyon
  const handleConnectPartner = (partnerId: string) => {
    // Eğer zaten bağlantı kurulduysa işlem yapma
    if (connectedPartnerIds.includes(partnerId)) {
      // İstek gönderilmişse ve kullanıcı butona tekrar basarsa isteği geri çek
      setConnectedPartnerIds(prevIds => prevIds.filter(id => id !== partnerId));
      return;
    }

    // Animasyon reset
    requestSuccessAnimation.setValue(0);

    // Bağlantı isteği gönderildiğini state'e kaydet
    setConnectionRequestSentTo(partnerId);

    // Animasyon başlat
    Animated.timing(requestSuccessAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // 2 saniye sonra bağlantı kurulan spor arkadaşını state'e ekle
    setTimeout(() => {
      setConnectedPartnerIds(prevIds => [...prevIds, partnerId]);
      setConnectionRequestSentTo(null);

      // Animasyonu geri kapat
      Animated.timing(requestSuccessAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 2000);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#0F172A' : COLORS.neutral.silver },
      ]}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <Box
        style={[styles.header, { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white }]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
          ]}
        >
          {showAllEvents ? 'Tüm Etkinlikler' : 'Keşfet'}
        </Text>
      </Box>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Arama Kutusu */}
        <Box
          style={[
            styles.searchContainer,
            { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
          ]}
          flexDirection="row"
          alignItems="center"
        >
          <Ionicons
            name="search"
            size={20}
            color={isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
            ]}
            placeholder="Etkinlik veya tesis ara..."
            placeholderTextColor={isDarkMode ? '#718096' : '#A0AEC0'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable style={styles.filterButton} onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color={COLORS.accent} />
            </Pressable>
          ) : null}
        </Box>

        {/* Arama Sonuçları */}
        {searchQuery && searchResults.length > 0 && !showAllEvents && (
          <VStack style={styles.searchResultsContainer}>
            {searchResults.map(item => (
              <Pressable
                key={item.id}
                style={[
                  styles.searchResultItem,
                  { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
                ]}
                onPress={() => {
                  // Etkinlik ise etkinlik detayını göster, tesis ise tesise git
                  if (item.type === 'Etkinlik') {
                    const matchedEvent = nearbyEvents.find(e => e.title === item.title);
                    if (matchedEvent) handleShowEventDetails(matchedEvent);
                  }
                  // Tesisler için gelecekte yapılacak
                }}
              >
                <Box style={styles.searchResultIconContainer}>
                  <Ionicons
                    name={item.type === 'Etkinlik' ? 'calendar' : 'business'}
                    size={20}
                    color={COLORS.accent}
                  />
                </Box>
                <VStack style={styles.searchResultTextContainer}>
                  <Text
                    style={[
                      styles.searchResultTitle,
                      { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.searchResultSubtitle,
                      { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                    ]}
                  >
                    {item.sportType} • {item.location}
                  </Text>
                </VStack>
                <Text style={[styles.searchResultType, { color: COLORS.accent }]}>{item.type}</Text>
              </Pressable>
            ))}
          </VStack>
        )}

        {/* Tüm Etkinlikler veya Ana Sayfa */}
        {showAllEvents ? (
          <Box style={styles.allEventsContainer}>
            <HStack style={styles.allEventsHeader}>
              <Pressable onPress={handleReturnToMainView} style={styles.returnButton}>
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={isDarkMode ? COLORS.neutral.white : COLORS.primary}
                />
              </Pressable>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                ]}
              >
                {searchQuery ? 'Arama Sonuçları' : 'Tüm Etkinlikler'}
              </Text>
            </HStack>

            {/* Spor Türü Filtresi */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sportFilterContainer}
            >
              {sportTypes.map((sportType, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.sportFilterItem,
                    selectedSportFilter === sportType && styles.sportFilterItemActive,
                    {
                      backgroundColor:
                        selectedSportFilter === sportType
                          ? COLORS.accent
                          : isDarkMode
                            ? '#1E293B'
                            : COLORS.neutral.white,
                      borderColor: isDarkMode ? '#2D3748' : COLORS.neutral.light,
                    },
                  ]}
                  onPress={() => setSelectedSportFilter(sportType)}
                >
                  <Text
                    style={[
                      styles.sportFilterText,
                      {
                        color:
                          selectedSportFilter === sportType
                            ? COLORS.neutral.white
                            : isDarkMode
                              ? COLORS.neutral.light
                              : COLORS.neutral.dark,
                      },
                    ]}
                  >
                    {sportType}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {allFilteredEvents.length > 0 ? (
              allFilteredEvents.map(event => (
                <Pressable
                  key={event.id}
                  style={[
                    styles.verticalEventCard,
                    { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
                  ]}
                  onPress={() => handleShowEventDetails(event)}
                >
                  <HStack style={styles.verticalEventHeader}>
                    <Badge style={styles.sportBadge}>
                      <Text style={styles.sportBadgeText}>{event.sportType}</Text>
                    </Badge>
                    <Text
                      style={[
                        styles.eventDistance,
                        { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                      ]}
                    >
                      {event.distance}
                    </Text>
                  </HStack>

                  <Text
                    style={[
                      styles.verticalEventTitle,
                      { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                    ]}
                  >
                    {event.title}
                  </Text>

                  <HStack style={styles.eventDetailRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={COLORS.accent}
                      style={styles.eventDetailIcon}
                    />
                    <Text
                      style={[
                        styles.eventDetailText,
                        { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                      ]}
                    >
                      {event.date}
                    </Text>
                  </HStack>

                  <HStack style={styles.eventDetailRow}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={COLORS.accent}
                      style={styles.eventDetailIcon}
                    />
                    <Text
                      style={[
                        styles.eventDetailText,
                        { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                      ]}
                    >
                      {event.location}
                    </Text>
                  </HStack>

                  <HStack style={styles.eventFooter}>
                    <HStack style={styles.eventParticipants}>
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color={isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark}
                      />
                      <Text
                        style={[
                          styles.eventParticipantsText,
                          { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                        ]}
                      >
                        {event.participants}
                      </Text>
                    </HStack>
                    <Text
                      style={[
                        styles.eventCreator,
                        { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                      ]}
                    >
                      {event.creator}
                    </Text>
                  </HStack>
                </Pressable>
              ))
            ) : (
              <Center style={styles.emptyStateContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={70}
                  color={isDarkMode ? '#2D3748' : COLORS.neutral.light}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                  ]}
                >
                  Aradığınız kriterlere uygun etkinlik bulunamadı
                </Text>
              </Center>
            )}
          </Box>
        ) : (
          <>
            {/* Yakındaki Spor Arkadaşları Başlığı */}
            <HStack style={styles.sectionHeader} justifyContent="space-between" alignItems="center">
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                ]}
              >
                Yakındaki Spor Arkadaşları
              </Text>
              <Pressable>
                <Text style={[styles.seeAllText, { color: COLORS.accent }]}>Tümünü Gör</Text>
              </Pressable>
            </HStack>

            {/* Spor Arkadaşları Listesi */}
            {sportsPartners.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.partnersContainer}
              >
                {sportsPartners.map(partner => {
                  const isConnected = connectedPartnerIds.includes(partner.id);
                  const isRequestSent = connectionRequestSentTo === partner.id;

                  return (
                    <Pressable
                      key={partner.id}
                      style={[
                        styles.partnerCard,
                        { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
                      ]}
                    >
                      <Box style={styles.partnerAvatarContainer}>
                        {partner.avatar ? (
                          <Image source={{ uri: partner.avatar }} style={styles.partnerAvatar} />
                        ) : (
                          <Center
                            style={[
                              styles.partnerAvatarPlaceholder,
                              { backgroundColor: COLORS.accent },
                            ]}
                          >
                            <Text style={styles.partnerAvatarText}>
                              {partner.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </Text>
                          </Center>
                        )}
                      </Box>
                      <Text
                        style={[
                          styles.partnerName,
                          { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                        ]}
                      >
                        {partner.name}
                      </Text>
                      <Text
                        style={[
                          styles.partnerDetail,
                          { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                        ]}
                      >
                        {partner.age} yaş • {partner.sport}
                      </Text>
                      <Text style={[styles.partnerDistance, { color: COLORS.accent }]}>
                        {partner.distance} uzaklıkta
                      </Text>

                      {isRequestSent ? (
                        <Animated.View
                          style={[
                            styles.connectButton,
                            {
                              backgroundColor: '#4CAF50', // Yeşil renk
                              opacity: requestSuccessAnimation,
                            },
                          ]}
                        >
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="white"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.connectButtonText}>İstek Gönderildi</Text>
                        </Animated.View>
                      ) : isConnected ? (
                        <Pressable
                          style={[styles.connectButton, { backgroundColor: '#FF7043' }]}
                          onPress={() => handleConnectPartner(partner.id)}
                        >
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="white"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.connectButtonText}>İstek Geri Çek</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          style={[styles.connectButton, { backgroundColor: COLORS.accent }]}
                          onPress={() => handleConnectPartner(partner.id)}
                        >
                          <Text style={styles.connectButtonText}>Bağlantı Kur</Text>
                        </Pressable>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : (
              <Center style={styles.emptyStateContainer}>
                <Ionicons
                  name="people-outline"
                  size={70}
                  color={isDarkMode ? '#2D3748' : COLORS.neutral.light}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                  ]}
                >
                  Yakınızda spor arkadaşı bulunamadı
                </Text>
                <Button style={[styles.createButton, { backgroundColor: COLORS.accent }]}>
                  <Text style={styles.createButtonText}>Arkadaş Bul</Text>
                </Button>
              </Center>
            )}

            {/* Yakındaki Etkinlikler Başlığı */}
            <HStack style={styles.sectionHeader} justifyContent="space-between" alignItems="center">
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                ]}
              >
                Yakındaki Etkinlikler
              </Text>
              <Pressable onPress={handleShowAllEvents}>
                <Text style={[styles.seeAllText, { color: COLORS.accent }]}>Tümünü Gör</Text>
              </Pressable>
            </HStack>

            {/* Etkinlik Kartları */}
            {nearbyEvents.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eventsContainer}
              >
                {filteredEventsByDate(sortedEvents)
                  .slice(0, 3)
                  .map(event => (
                    <Pressable
                      key={event.id}
                      style={[
                        styles.eventCard,
                        { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
                      ]}
                      onPress={() => handleShowEventDetails(event)}
                    >
                      <Badge style={styles.eventBadge}>
                        <Text style={styles.eventBadgeText}>{event.sportType}</Text>
                      </Badge>

                      <Text
                        style={[
                          styles.eventTitle,
                          { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                        ]}
                      >
                        {event.title}
                      </Text>

                      <HStack style={styles.eventDetailRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color={COLORS.accent}
                          style={styles.eventDetailIcon}
                        />
                        <Text
                          style={[
                            styles.eventDetailText,
                            { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                          ]}
                        >
                          {event.date}
                        </Text>
                      </HStack>

                      <HStack style={styles.eventDetailRow}>
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color={COLORS.accent}
                          style={styles.eventDetailIcon}
                        />
                        <Text
                          style={[
                            styles.eventDetailText,
                            { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                          ]}
                        >
                          {event.location} • {event.distance}
                        </Text>
                      </HStack>

                      <HStack style={styles.eventFooter}>
                        <HStack style={styles.eventParticipants}>
                          <Ionicons
                            name="people-outline"
                            size={16}
                            color={isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark}
                          />
                          <Text
                            style={[
                              styles.eventParticipantsText,
                              { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                            ]}
                          >
                            {event.participants}
                          </Text>
                        </HStack>
                        <Text
                          style={[
                            styles.eventCreator,
                            { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                          ]}
                        >
                          {event.creator}
                        </Text>
                      </HStack>
                    </Pressable>
                  ))}
              </ScrollView>
              
            ) : (
              <Center style={styles.emptyStateContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={70}
                  color={isDarkMode ? '#2D3748' : COLORS.neutral.light}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                  ]}
                >
                  Yakınızda etkinlik görmek için keşfedin
                </Text>
                <Button
                  style={[styles.createButton, { backgroundColor: COLORS.accent }]}
                  onPress={handleShowAllEvents}
                >
                  <Text style={styles.createButtonText}>Etkinlikleri Keşfet</Text>
                </Button>
              </Center>
            )}

            {/* Popüler Tesisler Başlığı */}
            <HStack style={styles.sectionHeader} justifyContent="space-between" alignItems="center">
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                ]}
              >
                Yakınımdaki Tesisler
              </Text>
              <Pressable>
                <Text style={[styles.seeAllText, { color: COLORS.accent }]}>Tümünü Gör</Text>
              </Pressable>
            </HStack>

            {/* Tesisler Yükleniyor */}
            {isLoading && showFacilitiesSkeleton ? (
              <Center style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text
                  style={[
                    styles.loadingText,
                    { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                  ]}
                >
                  Tesisler yükleniyor...
                </Text>
              </Center>
            ) : filteredFacilities.length > 0 ? (
              // Tesisler Listesi
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.facilitiesContainer}
              >
                {filteredFacilities.map(facility => (
                  <Pressable
                    key={facility.id}
                    style={[
                      styles.facilityCard,
                      { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
                    ]}
                  >
                    <Box style={styles.facilityImageContainer}>
                      {facility.image ? (
                        <Image source={{ uri: facility.image }} style={styles.facilityImage} />
                      ) : (
                        <Center
                          style={[
                            styles.facilityImagePlaceholder,
                            { backgroundColor: isDarkMode ? '#334155' : COLORS.neutral.light },
                          ]}
                        >
                          <Ionicons
                            name="business-outline"
                            size={30}
                            color={isDarkMode ? COLORS.neutral.white : COLORS.primary}
                          />
                        </Center>
                      )}
                    </Box>
                    <VStack style={styles.facilityContent}>
                      <Text
                        style={[
                          styles.facilityName,
                          { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                        ]}
                      >
                        {facility.name}
                      </Text>
                      <Text
                        style={[
                          styles.facilityType,
                          { color: isDarkMode ? COLORS.accent : COLORS.accent },
                        ]}
                      >
                        {facility.type}
                      </Text>
                      <Text
                        style={[
                          styles.facilityAddress,
                          { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                        ]}
                      >
                        {facility.address}
                      </Text>
                      {facility.distance && (
                        <Text
                          style={[
                            styles.facilityDistance,
                            { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                          ]}
                        >
                          {facility.distance} uzaklıkta
                        </Text>
                      )}
                      {facility.rating && (
                        <HStack style={styles.ratingContainer}>
                          {Array.from({ length: 5 }).map((_, i) => {
                            const rating = facility.rating || 0;
                            return (
                              <Ionicons
                                key={i}
                                name={
                                  i < Math.floor(rating)
                                    ? 'star'
                                    : i < rating
                                      ? 'star-half'
                                      : 'star-outline'
                                }
                                size={16}
                                color="#FFD700"
                                style={{ marginRight: 2 }}
                              />
                            );
                          })}
                        </HStack>
                      )}
                    </VStack>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              // Boş durum - Tesis bulunamadı
              <Center style={styles.emptyStateContainer}>
                <Ionicons
                  name="business-outline"
                  size={70}
                  color={isDarkMode ? '#2D3748' : COLORS.neutral.light}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                  ]}
                >
                  {error
                    ? 'Tesisler yüklenirken hata oluştu'
                    : 'Yakınızda tesisleri görmek için keşfedin'}
                </Text>
                <Button
                  style={[styles.createButton, { backgroundColor: COLORS.accent }]}
                  onPress={handleExploreFacilities}
                >
                  <Text style={styles.createButtonText}>Tesisleri Keşfet</Text>
                </Button>
              </Center>
            )}
          </>
        )}
      </ScrollView>

      {/* Event Details Popup */}
      <EventDetailsPopup
        event={selectedEvent}
        visible={showEventPopup}
        onClose={handleCloseEventPopup}
        isDarkMode={isDarkMode}
        showMap={true}
        isJoined={selectedEvent ? joinedEventIds.includes(selectedEvent.id) : false}
        onJoin={handleJoinEvent}
        onLeave={handleLeaveEvent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginVertical: 18,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginVertical: 12,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  partnersContainer: {
    paddingRight: 16,
    paddingBottom: 10,
    marginBottom: 14,
  },
  partnerCard: {
    width: 110,
    borderRadius: 16,
    padding: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  partnerAvatarContainer: {
    marginBottom: 4,
  },
  partnerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
  },
  partnerAvatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  partnerName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  partnerDetail: {
    fontSize: 11,
    marginBottom: 2,
    textAlign: 'center',
  },
  partnerDistance: {
    fontSize: 10,
    marginBottom: 6,
    textAlign: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  eventsContainer: {
    paddingRight: 16,
    paddingBottom: 10,
    marginBottom: 14,
  },
  eventCard: {
    width: 200,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  eventBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
  },
  eventBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailIcon: {
    marginRight: 6,
  },
  eventDetailText: {
    fontSize: 13,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  eventParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventParticipantsText: {
    fontSize: 12,
    marginLeft: 4,
  },
  eventCreator: {
    fontSize: 12,
  },
  facilitiesContainer: {
    paddingRight: 16,
    paddingBottom: 10,
  },
  facilityCard: {
    width: 200,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  facilityImageContainer: {
    width: '100%',
    height: 120,
  },
  facilityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  facilityImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityContent: {
    padding: 12,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  facilityType: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  facilityAddress: {
    fontSize: 12,
    marginBottom: 4,
  },
  facilityDistance: {
    fontSize: 12,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allEventsContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  allEventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12, // Başlık ile arasında mesafe
    padding: 4,
  },
  sportFilterContainer: {
    paddingVertical: 4,
    marginBottom: 12,
    flexDirection: 'row',
  },
  sportFilterItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportFilterItemActive: {
    borderWidth: 0,
  },
  sportFilterText: {
    fontSize: 12,
    fontWeight: '500',
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
  sportBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
  },
  sportBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  verticalEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  eventDistance: {
    fontSize: 10,
  },
  searchResultsContainer: {
    marginVertical: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchResultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultSubtitle: {
    fontSize: 13,
  },
  searchResultType: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 20,
  },
  dateFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
