import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
  Animated,
  Platform
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useHomeStore } from '../../store/appStore/homeStore';
import { useAuthStore } from '../../store/userStore/authStore';
import { Event } from '../../types/eventTypes/event.types';
import { News, Sport, Announcement } from '../../types/apiTypes/api.types';
import { Ionicons } from '@expo/vector-icons';

// Komponentler
import Banner from '../../components/Home/Banner/Banner';
import SectionHeader from '../../components/Home/SectionHeader/SectionHeader';
import EventCardSmall from '../../components/Home/EventCardSmall/EventCardSmall';
import NewsCard from '../../components/Home/NewsCard/NewsCard';
import SportCategories from '../../components/Home/SportCategories/SportCategories';
import AnnouncementCard from '../../components/Home/AnnouncementCard/AnnouncementCard';

// Navigasyon için type tanımı
type RootStackParamList = {
  EventDetail: { eventId: string };
  EventsList: undefined;
  NewsDetail: { newsId: string };
  AnnouncementDetail: { announcementId: string };
};

export const HomeScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  
  // Store verilerini al
  const { 
    upcomingEvents,
    recommendedEvents, 
    nearbyEvents,
    news,
    sports,
    announcements,
    isLoadingUpcomingEvents,
    isLoadingRecommendedEvents,
    isLoadingNearbyEvents,
    isLoadingNews,
    isLoadingSports,
    isLoadingAnnouncements,
    refreshAll
  } = useHomeStore();
  
  // State tanımları
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState<string | undefined>(undefined);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const scrollY = useState(new Animated.Value(0))[0];
  
  // İlk yükleme
  useEffect(() => {
    refreshAll();
  }, []);
  
  // Spor seçimine göre etkinlikleri filtrele
  useEffect(() => {
    if (selectedSportId) {
      const filtered = upcomingEvents.filter(event => event.sport_id === selectedSportId);
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(upcomingEvents);
    }
  }, [selectedSportId, upcomingEvents]);
  
  // Yenileme işlemi
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);
  
  // Etkinlik detayına git
  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };
  
  // Tüm etkinliklere git
  const handleViewAllEvents = () => {
    navigation.navigate('EventsList');
  };
  
  // Haber detayına git
  const handleNewsPress = (newsItem: News) => {
    navigation.navigate('NewsDetail', { newsId: newsItem.id });
  };
  
  // Spor filtresi
  const handleSportSelect = (sport: Sport) => {
    if (selectedSportId === sport.id) {
      setSelectedSportId(undefined);
    } else {
      setSelectedSportId(sport.id);
    }
  };
  
  // Duyuru detayına git
  const handleAnnouncementPress = (announcement: Announcement) => {
    navigation.navigate('AnnouncementDetail', { announcementId: announcement.id });
  };

  // Profil sayfasına git
  const handleProfilePress = () => {
    navigation.navigate('Profile' as any);
  };

  // Animasyon değeri hesapla
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Animasyonlu header */}
      <Animated.View 
        style={[
          styles.animatedHeader, 
          { 
            backgroundColor: theme.colors.card,
            opacity: headerOpacity,
            borderBottomColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          }
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>SporLink</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.accent} />
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hoşgeldin Banner - Yeni Tasarım */}
        <Banner 
          title="Hoş Geldin"
          subtitle="Bugün hangi sporla ilgilenmek istersin?"
          iconName="fitness-outline"
          userName={user?.first_name}
          userProfile={user?.profile_picture}
          onProfilePress={handleProfilePress}
        />
            
        {/* Duyurular */}
        {announcements.length > 0 && (
          <View style={styles.sectionContainer}>
            <SectionHeader 
              title="Duyurular" 
              showViewAll={false}
            />
            
            {isLoadingAnnouncements ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator 
                  size="small" 
                  color={theme.colors.accent} 
                />
              </View>
            ) : (
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.announcementsScrollContainer}
              >
                {announcements.map(announcement => (
                  <AnnouncementCard 
                    key={announcement.id} 
                    announcement={announcement} 
                    onPress={handleAnnouncementPress}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Spor Kategorileri */}
        <View style={styles.sectionContainer}>
          <SectionHeader 
            title="Spor Kategorileri" 
            showViewAll={false}
          />
          
          {isLoadingSports ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator 
                size="small" 
                color={theme.colors.accent}
              />
            </View>
          ) : (
            <SportCategories 
              sports={sports}
              onSelectSport={handleSportSelect}
              selectedSportId={selectedSportId}
            />
          )}
        </View>
        
        {/* Yaklaşan Etkinlikler */}
        <View style={styles.sectionContainer}>
          <SectionHeader 
            title="Yaklaşan Etkinlikler" 
            onPress={handleViewAllEvents}
          />
          
          {isLoadingUpcomingEvents ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator 
                size="small" 
                color={theme.colors.accent}
              />
            </View>
          ) : filteredEvents.length > 0 ? (
            <View style={styles.eventsContainer}>
              {filteredEvents.slice(0, 3).map(event => (
                <EventCardSmall 
                  key={event.id} 
                  event={event} 
                  onPress={handleEventPress}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }]}>
              <Ionicons 
                name="calendar-outline" 
                size={24} 
                color={theme.colors.textSecondary} 
                style={styles.emptyIcon} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {selectedSportId 
                  ? 'Bu kategoride yaklaşan etkinlik bulunamadı'
                  : 'Yaklaşan etkinlik bulunamadı'}
              </Text>
            </View>
          )}
        </View>
        
        {/* Sana Özel Etkinlikler */}
        <View style={styles.sectionContainer}>
          <SectionHeader 
            title="Sana Özel" 
            onPress={handleViewAllEvents}
          />
          
          {isLoadingRecommendedEvents ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator 
                size="small" 
                color={theme.colors.accent}
              />
            </View>
          ) : recommendedEvents.length > 0 ? (
            <View style={styles.eventsContainer}>
              {recommendedEvents.slice(0, 2).map(event => (
                <EventCardSmall 
                  key={event.id} 
                  event={event} 
                  onPress={handleEventPress}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border 
            }]}>
              <Ionicons 
                name="star-outline" 
                size={24} 
                color={theme.colors.textSecondary} 
                style={styles.emptyIcon} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Senin için önerilen etkinlik bulunamadı
              </Text>
            </View>
          )}
        </View>
        
        {/* Yakındaki Etkinlikler */}
        <View style={styles.sectionContainer}>
          <SectionHeader 
            title="Yakınındaki Etkinlikler" 
            onPress={handleViewAllEvents}
          />
          
          {isLoadingNearbyEvents ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator 
                size="small" 
                color={theme.colors.accent}
              />
            </View>
          ) : nearbyEvents.length > 0 ? (
            <View style={styles.eventsContainer}>
              {nearbyEvents.slice(0, 2).map(event => (
                <EventCardSmall 
                  key={event.id} 
                  event={event} 
                  onPress={handleEventPress}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }]}>
              <Ionicons 
                name="location-outline" 
                size={24} 
                color={theme.colors.textSecondary} 
                style={styles.emptyIcon} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Yakınında etkinlik bulunamadı
              </Text>
            </View>
          )}
        </View>
        
        {/* Haberler */}
        <View style={styles.sectionContainer}>
          <SectionHeader 
            title="Spor Haberleri" 
            // Şimdilik onPress bulunmuyor
          />
          
          {isLoadingNews ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator 
                size="small" 
                color={theme.colors.accent}
              />
            </View>
          ) : news.length > 0 ? (
            <View style={styles.newsContainer}>
              {news.slice(0, 3).map(newsItem => (
                <NewsCard 
                  key={newsItem.id} 
                  news={newsItem} 
                  onPress={handleNewsPress}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }]}>
              <Ionicons 
                name="newspaper-outline" 
                size={24} 
                color={theme.colors.textSecondary} 
                style={styles.emptyIcon} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Haberler yüklenirken bir sorun oluştu
              </Text>
            </View>
          )}
        </View>
        
        {/* Alt boşluk */}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 100,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 0, // Banner'ın üstündeki boşluğu kaldırmak için
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    marginBottom: 6,
    fontWeight: '500',
  },
  welcomeSubtext: {
    fontSize: 14,
    lineHeight: 18,
  },
  profileButton: {
    marginLeft: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  profilePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 28,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  announcementsContainer: {
    paddingHorizontal: 15,
  },
  announcementsScrollContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  eventsContainer: {
    paddingHorizontal: 4,
  },
  newsContainer: {
    paddingHorizontal: 4,
  },
  emptyContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 80,
  }
});