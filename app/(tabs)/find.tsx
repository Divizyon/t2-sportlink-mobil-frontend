import React, { useEffect, useState } from 'react';
import {
  Platform,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname, useRouter } from 'expo-router';
import { COLORS } from '../../src/constants';
import useThemeStore from '../../store/slices/themeSlice';
import EventDetailsPopup from '../../components/modals/EventDetailsPopup';
import {
  View,
  Text,
  SafeAreaView,
  HStack,
  Box,
  Center,
  Button,
  Pressable,
  VStack,
} from '@gluestack-ui/themed';

// Zustand store hook
import useFindStore from '../../features/find/hooks/useFindStore';

// Bileşenler
import EventCard from '../../features/find/components/EventCard';
import FacilityCard from '../../features/find/components/FacilityCard';
import PartnerCard from '../../features/find/components/PartnerCard';

// Types - Event tipini doğru konumdan import et
import type { Event as EventType } from '../../features/find/types';

/**
 * Bul tab ekranı
 * Kullanıcıların etkinlik, tesis ve spor arkadaşları aramasını sağlar
 */
export default function FindTab() {
  const { isDarkMode } = useThemeStore();
  const pathname = usePathname();
  const router = useRouter();
  const [partnerSportFilter, setPartnerSportFilter] = useState('Tümü');
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  // Zustand store'dan gelen state ve action'lar
  const {
    // State
    events,
    facilities,
    partners,
    searchQuery,
    selectedSportFilter,
    showAllEvents,
    activeTab,
    selectedEvent,
    showEventPopup,
    isLoading,
    showFacilitiesSkeleton,
    error,

    // Filtrelenmiş veriler
    filteredEvents,
    filteredFacilities,
    filteredPartners,

    // Actions
    loadEvents,
    loadFacilities,
    loadPartners,
    setSearchQuery,
    setSportFilter,
    setShowAllEvents,
    setActiveTab,
    joinEvent,
    leaveEvent,
    connectPartner,
    selectEvent,
    setShowEventPopup,
    resetView,

    // Helper fonksiyonlar
    isEventJoined,
    isPartnerConnected,
  } = useFindStore();

  // Spor türleri
  const sportTypes = ['Tümü', ...Array.from(new Set(events.map(event => event.sportType)))];

  // Partner spor türleri
  const partnerSportTypes = [
    'Tümü',
    ...Array.from(new Set(partners.map(partner => partner.preferredSports?.[0] || 'Diğer'))),
  ];

  // Filtrelenmiş partner'lar - Yalnızca spor türüne göre filtrele
  const filteredPartnersBySport = filteredPartners.filter(partner => {
    // Spor türü filtresi
    const sportFilter =
      partnerSportFilter === 'Tümü' ||
      partner.preferredSports?.includes(partnerSportFilter) ||
      false;

    return sportFilter;
  });

  // Bul tab'ına gelince ekranı sıfırla
  useEffect(() => {
    // Bottom bardaki "Bul" butonuna basıldığında pathname değişmese bile
    // handleResetView fonksiyonu _layout.tsx'deki handler sayesinde çağrılacak
    if (pathname === '/(tabs)/find') {
      resetView();
    }
  }, [pathname, resetView]);

  // Etkinlik detaylarını göster
  const handleShowEventDetails = (event: EventType) => {
    selectEvent(event);
    setShowEventPopup(true);
  };

  // Etkinlik popup'ını kapat
  const handleCloseEventPopup = () => {
    setShowEventPopup(false);
  };

  // Tümünü Gör butonuna tıklanınca
  const handleShowAllEvents = () => {
    setShowAllEvents(true);
    setSportFilter('Tümü'); // Varsayılan olarak "Tümü" seçilsin
    // Sayfayı etkinlikler moduna çevir
    setActiveTab('events');
  };

  // Tüm tesisleri göster
  const handleShowAllFacilities = () => {
    setShowAllEvents(true);
    // Sayfayı tesisler moduna çevir
    setActiveTab('facilities');
  };

  // Tüm spor arkadaşlarını göster
  const handleShowAllPartners = () => {
    setShowAllEvents(true);
    // Sayfayı spor arkadaşları moduna çevir
    setActiveTab('partners');
  };

  // Normal arayüze dönme işlevi
  const handleReturnToMainView = () => {
    resetView();
  };

  // Arama kutusunu temizleme işlevi
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Scroll pozisyonunu izleme
  const handleScroll = (event: any) => {
    // Y ekseninde 20 piksel veya daha fazla scroll yapıldıysa butonu göster
    // (200 yerine 20 yapıyorum, çok daha hassas olacak)
    const scrollY = event.nativeEvent.contentOffset.y;
    if (scrollY > 20 && !showScrollTopButton) {
      setShowScrollTopButton(true);
    } else if (scrollY <= 20 && showScrollTopButton) {
      setShowScrollTopButton(false);
    }
  };

  // Sayfayı yukarı kaydırma fonksiyonu
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Android için geri tuşunu yakalama işlevi
  useEffect(() => {
    if (Platform.OS === 'android' && showAllEvents) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // Tümünü Gör ekranında iken, geri tuşu basıldığında ana bul sayfasına dön
        resetView();
        return true; // Olayı tüket, varsayılan Android geri davranışını engelle
      });

      return () => backHandler.remove(); // Cleanup
    }
  }, [showAllEvents, resetView]);

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
            { paddingTop: 5 },
          ]}
        >
          {showAllEvents
            ? activeTab === 'events'
              ? 'Tüm Etkinlikler'
              : activeTab === 'facilities'
                ? 'Tüm Tesisler'
                : 'Tüm Spor Arkadaşları'
            : 'Keşfet'}
        </Text>
      </Box>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Daha sık scroll olaylarını yakala (16ms = ~60fps)
      >
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
            placeholder={
              activeTab === 'partners' ? 'Spor arkadaşları ara...' : 'Etkinlik veya tesis ara...'
            }
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

        {/* Tüm Etkinlikler veya Ana Sayfa */}
        {showAllEvents ? (
          <Box style={styles.allEventsContainer}>
            {/* Spor Türü Filtresi - Etkinlikler tab'inde göster */}
            {activeTab === 'events' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalFilterContainer}
              >
                {sportTypes.map((sport, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.filterBadge,
                      {
                        backgroundColor:
                          selectedSportFilter === sport
                            ? COLORS.accent
                            : isDarkMode
                              ? '#334155'
                              : COLORS.neutral.white,
                        borderColor: isDarkMode ? '#2D3748' : COLORS.neutral.light,
                      },
                    ]}
                    onPress={() => setSportFilter(sport)}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        {
                          color:
                            selectedSportFilter === sport
                              ? 'white'
                              : isDarkMode
                                ? COLORS.neutral.light
                                : COLORS.neutral.dark,
                        },
                      ]}
                    >
                      {sport}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* Partner Spor Türü Filtresi */}
            {activeTab === 'partners' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalFilterContainer}
              >
                {partnerSportTypes.map((sport, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.filterBadge,
                      {
                        backgroundColor:
                          partnerSportFilter === sport
                            ? COLORS.accent
                            : isDarkMode
                              ? '#334155'
                              : COLORS.neutral.white,
                        borderColor: isDarkMode ? '#2D3748' : COLORS.neutral.light,
                      },
                    ]}
                    onPress={() => setPartnerSportFilter(sport)}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        {
                          color:
                            partnerSportFilter === sport
                              ? 'white'
                              : isDarkMode
                                ? COLORS.neutral.light
                                : COLORS.neutral.dark,
                        },
                      ]}
                    >
                      {sport}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* İlgili içeriği göster */}
            {activeTab === 'events' ? (
              // Etkinlikler Listesi
              filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event as unknown as EventType}
                    isJoined={isEventJoined(event.id.toString())}
                    onPress={handleShowEventDetails}
                    onJoin={joinEvent}
                    onLeave={leaveEvent}
                    horizontal={false}
                  />
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
                    Filtre kriterlerine uygun etkinlik bulunamadı
                  </Text>
                </Center>
              )
            ) : activeTab === 'facilities' ? (
              // Tesisler Listesi
              filteredFacilities.length > 0 ? (
                filteredFacilities.map(facility => (
                  <FacilityCard
                    key={facility.id}
                    facility={facility}
                    onPress={facility => console.log('Tesis seçildi:', facility.name)}
                    horizontal={false}
                  />
                ))
              ) : (
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
                    Yakınızda tesis bulunamadı
                  </Text>
                  <Button
                    style={[styles.createButton, { backgroundColor: COLORS.accent }]}
                    onPress={loadFacilities}
                  >
                    <Text style={styles.createButtonText}>Tesisleri Keşfet</Text>
                  </Button>
                </Center>
              )
            ) : // Spor Arkadaşları Listesi - Tümünü Gör ekranında dikdörtgen kartlar
            filteredPartnersBySport.length > 0 ? (
              <VStack width="100%" paddingHorizontal={16}>
                {filteredPartnersBySport.map(partner => (
                  <PartnerCard
                    key={partner.id}
                    partner={partner}
                    isConnected={isPartnerConnected(partner.id)}
                    onPress={partner => console.log('Partner seçildi:', partner.name)}
                    onConnect={connectPartner}
                    horizontal={false}
                  />
                ))}
              </VStack>
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
                  {searchQuery
                    ? 'Arama kriterlerine uygun spor arkadaşı bulunamadı'
                    : 'Yakınızda spor arkadaşı bulunamadı'}
                </Text>
                <Button
                  style={[styles.createButton, { backgroundColor: COLORS.accent }]}
                  onPress={loadPartners}
                >
                  <Text style={styles.createButtonText}>Arkadaş Bul</Text>
                </Button>
              </Center>
            )}
          </Box>
        ) : (
          <>
            {/* Yakındaki Etkinlikler Başlığı - ARTIK İLK GÖRÜNECEK */}
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
            {filteredEvents.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalCardsContainer}
              >
                {filteredEvents.slice(0, 3).map(event => (
                  <EventCard
                    key={event.id}
                    event={event as unknown as EventType}
                    isJoined={isEventJoined(event.id.toString())}
                    onPress={handleShowEventDetails}
                    onJoin={joinEvent}
                    onLeave={leaveEvent}
                    horizontal={true}
                  />
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
                  onPress={loadEvents}
                >
                  <Text style={styles.createButtonText}>Etkinlikleri Keşfet</Text>
                </Button>
              </Center>
            )}

            {/* Yakındaki Spor Arkadaşları Başlığı - İKİNCİ SIRA */}
            <HStack style={styles.sectionHeader} justifyContent="space-between" alignItems="center">
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                ]}
              >
                Spor Arkadaşları
              </Text>
              <Pressable onPress={handleShowAllPartners}>
                <Text style={[styles.seeAllText, { color: COLORS.accent }]}>Tümünü Gör</Text>
              </Pressable>
            </HStack>

            {/* Spor Arkadaşları Listesi - Ana ekranda yatay kartlar */}
            {filteredPartners.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalCardsContainer}
              >
                {filteredPartners.slice(0, 5).map(partner => (
                  <PartnerCard
                    key={partner.id}
                    partner={partner}
                    isConnected={isPartnerConnected(partner.id)}
                    onPress={partner => console.log('Partner seçildi:', partner.name)}
                    onConnect={connectPartner}
                    horizontal={true}
                  />
                ))}
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
                <Button
                  style={[styles.createButton, { backgroundColor: COLORS.accent }]}
                  onPress={loadPartners}
                >
                  <Text style={styles.createButtonText}>Arkadaş Bul</Text>
                </Button>
              </Center>
            )}

            {/* Popüler Tesisler Başlığı - ÜÇÜNCÜ SIRA */}
            <HStack style={styles.sectionHeader} justifyContent="space-between" alignItems="center">
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
                ]}
              >
                Yakınımdaki Tesisler
              </Text>
              <Pressable onPress={handleShowAllFacilities}>
                <Text style={[styles.seeAllText, { color: COLORS.accent }]}>Tümünü Gör</Text>
              </Pressable>
            </HStack>

            {/* Tesisler kısmı */}
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
                contentContainerStyle={styles.horizontalCardsContainer}
              >
                {filteredFacilities.map(facility => (
                  <FacilityCard
                    key={facility.id}
                    facility={facility}
                    onPress={facility => console.log('Tesis seçildi:', facility.name)}
                    horizontal={true}
                  />
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
                  onPress={loadFacilities}
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
        isJoined={selectedEvent ? isEventJoined(selectedEvent.id.toString()) : false}
        onJoin={joinEvent}
        onLeave={leaveEvent}
      />

      {/* Yukarı kaydırma butonu veya Geri dönme butonu */}
      {showAllEvents && showScrollTopButton && (
        <Pressable
          // Hem yukarı kaydırma hem de ana sayfaya dönme işlevi yapalım
          onPress={() => {
            if (Platform.OS === 'ios') {
              // iOS'ta uzun basılınca ana sayfaya dön, normal tıklama yukarı kaydırır
              resetView();
            } else {
              // Android'de sadece yukarı kaydır, geri tuşu zaten ana sayfaya dönecek
              scrollToTop();
            }
          }}
          onLongPress={resetView} // Uzun basılırsa her zaman ana sayfaya dön (Android ve iOS)
          style={[
            styles.floatingBackButton,
            {
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: COLORS.accent,
              opacity: showScrollTopButton ? 1 : 0,
            },
          ]}
        >
          <Ionicons
            name={Platform.OS === 'ios' ? 'arrow-back' : 'arrow-up'}
            size={26}
            color={COLORS.accent}
          />
        </Pressable>
      )}
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
    paddingBottom: 80, // Bottom tab'a göre padding
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
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
    marginTop: 16,
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
  allEventsContainer: {
    marginTop: 12,
    marginBottom: 12,
    position: 'relative', // Floating button için position relative ekliyorum
    minHeight: 400, // Min height ekliyorum, içerik az olduğunda da floating butonun alt tarafta durması için
  },
  floatingBackButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    zIndex: 9999,
  },
  horizontalFilterContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  horizontalCardsContainer: {
    paddingLeft: 16,
    paddingBottom: 16,
    alignItems: 'flex-start',
  },
  filterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
