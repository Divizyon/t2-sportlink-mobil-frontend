import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors/colors';
import { SportsFacility } from '../../types/sportsFacilities.types';

interface NearbyFacilitiesProps {
  onSeeAll: () => void;
  facilitiesData: SportsFacility[];
}

const facilityTypes = [
  { id: 'all', name: 'Tümü', icon: 'fitness' },
  { id: 'Yüzme', name: 'Yüzme', icon: 'water' },
  { id: 'Tenis', name: 'Tenis', icon: 'tennisball' },
  { id: 'Basketbol/Salon Sporları', name: 'Basketbol', icon: 'basketball' },
  { id: 'Futbol (Halı Saha)', name: 'Futbol', icon: 'football' },
  { id: 'Fitness', name: 'Fitness', icon: 'barbell' },
];

export const NearbyFacilities: React.FC<NearbyFacilitiesProps> = ({ onSeeAll, facilitiesData }) => {
  const { theme } = useThemeStore();
  const [selectedType, setSelectedType] = React.useState<string | null>(null);
  
  // Static veri kullanıyoruz, API hatası yok
  const isLoading = false;
  const error = null;

  // Tesis tipine göre filtreleme
  const handleTypeSelect = (type: string) => {
    const newType = type === 'all' ? null : type;
    setSelectedType(newType);
  };

  // Filtrelenmiş tesisler
  const filteredFacilities = selectedType 
    ? facilitiesData.filter(facility => facility.sport === selectedType)
    : facilitiesData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={20} color={colors.accentDark} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Yakınımdaki Tesisler
          </Text>
        </View>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: colors.accent }]}>
            Tümü <Ionicons name="chevron-forward" size={14} color={colors.accentDark} />
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tesis Tipleri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeContainer}
        contentContainerStyle={styles.typeContent}
      >
        {facilityTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              { backgroundColor: theme.colors.card },
              selectedType === type.id && { backgroundColor: colors.accentDark }
            ]}
            onPress={() => handleTypeSelect(type.id)}
          >
            <Ionicons
              name={type.icon as any}
              size={18}
              color={selectedType === type.id ? 'white' : colors.accentDark}
            />
            <Text
              style={[
                styles.typeText,
                { color: selectedType === type.id ? 'white' : theme.colors.text }
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tesisler Listesi */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.facilitiesContainer}
      >
        {filteredFacilities.length > 0 ? (
          filteredFacilities.slice(0, 5).map((facility, index) => (
            <TouchableOpacity
              key={`${facility.name}-${index}`}
              style={[styles.facilityCard, { backgroundColor: theme.colors.card }]}
            >
              <View style={styles.facilityImageContainer}>
                {facility.image_url ? (
                  <Image
                    source={{ uri: facility.image_url }}
                    style={styles.facilityImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.facilityImagePlaceholder, { backgroundColor: theme.colors.accent + '20' }]}>
                    <Ionicons name="business" size={30} color={colors.accentDark} />
                  </View>
                )}
                
                {/* Spor türü badge'i */}
                <View style={[styles.sportBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.sportBadgeText}>
                    {facility.sport}
                  </Text>
                </View>
              </View>

              <View style={styles.facilityInfo}>
                <Text style={[styles.facilityName, { color: theme.colors.text }]} numberOfLines={2}>
                  {facility.name}
                </Text>
                <Text style={[styles.facilityAddress, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {facility.address}
                </Text>
                
                <View style={styles.facilityFooter}>
                  <View style={styles.districtBadge}>
                    <Ionicons name="location" size={12} color={colors.accent} />
                    <Text style={[styles.districtText, { color: colors.accent }]}>
                      {facility.district}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="location-outline" size={24} color={colors.accentDark} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Bu kategoride tesis bulunamadı
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
    borderRadius: 12,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeContainer: {
    marginBottom: 16,
  },
  typeContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  typeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  facilitiesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  facilityCard: {
    width: 280,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  facilityImageContainer: {
    width: '100%',
    height: 150,
  },
  facilityImage: {
    width: '100%',
    height: '100%',
  },
  facilityImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityInfo: {
    padding: 12,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  facilityAddress: {
    fontSize: 13,
    marginBottom: 8,
  },
  facilityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  distance: {
    fontSize: 13,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
  },
  emptyContainer: {
    width: 280,
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
  sportBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sportBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  districtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  districtText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 2,
  },
}); 