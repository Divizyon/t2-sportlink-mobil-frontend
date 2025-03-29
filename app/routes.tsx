import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Pressable, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import RouteMap from '../components/RouteMap';

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
  // State tanımları
  const [isEditMode, setIsEditMode] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeType, setRouteType] = useState<'koşu' | 'bisiklet' | 'yürüyüş'>('koşu');
  const [createdRoute, setCreatedRoute] = useState<Route | null>(null);

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
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Spor Rotaları</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Geri</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={toggleEditMode}
        >
          <Text style={styles.editButtonText}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rota Bilgilerini Düzenle</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rota Adı</Text>
              <TextInput
                style={styles.input}
                value={routeName}
                onChangeText={setRouteName}
                placeholder="Rotanın adını girin"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rota Tipi</Text>
              <View style={styles.radioGroup}>
                <Pressable
                  style={[
                    styles.radioButton,
                    routeType === 'koşu' && styles.radioButtonSelected,
                  ]}
                  onPress={() => setRouteType('koşu')}
                >
                  <Text style={routeType === 'koşu' ? styles.radioTextSelected : styles.radioText}>
                    Koşu
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.radioButton,
                    routeType === 'bisiklet' && styles.radioButtonSelected,
                  ]}
                  onPress={() => setRouteType('bisiklet')}
                >
                  <Text style={routeType === 'bisiklet' ? styles.radioTextSelected : styles.radioText}>
                    Bisiklet
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.radioButton,
                    routeType === 'yürüyüş' && styles.radioButtonSelected,
                  ]}
                  onPress={() => setRouteType('yürüyüş')}
                >
                  <Text style={routeType === 'yürüyüş' ? styles.radioTextSelected : styles.radioText}>
                    Yürüyüş
                  </Text>
                </Pressable>
              </View>
            </View>
            
            {createdRoute && (
              <View style={styles.routeInfo}>
                <Text style={styles.infoText}>Mesafe: {createdRoute.distance} km</Text>
                <Text style={styles.infoText}>Tahmini Süre: {createdRoute.duration} dakika</Text>
                <Text style={styles.infoText}>Zorluk: {createdRoute.difficulty}</Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton]}
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
  editButton: {
    position: 'absolute',
    right: 20,
    top: 50,
  },
  editButtonText: {
    fontSize: 16,
    color: '#0066CC',
  },
  mapContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#e6f2ff',
    borderColor: '#0066CC',
  },
  radioText: {
    color: '#333',
  },
  radioTextSelected: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  routeInfo: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#0066CC',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
  },
}); 