import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Image,
  TextInput,
  SafeAreaView,
  Alert,
  StatusBar
} from 'react-native';
import { RouteProp, useNavigation, useRoute, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useEventStore, ParticipantSortOption } from '../../store/eventStore/eventStore';
import { useThemeStore } from '../../store/appStore/themeStore';
import { EventParticipant } from '../../types/eventTypes/event.types';
import { formatDate } from '../../utils/dateUtils';
import { 
  horizontalScale, 
  verticalScale, 
  fontScale, 
  getStatusBarHeight, 
  padding,
  SCREEN_WIDTH
} from '../../utils/dimensionsUtils';
import { useAuthStore } from '../../store/userStore/authStore';
import { EventParticipantsList } from '../../components/EventParticipantsList/EventParticipantsList';

// Route param tanımı
type EventParticipantsScreenRouteParams = {
  EventParticipantsScreen: {
    eventId: string;
  };
  FriendProfileScreen: {
    userId: string;
  };
  ProfileScreen: undefined;
};

const EventParticipantsScreen = ({ route }: { route: RouteProp<EventParticipantsScreenRouteParams, 'EventParticipantsScreen'> }) => {
  // Tema ve navigasyon
  const { theme, isDarkMode } = useThemeStore();
  const navigation = useNavigation<NavigationProp<EventParticipantsScreenRouteParams>>();
  const { user } = useAuthStore();
  
  // Rotadan eventId'yi al
  const { eventId } = route.params;
  
  // EventStore'dan gerekli durumları ve fonksiyonları al
  const { 
    currentEvent, 
    participants,
    filteredParticipants,
    participantSearchQuery,
    participantSortOption,
    totalParticipants,
    isLoadingParticipants,
    error,
    fetchEventDetail,
    fetchEventParticipants,
    searchParticipants,
    sortParticipants,
    resetParticipantsFilter,
    clearError
  } = useEventStore();
  
  // Arama metni state'i (yerel olarak takip ediyoruz)
  const [searchText, setSearchText] = useState('');
  
  // Filtreleme menüsü görünürlüğü
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // Component mount olduğunda katılımcıları yükle
  useEffect(() => {
    // Event ID yoksa, ana sayfaya geri dön
    if (!eventId) {
      Alert.alert('Hata', 'Etkinlik ID bilgisi eksik.');
      navigation.goBack();
      return;
    }
    
    loadEventParticipants();
    
    // Component unmount olduğunda filtreleri sıfırla
    return () => {
      resetParticipantsFilter();
    };
  }, [eventId]);
  
  // Hata durumunda kullanıcıya bildir
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearError();
    }
  }, [error]);
  
  // Etkinlik detayı ve katılımcıları yükle
  const loadEventParticipants = async () => {
    try {
      console.log('Katılımcıları yükleme başladı - EventID:', eventId);
      
      // EventId kontrolü
      if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
        console.error('Geçersiz eventId:', eventId);
        Alert.alert('Hata', 'Geçersiz etkinlik ID. Lütfen tekrar deneyin.');
        navigation.goBack();
        return;
      }
      
      // Önce event detayını kontrol ediyoruz, eğer yoksa veya farklı bir eventId ise yükle
      if (!currentEvent || currentEvent.id !== eventId) {
        console.log('Etkinlik detayı yükleniyor...');
        try {
          await fetchEventDetail(eventId);
          console.log('Etkinlik detayı başarıyla yüklendi:', currentEvent?.title);
        } catch (detailError) {
          console.error('Etkinlik detayı yüklenirken hata:', detailError);
          
          // Hata durumunda temiz bir mesaj göster ve kullanıcıyı yönlendir
          let errorMsg = 'Etkinlik detayı yüklenirken bir sorun oluştu.';
          
          if (detailError instanceof Error) {
            if (detailError.message.includes('404')) {
              errorMsg = 'Etkinlik bulunamadı. Silinmiş veya erişim izniniz olmayabilir.';
            } else if (detailError.message.includes('403')) {
              errorMsg = 'Bu etkinliğe erişim izniniz yok.';
            } else if (detailError.message.includes('401')) {
              errorMsg = 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.';
            }
          }
          
          Alert.alert('Hata', errorMsg);
          navigation.goBack();
          return;
        }
      }
      
      // Şimdi katılımcıları yüklüyoruz
      console.log('Katılımcılar yükleniyor... EventID:', eventId);
      
      try {
        await fetchEventParticipants(eventId);
        
        // İşlem başarılıysa katılımcı sayısı bilgilerini kontrol et
        const storeState = useEventStore.getState();
        console.log('Store durumu - katılımcılar:', storeState.participants.length);
        console.log('Store durumu - filtrelenmiş katılımcılar:', storeState.filteredParticipants.length);
        
        // Katılımcı verisi boş mu kontrol et
        if (participants.length === 0) {
          console.log('Katılımcı listesi boş');
          // Bu normal bir durum olabilir, ek işlem gerekmeyebilir
        } else {
          console.log(`Yüklenen katılımcı sayısı: ${participants.length}`);
          if (filteredParticipants.length > 0) {
            console.log('İlk katılımcı örneği:', JSON.stringify(filteredParticipants[0], null, 2));
          }
        }
      } catch (participantsError) {
        console.error('Katılımcıları yükleme hatası:', participantsError);
        
        // Hata mesajını göster ama sayfadan çıkmaya zorlama
        // Kullanıcı etkinlik bilgilerini görebilir, katılımcılar yüklenememiş olabilir
        let errorMsg = 'Katılımcılar yüklenirken bir sorun oluştu.';
        
        if (participantsError instanceof Error) {
          errorMsg = participantsError.message;
        }
        
        // Katılımcı yükleme hatasında boş liste gösterilecek,
        // sadece kullanıcıyı hata hakkında bilgilendir
        Alert.alert('Uyarı', errorMsg);
      }
      
    } catch (err) {
      // Genel hata durumunu ele al - en dıştaki try-catch
      console.error('Genel hata oluştu:', err);
      
      let errorMsg = 'Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.';
      if (err instanceof Error) {
        errorMsg = err.message;
      }
      
      Alert.alert('Hata', errorMsg);
    }
  };
  
  // Arama yapma
  const handleSearch = (text: string) => {
    setSearchText(text);
    searchParticipants(text);
  };
  
  // Aramalı temizle
  const handleClearSearch = () => {
    setSearchText('');
    searchParticipants('');
  };
  
  // Sıralama değiştir
  const handleChangeSorting = (sortOption: ParticipantSortOption) => {
    sortParticipants(sortOption);
    setShowFilterMenu(false);
  };
  
  // Kullanıcı profiline git
  const handleParticipantPress = (participant: EventParticipant) => {
    if (participant.user_id === user?.id) {
      // Kendi profiline git
      navigation.navigate('ProfileScreen');
    } else {
      // Başka kullanıcının profiline git
      navigation.navigate('FriendProfileScreen', { userId: participant.user_id });
    }
  };

  // Filtreleme menüsünü render et
  const renderFilterMenu = () => {
    if (!showFilterMenu) return null;
    
    // Menü içeriği
    return (
      <View style={[styles.filterMenu, { backgroundColor: theme.colors.card }]}>
        {/* Menü başlığı */}
        <View style={styles.filterMenuHeader}>
          <Text style={[styles.filterMenuTitle, { color: theme.colors.text }]}>
            Sıralama Seçenekleri
          </Text>
          <TouchableOpacity 
            onPress={() => setShowFilterMenu(false)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Sıralama seçenekleri */}
        <TouchableOpacity 
          style={[
            styles.filterOption,
            participantSortOption === 'name' && styles.selectedFilterOption,
            participantSortOption === 'name' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => handleChangeSorting('name')}
        >
          <Text style={[
            styles.filterOptionText, 
            { color: theme.colors.text },
            participantSortOption === 'name' && { color: theme.colors.primary, fontWeight: '600' }
          ]}>
            İsim (A-Z)
          </Text>
          {participantSortOption === 'name' && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterOption,
            participantSortOption === 'none' && styles.selectedFilterOption,
            participantSortOption === 'none' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => handleChangeSorting('none')}
        >
          <Text style={[
            styles.filterOptionText, 
            { color: theme.colors.text },
            participantSortOption === 'none' && { color: theme.colors.primary, fontWeight: '600' }
          ]}>
            Varsayılan Sıralama
          </Text>
          {participantSortOption === 'none' && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterOption,
            participantSortOption === 'joinDate' && styles.selectedFilterOption,
            participantSortOption === 'joinDate' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => handleChangeSorting('joinDate')}
        >
          <Text style={[
            styles.filterOptionText, 
            { color: theme.colors.text },
            participantSortOption === 'joinDate' && { color: theme.colors.primary, fontWeight: '600' }
          ]}>
            Katılım Tarihi (Önce Yeni)
          </Text>
          {participantSortOption === 'joinDate' && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
        </TouchableOpacity>
      </View>
    );
  };

  // Boş liste içeriği
  const renderEmptyList = () => {
    if (isLoadingParticipants) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Katılımcılar yükleniyor...
          </Text>
        </View>
      );
    }

    if (searchText.length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={50} color={theme.colors.textSecondary} style={styles.emptyIcon} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            "{searchText}" aramasıyla eşleşen katılımcı bulunamadı.
          </Text>
          <TouchableOpacity
            style={[styles.resetSearchButton, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={handleClearSearch}
          >
            <Text style={[styles.resetSearchButtonText, { color: theme.colors.primary }]}>
              Aramayı Temizle
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={70} color={theme.colors.textSecondary} style={styles.emptyIcon} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          Bu etkinliğe henüz katılımcı yok
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          İlk katılan sen ol! Etkinlik detay sayfasından
          'Etkinliğe Katıl' butonuna tıklayarak
          katılabilirsin.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Etkinlik Katılımcıları
        </Text>
        
        <View style={styles.rightPlaceholder} />
      </View>
      
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EventParticipantsList
          participants={filteredParticipants}
          isLoading={isLoadingParticipants}
          onPressParticipant={handleParticipantPress}
          onSearch={searchParticipants}
          onSort={sortParticipants}
          currentUser={user ? { id: user.id } : undefined}
          searchQuery={participantSearchQuery}
          currentSortOption={participantSortOption}
          totalParticipants={totalParticipants}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: horizontalScale(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: verticalScale(56),
    paddingHorizontal: horizontalScale(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightPlaceholder: {
    width: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  resetSearchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetSearchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    left: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  filterMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  filterMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  selectedFilterOption: {
    borderLeftWidth: 3,
  },
  filterOptionText: {
    fontSize: 15,
  },
});

export default EventParticipantsScreen; 