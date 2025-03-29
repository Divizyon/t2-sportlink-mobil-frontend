import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

// Spor tesisi için tip tanımı
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

// Props tanımı
interface SportFacilitiesMapProps {
  onFacilitySelect?: (facility: SportFacility) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  facilities?: SportFacility[];
}

/**
 * Spor tesislerini gösteren harita bileşeni
 * Kullanıcının konumunu alır ve yakındaki spor tesislerini harita üzerinde gösterir
 */
const SportFacilitiesMap: React.FC<SportFacilitiesMapProps> = ({
  onFacilitySelect,
  initialLatitude = 41.0082, // İstanbul varsayılan konum
  initialLongitude = 28.9784,
  facilities = [],
}) => {
  // Harita bölgesi state'i
  const [region, setRegion] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Konum izni ve yükleme durumu
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Örnek tesisler (gerçek uygulamada API'den gelecek)
  const [sportFacilities, setSportFacilities] = useState<SportFacility[]>(facilities.length > 0 ? facilities : [
    {
      id: 1,
      name: 'Fenerbahçe Ülker Spor Salonu',
      type: 'Basketbol Sahası',
      coordinate: {
        latitude: 40.9884,
        longitude: 29.0342,
      },
      rating: 4.8,
      address: 'Atatürk Mah, Meriç Cd. No:2, 34758 Ataşehir/İstanbul',
    },
    {
      id: 2,
      name: 'Vodafone Park',
      type: 'Futbol Sahası',
      coordinate: {
        latitude: 41.0392,
        longitude: 28.9871,
      },
      rating: 4.7,
      address: 'Vişnezade, Dolmabahçe Cd., 34357 Beşiktaş/İstanbul',
    },
    {
      id: 3,
      name: 'Beşiktaş Akatlar Spor Kompleksi',
      type: 'Çok Amaçlı Spor Salonu',
      coordinate: {
        latitude: 41.0824,
        longitude: 29.0213,
      },
      rating: 4.5,
      address: 'Akatlar, 34347 Beşiktaş/İstanbul',
    },
  ]);

  // Konum bilgisini alma
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        
        // Konum iznini iste
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setErrorMsg('Konum izni reddedildi');
          setIsLoading(false);
          return;
        }

        // Mevcut konumu al
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        
        // Konuma göre bölgeyi güncelle
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        setErrorMsg('Konum alınamadı');
        console.error('Konum alınamadı:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Tesis seçildiğinde çalışacak fonksiyon
  const handleFacilitySelect = (facility: SportFacility) => {
    if (onFacilitySelect) {
      onFacilitySelect(facility);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Konum alınıyor...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {sportFacilities.map((facility) => (
          <Marker
            key={facility.id}
            coordinate={facility.coordinate}
            title={facility.name}
            description={facility.type}
            onPress={() => handleFacilitySelect(facility)}
          >
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{facility.name}</Text>
                <Text style={styles.calloutType}>{facility.type}</Text>
                <Text style={styles.calloutRating}>★ {facility.rating}</Text>
                <Text style={styles.calloutAddress}>{facility.address}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  calloutContainer: {
    width: 200,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  calloutType: {
    fontSize: 14,
    marginBottom: 3,
  },
  calloutRating: {
    fontSize: 14,
    color: '#FFA500',
    marginBottom: 3,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#666',
  },
});

export default SportFacilitiesMap; 