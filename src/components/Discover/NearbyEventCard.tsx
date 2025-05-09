import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ImageSourcePropType, ImageErrorEventData, NativeSyntheticEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useMapsStore } from '../../store/appStore/mapsStore';
import { ConfirmationModal } from '../common/ConfirmationModal';


// Spor kategorilerine göre internet URL'lerinden resim tanımları
const sportImageURLs: Record<string, string> = {
  futbol: 'https://images.unsplash.com/photo-1627834249219-048df1143a01?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  basketbol: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2980&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  tenis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=900&q=80',
  voleybol: 'https://images.unsplash.com/photo-1592656094267-764a45160876?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  yüzme: 'https://plus.unsplash.com/premium_photo-1701030722617-25087a8fe287?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  default: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=900&q=80',
};

// Spor kategorisini alarak görsel kaynağını döndüren yardımcı fonksiyon
export const getSportImageSource = (sportName: string): ImageSourcePropType => {
  if (!sportName) return { uri: sportImageURLs.default };
  
  const sport = sportName.toLowerCase();
  
  if (sport.includes('futbol')) return { uri: sportImageURLs.futbol };
  if (sport.includes('basket')) return { uri: sportImageURLs.basketbol };
  if (sport.includes('tenis')) return { uri: sportImageURLs.tenis };
  if (sport.includes('voleybol')) return { uri: sportImageURLs.voleybol };
  if (sport.includes('yüzme')) return { uri: sportImageURLs.yüzme };
  
  return { uri: sportImageURLs.default };
};

// Spor kategorisine göre tag rengini döndüren yardımcı fonksiyon
export const getSportTagColor = (sportName: string): string => {
  if (!sportName) return '#2196F3';
  
  const sport = sportName.toLowerCase();
  if (sport.includes('futbol')) return '#4CAF50';
  if (sport.includes('basket')) return '#F44336';
  if (sport.includes('tenis')) return '#FF9800';
  if (sport.includes('voleybol')) return '#9C27B0';
  return '#2196F3';
};

// Spor kategorisine göre icon adını döndüren yardımcı fonksiyon
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
  const [isJoined, setIsJoined] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [isLoadingDistance, setIsLoadingDistance] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const { lastLocation, calculateDistance } = useMapsStore();

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
          console.log('Konum bilgisi bulundu. Mesafe hesaplanıyor...');
          const origin = `${lastLocation.latitude},${lastLocation.longitude}`;
          const destination = `${event.location_latitude},${event.location_longitude}`;
          
          // MapsStore'dan mesafe hesaplama fonksiyonunu kullan
          const result = await calculateDistance(origin, destination);
          
          if (result && result.distance) {
            console.log('Mesafe başarıyla hesaplandı:', result.distance.text);
            setDistance(result.distance.text);
            setDuration(result.duration.text);
          } else {
            console.warn('Mesafe hesaplanamadı, yedek yöntemlere geçiliyor...');
            // Mesafe hesaplanamazsa, distance_info objesine bakabiliriz
            if (event.distance_info && event.distance_info.distance) {
              const distanceKm = event.distance_info.distance / 1000; // metre -> km
              console.log('distance_info kullanılarak mesafe hesaplandı:', distanceKm.toFixed(1));
              setDistance(`${distanceKm.toFixed(1)} km`);
              
              // Süre bilgisi de varsa
              if (event.distance_info.duration) {
                const minutes = Math.floor(event.distance_info.duration / 60);
                setDuration(`${minutes} dk`);
              }
            } else if (event.distance) {
              // doğrudan event üzerinde distance değeri varsa
              console.log('event.distance kullanılarak mesafe hesaplandı:', event.distance.toFixed(1));
              setDistance(`${event.distance.toFixed(1)} km`);
            } else {
              console.error('Hiçbir mesafe verisi bulunamadı');
              setDistance('Mesafe hesaplanamadı');
            }
          }
        } else {
          console.warn('Kullanıcı konumu bulunamadı, alternatif mesafe verilerine bakılıyor...');
          // Kullanıcının konumu yoksa, event üzerinde distance varsa onu kullan
          if (event.distance_info && event.distance_info.distance) {
            const distanceKm = event.distance_info.distance / 1000; // metre -> km
            console.log('distance_info kullanılarak mesafe hesaplandı:', distanceKm.toFixed(1));
            setDistance(`${distanceKm.toFixed(1)} km`);
          } else if (event.distance) {
            console.log('event.distance kullanılarak mesafe hesaplandı:', event.distance.toFixed(1));
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

  const handleJoinEvent = () => {
    setIsJoined(true);
    // Burada API'ye istek gönderme işlemi yapılacak
    console.log('Etkinliğe katılım isteği gönderildi: ', event.title);
  };

  const handleCancelJoin = () => {
    setIsModalVisible(true);
  };

  const confirmCancelJoin = () => {
    setIsJoined(false);
    // Burada API'ye katılım iptal edildiğini bildiren istek gönderilecek
    console.log('Etkinliğe katılım iptal edildi: ', event.title);
    setIsModalVisible(false);
  };

  // Kategori görselini ve tag rengini belirleme
  const sportImage = imageError ? { uri: sportImageURLs.default } : getSportImageSource(event.sport.name);
  const tagColor = getSportTagColor(event.sport.name);
  const sportIconName = getSportIcon(event.sport.name);

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Spor Kategori Resmi */}
        <View style={styles.imageContainer}>
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
                color="white" 
              />
            </View>
          )}
          
          {/* Spor Etiketi */}
          <View 
            style={[
              styles.tag, 
              { backgroundColor: tagColor }
            ]}
          >
            <Text style={styles.tagText}>{event.sport.name}</Text>
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          {/* Etkinlik Başlığı */}
          <Text 
            style={[styles.title, { color: theme.colors.text }]} 
            numberOfLines={1}
          >
            {event.title}
          </Text>

          {/* Oluşturucu */}
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
            <Text 
              style={[styles.infoText, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {event.creator.first_name} {event.creator.last_name}
            </Text>
          </View>

          {/* Tarih ve Saat */}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
            <Text 
              style={[styles.infoText, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {formatEventDate(new Date(event.event_date))}, {formatEventTime(new Date(event.start_time))}
            </Text>
          </View>

          {/* Konum */}
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
            <Text 
              style={[styles.infoText, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {event.location_name}
            </Text>
          </View>

          {/* Mesafe */}
          <View style={styles.infoRow}>
            <Ionicons name="navigate-outline" size={16} color={theme.colors.textSecondary} />
            {isLoadingDistance ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 5 }} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Text 
                  style={[styles.infoText, { color: theme.colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {distance || "Mesafe bilgisi yok"}
                </Text>
                {duration && (
                  <Text 
                    style={[styles.infoText, { color: theme.colors.textSecondary, marginLeft: 4, opacity: 0.7 }]}
                    numberOfLines={1}
                  >
                    ({duration})
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Katılımcılar */}
          <View style={styles.participantsRow}>
            <Ionicons name="people-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.participantsText, { color: theme.colors.textSecondary }]}>
              {event.participant_count}/{event.max_participants}
            </Text>
          </View>
        </View>

        {/* Katıl/İptal Butonu */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.joinButton, 
              isJoined 
                ? { backgroundColor: theme.colors.accent }
                : { backgroundColor: 'transparent', borderColor: theme.colors.accent, borderWidth: 1 }
            ]}
            onPress={isJoined ? handleCancelJoin : handleJoinEvent}
          >
            <Text 
              style={[
                styles.joinButtonText,
                { color: isJoined ? 'white' : theme.colors.accent }
              ]}
            >
              {isJoined ? 'Katıldın' : 'Katıl'}
            </Text>
          </TouchableOpacity>
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
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    paddingBottom: 8,
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
});