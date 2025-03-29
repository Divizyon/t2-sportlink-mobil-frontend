import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import SportFacilitiesMap from '../components/SportFacilitiesMap';

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
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Spor Tesisleri</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Geri</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            
            {selectedFacility && (
              <ScrollView style={styles.facilityDetails}>
                <Text style={styles.facilityName}>{selectedFacility.name}</Text>
                <Text style={styles.facilityType}>{selectedFacility.type}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>
                    Puanı: {selectedFacility.rating} / 5
                  </Text>
                  <View style={styles.starsContainer}>
                    {[...Array(5)].map((_, i) => (
                      <Text 
                        key={i} 
                        style={[
                          styles.starIcon, 
                          i < Math.floor(selectedFacility.rating) ? styles.goldStar : styles.grayStar
                        ]}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                </View>
                <Text style={styles.facilityAddress}>
                  Adres: {selectedFacility.address}
                </Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Rezervasyon Yap</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                    <Text style={styles.secondaryButtonText}>Favorilere Ekle</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
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
    color: '#0066CC',
  },
  mapContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
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
    backgroundColor: '#f0f0f0',
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
    color: '#666',
    marginBottom: 10,
  },
  ratingContainer: {
    marginBottom: 15,
  },
  ratingText: {
    fontSize: 16,
    marginBottom: 5,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    fontSize: 20,
    marginRight: 5,
  },
  goldStar: {
    color: '#FFD700',
  },
  grayStar: {
    color: '#D3D3D3',
  },
  facilityAddress: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  actionButtons: {
    marginVertical: 15,
  },
  actionButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  secondaryButtonText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 