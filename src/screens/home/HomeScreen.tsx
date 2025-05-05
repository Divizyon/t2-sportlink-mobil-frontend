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
import { useNavigation, NavigationProp, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useHomeStore } from '../../store/appStore/homeStore';
import { useAuthStore } from '../../store/userStore/authStore';
import { Event } from '../../types/eventTypes/event.types';
import { News, Sport, Announcement } from '../../types/apiTypes/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useMessageStore } from '../../store/messageStore/messageStore';
import { useFocusEffect } from '@react-navigation/native';

// Komponentler
import SectionHeader from '../../components/Home/SectionHeader/SectionHeader';
import EventCardSmall from '../../components/Home/EventCardSmall/EventCardSmall';
import SportCategories from '../../components/Home/SportCategories/SportCategories';
import AnnouncementCard from '../../components/Home/AnnouncementCard/AnnouncementCard';
import NewsCard from '../../components/Home/NewsCard/NewsCard';

// Navigasyon için type tanımı
type TabParamList = {
  Home: undefined;
  Events: undefined; 
  Discover: undefined;
  Notifications: undefined;
  Profile: undefined;
};

type StackParamList = {
  MainTabs: undefined;
  EventDetail: { eventId: string };
  EventsList: undefined;
  NewsDetail: { newsId: string };
  AnnouncementDetail: { announcementId: string; showAsModal?: boolean };
  Notifications: undefined;
  Search: undefined;
  Profile: undefined;
  Messages: undefined;
  ConversationDetail: { conversationId: string };
  NewConversation: undefined;
};

// Birleşik navigasyon tipi
type NavigationType = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<StackParamList>
>;

// Event tipini genişletiyoruz
interface ExtendedEvent extends Event {
  distance?: number;
}

export const HomeScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<NavigationType>();
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
  
  const { fetchConversations, getUnreadMessagesCount } = useMessageStore();
  
  // State tanımları
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState<string | undefined>(undefined);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const scrollY = useState(new Animated.Value(0))[0];
  
  // Aktivite özet verileri (örnek veriler - gerçek veriler bir API'den alınabilir)
  const activityData = {
    steps: 2453,
    distance: 3.2,
    calories: 247
  };
  
  // Gün bilgisi
  const getDayInfo = () => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const today = new Date();
    return days[today.getDay()];
  };
  
  // İlk yükleme
  useEffect(() => {
    refreshAll();
    fetchConversations();
    getUnreadMessagesCount();
  }, []);
  
  // Ekran odaklandığında okunmamış mesaj sayısını güncelle
  useFocusEffect(
    React.useCallback(() => {
      getUnreadMessagesCount();
    }, [getUnreadMessagesCount])
  );
  
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
  
  // Bildirimler sayfasına git
  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  // Yeni içerik ekleme
  const handleAddContent = () => {
    // Yeni içerik eklemek için gerekli işlemler burada yapılacak
    console.log("Yeni içerik ekle");
  };
  
  // Duyuru detayına git
  const handleAnnouncementPress = (announcement: Announcement) => {
    navigation.navigate('AnnouncementDetail', { 
      announcementId: announcement.id,
      showAsModal: true
    });
  };

  // Profil sayfasına git
  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  // Spor seçimi - Sport tipinde parametre alacak şekilde düzeltildi
  const handleSportSelect = (sport: Sport) => {
    setSelectedSportId(sport.id);
  };

  // Haber detayına git
  const handleNewsPress = (news: News) => {
    navigation.navigate('NewsDetail', { newsId: news.id });
  };

  // Mesajlar sayfasına git
  const handleMessagesPress = () => {
    navigation.navigate('Messages');
  };

  // Animasyon değeri hesapla
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerBgColor = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [theme.colors.background, theme.colors.card],
    extrapolate: 'clamp',
  });

  const headerElevation = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 5],
    extrapolate: 'clamp',
  });
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Animasyonlu Header */}
      <Animated.View style={[
        styles.header, 
        { 
          backgroundColor: headerBgColor,
          shadowOpacity: headerElevation.interpolate({
            inputRange: [0, 5],
            outputRange: [0, 0.2]
          }),
          borderBottomColor: theme.colors.border
        }
      ]}>
       
        
        <Text style={[styles.logoText, { color: theme.colors.text }]}>
          <Text style={{color: '#4CAF50'}}>Sport</Text>
          <Text style={{color: '#2F4F4F'}}>Link</Text>
        </Text>
        
        <View style={styles.headerButtons}>
         
          <TouchableOpacity 
            style={[styles.headerActionButton, { backgroundColor: theme.colors.accent }]}
            onPress={handleMessagesPress}
          >
            <Ionicons name="chatbubble-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <ScrollView 
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
       

        {/* Kişisel selam */}
        <View style={styles.greetingContainer}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>
              İyi günler, {user?.first_name || 'Demo'} {user?.last_name || 'Kullanıcı'}!
            </Text>
            <Text style={[styles.greetingSubtext, { color: theme.colors.textSecondary }]}>
              Bugün {getDayInfo()}, harika bir gün seni bekliyor.
            </Text>
          </View>
        </View>

        {/* Duyurular - Yatay Kaydırma */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="megaphone-outline" size={22} color={theme.colors.text} style={styles.sectionHeaderIcon} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Duyurular</Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: theme.colors.textSecondary }]}>
                Tümü <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
              </Text>
            </TouchableOpacity>
          </View>
          
          {isLoadingAnnouncements ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
            </View>
          ) : (
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {announcements.length > 0 ? (
                announcements.map(announcement => (
                  <TouchableOpacity 
                    key={announcement.id} 
                    style={[styles.announcementCardHorizontal, { 
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border 
                    }]}
                    onPress={() => handleAnnouncementPress(announcement)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.announcementIconHorizontal, { backgroundColor: theme.colors.accent + '20' }]}>
                      <Ionicons name="megaphone-outline" size={18} color={theme.colors.accent} />
                    </View>
                    <View style={styles.announcementContentHorizontal}>
                      <Text style={[styles.announcementTitleHorizontal, { color: theme.colors.text }]} numberOfLines={1}>
                        {announcement.title}
                      </Text>
                      <Text 
                        style={[styles.announcementTextHorizontal, { color: theme.colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {announcement.content}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={[styles.emptyCardHorizontal, { backgroundColor: theme.colors.card }]}>
                  <Ionicons name="information-circle-outline" size={24} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Duyuru bulunamadı
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Aktivite Özeti */}
        <View style={[styles.activityCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: theme.colors.text }]}>Bugünkü Aktiviteler</Text>
            <TouchableOpacity style={[styles.moreButton, { backgroundColor: theme.colors.primary + '15' }]}>
              <Text style={{ color: theme.colors.primary, fontWeight: '500', fontSize: 12 }}>Tüm Veriler</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityStatsContainer}>
            {/* Adım sayısı */}
            <View style={[styles.activityStatItem, { backgroundColor: '#4CAF50' + '10', borderRadius: 12, padding: 10 }]}>
              <Ionicons name="footsteps-outline" size={22} color="#4CAF50" style={{ marginBottom: 4 }} />
              <Text style={[styles.activityStatValue, { color: '#4CAF50' }]}>{activityData.steps.toLocaleString()}</Text>
              <Text style={[styles.activityStatLabel, { color: theme.colors.textSecondary }]}>Adım</Text>
            </View>
            
            {/* Mesafe */}
            <View style={[styles.activityStatItem, { backgroundColor: '#2196F3' + '10', borderRadius: 12, padding: 10 }]}>
              <Ionicons name="map-outline" size={22} color="#2196F3" style={{ marginBottom: 4 }} />
              <Text style={[styles.activityStatValue, { color: '#2196F3' }]}>{activityData.distance.toFixed(1)}</Text>
              <Text style={[styles.activityStatLabel, { color: theme.colors.textSecondary }]}>km</Text>
            </View>
            
            {/* Kalori */}
            <View style={[styles.activityStatItem, { backgroundColor: '#FF5722' + '10', borderRadius: 12, padding: 10 }]}>
              <Ionicons name="flame-outline" size={22} color="#FF5722" style={{ marginBottom: 4 }} />
              <Text style={[styles.activityStatValue, { color: '#FF5722' }]}>{activityData.calories}</Text>
              <Text style={[styles.activityStatLabel, { color: theme.colors.textSecondary }]}>kcal</Text>
            </View>
          </View>
        </View>
        
        {/* Spor Kategorileri */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="fitness-outline" size={22} color={theme.colors.text} style={styles.sectionHeaderIcon} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spor Kategorileri</Text>
            </View>
          </View>
          
          {isLoadingSports ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
            </View>
          ) : (
            <View style={styles.sportCategoriesContainer}>
              <SportCategories 
                sports={sports}
                onSelectSport={handleSportSelect}
                selectedSportId={selectedSportId}
              />
            </View>
          )}
        </View>
            
        {/* Yakındaki Etkinlikler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="location-outline" size={22} color={theme.colors.text} style={styles.sectionHeaderIcon} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Yakındaki Etkinlikler</Text>
            </View>
            <TouchableOpacity onPress={handleViewAllEvents}>
              <Text style={[styles.viewAllText, { color: theme.colors.textSecondary }]}>
                Tümü <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
              </Text>
            </TouchableOpacity>
          </View>
          
          {isLoadingNearbyEvents ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
            </View>
          ) : nearbyEvents.length > 0 ? (
            <View style={styles.verticalCardContainer}>
              {nearbyEvents.slice(0, 3).map((event) => {
                const extendedEvent = event as ExtendedEvent;
                return (
                  <View key={event.id} style={styles.eventCardWrapper}>
                    <TouchableOpacity
                      style={[styles.eventCard, { backgroundColor: theme.colors.card }]}
                      onPress={() => handleEventPress(event)}
                      activeOpacity={0.7}
                    >
                      {/* Mesafe göstergesi */}
                      {extendedEvent.distance && (
                        <View style={styles.distanceBadge}>
                          <Text style={styles.distanceText}>{extendedEvent.distance.toFixed(1)} km</Text>
                        </View>
                      )}
                      
                      {/* Etkinlik resmi veya spor ikonu */}
                      <View style={styles.eventImageContainer}>
                        {event.sport_id.toLowerCase().includes('koş') ? (
                          <Image 
                            source={{uri: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571'}}
                            style={styles.eventImage}
                            resizeMode="cover"
                          />
                        ) : event.sport_id.toLowerCase().includes('basket') ? (
                          <Image 
                            source={{uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc'}}
                            style={styles.eventImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.eventImagePlaceholder, { backgroundColor: theme.colors.accent + '30' }]}>
                            <Ionicons name="fitness-outline" size={40} color={theme.colors.accent} />
                          </View>
                        )}
                      </View>
                      
                      {/* Etkinlik bilgileri */}
                      <View style={styles.eventInfo}>
                        <View style={styles.eventHeader}>
                          <Text style={[styles.eventTitle, { color: theme.colors.text }]} numberOfLines={1}>
                            {event.title}
                          </Text>
                          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                        </View>
                        
                        <View style={styles.eventTagContainer}>
                          <View style={[styles.eventTag, { backgroundColor: theme.colors.accent + '20' }]}>
                            <Text style={[styles.eventTagText, { color: theme.colors.accent }]}>
                              {event.sport_id}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.eventDetails}>
                          <View style={styles.eventDetailRow}>
                            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={[styles.eventDetailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                              {event.location_name || 'Konum bilgisi yok'}
                            </Text>
                          </View>
                          
                          <View style={styles.eventDetailRow}>
                            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={[styles.eventDetailText, { color: theme.colors.textSecondary }]}>
                              {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            </Text>
                            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 8 }} />
                            <Text style={[styles.eventDetailText, { color: theme.colors.textSecondary }]}>
                              {event.start_time || '00:00'}
                            </Text>
                          </View>
                          
                          <View style={styles.eventActionRow}>
                            <View style={[styles.participantsBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                              <Ionicons name="people" size={14} color={theme.colors.primary} />
                              <Text style={[styles.participantsCount, { color: theme.colors.primary }]}>
                                {event.current_participants || 0}/{event.max_participants || 'sınırsız'}
                              </Text>
                            </View>
                            
                            <TouchableOpacity style={[styles.joinButton, { backgroundColor: theme.colors.accent }]}>
                              <Text style={styles.joinButtonText}>Katıl</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
              
              {nearbyEvents.length > 3 && (
                <TouchableOpacity 
                  style={[styles.showMoreButton, { borderColor: theme.colors.border }]} 
                  onPress={handleViewAllEvents}
                >
                  <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>Daha Fazla Göster</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={[styles.emptyCardWide, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="location-outline" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Yakınında etkinlik bulunamadı
              </Text>
            </View>
          )}
        </View>
        
        {/* Sana Özel Etkinlikler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="star-outline" size={22} color={theme.colors.text} style={styles.sectionHeaderIcon} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sana Özel</Text>
            </View>
            <TouchableOpacity onPress={handleViewAllEvents}>
              <Text style={[styles.viewAllText, { color: theme.colors.textSecondary }]}>
                Tümü <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
              </Text>
            </TouchableOpacity>
          </View>
          
          {isLoadingRecommendedEvents ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
            </View>
          ) : recommendedEvents.length > 0 ? (
            <View style={styles.verticalCardContainer}>
              {recommendedEvents.slice(0, 3).map((event) => (
                <View key={event.id} style={styles.eventCardWrapper}>
                  <TouchableOpacity
                    style={[styles.eventCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => handleEventPress(event)}
                    activeOpacity={0.7}
                  >
                    {/* Etkinlik resmi veya spor ikonu */}
                    <View style={styles.eventImageContainer}>
                      {event.sport_id.toLowerCase().includes('tenis') ? (
                        <Image 
                          source={{uri: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c1'}}
                          style={styles.eventImage}
                          resizeMode="cover"
                        />
                      ) : event.sport_id.toLowerCase().includes('futbol') ? (
                        <Image 
                          source={{uri: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55'}}
                          style={styles.eventImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.eventImagePlaceholder, { backgroundColor: theme.colors.accent + '30' }]}>
                          <Ionicons name="star" size={40} color={theme.colors.accent} />
                        </View>
                      )}
                    </View>
                    
                    {/* Etkinlik bilgileri */}
                    <View style={styles.eventInfo}>
                      <View style={styles.eventHeader}>
                        <Text style={[styles.eventTitle, { color: theme.colors.text }]} numberOfLines={1}>
                          {event.title}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                      </View>
                      
                      <View style={styles.eventTagContainer}>
                        <View style={[styles.eventTag, { backgroundColor: theme.colors.primary + '20' }]}>
                          <Text style={[styles.eventTagText, { color: theme.colors.primary }]}>
                            {event.sport_id}
                          </Text>
                        </View>
                        
                        <View style={[styles.eventTag, { 
                          backgroundColor: theme.colors.success + '20', 
                          marginLeft: 8 
                        }]}>
                          <Text style={[styles.eventTagText, { color: theme.colors.success }]}>
                            Önerilen
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.eventDetails}>
                        <View style={styles.eventDetailRow}>
                          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                          <Text style={[styles.eventDetailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                            {event.location_name || 'Konum bilgisi yok'}
                          </Text>
                        </View>
                        
                        <View style={styles.eventDetailRow}>
                          <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                          <Text style={[styles.eventDetailText, { color: theme.colors.textSecondary }]}>
                            {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </Text>
                          <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 8 }} />
                          <Text style={[styles.eventDetailText, { color: theme.colors.textSecondary }]}>
                            {event.start_time || '00:00'}
                          </Text>
                        </View>
                        
                        <View style={styles.eventActionRow}>
                          <View style={[styles.participantsBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Ionicons name="people" size={14} color={theme.colors.primary} />
                            <Text style={[styles.participantsCount, { color: theme.colors.primary }]}>
                              {event.current_participants || 0}/{event.max_participants || 'sınırsız'}
                            </Text>
                          </View>
                          
                          <TouchableOpacity style={[styles.joinButton, { backgroundColor: theme.colors.accent }]}>
                            <Text style={styles.joinButtonText}>Katıl</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
              
              {recommendedEvents.length > 3 && (
                <TouchableOpacity 
                  style={[styles.showMoreButton, { borderColor: theme.colors.border }]} 
                  onPress={handleViewAllEvents}
                >
                  <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>Daha Fazla Göster</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={[styles.emptyCardWide, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="star-outline" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Senin için önerilen etkinlik bulunamadı
              </Text>
            </View>
          )}
        </View>

        {/* Spor Haberleri */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="newspaper-outline" size={22} color={theme.colors.text} style={styles.sectionHeaderIcon} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spor Haberleri</Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: theme.colors.textSecondary }]}>
                Tümü <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
              </Text>
            </TouchableOpacity>
          </View>
          
          {isLoadingNews ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator 
                size="small" 
                color={theme.colors.accent}
              />
            </View>
          ) : (
            <View style={styles.verticalCardContainer}>
              {news.length > 0 ? (
                news.slice(0, 3).map(newsItem => (
                  <NewsCard 
                    key={newsItem.id} 
                    news={newsItem} 
                    onPress={handleNewsPress}
                  />
                ))
              ) : (
                <View style={[styles.emptyCardWide, { backgroundColor: theme.colors.card }]}>
                  <Ionicons name="newspaper-outline" size={24} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Haberler yüklenirken bir sorun oluştu
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        {/* Alt boşluk */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    zIndex: 10,
  },
  menuButton: {
    padding: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  greetingContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 16,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  moreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activityStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  activityStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  activityStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  activityStatLabel: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  announcementCardHorizontal: {
    flexDirection: 'row',
    width: 300,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  announcementIconHorizontal: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  announcementContentHorizontal: {
    flex: 1,
  },
  announcementTitleHorizontal: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  announcementTextHorizontal: {
    fontSize: 13,
    lineHeight: 18,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  sportCategoriesContainer: {
    paddingHorizontal: 16,
  },
  verticalCardContainer: {
    paddingHorizontal: 0,
  },
  eventCardWrapper: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  distanceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  eventImageContainer: {
    width: '100%',
    height: 150,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
  },
  eventTagContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  eventTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  eventTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontSize: 13,
    flex: 1,
  },
  eventActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  participantsCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  joinButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  showMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 4,
  },
  emptyCardHorizontal: {
    width: 300,
    borderRadius: 16,
    padding: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyCardWide: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  bottomPadding: {
    height: 80,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default HomeScreen;