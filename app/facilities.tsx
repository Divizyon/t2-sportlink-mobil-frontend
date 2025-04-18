import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import SportFacilitiesMap from '../components/SportFacilitiesMap';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Renk paleti - Açık tema
const LIGHT_COLORS = {
  primary: "#44C26D",  // Ana renk - Yeşil
  secondary: "#3066BE", // İkincil renk - Mavi
  background: "#F5F7FA", // Arka plan - Açık gri
  text: {
    dark: "#1D2B4E", // Koyu metin
    light: "#89939E", // Açık metin
  },
  white: "#FFFFFF",
  lightGray: "#F0F2F5",
  divider: "#E1E4E8",
};

// Renk paleti - Koyu tema
const DARK_COLORS = {
  primary: "#4BD07D",  // Ana renk - Daha parlak yeşil
  secondary: "#4080DD", // İkincil renk - Daha parlak mavi
  background: "#15202B", // Twitter benzeri koyu mavi arka plan
  text: {
    dark: "#FFFFFF", // Beyaz metin
    light: "#8899A6", // Açık gri metin
  },
  white: "#192734", // Kart arka planı
  lightGray: "#253341", // Ayırıcı, girdi arka planı
  divider: "#38444D", // Ayırıcı çizgi
};

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
  const systemColorScheme = useColorScheme();
  // Tema durumu
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Renk temasını belirle
  const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  // Seçilen tesis ve modal durumu
  const [selectedFacility, setSelectedFacility] = useState<SportFacility | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Uygulama başladığında tema tercihini yükle
  useEffect(() => {
    loadThemePreference();
  }, []);
  
  // Tema tercihini yükle
  const loadThemePreference = async () => {
    try {
      const themePreference = await AsyncStorage.getItem('themePreference');
      if (themePreference !== null) {
        setIsDarkMode(themePreference === 'dark');
      } else {
        // Eğer tercih kaydedilmemişse sistem temasını kullan
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.log('Tema yüklenirken hata:', error);
    }
  };

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
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: COLORS.white }]}>
        <Text style={[styles.title, { color: COLORS.text.dark }]}>Spor Tesisleri</Text>
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
          <View style={[styles.modalContent, { backgroundColor: COLORS.white }]}>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: COLORS.lightGray }]} 
              onPress={closeModal}
            >
              <Text style={[styles.closeButtonText, { color: COLORS.text.dark }]}>X</Text>
            </TouchableOpacity>
            
            {selectedFacility && (
              <ScrollView style={styles.facilityDetails}>
                <Text style={[styles.facilityName, { color: COLORS.text.dark }]}>
                  {selectedFacility.name}
                </Text>
                <Text style={[styles.facilityType, { color: COLORS.text.light }]}>
                  {selectedFacility.type}
                </Text>
                <View style={styles.ratingContainer}>
                  <Text style={[styles.ratingText, { color: COLORS.text.dark }]}>
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
                <Text style={[styles.facilityAddress, { color: COLORS.text.dark }]}>
                  Adres: {selectedFacility.address}
                </Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}>
                    <Text style={styles.actionButtonText}>Rezervasyon Yap</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[
                    styles.actionButton, 
                    styles.secondaryButton, 
                    { 
                      backgroundColor: COLORS.white, 
                      borderColor: COLORS.secondary 
                    }
                  ]}>
                    <Text style={[styles.secondaryButtonText, { color: COLORS.secondary }]}>Favorilere Ekle</Text>
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
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 