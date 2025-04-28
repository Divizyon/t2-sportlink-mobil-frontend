import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet,
  SafeAreaView,
  ScrollView, 
  StatusBar,
  RefreshControl,
  Text,
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';

// Doğrudan her bir bileşeni import ediyoruz
import { DiscoverHeader } from '../../components/Discover/DiscoverHeader';
import { NearbyEvents } from '../../components/Discover/NearbyEvents';
import { SportsFriends } from '../../components/Discover/SportsFriends';
import { NearbyFacilities } from '../../components/Discover/NearbyFacilities';

export const DiscoverScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock loading durumları
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  
  // Dummy veri yükleme fonksiyonu - API entegrasyonu için
  const loadData = async () => {
    // Bu fonksiyon gerçekte API çağrıları yapacak
    setLoadingEvents(true);
    setLoadingFriends(true);
    setLoadingFacilities(true);
    
    // API çağrılarını simüle et
    setTimeout(() => {
      setLoadingEvents(false);
    }, 1000);
    
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
    await loadData();
    setRefreshing(false);
  };
  
  // Arama işlemi
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Gerçek implementasyonda burada API çağrısı yapılacak
    console.log('Arıyor:', query);
  };
  
  // Tümünü gör fonksiyonları
  const handleSeeAllEvents = () => {
    // Navigasyon yönlendirmesi yapılacak
    console.log('Tüm etkinlikler görüntüleniyor');
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
          isLoading={loadingEvents} 
          events={[]}
          onSeeAll={handleSeeAllEvents}
        />
        
        {/* Spor Arkadaşları */}
        <SportsFriends 
          isLoading={loadingFriends} 
          friends={[]} 
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