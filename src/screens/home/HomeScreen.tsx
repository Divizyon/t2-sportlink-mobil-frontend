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
import Constants from 'expo-constants';
import { useFriendsStore } from '../../store/userStore/friendsStore';
import { colors } from '../../constants/colors/colors';

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
  
  const { fetchConversations, getUnreadMessagesCount, unreadMessagesCount } = useMessageStore();
  
  // State tanımları
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState<string | undefined>(undefined);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const scrollY = useState(new Animated.Value(0))[0];
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const footerOpacity = useState(new Animated.Value(0))[0];
  
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
  }, []);
  
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
  const handleNewsPress = (news: News) => {
    // Hafif bir geribildirim efekti 
    if (Platform.OS === 'ios') {
      Animated.sequence([
        Animated.timing(new Animated.Value(1), {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(new Animated.Value(0.95), {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
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
              <Ionicons name="chatbubble-outline" size={30} color={colors.accent} />
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

        {/* Duyurular - Yatay Kaydırma */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={{
                marginRight: 8, 
                backgroundColor: '#FF6B6B20', 
                borderRadius: 12, 
                padding: 4,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="megaphone-outline" size={20} color="#FF6B6B" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Duyurular</Text>
            </View>
            <TouchableOpacity>
              <View style={{
                borderWidth: 1,
                borderColor: '#FF6B6B40',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text style={[styles.viewAllText, { color: '#FF6B6B' }]}>
                  Tümü <Ionicons name="chevron-forward" size={14} color="#FF6B6B" />
                </Text>
              </View>
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
                announcements.map((announcement, index) => {
                  // Her duyuru için tamamen rastgele renk oluşturalım
                  const getRandomColor = () => {
                    // Canlı ve görsel olarak güzel renkler için önceden belirlenmiş renk tonları kullanalım
                    const colorHues = [
                      12,   // kırmızı-turuncu
                      36,   // turuncu
                      60,   // sarı
                      100,  // yeşil-sarı
                      140,  // yeşil
                      180,  // camgöbeği
                      210,  // mavi-camgöbeği
                      240,  // mavi
                      280,  // mor
                      320,  // fuşya
                      340   // kırmızı-fuşya
                    ];
                    
                    // Duyuru ID'sine göre veya index değerine göre renk seçebiliriz
                    // Burada tamamen rastgele bir renk yerine duyurunun kimliğine göre belirli bir renk seçelim
                    // Bu sayede her duyurunun her zaman aynı rengi olur, daha tutarlı bir görünüm elde edilir
                    const id = announcement.id;
                    const idSum = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
                    const hueIndex = idSum % colorHues.length;
                    
                    // Baz renk tonunu alalım
                    const baseHue = colorHues[hueIndex];
                    // Renk tonuna +/- 10 derece rastgele varyasyon ekleyelim
                    const hue = baseHue + (Math.random() * 20 - 10);
                    
                    // Canlı renkler için yüksek doygunluk
                    const saturation = 75 + Math.floor(Math.random() * 20); // %75-95 arası doygunluk
                    
                    // Parlak ama çok açık olmayan renkler için
                    const lightness = 45 + Math.floor(Math.random() * 10); // %45-55 arası parlaklık
                    
                    // HSL'yi HEX'e dönüştüren yardımcı fonksiyon
                    const hslToHex = (h: number, s: number, l: number) => {
                      s /= 100;
                      l /= 100;
                      
                      const c = (1 - Math.abs(2 * l - 1)) * s;
                      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
                      const m = l - c / 2;
                      let r, g, b;
                      
                      if (0 <= h && h < 60) {
                        [r, g, b] = [c, x, 0];
                      } else if (60 <= h && h < 120) {
                        [r, g, b] = [x, c, 0];
                      } else if (120 <= h && h < 180) {
                        [r, g, b] = [0, c, x];
                      } else if (180 <= h && h < 240) {
                        [r, g, b] = [0, x, c];
                      } else if (240 <= h && h < 300) {
                        [r, g, b] = [x, 0, c];
                      } else {
                        [r, g, b] = [c, 0, x];
                      }
                      
                      const toHex = (value: number) => {
                        const hex = Math.round((value + m) * 255).toString(16);
                        return hex.length === 1 ? '0' + hex : hex;
                      };
                      
                      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
                    };
                    
                    return hslToHex(hue, saturation, lightness);
                  };
                  
                  const borderColor = getRandomColor();
                  
                  return (
                    <TouchableOpacity 
                      key={announcement.id} 
                      style={[styles.announcementCardHorizontal, { 
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                        borderLeftWidth: 4,
                        borderLeftColor: borderColor
                      }]}
                      onPress={() => handleAnnouncementPress(announcement)}
                      activeOpacity={0.7}
                    >
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
                  );
                })
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
        
        {/* Sana Özel Etkinlikler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={{
                marginRight: 8, 
                backgroundColor: '#FFD70020', 
                borderRadius: 12, 
                padding: 4,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="star-outline" size={20} color="#FFD700" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sana Özel</Text>
            </View>
            <TouchableOpacity onPress={handleViewAllEvents}>
              <View style={{
                borderWidth: 1,
                borderColor: '#E6B80060',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text style={[styles.viewAllText, { color: '#E6B800' }]}>
                  Tümü <Ionicons name="chevron-forward" size={14} color="#E6B800" />
                </Text>
              </View>
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
                      {event.image_url ? (
                        console.log("event.image_url", event.image_url),
                        <Image 
                          source={{uri: event.image_url}}
                          style={styles.eventImage}
                          resizeMode="cover"
                        />
                      ) : event.sport_id.toLowerCase().includes('tenis') ? (
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
                          <Ionicons name="star" size={40} color="#FFD700" />
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
            
        {/* Yakındaki Etkinlikler - Yatay kaydırmalı */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={{
                marginRight: 8, 
                backgroundColor: '#8BC34A15', 
                borderRadius: 12, 
                padding: 4,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="location-outline" size={20} color="#4CAF50" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Yakındaki Etkinlikler</Text>
            </View>
            <TouchableOpacity onPress={handleViewAllEvents}>
              <View style={{
                borderWidth: 1,
                borderColor: '#4CAF5040',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text style={[styles.viewAllText, { color: '#4CAF50' }]}>
                  Tümü <Ionicons name="chevron-forward" size={14} color="#4CAF50" />
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {isLoadingNearbyEvents ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
            </View>
          ) : nearbyEvents.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {nearbyEvents.slice(0, 5).map((event) => {
                const extendedEvent = event as ExtendedEvent;
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[styles.horizontalEventCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => handleEventPress(event)}
                    activeOpacity={0.7}
                  >
                    {/* Mesafe göstergesi */}
                    {extendedEvent.distance && (
                      <View style={styles.distanceBadge}>
                        <Ionicons name="location" size={12} color="white" style={{ marginRight: 4 }} />
                        <Text style={styles.distanceText}>{extendedEvent.distance.toFixed(1)} km</Text>
                      </View>
                    )}
                    
                    {/* Etkinlik resmi veya spor ikonu */}
                    <View style={styles.horizontalEventImageContainer}>
                    
                            {event.image_url ? (
                      console.log("eventttt", event),
                        <Image 
                          source={{uri: event.image_url}}
                          style={styles.horizontalEventImage}
                          resizeMode="cover"
                        />
                      ) : event.sport_id.toLowerCase().includes('futbol') ? (
                        <Image 
                          source={{uri: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571'}}
                          style={styles.horizontalEventImage}
                          resizeMode="cover"
                        />
                      ) : event.sport_id.toLowerCase().includes('basket') ? (
                        <Image 
                          source={{uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc'}}
                          style={styles.horizontalEventImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.horizontalEventImagePlaceholder, { backgroundColor: theme.colors.accent + '30' }]}>
                          <Ionicons name="fitness-outline" size={32} color={theme.colors.accent} />
                        </View>
                      )}
                      
                   
                    </View>
                    
                    {/* Etkinlik bilgileri */}
                    <View style={styles.horizontalEventInfo}>
                      <Text style={[styles.horizontalEventTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        {event.title}
                      </Text>
                      
                     
                      
                      <View style={styles.horizontalEventDetails}>
                        <View style={styles.horizontalEventDetailRow}>
                          <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                          <Text style={[styles.horizontalEventDetailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                            {event.location_name || 'Konum bilgisi yok'}
                          </Text>
                        </View>
                        
                        <View style={styles.horizontalEventDetailRow}>
                          <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                          <Text style={[styles.horizontalEventDetailText, { color: theme.colors.textSecondary }]}>
                            {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </Text>
                        </View>
                        
                        <View style={styles.horizontalEventDetailRow}>
                          <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                          <Text style={[styles.horizontalEventDetailText, { color: theme.colors.textSecondary }]}>
                            {event.start_time || '00:00'}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.horizontalEventActionRow}>
                        <View style={[styles.participantsBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                          <Ionicons name="people" size={12} color={theme.colors.primary} />
                          <Text style={[styles.participantsCount, { color: theme.colors.primary }]}>
                            {event.current_participants || 0}/{event.max_participants || 'sınırsız'}
                          </Text>
                        </View>
                        
                        <TouchableOpacity style={[styles.joinButton, { backgroundColor: theme.colors.accent }]}>
                          <Text style={styles.joinButtonText}>Katıl</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
              
              {nearbyEvents.length > 5 && (
                <TouchableOpacity
                  style={[styles.viewAllCardHorizontal, { backgroundColor: theme.colors.card + '80' }]}
                  onPress={handleViewAllEvents}
                  activeOpacity={0.7}
                >
                  <View style={styles.viewAllContent}>
                    <Ionicons name="grid-outline" size={24} color={theme.colors.primary} style={{ marginBottom: 10 }} />
                    <Text style={[styles.viewAllText, { color: theme.colors.primary, fontWeight: '600' }]}>
                      Tümünü Gör
                    </Text>
                    <Ionicons name="chevron-forward-circle" size={24} color={theme.colors.primary} style={{ marginTop: 10 }} />
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <View style={[styles.emptyCardHorizontal, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="location-outline" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Yakınında etkinlik bulunamadı
              </Text>
            </View>
          )}
        </View>

        {/* Spor Haberleri - Yatay kaydırmalı */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={{
                marginRight: 8, 
                backgroundColor: '#2196F320', 
                borderRadius: 12, 
                padding: 4,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="newspaper-outline" size={20} color="#2196F3" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spor Haberleri</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AllNewsScreen')}>
              <View style={{
                borderWidth: 1,
                borderColor: '#2196F340',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text style={[styles.viewAllText, { color: '#2196F3' }]}>
                  Tümü <Ionicons name="chevron-forward" size={14} color="#2196F3" />
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
                        <Ionicons name="newspaper" size={30} color={theme.colors.accent} />
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
                        <Ionicons name="person-outline" size={12} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '500' }}>
                          {newsItem.author || 'İsimsiz Yazar'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )) : (
                <View style={[styles.emptyCardHorizontal, { backgroundColor: theme.colors.card }]}>
                  <Ionicons name="newspaper-outline" size={24} color={theme.colors.textSecondary} />
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
                    <Ionicons name="newspaper" size={24} color={theme.colors.accent} style={{ marginBottom: 10 }} />
                    <Text style={[styles.viewAllText, { color: theme.colors.accent, fontWeight: '600' }]}>
                      Tümünü Gör
                    </Text>
                    <Ionicons name="chevron-forward-circle" size={24} color={theme.colors.accent} style={{ marginTop: 10 }} />
                  </View>
                </TouchableOpacity>
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
          <Ionicons 
            name="calendar-outline" 
            size={16} 
            color={theme.colors.textSecondary} 
            style={{ marginRight: 4 }}
          />
          <Text style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontWeight: '500',
          }}>
            {new Date().toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
          <View style={{ 
            height: 10, 
            width: 1, 
            backgroundColor: theme.colors.textSecondary + '40',
            marginHorizontal: 8
          }} />
          <Text style={{
            fontSize: 13,
            color: theme.colors.textSecondary,
            fontWeight: '400',
          }}>
            SportLink v{Constants.expoConfig?.version || '1.0.0'}
          </Text>
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
            backgroundColor: '#2196F3',
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
    paddingHorizontal: 16,
    paddingRight: 8,
    paddingBottom: 2,
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
});

export default HomeScreen;