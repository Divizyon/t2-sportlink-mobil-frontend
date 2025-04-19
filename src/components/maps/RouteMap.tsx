import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

// Konum noktası tipi
interface Point {
  latitude: number;
  longitude: number;
}

// Rota tipi
interface Route {
  id: string;
  name: string;
  distance: number; // kilometre
  duration: number; // dakika
  points: Point[];
  difficulty: 'kolay' | 'orta' | 'zor';
  type: 'koşu' | 'bisiklet' | 'yürüyüş';
}

// Props tanımı
interface RouteMapProps {
  initialRoute?: Route;
  onRouteCreated?: (route: Route) => void;
  onRouteSelected?: (route: Route) => void;
  editable?: boolean;
  existingRoutes?: Route[];
}

/**
 * Spor aktiviteleri için rota oluşturma ve görüntüleme harita bileşeni
 */
const RouteMap: React.FC<RouteMapProps> = ({
  initialRoute,
  onRouteCreated,
  onRouteSelected,
  editable = false,
  existingRoutes = [],
}) => {
  const mapRef = useRef<MapView>(null);

  // State tanımları
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Point | null>(null);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [currentRoutePoints, setCurrentRoutePoints] = useState<Point[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(initialRoute || null);
  const [routes, setRoutes] = useState<Route[]>(existingRoutes);

  // Örnek rotalar
  const exampleRoutes: Route[] = [
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
        const location = await Location.getCurrentPositionAsync({});
        const position = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        
        setCurrentPosition(position);
        
        // Varolan rotalar yoksa örnek rotaları kullan
        if (existingRoutes.length === 0) {
          setRoutes(exampleRoutes);
        }
      } catch (error) {
        setErrorMsg('Konum alınamadı');
        console.error('Konum alınamadı:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [existingRoutes.length]);

  // Harita üzerine basıldığında rota noktası ekleme
  const handleMapPress = (event: any) => {
    if (!editable || !isCreatingRoute) return;
    
    const newPoint = event.nativeEvent.coordinate;
    setCurrentRoutePoints((prevPoints) => [...prevPoints, newPoint]);
  };

  // Yeni rota oluşturmayı başlat
  const startCreatingRoute = () => {
    setIsCreatingRoute(true);
    setCurrentRoutePoints([]);
    Alert.alert('Rota Oluşturma', 'Harita üzerine basarak rota noktaları ekleyin.');
  };

  // Rota oluşturmayı tamamla
  const finishCreatingRoute = () => {
    if (currentRoutePoints.length < 2) {
      Alert.alert('Hata', 'Rota oluşturmak için en az 2 nokta eklemelisiniz.');
      return;
    }

    // Basit bir mesafe hesaplama (gerçekte daha karmaşık hesaplamalar gerekir)
    const calculateDistance = (points: Point[]): number => {
      let totalDistance = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const lat1 = points[i].latitude;
        const lon1 = points[i].longitude;
        const lat2 = points[i + 1].latitude;
        const lon2 = points[i + 1].longitude;
        
        // Haversine formülü ile iki nokta arası mesafe (km)
        const R = 6371; // Dünya yarıçapı (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        totalDistance += distance;
      }
      return Math.round(totalDistance * 10) / 10; // Bir ondalık basamağa yuvarla
    };

    const distance = calculateDistance(currentRoutePoints);
    const duration = Math.round(distance * 8); // Ortalama hız: 7.5 km/saat

    // Yeni rota oluştur
    const newRoute: Route = {
      id: Date.now().toString(),
      name: `Yeni Rota ${routes.length + 1}`,
      distance,
      duration,
      points: currentRoutePoints,
      difficulty: distance < 3 ? 'kolay' : distance < 7 ? 'orta' : 'zor',
      type: 'koşu',
    };

    setRoutes((prevRoutes) => [...prevRoutes, newRoute]);
    setSelectedRoute(newRoute);
    setIsCreatingRoute(false);
    setCurrentRoutePoints([]);

    if (onRouteCreated) {
      onRouteCreated(newRoute);
    }

    Alert.alert('Başarılı', `Yeni rota oluşturuldu: ${distance} km`);
  };

  // Seçilen rotaya git ve görüntüle
  const viewRoute = (route: Route) => {
    setSelectedRoute(route);
    
    if (route.points.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(route.points, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }

    if (onRouteSelected) {
      onRouteSelected(route);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Harita yükleniyor...</Text>
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
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={
          currentPosition
            ? {
                latitude: currentPosition.latitude,
                longitude: currentPosition.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : undefined
        }
        showsUserLocation
        showsMyLocationButton
        onPress={handleMapPress}
      >
        {/* Mevcut rota çizgisi */}
        {isCreatingRoute && currentRoutePoints.length > 1 && (
          <Polyline
            coordinates={currentRoutePoints}
            strokeColor="#0066CC"
            strokeWidth={4}
          />
        )}

        {/* Mevcut rota işaretleri */}
        {isCreatingRoute &&
          currentRoutePoints.map((point, index) => (
            <Marker
              key={`current-${index}`}
              coordinate={point}
              pinColor={index === 0 ? 'green' : index === currentRoutePoints.length - 1 ? 'red' : 'blue'}
            />
          ))}

        {/* Seçili rota çizgisi */}
        {selectedRoute && (
          <Polyline
            coordinates={selectedRoute.points}
            strokeColor="#FF6B00"
            strokeWidth={5}
          />
        )}

        {/* Tüm rotaları göster */}
        {!isCreatingRoute &&
          !selectedRoute &&
          routes.map((route) => (
            <Polyline
              key={route.id}
              coordinates={route.points}
              strokeColor="#888"
              strokeWidth={3}
              onPress={() => viewRoute(route)}
            />
          ))}
      </MapView>

      {/* Kontrol butonları */}
      {editable && (
        <View style={styles.controlPanel}>
          {!isCreatingRoute ? (
            <TouchableOpacity style={styles.button} onPress={startCreatingRoute}>
              <Text style={styles.buttonText}>Yeni Rota Oluştur</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.finishButton]}
              onPress={finishCreatingRoute}
            >
              <Text style={styles.buttonText}>Rotayı Tamamla</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Rota listesi */}
      {!isCreatingRoute && (
        <View style={styles.routeListContainer}>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeItem,
                selectedRoute?.id === route.id && styles.selectedRouteItem,
              ]}
              onPress={() => viewRoute(route)}
            >
              <Text style={styles.routeName}>{route.name}</Text>
              <Text style={styles.routeInfo}>
                {route.distance} km • {route.duration} dk • {route.difficulty}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  controlPanel: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#0066CC',
    padding: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  finishButton: {
    backgroundColor: '#00994C',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  routeListContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    width: Dimensions.get('window').width * 0.4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 5,
  },
  selectedRouteItem: {
    backgroundColor: '#e6f2ff',
    borderRadius: 5,
  },
  routeName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  routeInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
});

export default RouteMap; 