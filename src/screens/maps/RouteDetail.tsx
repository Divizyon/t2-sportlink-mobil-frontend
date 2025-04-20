import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { router } from 'expo-router';
import useThemeStore from '../../../store/slices/themeSlice';

// Renk paleti - Açık tema
const LIGHT_COLORS = {
  primary: "#44C26D",  // Ana renk - Yeşil
  secondary: "#3066BE", // İkincil renk - Mavi
  background: "#F5F7FA", // Arka plan - Açık gri
  card: "#FFFFFF",     // Kart arkaplanı - Beyaz
  text: {
    dark: "#1D2B4E", // Koyu metin
    light: "#89939E", // Açık metin
  },
  divider: "#E1E4E8", // Ayırıcı çizgi
};

// Renk paleti - Koyu tema
const DARK_COLORS = {
  primary: "#4BD07D",  // Ana renk - Daha parlak yeşil
  secondary: "#4080DD", // İkincil renk - Daha parlak mavi
  background: "#15202B", // Twitter benzeri koyu mavi arka plan
  card: "#192734",     // Kart arkaplanı - Koyu
  text: {
    dark: "#FFFFFF", // Beyaz metin
    light: "#8899A6", // Açık gri metin
  },
  divider: "#38444D", // Ayırıcı çizgi
};

// Konum için tip tanımı
interface Point {
  latitude: number;
  longitude: number;
}

// Rota için tip tanımı
interface Route {
  id: string;
  name: string;
  description: string;
  distance: number;
  duration: number;
  difficulty: 'kolay' | 'orta' | 'zor';
  type: string;
  elevation: number;
  popularity: number;
  points: Point[];
  creator: {
    name: string;
    id: string;
  };
  createdAt: string;
  tags: string[];
}

// Örnek rotalar
const SAMPLE_ROUTES: Record<string, Route> = {
  '1': {
    id: '1',
    name: 'Belgrad Ormanı Koşu Parkuru',
    description: 'Belgrad Ormanı içerisinde doğal yollardan oluşan, hafif yükseltilere sahip koşu parkuru. Her seviyeden koşucu için uygun, nefes alınabilecek ağaçlarla çevrili bir rota.',
    distance: 5.2,
    duration: 45, // dakika
    difficulty: 'orta',
    type: 'koşu',
    elevation: 120, // metre
    popularity: 4.8,
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
    creator: {
      name: 'Ahmet Yılmaz',
      id: 'user123',
    },
    createdAt: '2023-12-15',
    tags: ['orman', 'doğa', 'koşu', 'fitness'],
  },
  '2': {
    id: '2',
    name: 'Caddebostan Sahil Bisiklet Yolu',
    description: 'Caddebostan sahil şeridinde bulunan, düz ve deniz manzaralı bisiklet yolu. Başlangıç seviyesindeki bisikletçiler için idealdir. Yol boyunca dinlenme noktaları mevcuttur.',
    distance: 8.4,
    duration: 35, // dakika
    difficulty: 'kolay',
    type: 'bisiklet',
    elevation: 10, // metre
    popularity: 4.6,
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
    creator: {
      name: 'Zeynep Kaya',
      id: 'user456',
    },
    createdAt: '2024-01-10',
    tags: ['sahil', 'deniz', 'bisiklet', 'manzara'],
  },
  '3': {
    id: '3',
    name: 'Büyükada Turu',
    description: "Büyükada'nın çevresini dolaşan, yüksek tepeleri ve tarihi köşkleri görme imkanı sunan rota. Elektrikli bisiklet kullanımı tavsiye edilir. Hafta sonları kalabalık olabilir.",
    distance: 12.7,
    duration: 90, // dakika
    difficulty: 'zor',
    type: 'bisiklet',
    elevation: 350, // metre
    popularity: 4.9,
    points: [
      { latitude: 40.8761, longitude: 29.1186 },
      { latitude: 40.8731, longitude: 29.1164 },
      { latitude: 40.8702, longitude: 29.1142 },
      { latitude: 40.8683, longitude: 29.1197 },
      { latitude: 40.8665, longitude: 29.1254 },
      { latitude: 40.8678, longitude: 29.1312 },
      { latitude: 40.8710, longitude: 29.1334 },
      { latitude: 40.8742, longitude: 29.1321 },
      { latitude: 40.8773, longitude: 29.1292 },
      { latitude: 40.8782, longitude: 29.1235 },
      { latitude: 40.8761, longitude: 29.1186 },
    ],
    creator: {
      name: 'Mehmet Demir',
      id: 'user789',
    },
    createdAt: '2024-02-05',
    tags: ['ada', 'deniz', 'bisiklet', 'tarihi', 'doğa'],
  }
};

/**
 * Rota Detay Ekranı
 * Seçilen rotanın detaylarını gösterir
 */
interface RouteDetailScreenProps {
  id: string;
}

export default function RouteDetailScreen({ id }: RouteDetailScreenProps) {
  const { isDarkMode } = useThemeStore();
  const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  
  // Rota verileri
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // API'den rota verisi çekilecek - Şimdilik örnek veri kullanıyoruz
    setLoading(true);
    
    // Örnek API çağrısını simüle etmek için setTimeout kullanıyoruz
    const timer = setTimeout(() => {
      if (SAMPLE_ROUTES[id]) {
        setRoute(SAMPLE_ROUTES[id]);
      } else {
        // Bulunamadı durumu için default değer
        setRoute(SAMPLE_ROUTES['1']);
      }
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [id]);

  // Favorilere ekle/çıkar
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Rotaya başla
  const startRoute = () => {
    console.log('Rotaya başla:', route?.name);
    // Navigasyon uygulamasına yönlendir veya dahili navigasyon başlat
  };

  // Rotayı paylaş
  const shareRoute = () => {
    console.log('Rotayı paylaş:', route?.name);
    // Paylaşım API'sini çağır
  };

  if (loading || !route) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Text style={[styles.loadingText, { color: COLORS.text.dark }]}>Yükleniyor...</Text>
      </View>
    );
  }

  // Zorluğun rengini belirle
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'kolay':
        return '#4CAF50'; // Yeşil
      case 'orta':
        return '#FF9800'; // Turuncu
      case 'zor':
        return '#F44336'; // Kırmızı
      default:
        return COLORS.text.light;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Üst Bar */}
      <View style={[styles.header, { backgroundColor: COLORS.card }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.text.dark }]}>Rota Detayı</Text>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Text style={{ fontSize: 24, color: isFavorite ? '#FF6B6B' : COLORS.text.light }}>
            {isFavorite ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Harita */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: route.points[0].latitude,
              longitude: route.points[0].longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* Rota çizgisi */}
            <Polyline
              coordinates={route.points}
              strokeColor={COLORS.secondary}
              strokeWidth={4}
            />
            
            {/* Başlangıç noktası */}
            <Marker
              coordinate={route.points[0]}
              title="Başlangıç"
              description={route.name}
              pinColor={COLORS.primary}
            />
            
            {/* Bitiş noktası */}
            <Marker
              coordinate={route.points[route.points.length - 1]}
              title="Bitiş"
              description={`${route.distance} km - ${route.duration} dk`}
              pinColor="red"
            />
          </MapView>
        </View>
        
        {/* Rota Bilgileri */}
        <View style={[styles.infoCard, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.routeName, { color: COLORS.text.dark }]}>{route.name}</Text>
          <View style={styles.tagsContainer}>
            {/* Tag'leri manuel olarak render et - Key sorununu çözmek için map kullanmadan */}
            {route.tags.length > 0 && (
              <View style={[styles.tag, { backgroundColor: COLORS.background }]}>
                <Text style={[styles.tagText, { color: COLORS.text.light }]}>#{route.tags[0]}</Text>
              </View>
            )}
            {route.tags.length > 1 && (
              <View style={[styles.tag, { backgroundColor: COLORS.background }]}>
                <Text style={[styles.tagText, { color: COLORS.text.light }]}>#{route.tags[1]}</Text>
              </View>
            )}
            {route.tags.length > 2 && (
              <View style={[styles.tag, { backgroundColor: COLORS.background }]}>
                <Text style={[styles.tagText, { color: COLORS.text.light }]}>#{route.tags[2]}</Text>
              </View>
            )}
            {route.tags.length > 3 && (
              <View style={[styles.tag, { backgroundColor: COLORS.background }]}>
                <Text style={[styles.tagText, { color: COLORS.text.light }]}>#{route.tags[3]}</Text>
              </View>
            )}
            {route.tags.length > 4 && (
              <View style={[styles.tag, { backgroundColor: COLORS.background }]}>
                <Text style={[styles.tagText, { color: COLORS.text.light }]}>#{route.tags[4]}</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.routeDescription, { color: COLORS.text.dark }]}>
            {route.description}
          </Text>
          
          <View style={[styles.divider, { backgroundColor: COLORS.divider }]} />
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>{route.distance} km</Text>
              <Text style={[styles.statLabel, { color: COLORS.text.light }]}>Mesafe</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>{route.duration} dk</Text>
              <Text style={[styles.statLabel, { color: COLORS.text.light }]}>Süre</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getDifficultyColor(route.difficulty) }]}>
                {route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1)}
              </Text>
              <Text style={[styles.statLabel, { color: COLORS.text.light }]}>Zorluk</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>{route.elevation} m</Text>
              <Text style={[styles.statLabel, { color: COLORS.text.light }]}>Yükselti</Text>
            </View>
          </View>
        </View>
        
        {/* Ek Bilgiler */}
        <View style={[styles.infoCard, { backgroundColor: COLORS.card }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: COLORS.text.light }]}>Aktivite Türü:</Text>
            <Text style={[styles.infoValue, { color: COLORS.text.dark }]}>
              {route.type.charAt(0).toUpperCase() + route.type.slice(1)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: COLORS.text.light }]}>Popülerlik:</Text>
            <View style={styles.ratingContainer}>
              <Text style={[styles.starIcon, route.popularity >= 1 ? styles.goldStar : styles.grayStar]}>★</Text>
              <Text style={[styles.starIcon, route.popularity >= 2 ? styles.goldStar : styles.grayStar]}>★</Text>
              <Text style={[styles.starIcon, route.popularity >= 3 ? styles.goldStar : styles.grayStar]}>★</Text>
              <Text style={[styles.starIcon, route.popularity >= 4 ? styles.goldStar : styles.grayStar]}>★</Text>
              <Text style={[styles.starIcon, route.popularity >= 5 ? styles.goldStar : styles.grayStar]}>★</Text>
              <Text style={[styles.ratingText, { color: COLORS.text.dark }]}>
                {route.popularity.toFixed(1)}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: COLORS.text.light }]}>Oluşturan:</Text>
            <Text style={[styles.infoValue, { color: COLORS.text.dark }]}>{route.creator.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: COLORS.text.light }]}>Eklenme Tarihi:</Text>
            <Text style={[styles.infoValue, { color: COLORS.text.dark }]}>{route.createdAt}</Text>
          </View>
        </View>
        
        {/* Aksiyon Butonları */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            onPress={startRoute}
          >
            <Text style={styles.actionButtonText}>Rotayı Başlat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { backgroundColor: COLORS.secondary }
            ]}
            onPress={shareRoute}
          >
            <Text style={styles.actionButtonText}>Paylaş</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 48,
  },
  favoriteButton: {
    position: 'absolute',
    right: 20,
    top: 48,
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    width: '100%',
    height: 250,
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  routeName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
  },
  routeDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'justify',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 16,
    marginRight: 2,
  },
  goldStar: {
    color: '#FFD700',
  },
  grayStar: {
    color: '#C4C4C4',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 