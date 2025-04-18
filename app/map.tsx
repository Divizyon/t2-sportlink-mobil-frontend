import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, useColorScheme } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
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

/**
 * Harita ekranı bileşeni
 * Bu bileşen, kullanıcıya interaktif bir harita gösterir
 */
export default function MapScreen() {
  const systemColorScheme = useColorScheme();
  // Tema durumu
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Renk temasını belirle
  const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  
  // Varsayılan konum (İstanbul)
  const [region, setRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Örnek marker konumları
  const markers = [
    {
      id: 1,
      coordinate: { latitude: 41.0082, longitude: 28.9784 },
      title: 'İstanbul',
      description: 'Türkiye\'nin en büyük şehri',
    },
    {
      id: 2,
      coordinate: { latitude: 39.9334, longitude: 32.8597 },
      title: 'Ankara',
      description: 'Türkiye\'nin başkenti',
    },
  ];
  
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

  // Google Maps stil nesnesi - karanlık mod için
  const mapDarkStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#242f3e"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#746855"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#242f3e"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#263c3f"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#6b9a76"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#38414e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#212a37"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9ca5b3"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#746855"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#1f2835"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#f3d19c"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#2f3948"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#17263c"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#515c6d"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#17263c"
        }
      ]
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Text style={[styles.title, { color: COLORS.text.dark }]}>Sportlink Harita</Text>
      <View style={[styles.mapContainer, { borderColor: COLORS.divider }]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          customMapStyle={isDarkMode ? mapDarkStyle : []}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
            />
          ))}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  mapContainer: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - 150,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
}); 