import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Linking,
  Share,
  Platform,
  Modal,
  TextInput,
  FlatList,
  ImageBackground,
} from 'react-native';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { useEventStore } from '../../../store/eventStore/eventStore';
import { useAuthStore } from '../../../store/userStore/authStore';
import { useMapsStore } from '../../../store/appStore/mapsStore';
import { formatDate, formatTimeRange, formatDateTime } from '../../../utils/dateUtils';
import { colors } from '../../../constants/colors/colors';
import { DistanceInfo } from '../../../components/maps/DistanceInfo';

// Spor görselleri import
const footballImage = require('../../../../assets/sportImage/football.png');
const basketballImage = require('../../../../assets/sportImage/basketball.png');
const tennisImage = require('../../../../assets/sportImage/tennis.png');
const volleyballImage = require('../../../../assets/sportImage/volleyball.png');
const walkImage = require('../../../../assets/sportImage/walk.png');

// Spor kategorilerine göre görsel eşleştirme
const sportImages: Record<string, any> = {
  basketbol: basketballImage,
  futbol: footballImage,
  tenis: tennisImage,
  voleybol: volleyballImage,
  koşu: walkImage,
  yoga: walkImage,
  fitness: walkImage,  
  yüzme: walkImage,
  badminton: tennisImage,
  bisiklet: walkImage,
  default: footballImage,
};

// Spor kategorisine göre görsel döndüren fonksiyon
const getSportImageSource = (sportName: string): any => {
  if (!sportName) return sportImages.default;
  const sport = sportName.toLowerCase();
  
  if (sport === 'basketbol') return sportImages.basketbol;
  if (sport === 'futbol') return sportImages.futbol;
  if (sport === 'tenis') return sportImages.tenis;
  if (sport === 'voleybol') return sportImages.voleybol;
  if (sport === 'koşu') return sportImages.koşu;
  if (sport === 'yoga') return sportImages.yoga;
  if (sport === 'fitness') return sportImages.fitness;
  if (sport === 'yüzme') return sportImages.yüzme;
  if (sport === 'badminton') return sportImages.badminton;
  if (sport === 'bisiklet') return sportImages.bisiklet;
  
  if (sport.includes('basket')) return sportImages.basketbol;
  if (sport.includes('futbol') || sport.includes('football')) return sportImages.futbol;
  if (sport.includes('tenis') || sport.includes('tennis')) return sportImages.tenis;
  if (sport.includes('voley') || sport.includes('volley')) return sportImages.voleybol;
  if (sport.includes('koş') || sport.includes('yürü') || sport.includes('walk')) return sportImages.koşu;
  
  return sportImages.default;
};

// Spor kategorisine göre renk döndüren fonksiyon
const getSportTagColor = (sportName: string): string => {
  if (!sportName) return '#2196F3';
  
  const sport = sportName.toLowerCase();
  
  if (sport === 'basketbol') return '#E4843D';
  if (sport === 'futbol') return '#64BF77';
  if (sport === 'tenis') return '#FF9800';
  if (sport === 'voleybol') return '#9C27B0';
  if (sport === 'koşu') return '#479B6E';
  if (sport === 'yoga') return '#8BC34A';
  if (sport === 'fitness') return '#F44336';
  if (sport === 'yüzme') return '#27BCE7';
  if (sport === 'badminton') return '#FFEB3B';
  if (sport === 'bisiklet') return '#607D8B';
  
  if (sport.includes('basket')) return '#E4843D';
  if (sport.includes('futbol') || sport.includes('football')) return '#64BF77';
  if (sport.includes('tenis')) return '#FF9800';
  if (sport.includes('voleybol')) return '#9C27B0';
  if (sport.includes('koş') || sport.includes('yürü') || sport.includes('walk')) return '#479B6E';
  if (sport.includes('yüz') || sport.includes('swim')) return '#27BCE7';
  
  return '#2196F3';
};

// Route param tipini tanımla
type EventDetailRouteParams = {
  EventDetail: {
    eventId: string;
  };
};

const { width } = Dimensions.get('window');

export const EventDetailScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<EventDetailRouteParams, 'EventDetail'>>();
  const { eventId } = route.params;
  
  // Kullanıcı bilgilerini al
  const { user } = useAuthStore();
  
  // Maps store'dan konum bilgisini al
  const { lastLocation } = useMapsStore();
  
  // Event store'dan etkinlik durumunu ve metotları al
  const { 
    currentEvent, 
    isLoading,
    error, 
    message,
    fetchEventDetail,
    joinEvent,
    leaveEvent,
    deleteEvent,
    clearError,
    clearMessage,
    clearLoading
  } = useEventStore();
  
  // Aksiyon durumları
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Davet kodu modalı için state'ler
  const [invitationCodeModalVisible, setInvitationCodeModalVisible] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [invitationCodeError, setInvitationCodeError] = useState('');
  
  // Transport mode için state
  const [selectedTransportMode, setSelectedTransportMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  
  // Katılımcı durumu için state'ler ekleyelim
  const [participantsModalVisible, setParticipantsModalVisible] = useState<boolean>(false);
  
  // Component mount edildiğinde etkinlik detayını getir
  useEffect(() => {
    loadEventDetail();
    
    // Component unmount olduğunda yükleme durumunu temizle
    return () => {
      clearLoading();
    };
  }, [eventId]);
  
  // Hata veya mesaj durumunda uyarı göster
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearError();
    }
    
    if (message) {
      Alert.alert('Bilgi', message);
      clearMessage();
    }
  }, [error, message]);
  
  // Etkinlik detayını yükle
  const loadEventDetail = async () => {
    await fetchEventDetail(eventId);
  };
  
  // Geri gitme
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  // Etkinliğe katıl
  const handleJoinEvent = async () => {
    if (!currentEvent) return;
    
    // Özel etkinlikse davet kodu modalını göster
    if (currentEvent.is_private) {
      setInvitationCodeModalVisible(true);
      return;
    }
    
    // Normal etkinlik için katılma işlemini başlat
    setIsJoining(true);
    const success = await joinEvent(eventId);
    setIsJoining(false);
  };
  
  // Davet kodu ile etkinliğe katılma
  const handleJoinPrivateEvent = async () => {
    if (!currentEvent) return;
    
    // Davet kodu boşsa hata göster
    if (!invitationCode.trim()) {
      setInvitationCodeError('Lütfen davet kodunu giriniz');
      return;
    }
    
    // Katılım işlemini başlat
    setIsJoining(true);
    
    try {
      // Davet kodunu da gönder
      const result = await joinEvent(eventId, { invitation_code: invitationCode });
      
      // Sonuca göre işlem yap
      if (!result) {
        // joinEvent zaten false döndüğünde eventStore'da error state'i set edilmiş olacak
        // Modalı kapatma, kullanıcının tekrar denemesine izin ver
        setInvitationCodeError(error || 'Geçersiz davet kodu. Lütfen tekrar deneyin.');
      } else {
        // Başarılı olursa modalı kapat ve mesajı temizle
        setInvitationCodeModalVisible(false);
        setInvitationCode('');
        setInvitationCodeError('');
      }
    } catch (err) {
      console.error("Etkinliğe katılma hatası:", err);
      setInvitationCodeError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsJoining(false);
    }
  };
  
  // Davet kodu modalını kapat
  const handleCloseInvitationCodeModal = () => {
    setInvitationCodeModalVisible(false);
    setInvitationCode('');
    setInvitationCodeError('');
  };
  
  // Katılımcılar modalını aç
  const handleOpenParticipantsModal = () => {
    setParticipantsModalVisible(true);
  };
  
  // Katılımcılar modalını kapat
  const handleCloseParticipantsModal = () => {
    setParticipantsModalVisible(false);
  };
  
  // Etkinlikten ayrıl
  const handleLeaveEvent = async () => {
    if (!currentEvent) return;
    
    Alert.alert(
      'Etkinlikten Ayrıl',
      'Bu etkinlikten ayrılmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Ayrıl', 
          style: 'destructive',
          onPress: async () => {
            setIsLeaving(true);
            const success = await leaveEvent(eventId);
            setIsLeaving(false);
          }
        }
      ]
    );
  };
  
  // Etkinliği düzenle
  const handleEditEvent = () => {
    if (!currentEvent) return;
    navigation.navigate('EditEvent', { eventId: currentEvent.id });
  };
  
  // Etkinliği sil
  const handleDeleteEvent = async () => {
    if (!currentEvent) return;
    
    Alert.alert(
      'Etkinliği Sil',
      'Bu etkinliği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const success = await deleteEvent(eventId);
            setIsDeleting(false);
            
            if (success) {
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  // Etkinliği paylaş
  const handleShareEvent = async () => {
    if (!currentEvent) return;
    
    try {
      await Share.share({
        message: `${currentEvent.title} etkinliğine davetlisin!\n\nTarih: ${formatDate(currentEvent.event_date)}\nSaat: ${formatTimeRange(currentEvent.start_time, currentEvent.end_time)}\nKonum: ${currentEvent.location_name}\n\nEtkinlik detayları için uygulamayı aç.`,
        title: currentEvent.title,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  // Konuma git (harita uygulamasında aç)
  const handleOpenMap = () => {
    if (!currentEvent) return;
    
    // Konum bilgisini doğrula
    if (!currentEvent.location_latitude || !currentEvent.location_longitude) {
      Alert.alert('Hata', 'Bu etkinlik için konum bilgisi bulunamadı.');
      return;
    }
    
    const { location_latitude, location_longitude, location_name } = currentEvent;
    
    // Konum adı ile veya koordinatlarla bir URL oluştur
    let url = '';
    
    if (Platform.OS === 'ios') {
      // iOS için Apple Maps'te aç (eğer kullanıcı tercih ediyorsa Google Maps de olabilir)
      url = `maps:?q=${encodeURIComponent(location_name || 'Etkinlik Konumu')}&ll=${location_latitude},${location_longitude}`;
    } else {
      // Android için Google Maps'te aç
      url = `geo:${location_latitude},${location_longitude}?q=${location_latitude},${location_longitude}&z=16`;
    }
    
    // URL'i açabilir miyiz diye kontrol et
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Eğer yerleşik harita uygulaması açılamazsa Google Maps web URL'i dene
        const webUrl = `https://maps.google.com/maps?q=${location_latitude},${location_longitude}`;
        Linking.openURL(webUrl);
      }
    }).catch(err => {
      console.error('Harita açılırken hata oluştu:', err);
      // Her durumda çalışacak yedek çözüm
      const webUrl = `https://maps.google.com/maps?q=${location_latitude},${location_longitude}`;
      Linking.openURL(webUrl);
    });
  };

  // Harita ekranına git
  const handleViewMap = () => {
    if (!currentEvent) return;
    navigation.navigate('EventMapScreen', { eventId: currentEvent.id });
  };
  
  // Konum ve mesafe bilgilerini render et
  const renderLocationAndDistance = () => {
    if (!currentEvent) return null;
    
    const hasLocationCoords = currentEvent.location_latitude && currentEvent.location_longitude;
    
    // Transport mode icon ve renkleri
    const transportModes = [
      { id: 'driving', icon: 'car-outline', label: 'Araba' },
      { id: 'walking', icon: 'walk-outline', label: 'Yürüyüş' },
      { id: 'transit', icon: 'bus-outline', label: 'Toplu Taşıma' }
    ];
    
    return (
      <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={22} color={theme.colors.accent} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Konum
          </Text>
        </View>
        
        <Text style={[styles.locationName, { color: theme.colors.text }]}>
          {currentEvent.location_name}
        </Text>
        
        {hasLocationCoords && lastLocation && (
          <>
            {/* Ulaşım modu seçimi */}
            <View style={styles.transportModesContainer}>
              {transportModes.map((mode) => (
                <TouchableOpacity 
                  key={mode.id}
                  style={[
                    styles.transportModeButton,
                    selectedTransportMode === mode.id && {
                      backgroundColor: theme.colors.accent + '20',
                      borderColor: theme.colors.accent
                    }
                  ]}
                  onPress={() => setSelectedTransportMode(mode.id as 'driving' | 'walking' | 'transit')}
                >
                  <Ionicons 
                    name={mode.icon as any} 
                    size={18} 
                    color={selectedTransportMode === mode.id ? theme.colors.accent : theme.colors.textSecondary}
                  />
                  <Text 
                    style={[
                      styles.transportModeLabel,
                      { color: selectedTransportMode === mode.id ? theme.colors.accent : theme.colors.textSecondary }
                    ]}
                  >
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Mesafe bilgisi */}
            <View style={styles.distanceInfoContainer}>
              <DistanceInfo
                origin={`${lastLocation.latitude},${lastLocation.longitude}`}
                destination={`${currentEvent.location_latitude},${currentEvent.location_longitude}`}
                transportMode={selectedTransportMode}
                showDetails={false}
              />
            </View>
          </>
        )}
        
        <View style={styles.mapBtnContainer}>
          <TouchableOpacity 
            style={[styles.mapBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleViewMap}
          >
            <Ionicons name="map-outline" size={18} color="white" />
            <Text style={styles.mapBtnText}>Haritada Gör</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.mapBtn, { backgroundColor: theme.colors.accent }]}
            onPress={handleOpenMap}
          >
            <Ionicons name="navigate-outline" size={18} color="white" />
            <Text style={styles.mapBtnText}>Yol Tarifi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Davet kodu modalını render et
  const renderInvitationCodeModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={invitationCodeModalVisible}
        onRequestClose={handleCloseInvitationCodeModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseInvitationCodeModal}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Özel Etkinlik
              </Text>
              <TouchableOpacity onPress={handleCloseInvitationCodeModal}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Ionicons name="lock-closed" size={50} color={theme.colors.accent} style={styles.lockIcon} />
              
              <Text style={[styles.modalText, { color: theme.colors.text }]}>
                Bu özel bir etkinliktir. Katılmak için organizatörden aldığınız davet kodunu girmeniz gerekmektedir.
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Davet Kodu
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      borderColor: invitationCodeError 
                        ? theme.colors.error 
                        : theme.colors.border,
                      color: theme.colors.text,
                      backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white'
                    }
                  ]}
                  placeholder="Davet kodunu giriniz"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={invitationCode}
                  onChangeText={(text) => {
                    setInvitationCode(text);
                    setInvitationCodeError('');
                  }}
                />
                {invitationCodeError ? (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {invitationCodeError}
                  </Text>
                ) : null}
              </View>
              
              <TouchableOpacity
                style={[styles.joinButton, { backgroundColor: theme.colors.accent }]}
                onPress={handleJoinPrivateEvent}
              >
                <Text style={styles.joinButtonText}>Katıl</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };
  
  // Katılımcılar modalını render et
  const renderParticipantsModal = () => {
    // currentEvent.participants kullanımını düzeltelim
    // API yanıtından gelen participants verisi için güvenli erişim sağlayalım
    const participants = currentEvent?.participants || [];
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={participantsModalVisible}
        onRequestClose={handleCloseParticipantsModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseParticipantsModal}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Katılımcılar ({currentParticipants}/{maxParticipants})
              </Text>
              <TouchableOpacity onPress={handleCloseParticipantsModal}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {participants && participants.length > 0 ? (
                <FlatList
                  data={participants}
                  keyExtractor={(item) => item.user_id}
                  renderItem={({ item }) => (
                    <View style={[styles.participantItem, {
                      borderBottomColor: theme.colors.border,
                      borderBottomWidth: 1,
                    }]}>
                      <View style={styles.participantAvatar}>
                        {item.user?.profile_picture ? (
                          <Image 
                            source={{ uri: item.user.profile_picture }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.accent }]}>
                            <Text style={styles.avatarText}>
                              {item.user?.first_name?.charAt(0)?.toUpperCase() || '?'}
                            </Text>
                          </View>
                        )}
                        {item.role === 'admin' && (
                          <View style={[styles.adminBadge, { backgroundColor: theme.colors.accent }]}>
                            <Ionicons name="star" size={10} color="white" />
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.participantInfo}>
                        <Text style={[styles.participantName, { color: theme.colors.text }]}>
                          {`${item.user?.first_name || ''} ${item.user?.last_name || ''}`.trim() || 'İsimsiz Kullanıcı'}
                          {item.user_id === user?.id ? ' (Sen)' : ''}
                        </Text>
                        <Text style={[styles.participantUsername, { color: theme.colors.textSecondary }]}>
                          @{item.user?.username || 'kullanıcı'}
                        </Text>
                      </View>
                      
                      <View style={styles.participantRole}>
                        <Text style={[
                          styles.roleText, 
                          { 
                            color: item.role === 'admin' ? theme.colors.primary : theme.colors.accent
                          }
                        ]}>
                          {item.role === 'admin' ? 'Organizatör' : 'Katılımcı'}
                        </Text>
                      </View>
                    </View>
                  )}
                  style={styles.participantsList}
                />
              ) : (
                <View style={styles.emptyParticipants}>
                  <Ionicons name="people" size={50} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                    Henüz katılımcı bulunmuyor
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.colors.accent }]}
                onPress={handleCloseParticipantsModal}
              >
                <Text style={styles.closeButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
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
          Etkinlik bilgileri yükleniyor...
        </Text>
      </SafeAreaView>
    );
  }
  
  // Etkinlik bulunamadıysa
  if (!currentEvent && !isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={60} color={theme.colors.textSecondary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Etkinlik bulunamadı
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
  
  if (!currentEvent) return null; // TypeScript için kontrol
  
  // API response'undan doğru verileri al
  const participants = currentEvent.participants || [];
  const currentParticipants = participants.length;
  const maxParticipants = parseInt(String(currentEvent.max_participants), 10) || 1;
  
  const isEventCreator = currentEvent.creator_id === user?.id;
  
  // Kullanıcının bu etkinliğe katılıp katılmadığını kontrol et
  const isUserJoined = participants.some((participant: any) => 
    participant.user_id === user?.id || participant.user?.id === user?.id
  );
  
  const isEventFull = currentParticipants >= maxParticipants;
  const canJoin = !isUserJoined && !isEventFull && currentEvent.status === 'active';
  
  // İlerleme çubuğu yüzdesi (0-100 arasında sınırlandırılmış)
  const progressPercentage = Math.min(
    Math.max((currentParticipants / maxParticipants) * 100, 0), 
    100
  );
  
  // Kalan katılımcı sayısı
  const remainingSpots = Math.max(maxParticipants - currentParticipants, 0);
  
  // Spor kategorisi bilgilerini al
  const sportName = currentEvent.sport?.name || '';
  const sportImage = getSportImageSource(sportName);
  const sportColor = getSportTagColor(sportName);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Hero Image Section with Overlay */}
      <View style={styles.heroSection}>
        <ImageBackground 
          source={sportImage} 
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
          {/* Gradient Overlay */}
          <View style={[styles.gradientOverlay, { backgroundColor: sportColor + '99' }]} />
          
          {/* Header */}
          <SafeAreaView style={styles.header}>
            <TouchableOpacity style={[styles.headerButton, styles.backBtn]} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerActions}>
              
              
              {isEventCreator && (
                <TouchableOpacity style={[styles.headerButton, styles.iconButton]} onPress={handleEditEvent}>
                  <Ionicons name="create-outline" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
          
          {/* Hero Content */}
          <View style={styles.heroContent}>
            {/* Sport Category Badge */}
            <View style={[styles.sportBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.sportBadgeText}>{sportName}</Text>
            </View>
            
            {/* Title */}
            <Text style={styles.heroTitle}>{currentEvent.title}</Text>
            
            {/* Date and Time */}
            <View style={styles.heroInfo}>
              <View style={styles.heroInfoItem}>
                <Ionicons name="calendar-outline" size={16} color="white" />
                <Text style={styles.heroInfoText}>
                  {formatDate(currentEvent.event_date)}
                </Text>
              </View>
              
              <View style={styles.heroInfoItem}>
                <Ionicons name="time-outline" size={16} color="white" />
                <Text style={styles.heroInfoText}>
                  {formatTimeRange(currentEvent.start_time, currentEvent.end_time)}
                </Text>
              </View>
            </View>
            
            {/* Status and Privacy Badges */}
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, { 
                backgroundColor: currentEvent.status === 'active' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 255, 255, 0.2)'
              }]}>
                <Text style={styles.statusBadgeText}>
                  {getStatusText(currentEvent.status, currentEvent.event_date)}
                </Text>
              </View>
              
              {currentEvent.is_private && (
                <View style={[styles.privateBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <Ionicons name="lock-closed" size={12} color="white" />
                  <Text style={styles.privateBadgeText}>Özel</Text>
                </View>
              )}
            </View>
          </View>
        </ImageBackground>
      </View>
      
      {/* Content Section */}
      <ScrollView
        style={styles.contentSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Participants Section */}
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="people-outline" size={22} color={sportColor} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Katılımcılar
              </Text>
            </View>
            
            <View style={[styles.participantsBadge, { backgroundColor: sportColor + '20' }]}>
              <Text style={[styles.participantsBadgeText, { color: sportColor }]}>
                {currentParticipants}/{maxParticipants}
              </Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: isEventFull ? theme.colors.error : sportColor,
                    width: `${progressPercentage}%` 
                  }
                ]}
              />
            </View>
            
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {isEventFull 
                ? 'Etkinlik dolu' 
                : `${remainingSpots} kişilik yer kaldı`
              }
            </Text>
          </View>
        </View>
        
        {/* Location Section */}
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="location-outline" size={22} color={sportColor} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Konum
              </Text>
            </View>
          </View>
          
          <Text style={[styles.locationText, { color: theme.colors.text }]}>
            {currentEvent.location_name}
          </Text>
          
          {/* Distance Info */}
          {currentEvent.location_latitude && currentEvent.location_longitude && lastLocation && (
            <View style={styles.distanceContainer}>
              <DistanceInfo
                origin={`${lastLocation.latitude},${lastLocation.longitude}`}
                destination={`${currentEvent.location_latitude},${currentEvent.location_longitude}`}
                transportMode={selectedTransportMode}
                showDetails={false}
              />
            </View>
          )}
          
          {/* Map Buttons */}
          <View style={styles.mapButtons}>
            <TouchableOpacity 
              style={[styles.mapButton, { backgroundColor: sportColor }]}
              onPress={handleViewMap}
            >
              <Ionicons name="map-outline" size={18} color="white" />
              <Text style={styles.mapButtonText}>Haritada Gör</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.mapButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleOpenMap}
            >
              <Ionicons name="navigate-outline" size={18} color="white" />
              <Text style={styles.mapButtonText}>Yol Tarifi</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Description Section */}
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="document-text-outline" size={22} color={sportColor} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Etkinlik Açıklaması
              </Text>
            </View>
          </View>
          
          <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
            {currentEvent.description}
          </Text>
        </View>
        
        {/* Organizer Section */}
        {currentEvent.creator && (
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="person-outline" size={22} color={sportColor} />
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Organizatör
                </Text>
              </View>
            </View>
            
            <View style={styles.organizerContainer}>
              <View style={[styles.organizerAvatar, { backgroundColor: sportColor }]}>
                <Text style={styles.organizerAvatarText}>
                  {`${currentEvent.creator.first_name} ${currentEvent.creator.last_name}`.charAt(0).toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.organizerInfo}>
                <Text style={[styles.organizerName, { color: theme.colors.text }]}>
                  {`${currentEvent.creator.first_name} ${currentEvent.creator.last_name}`}
                </Text>
                <Text style={[styles.organizerRole, { color: theme.colors.textSecondary }]}>
                  {isEventCreator ? 'Siz (Etkinlik Organizatörü)' : 'Etkinlik Organizatörü'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Bottom Action Button */}
      <SafeAreaView style={[styles.bottomSection, { backgroundColor: theme.colors.cardBackground }]}>
        {isEventCreator ? (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            onPress={handleDeleteEvent}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Etkinliği Sil</Text>
              </>
            )}
          </TouchableOpacity>
        ) : isUserJoined ? (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            onPress={handleLeaveEvent}
            disabled={isLeaving}
          >
            {isLeaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="exit-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Etkinlikten Ayrıl</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { 
                backgroundColor: canJoin ? sportColor : theme.colors.textSecondary,
                opacity: canJoin ? 1 : 0.7
              }
            ]}
            onPress={handleJoinEvent}
            disabled={!canJoin || isJoining}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons 
                  name={canJoin ? (currentEvent.is_private ? "key-outline" : "checkmark-circle-outline") : "close-circle-outline"} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.actionButtonText}>
                  {isEventFull ? 'Etkinlik Dolu' : (currentEvent.is_private ? 'Davet Kodu ile Katıl' : 'Etkinliğe Katıl')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </SafeAreaView>
      
      {/* Modals */}
      {renderInvitationCodeModal()}
      {renderParticipantsModal()}
    </View>
  );
};

// Etkinlik durumuna göre renk
const getStatusColor = (status: string, eventDate: string | undefined, colors: any) => {
  // Tarihi geçmiş durumu için
  if (eventDate) {
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDateObj < today && status === 'active') {
      return colors.warning; // Uyarı rengi (turuncu gibi)
    }
  }
  
  switch (status) {
    case 'active':
      return colors.accent;
    case 'passive':
      return colors.textSecondary; // Pasif rengi (gri gibi)
    case 'canceled':
      return colors.error;
    case 'completed':
      return colors.success;
    case 'draft':
      return colors.textSecondary;
    default:
      return colors.text;
  }
};

// Etkinlik durumuna göre metin
const getStatusText = (status: string, eventDate?: string) => {
  // Etkinlik tarihi geçmiş mi kontrol et
  if (eventDate) {
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcı için saat ayarla
    
    if (eventDateObj < today && status === 'active') {
      return 'Tarihi Geçmiş';
    }
  }
  
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'passive':
      return 'Pasif';
    case 'canceled':
      return 'İptal Edildi';
    case 'completed':
      return 'Tamamlandı';
    case 'draft':
      return 'Taslak';
    default:
      return status;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Hero Section Styles
  heroSection: {
    height: 350,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageStyle: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  
  heroContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: 'flex-end',
  },
  
  sportBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  sportBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  heroTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 34,
  },
  
  heroInfo: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  heroInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroInfoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
  },
  privateBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
  },
  
  // Content Section Styles
  contentSection: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 30,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  
  participantsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  participantsBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  
  
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  distanceContainer: {
    marginBottom: 16,
  },
  mapButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  organizerRole: {
    fontSize: 14,
    marginTop: 2,
  },
  
  // Bottom Section Styles
  bottomSection: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Old styles that still needed
  titleContainer: {
    marginBottom: 16,
    paddingTop: 8,
  },
  sportText: {
    fontWeight: '600',
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 6,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  participantsCountBadge: {
    backgroundColor: colors.accent + '20',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  participantsCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  participantsStatus: {
    fontSize: 14,
    marginTop: 4,
    flex: 1,
  },
  participantsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  viewAllButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
  participantsList: {
    maxHeight: 400,
  },
  locationName: {
    fontSize: 16,
    marginBottom: 16,
  },
  mapBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 0.48,
  },
  mapBtnText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  creatorAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  creatorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  creatorSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rateButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  rateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
    alignItems: 'center',
  },
  lockIcon: {
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  joinButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  privateIcon: {
    marginRight: 4,
  },
  privateText: {
    fontWeight: '600',
    fontSize: 12,
  },
  privateEventInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  privateEventInfoText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  distanceInfoContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  transportModesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 16,
  },
  transportModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    marginHorizontal: 4,
  },
  transportModeLabel: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyParticipants: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  participantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    position: 'relative',
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  participantUsername: {
    fontSize: 14,
  },
  participantRole: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
});