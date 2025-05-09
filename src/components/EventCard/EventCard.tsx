import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ViewStyle,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
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
  // API yanıtında kullanıcının katılma durumunu kontrol et
  const isUserParticipant = false; // API'den gelecek
  const isUserCreator = event.creator_id === "currentUserId"; // API'den gelecek

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
  
  // Tarihi geçmiş veya pasif etkinlik mi kontrol et
  const isExpiredEvent = safeEvent.event_date && isDatePassed(safeEvent.event_date) && safeEvent.status === 'active';
  const isPassiveEvent = safeEvent.status === 'passive';
  const shouldHighlight = isExpiredEvent || isPassiveEvent;
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.cardBackground || theme.colors.background,
          borderColor: safeEvent.is_private 
            ? theme.colors.accent 
            : getStatusColor(safeEvent.status, safeEvent.event_date, theme.colors) + '40',
          borderWidth: safeEvent.is_private ? 2 : 1,
          shadowColor: safeEvent.is_private ? theme.colors.accent : '#000',
          shadowOpacity: safeEvent.is_private ? 0.1 : 0.05,
          // Pasif veya tarihi geçmiş etkinlikler için opaklığı azalt
          opacity: shouldHighlight ? 0.8 : 1,
        },
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Kategori/Spor Türü İkonu */}
      <View style={[styles.sportIconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
        <Ionicons 
          name={getSportIcon(safeEvent.sport)} 
          size={20} 
          color={theme.colors.accent} 
        />
      </View>
      
      {/* Pasif veya Tarihi Geçmiş Badge */}
      {shouldHighlight && (
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
      
      {/* Details */}
      <View style={styles.details}>
        <View style={styles.infoItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {formatDate(safeEvent.event_date)}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {formatTimeRange(safeEvent.start_time, safeEvent.end_time)}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          </View>
          <Text 
            style={[styles.infoText, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {safeEvent.location_name}
          </Text>
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        {/* Participants */}
        <View style={styles.participantsContainer}>
          {renderParticipantAvatars()}
          
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {safeEvent.participant_count}/{safeEvent.max_participants}
          </Text>
        </View>
        
        {/* Join status badges */}
        {showJoinStatus && (
          <View style={styles.joinStatusContainer}>
            {isUserParticipant && (
              <View style={[styles.joinBadge, { backgroundColor: theme.colors.accent + '15' }]}>
                <Text style={[styles.joinBadgeText, { color: theme.colors.accent }]}>Katıldınız</Text>
              </View>
            )}
            
            {isUserCreator && (
              <View style={[styles.joinBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                <Text style={[styles.joinBadgeText, { color: theme.colors.primary }]}>Düzenleyiciniz</Text>
              </View>
            )}
            
            {isEventFull && !isUserParticipant && !isUserCreator && (
              <View style={[styles.joinBadge, { backgroundColor: theme.colors.error + '15' }]}>
                <Text style={[styles.joinBadgeText, { color: theme.colors.error }]}>Dolu</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
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

// Etkinlik durumuna göre renk belirle
const getStatusColor = (status: string, eventDate: string | undefined, colors: any) => {
  // Etkinlik tarihi geçmiş mi kontrol et
  if (eventDate && isDatePassed(eventDate) && status === 'active') {
    return colors.warning; // Uyarı rengi (turuncu gibi)
  }
  
  switch (status) {
    case 'active':
      return colors.accent;
    case 'passive':
      return colors.textSecondary; // Pasif rengi (gri gibi)
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
    case 'passive':
      return 'Pasif';
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
    case 'passive':
      return 'eye-off-outline';
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
});