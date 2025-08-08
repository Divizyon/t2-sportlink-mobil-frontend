import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Event } from '../../../types/eventTypes/event.types';
import { formatDistanceInfo, getDistanceColor } from '../../../utils/format.utils';
import { useEventStore } from '../../../store/eventStore/eventStore';

interface NearbyEventCardProps {
  event: Event;
  onPress: (event: Event) => void;
}

export const NearbyEventCard: React.FC<NearbyEventCardProps> = ({ event, onPress }) => {
  const { theme } = useThemeStore();
  const { joinEvent } = useEventStore();
  
  // Distance_info kontrolü ekle
  const hasDistanceInfo = event && 
    ((event as any).distance_info || typeof (event as any).distance === 'number');
  
  // Mesafe renklerini al
  const distanceColor = hasDistanceInfo ? getDistanceColor(event) : '#CCCCCC';
  
  // Etkinliğe katılma işlemi
  const handleJoinEvent = async (e: React.TouchEvent<HTMLElement>) => {
    e.stopPropagation(); // Kart yönlendirmesini engelle
    await joinEvent(event.id);
  };
  
  // Etkinlik dolu mu kontrol et
  const isEventFull = event.current_participants >= event.max_participants;
  
  // Katılabilme durumunu kontrol et
  const canJoin = !event.is_joined && !isEventFull && event.status === 'active';
  
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress(event)}
      activeOpacity={0.7}
    >
      {/* Mesafe göstergesi */}
      {hasDistanceInfo && (
        <View style={[styles.distanceBadge, { backgroundColor: distanceColor + 'E6' }]}>
          <Ionicons name="location" size={10} color="white" style={{ marginRight: 2 }} />
          <Text style={styles.distanceText}>
            {formatDistanceInfo(event)}
          </Text>
        </View>
      )}
      
      {/* Etkinlik Görseli */}
      <View style={styles.imageContainer}>
        {event.image_url ? (
          <Image 
            source={{uri: event.image_url}} 
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: '#FF6B35' + '20' }]}>
            <Ionicons name="basketball-outline" size={32} color="#FF6B35" />
          </View>
        )}
      </View>
      
      {/* Etkinlik Bilgileri */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text 
            style={[styles.eventTitle, { color: theme.colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {event.title}
          </Text>
          
          {/* Sport Badge */}
          <View style={[styles.sportBadge, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.sportText, { color: theme.colors.primary }]}>
              {event.sport_id}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color="#FF6B35" />
            <Text style={[styles.detailText, { color: theme.colors.text, fontWeight: '600' }]}>
              {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </Text>
            <Ionicons name="time-outline" size={14} color="#FF6B35" style={{ marginLeft: 8 }} />
            <Text style={[styles.detailText, { color: theme.colors.text, fontWeight: '600' }]}>
              {event.start_time}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#FF6B35" />
            <Text 
              style={[styles.detailText, { color: theme.colors.text, fontWeight: '600' }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {event.location_name}
            </Text>
          </View>
          
          <View style={styles.footerRow}>
            <View style={[styles.participantsBadge, { backgroundColor: theme.colors.primary + '15' }]}>
              <Ionicons name="people" size={12} color={theme.colors.primary} />
              <Text style={[styles.participantsText, { color: theme.colors.primary }]}>
                {event.current_participants}/{event.max_participants}
              </Text>
            </View>
            
            {event.is_joined ? (
              <View 
                style={[styles.joinedButton, { backgroundColor: '#4CAF50' }]}
              >
                <Ionicons name="checkmark-circle" size={14} color="white" style={{ marginRight: 4 }} />
                <Text style={styles.joinButtonText}>Katıldınız</Text>
              </View>
            ) : isEventFull ? (
              <View 
                style={[styles.joinButton, { backgroundColor: theme.colors.textSecondary }]}
              >
                <Text style={styles.joinButtonText}>Etkinlik Dolu</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.joinButton, { backgroundColor: '#FF6B35' }]}
                onPress={() => onPress(event)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={14} color="white" style={{ marginRight: 4 }} />
                <Text style={styles.joinButtonText}>Katıl</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  distanceText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 150,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  sportBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sportText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  joinedButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
}); 