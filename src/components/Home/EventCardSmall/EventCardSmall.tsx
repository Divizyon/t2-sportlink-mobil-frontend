import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Event } from '../../../types/eventTypes/event.types';
import { Ionicons } from '@expo/vector-icons';

interface EventCardSmallProps {
  event: Event;
  onPress: (event: Event) => void;
}

const EventCardSmall: React.FC<EventCardSmallProps> = ({ event, onPress }) => {
  const { theme } = useThemeStore();
  
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
      <View style={styles.cardContent}>
        {/* Sol Taraf - Tarih kutusu */}
        <View style={[styles.dateBox, { backgroundColor: theme.colors.primary + '10' }]}>
          <Text style={[styles.dateDay, { color: theme.colors.primary }]}>
            {formatDate(event.event_date).day}
          </Text>
          <Text style={[styles.dateMonth, { color: theme.colors.primary }]}>
            {formatDate(event.event_date).month}
          </Text>
        </View>
        
        {/* Orta kısım - Etkinlik bilgileri */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text 
              style={[styles.title, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {event.title}
            </Text>
            
            {event.is_private && (
              <View style={styles.privateIconContainer}>
                <Ionicons name="lock-closed" size={12} color={theme.colors.accent} />
              </View>
            )}
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} />
              <Text 
                style={[styles.infoText, { color: theme.colors.textSecondary }]}
                numberOfLines={1}
              >
                {event.location_name ? event.location_name : 'Konum yok'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                {event.start_time || '00:00'}
              </Text>
            </View>
          </View>
          
          <View style={styles.footerRow}>
            <View style={[styles.sportTag, { backgroundColor: theme.colors.accent + '15' }]}>
              <Ionicons name={getSportIcon(event.sport_id)} size={12} color={theme.colors.accent} style={styles.sportIcon} />
              <Text style={[styles.sportText, { color: theme.colors.accent }]}>
                {event.sport_id}
              </Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Sağ taraf - Katılımcı bilgisi */}
        <View style={styles.participantsContainer}>
          <View style={[styles.participantsBadge, { backgroundColor: theme.colors.primary + '15' }]}>
            <Ionicons name="people" size={12} color={theme.colors.primary} style={styles.participantsIcon} />
            <Text style={[styles.participantsText, { color: theme.colors.primary }]}>
              {event.current_participants || 0}/{event.max_participants || 10}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  dateBox: {
    width: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginRight: 12,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateMonth: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  privateIconContainer: {
    marginLeft: 6,
  },
  detailsRow: {
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  sportIcon: {
    marginRight: 4,
  },
  sportText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  participantsContainer: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 16,
  },
  participantsIcon: {
    marginRight: 3,
  },
  participantsText: {
    fontSize: 11,
    fontWeight: 'bold',
  }
});

export default EventCardSmall;