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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { useEventStore } from '../../../store/eventStore/eventStore';
import { useAuthStore } from '../../../store/userStore/authStore';
import { formatDate, formatTimeRange, formatDateTime } from '../../../utils/dateUtils';
import { colors } from '../../../constants/colors/colors';

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
  
  // İçerik yükleniyorsa
  if (isLoading && !currentEvent) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
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
  
  // Sayısal değerleri doğru formatta parse et
  const currentParticipants = parseInt(String(currentEvent.current_participants), 10) || 0;
  const maxParticipants = parseInt(String(currentEvent.max_participants), 10) || 1;
  
  const isEventCreator = currentEvent.creator_id === user?.id;
  const isEventFull = currentParticipants >= maxParticipants;
  const canJoin = !currentEvent.is_joined && !isEventFull && currentEvent.status === 'active';
  
  // İlerleme çubuğu yüzdesi (0-100 arasında sınırlandırılmış)
  const progressPercentage = Math.min(
    Math.max((currentParticipants / maxParticipants) * 100, 0), 
    100
  );
  
  // Kalan katılımcı sayısı
  const remainingSpots = Math.max(maxParticipants - currentParticipants, 0);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleShareEvent}>
            <Ionicons name="share-social-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          
          {isEventCreator && (
            <TouchableOpacity style={styles.iconButton} onPress={handleEditEvent}>
              <Ionicons name="create-outline" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Etkinlik Başlığı ve Status Badge */}
        <View style={styles.titleContainer}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { 
              backgroundColor: getStatusColor(currentEvent.status, theme.colors)
            }]}>
              <Text style={styles.statusText}>
                {getStatusText(currentEvent.status)}
              </Text>
            </View>
            
            <View style={[styles.sportBadge, { backgroundColor: theme.colors.accent + '20' }]}>
              <Text style={[styles.sportText, { color: theme.colors.accent }]}>
                {currentEvent.sport_id || 'Spor'}
              </Text>
            </View>
            
            {/* Özel etkinlik rozeti */}
            {currentEvent.is_private && (
              <View style={[styles.privateBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="lock-closed" size={12} color={theme.colors.primary} style={styles.privateIcon} />
                <Text style={[styles.privateText, { color: theme.colors.primary }]}>
                  Özel Etkinlik
                </Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {currentEvent.title}
          </Text>
          
          {/* Tarih ve Saat Bilgisi */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.accent} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                {formatDate(currentEvent.event_date)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={18} color={theme.colors.accent} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                {formatTimeRange(currentEvent.start_time, currentEvent.end_time)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Özel etkinlik bilgisi */}
        {currentEvent.is_private && !currentEvent.is_joined && !isEventCreator && (
          <View style={[styles.section, { 
            backgroundColor: theme.colors.primary + '10', 
            borderWidth: 1, 
            borderColor: theme.colors.primary + '30',
            marginBottom: 16
          }]}>
            <View style={styles.privateEventInfoContainer}>
              <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
              <Text style={[styles.privateEventInfoText, { color: theme.colors.text }]}>
                Bu özel bir etkinliktir. Katılmak için organizatörden aldığınız davet kodunu girmeniz gerekecektir.
              </Text>
            </View>
          </View>
        )}
        
        {/* Katılımcı Bilgisi */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={22} color={theme.colors.accent} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Katılımcılar
            </Text>
            <View style={styles.participantsCountBadge}>
              <Text style={styles.participantsCountText}>
                {currentParticipants}/{maxParticipants}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { backgroundColor: theme.colors.light }
              ]}
            >
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: isEventFull ? theme.colors.error : theme.colors.accent,
                    width: `${progressPercentage}%` 
                  }
                ]}
              />
            </View>
          </View>
          
          <Text style={[styles.participantsStatus, { color: theme.colors.textSecondary }]}>
            {isEventFull 
              ? 'Bu etkinliğin kontenjanı dolmuştur.' 
              : `${remainingSpots} kişilik yer kaldı`
            }
          </Text>
        </View>
        
        {/* Konum Bilgisi */}
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
        
        {/* Organizatör Bilgisi */}
        {currentEvent.creator_name && (
          <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={22} color={theme.colors.accent} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Organizatör
              </Text>
            </View>
            
            <View style={styles.creatorContainer}>
              {currentEvent.creator_avatar ? (
                <Image 
                  source={{ uri: currentEvent.creator_avatar }} 
                  style={styles.creatorAvatar}
                />
              ) : (
                <View style={[styles.creatorAvatarPlaceholder, { backgroundColor: theme.colors.accent }]}>
                  <Text style={styles.creatorAvatarText}>
                    {currentEvent.creator_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              
              <View style={styles.creatorInfo}>
                <Text style={[styles.creatorName, { color: theme.colors.text }]}>
                  {currentEvent.creator_name}
                </Text>
                <Text style={[styles.creatorSubtext, { color: theme.colors.textSecondary }]}>
                  {isEventCreator ? 'Siz (Etkinlik Organizatörü)' : 'Etkinlik Organizatörü'}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Etkinlik Açıklaması */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={22} color={theme.colors.accent} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Etkinlik Açıklaması
            </Text>
          </View>
          
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {currentEvent.description}
          </Text>
        </View>
        
        {/* Değerlendirme */}
        {currentEvent.average_rating !== undefined && (
          <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star-outline" size={22} color={theme.colors.accent} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Değerlendirme
              </Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star} 
                    name={star <= Math.round(currentEvent.average_rating || 0) ? "star" : "star-outline"} 
                    size={24} 
                    color="#FFD700" 
                    style={styles.starIcon}
                  />
                ))}
              </View>
              
              <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                {(currentEvent.average_rating || 0).toFixed(1)}/5.0
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.rateButton, { borderColor: theme.colors.accent }]}
              onPress={() => navigation.navigate('RateEvent', { eventId: currentEvent.id })}
            >
              <Text style={[styles.rateButtonText, { color: theme.colors.accent }]}>
                Bu Etkinliği Değerlendir
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Alt butonlar */}
      <SafeAreaView>
        <View style={[styles.footer, { 
          backgroundColor: theme.mode === 'dark' ? theme.colors.cardBackground : theme.colors.background,
          borderTopColor: theme.colors.border
        }]}>
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
          ) : currentEvent.is_joined ? (
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
                  backgroundColor: canJoin ? theme.colors.accent : theme.colors.dark,
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
        </View>
      </SafeAreaView>
      
      {/* Davet kodu modalı */}
      {renderInvitationCodeModal()}
    </SafeAreaView>
  );
};

// Etkinlik durumuna göre renk
const getStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'active':
      return colors.success;
    case 'canceled':
      return colors.error;
    case 'completed':
      return colors.info;
    case 'draft':
      return colors.warning;
    default:
      return colors.secondary;
  }
};

// Etkinlik durumuna göre metin
const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'canceled':
      return 'İptal Edildi';
    case 'completed':
      return 'Tamamlandı';
    case 'draft':
      return 'Taslak';
    default:
      return status;
  }
}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  titleContainer: {
    marginBottom: 16,
    paddingTop: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
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
  sportBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
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
  progressContainer: {
    marginVertical: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  participantsStatus: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
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
});