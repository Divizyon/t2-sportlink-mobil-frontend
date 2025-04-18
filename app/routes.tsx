import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Pressable, TextInput, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import RouteMap from '../components/RouteMap';
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

// Rota tipi tanımı
interface Route {
  id: string;
  name: string;
  distance: number;
  duration: number;
  points: {
    latitude: number;
    longitude: number;
  }[];
  difficulty: 'kolay' | 'orta' | 'zor';
  type: 'koşu' | 'bisiklet' | 'yürüyüş';
}

/**
 * Spor Rotaları Ekranı
 * Kullanıcının rotaları görüntülediği ve yeni rotalar oluşturabildiği ekran
 */
export default function RoutesScreen() {
  const systemColorScheme = useColorScheme();
  // Tema durumu
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Renk temasını belirle
  const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  
  // State tanımları
  const [isEditMode, setIsEditMode] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeType, setRouteType] = useState<'koşu' | 'bisiklet' | 'yürüyüş'>('koşu');
  const [createdRoute, setCreatedRoute] = useState<Route | null>(null);

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

  // Edit modunu aç/kapa
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode && createdRoute) {
      setCreatedRoute(null);
    }
  };

  // Yeni rota oluşturulduğunda çalışacak fonksiyon
  const handleRouteCreated = (route: Route) => {
    setCreatedRoute(route);
    setRoutes((prevRoutes) => [...prevRoutes, route]);
    setModalVisible(true);
    setRouteName(route.name);
    setRouteType(route.type);
  };

  // Rota seçildiğinde çalışacak fonksiyon
  const handleRouteSelected = (route: Route) => {
    setSelectedRoute(route);
  };

  // Rota bilgilerini güncelle
  const saveRouteDetails = () => {
    if (!createdRoute) return;

    // Rotayı güncelle
    const updatedRoute = {
      ...createdRoute,
      name: routeName || createdRoute.name,
      type: routeType,
    };

    // Routes array'ini güncelle
    setRoutes(routes.map(r => r.id === updatedRoute.id ? updatedRoute : r));
    setCreatedRoute(updatedRoute);
    setSelectedRoute(updatedRoute);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={[styles.header, { backgroundColor: COLORS.white }]}>
        <Text style={[styles.title, { color: COLORS.text.dark }]}>Spor Rotaları</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: COLORS.secondary }]}>Geri</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={toggleEditMode}
        >
          <Text style={[styles.editButtonText, { color: COLORS.secondary }]}>
            {isEditMode ? 'Görüntüleme Modu' : 'Rota Oluştur'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <RouteMap 
          editable={isEditMode}
          existingRoutes={routes}
          onRouteCreated={handleRouteCreated}
          onRouteSelected={handleRouteSelected}
          initialRoute={selectedRoute}
        />
      </View>

      {/* Rota bilgileri düzenleme modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: COLORS.white }]}>
            <Text style={[styles.modalTitle, { color: COLORS.text.dark }]}>Rota Bilgilerini Düzenle</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: COLORS.text.dark }]}>Rota Adı</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: COLORS.lightGray,
                  color: COLORS.text.dark,
                  borderColor: COLORS.divider
                }]}
                value={routeName}
                onChangeText={setRouteName}
                placeholder="Rotanın adını girin"
                placeholderTextColor={COLORS.text.light}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: COLORS.text.dark }]}>Rota Tipi</Text>
              <View style={styles.radioGroup}>
                <Pressable
                  style={[
                    styles.radioButton,
                    routeType === 'koşu' && [styles.radioButtonSelected, { backgroundColor: COLORS.primary }],
                    { borderColor: COLORS.primary }
                  ]}
                  onPress={() => setRouteType('koşu')}
                >
                  <Text 
                    style={[
                      routeType === 'koşu' ? [styles.radioTextSelected, { color: COLORS.white }] : styles.radioText,
                      { color: routeType === 'koşu' ? COLORS.white : COLORS.text.dark }
                    ]}
                  >
                    Koşu
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.radioButton,
                    routeType === 'bisiklet' && [styles.radioButtonSelected, { backgroundColor: COLORS.primary }],
                    { borderColor: COLORS.primary }
                  ]}
                  onPress={() => setRouteType('bisiklet')}
                >
                  <Text 
                    style={[
                      routeType === 'bisiklet' ? [styles.radioTextSelected, { color: COLORS.white }] : styles.radioText,
                      { color: routeType === 'bisiklet' ? COLORS.white : COLORS.text.dark }
                    ]}
                  >
                    Bisiklet
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.radioButton,
                    routeType === 'yürüyüş' && [styles.radioButtonSelected, { backgroundColor: COLORS.primary }],
                    { borderColor: COLORS.primary }
                  ]}
                  onPress={() => setRouteType('yürüyüş')}
                >
                  <Text 
                    style={[
                      routeType === 'yürüyüş' ? [styles.radioTextSelected, { color: COLORS.white }] : styles.radioText,
                      { color: routeType === 'yürüyüş' ? COLORS.white : COLORS.text.dark }
                    ]}
                  >
                    Yürüyüş
                  </Text>
                </Pressable>
              </View>
            </View>
            
            {createdRoute && (
              <View style={[styles.routeInfo, { backgroundColor: COLORS.lightGray }]}>
                <Text style={[styles.infoText, { color: COLORS.text.dark }]}>Mesafe: {createdRoute.distance} km</Text>
                <Text style={[styles.infoText, { color: COLORS.text.dark }]}>Tahmini Süre: {createdRoute.duration} dakika</Text>
                <Text style={[styles.infoText, { color: COLORS.text.dark }]}>Zorluk: {createdRoute.difficulty}</Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.cancelButton, { borderColor: COLORS.divider }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: COLORS.text.dark }]}>İptal</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton, { backgroundColor: COLORS.primary }]}
                onPress={saveRouteDetails}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </Pressable>
            </View>
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
  editButton: {
    position: 'absolute',
    right: 20,
    top: 50,
  },
  editButtonText: {
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  radioButtonSelected: {
    borderWidth: 1,
  },
  radioText: {
    fontSize: 14,
  },
  radioTextSelected: {
    fontWeight: 'bold',
  },
  routeInfo: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
  },
  cancelButtonText: {
    fontSize: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 