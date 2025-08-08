import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet,
  SafeAreaView,
  ScrollView, 
  StatusBar,
  RefreshControl,
  Text,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors/colors';
import { useThemeStore } from '../../store/appStore/themeStore';
import * as Location from 'expo-location';
import { useProfileStore } from '../../store/userStore/profileStore';
import { useNavigation } from '@react-navigation/native';
import { useMapsStore } from '../../store/appStore/mapsStore';
import { useEventStore } from '../../store/eventStore/eventStore';
import { useHomeStore } from '../../store/appStore/homeStore';
import { useFacilitiesStore } from '../../store/appStore/facilitiesStore';

// Doğrudan her bir bileşeni import ediyoruz
import { DiscoverHeader } from '../../components/Discover/DiscoverHeader';
import { SportsFriends } from '../../components/Discover/SportsFriends';
import { NearbyFacilities } from '../../components/Discover/NearbyFacilities';
import NearbyEventsComponent from '../../components/Shared/NearbyEventsComponent';

export const DiscoverScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { defaultLocation } = useProfileStore();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Maps ve Event store'ları kullan
  const { setLastLocation } = useMapsStore();
  const { 
    fetchNearbyEvents,
    isLoading: isLoadingEvents,
    fetchAllEventsByDistance
  } = useEventStore();
  
  // HomeStore'dan yükleme durumunu al - tutarlılık için
  const { isLoadingNearbyEvents } = useHomeStore();
  
  // Facilities store'u kullan
  const { fetchNearbyFacilities } = useFacilitiesStore();
  
  // Diğer yükleme durumları
  const [loadingFriends, setLoadingFriends] = useState(true);
  
  // Kullanıcının konumunu al ve store'a kaydet
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Önce profil sayfasından kaydedilen konum var mı diye kontrol et
        if (defaultLocation) {
          // defaultLocation'dan sadece latitude ve longitude kullan
          setLastLocation(
            defaultLocation.latitude,
            defaultLocation.longitude
          );
          
          // Yakındaki tesisleri getir
          fetchNearbyFacilities(
            defaultLocation.latitude,
            defaultLocation.longitude
          );
          return;
        }
        
        // Konum izni iste
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            'Konum İzni Gerekli', 
            'Yakındaki etkinlikleri görebilmek için konum izni vermeniz gerekiyor.',
            [{ text: 'Tamam' }]
          );
          return;
        }
        
        // Mevcut konumu al
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        
        // Konum bilgisini mapsStore'a kaydet
        setLastLocation(
          location.coords.latitude,
          location.coords.longitude
        );
        
        // Yakındaki tesisleri getir
        fetchNearbyFacilities(
          location.coords.latitude,
          location.coords.longitude
        );
        
        // Ters geocoding ile adres bilgisini al
        try {
          const addressResponse = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
          
          if (addressResponse && addressResponse.length > 0) {
            const address = addressResponse[0];
            const addressStr = `${address.street || ''} ${address.name || ''}, ${address.district || ''}, ${address.city || ''}`;
            
            // Adres bilgisini konum ile birlikte kaydet
            setLastLocation(
              location.coords.latitude,
              location.coords.longitude,
              addressStr
            );
          }
        } catch (error) {
          console.error('Adres alınamadı:', error);
        }
      } catch (error) {
        console.error('Konum alınamadı:', error);
        Alert.alert(
          'Hata',
          'Konum bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
      }
    };
    
    getUserLocation();
  }, [defaultLocation]);
  
  // Maps store'daki konum değiştiğinde yakındaki etkinlikleri getir
  useEffect(() => {
    const lastLocation = useMapsStore.getState().lastLocation;
    
    if (lastLocation) {
      // Etkinlikleri mesafeye göre sırala
      fetchAllEventsByDistance(true);
      // Yakındaki tesisleri getir
      fetchNearbyFacilities(
        lastLocation.latitude,
        lastLocation.longitude
      );
    } else {
      // Konum yoksa tarih sırasına göre sırala
      fetchAllEventsByDistance(false);
    }
  }, [useMapsStore.getState().lastLocation]);
  
  // Mock veri yükleme fonksiyonu (şimdilik sadece arkadaşlar)
  const loadData = async () => {
    setLoadingFriends(true);
    
    // API çağrılarını simüle et (bu kısımlar daha sonra gerçek API ile değiştirilecek)
    setTimeout(() => {
      setLoadingFriends(false);
    }, 1500);
  };
  
  // İlk yükleme
  useEffect(() => {
    loadData();
  }, []);
  
  // Yenileme işlemi
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const lastLocation = useMapsStore.getState().lastLocation;
      
      if (lastLocation) {
        // Etkinlikleri mesafeye göre sırala
        await fetchAllEventsByDistance(true);
        // Yakındaki tesisleri yeniden getir
        await fetchNearbyFacilities(
          lastLocation.latitude,
          lastLocation.longitude
        );
      } else {
        // Konum yoksa tarih sırasına göre sırala
        await fetchAllEventsByDistance(false);
      }
      await loadData();
    } catch (error) {
      console.error('Yenileme hatası:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Arama işlemi
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Gerçek implementasyonda burada API çağrısı yapılacak
    console.log('Arıyor:', query);
  };
  
  // Tümünü gör fonksiyonları
  const handleSeeAllEvents = () => {
    // Events ekranına yönlendir
    navigation.navigate('Events');
  };
  
  const handleSeeAllFriends = () => {
    // AllSportsFriends ekranına yönlendir
    navigation.navigate('AllSportsFriends');
  };
  
  const handleSeeAllFacilities = () => {
    // Tüm tesisler ekranına yönlendir
    navigation.navigate('AllFacilities');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[theme.colors.accent]} 
            tintColor={theme.colors.accent}
          />
        }
      >
        {/* Başlık ve Arama */}
        <DiscoverHeader onSearch={handleSearch} />
        
        {/* Yakındaki Etkinlikler - Ortak Komponent */}
        <NearbyEventsComponent 
          onSeeAll={handleSeeAllEvents}
          maxItems={5}
        />
        
        {/* Spor Arkadaşları */}
        <SportsFriends 
          isLoading={loadingFriends} 
          onSeeAll={handleSeeAllFriends}
        />
        
        {/* Yakınımdaki Tesisler */}
        <NearbyFacilities onSeeAll={handleSeeAllFacilities} />
        
        {/* Konya Tanıtım Bölümü */}
        <View style={[styles.konyaSection, { backgroundColor: theme.colors.card }]}>
          <View style={styles.konyaHeader}>
            <Ionicons name="location" size={24} color={colors.accent} />
            <Text style={[styles.konyaTitle, { color: theme.colors.text }]}>
              Konya Spor Kültürü
            </Text>
          </View>
          <Text style={[styles.konyaDescription, { color: theme.colors.textSecondary }]}>
            Türkiye'nin spor şehri Konya'da, geleneksel spor kültürü ile modern spor anlayışı buluşuyor. 
            Mevlana'nın şehrinde, spor tutkunları bir araya geliyor.
          </Text>
          <View style={styles.konyaFeatures}>
            <View style={styles.konyaFeature}>
              <Ionicons name="football" size={16} color={colors.accent} />
              <Text style={[styles.konyaFeatureText, { color: theme.colors.textSecondary }]}>
                Futbol Sahaları
              </Text>
            </View>
            <View style={styles.konyaFeature}>
              <Ionicons name="basketball" size={16} color={colors.accent} />
              <Text style={[styles.konyaFeatureText, { color: theme.colors.textSecondary }]}>
                Basketbol Kortları
              </Text>
            </View>
            <View style={styles.konyaFeature}>
              <Ionicons name="fitness" size={16} color={colors.accent} />
              <Text style={[styles.konyaFeatureText, { color: theme.colors.textSecondary }]}>
                Spor Salonları
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  konyaSection: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  konyaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  konyaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  konyaDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  konyaFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  konyaFeature: {
    alignItems: 'center',
    flex: 1,
  },
  konyaFeatureText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
}); 