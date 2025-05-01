import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '../../../navigation/ProfileStack';
import { create } from 'zustand';

// Tip tanımlamaları
type SessionHistoryNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

interface SessionDevice {
  id: string;
  deviceName: string;
  deviceType: DeviceType;
  os: string;
  browser?: string;
  location: string;
  lastActive: string;
  isCurrentDevice: boolean;
  platform?: 'ios' | 'android' | 'expo' | 'web';
}

// Zustand Store
interface SessionHistoryState {
  devices: SessionDevice[];
  isLoading: boolean;
  error: string | null;
  
  fetchDevices: () => Promise<void>;
  revokeDevice: (deviceId: string) => Promise<boolean>;
  clearError: () => void;
}

// Mock API istekleri (gerçek API entegre edilince değişecek)
const mockFetchDevices = async (): Promise<SessionDevice[]> => {
  return new Promise((resolve) => {
    // Sahte API gecikmesi
    setTimeout(() => {
      resolve([
        {
          id: '1',
          deviceName: 'Bu Cihaz',
          deviceType: 'mobile',
          os: 'iOS 16.5',
          browser: 'Safari',
          location: 'İstanbul, Türkiye',
          lastActive: '2023-08-23T14:32:10',
          isCurrentDevice: true,
          platform: 'ios'
        },
        {
          id: '2',
          deviceName: 'Android Cihaz',
          deviceType: 'mobile',
          os: 'Android 13',
          browser: 'Chrome',
          location: 'Ankara, Türkiye',
          lastActive: '2023-08-22T09:15:43',
          isCurrentDevice: false,
          platform: 'android'
        },
        {
          id: '3',
          deviceName: 'Bilgisayar',
          deviceType: 'desktop',
          os: 'Windows 11',
          browser: 'Chrome',
          location: 'İzmir, Türkiye',
          lastActive: '2023-08-20T18:04:22',
          isCurrentDevice: false
        },
        {
          id: '4',
          deviceName: 'Tablet',
          deviceType: 'tablet',
          os: 'iPadOS 16.5',
          browser: 'Safari',
          location: 'Bursa, Türkiye',
          lastActive: '2023-08-18T12:30:05',
          isCurrentDevice: false,
          platform: 'ios'
        }
      ]);
    }, 800);
  });
};

const mockRevokeDevice = async (deviceId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 600);
  });
};

// Zustand store oluşturma
export const useSessionHistoryStore = create<SessionHistoryState>((set, get) => ({
  devices: [],
  isLoading: false,
  error: null,
  
  fetchDevices: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Cihaz listesini API'den çek
      const devices = await mockFetchDevices();
      
      set({ 
        devices,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Cihaz listesi alınamadı';
      set({ 
        error: errorMessage,
        isLoading: false
      });
    }
  },
  
  revokeDevice: async (deviceId: string) => {
    try {
      // API'ye istek at ve cihazı kaldır
      const success = await mockRevokeDevice(deviceId);
      
      if (success) {
        // Başarılı olursa cihazı listeden kaldır
        const updatedDevices = get().devices.filter(device => device.id !== deviceId);
        set({ devices: updatedDevices });
        return true;
      }
      
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Cihaz kaldırılamadı';
      set({ error: errorMessage });
      return false;
    }
  },
  
  clearError: () => set({ error: null })
}));

// Zaman formatını düzenleyen yardımcı fonksiyon
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Şu anki zaman ile geçmiş zaman arasındaki farkı hesapla
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) {
    return 'Az önce';
  } else if (diffMins < 60) {
    return `${diffMins} dakika önce`;
  } else if (diffHours < 24) {
    return `${diffHours} saat önce`;
  } else if (diffDays < 7) {
    return `${diffDays} gün önce`;
  } else {
    // Tarih ve saat formatı: 23 Ağustos 2023, 14:32
    return date.toLocaleString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Cihaz tipi ikonlarını belirleyen yardımcı fonksiyon
const getDeviceIcon = (deviceType: DeviceType): any => {
  switch (deviceType) {
    case 'mobile':
      return 'phone-portrait-outline';
    case 'tablet':
      return 'tablet-portrait-outline';
    case 'desktop':
      return 'desktop-outline';
    default:
      return 'hardware-chip-outline';
  }
};

// Tekil cihaz bileşeni
interface DeviceItemProps {
  device: SessionDevice;
  onRevoke: (deviceId: string) => void;
  theme: any;
}

const DeviceItem: React.FC<DeviceItemProps> = ({ device, onRevoke, theme }) => {
  return (
    <View 
      style={[
        styles.deviceItem, 
        { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.border || theme.colors.textSecondary + '30',
          borderWidth: 1 
        }
      ]}
    >
      <View style={styles.deviceHeader}>
        <View style={styles.deviceTitleContainer}>
          <View style={[styles.deviceIconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
            <Ionicons name={getDeviceIcon(device.deviceType)} size={20} color={theme.colors.accent} />
          </View>
          <View style={styles.deviceTitleContent}>
            <Text style={[styles.deviceName, { color: theme.colors.text }]}>
              {device.deviceName}
              {device.isCurrentDevice && (
                <Text style={[styles.currentDevice, { color: theme.colors.accent }]}> (Bu cihaz)</Text>
              )}
            </Text>
            <Text style={[styles.deviceOs, { color: theme.colors.textSecondary }]}>
              {device.os}{device.browser ? ` • ${device.browser}` : ''}
            </Text>
          </View>
        </View>
        
        {!device.isCurrentDevice && (
          <TouchableOpacity 
            style={[styles.revokeButton, { borderColor: theme.colors.error + '50' }]}
            onPress={() => onRevoke(device.id)}
          >
            <Text style={[styles.revokeText, { color: theme.colors.error }]}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.deviceDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {device.location}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {formatDate(device.lastActive)}
            </Text>
          </View>
        </View>
        
        {device.platform && (
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="apps-outline" size={16} color={theme.colors.textSecondary} style={styles.detailIcon} />
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                Platform: {device.platform.charAt(0).toUpperCase() + device.platform.slice(1)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export const SessionSettings: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<SessionHistoryNavigationProp>();
  const { devices, isLoading, error, fetchDevices, revokeDevice, clearError } = useSessionHistoryStore();
  
  const [refreshing, setRefreshing] = useState(false);
  
  // Component mount olduğunda cihazları çek
  useEffect(() => {
    fetchDevices();
  }, []);
  
  // Hata durumunda uyarı göster
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearError();
    }
  }, [error]);
  
  // Yenileme işlemi
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    setRefreshing(false);
  };
  
  // Cihaz erişimini iptal etme
  const handleRevokeDevice = (deviceId: string) => {
    Alert.alert(
      'Oturumu Kapat',
      'Bu cihaz için oturumu kapatmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Oturumu Kapat',
          style: 'destructive',
          onPress: async () => {
            const success = await revokeDevice(deviceId);
            if (success) {
              Alert.alert('Başarılı', 'Cihaz oturumu kapatıldı');
            }
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['right', 'left']}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Giriş Yapılan Yerler
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
      >
        {/* Üst bilgi */}
        <View style={[
          styles.infoCard, 
          { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.border || theme.colors.textSecondary + '30',
            borderWidth: 1 
          }
        ]}>
          <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.accent} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Bu sayfada hesabınıza giriş yapılan cihazları görebilir ve şüpheli oturumları sonlandırabilirsiniz.
          </Text>
        </View>
        
        {/* Cihaz listesi başlığı */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Aktif Oturumlar
        </Text>
        
        {/* Yükleniyor */}
        {isLoading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        )}
        
        {/* Cihaz listesi */}
        {!isLoading && devices.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="laptop-outline" size={48} color={theme.colors.textSecondary + '50'} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aktif oturum bulunamadı
            </Text>
          </View>
        )}
        
        {devices.map(device => (
          <DeviceItem 
            key={device.id}
            device={device}
            onRevoke={handleRevokeDevice}
            theme={theme}
          />
        ))}
        
        {/* Güvenlik ipuçları */}
        <View style={[
          styles.securityTipsContainer, 
          { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.border || theme.colors.textSecondary + '30',
            borderWidth: 1 
          }
        ]}>
          <Text style={[styles.securityTipsTitle, { color: theme.colors.text }]}>
            Güvenlik İpuçları
          </Text>
          <View style={styles.securityTipItem}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.colors.accent} style={styles.tipIcon} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Tanımadığınız cihazlardan giriş yapıldığını fark ederseniz hemen şifrenizi değiştirin.
            </Text>
          </View>
          <View style={styles.securityTipItem}>
            <Ionicons name="shield-outline" size={18} color={theme.colors.accent} style={styles.tipIcon} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              İki faktörlü doğrulama kullanarak hesap güvenliğinizi artırabilirsiniz.
            </Text>
          </View>
          <View style={styles.securityTipItem}>
            <Ionicons name="log-out-outline" size={18} color={theme.colors.accent} style={styles.tipIcon} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Ortak kullanılan cihazlardan çıkış yapmayı unutmayın.
            </Text>
          </View>
        </View>
        
        {/* Tüm oturumları kapatma butonu */}
        <TouchableOpacity 
          style={[
            styles.logoutAllButton, 
            { 
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.error,
              borderWidth: 1 
            }
          ]}
          onPress={() => {
            Alert.alert(
              'Tüm Oturumları Kapat',
              'Bu cihaz dışındaki tüm cihazlarda oturumlarınız kapatılacak. Devam etmek istiyor musunuz?',
              [
                { text: 'İptal', style: 'cancel' },
                { 
                  text: 'Tüm Oturumları Kapat', 
                  style: 'destructive',
                  onPress: () => {
                    // Burada tüm oturumları kapatma işlemi yapılacak
                    // Mevcut cihaz hariç tüm cihazları filtreleyip her biri için revokeDevice çağrılabilir
                    devices
                      .filter(device => !device.isCurrentDevice)
                      .forEach(device => revokeDevice(device.id));
                    
                    Alert.alert('Başarılı', 'Tüm diğer cihazlardaki oturumlar kapatıldı');
                  }
                },
              ]
            );
          }}
        >
          <Ionicons 
            name="exit-outline" 
            size={20} 
            color={theme.colors.error} 
            style={styles.logoutAllIcon}
          />
          <Text style={[styles.logoutAllText, { color: theme.colors.error }]}>
            Diğer Tüm Cihazlardan Çıkış Yap
          </Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
  deviceItem: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deviceTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceTitleContent: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  currentDevice: {
    fontWeight: 'normal',
  },
  deviceOs: {
    fontSize: 13,
    marginTop: 2,
  },
  revokeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  revokeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  deviceDetails: {
    marginTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 4,
  },
  detailText: {
    fontSize: 13,
  },
  securityTipsContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  securityTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  securityTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  logoutAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  logoutAllIcon: {
    marginRight: 8,
  },
  logoutAllText: {
    fontSize: 15,
    fontWeight: '600',
  }
});
