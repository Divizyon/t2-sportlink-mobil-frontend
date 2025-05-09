import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface FacilityCardProps {
  facility: any;
  onPress?: () => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onPress }) => {
  const { theme } = useThemeStore();
  const [isFacilityAdded, setIsFacilityAdded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAddFacility = () => {
    setIsFacilityAdded(true);
    // Burada API'ye istek gönderme işlemi yapılacak
  };

  const handleRemoveFacility = () => {
    setIsModalVisible(true);
  };

  const confirmRemoveFacility = () => {
    setIsFacilityAdded(false);
    // Burada API'ye favori kaldırıldığını bildiren istek gönderilecek
    setIsModalVisible(false);
  };

  // Yıldız değerlendirmesini göster
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color="#FFD700" style={styles.starIcon} />
        );
      } else if (i === fullStars && halfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFD700" style={styles.starIcon} />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#FFD700" style={styles.starIcon} />
        );
      }
    }
    
    return stars;
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Tesis Resmi */}
        <View style={styles.imageContainer}>
          {facility.image ? (
            <Image
              source={{ uri: facility.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.defaultImage, { backgroundColor: theme.colors.accent + '40' }]}>
              <Ionicons name="business-outline" size={40} color={theme.colors.accent} />
            </View>
          )}
        </View>

        {/* Tesis Bilgileri */}
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {facility.name}
          </Text>
          
          <Text style={[styles.type, { color: theme.colors.accent }]}>
            {facility.type}
          </Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text 
              style={[styles.location, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {facility.location}
            </Text>
          </View>
          
          <View style={styles.ratingContainer}>
            {renderStars(facility.rating)}
          </View>
        </View>
          
        {/* Ekle/Çıkar Butonu */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.addButton, 
              isFacilityAdded 
                ? { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent } 
                : { borderColor: theme.colors.accent }
            ]}
            onPress={isFacilityAdded ? handleRemoveFacility : handleAddFacility}
          >
            <Ionicons 
              name={isFacilityAdded ? "checkmark" : "add"} 
              size={20} 
              color={isFacilityAdded ? "white" : theme.colors.accent} 
            />
            <Text 
              style={[
                styles.addButtonText, 
                { color: isFacilityAdded ? "white" : theme.colors.accent }
              ]}
            >
              {isFacilityAdded ? "Eklendi" : "Ekle"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <ConfirmationModal
        visible={isModalVisible}
        title="Favorilerden Çıkar"
        message={`${facility.name} tesisini favorilerinizden çıkarmak istediğinize emin misiniz?`}
        confirmText="Çıkar"
        cancelText="Vazgeç"
        confirmIcon="heart-dislike-outline"
        isDestructive={true}
        onConfirm={confirmRemoveFacility}
        onCancel={() => setIsModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  defaultImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    padding: 16,
    paddingBottom: 8,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: 2,
  },
  buttonContainer: {
    width: '100%',
    padding: 16,
    paddingTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    height: 36,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
}); 