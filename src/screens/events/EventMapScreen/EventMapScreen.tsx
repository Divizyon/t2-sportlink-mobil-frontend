import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform, 
  StatusBar,
  Linking,
  Image,
  Alert
} from 'react-native';

import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useEventStore } from '../../../store/eventStore/eventStore';
import { useThemeStore } from '../../../store/appStore/themeStore';

// Route params tipi tanımlama
type EventMapRouteParams = {
  EventMapScreen: {
    eventId: string;
  };
};

export const EventMapScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<EventMapRouteParams, 'EventMapScreen'>>();
  const { eventId } = route.params;
  
  const { currentEvent, fetchEventDetail, isLoading } = useEventStore();
  
  // Component yüklendiğinde etkinlik detaylarını getir
  useEffect(() => {
    const loadEventDetails = async () => {
      if (!currentEvent || currentEvent.id !== eventId) {
        await fetchEventDetail(eventId);
      } else {
        // Konum bilgisi varsa harita uygulamasını otomatik olarak aç
        openMapApp();
      }
    };
    
    loadEventDetails();
  }, [eventId]);
  
  // Geri gitme fonksiyonu
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  // Harici harita uygulamasını aç
  const openMapApp = () => {
    if (!currentEvent) return;
    
    const { location_latitude, location_longitude, location_name } = currentEvent;
    
    if (!location_latitude || !location_longitude) {
      Alert.alert('Hata', 'Bu etkinlik için konum bilgisi bulunamadı.');
      navigation.goBack();
      return;
    }
    
    let url = '';
    
    if (Platform.OS === 'ios') {
      // iOS için Apple Maps'te aç
      url = `maps:?q=${encodeURIComponent(location_name || 'Etkinlik Konumu')}&ll=${location_latitude},${location_longitude}`;
    } else {
      // Android için Google Maps'te aç
      url = `geo:${location_latitude},${location_longitude}?q=${location_latitude},${location_longitude}&z=16`;
    }
    
    // URL'i açabilir miyiz diye kontrol et
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
        // Harita uygulaması açıldıktan sonra EventDetail'e geri dön
        navigation.goBack();
      } else {
        // Eğer yerleşik harita uygulaması açılamazsa Google Maps web URL'i dene
        const webUrl = `https://maps.google.com/maps?q=${location_latitude},${location_longitude}`;
        Linking.openURL(webUrl)
          .then(() => navigation.goBack())
          .catch(err => {
            console.error('Harita açılırken hata oluştu:', err);
            Alert.alert('Hata', 'Harita uygulaması açılamadı.');
            navigation.goBack();
          });
      }
    }).catch(err => {
      console.error('Harita URL kontrolünde hata:', err);
      // Her durumda çalışacak yedek çözüm
      const webUrl = `https://maps.google.com/maps?q=${location_latitude},${location_longitude}`;
      Linking.openURL(webUrl)
        .then(() => navigation.goBack())
        .catch(() => {
          Alert.alert('Hata', 'Harita uygulaması açılamadı.');
          navigation.goBack();
        });
    });
  };
  
  // İçerik yükleniyorsa
  if (isLoading && !currentEvent) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Image
          source={require('../../../../assets/loading/ball-toggle.gif')}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Konum bilgileri yükleniyor...
        </Text>
      </SafeAreaView>
    );
  }
  
  // Etkinlik bulunamadıysa veya konum bilgisi yoksa
  if (!currentEvent || !currentEvent.location_latitude || !currentEvent.location_longitude) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons size={60} color={theme.colors.textSecondary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Bu etkinlik için konum bilgisi bulunamadı
        </Text>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.colors.accent }]}
          onPress={handleGoBack}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // Harita yerleşik olmadığı için, direkt harici harita uygulamasına yönlendirecek
  // bir arayüz gösteriyoruz
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />
      
      <View style={styles.content}>
        <Ionicons 
          name="map" 
          size={80} 
          color={theme.colors.accent} 
          style={styles.mapIcon}
        />
        
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Etkinlik Konumu
        </Text>
        
        <Text style={[styles.locationName, { color: theme.colors.text }]}>
          {currentEvent.location_name}
        </Text>
        
        <Text style={[styles.coordinates, { color: theme.colors.textSecondary }]}>
          {currentEvent.location_latitude}, {currentEvent.location_longitude}
        </Text>
        
        <TouchableOpacity
          style={[styles.openMapButton, { backgroundColor: theme.colors.accent }]}
          onPress={openMapApp}
        >
          <Ionicons name="navigate" size={24} color="white" />
          <Text style={styles.openMapButtonText}>Haritada Göster</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: 'transparent', marginTop: 20 }]}
          onPress={handleGoBack}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>
            Geri Dön
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  locationName: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  coordinates: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  openMapButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});