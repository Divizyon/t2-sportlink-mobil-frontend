import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useNavigation } from '@react-navigation/native';
import { NearbyEventCard } from './NearbyEventCard';

interface NearbyEventsProps {
  events?: any[];
  isLoading?: boolean;
  onSeeAll?: () => void;
}

export const NearbyEvents: React.FC<NearbyEventsProps> = ({ 
  events = [], 
  isLoading = false,
  onSeeAll 
}) => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  
  // Mock veriler (gerçek implementasyonda API'den gelecek)
  const mockEvents = [
    {
      id: '1',
      title: 'Halı Saha Maçı',
      sport: { name: 'Futbol', icon: 'football' },
      creator: { first_name: 'Ahmet', last_name: 'Y.' },
      event_date: new Date(),
      start_time: new Date(),
      location_name: 'Beşiktaş Halı Saha',
      location_distance: 1.5,
      participant_count: 8,
      max_participants: 14,
      status: 'active'
    },
    {
      id: '2',
      title: 'Basketbol',
      sport: { name: 'Basketbol', icon: 'basketball' },
      creator: { first_name: 'Ayşe', last_name: 'K.' },
      event_date: new Date(Date.now() + 86400000), // Yarın
      start_time: new Date(),
      location_name: 'Kadıköy Basketbol Sahası',
      location_distance: 3.2,
      participant_count: 6,
      max_participants: 12,
      status: 'active'
    }
  ];
  
  // Geçici olarak mockEvents kullan
  const displayEvents = events.length > 0 ? events : mockEvents;

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Yakındaki Etkinlikler
        </Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.seeAllText, { color: theme.colors.accent }]}>
            Tümünü Gör
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {displayEvents.map((event) => (
            <NearbyEventCard 
              key={event.id} 
              event={event} 
              onPress={() => handleEventPress(event.id)} 
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollViewContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  loadingContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 