import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useMapsStore } from '../../store/appStore/mapsStore';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useEventStore } from '../../store/eventStore/eventStore';

interface LocationPermissionModalProps {
  onComplete: () => void;
}

const { height } = Dimensions.get('window');

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ onComplete }) => {
  const { theme } = useThemeStore();
  const { initLocation, locationPermissionStatus } = useMapsStore();
  const { fetchAllEventsByDistance } = useEventStore();
  
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState<'initial' | 'requesting' | 'loading' | 'success' | 'denied'>('initial');
  const [error, setError] = useState<string | null>(null);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  useEffect(() => {
    // Modal gösterildiğinde alt kısımdan yukarı kaydırma animasyonu
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 30,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      // Modal kapatıldığında aşağı kaydırma animasyonu
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
    }
  }, [visible]);
  
  const requestLocation = async () => {
    try {
      setStep('requesting');
      setError(null);
      
      // Konum servislerini kontrol et
      const hasService = await Location.hasServicesEnabledAsync();
      if (!hasService) {
        setError('Konum hizmetleri etkinleştirilmemiş. Lütfen cihaz ayarlarınızdan konum hizmetlerini etkinleştirin.');
        setStep('denied');
        return;
      }
      
      // Konum izni iste
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== Location.PermissionStatus.GRANTED) {
        setError('Daha iyi bir deneyim için konum izni vermeniz gerekiyor.');
        setStep('denied');
        return;
      }
      
      setStep('loading');
      
      // Konumu başlat ve yakındaki etkinlikleri getir
      const location = await initLocation();
      
      if (location) {
        
        // Tüm etkinlikleri mesafeye göre sırala
        await fetchAllEventsByDistance();
        
        setStep('success');
        
        // Başarılı olduktan sonra kısa bir süre göster ve kapat
        setTimeout(() => {
          closeModal();
        }, 1000);
      } else {
        setError('Konum alınırken bir sorun oluştu. Lütfen tekrar deneyin.');
        setStep('denied');
      }
    } catch (err) {
      console.error('Konum izni hatası:', err);
      setError('Konum izni alınırken bir hata oluştu. Lütfen tekrar deneyin.');
      setStep('denied');
    }
  };
  
  const closeModal = () => {
    setVisible(false);
  };
  
  const skipLocation = () => {
    // Kullanıcı konum iznini atladığında da tüm etkinlikleri getir (mesafe olmadan)
    fetchAllEventsByDistance(false);
    closeModal();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { 
              backgroundColor: theme.colors.card,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          {/* İçerik */}
          <View style={styles.contentContainer}>
            {step === 'initial' && (
              <>
                <View style={styles.iconContainer}>
                  <Ionicons name="location" size={64} color={theme.colors.primary} />
                </View>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  Konumunuzu Paylaşın
                </Text>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                  Size yakındaki etkinlikleri gösterebilmemiz için konum izni vermeniz gerekiyor. Bu sayede etkinlikleri size olan mesafelerine göre sıralayabiliriz.
                </Text>
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: theme.colors.primary }]}
                  onPress={requestLocation}
                >
                  <Text style={styles.buttonText}>Konum İzni Ver</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.skipButton}
                  onPress={skipLocation}
                >
                  <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
                    Şimdilik Geç
                  </Text>
                </TouchableOpacity>
              </>
            )}
            
            {step === 'requesting' && (
              <>
                <View style={styles.iconContainer}>
                  <Ionicons name="locate" size={64} color={theme.colors.primary} />
                </View>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  Konum İzni Bekleniyor
                </Text>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                  Lütfen konum izni istek penceresini onaylayın.
                </Text>
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
              </>
            )}
            
            {step === 'loading' && (
              <>
                <View style={styles.iconContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  Konumunuz Alınıyor
                </Text>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                  Yakındaki etkinlikler belirleniyor, lütfen bekleyin...
                </Text>
              </>
            )}
            
            {step === 'success' && (
              <>
                <View style={styles.iconContainer}>
                  <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
                </View>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  Konum İzni Alındı
                </Text>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                  Artık size yakın etkinlikleri mesafeye göre sıralı olarak görebileceksiniz.
                </Text>
              </>
            )}
            
            {step === 'denied' && (
              <>
                <View style={styles.iconContainer}>
                  <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
                </View>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  Konum İzni Reddedildi
                </Text>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                  {error || 'Konum izni olmadan yakındaki etkinlikleri mesafeye göre sıralayamayız.'}
                </Text>
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: theme.colors.primary }]}
                  onPress={requestLocation}
                >
                  <Text style={styles.buttonText}>Tekrar Dene</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.skipButton}
                  onPress={skipLocation}
                >
                  <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
                    Konum İzni Olmadan Devam Et
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          
          {/* Kaydırma Çubuğu */}
          <View style={styles.dragBar} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 350,
    maxHeight: '80%',
  },
  dragBar: {
    width: 60,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    position: 'absolute',
    top: 10,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  iconContainer: {
    marginBottom: 24,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loader: {
    marginTop: 16,
  },
});

export default LocationPermissionModal; 