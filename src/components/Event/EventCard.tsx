import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { Event } from '../../types/eventTypes/event.types';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigation = useNavigation();
  
  // Etkinlik tarih formatı
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy, HH:mm', { locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };
  
  // Etkinlik detay sayfasına git
  const handlePress = () => {
    // @ts-ignore - tip uyumluluğu için görmezden gelinebilir
    navigation.navigate('EventDetailScreen', { eventId: event.id });
  };
  
  // Konum bilgisini kısalt
  const formatLocation = (location: string) => {
    return location.length > 25 ? location.substring(0, 22) + '...' : location;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.imageContainer}>
        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="calendar-outline" size={40} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#666" style={styles.icon} />
          <Text style={styles.infoText}>
            {formatEventDate(event.event_date)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#666" style={styles.icon} />
          <Text style={styles.infoText}>
            {formatLocation(event.location_name)}
          </Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.sportContainer}>
            <Text style={styles.sportText}>
              {event.category || 'Genel'}
            </Text>
          </View>
          
          <View style={styles.participantsContainer}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.participantsText}>
              {event.current_participants || 0}/{event.max_participants || '∞'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 100,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sportContainer: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  sportText: {
    fontSize: 12,
    color: '#338626',
    fontWeight: '500',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
}); 