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
  
  // API yapısına göre kullanıcının katılma durumunu belirle
  const isUserParticipant = safeEvent.is_joined || false;
  const isUserCreator = safeEvent.creator_id === user?.id;

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

  // Spor etkinliği için uygun ikonu belirle
  const getSportIcon = (sport: any) => {
    if (!sport) return 'fitness-outline';
    
    // Spor ismini al (api yanıtına göre)
    const sportName = sport.name?.toLowerCase() || '';
    const sportIcon = sport.icon || '';
    
    // API'den gelen icon değerini kontrol et
    if (sportIcon && sportIcon !== 'default-icon') {
      if (sportIcon.includes('football')) return 'football-outline';
      if (sportIcon.includes('basketball')) return 'basketball-outline';
      return 'fitness-outline';
    }
    
    // Sport adına göre standart ikon belirle
    if (sportName.includes('futbol')) return 'football-outline';
    if (sportName.includes('basketbol')) return 'basketball-outline'; 
    if (sportName.includes('voleybol')) return 'baseball-outline';
    if (sportName.includes('tenis')) return 'tennisball-outline';
    if (sportName.includes('yüzme')) return 'water-outline';
    if (sportName.includes('koşu') || sportName.includes('kosu')) return 'walk-outline';
    if (sportName.includes('bisiklet')) return 'bicycle-outline';
    if (sportName.includes('e-spor') || sportName.includes('espor')) return 'game-controller-outline';
    if (sportName.includes('masa tenisi')) return 'tennisball-outline';
    return 'fitness-outline'; // Varsayılan
  };
  
  // Katılımcıların avatarlarını göster
  const renderParticipantAvatars = () => {
    const maxVisibleAvatars = 3;
    const participants = safeEvent.participants || [];
    const totalParticipants = safeEvent.participant_count;
    
    // Gösterilecek katılımcıları belirle
    const visibleParticipants = participants.slice(0, maxVisibleAvatars);
    
    return (
      <View style={styles.participantsIconContainer}>
        {/* Katılımcılar varsa en fazla 3 avatar göster */}
        {visibleParticipants.length > 0 && visibleParticipants.map((participant :any, index:any) => (
          <View 
            key={participant.user_id || index}
            style={[
              styles.participantAvatar,
              { 
                backgroundColor: theme.colors.accent,
                left: index * -8,
                zIndex: maxVisibleAvatars - index,
              }
            ]}
          >
            {participant.user?.profile_picture ? (
              <Image source={{ uri: participant.user.profile_picture }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={10} color="white" />
            )}
          </View>
        ))}
        
        {/* Eğer katılımcı yoksa veya hiç gösterilen katılımcı yoksa */}
        {visibleParticipants.length === 0 && (
          <View 
            style={[
              styles.participantAvatar,
              { 
                backgroundColor: theme.colors.accent,
                zIndex: 3,
              }
            ]}
          >
            <Ionicons name="person" size={10} color="white" />
          </View>
        )}
        
        {/* Ek katılımcıları +X şeklinde göster */}
        {totalParticipants > maxVisibleAvatars && (
          <View 
            style={[
              styles.participantAvatarMore,
              { 
                backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
                left: (maxVisibleAvatars - 1) * -8 + 8,
                zIndex: 0,
              }
            ]}
          >
            <Text style={[styles.moreText, { color: theme.colors.text }]}>
              +{totalParticipants - maxVisibleAvatars}
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  // Oluşturucu bilgisini formatla
  const getCreatorName = () => {
    if (!safeEvent.creator) return 'Kullanıcı';
    
    const firstName = safeEvent.creator.first_name || '';
    const lastName = safeEvent.creator.last_name || '';
    const username = safeEvent.creator.username || '';
    
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || username || 'Kullanıcı';
  };
  
  // Tarihi geçmiş etkinlik mi kontrol et  
  const isExpiredEvent = safeEvent.event_date && isDatePassed(safeEvent.event_date) && safeEvent.status === 'active';
  const shouldHighlight = isExpiredEvent;
  
  // Status badge için ikon ve renk belirle
  const getStatusBadge = () => {
    // Kullanıcının bu etkinlikle ilgili durumu
    if (isUserCreator) {
      return {
        icon: 'star',
        color: '#FFD700', // Altın rengi
        bgColor: '#FFD700',
        show: true
      };
    }
    
    if (isUserParticipant) {
      return {
        icon: 'checkmark',
        color: '#4CAF50', // Yeşil
        bgColor: '#4CAF50',
        show: true
      };
    }
    
    // Etkinlik durumuna göre
    switch (safeEvent.status) {
      case 'active':
        if (!isEventFull) {
          return {
            icon: 'add',
            color: '#4CAF50', // Yeşil - pozitif mesaj için
            bgColor: '#4CAF50',
            show: true
          };
        }
        return { show: false };
      case 'completed':
        return {
          icon: 'trophy',
          color: '#4CAF50', // Yeşil
          bgColor: '#4CAF50',
          show: true
        };
      default:
        return { show: false };
    }
  };
  
  const statusBadge = getStatusBadge();
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.cardBackground || theme.colors.background,
          borderColor: getBorderColor(safeEvent.status, safeEvent.event_date, safeEvent.is_private, theme.colors),
          borderWidth: 2, // Çerçeveyi daha belirgin yapmak için 2 yaptık
          shadowColor: safeEvent.is_private ? '#000000' : getBorderColor(safeEvent.status, safeEvent.event_date, safeEvent.is_private, theme.colors),
          shadowOpacity: safeEvent.is_private ? 0.15 : 0.1,
          // Pasif veya tarihi geçmiş etkinlikler için opaklığı azalt
          opacity: shouldHighlight ? 0.8 : 1,
        },
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Status Badge - Sol üst köşe */}
      {statusBadge.show && (
        <View style={[
          styles.statusBadgeTopLeft,
          { backgroundColor: statusBadge.bgColor }
        ]}>
          <Ionicons 
            name={statusBadge.icon as any} 
            size={16} 
            color="white" 
          />
        </View>
      )}
      
      {/* Kategori/Spor Türü İkonu - Daha Belirgin */}
      <View style={[styles.sportIconContainer, { backgroundColor: '#FF6B35' + '20' }]}>
        <Ionicons 
          name={getSportIcon(safeEvent.sport)} 
          size={24} 
          color="#FF6B35" 
        />
      </View>
      
      {/* Status Badge - Aktif olmayan etkinlikler için */}
      {(safeEvent.status !== 'active' || shouldHighlight) && (
        <View style={[
          styles.expiredBadge, 
          { 
            backgroundColor: getStatusColor(safeEvent.status, safeEvent.event_date, theme.colors) 
          }
        ]}>
          <Ionicons 
            name={getStatusIcon(safeEvent.status, safeEvent.event_date)} 
            size={12} 
            color="white" 
          />
        </View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <Text 
          style={[styles.title, { color: theme.colors.text }]} 
          numberOfLines={1}
        >
          {safeEvent.title}
        </Text>
      </View>
      
      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: getStatusColor(safeEvent.status, safeEvent.event_date, theme.colors) + '20',
            borderColor: getStatusColor(safeEvent.status, safeEvent.event_date, theme.colors), 
          }
        ]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(safeEvent.status, safeEvent.event_date, theme.colors) }]} />
          <Ionicons 
            name={getStatusIcon(safeEvent.status, safeEvent.event_date)} 
            size={12} 
            color={getStatusColor(safeEvent.status, safeEvent.event_date, theme.colors)} 
            style={{marginRight: 4}} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(safeEvent.status, safeEvent.event_date, theme.colors), fontWeight: '700' }]}>
            {getStatusText(safeEvent.status, safeEvent.event_date)}
          </Text>
        </View>
        
        {/* Özel etkinlik rozeti */}
        {safeEvent.is_private && (
          <View style={[
            styles.privateBadge, 
            { 
              backgroundColor: theme.colors.accent + '15',
              borderColor: theme.colors.accent, 
            }
          ]}>
            <Ionicons name="lock-closed" size={10} color={theme.colors.accent} style={styles.privateIcon} />
            <Text style={[styles.privateText, { color: theme.colors.accent }]}>
              Özel Etkinlik
            </Text>
          </View>
        )}
      </View>
      
      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]} />
      
      {/* Details - Daha Net Bilgiler */}
      <View style={styles.details}>
        <View style={styles.infoItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#FF6B35' + '15' }]}>
            <Ionicons name="calendar-outline" size={16} color="#FF6B35" />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.text, fontWeight: '600' }]}>
            {formatDate(safeEvent.event_date)}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#FF6B35' + '15' }]}>
            <Ionicons name="time-outline" size={16} color="#FF6B35" />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.text, fontWeight: '600' }]}>
            {formatTimeRange(safeEvent.start_time, safeEvent.end_time)}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#FF6B35' + '15' }]}>
            <Ionicons name="location-outline" size={16} color="#FF6B35" />
          </View>
          <Text 
            style={[styles.infoText, { color: theme.colors.text, fontWeight: '600' }]}
            numberOfLines={1}
          >
            {safeEvent.location_name}
          </Text>
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        {/* Participants - Sol taraf */}
        <View style={styles.participantsContainer}>
          {renderParticipantAvatars()}
          
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {safeEvent.participant_count}/{safeEvent.max_participants}
          </Text>
        </View>
        
        {/* Katıl Butonu - Sağ taraf */}
        {!isUserParticipant && !isUserCreator && !isEventFull && safeEvent.status === 'active' && (
          <TouchableOpacity 
            style={[
              styles.joinButton, 
              { 
                backgroundColor: isJoining ? '#ccc' : '#FF6B35',
                opacity: isJoining ? 0.7 : 1
              }
            ]}
            onPress={handleJoinEvent}
            activeOpacity={0.8}
            disabled={isJoining}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="white" style={{ marginRight: 6 }} />
            ) : (
              <Ionicons name="add-circle-outline" size={16} color="white" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.joinButtonText}>
              {isJoining ? 'Katılıyor...' : 'Katıl'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Join status badges */}
      {showJoinStatus && (
        <View style={styles.joinStatusContainer}>
            {isUserParticipant && (
              <View style={[styles.joinBadge, { backgroundColor: '#4CAF50' + '15' }]}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" style={{ marginRight: 4 }} />
                <Text style={[styles.joinBadgeText, { color: '#4CAF50' }]}>Katıldınız</Text>
              </View>
            )}
            
            {isUserCreator && (
              <View style={[styles.joinBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="create" size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.joinBadgeText, { color: theme.colors.primary }]}>Düzenleyiciniz</Text>
              </View>
            )}
            
            {isEventFull && !isUserParticipant && !isUserCreator && (
              <View style={[styles.joinBadge, { backgroundColor: theme.colors.error + '15' }]}>
                <Ionicons name="close-circle" size={14} color={theme.colors.error} style={{ marginRight: 4 }} />
                <Text style={[styles.joinBadgeText, { color: theme.colors.error }]}>Dolu</Text>
              </View>
            )}
          </View>
        )}
      
      {/* Creator info */}
      {safeEvent.creator && (
        <View style={styles.creatorSection}>
          <View style={styles.creatorContainer}>
            <View style={[styles.creatorAvatarPlaceholder, { backgroundColor: theme.colors.accent + '30' }]}>
              <Ionicons name="person" size={12} color={theme.colors.accent} />
            </View>
            <Text style={[styles.creatorName, { color: theme.colors.text }]}>
              {getCreatorName()}
            </Text>
          </View>
        </View>
      )}
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
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
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