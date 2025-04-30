import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { FacilityCard } from './FacilityCard';

interface NearbyFacilitiesProps {
  facilities?: any[];
  isLoading?: boolean;
  onSeeAll?: () => void;
}

export const NearbyFacilities: React.FC<NearbyFacilitiesProps> = ({
  facilities = [],
  isLoading = false,
  onSeeAll
}) => {
  const { theme } = useThemeStore();

  // Mock veriler (gerçek implementasyonda API'den gelecek)
  const mockFacilities = [
    {
      id: '1',
      name: 'Fitness Club',
      type: 'Spor Salonu',
      location: 'Beşiktaş, İstanbul',
      distance: 0.8,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48'
    },
    {
      id: '2',
      name: 'Olimpik Yüzme Havuzu',
      type: 'Yüzme Tesisi',
      location: 'Kadıköy, İstanbul',
      distance: 1.3,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64'
    }
  ];

  // Geçici olarak mockFacilities kullan
  const displayFacilities = facilities.length > 0 ? facilities : mockFacilities;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Yakınımdaki Tesisler
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
          {displayFacilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
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