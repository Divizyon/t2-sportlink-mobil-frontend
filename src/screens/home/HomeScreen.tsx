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
  Platform,
  Modal
} from 'react-native';
import { useNavigation, NavigationProp, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useHomeStore } from '../../store/appStore/homeStore';
import { useEventStore } from '../../store/eventStore/eventStore';
import { useAuthStore } from '../../store/userStore/authStore';
import { useProfileStore } from '../../store/userStore/profileStore';
import { Event } from '../../types/eventTypes/event.types';
import { News, Sport, Announcement } from '../../types/apiTypes/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useMessageStore } from '../../store/messageStore/messageStore';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useFriendsStore } from '../../store/userStore/friendsStore';
import { colors } from '../../constants/colors/colors';
import { useMapsStore } from '../../store/appStore/mapsStore';
import * as Location from 'expo-location';
import NearbyEventsComponent from '../../components/Shared/NearbyEventsComponent';
import RecommendationReason from '../../components/Home/RecommendationReason/RecommendationReason';
import { getSportImageSource } from '../../components/Discover/NearbyEventCard';
import { DivizyonFooter } from '../../components/common';

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
  AllNewsScreen: undefined;
  FriendRequests: undefined;
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
  const { friendRequests, fetchFriendRequests } = useFriendsStore();
  const { sportPreferences } = useProfileStore();
  
  // Store verilerini al - nearbyEvents için eventStore'u kullan
  const { 
    upcomingEvents,
    recommendedEvents, 
    news,
    sports,
    announcements,
    isLoadingUpcomingEvents,
    isLoadingRecommendedEvents,
    isLoadingNearbyEvents,
    isLoadingNews,
    isLoadingSports,
    isLoadingAnnouncements,
    refreshAll,
    fetchRecommendedEvents
  } = useHomeStore();
  
  // eventStore'dan yakındaki etkinlikleri al
  const { nearbyEvents, events, fetchAllEventsByDistance } = useEventStore();
  
  // MapsStore'dan konum bilgilerini al
  const { lastLocation, initLocation } = useMapsStore();
  
  const { fetchConversations, getUnreadMessagesCount, unreadMessagesCount } = useMessageStore();
  
  // State tanımları
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState<string | undefined>(undefined);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const scrollY = useState(new Animated.Value(0))[0];
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const footerOpacity = useState(new Animated.Value(0))[0];
  const [showLocationModal, setShowLocationModal] = useState(false);
  // News modal için state
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  
  // Lazy loading göstergesi için önceki durumu takip etmek için ref kullanıyoruz
  const wasNearEnd = React.useRef(false);
  
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
  
  // Selamla ilgili yardımcı fonksiyonlar 
  // Günün zamanına göre selam mesajı getir
  const getGreetingByTime = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Günaydın';
    if (hours >= 12 && hours < 18) return 'İyi günler';
    if (hours >= 18 && hours < 22) return 'İyi akşamlar';
    return 'İyi geceler';
  };
  
  // Rastgele spor emojisi getir
  const getSportEmoji = () => {
    const sportEmojis = [
      '⚽', // futbol
      '🏀', // basketbol
      '🏈', // amerikan futbolu
      '⚾', // beyzbol
      '🥎', // softbol
      '🎾', // tenis
      '🏐', // voleybol
      '🏉', // ragbi
      '🥏', // frizbi
      '🎱', // bilardo
      '🏓', // masa tenisi
      '🏸', // badminton
      '🏒', // hokey
      '🏑', // çim hokeyi
      '🥍', // lacrosse
      '🏏', // kriket
      '🪃', // bumerang
      '🥊', // boks
      '🥋', // dövüş sanatları
      '🚴', // bisiklet
      '🏊', // yüzme
      '🏄', // sörf
      '🚣', // kürek
      '🧗', // tırmanış
      '🏋️', // ağırlık kaldırma
      '⛹️', // basketbol oynama
      '🤸', // jimnastik
      '🤺', // eskrim
      '🤾', // hentbol
      '🏆', // kupa
      '🥇', // altın madalya
      '🎯', // dart
    ];
    
    return sportEmojis[Math.floor(Math.random() * sportEmojis.length)];
  };
  
  // Rastgele motivasyon mesajı getir
  const getMotivationalMessage = () => {
    const messages = [
      'Harika bir gün seni bekliyor!',
      'Bugün kendine iyi bak!',
      'Yeni fırsatlar için hazır mısın?',
      'Bugün yeni spor arkadaşları edinmeye ne dersin?',
      'Biraz hareket etme zamanı!',
      'Hedeflerine bir adım daha yaklaşma günü!',
      'Bugün yeni bir etkinlik keşfetme zamanı!',
      'Enerjik bir gün geçirmen dileğiyle!',
      'Sportif bir gün seni bekliyor!',
      'Bugün kendini aşmaya hazır mısın?'
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  // İlk yükleme
  useEffect(() => {
    refreshAll();
    fetchConversations();
    getUnreadMessagesCount();
    
    // Konum izinlerini alıp, etkinlikleri mesafeye göre sırala
    const loadLocationAndEvents = async () => {
      console.log("Konum ve etkinlikler yükleniyor...");
      
      // Konum izni kontrol et
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      // Konum izni verilmediyse modal göster
      if (status !== Location.PermissionStatus.GRANTED) {
        setShowLocationModal(true);
        // Etkinlikleri tarih sırasına göre göster
        await fetchAllEventsByDistance(false);
      } else {
        // Konum iznini iste ve konumu başlat
        const location = await initLocation();
        
        // Konum izni verildiyse, tüm etkinlikleri mesafeye göre sırala
        if (location) {
          console.log("Konum izni verildi, etkinlikler mesafeye göre sıralanıyor...");
          await fetchAllEventsByDistance(true);
        } else {
          console.log("Konum izni verilmedi, etkinlikler tarih sırasına göre gösteriliyor.");
          // Konum izni verilmediyse, tarihe göre sırala
          await fetchAllEventsByDistance(false);
        }
      }
    };
    
    loadLocationAndEvents();
  }, []);
  
  // Spor tercihlerine göre önerilen etkinlikleri güncelle
  useEffect(() => {
    // Spor tercihleri değiştiğinde önerilen etkinlikleri güncelle
    if (sportPreferences && sportPreferences.length > 0) {
      console.log("Spor tercihleri değişti, önerilen etkinlikler güncelleniyor...");
      fetchRecommendedEvents();
    }
  }, [sportPreferences]);
  
  // Konum izni modal kapat fonksiyonu
  const handleLocationPermission = async () => {
    setShowLocationModal(false);
    // Konum iznini tekrar iste
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === Location.PermissionStatus.GRANTED) {
      // Konum iznini iste ve konumu başlat
      const location = await initLocation();
      
      if (location) {
        console.log("Konum izni verildi, etkinlikler mesafeye göre sıralanıyor...");
        await fetchAllEventsByDistance(true);
      }
    }
  };
  
  // Her ekrana girildiğinde emoji ve motivasyon mesajını değiştir
  const [currentEmoji, setCurrentEmoji] = useState(getSportEmoji());
  const [currentMotivation, setCurrentMotivation] = useState(getMotivationalMessage());

  // useFocusEffect ile ekran her odaklandığında emoji ve motivasyon mesajını güncelliyoruz
  useFocusEffect(
    React.useCallback(() => {
      setCurrentEmoji(getSportEmoji());
      setCurrentMotivation(getMotivationalMessage());
      getUnreadMessagesCount();
      // Arkadaşlık isteklerini getir
      fetchFriendRequests();
    }, [getUnreadMessagesCount, fetchFriendRequests])
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

  // Arkadaşlık isteklerini görüntüle
  const handleFriendRequests = () => {
    console.log("Arkadaşlık istekleri sayfasına yönlendiriliyor, istek sayısı:", friendRequests.length);
    navigation.navigate('FriendRequests');
  };

  // Spor seçimi - Sport tipinde parametre alacak şekilde düzeltildi
  const handleSportSelect = (sport: Sport) => {
    setSelectedSportId(sport.id);
  };

  // Haber detayına git
  // Haber detay modalını aç
  const handleNewsPress = (news: News) => {
    setSelectedNews(news);
    setShowNewsModal(true);
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
  
  // Yukarı kaydırma fonksiyonu
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };
  
  // ScrollView'a referans oluştur
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  // Kaydırma pozisyonuna göre yukarı kaydırma butonunun görünürlüğünü ayarla
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize.height;
        const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
        
        // 100 pikselden fazla kaydırıldıysa butonu göster, 50 pikselden az ise gizle
        if (offsetY > 100 && !showScrollToTop) {
          setShowScrollToTop(true);
        } else if (offsetY < 50 && showScrollToTop) {
          setShowScrollToTop(false);
        }
        
        // Kullanıcı sayfanın en altına yaklaştıysa footer'ı göster
        // normalden biraz daha fazla scroll gerekiyor
        // Animasyon kullanarak daha smooth bir deneyim sağla
        const isNearEnd = offsetY + scrollViewHeight > contentHeight - 50;
        
        // Sadece durum değiştiğinde animasyonu çalıştır
        if (isNearEnd !== wasNearEnd.current) {
          wasNearEnd.current = isNearEnd;
          Animated.timing(footerOpacity, {
            toValue: isNearEnd ? 1 : 0,
            duration: 200,
            useNativeDriver: true, // Native driver kullanarak performansı artır
          }).start();
        }
      }
    }
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Animasyonlu Header */}
      <Animated.View style={[styles.header, { backgroundColor: headerBgColor, shadowOpacity: headerElevation.interpolate({ inputRange: [0, 5], outputRange: [0, 0.2] }), borderBottomColor: theme.colors.border }]}> 
        <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center', flexDirection: 'row' }}>
          <Image
            source={require('../../../assets/icon.png')}
            style={{ width: '50%', height: 60, marginLeft: '-60%' }}
            resizeMode="cover"
          />
        </View>
        <View style={styles.headerButtons}>
         {/* Arkadaşlık İstekleri Butonu */}
         <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleFriendRequests}
          >
            <View>
              <Ionicons name="heart-outline" size={30} color={colors.accentDark} />
              {friendRequests.length > 0 && (
                <View style={[styles.badgeContainer, { backgroundColor: theme.colors.accent, top: -3, right: -8 }]}>
                  <Text style={styles.badgeText}>
                    {friendRequests.length > 99 ? '99+' : friendRequests.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleMessagesPress}
          >
            <View>
              <Ionicons name="chatbubble-outline" size={30} color={colors.accentDark} />
              {unreadMessagesCount > 0 && (
                <View style={[styles.badgeContainer, { backgroundColor: '#2F4F4F', top: -2, right: -5 }]}>
                  <Text style={styles.badgeText}>
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <ScrollView 
        ref={scrollViewRef}
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
       

        {/* Kişisel selam - Yenilenmiş */}
        <View style={styles.greetingContainer}>
          <View style={styles.greetingContent}>
            <View style={styles.greetingHeader}>
              <Text style={[styles.greeting, { color: theme.colors.text }]}>
                {getGreetingByTime()},
              </Text>
              <Text style={[styles.greetingName, { color: theme.colors.primary }]}>
                {user?.first_name || 'Demo'}
              </Text>
              <Text style={[styles.greetingEmoji, { color: theme.colors.text }]}>
                {currentEmoji}
              </Text>
            </View>
            
            <Text style={[styles.greetingSubtext, { color: theme.colors.textSecondary }]}>
              Bugün <Text style={{ fontWeight: '600' }}>{getDayInfo()}</Text>, {currentMotivation}
            </Text>
          </View>
        </View>
   {/* Sana Özel Etkinlikler */}
   <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={{
                marginRight: 8, 
                borderRadius: 12, 
                padding: 4,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="star-outline" size={20} color={colors.accentDark} />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sana Özel</Text>
            </View>
            <TouchableOpacity onPress={handleViewAllEvents}>
              <View style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                paddingRight: 5,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}>
               
              </View>
            </TouchableOpacity>
          </View>
          
          {isLoadingRecommendedEvents ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
            </View>
          ) : recommendedEvents.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {recommendedEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.recommendedEventCard, { backgroundColor: theme.colors.card }]}
                  onPress={() => handleEventPress(event)}
                  activeOpacity={0.7}
                >
                  {/* Etkinlik resmi veya spor ikonu */}
                  <View style={styles.recommendedEventImageContainer}>
                    {event.image_url ? (
                      <Image 
                        source={{ uri: event.image_url }}
                        style={styles.recommendedEventImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image 
                        source={getSportImageSource(event.sport?.name || '')}
                        style={styles.recommendedEventImage}
                        resizeMode="cover"
                      />
                    )}
                    
                    {/* Öneri nedeni */}
                    {event.recommendation_reason && (
                      <View style={[styles.recommendationReasonBadge, { backgroundColor: theme.colors.card }]}>
                        <RecommendationReason reason={event.recommendation_reason} />
                      </View>
                    )}
                  </View>
                  
                  {/* Etkinlik bilgileri */}
                  <View style={styles.recommendedEventContent}>
                    <Text 
                      style={[styles.recommendedEventTitle, { color: theme.colors.text }]} 
                      numberOfLines={1}
                    >
                      {event.title}
                    </Text>
                    
                    <View style={styles.recommendedEventMeta}>
                      {/* Tarih bilgisi */}
                      <View style={styles.recommendedEventDetail}>
                        <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.recommendedEventMetaText, { color: theme.colors.textSecondary }]}>
                          {new Date(event.event_date).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                      
                      {/* Konum bilgisi */}
                      <View style={styles.recommendedEventDetail}>
                        <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} />
                        <Text 
                          style={[styles.recommendedEventMetaText, { color: theme.colors.textSecondary }]} 
                          numberOfLines={1}
                        >
                          {event.location_name}
                        </Text>
                      </View>
                      
                      {/* Katılımcı sayısı */}
                      <View style={styles.recommendedEventDetail}>
                        <Ionicons name="people-outline" size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.recommendedEventMetaText, { color: theme.colors.textSecondary }]}>
                          {event.current_participants || 0}/{event.max_participants}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              
              {/* İlgi alanları ekleme call to action */}
              <TouchableOpacity 
                style={[styles.callToActionCard, { backgroundColor: `${theme.colors.accent}15` }]}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('Profile', { 
                    screen: 'EditSportPreferences' 
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.callToActionHeader}>
                  <View style={[styles.callToActionIcon, { backgroundColor: theme.colors.accent }]}>
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                  </View>
                  <View style={[styles.callToActionBadge, { backgroundColor: `${theme.colors.accent}20` }]}>
                    <Text style={[styles.callToActionBadgeText, { color: theme.colors.accent }]}>
                      ÖNERİ
                    </Text>
                  </View>
                </View>
                
                <View style={styles.callToActionContent}>
                  <Text style={[styles.callToActionTitle, { color: theme.colors.text }]}>
                    Daha Fazla Öneri Al
                  </Text>
                  <Text style={[styles.callToActionSubtitle, { color: theme.colors.textSecondary }]}>
                    Profilinden spor ilgi alanlarını ekle ve güncelle
                  </Text>
                  
                  <View style={styles.callToActionFeatures}>
                    <View style={styles.callToActionFeature}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
                      <Text style={[styles.callToActionFeatureText, { color: theme.colors.textSecondary }]}>
                        Kişiselleştirilmiş öneriler
                      </Text>
                    </View>
                    <View style={styles.callToActionFeature}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
                      <Text style={[styles.callToActionFeatureText, { color: theme.colors.textSecondary }]}>
                        İlgi alanına uygun etkinlikler
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[styles.callToActionButton, { backgroundColor: theme.colors.accent }]}>
                    <Text style={styles.callToActionButtonText}>İlgi Alanları Ekle</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={[styles.emptyCardWide, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="star-outline" size={24} color={colors.accentDark} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Senin için önerilen etkinlik bulunamadı
              </Text>
              <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
                Profil sayfasından spor tercihlerini güncelleyebilir veya arkadaş ekleyerek kişiselleştirilmiş öneriler alabilirsin.
              </Text>
              
              <TouchableOpacity
                style={[styles.emptyActionButton, { backgroundColor: theme.colors.accent }]}
                onPress={() => {
                  // @ts-ignore - Tip hatası nedeniyle burada navigation tipini yoksayacağız
                  navigation.navigate('Profile');
                  // Profil stack'inden EditSportPreferences sayfasına yönlendirme sonraki aşamada manuel olarak gerçekleşecek
                }}
              >
                <Text style={styles.emptyActionButtonText}>Spor Tercihlerimi Güncelle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      
        
     
            
        {/* Yakındaki Etkinlikler - Yatay kaydırmalı */}
        <NearbyEventsComponent 
          onSeeAll={handleViewAllEvents}
          maxItems={5}
        />

        {/* Spor Haberleri - Yatay kaydırmalı */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={{
                marginRight: 8, 
                borderRadius: 12, 
                padding: 4,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="newspaper-outline" size={20} color={colors.accentDark} />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spor Haberleri</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AllNewsScreen')}>
              <View style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                paddingRight: 5,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}>
                <Text style={[styles.viewAllText, { color: colors.accent }]}>
                  Tümü <Ionicons name="chevron-forward" size={14} color={colors.accentDark} />
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {isLoadingNews ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {news.length > 0 ? news.slice(0, 5).map(newsItem => (
                <TouchableOpacity
                  key={newsItem.id}
                  style={[styles.horizontalNewsCard, { backgroundColor: theme.colors.card }]}
                  onPress={() => handleNewsPress(newsItem)}
                  activeOpacity={0.7}
                >
                  <View style={styles.horizontalNewsImageContainer}>
                    {newsItem.image_url ? (
                      <Image 
                        source={{ uri: newsItem.image_url }} 
                        style={styles.horizontalNewsImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.horizontalNewsImagePlaceholder, { backgroundColor: theme.colors.accent + '20' }]}>
                        <Ionicons name="newspaper" size={30} color={colors.accentDark} />
                      </View>
                    )}
                    <View style={[styles.newsCategory, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={[styles.newsCategoryText, { color: theme.colors.primary }]}>
                        {newsItem.sport?.name || 'Genel'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.horizontalNewsContent}>
                    <Text style={[styles.horizontalNewsTitle, { color: theme.colors.text }]} numberOfLines={2}>
                      {newsItem.title}
                    </Text>
                    
                    <Text style={[styles.horizontalNewsDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                      {newsItem.content?.substring(0, 80) + '...'}
                    </Text>
                    
                    <View style={styles.horizontalNewsFooter}>
                      <Text style={[styles.horizontalNewsDate, { color: theme.colors.textSecondary }]}>
                        {new Date(newsItem.created_at || new Date()).toLocaleDateString('tr-TR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </Text>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                        
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )) : (
                <View style={[styles.emptyCardHorizontal, { backgroundColor: theme.colors.card }]}>
                  <Ionicons name="newspaper-outline" size={24} color={colors.accentDark} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Haberler yüklenirken bir sorun oluştu
                  </Text>
                </View>
              )}
              
              {news.length > 5 && (
                <TouchableOpacity
                  style={[styles.viewAllCardHorizontal, { backgroundColor: theme.colors.card + '80' }]}
                  onPress={() => navigation.navigate('AllNewsScreen')}
                  activeOpacity={0.7}
                >
                  <View style={styles.viewAllContent}>
                    <Ionicons name="newspaper" size={24} color={colors.accentDark} style={{ marginBottom: 10 }} />
                    <Text style={[styles.viewAllText, { color: theme.colors.accent, fontWeight: '600' }]}>
                      Tümünü Gör
                    </Text>
                    <Ionicons name="chevron-forward-circle" size={24} color={colors.accentDark} style={{ marginTop: 10 }} />
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
          {/* Duyurular - Yatay Kaydırma */}
          <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={{
                marginRight: 8, 
                borderRadius: 12, 
                padding: 4,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="megaphone-outline" size={20} color={colors.accentDark} />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Duyurular</Text>
            </View>
           
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
                announcements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onPress={handleAnnouncementPress}
                  />
                ))
              ) : (
                <View style={[styles.emptyCardHorizontal, { backgroundColor: theme.colors.card }]}>
                  <Ionicons name="information-circle-outline" size={24} color={colors.accentDark} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Duyuru bulunamadı
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
        {/* Modern Footer - Sadece daha fazla kaydırınca görünür - Animated ile */}
        <Animated.View 
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginTop: 0,
            marginBottom: 0,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border + '30',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: footerOpacity, // Animasyonlu opacity
          }}
        >
          <DivizyonFooter />
        </Animated.View>
      </ScrollView>
      
      {/* Yukarı Kaydırma Butonu */}
      {showScrollToTop && (
        <TouchableOpacity 
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.accentDark,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 999,
          }} 
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-up" size={24} color="white" />
        </TouchableOpacity>
      )}
      
      {/* Konum İzni Modalı */}
      {showLocationModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showLocationModal}
          onRequestClose={() => setShowLocationModal(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
            <View style={{
              backgroundColor: theme.colors.card,
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 10,
            }}>
              <View style={{
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <Ionicons name="location" size={50} color={colors.accentDark} />
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                  marginTop: 15,
                }}>
                  Konum İzni Gerekli
                </Text>
                
                <Text style={{
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 15,
                  lineHeight: 22,
                }}>
                  Yakınınızdaki etkinlikleri görüntülemek ve size en uygun etkinlikleri önerebilmek için konum izni gereklidir.
                </Text>
              </View>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
              }}>
                <TouchableOpacity 
                  style={{
                    flex: 1,
                    padding: 15,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    marginRight: 10,
                    alignItems: 'center',
                  }}
                  onPress={() => setShowLocationModal(false)}
                >
                  <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Daha Sonra</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{
                    flex: 1,
                    padding: 15,
                    borderRadius: 10,
                    backgroundColor: colors.accentDark,
                    alignItems: 'center',
                  }}
                  onPress={handleLocationPermission}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>İzin Ver</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Haber Detay Modalı */}
      <Modal
  animationType="slide"
  transparent={true}
  visible={showNewsModal}
  onRequestClose={() => setShowNewsModal(false)}
>
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
    {/* Modal kapatma için dış alan */}
    <TouchableOpacity
      style={{ flex: 1 }}
      activeOpacity={1}
      onPress={() => setShowNewsModal(false)}
    />
    <View
      style={{
        height: '65%',
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 15,
      }}
    >
      {selectedNews ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Başlık + Kapat butonu */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: 'bold',
                color: theme.colors.text,
                flex: 1,
                marginRight: 8,
              }}
            >
              {selectedNews.title}
            </Text>
            <TouchableOpacity onPress={() => setShowNewsModal(false)}>
              <Ionicons name="close" size={28} color="#E53935" />
            </TouchableOpacity>
          </View>

          {/* Haber görseli */}
          {selectedNews.image_url && (
            <Image
              source={{ uri: selectedNews.image_url }}
              style={{
                width: '100%',
                height: 180,
                borderRadius: 16,
                marginBottom: 16,
              }}
              resizeMode="cover"
            />
          )}

          {/* Kategori & Tarih */}
          <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginBottom: 4 }}>
            {selectedNews.sport?.name || 'Genel'}
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 12 }}>
            {new Date(selectedNews.created_at || new Date()).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>

          {/* İçerik */}
          <Text style={{ fontSize: 16, lineHeight: 22, color: theme.colors.text, marginBottom: 12 }}>
            {selectedNews.content}
          </Text>

          {/* Yazar */}
          {selectedNews.author && (
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.textSecondary,
                fontStyle: 'italic',
                marginTop: 8,
              }}
            >
              {selectedNews.author}
            </Text>
          )}
        </ScrollView>
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Text style={{ color: theme.colors.textSecondary }}>Haber detayı bulunamadı.</Text>
        </View>
      )}
    </View>
  </View>
</Modal>

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
    paddingBottom: 8,
  },
  greetingContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingContent: {
    flex: 1,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  greetingName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  greetingEmoji: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  greetingSubtext: {
    fontSize: 16,
  },
  profileImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  profileImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 22,
    fontWeight: 'bold',
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
    marginBottom: 32,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingRight: 5,
  },
  announcementCardHorizontal: {
    flexDirection: 'row',
    width: 300,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
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
    paddingHorizontal: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginHorizontal: 16,
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
  emptySubText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
    marginBottom: 16,
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
  horizontalEventCard: {
    width: 260,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  horizontalEventImageContainer: {
    width: '100%',
    height: 140,
  },
  horizontalEventImage: {
    width: '100%',
    height: '100%',
  },
  horizontalEventImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalEventInfo: {
    padding: 12,
    paddingBottom: 14,
  },
  horizontalEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  horizontalEventTagContainer: {
    marginBottom: 10,
  },
  horizontalEventDetails: {
    marginBottom: 8,
  },
  horizontalEventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  horizontalEventDetailText: {
    fontSize: 12,
    flex: 1,
  },
  horizontalEventActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalNewsCard: {
    width: 280,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  horizontalNewsImageContainer: {
    width: '100%',
    height: 140,
  },
  horizontalNewsImage: {
    width: '100%',
    height: '100%',
  },
  horizontalNewsImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalNewsContent: {
    padding: 12,
    paddingBottom: 14,
  },
  horizontalNewsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 20,
  },
  horizontalNewsDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  horizontalNewsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalNewsDate: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  horizontalNewsReadMore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewAllCardHorizontal: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 12,
  },
  viewAllContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsCategory: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  newsCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventCategoryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  eventCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeContainer: {
    position: 'absolute',
    padding: 1,
    paddingHorizontal: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  emptyActionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  recommendationReasonContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
  },
  eventContent: {
    padding: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  recommendedEventCard: {
    width: 260,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  recommendedEventImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  recommendedEventImage: {
    width: '100%',
    height: '100%',
  },
  recommendedEventContent: {
    padding: 12,
  },
  recommendedEventTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  recommendedEventMeta: {
    gap: 4,
  },
  recommendedEventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  recommendedEventMetaText: {
    fontSize: 12,
    flex: 1,
  },

  callToActionCard: {
    width: 532, // 2 kart boyutunda (260 * 2 + margin)
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
   
  },
  callToActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  callToActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callToActionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  callToActionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  callToActionContent: {
    padding: 16,
    paddingTop: 0,
  },
  callToActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  callToActionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  callToActionFeatures: {
    marginBottom: 16,
    gap: 8,
  },
  callToActionFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callToActionFeatureText: {
    fontSize: 13,
    flex: 1,
  },
  callToActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  callToActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationReasonBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});

export default HomeScreen;