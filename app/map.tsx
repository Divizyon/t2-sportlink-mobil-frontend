import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Ekran boyutları
const { width, height } = Dimensions.get('window');

// Etkinlik lokasyonu için tip tanımı
interface EventLocation {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category: string;
}

// Örnek etkinlik yerleri
const eventLocations: EventLocation[] = [
  {
    id: '1',
    title: 'İstanbul Maratonu',
    latitude: 41.0082,
    longitude: 28.9784,
    category: 'Atletizm',
  },
  {
    id: '2',
    title: 'Futbol Maçı: Türkiye-Hırvatistan',
    latitude: 41.0378,
    longitude: 28.9975,
    category: 'Futbol',
  },
  {
    id: '3',
    title: 'EuroLeague: Fenerbahçe-Barcelona',
    latitude: 40.9862,
    longitude: 29.0371,
    category: 'Basketbol',
  },
  {
    id: '4',
    title: 'CEV Şampiyonlar Ligi: VakıfBank-Milano',
    latitude: 41.0451,
    longitude: 29.0144,
    category: 'Voleybol',
  },
  {
    id: '5',
    title: 'Türkiye Yüzme Şampiyonası',
    latitude: 41.0748,
    longitude: 29.0118,
    category: 'Yüzme',
  },
];

// Harita sayfası
export default function MapScreen() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<EventLocation | null>(null);
  
  // Harita bölgesi
  const initialRegion = {
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Marker renklerini kategoriye göre belirleme
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Futbol':
        return '#2196f3'; // Mavi
      case 'Basketbol':
        return '#ff9800'; // Turuncu
      case 'Voleybol':
        return '#e91e63'; // Pembe
      case 'Yüzme':
        return '#00bcd4'; // Açık mavi
      case 'Atletizm':
        return '#ff5722'; // Kırmızı
      default:
        return '#4caf50'; // Yeşil
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Harita başlığı */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etkinlik Haritası</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Harita */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
      >
        {eventLocations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.title}
            description={location.category}
            pinColor={getCategoryColor(location.category)}
            onPress={() => setSelectedLocation(location)}
          />
        ))}
      </MapView>

      {/* Etkinlik detayları (seçilince görünür) */}
      {selectedLocation && (
        <View style={styles.locationDetails}>
          <Text style={styles.locationTitle}>{selectedLocation.title}</Text>
          <Text style={styles.locationCategory}>{selectedLocation.category}</Text>
          <TouchableOpacity 
            style={[styles.categoryBadge, { backgroundColor: getCategoryColor(selectedLocation.category) + '20' }]}
          >
            <Text style={[styles.categoryText, { color: getCategoryColor(selectedLocation.category) }]}>
              Detayları Gör
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  map: {
    width: width,
    height: height,
    flex: 1,
  },
  locationDetails: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
}); 