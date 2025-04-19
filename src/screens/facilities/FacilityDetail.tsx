import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme, 
  ActivityIndicator, 
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  Linking
} from 'react-native';
import { router } from 'expo-router';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { 
  Button,
  ButtonText,
  Box,
  VStack,
  HStack,
  Divider,
  Heading,
  Text as GText,
  Pressable,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Icon
} from '@gluestack-ui/themed';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';

// Renk paletleri
const colors = {
  light: {
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#212529',
    subText: '#6c757d',
    primary: '#0066ff',
    border: '#e9ecef',
    error: '#dc3545',
    success: '#198754',
    mapStyle: []
  },
  dark: {
    background: '#121212',
    card: '#1e1e1e',
    text: '#f8f9fa',
    subText: '#adb5bd',
    primary: '#3b82f6',
    border: '#2d2d2d',
    error: '#ef4444',
    success: '#10b981',
    mapStyle: [
      {
        "elementType": "geometry",
        "stylers": [{ "color": "#242f3e" }]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#746855" }]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#242f3e" }]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#38414e" }]
      },
      {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#212a37" }]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#17263c" }]
      }
    ]
  }
};

// Spor tesisi için tip tanımı
interface SportFacility {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  images: string[];
  latitude: number;
  longitude: number;
  description: string;
  workingHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed?: boolean;
    }
  };
  services: string[];
}

// Örnek veri
const sampleFacility: SportFacility = {
  id: '1',
  name: 'Spor Tesisi İstanbul',
  type: 'Futbol & Basketbol',
  address: 'Kadıköy, İstanbul',
  phone: '+90 (212) 123 4567',
  rating: 4.7,
  reviewCount: 142,
  images: [
    'https://images.unsplash.com/photo-1571104508999-dd818d1f3472',
    'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c',
    'https://images.unsplash.com/photo-1624088149747-e2eeda3abc05'
  ],
  latitude: 41.0082,
  longitude: 28.9784,
  description: 'Modern ve donanımlı tesisimizde farklı spor aktiviteleri için sahalar bulunmaktadır. Profesyonel eğitmenler eşliğinde bireysel ve grup dersleri sunulmaktadır. Kafeterya ve duş alanları mevcuttur.',
  workingHours: {
    'Pazartesi': { open: '08:00', close: '22:00' },
    'Salı': { open: '08:00', close: '22:00' },
    'Çarşamba': { open: '08:00', close: '22:00' },
    'Perşembe': { open: '08:00', close: '22:00' },
    'Cuma': { open: '08:00', close: '23:00' },
    'Cumartesi': { open: '09:00', close: '23:00' },
    'Pazar': { open: '10:00', close: '20:00' }
  },
  services: [
    'Ücretsiz Otopark',
    'Duş & Soyunma Odaları',
    'Kafeterya',
    'Ekipman Kiralama',
    'Eğitmen Desteği'
  ]
};

interface FacilityDetailScreenProps {
  id: string;
}

const FacilityDetailScreen: React.FC<FacilityDetailScreenProps> = ({ id }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;
  
  const [loading, setLoading] = useState(true);
  const [facility, setFacility] = useState<SportFacility | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  
  const windowWidth = Dimensions.get('window').width;
  
  // Veri yükleme simülasyonu (gerçek projede API çağrısı yapılacak)
  useEffect(() => {
    const fetchFacilityDetails = async () => {
      try {
        // API çağrısı burada yapılacak: const response = await api.getFacilityById(id);
        // Örnek olarak timeout kullanıyoruz
        setTimeout(() => {
          setFacility(sampleFacility);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching facility details:', error);
        setLoading(false);
      }
    };
    
    fetchFacilityDetails();
  }, [id]);
  
  // Fotoğraf seçme fonksiyonu
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        // Burada seçilen resim backend'e yüklenecek
        console.log('Selected image:', result.assets[0].uri);
        // setFacility(prev => prev ? {...prev, images: [...prev.images, result.assets[0].uri]} : null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  // Yönlendirme fonksiyonu
  const openDirections = () => {
    if (!facility) return;
    
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const latLng = `${facility.latitude},${facility.longitude}`;
    const label = facility.name;
    const url = Platform.select({
      ios: `${scheme}?q=${label}&ll=${latLng}`,
      android: `${scheme}0,0?q=${latLng}(${label})`
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };
  
  // Telefon arama fonksiyonu
  const callFacility = () => {
    if (!facility) return;
    Linking.openURL(`tel:${facility.phone}`);
  };
  
  // Yükleme göstergesi
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  
  // Eğer veri bulunamazsa
  if (!facility) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Tesis bulunamadı.</Text>
        <Button variant="solid" mt="$4" onPress={() => router.back()}>
          <ButtonText>Geri Dön</ButtonText>
        </Button>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Heading size="md" style={{ color: theme.text }}>{facility.name}</Heading>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Resim Bölümü */}
        <Box width="100%" overflow="hidden" height={240}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => setShowImageViewer(true)}
          >
            <Image
              source={{ uri: facility.images[selectedImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          
          {/* Küçük resimler */}
          <HStack space="sm" padding="$2" justifyContent="center">
            {facility.images.map((image, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Image
                  source={{ uri: image }}
                  style={[
                    styles.thumbnailImage,
                    selectedImageIndex === index && styles.selectedThumbnail
                  ]}
                />
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.addPhotoButton, { backgroundColor: theme.card }]}
              onPress={pickImage}
            >
              <Ionicons name="add" size={24} color={theme.primary} />
            </TouchableOpacity>
          </HStack>
        </Box>
        
        {/* Tesis Bilgisi Card */}
        <Box 
          backgroundColor={theme.card} 
          borderRadius="$lg" 
          padding="$4" 
          margin="$3"
          borderWidth={1}
          borderColor={theme.border}
        >
          <VStack space="md">
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Heading size="lg" color={theme.text}>{facility.name}</Heading>
                <GText color={theme.subText}>{facility.type}</GText>
              </VStack>
              <HStack space="xs" alignItems="center">
                <Ionicons name="star" size={18} color="#FFD700" />
                <GText color={theme.text} fontWeight="bold">{facility.rating}</GText>
                <GText color={theme.subText}>({facility.reviewCount})</GText>
              </HStack>
            </HStack>
            
            <Divider my="$1" />
            
            {/* İletişim Bilgileri */}
            <VStack space="sm">
              <HStack space="md" alignItems="center">
                <Ionicons name="location-outline" size={20} color={theme.subText} />
                <GText color={theme.text} flex={1}>{facility.address}</GText>
              </HStack>
              
              <HStack space="md" alignItems="center">
                <Ionicons name="call-outline" size={20} color={theme.subText} />
                <GText color={theme.text}>{facility.phone}</GText>
              </HStack>
            </VStack>
            
            {/* Aksiyon Butonları */}
            <HStack space="md" mt="$2">
              <Button 
                flex={1} 
                variant="solid" 
                backgroundColor={theme.primary}
                onPress={() => {
                  // Tip hatasını önlemek için string olarak belirtme
                  router.push({
                    pathname: '/reservation/[id]',
                    params: { id: facility.id }
                  } as any);
                }}
              >
                <ButtonText>Rezervasyon Yap</ButtonText>
              </Button>
              
              <Button 
                variant="outline" 
                borderColor={theme.primary}
                onPress={openDirections}
                minWidth={50}
              >
                <MaterialIcons name="directions" size={24} color={theme.primary} />
              </Button>
              
              <Button 
                variant="outline" 
                borderColor={theme.primary} 
                onPress={callFacility}
                minWidth={50}
              >
                <MaterialIcons name="phone" size={24} color={theme.primary} />
              </Button>
            </HStack>
          </VStack>
        </Box>
        
        {/* Çalışma Saatleri */}
        <Box 
          backgroundColor={theme.card} 
          borderRadius="$lg" 
          padding="$4" 
          margin="$3"
          marginTop="$1"
          borderWidth={1}
          borderColor={theme.border}
        >
          <Heading size="md" color={theme.text} mb="$2">Çalışma Saatleri</Heading>
          <VStack space="sm">
            {Object.entries(facility.workingHours).map(([day, hours]) => (
              <HStack key={day} justifyContent="space-between" py="$1">
                <GText color={theme.text} fontWeight="medium">{day}</GText>
                <GText color={hours.isClosed ? theme.error : theme.text}>
                  {hours.isClosed ? 'Kapalı' : `${hours.open} - ${hours.close}`}
                </GText>
              </HStack>
            ))}
          </VStack>
        </Box>
        
        {/* Hizmetler */}
        <Box 
          backgroundColor={theme.card} 
          borderRadius="$lg" 
          padding="$4" 
          margin="$3"
          marginTop="$1"
          borderWidth={1}
          borderColor={theme.border}
        >
          <Heading size="md" color={theme.text} mb="$2">Sunulan Hizmetler</Heading>
          <VStack space="sm">
            {facility.services.map((service, index) => (
              <HStack key={index} space="sm" alignItems="center">
                <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                <GText color={theme.text}>{service}</GText>
              </HStack>
            ))}
          </VStack>
        </Box>
        
        {/* Açıklama */}
        <Box 
          backgroundColor={theme.card} 
          borderRadius="$lg" 
          padding="$4" 
          margin="$3"
          marginTop="$1"
          borderWidth={1}
          borderColor={theme.border}
        >
          <Heading size="md" color={theme.text} mb="$2">Hakkında</Heading>
          <GText color={theme.text}>{facility.description}</GText>
        </Box>
        
        {/* Harita */}
        <Box 
          backgroundColor={theme.card} 
          borderRadius="$lg" 
          margin="$3"
          marginTop="$1"
          borderWidth={1}
          borderColor={theme.border}
          overflow="hidden"
          height={200}
        >
          <MapView
            style={styles.map}
            customMapStyle={theme.mapStyle}
            initialRegion={{
              latitude: facility.latitude,
              longitude: facility.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            }}
          >
            <Marker
              coordinate={{
                latitude: facility.latitude,
                longitude: facility.longitude
              }}
              title={facility.name}
              description={facility.address}
            />
          </MapView>
        </Box>
        
        {/* Boşluk */}
        <Box height={100} />
      </ScrollView>
      
      {/* Tam Ekran Resim Görüntüleyici */}
      <Modal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        size="full"
      >
        <ModalContent>
          <ModalHeader>
            <Heading color={theme.text}>Fotoğraflar</Heading>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody p={0}>
            <Image
              source={{ uri: facility.images[selectedImageIndex] }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
            <HStack justifyContent="space-between" position="absolute" bottom={50} width="100%" px="$4">
              <Button
                variant="solid"
                opacity={0.8}
                isDisabled={selectedImageIndex === 0}
                onPress={() => setSelectedImageIndex(prev => Math.max(0, prev - 1))}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </Button>
              
              <Button
                variant="solid"
                opacity={0.8}
                isDisabled={selectedImageIndex === facility.images.length - 1}
                onPress={() => setSelectedImageIndex(prev => Math.min(facility.images.length - 1, prev + 1))}
              >
                <Ionicons name="chevron-forward" size={24} color="white" />
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 8,
  },
  actionButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: 200,
  },
  thumbnailImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: '#0066ff',
  },
  addPhotoButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
});

export default FacilityDetailScreen;