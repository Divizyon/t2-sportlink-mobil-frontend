import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ViewStyle,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useEventStore } from '../../store/eventStore/eventStore';
import { useAuthStore } from '../../store/userStore/authStore';
import { Event } from '../../types/eventTypes/event.types';
import { formatDate, formatTimeRange, isDatePassed } from '../../utils/dateUtils';

// Spor görselleri - assets/sportImage altındaki tüm görselleri ekle
const footballImage = require('../../../assets/sportImage/football.png');
const basketballImage = require('../../../assets/sportImage/basketball.png');
const tennisImage = require('../../../assets/sportImage/tennis.png');
const volleyballImage = require('../../../assets/sportImage/volleyball.png');
const walkImage = require('../../../assets/sportImage/walk.png');

// Spor kategorilerine göre lokal görsel tanımları
const sportImages: Record<string, any> = {
  futbol: footballImage,
  football: footballImage,
  basketbol: basketballImage,
  basketball: basketballImage,
  tenis: tennisImage,
  tennis: tennisImage,
  voleybol: volleyballImage,
  volleyball: volleyballImage,
  yürüyüş: walkImage,
  walk: walkImage,
  default: footballImage, // Default olarak futbol görseli
};

// Spor kategorisini alarak görsel kaynağını döndüren yardımcı fonksiyon
export const getSportImageSource = (sportName: string): any => {
  if (!sportName) return sportImages.default;
  const sport = sportName.toLowerCase();
  if (sport.includes('yürü') || sport.includes('walk')) return sportImages.yürüyüş;
  if (sport.includes('futbol') || sport.includes('football')) return sportImages.futbol;
  if (sport.includes('basket')) return sportImages.basketbol;
  if (sport.includes('tenis') || sport.includes('tennis')) return sportImages.tenis;
  if (sport.includes('voley') || sport.includes('volley')) return sportImages.voleybol;
  return sportImages.default;
};

// Spor kategorisine göre tag rengini döndüren yardımcı fonksiyon
export const getSportTagColor = (sportName: string): string => {
  if (!sportName) return '#2196F3';
  
  const sport = sportName.toLowerCase();
  if (sport.includes('yürü') || sport.includes('walk')) return '#479B6E';
  if (sport.includes('futbol') || sport.includes('football')) return '#64BF77';
  if (sport.includes('basket')) return '#E4843D';
  if (sport.includes('yüz') || sport.includes('swim')) return '#27BCE7';
  if (sport.includes('tenis')) return '#FF9800';
  if (sport.includes('voleybol')) return '#9C27B0';
  return '#2196F3';
};

const { width } = Dimensions.get('window');

interface EventCardProps {
  event: any;
  onPress?: () => void;
  style?: ViewStyle;
  showJoinStatus?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onPress, 
  style,
  showJoinStatus = true,
}) => {
  const { theme } = useThemeStore();
  const { joinEvent } = useEventStore();
  const { user } = useAuthStore();
  
  // Katılım işlemi için loading state
  const [isJoining, setIsJoining] = useState(false);
  
  // Güvenlik kontrolleri ve API yanıtına uygun değerleri ayarla
  const safeEvent = {
    ...event,
    participants: event.participants || [],
    participant_count: event._count?.participants || event.participants?.length || 0,
    max_participants: event.max_participants || 0,
    status: event.status || 'active',
    creator: event.creator || {},
    sport: event.sport || { name: '', icon: '' },
    is_private: event.is_private || false
  };
  
  const isEventFull = safeEvent.participant_count >= safeEvent.max_participants;

  // Etkinliğe katılma fonksiyonu
  const handleJoinEvent = async () => {
    if (!user) {
      Alert.alert('Hata', 'Etkinliğe katılmak için giriş yapmalısınız.');
      return;
    }
    
    if (safeEvent.is_private) {
      Alert.alert(
        'Özel Etkinlik', 
        'Bu özel bir etkinliktir. Etkinlik detayına giderek davet kodu ile katılabilirsiniz.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Detaya Git', onPress: () => onPress && onPress() }
        ]
      );
      return;
    }
    
    try {
      setIsJoining(true);
      const success = await joinEvent(safeEvent.id);
      if (success) {
        Alert.alert('Başarılı', 'Etkinliğe başarıyla katıldınız!');
      }
    } catch (error) {
      console.error('Katılım hatası:', error);
      Alert.alert('Hata', 'Etkinliğe katılırken bir hata oluştu.');
    } finally {
      setIsJoining(false);
    }
  };

  
  // API yapısına göre kullanıcının katılma durumunu belirle
  const isUserParticipant = safeEvent.is_joined || false;
  const isUserCreator = safeEvent.creator_id === user?.id;

  // Spor kategorisine göre icon adını döndüren yardımcı fonksiyon
  const getSportIcon = (
    sportName: string
  ): "football-outline" | "basketball-outline" | "tennisball-outline" | "baseball-outline" | "fitness-outline" => {
    if (!sportName) return 'fitness-outline';
    
    const sport = sportName.toLowerCase();
    if (sport.includes('futbol')) return 'football-outline';
    if (sport.includes('basket')) return 'basketball-outline';
    if (sport.includes('tenis')) return 'tennisball-outline';
    if (sport.includes('voleybol')) return 'baseball-outline';
    return 'fitness-outline';
  };

  // Tarih ve saat formatları
  const formatEventDate = (date: Date | string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Yarın';
    } else {
      // Basit Türkçe gün formatı
      const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      return days[eventDate.getDay()];
    }
  };

  const formatEventTime = (time: Date | string) => {
    const eventTime = new Date(time);
    return `${eventTime.getHours().toString().padStart(2, '0')}:${eventTime.getMinutes().toString().padStart(2, '0')}`;
  };

  // Kategori görselini ve tag rengini belirleme
  const sportImage = getSportImageSource(safeEvent.sport?.name || '');
  const tagColor = getSportTagColor(safeEvent.sport?.name || '');
  const sportIconName = getSportIcon(safeEvent.sport?.name || '');

  return (
    <TouchableOpacity
      style={[styles.container, { 
        backgroundColor: theme.colors.cardBackground, 
        borderColor: tagColor, 
        borderWidth: 3 // Border kalınlığı
      }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Spor Kategori Resmi */}
      <View style={[styles.imageContainer, { backgroundColor: '#E6F4EA' }]}> 
        <Image 
          source={sportImage}
          style={styles.sportImage}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.contentContainer}>
        {/* Etkinlik Başlığı ve Katılımcı Sayısı */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={[styles.title, { color: '#222', fontWeight: 'bold', fontSize: 17, flex: 1, marginRight: 8 }]} numberOfLines={1}>
            {safeEvent.title || `${safeEvent.sport?.name || 'Spor'} Etkinliği`}
          </Text>
          {/* Katılımcı sayısı badgesi - etkinlik adının sağında */}
          <View style={{
            backgroundColor: '#4A90E2',
            borderRadius: 15,
            paddingHorizontal: 10,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Ionicons name="people-outline" size={14} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 4, fontSize: 12 }}>
              {safeEvent.participant_count || 0}/{safeEvent.max_participants || 10}
            </Text>
          </View>
        </View>
        
        {/* Tarih */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name="calendar-outline" size={16} color="#222" />
          <Text style={{ color: '#222', marginLeft: 4, fontSize: 14 }}>
            {formatEventDate(safeEvent.event_date)}
          </Text>
        </View>
        
        {/* Saat */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name="time-outline" size={16} color="#222" />
          <Text style={{ color: '#222', marginLeft: 4, fontSize: 14 }}>
            {formatEventTime(safeEvent.start_time)}
          </Text>
        </View>
        
        {/* Lokasyon ve Katıl Butonu */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
            <Ionicons name="location-outline" size={16} color="#222" />
            <Text style={{ color: '#222', marginLeft: 4, fontSize: 14 }} numberOfLines={1}>
              {safeEvent.location_name && safeEvent.location_name.length > 15 
                ? safeEvent.location_name.substring(0, 15) + '...' 
                : safeEvent.location_name}
            </Text>
          </View>
          
          {/* Katıl Butonu - konum bilgisinin sağında */}
          {isUserParticipant ? (
            <TouchableOpacity 
              style={{ 
                borderWidth: 2, 
                borderColor: tagColor, 
                backgroundColor: tagColor, 
                borderRadius: 20, 
                paddingHorizontal: 12, 
                paddingVertical: 6, 
                flexDirection: 'row', 
                alignItems: 'center' 
              }}
              disabled={true}
            >
              <Ionicons name="checkmark-circle-outline" size={14} color="white" style={{ marginRight: 2 }} />
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Katıl</Text>
            </TouchableOpacity>
          ) : isEventFull ? (
            <View style={{ 
              borderWidth: 2, 
              borderColor: '#aaa', 
              borderRadius: 20, 
              paddingHorizontal: 12, 
              paddingVertical: 6 
            }}>
              <Text style={{ color: '#aaa', fontWeight: 'bold', fontSize: 13 }}>Dolu</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={{ 
                borderWidth: 2, 
                borderColor: tagColor, 
                borderRadius: 20, 
                paddingHorizontal: 12, 
                paddingVertical: 6, 
                flexDirection: 'row', 
                alignItems: 'center' 
              }}
              onPress={handleJoinEvent}
              disabled={isJoining}
            >
              {isJoining ? (
                <ActivityIndicator size="small" color={tagColor} />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={14} color={tagColor} style={{ marginRight: 2 }} />
                  <Text style={{ color: tagColor, fontWeight: 'bold', fontSize: 13 }}>Katıl</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Etkinlik durumuna göre çerçeve rengi belirle
const getBorderColor = (status: string, eventDate: string | undefined, isPrivate: boolean, colors: any) => {
  // Özel etkinlikler siyah çerçeve
  if (isPrivate) {
    return '#000000';
  }
  
  // Etkinlik tarihi geçmiş ama hala aktifse gri
  if (eventDate && isDatePassed(eventDate) && status === 'active') {
    return '#9E9E9E'; // Gri
  }
  
  switch (status) {
    case 'active':
      return colors.accent; // Turuncu (varsayılan tema rengi)
    case 'canceled':
      return '#F44336'; // Kırmızı
    case 'completed':
      return colors.success; // Yeşil
    case 'draft':
      return '#9E9E9E'; // Gri
    default:
      return colors.textSecondary;
  }
};

// Etkinlik durumuna göre renk belirle
const getStatusColor = (status: string, eventDate: string | undefined, colors: any) => {
  // Etkinlik tarihi geçmiş mi kontrol et
  if (eventDate && isDatePassed(eventDate) && status === 'active') {
    return colors.warning; // Uyarı rengi (turuncu gibi)
  }
  
  switch (status) {
    case 'active':
      return colors.accent;
    case 'canceled':
      return colors.error;
    case 'completed':
      return colors.success;
    case 'draft':
      return colors.textSecondary;
    default:
      return colors.text;
  }
};

// Etkinlik durumuna göre metin belirle
const getStatusText = (status: string, eventDate?: string) => {
  // Etkinlik tarihi geçmiş mi kontrol et
  if (eventDate && isDatePassed(eventDate) && status === 'active') {
    return 'Tarihi Geçmiş';
  }
  
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'canceled':
      return 'İptal Edildi';
    case 'completed':
      return 'Tamamlandı';
    case 'draft':
      return 'Taslak';
    default:
      return status;
  }
};

// Status badge ikonu belirle
const getStatusIcon = (status: string, eventDate?: string) => {
  // Tarihi geçmiş etkinlikler için
  if (eventDate && isDatePassed(eventDate) && status === 'active') {
    return 'time-outline';
  }
  
  switch (status) {
    case 'active':
      return 'checkmark-circle-outline';
    case 'canceled':
      return 'close-circle-outline';
    case 'completed':
      return 'trophy-outline';
    case 'draft':
      return 'document-outline';
    default:
      return 'help-circle-outline';
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    width: width - 32, // Ekran genişliği - marginler
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    overflow: 'hidden',
  },
  sportImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadgeTopLeft: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  sportIconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingRight: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 2,
    fontWeight: '600',
  },
  statusContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
  privateIcon: {
    marginRight: 4,
  },
  privateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
  details: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantsIconContainer: {
    flexDirection: 'row',
    marginRight: 12,
    width: 44,
    height: 20,
  },
  participantAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  participantAvatarMore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  moreText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  joinStatusContainer: {
    flexDirection: 'row',
  },
  joinBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
  },
  joinBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  creatorSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  creatorAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorName: {
    fontSize: 13,
    fontWeight: '600',
  },
  expiredBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});