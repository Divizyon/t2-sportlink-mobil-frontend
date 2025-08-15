import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ImageSourcePropType, ImageErrorEventData, NativeSyntheticEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useMapsStore } from '../../store/appStore/mapsStore';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useEventStore } from '../../store/eventStore/eventStore';


// Sport görselleri - assets/sportImage altındaki tüm görselleri ekle
const footballImage = require('../../../assets/sportImage/football.png');
const basketballImage = require('../../../assets/sportImage/basketball.png');
const tennisImage = require('../../../assets/sportImage/tennis.png');
const volleyballImage = require('../../../assets/sportImage/volleyball.png');
const walkImage = require('../../../assets/sportImage/walk.png');

// Spor kategorilerine göre lokal görsel tanımları
const sportImages: Record<string, any> = {
  futbol: footballImage,
  football: footballImage,
  basketbol: basketballImage,
  basketball: basketballImage,
  tenis: tennisImage,
  tennis: tennisImage,
  voleybol: volleyballImage,
  volleyball: volleyballImage,
  yürüyüş: walkImage,
  walk: walkImage,
  default: footballImage, // Default olarak futbol görseli
};

// Spor kategorisini alarak görsel kaynağını döndüren yardımcı fonksiyon
export const getSportImageSource = (sportName: string): ImageSourcePropType => {
  if (!sportName) return sportImages.default;
  const sport = sportName.toLowerCase();
  if (sport.includes('yürü') || sport.includes('walk')) return sportImages.yürüyüş;
  if (sport.includes('futbol') || sport.includes('football')) return sportImages.futbol;
  if (sport.includes('basket')) return sportImages.basketbol;
  if (sport.includes('tenis') || sport.includes('tennis')) return sportImages.tenis;
  if (sport.includes('voley') || sport.includes('volley')) return sportImages.voleybol;
  return sportImages.default;
};

  // Spor kategorisine göre tag rengini döndüren yardımcı fonksiyon
export const getSportTagColor = (sportName: string): string => {
  if (!sportName) return '#2196F3';
  
  const sport = sportName.toLowerCase();
  if (sport.includes('yürü') || sport.includes('walk')) return '#479B6E';
  if (sport.includes('futbol') || sport.includes('football')) return '#64BF77';
  if (sport.includes('basket')) return '#E4843D';
  if (sport.includes('yüz') || sport.includes('swim')) return '#27BCE7';
  if (sport.includes('tenis')) return '#FF9800';
  if (sport.includes('voleybol')) return '#9C27B0';
  return '#64BF77';
};// Spor kategorisine göre icon adını döndüren yardımcı fonksiyon
// Ionicons'un kabul ettiği 'type' tiplerinden birini dönmeli
export const getSportIcon = (
  sportName: string
): "football-outline" | "basketball-outline" | "tennisball-outline" | "baseball-outline" | "fitness-outline" => {
  if (!sportName) return 'fitness-outline';
  
  const sport = sportName.toLowerCase();
  if (sport.includes('futbol')) return 'football-outline';
  if (sport.includes('basket')) return 'basketball-outline';
  if (sport.includes('tenis')) return 'tennisball-outline';
  if (sport.includes('voleybol')) return 'baseball-outline';
  return 'fitness-outline';
};

interface NearbyEventCardProps {
  event: any;
  onPress?: () => void;
}

export const NearbyEventCard: React.FC<NearbyEventCardProps> = ({ event, onPress }) => {
  const { theme } = useThemeStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [isLoadingDistance, setIsLoadingDistance] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  
  const { lastLocation, calculateDistance } = useMapsStore();
  const { joinEvent, leaveEvent } = useEventStore();

  // Görsel yüklenemediğinde hata yakalama
  const handleImageError = (error: NativeSyntheticEvent<ImageErrorEventData>) => {
    console.warn('Görsel yüklenemedi:', error.nativeEvent.error);
    setImageError(true);
    setImageLoading(false);
  };

  // Görsel yüklendiğinde
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Etkinliğin mesafesini hesapla
  useEffect(() => {
    const fetchDistance = async () => {
      // Etkinliğin konum bilgisi yoksa hesaplama yapma
      if (!event.location_latitude || !event.location_longitude) {
        setDistance('Konum bilgisi yok');
        setIsLoadingDistance(false);
        return;
      }
      
      setIsLoadingDistance(true);
      
      try {
        // Kullanıcının konumu varsa, gerçek mesafeyi hesapla
        if (lastLocation) {
          const origin = `${lastLocation.latitude},${lastLocation.longitude}`;
          const destination = `${event.location_latitude},${event.location_longitude}`;
          
          // MapsStore'dan mesafe hesaplama fonksiyonunu kullan
          const result = await calculateDistance(origin, destination);
          
          if (result && result.distance) {
            setDistance(result.distance.text);
            setDuration(result.duration.text);
          } else {
            console.warn('Mesafe hesaplanamadı, yedek yöntemlere geçiliyor...');
            // Mesafe hesaplanamazsa, distance_info objesine bakabiliriz
            if (event.distance_info && event.distance_info.distance) {
              const distanceKm = event.distance_info.distance / 1000; // metre -> km
              setDistance(`${distanceKm.toFixed(1)} km`);
              
              // Süre bilgisi de varsa
              if (event.distance_info.duration) {
                const minutes = Math.floor(event.distance_info.duration / 60);
                setDuration(`${minutes} dk`);
              }
            } else if (event.distance) {
              // doğrudan event üzerinde distance değeri varsa
              setDistance(`${event.distance.toFixed(1)} km`);
            } else {
              setDistance('Mesafe hesaplanamadı');
            }
          }
        } else {
          console.warn('Kullanıcı konumu bulunamadı, alternatif mesafe verilerine bakılıyor...');
          // Kullanıcının konumu yoksa, event üzerinde distance varsa onu kullan
          if (event.distance_info && event.distance_info.distance) {
            const distanceKm = event.distance_info.distance / 1000; // metre -> km
            setDistance(`${distanceKm.toFixed(1)} km`);
          } else if (event.distance) {
            setDistance(`${event.distance.toFixed(1)} km`);
          } else {
            setDistance('Konum izni gerekli');
          }
        }
      } catch (error) {
        console.error('Mesafe hesaplanırken hata:', error);
        setDistance('Hesaplanırken hata oluştu');
      } finally {
        setIsLoadingDistance(false);
      }
    };
    
    fetchDistance();
  }, [lastLocation, event, calculateDistance]);

  // Tarih ve saat formatları
  const formatEventDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Yarın';
    } else {
      // Basit Türkçe gün formatı
      const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      return days[date.getDay()];
    }
  };

  const formatEventTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Etkinliğe katılma işlemi için güncelleme
  const handleJoinEvent = async (e: any) => {
    // Kart yönlendirmesini engelle
    e.stopPropagation();
    
    setIsJoining(true);
    try {
      // Store'dan joinEvent fonksiyonunu çağır
      await joinEvent(event.id);
    } catch (error) {
      console.error('Etkinliğe katılma hatası:', error);
    } finally {
      setIsJoining(false);
    }
  };

  // Katılımı iptal et modalını göster
  const handleCancelJoin = (e: any) => {
    // Kart yönlendirmesini engelle
    e.stopPropagation();
    setIsModalVisible(true);
  };

  // Katılımı iptal et
  const confirmCancelJoin = async () => {
    try {
      // Store'dan leaveEvent fonksiyonunu çağır
      await leaveEvent(event.id);
    } catch (error) {
      console.error('Etkinlikten ayrılma hatası:', error);
    } finally {
      setIsModalVisible(false);
    }
  };

  // Etkinlik dolu mu kontrol et
  const isEventFull = event.current_participants >= event.max_participants;

  // Kategori görselini ve tag rengini belirleme
  const sportImage = imageError ? sportImages.default : getSportImageSource(event.sport.name);
  const tagColor = getSportTagColor(event.sport.name);
  const sportIconName = getSportIcon(event.sport.name);

  // KART TASARIMI: Üstte spor görseli, altında başlık, katılımcı, tarih, saat, lokasyon ve katıl butonu
  return (
    <>
      <TouchableOpacity
        style={[styles.container, { 
          backgroundColor: theme.colors.cardBackground, 
          borderColor: getSportTagColor(event.sport.name), 
          borderWidth: 4 // Border kalınlığını artırdık
        }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Spor Kategori Resmi */}
        <View style={[styles.imageContainer, { backgroundColor: '#E6F4EA' }]}> 
          {imageLoading && (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
          )}
          <Image 
            source={sportImage}
            style={styles.sportImage}
            resizeMode="cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {/* Spor İkonu (Resim yüklenemediğinde veya hata durumunda görünür) */}
          {imageError && (
            <View style={styles.iconFallbackContainer}>
              <Ionicons
                name={sportIconName} 
                size={48} 
                color="#4CAF50" 
              />
            </View>
          )}
        </View>
        <View style={styles.contentContainer}>
          {/* Etkinlik Başlığı ve Katılımcı Sayısı */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={[styles.title, { color: '#222', fontWeight: 'bold', fontSize: 17, flex: 1, marginRight: 8 }]} numberOfLines={1}>
              {event.sport.name} Etkinliği
            </Text>
            {/* Katılımcı sayısı badgesi - etkinlik adının sağında */}
            <View style={{
              backgroundColor: '#4A90E2',
              borderRadius: 15,
              paddingHorizontal: 10,
              paddingVertical: 4,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name="people-outline" size={14} color="white" />
              <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 4, fontSize: 12 }}>
                {event.participant_count || 0}/{event.max_participants || 10}
              </Text>
            </View>
          </View>
          
          {/* Tarih */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="calendar-outline" size={16} color="#222" />
            <Text style={{ color: '#222', marginLeft: 4, fontSize: 14 }}>
              {formatEventDate(new Date(event.event_date))}
            </Text>
          </View>
          
          {/* Saat */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="time-outline" size={16} color="#222" />
            <Text style={{ color: '#222', marginLeft: 4, fontSize: 14 }}>
              {formatEventTime(new Date(event.start_time))}
            </Text>
          </View>
          
          {/* Lokasyon ve Katıl Butonu */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
              <Ionicons name="location-outline" size={16} color="#222" />
              <Text style={{ color: '#222', marginLeft: 4, fontSize: 14 }} numberOfLines={1}>
                {event.location_name && event.location_name.length > 15 
                  ? event.location_name.substring(0, 15) + '...' 
                  : event.location_name}
              </Text>
            </View>
            
            {/* Katıl Butonu - konum bilgisinin sağında */}
            {event.is_joined ? (
              <TouchableOpacity 
                style={{ 
                  borderWidth: 2, 
                  borderColor: getSportTagColor(event.sport.name), 
                  backgroundColor: getSportTagColor(event.sport.name), 
                  borderRadius: 20, 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  flexDirection: 'row', 
                  alignItems: 'center' 
                }}
                onPress={handleCancelJoin}
                disabled={isJoining}
              >
                <Ionicons name="checkmark-circle-outline" size={14} color="white" style={{ marginRight: 2 }} />
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Detay</Text>
              </TouchableOpacity>
            ) : isEventFull ? (
              <View style={{ 
                borderWidth: 2, 
                borderColor: '#aaa', 
                borderRadius: 20, 
                paddingHorizontal: 12, 
                paddingVertical: 6 
              }}>
                <Text style={{ color: '#aaa', fontWeight: 'bold', fontSize: 13 }}>Dolu</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={{ 
                  borderWidth: 2, 
                  borderColor: getSportTagColor(event.sport.name), 
                  borderRadius: 20, 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  flexDirection: 'row', 
                  alignItems: 'center' 
                }}
                onPress={handleJoinEvent}
                disabled={isJoining}
              >
                {isJoining ? (
                  <ActivityIndicator size="small" color={getSportTagColor(event.sport.name)} />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={14} color={getSportTagColor(event.sport.name)} style={{ marginRight: 2 }} />
                    <Text style={{ color: getSportTagColor(event.sport.name), fontWeight: 'bold', fontSize: 13 }}>Detay</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
      <ConfirmationModal
        visible={isModalVisible}
        title="Katılımı İptal Et"
        message={`"${event.title}" etkinliğine katılımınızı iptal etmek istediğinize emin misiniz?`}
        confirmText="İptal Et"
        cancelText="Vazgeç"
        confirmIcon="calendar-outline"
        isDestructive={true}
        onConfirm={confirmCancelJoin}
        onCancel={() => setIsModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,

    overflow: 'hidden',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sportImage: {
    width: '100%',
    height: '100%',
  },
  iconFallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 16,
  },
  tag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  participantsText: {
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    width: '100%',
    padding: 16,
    paddingTop: 8,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    height: 36,
    width: '100%',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 4
  }
});