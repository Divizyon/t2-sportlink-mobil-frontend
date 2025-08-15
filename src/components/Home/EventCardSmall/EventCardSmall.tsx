import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Event } from '../../../types/eventTypes/event.types';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceInfo, getDistanceColor } from '../../../utils/format.utils';

interface EventCardSmallProps {
  event: Event;
  onPress: (event: Event) => void;
}

const EventCardSmall: React.FC<EventCardSmallProps> = ({ event, onPress }) => {
  const { theme } = useThemeStore();
  
  // Distance_info kontrolü ekle
  const hasDistanceInfo = event && 
    ((event as any).distance_info || typeof (event as any).distance === 'number');
  
  // Mesafe renklerini al
  const distanceColor = hasDistanceInfo ? getDistanceColor(event) : '#CCCCCC';
  
  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('tr-TR', { month: 'short' });
    
    return { day, month };
  };
  
  // Saat formatlama
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };
  
  // Spor ikonu belirle
  const getSportIcon = (sportName: string) => {
    const sportLower = sportName.toLowerCase();
    if (sportLower.includes('futbol')) return 'football-outline';
    if (sportLower.includes('basketbol')) return 'basketball-outline';
    if (sportLower.includes('voleybol')) return 'baseball-outline';
    if (sportLower.includes('tenis')) return 'tennisball-outline';
    if (sportLower.includes('yüzme')) return 'water-outline';
    if (sportLower.includes('koşu')) return 'walk-outline';
    if (sportLower.includes('bisiklet')) return 'bicycle-outline';
    return 'body-outline'; // default
  };
  
  // Duruma göre renk ve metin belirle
  const getStatusInfo = () => {
    switch(event.status) {
      case 'active':
        return { 
          color: theme.colors.success, 
          text: 'Aktif',
          bgColor: theme.colors.success + '15'
        };
      case 'completed':
        return { 
          color: theme.colors.textSecondary, 
          text: 'Tamamlandı',
          bgColor: theme.colors.textSecondary + '15'
        };
      case 'canceled':
        return { 
          color: theme.colors.error, 
          text: 'İptal Edildi',
          bgColor: theme.colors.error + '15'
        };
      default:
        return { 
          color: theme.colors.primary, 
          text: 'Planlandı',
          bgColor: theme.colors.primary + '15'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.card }]}
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
      
      {/* Etkinlik görseli */}
      <View style={styles.imageContainer}>
        {event.image_url ? (
          <Image 
            source={{ uri: event.image_url }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: '#FF6B35' + '20' }]}>
            <Ionicons name="basketball-outline" size={28} color="#FF6B35" />
          </View>
        )}
      </View>
      
      {/* Etkinlik bilgileri */}
      <View style={styles.content}>
        <Text 
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {event.title}
        </Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={12} color="#FF6B35" />
          <Text style={[styles.detailText, { color: theme.colors.text, fontWeight: '600' }]}>
            {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
          </Text>
          <Ionicons name="time-outline" size={12} color="#FF6B35" style={{ marginLeft: 8 }} />
          <Text style={[styles.detailText, { color: theme.colors.text, fontWeight: '600' }]}>
            {event.start_time}
          </Text>
        </View>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color="#FF6B35" />
          <Text 
            style={[styles.locationText, { color: theme.colors.text, fontWeight: '600' }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {event.location_name}
          </Text>
        </View>
        
        {/* Katıl Butonu */}
        <TouchableOpacity 
          style={[styles.joinButton, { backgroundColor: '#FF6B35' }]}
          onPress={() => {
            // Katıl işlemi burada yapılacak
            console.log('Katıl butonuna tıklandı:', event.id);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={12} color="white" style={{ marginRight: 4 }} />
          <Text style={styles.joinButtonText}>Detay</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  distanceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  distanceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default EventCardSmall;