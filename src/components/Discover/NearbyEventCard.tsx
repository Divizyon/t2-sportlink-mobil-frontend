import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useMapsStore } from '../../store/appStore/mapsStore';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface NearbyEventCardProps {
  event: any;
  onPress?: () => void;
}

export const NearbyEventCard: React.FC<NearbyEventCardProps> = ({ event, onPress }) => {
  const { theme } = useThemeStore();
  const [isJoined, setIsJoined] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [isLoadingDistance, setIsLoadingDistance] = useState(false);
  
  const { lastLocation, calculateDistance } = useMapsStore();

  const getSportIcon = (sportName: string) => {
    const sport = sportName.toLowerCase();
    if (sport.includes('futbol')) return 'football-outline';
    if (sport.includes('basket')) return 'basketball-outline';
    if (sport.includes('tenis')) return 'tennisball-outline';
    if (sport.includes('voleybol')) return 'baseball-outline';
    return 'fitness-outline';
  };

  // Etkinliğin mesafesini hesapla
  useEffect(() => {
    const fetchDistance = async () => {
      if (!lastLocation || !event.location_latitude || !event.location_longitude) {
        return;
      }
      
      setIsLoadingDistance(true);
      
      try {
        const origin = `${lastLocation.latitude},${lastLocation.longitude}`;
        const destination = `${event.location_latitude},${event.location_longitude}`;
        
        const result = await calculateDistance(origin, destination);
        
        if (result && result.distance) {
          setDistance(result.distance.text);
        }
      } catch (error) {
        console.error('Mesafe hesaplanırken hata:', error);
      } finally {
        setIsLoadingDistance(false);
      }
    };
    
    fetchDistance();
  }, [lastLocation, event]);

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

  // Tag rengini belirle
  const getTagColor = (sportName: string) => {
    const sport = sportName.toLowerCase();
    if (sport.includes('futbol')) return '#4CAF50';
    if (sport.includes('basket')) return '#F44336';
    if (sport.includes('tenis')) return '#FF9800';
    if (sport.includes('voleybol')) return '#9C27B0';
    return '#2196F3';
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

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.contentContainer}>
          {/* Spor Etiketi */}
          <View 
            style={[
              styles.tag, 
              { backgroundColor: getTagColor(event.sport.name) }
            ]}
          >
            <Text style={styles.tagText}>{event.sport.name}</Text>
          </View>
          
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
            <Text 
              style={[styles.infoText, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {isLoadingDistance 
                ? "Mesafe hesaplanıyor..." 
                : distance 
                  ? `${distance} uzaklıkta` 
                  : "Mesafe bilgisi yok"}
            </Text>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
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