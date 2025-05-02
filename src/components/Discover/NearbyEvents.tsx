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

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  // Veri olmaması durumu için boş durum bileşeni
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="location-outline"
        size={48}
        color={theme.colors.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        Yakınınızda etkinlik bulunamadı
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary, opacity: 0.7 }]}>
        Konum izni verdiğinizden emin olun veya başka bir konumdan arayın
      </Text>
    </View>
  );

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
      ) : events.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {events.map((event) => (
            <NearbyEventCard 
              key={event.id} 
              event={event} 
              onPress={() => handleEventPress(event.id)} 
            />
          ))}
        </ScrollView>
      ) : (
        renderEmptyState()
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
  },
  emptyContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  emptyIcon: {
    marginBottom: 8,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  }
}); 