import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import SportFacilitiesMap from '@/src/components/maps/SportFacilitiesMap';
import useThemeStore from '../../../store/slices/themeSlice';
import { COLORS } from '@/src/constants';

// Tesis detayı için tip tanımı
interface SportFacility {
  id: number;
  name: string;
  type: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  address: string;
}

/**
 * Spor Tesisleri Ekranı
 * Harita üzerinde spor tesislerini gösterir ve seçilen tesis hakkında detaylı bilgi sunar
 */
export default function FacilitiesScreen() {
  // Theme store'dan tema bilgisini al
  const { isDarkMode } = useThemeStore();
  
  // Seçilen tesis ve modal durumu
  const [selectedFacility, setSelectedFacility] = useState<SportFacility | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Bir tesis seçildiğinde çalışacak olan fonksiyon
  const handleFacilitySelect = (facility: SportFacility) => {
    setSelectedFacility(facility);
    setModalVisible(true);
  };

  // Modal'ı kapatmak için
  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#15202B' : COLORS.neutral.silver }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#192734' : COLORS.neutral.white }]}>
        <Text style={[styles.title, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>Spor Tesisleri</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: COLORS.secondary }]}>Geri</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mapContainer}>
        <SportFacilitiesMap onFacilitySelect={handleFacilitySelect} />
      </View>

      {/* Tesis Detay Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#192734' : COLORS.neutral.white }]}>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: isDarkMode ? '#253341' : COLORS.neutral.silver }]} 
              onPress={closeModal}
            >
              <Text style={[styles.closeButtonText, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>X</Text>
            </TouchableOpacity>
            
            {selectedFacility && (
              <ScrollView style={styles.facilityDetails}>
                <Text style={[styles.facilityName, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
                  {selectedFacility.name}
                </Text>
                <Text style={[styles.facilityType, { color: isDarkMode ? COLORS.neutral.dark : COLORS.secondary }]}>
                  {selectedFacility.type}
                </Text>
                <View style={styles.ratingContainer}>
                  <Text style={[styles.ratingText, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
                    Puanı: {selectedFacility.rating} / 5
                  </Text>
                  <View style={styles.starsContainer}>
                    <Text style={[styles.starIcon, selectedFacility.rating >= 1 ? styles.goldStar : styles.grayStar]}>★</Text>
                    <Text style={[styles.starIcon, selectedFacility.rating >= 2 ? styles.goldStar : styles.grayStar]}>★</Text>
                    <Text style={[styles.starIcon, selectedFacility.rating >= 3 ? styles.goldStar : styles.grayStar]}>★</Text>
                    <Text style={[styles.starIcon, selectedFacility.rating >= 4 ? styles.goldStar : styles.grayStar]}>★</Text>
                    <Text style={[styles.starIcon, selectedFacility.rating >= 5 ? styles.goldStar : styles.grayStar]}>★</Text>
                  </View>
                </View>
                <Text style={[styles.facilityAddress, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
                  Adres: {selectedFacility.address}
                </Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.accent }]}>
                    <Text style={styles.actionButtonText}>Rezervasyon Yap</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[
                    styles.actionButton, 
                    styles.secondaryButton, 
                    { 
                      backgroundColor: isDarkMode ? '#192734' : COLORS.neutral.white,
                      borderColor: COLORS.accent
                    }
                  ]}>
                    <Text style={[styles.secondaryButtonText, { color: COLORS.accent }]}>Favorilere Ekle</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
  },
  backButtonText: {
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '60%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  facilityDetails: {
    marginTop: 10,
  },
  facilityName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  facilityType: {
    fontSize: 18,
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingText: {
    fontSize: 16,
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    fontSize: 20,
    marginRight: 3,
  },
  goldStar: {
    color: '#FFD700',
  },
  grayStar: {
    color: '#C4C4C4',
  },
  facilityAddress: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionButtons: {
    marginTop: 15,
    marginBottom: 30,
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 