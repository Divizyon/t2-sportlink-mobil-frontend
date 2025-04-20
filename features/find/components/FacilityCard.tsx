import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HStack, Text, VStack, Center, Box, Image } from '@gluestack-ui/themed';
import { COLORS } from '../../../src/constants';
import { Facility } from '../types/index';
import useThemeStore from '../../../store/slices/themeSlice';

type FacilityCardProps = {
  facility: Facility;
  onPress: (facility: Facility) => void;
  horizontal?: boolean;
};

/**
 * Tesis Kartı Bileşeni
 * Hem yatay hem de dikey görünüm için kullanılabilir
 * @param {FacilityCardProps} props - Bileşen props'ları
 * @returns {React.ReactElement} Tesis kartı bileşeni
 */
const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onPress, horizontal = true }) => {
  const { isDarkMode } = useThemeStore();

  const handleCardPress = () => {
    onPress(facility);
  };

  // Yıldız derecelendirme gösterimi için yardımcı fonksiyon
  const renderRating = (rating: number = 0) => {
    return (
      <HStack style={styles.ratingContainer}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Ionicons
            key={i}
            name={i < Math.floor(rating) ? 'star' : i < rating ? 'star-half' : 'star-outline'}
            size={16}
            color="#FFD700"
            style={{ marginRight: 2 }}
          />
        ))}
      </HStack>
    );
  };

  if (horizontal) {
    // Yatay kart görünümü
    return (
      <Pressable
        style={[
          styles.facilityCard,
          { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
        ]}
        onPress={handleCardPress}
      >
        <Box style={styles.facilityImageContainer}>
          {facility.imageUrl ? (
            <Image source={{ uri: facility.imageUrl }} style={styles.facilityImage} />
          ) : (
            <Center
              style={[
                styles.facilityImagePlaceholder,
                { backgroundColor: isDarkMode ? '#334155' : COLORS.neutral.light },
              ]}
            >
              <Ionicons
                name="business-outline"
                size={30}
                color={isDarkMode ? COLORS.neutral.white : COLORS.primary}
              />
            </Center>
          )}
        </Box>
        <VStack style={styles.facilityContent}>
          <Text
            style={[
              styles.facilityName,
              { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
            ]}
          >
            {facility.name}
          </Text>
          <Text style={[styles.facilityType, { color: COLORS.accent }]}>
            {facility.type || facility.sportType}
          </Text>
          <Text
            style={[
              styles.facilityAddress,
              { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
            ]}
          >
            {facility.address || facility.location}
          </Text>
          {facility.distance && (
            <Text
              style={[
                styles.facilityDistance,
                { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
              ]}
            >
              {facility.distance} uzaklıkta
            </Text>
          )}
          {facility.rating && renderRating(facility.rating)}
        </VStack>
      </Pressable>
    );
  } else {
    // Dikey kart görünümü (Tümünü Gör sayfası için)
    return (
      <Pressable
        style={[
          styles.verticalFacilityCard,
          { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
        ]}
        onPress={handleCardPress}
      >
        <HStack style={styles.verticalFacilityContent}>
          <Box style={styles.verticalFacilityImageContainer}>
            {facility.imageUrl ? (
              <Image source={{ uri: facility.imageUrl }} style={styles.verticalFacilityImage} />
            ) : (
              <Center
                style={[
                  styles.facilityImagePlaceholder,
                  { backgroundColor: isDarkMode ? '#334155' : COLORS.neutral.light },
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={30}
                  color={isDarkMode ? COLORS.neutral.white : COLORS.primary}
                />
              </Center>
            )}
          </Box>
          <VStack style={styles.verticalFacilityDetails}>
            <Text
              style={[
                styles.facilityName,
                { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
              ]}
            >
              {facility.name}
            </Text>
            <Text style={[styles.facilityType, { color: COLORS.accent }]}>
              {facility.type || facility.sportType}
            </Text>
            <Text
              style={[
                styles.facilityAddress,
                { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
              ]}
            >
              {facility.address || facility.location}
            </Text>
            {facility.distance && (
              <Text
                style={[
                  styles.facilityDistance,
                  { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                ]}
              >
                {facility.distance} uzaklıkta
              </Text>
            )}
            {facility.openHours && (
              <HStack alignItems="center" marginTop={4}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={COLORS.accent}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.facilityHours,
                    { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
                  ]}
                >
                  {facility.openHours}
                </Text>
              </HStack>
            )}
            {facility.rating && renderRating(facility.rating)}
          </VStack>
        </HStack>
      </Pressable>
    );
  }
};

const styles = StyleSheet.create({
  facilityCard: {
    width: 200,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  facilityImageContainer: {
    width: '100%',
    height: 120,
  },
  facilityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  facilityImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityContent: {
    padding: 12,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  facilityType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  facilityAddress: {
    fontSize: 13,
    marginBottom: 4,
  },
  facilityDistance: {
    fontSize: 12,
    marginBottom: 4,
  },
  facilityHours: {
    fontSize: 12,
  },
  ratingContainer: {
    marginTop: 4,
    flexDirection: 'row',
  },
  verticalFacilityCard: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 12,
  },
  verticalFacilityContent: {
    flexDirection: 'row',
  },
  verticalFacilityImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  verticalFacilityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  verticalFacilityDetails: {
    flex: 1,
    marginLeft: 12,
  },
});

export default FacilityCard;
