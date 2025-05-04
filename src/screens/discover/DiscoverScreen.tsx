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
import { useThemeStore } from '../../store/appStore/themeStore';
import * as Location from 'expo-location';
import { useProfileStore } from '../../store/userStore/profileStore';
import { useNavigation } from '@react-navigation/native';
import { useMapsStore } from '../../store/appStore/mapsStore';
import { useEventStore } from '../../store/eventStore/eventStore';

// Doğrudan her bir bileşeni import ediyoruz
import { DiscoverHeader } from '../../components/Discover/DiscoverHeader';
import { NearbyEvents } from '../../components/Discover/NearbyEvents';
import { SportsFriends } from '../../components/Discover/SportsFriends';
import { NearbyFacilities } from '../../components/Discover/NearbyFacilities';

// Event servisini import et
import { eventService } from '../../api/events/eventApi';

export const DiscoverScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { defaultLocation } = useProfileStore();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Maps ve Event store'ları kullan
  const { setLastLocation } = useMapsStore();
  const { 
    nearbyEvents, 
    fetchNearbyEvents, 
    isLoading: isLoadingEvents 
  } = useEventStore();
  
  // Diğer yükleme durumları
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  
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
      fetchNearbyEvents({
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
        radius: 10 // 10 km yarıçapında
      });
    }
  }, [useMapsStore.getState().lastLocation]);
  
  // Mock veri yükleme fonksiyonu (şimdilik sadece arkadaşlar ve tesisler)
  const loadData = async () => {
    setLoadingFriends(true);
    setLoadingFacilities(true);
    
    // API çağrılarını simüle et (bu kısımlar daha sonra gerçek API ile değiştirilecek)
    setTimeout(() => {
      setLoadingFriends(false);
    }, 1500);
    
    setTimeout(() => {
      setLoadingFacilities(false);
    }, 2000);
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
        await fetchNearbyEvents({
          latitude: lastLocation.latitude,
          longitude: lastLocation.longitude,
          radius: 10
        });
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
    console.log('Tüm spor arkadaşları görüntüleniyor');
  };
  
  const handleSeeAllFacilities = () => {
    console.log('Tüm tesisler görüntüleniyor');
  };
  
  console.log('DiscoverScreen rendering with theme:', theme);
  
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
        
        {/* Yakındaki Etkinlikler */}
        <NearbyEvents 
          isLoading={isLoadingEvents} 
          events={nearbyEvents}
          onSeeAll={handleSeeAllEvents}
        />
        
        {/* Spor Arkadaşları */}
        <SportsFriends 
          isLoading={loadingFriends} 
          onSeeAll={handleSeeAllFriends}
        />
        
        {/* Yakınımdaki Tesisler */}
        <NearbyFacilities 
          isLoading={loadingFacilities} 
          facilities={[]} 
          onSeeAll={handleSeeAllFacilities}
        />
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
}); 