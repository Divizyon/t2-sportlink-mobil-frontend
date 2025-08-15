import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useEventStore } from '../../store/eventStore/eventStore';
import { useMapsStore } from '../../store/appStore/mapsStore';
import { Event } from '../../types/eventTypes/event.types';
import { NearbyEventCard } from '../Discover/NearbyEventCard';
import { colors } from '../../constants/colors/colors';
import { useNavigation } from '@react-navigation/native';

interface NearbyEventsComponentProps {
  onSeeAll?: () => void;
  showTitle?: boolean;
  maxItems?: number;
}

// Ortak etkinlik gösterme komponenti
export const NearbyEventsComponent: React.FC<NearbyEventsComponentProps> = ({ 
  onSeeAll, 
  showTitle = true,
  maxItems = 5 
}) => {
  const { theme } = useThemeStore();
  
  // EventStore'dan verileri çek
  const { nearbyEvents, events, isLoading } = useEventStore();
  
  // Konum bilgisi
  const { lastLocation } = useMapsStore();
  
  // Gösterilecek etkinlikler - Yakındaki etkinlikler varsa onları, yoksa tüm etkinlikleri göster
  const displayEvents = nearbyEvents.length > 0 ? nearbyEvents : events;
  
  // Navigation hook'unu kullan
  const navigation = useNavigation<any>();
  
  // Etkinlik detayına gitmek için handler
  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };
  
  return (
    <View style={styles.container}>
      {/* Başlık (istenirse gösterilir) */}
      {showTitle && (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={{
              marginRight: 8, 
              borderRadius: 12, 
              padding: 4,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="location-outline" size={20} color={colors.accentDark} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Yakındaki Etkinlikler</Text>
          </View>
          
   
        </View>
      )}
      
      {/* Yükleniyor göstergesi */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
        </View>
      ) : displayEvents.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {/* Her bir etkinlik için kart göster */}
          {displayEvents.slice(0, maxItems).map((event) => (
            <NearbyEventCard 
              key={event.id} 
              event={event} 
              onPress={() => handleEventPress(event)}
            />
          ))}
          
          {/* "Tümünü Gör" butonu */}
          {displayEvents.length > maxItems && onSeeAll && (
            <TouchableOpacity
              style={[styles.viewAllCardHorizontal, { backgroundColor: theme.colors.card + '80' }]}
              onPress={onSeeAll}
              activeOpacity={0.7}
            >
              <View style={styles.viewAllContent}>
                <Ionicons name="grid-outline" size={24} color={colors.accentDark} style={{ marginBottom: 10 }} />
                <Text style={[styles.viewAllText, { color: theme.colors.primary, fontWeight: '600' }]}>
                  Tümünü Gör
                </Text>
                <Ionicons name="chevron-forward-circle" size={24} color={colors.accentDark} style={{ marginTop: 10 }} />
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <View style={[styles.emptyCardHorizontal, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="location-outline" size={24} color={colors.accentDark} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Etkinlikler yüklenirken bir sorun oluştu
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
    paddingRight: 8,
    paddingBottom: 2,
  },
  emptyCardHorizontal: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  viewAllCardHorizontal: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(0,0,0,0.05)',
    borderWidth: 2,
    marginRight: 12,
  },
  viewAllContent: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default NearbyEventsComponent; 