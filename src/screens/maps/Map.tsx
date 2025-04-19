import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import useThemeStore from '../../../store/slices/themeSlice';
import { COLORS } from '../../constants';

// Konum için tip tanımı
interface Point {
  latitude: number;
  longitude: number;
}

// Rota için tip tanımı
interface Route {
  id: string;
  name: string;
  distance: number;
  duration: number;
  difficulty: string;
  type: string;
  points: Point[];
}

/**
 * Harita Ekranı
 * Spor rotalarını ve kullanıcının konumunu harita üzerinde gösterir
 */
export default function MapScreen() {
  const { isDarkMode } = useThemeStore();
  
  // State tanımları
  const [currentPosition, setCurrentPosition] = useState<Point | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  
  // Örnek rotalar
  const routes: Route[] = [
    {
      id: '1',
      name: 'Belgrad Ormanı Koşu Parkuru',
      distance: 5.2,
      duration: 45,
      difficulty: 'orta',
      type: 'koşu',
      points: [
        { latitude: 41.1811, longitude: 28.9742 },
        { latitude: 41.1836, longitude: 28.9778 },
        { latitude: 41.1872, longitude: 28.9802 },
        { latitude: 41.1899, longitude: 28.9831 },
        { latitude: 41.1922, longitude: 28.9872 },
        { latitude: 41.1913, longitude: 28.9912 },
        { latitude: 41.1875, longitude: 28.9932 },
        { latitude: 41.1832, longitude: 28.9908 },
        { latitude: 41.1811, longitude: 28.9742 },
      ],
    },
    {
      id: '2',
      name: 'Caddebostan Sahil Bisiklet Yolu',
      distance: 8.4,
      duration: 35,
      difficulty: 'kolay',
      type: 'bisiklet',
      points: [
        { latitude: 40.9674, longitude: 29.0591 },
        { latitude: 40.9658, longitude: 29.0632 },
        { latitude: 40.9642, longitude: 29.0676 },
        { latitude: 40.9631, longitude: 29.0729 },
        { latitude: 40.9623, longitude: 29.0782 },
        { latitude: 40.9618, longitude: 29.0836 },
        { latitude: 40.9612, longitude: 29.0887 },
        { latitude: 40.9606, longitude: 29.0938 },
        { latitude: 40.9602, longitude: 29.0989 },
      ],
    },
  ];

  // Konum bilgisini al
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
        const location = await Location.getCurrentPositionAsync({});
        setCurrentPosition({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        // İlk rotayı seç
        if (routes.length > 0) {
          setSelectedRoute(routes[0]);
        }
      } catch (error) {
        setErrorMsg('Konum alınamadı');
        console.error('Konum alınamadı:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Rota seçimi
  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#15202B' : COLORS.neutral.silver }]}>
        <Text style={[styles.loadingText, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>Konum alınıyor...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#15202B' : COLORS.neutral.silver }]}>
        <Text style={[styles.errorText, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>Hata: {errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#15202B' : COLORS.neutral.silver }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Harita Başlığı */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#192734' : COLORS.neutral.white }]}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>Spor Rotaları</Text>
      </View>
      
      {/* Harita */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={currentPosition ? {
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          } : {
            latitude: 41.0082, // İstanbul
            longitude: 28.9784,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* Kullanıcı Konumu */}
          {currentPosition && (
            <Marker
              coordinate={{
                latitude: currentPosition.latitude,
                longitude: currentPosition.longitude,
              }}
              title="Konumunuz"
              pinColor={COLORS.accent}
            />
          )}
          
          {/* Rotalar ve Markerlar her biri ayrı ayrı render ediliyor */}
          {routes.map(route => (
            <Polyline
              coordinates={route.points}
              strokeColor={selectedRoute && selectedRoute.id === route.id ? COLORS.accent : COLORS.secondary}
              strokeWidth={selectedRoute && selectedRoute.id === route.id ? 4 : 2}
            />
          ))}
          
          {/* Başlangıç noktaları */}
          {routes.map(route => (
            <Marker
              coordinate={route.points[0]}
              title={route.name}
              description={`${route.distance} km - ${route.duration} dk`}
              pinColor={COLORS.success}
            />
          ))}
          
          {/* Bitiş noktaları */}
          {routes.map(route => (
            <Marker
              coordinate={route.points[route.points.length - 1]}
              title={`${route.name} Bitiş`}
              description={`${route.type} - ${route.difficulty}`}
              pinColor={COLORS.danger}
            />
          ))}
        </MapView>
      </View>
      
      {/* Rota listesi */}
      <View style={[styles.routeListContainer, { backgroundColor: isDarkMode ? '#192734' : COLORS.neutral.white }]}>
        <Text style={[styles.routeListTitle, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
          Spor Rotaları
        </Text>
        <View style={styles.routeList}>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeItem,
                selectedRoute && selectedRoute.id === route.id && 
                { backgroundColor: isDarkMode ? '#253341' : COLORS.neutral.silver },
              ]}
              onPress={() => handleRouteSelect(route)}
            >
              <Text style={[styles.routeName, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
                {route.name}
              </Text>
              <Text style={[styles.routeInfo, { color: isDarkMode ? COLORS.neutral.dark : COLORS.secondary }]}>
                {route.distance} km • {route.duration} dk • {route.type}
              </Text>
              <Text style={[styles.routeDifficulty, { 
                color: route.difficulty === 'kolay' ? COLORS.success : 
                       route.difficulty === 'orta' ? COLORS.warning : 
                       COLORS.danger 
              }]}>
                {route.difficulty}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  routeListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  routeListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  routeList: {
    maxHeight: 200,
  },
  routeItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  routeName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  routeInfo: {
    fontSize: 12,
    marginBottom: 5,
  },
  routeDifficulty: {
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 