import React, { useEffect, useState } from 'react';
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
  Share
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { useEventStore } from '../../../store/eventStore/eventStore';
import { useAuthStore } from '../../../store/userStore/authStore';
import { formatDate, formatTimeRange, formatDateTime } from '../../../utils/dateUtils';

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
    clearMessage
  } = useEventStore();
  
  // Aksiyon durumları
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Component mount edildiğinde etkinlik detayını getir
  useEffect(() => {
    loadEventDetail();
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
    
    setIsJoining(true);
    const success = await joinEvent(eventId);
    setIsJoining(false);
    
    if (success) {
      loadEventDetail();
    }
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
            
            if (success) {
              loadEventDetail();
            }
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
    
    const { location_latitude, location_longitude, location_name } = currentEvent;
    const url = `https://maps.google.com/maps?q=${location_latitude},${location_longitude}`;
    Linking.openURL(url);
  };

  // Harita ekranına git
  const handleViewMap = () => {
    if (!currentEvent) return;
    navigation.navigate('EventMapScreen', { eventId: currentEvent.id });
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
  
  const isEventCreator = currentEvent.creator_id === user?.id;
  const isEventFull = currentEvent.current_participants >= currentEvent.max_participants;
  const canJoin = !currentEvent.is_joined && !isEventFull && currentEvent.status === 'active';
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Header Bölümü */}
      <View style={styles.headerContainer}>
        <View
          style={[styles.headerGradient, { backgroundColor: theme.colors.primary }]}
        >
          <SafeAreaView style={styles.headerSafeArea}>
            <View style={styles.headerControls}>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={handleGoBack}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={handleShareEvent}
                >
                  <Ionicons name="share-social-outline" size={24} color="white" />
                </TouchableOpacity>
                
                {isEventCreator && (
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={handleEditEvent}
                  >
                    <Ionicons name="create-outline" size={24} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={styles.headerContent}>
              <View style={[styles.statusBadge, { 
                backgroundColor: getStatusColor(currentEvent.status, theme.colors)
              }]}>
                <Text style={styles.statusText}>
                  {getStatusText(currentEvent.status)}
                </Text>
              </View>

              <Text style={styles.headerTitle} numberOfLines={2}>
                {currentEvent.title}
              </Text>
              
              <View style={styles.headerMeta}>
                <View style={styles.dateTimeContainer}>
                  <Ionicons name="calendar" size={18} color="white" />
                  <Text style={styles.dateTimeText}>
                    {formatDate(currentEvent.event_date)}
                  </Text>
                </View>
                
                <View style={styles.dateTimeContainer}>
                  <Ionicons name="time" size={18} color="white" />
                  <Text style={styles.dateTimeText}>
                    {formatTimeRange(currentEvent.start_time, currentEvent.end_time)}
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Katılımcı Durumu Kart */}
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.participantsHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Katılımcılar
            </Text>
            
            <View style={styles.participantsCount}>
              <Text style={[styles.participantsText, { color: theme.colors.text }]}>
                {currentEvent.current_participants}/{currentEvent.max_participants}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { backgroundColor: theme.colors.border }
              ]}
            >
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: isEventFull ? theme.colors.error : theme.colors.success,
                    width: `${(currentEvent.current_participants / currentEvent.max_participants) * 100}%` 
                  }
                ]}
              />
            </View>
          </View>
          
          <Text style={[styles.participantsStatus, { color: theme.colors.textSecondary }]}>
            {isEventFull 
              ? 'Bu etkinliğin kontenjanı dolmuştur.' 
              : `${currentEvent.max_participants - currentEvent.current_participants} kişilik yer kaldı`
            }
          </Text>
        </View>
        
        {/* Konum Kart */}
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={22} color={theme.colors.accent} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Konum
            </Text>
          </View>
          
          <Text style={[styles.locationName, { color: theme.colors.text }]}>
            {currentEvent.location_name}
          </Text>
          
          <View style={styles.mapButtons}>
            <TouchableOpacity 
              style={[styles.mapButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleViewMap}
            >
              <Ionicons name="map-outline" size={18} color="white" />
              <Text style={styles.mapButtonText}>Haritada Gör</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.mapButton, { backgroundColor: theme.colors.accent }]}
              onPress={handleOpenMap}
            >
              <Ionicons name="navigate-outline" size={18} color="white" />
              <Text style={styles.mapButtonText}>Yol Tarifi</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Etkinlik Oluşturucu Kart */}
        {currentEvent.creator_name && (
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={22} color={theme.colors.accent} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Etkinlik Sahibi
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
        
        {/* Etkinlik Açıklaması Kart */}
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={22} color={theme.colors.accent} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Etkinlik Detayları
            </Text>
          </View>
          
          <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
            {currentEvent.description}
          </Text>
        </View>
        
        {/* Değerlendirme Kart */}
        {currentEvent.average_rating !== undefined && (
          <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="star" size={22} color="#FFD700" />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Etkinlik Değerlendirmesi
              </Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star} 
                    name={star <= Math.round(currentEvent.average_rating as any) ? "star" : "star-outline"} 
                    size={30} 
                    color="#FFD700" 
                  />
                ))}
              </View>
              
              <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                {currentEvent.average_rating.toFixed(1)}/5.0
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.rateButton, { borderColor: theme.colors.accent }]}
              onPress={() => navigation.navigate('RateEvent', { eventId: currentEvent.id })}
            >
              <Text style={[styles.rateButtonText, { color: theme.colors.accent }]}>
                Değerlendirme Yap
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Alt butonlar */}
      <View style={[styles.footer, { 
        backgroundColor: theme.mode === 'dark' ? theme.colors.cardBackground : 'rgba(255, 255, 255, 0.95)',
        borderTopColor: theme.colors.border
      }]}>
        {isEventCreator ? (
          <TouchableOpacity 
            style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
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
            style={[styles.leaveButton, { backgroundColor: theme.colors.error }]}
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
              styles.joinButton, 
              { 
                backgroundColor: canJoin ? theme.colors.accent : theme.mode === 'dark' ? '#555555' : theme.colors.silver,
                opacity: canJoin ? 1 : 0.6
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
                  name={isEventFull ? "close-circle-outline" : "checkmark-circle-outline"} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.actionButtonText}>
                  {isEventFull ? 'Etkinlik Dolu' : 'Etkinliğe Katıl'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
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
  headerContainer: {
    width: '100%',
    height: 220,
  },
  headerGradient: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  headerSafeArea: {
    flex: 1,
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 8,
  },
  headerMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  dateTimeText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  participantsStatus: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'right',
  },
  locationName: {
    fontSize: 16,
    marginBottom: 12,
  },
  mapButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  mapButtonText: {
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
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rateButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  rateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
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
});