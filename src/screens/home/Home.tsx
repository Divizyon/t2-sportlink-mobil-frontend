import React, { useState, useEffect } from 'react';
import { ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Text,
  Box,
  HStack,
  VStack,
  Icon,
  Pressable,
  Divider,
  BellIcon,
  ChevronRightIcon,
  Badge,
  BadgeText,
  BadgeIcon,
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../../store/slices/themeSlice';
import { COLORS } from '../../constants/colors';
import { Header, WelcomeMessage } from '../../components';
import EventDetailsPopup from '../../../components/modals/EventDetailsPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tema renk konfigürasyonları
const getThemeColors = (isDark: boolean) => {
  return {
    primary: isDark ? COLORS.accent : COLORS.accent,
    secondary: isDark ? COLORS.info : COLORS.secondary,
    background: isDark ? COLORS.secondary : COLORS.neutral.silver,
    card: isDark ? COLORS.primary : COLORS.neutral.white,
    text: {
      dark: isDark ? COLORS.neutral.white : COLORS.primary,
      light: isDark ? COLORS.neutral.dark : COLORS.neutral.dark,
    },
    divider: isDark ? COLORS.neutral.dark : COLORS.neutral.light,
  };
};

// Yakındaki etkinlikler
const nearbyEvents = [
  {
    id: 101,
    title: 'Parkta Sabah Koşusu',
    type: 'Koşu',
    location: 'Maçka Parkı',
    distance: '1.2 km',
    time: 'Bugün, 08:00',
    participants: 8,
    image: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=300&auto=format',
    // EventDetailsPopup için gerekli ek alanlar
    sportType: 'Koşu',
    date: 'Bugün, 08:00',
    participantCount: 8,
    maxParticipants: 15,
    creatorName: 'Ayşe Yılmaz',
    description: 'Sabah koşusu ile güne enerjik başlayın. Her seviyeden koşucu katılabilir.',
  },
  {
    id: 102,
    title: 'Basketbol Maçı',
    type: 'Basketbol',
    location: 'Kadıköy Spor Salonu',
    distance: '3.5 km',
    time: 'Yarın, 18:30',
    participants: 12,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=300&auto=format',
    // EventDetailsPopup için gerekli ek alanlar
    sportType: 'Basketbol',
    date: 'Yarın, 18:30',
    participantCount: 12,
    maxParticipants: 16,
    creatorName: 'Mehmet Demir',
    description:
      'Dostça bir basketbol maçı. Herkes davetlidir, hoş bir rekabet ortamında basketbol oynayacağız.',
  },
  {
    id: 103,
    title: 'Yüzme Antrenmanı',
    type: 'Yüzme',
    location: 'Olimpiyat Havuzu',
    distance: '5.8 km',
    time: 'Çarşamba, 17:00',
    participants: 6,
    image: 'https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?q=80&w=300&auto=format',
    // EventDetailsPopup için gerekli ek alanlar
    sportType: 'Yüzme',
    date: 'Çarşamba, 17:00',
    participantCount: 6,
    maxParticipants: 10,
    creatorName: 'Zeynep Kaya',
    description:
      'Her seviyeden yüzücü için antrenman. Temel teknik ve dayanıklılık üzerine çalışılacak.',
  },
];

// Katılınan/ilgilenilen etkinlikler
const participatingEvents = [
  {
    id: 201,
    title: 'Haftalık Tenis Karşılaşması',
    type: 'Tenis',
    date: '25 Mayıs, 16:00',
    location: 'Ataşehir Tenis Kulübü',
    status: 'katılıyor', // katılıyor, ilgileniyor
    image: 'https://images.unsplash.com/photo-1595435934847-5ec0c8d84f2d?q=80&w=300&auto=format',
  },
  {
    id: 202,
    title: 'Yoga ve Meditasyon',
    type: 'Yoga',
    date: '27 Mayıs, 09:30',
    location: 'Yoga Studio',
    status: 'ilgileniyor',
    image: 'https://images.unsplash.com/photo-1599447292180-45fd84092ef4?q=80&w=300&auto=format',
  },
  {
    id: 203,
    title: 'Bisiklet Turu',
    type: 'Bisiklet',
    date: '30 Mayıs, 08:00',
    location: 'Belgrad Ormanı',
    status: 'katılıyor',
    image: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?q=80&w=300&auto=format',
  },
];

// Spor haberleri ve duyurular
const sportsNews = [
  {
    id: 301,
    title: 'Şehir Maratonu Kayıtları Başladı',
    description:
      'Yıllık şehir maratonu 15 Haziranda düzenlenecek. Kayıtlar için son tarih 5 Haziran.',
    date: '18 Mayıs',
    image: 'https://images.unsplash.com/photo-1530137073411-804ea400ed2d?q=80&w=300&auto=format',
  },
  {
    id: 302,
    title: 'Yeni Açılan Spor Tesisi',
    description:
      'Şehrin merkezinde açılan yeni spor tesisi, fitness, yüzme ve çeşitli takım sporları için imkanlar sunuyor.',
    date: '20 Mayıs',
    image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=300&auto=format',
  },
  {
    id: 303,
    title: 'Yaz Spor Kampları',
    description:
      'Çocuklar için yaz spor kampı kayıtları başladı. Basketbol, futbol, tenis ve yüzme eğitimleri verilecek.',
    date: '22 Mayıs',
    image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?q=80&w=300&auto=format',
  },
];

// Önemli duyurular
const announcements = [
  {
    id: 401,
    title: 'Uygulama Güncelleme Duyurusu',
    description:
      'Yeni özellikler ve performans iyileştirmeleri içeren v2.1 güncellemesi yayınlandı.',
    date: '24 Mayıs',
    isImportant: true,
    type: 'update',
  },
  {
    id: 402,
    title: 'Yeni Ödül Sistemi',
    description:
      'Etkinliklerden kazanılan puanlarla ödüller kazanabileceğiniz yeni sistem aktif edildi.',
    date: '23 Mayıs',
    isImportant: true,
    type: 'feature',
  },
];

/**
 * Ana Sayfa Ekranı
 * Yaklaşan etkinlikler, öneriler ve kullanıcı istatistiklerini gösterir
 */
export default function HomeScreen() {
  const { isDarkMode } = useThemeStore();
  const themeColors = getThemeColors(isDarkMode);

  // Popup için state'ler
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [userName, setUserName] = useState('Kullanıcı');

  // Kullanıcı adını AsyncStorage'dan al
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        if (storedUserName) {
          setUserName(storedUserName);
        }
      } catch (error) {
        console.error('Kullanıcı adı alınırken hata:', error);
      }
    };

    fetchUserName();
  }, []);

  // Etkinlik popup'ını aç
  const handleShowEventDetails = (event: any) => {
    setSelectedEvent(event);
    setShowEventPopup(true);
  };

  // Etkinlik popup'ını kapat
  const handleCloseEventPopup = () => {
    setShowEventPopup(false);
  };

  // Etkinliğe katılma işlevi
  const joinEvent = (eventId: string) => {
    console.log(`${eventId} ID'li etkinliğe katılınıyor`);
    // Burada katılma işlemini gerçekleştirecek API çağrısı yapılabilir
  };

  // Etkinlikten ayrılma işlevi
  const leaveEvent = (eventId: string) => {
    console.log(`${eventId} ID'li etkinlikten ayrılınıyor`);
    // Burada ayrılma işlemini gerçekleştirecek API çağrısı yapılabilir
  };

  // Kullanıcının etkinliğe katılıp katılmadığını kontrol et
  const isEventJoined = (eventId: string) => {
    // Burada kullanıcının etkinliğe katılıp katılmadığı kontrolü yapılabilir
    return false; // Şimdilik hepsini false döndürelim
  };

  // Bildirim ikonunu bileşen olarak oluştur
  const NotificationIcon = () => <BellIcon size="md" color={themeColors.text.dark} />;

  // Etkinlik oluşturma ikonu
  const CreateEventIcon = () => (
    <HStack space="md" alignItems="center">
      <Pressable onPress={() => console.log('Bildirimler')} mr="$3">
        <BellIcon size="md" color={themeColors.text.dark} />
      </Pressable>
      <Pressable onPress={() => router.push('/create-event' as any)}>
        <Ionicons name="add-circle-outline" size={24} color={themeColors.text.dark} />
      </Pressable>
    </HStack>
  );

  // Özel ikonlar
  const MapPinIconComponent = () => (
    <Ionicons name="location-outline" size={18} color={COLORS.accent} />
  );

  const CalendarIconComponent = () => (
    <Ionicons name="calendar-outline" size={18} color={COLORS.accent} />
  );

  const NewsIconComponent = () => (
    <Ionicons name="newspaper-outline" size={18} color={COLORS.accent} />
  );

  const MegaphoneIconComponent = () => (
    <Ionicons name="megaphone-outline" size={18} color={COLORS.warning || '#FF9500'} />
  );

  const getBellIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <Ionicons name="sync-outline" size={16} color={COLORS.info || '#007AFF'} />;
      case 'feature':
        return <Ionicons name="star-outline" size={16} color={COLORS.warning || '#FF9500'} />;
      default:
        return <Ionicons name="information-circle-outline" size={16} color={COLORS.accent} />;
    }
  };

  return (
    <Box flex={1} backgroundColor={themeColors.background}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Özel Header bileşenini kullan */}
      <Header showLogo={true} rightComponent={<CreateEventIcon />} />

      <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Karşılama Mesajı */}
        <WelcomeMessage username={userName} />

        {/* Aktivite Özeti Kartı */}
        <Box
          borderRadius="$xl"
          padding="$5"
          marginBottom="$5"
          backgroundColor={themeColors.card}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={2}
        >
          <Text fontSize="$lg" fontWeight="$bold" marginBottom="$4" color={themeColors.text.dark}>
            Bugünkü Aktiviteler
          </Text>

          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1} alignItems="center">
              <Text
                fontSize="$2xl"
                fontWeight="$bold"
                marginBottom="$1"
                color={themeColors.primary}
              >
                2,453
              </Text>
              <Text fontSize="$sm" color={themeColors.text.light}>
                Adım
              </Text>
            </VStack>

            <Divider
              orientation="vertical"
              height={50}
              marginHorizontal="$2.5"
              backgroundColor={themeColors.divider}
            />

            <VStack flex={1} alignItems="center">
              <Text
                fontSize="$2xl"
                fontWeight="$bold"
                marginBottom="$1"
                color={themeColors.primary}
              >
                3.2
              </Text>
              <Text fontSize="$sm" color={themeColors.text.light}>
                km
              </Text>
            </VStack>

            <Divider
              orientation="vertical"
              height={50}
              marginHorizontal="$2.5"
              backgroundColor={themeColors.divider}
            />

            <VStack flex={1} alignItems="center">
              <Text
                fontSize="$2xl"
                fontWeight="$bold"
                marginBottom="$1"
                color={themeColors.primary}
              >
                247
              </Text>
              <Text fontSize="$sm" color={themeColors.text.light}>
                kcal
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Önemli Duyurular */}
        <Box marginBottom="$6">
          <HStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <HStack space="sm" alignItems="center">
              <MegaphoneIconComponent />
              <Text fontSize="$lg" fontWeight="$bold" color={themeColors.text.dark}>
                Duyurular
              </Text>
            </HStack>

            <Pressable onPress={() => router.push('/announcements' as any)}>
              <HStack alignItems="center">
                <Text fontSize="$sm" color={themeColors.secondary} marginRight="$1">
                  Tümünü Gör
                </Text>
                <ChevronRightIcon size="sm" color={themeColors.secondary} />
              </HStack>
            </Pressable>
          </HStack>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {announcements.map(announcement => (
              <Pressable
                key={announcement.id}
                onPress={() =>
                  router.push({
                    pathname: `/announcements/${announcement.id}`,
                  } as any)
                }
                marginRight="$4"
              >
                <Box
                  width={280}
                  borderRadius="$xl"
                  overflow="hidden"
                  backgroundColor={themeColors.card}
                  borderLeftWidth={5}
                  borderLeftColor={announcement.type === 'update' ? COLORS.info : COLORS.warning}
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.1}
                  shadowRadius={3}
                  elevation={2}
                >
                  <Box padding="$4">
                    <HStack space="md" alignItems="flex-start" marginBottom="$2">
                      <Box
                        width={36}
                        height={36}
                        borderRadius="$full"
                        backgroundColor={
                          announcement.type === 'update'
                            ? `${COLORS.info}20`
                            : `${COLORS.warning}20`
                        }
                        justifyContent="center"
                        alignItems="center"
                      >
                        {getBellIcon(announcement.type)}
                      </Box>
                      <VStack flex={1}>
                        <Text
                          fontSize="$md"
                          fontWeight="$bold"
                          marginBottom="$1"
                          color={themeColors.text.dark}
                        >
                          {announcement.title}
                        </Text>
                        <Text fontSize="$xs" color={themeColors.text.light} fontStyle="italic">
                          {announcement.date}
                        </Text>
                      </VStack>
                    </HStack>
                    <Text
                      fontSize="$sm"
                      marginBottom="$1"
                      color={themeColors.text.light}
                      numberOfLines={2}
                    >
                      {announcement.description}
                    </Text>
                  </Box>
                </Box>
              </Pressable>
            ))}
          </ScrollView>
        </Box>

        {/* Yakındaki Etkinlikler */}
        <Box marginBottom="$6">
          <HStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <HStack space="sm" alignItems="center">
              <MapPinIconComponent />
              <Text fontSize="$lg" fontWeight="$bold" color={themeColors.text.dark}>
                Yakındaki Etkinlikler
              </Text>
            </HStack>

            <Pressable onPress={() => router.push('/nearby-events' as any)}>
              <HStack alignItems="center">
                <Text fontSize="$sm" color={themeColors.secondary} marginRight="$1">
                  Tümünü Gör
                </Text>
                <ChevronRightIcon size="sm" color={themeColors.secondary} />
              </HStack>
            </Pressable>
          </HStack>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {nearbyEvents.map(event => (
              <Pressable
                key={event.id}
                onPress={() => handleShowEventDetails(event)}
                marginRight="$4"
              >
                <Box
                  width={250}
                  borderRadius="$xl"
                  overflow="hidden"
                  backgroundColor={themeColors.card}
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.1}
                  shadowRadius={4}
                  elevation={2}
                >
                  <Box position="relative">
                    <Image
                      source={{ uri: event.image }}
                      style={{ width: '100%', height: 120 }}
                      resizeMode="cover"
                    />
                    <Box
                      position="absolute"
                      top={10}
                      right={10}
                      backgroundColor="rgba(0,0,0,0.7)"
                      borderRadius="$full"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                    >
                      <Text color="white" fontSize="$xs" fontWeight="$bold">
                        {event.distance}
                      </Text>
                    </Box>
                  </Box>
                  <Box padding="$4">
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      marginBottom="$1"
                      color={themeColors.text.dark}
                    >
                      {event.title}
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      marginBottom="$2.5"
                      color={themeColors.primary}
                    >
                      {event.type}
                    </Text>
                    <Text fontSize="$xs" marginBottom="$1" color={themeColors.text.light}>
                      📍 {event.location}
                    </Text>
                    <Text fontSize="$xs" marginBottom="$1" color={themeColors.text.light}>
                      🗓️ {event.time}
                    </Text>
                    <Text fontSize="$xs" color={themeColors.text.light}>
                      👥 {event.participants} katılımcı
                    </Text>
                  </Box>
                </Box>
              </Pressable>
            ))}
          </ScrollView>
        </Box>

        {/* Spor Haberleri */}
        <Box marginBottom="$6">
          <HStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <HStack space="sm" alignItems="center">
              <NewsIconComponent />
              <Text fontSize="$lg" fontWeight="$bold" color={themeColors.text.dark}>
                Spor Haberleri
              </Text>
            </HStack>

            <Pressable onPress={() => router.push('/news' as any)}>
              <HStack alignItems="center">
                <Text fontSize="$sm" color={themeColors.secondary} marginRight="$1">
                  Tümünü Gör
                </Text>
                <ChevronRightIcon size="sm" color={themeColors.secondary} />
              </HStack>
            </Pressable>
          </HStack>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {sportsNews.map(news => (
              <Pressable
                key={news.id}
                onPress={() =>
                  router.push({
                    pathname: `/news/${news.id}`,
                  } as any)
                }
                marginRight="$4"
              >
                <Box
                  width={300}
                  borderRadius="$xl"
                  overflow="hidden"
                  backgroundColor={themeColors.card}
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.1}
                  shadowRadius={4}
                  elevation={2}
                >
                  <Image
                    source={{ uri: news.image }}
                    style={{ width: '100%', height: 140 }}
                    resizeMode="cover"
                  />
                  <Box padding="$4">
                    <Text
                      fontSize="$md"
                      fontWeight="$bold"
                      marginBottom="$2"
                      color={themeColors.text.dark}
                    >
                      {news.title}
                    </Text>
                    <Text
                      fontSize="$xs"
                      marginBottom="$2"
                      color={themeColors.text.light}
                      numberOfLines={2}
                    >
                      {news.description}
                    </Text>
                    <Text fontSize="$xs" color={themeColors.text.light} fontStyle="italic">
                      {news.date}
                    </Text>
                  </Box>
                </Box>
              </Pressable>
            ))}
          </ScrollView>
        </Box>
      </ScrollView>

      {/* Etkinlik Detay Popup */}
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
    </Box>
  );
}
