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
import { formatDate, formatTimeRange } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

interface EventCardProps {
  event: Event;
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
  
  // Güvenlik kontrolleri
  const safeEvent = {
    ...event,
    current_participants: event.current_participants || 0,
    max_participants: event.max_participants || 0,
    status: event.status || 'active'
  };
  
  const isEventFull = safeEvent.current_participants >= safeEvent.max_participants;
  
  // Spor etkinliği için uygun ikonu belirle
  const getSportIcon = (sportType: string = '') => {
    const type = (sportType || '').toLowerCase();
    if (type.includes('futbol')) return 'football-outline';
    if (type.includes('basketbol')) return 'basketball-outline'; 
    if (type.includes('voleybol')) return 'baseball-outline';
    if (type.includes('tenis')) return 'tennisball-outline';
    if (type.includes('yüzme')) return 'water-outline';
    if (type.includes('koşu') || type.includes('kosu')) return 'walk-outline';
    if (type.includes('bisiklet')) return 'bicycle-outline';
    if (type.includes('e-spor') || type.includes('espor')) return 'game-controller-outline';
    if (type.includes('masa tenisi')) return 'tennisball-outline';
    return 'fitness-outline'; // Varsayılan
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.cardBackground || theme.colors.background,
          borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        },
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Kategori/Spor Türü İkonu */}
      <View style={[styles.sportIconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
        <Ionicons 
          name={getSportIcon(safeEvent.category)} 
          size={20} 
          color={theme.colors.accent} 
        />
      </View>
      
      {/* Header */}
      <View style={styles.header}>
        <Text 
          style={[styles.title, { color: theme.colors.text }]} 
          numberOfLines={1}
        >
          {safeEvent.title}
        </Text>
        
        {safeEvent.average_rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.colors.text }]}>
              {safeEvent.average_rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
      
      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: getStatusColor(safeEvent.status, theme.colors) + '20',
            borderColor: getStatusColor(safeEvent.status, theme.colors), 
          }
        ]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(safeEvent.status, theme.colors) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(safeEvent.status, theme.colors) }]}>
            {getStatusText(safeEvent.status)}
          </Text>
        </View>
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
          <View style={styles.participantsIconContainer}>
            {Array.from({ length: Math.max(0, Math.min(3, safeEvent.current_participants || 0)) }).map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.participantAvatar,
                  { 
                    backgroundColor: theme.colors.accent,
                    left: index * -8,
                    zIndex: 3 - index,
                  }
                ]}
              >
                {safeEvent.creator_avatar && index === 0 ? (
                  <Image source={{ uri: safeEvent.creator_avatar }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={10} color="white" />
                )}
              </View>
            ))}
          </View>
          
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {safeEvent.current_participants}/{safeEvent.max_participants}
          </Text>
        </View>
        
        {/* Join status badges */}
        {showJoinStatus && (
          <View style={styles.joinStatusContainer}>
            {safeEvent.is_joined && (
              <View style={[styles.joinBadge, { backgroundColor: theme.colors.accent + '15' }]}>
                <Text style={[styles.joinBadgeText, { color: theme.colors.accent }]}>Katıldınız</Text>
              </View>
            )}
            
            {safeEvent.is_creator && (
              <View style={[styles.joinBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                <Text style={[styles.joinBadgeText, { color: theme.colors.primary }]}>Düzenleyiciniz</Text>
              </View>
            )}
            
            {isEventFull && !safeEvent.is_joined && !safeEvent.is_creator && (
              <View style={[styles.joinBadge, { backgroundColor: theme.colors.error + '15' }]}>
                <Text style={[styles.joinBadgeText, { color: theme.colors.error }]}>Dolu</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Creator info */}
      {safeEvent.creator_name && (
        <View style={styles.creatorSection}>
          <View style={styles.creatorContainer}>
            {safeEvent.creator_avatar ? (
              <Image 
                source={{ uri: safeEvent.creator_avatar }} 
                style={styles.creatorAvatar} 
              />
            ) : (
              <View style={[styles.creatorAvatarPlaceholder, { backgroundColor: theme.colors.accent + '30' }]}>
                <Ionicons name="person" size={12} color={theme.colors.accent} />
              </View>
            )}
            <Text style={[styles.creatorName, { color: theme.colors.text }]}>
              {safeEvent.creator_name}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'active':
      return colors.success;
    case 'canceled':
      return colors.error;
    case 'completed':
      return colors.info;
    case 'draft':
      return colors.warning;
    default:
      return colors.secondary;
  }
};

const getStatusText = (status: string) => {
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
});