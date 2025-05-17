import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import { useApiStore } from '../../store/appStore/apiStore';
import { apiClient } from '../../api/apiClient';
import { Event } from '../../types/eventTypes/event.types';
import { EventCard } from '../../components/Event/EventCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProfileStore } from '../../store/userStore/profileStore';

type UserEventsScreenRouteProp = RouteProp<ProfileStackParamList, 'UserEvents'>;
type UserEventsNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;
type AppNavigationProp = NativeStackNavigationProp<any>;

export const UserEventsScreen: React.FC = () => {
  const route = useRoute<UserEventsScreenRouteProp>();
  const navigation = useNavigation<AppNavigationProp>();
  const { filter, userId, title } = route.params;
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchUserProfile, isLoading, userInfo, upcomingEvents, pastEvents } = useProfileStore();
  
  // Profil verilerini getir ve etkinlikleri filtrele
  const fetchEvents = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      // Profil verilerini yenile
      await fetchUserProfile();
      
      // Store'dan profil verileri
      const profileData = useProfileStore.getState();
      
      // Kullanıcı profili yüklenmediyse, hata göster
      if (!profileData.userInfo) {
        throw new Error('Profil bilgileri yüklenemedi');
      }
      
      // Tüm etkinlikleri birleştir (upcomingEvents ve pastEvents)
      const allEvents = [
        ...(profileData.upcomingEvents || []),
        ...(profileData.pastEvents || [])
      ];
      
   
      
      // Etkinlikleri filtrele
      let filteredEvents: Event[] = [];
      
      if (filter === 'created') {
        // Kullanıcının oluşturduğu etkinlikler - creator_id veya creator.id kontrolü yap
        filteredEvents = allEvents.filter(event => {
          const isCreator = 
            event.creator_id === profileData.userInfo?.id || 
            event.creator?.id === profileData.userInfo?.id || 
            event.is_creator === true;
          
          if (isCreator) {
            console.log(`Oluşturulan etkinlik: ${event.title}`);
          }
          
          return isCreator;
        });
      } else if (filter === 'participated') {
        // Kullanıcının katıldığı etkinlikler - katıldığı ama oluşturmadığı etkinlikler
        filteredEvents = allEvents.filter(event => {
          // Etkinliğin oluşturucusu kullanıcı değilse ve katılım durumu varsa
          const isCreator = 
            event.creator_id === profileData.userInfo?.id || 
            event.creator?.id === profileData.userInfo?.id || 
            event.is_creator === true;
          
          // API yapısına bağlı olarak katılım durumunu kontrol et
          // `pastEvents` içinde etkinlik varsa, kullanıcı bu etkinliğe zaten katılmış demektir
          const isParticipant = !isCreator;
          
          if (isParticipant) {
            console.log(`Katılınan etkinlik: ${event.title}`);
          }
          
          return isParticipant;
        });
      }
      
      console.log(`Filtrelenmiş etkinlik sayısı (${filter}): ${filteredEvents.length}`);
      setEvents(filteredEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Etkinlikler yüklenirken bir hata oluştu';
      setError(errorMessage);
      useApiStore.getState().setGlobalError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // İlk yüklemede ve profil verileri değiştiğinde otomatik güncelleme
  useEffect(() => {
    fetchEvents();
  }, [filter, userInfo?.id]);
  
  // Yenileme fonksiyonu
  const onRefresh = () => {
    fetchEvents(true);
  };
  
  // Etkinlik detay sayfasına yönlendir
  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };
  
  // Liste için placeholder
  const renderEmptyList = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {filter === 'created' 
            ? 'Henüz oluşturduğunuz bir etkinlik bulunmuyor.' 
            : 'Henüz katıldığınız bir etkinlik bulunmuyor.'}
        </Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {(loading || isLoading) && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#338626" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            events.length === 0 && styles.emptyListContent
          ]}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#338626']}
              tintColor="#338626"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Bottom padding for better scrolling
  },
  emptyListContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 