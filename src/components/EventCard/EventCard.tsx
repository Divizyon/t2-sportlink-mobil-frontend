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

// Spor görselleri
const footballImage = require('../../../assets/sportImage/football.png');
const basketballImage = require('../../../assets/sportImage/basketball.png');
const tennisImage = require('../../../assets/sportImage/tennis.png');
const volleyballImage = require('../../../assets/sportImage/volleyball.png');
const walkImage = require('../../../assets/sportImage/run.png');

// Spor kategorilerine göre görsel tanımları
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
  default: footballImage,
};

// Spor kategorisini alarak görsel kaynağını döndüren fonksiyon
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

// Spor kategorisine göre renk döndüren fonksiyon
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
  
  const [isJoining, setIsJoining] = useState(false);
  
  // Güvenlik kontrolleri ve varsayılan değerler
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
  
  const isUserParticipant = safeEvent.is_joined || false;
  const isUserCreator = safeEvent.creator_id === user?.id;

  const formatEventTime = (time: Date | string) => {
    const eventTime = new Date(time);
    return `${eventTime.getHours().toString().padStart(2, '0')}:${eventTime.getMinutes().toString().padStart(2, '0')}`;
  };

  // Kategori görselini ve tag rengini belirleme
  const sportImage = getSportImageSource(safeEvent.sport?.name || '');
  const tagColor = getSportTagColor(safeEvent.sport?.name || '');

  return (
    <TouchableOpacity
      style={[styles.container, { 
        backgroundColor: theme.colors.cardBackground, 
        borderColor: tagColor, 
        borderWidth: 3
      }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Spor Görseli ve Katılımcı Sayısı */}
      <View style={[styles.imageContainer, { backgroundColor: '#E6F4EA' }]}> 
        <Image 
          source={sportImage}
          style={styles.sportImage}
          resizeMode="cover"
        />
        <View style={[styles.participantsBadge, { position: 'absolute', top: 8, right: 8 }]}>
          <Ionicons name="people-outline" size={14} color="white" />
          <Text style={styles.participantsText}>
            {safeEvent.participant_count || 0}/{safeEvent.max_participants || 10}
          </Text>
        </View>
      </View>
      
      {/* İçerik */}
      <View style={styles.contentContainer}>
        {/* Etkinlik Başlığı */}
        <View style={{ marginBottom: 8 }}>
          <Text style={[styles.title, { color: '#222', fontWeight: 'bold', fontSize: 17 }]} numberOfLines={1}>
            {safeEvent.title && safeEvent.title.length > 30 
              ? `${safeEvent.title.substring(0, 30)}...` 
              : safeEvent.title || `${safeEvent.sport?.name || 'Spor'} Etkinliği`}
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
          
          {/* Katıl Butonu */}
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
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Katıldın</Text>
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    minHeight: 180,
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
  participantsBadge: {
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  participantsText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
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
});
