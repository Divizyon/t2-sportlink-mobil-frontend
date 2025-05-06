import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  NativeModules
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '../../../navigation/ProfileStack';
import { create } from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getConfigValuesFromStore } from '../../../store/appStore/configStore';
import { Platform } from 'react-native';
import { tokenManager } from '../../../utils/tokenManager';
import { useDeviceStore } from '../../../store/userStore/deviceStore';
import { useAuthStore } from '../../../store/userStore/authStore';

// Device token'ı için AsyncStorage anahtarı
const DEVICE_TOKEN_KEY = '@device_token';

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
  token?: string; // Cihaz token bilgisi
}

interface ApiDeviceResponse {
  success: boolean;
  data: {
    user: {
      created_at: string;
      updated_at: string;
      username: string;
      first_name: string;
      last_name: string;
    };
    deviceCount: number;
    devices: Array<{
      id: string;
      platform: string;
      created_at: string;
      updated_at: string;
      token?: string;
      lastActive?: string;
      deviceInfo?: {
        os?: string;
        browser?: string;
        deviceName?: string;
        location?: string;
      };
    }>;
  };
}

// Zustand Store
interface SessionHistoryState {
  devices: SessionDevice[];
  isLoading: boolean;
  error: string | null;
  
  fetchDevices: () => Promise<void>;
  revokeDevice: (deviceId: string, token?: string) => Promise<boolean>;
  clearError: () => void;
}

// API istekleri
const fetchDevicesFromApi = async (): Promise<SessionDevice[]> => {
  try {
    // Token'ı tokenManager'dan al
    const token = await tokenManager.getToken();
    
    if (!token) {
      console.warn('Token bulunamadı, oturum açılması gerekiyor');
      return []; // Token yoksa boş dizi dön
    }
    
    // API base URL'ini configStore'dan al
    const { apiBaseUrl } = getConfigValuesFromStore();
    
    // Cihaz adını al
    const currentDeviceName = await getDeviceName();
    console.log("Mevcut cihaz adı:", currentDeviceName);
    
    // Network hatalarını önlemek için timeout ayarlı API isteği
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout
    
    try {
      // API isteği - doğru endpoint: my-devices
      const response = await axios.get<ApiDeviceResponse>(`${apiBaseUrl}/devices/my-devices`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Başarılı yanıtta timeout'u temizle
      
      if (response.status === 200 && response.data.success) {
        // DeviceStore'dan mevcut cihaz token'ını al
        const currentDeviceToken = useDeviceStore.getState().deviceToken;
        
        console.log("Cihaz tespit için mevcut deviceToken:", currentDeviceToken);
        
        // Eğer mevcut token yoksa, yeni bir token oluştur
        if (!currentDeviceToken) {
          await useDeviceStore.getState().generateDeviceToken();
          console.log("Yeni token oluşturuldu:", useDeviceStore.getState().deviceToken);
        }
        
        // Platformu tespit et (ios, android, web)
        const currentPlatform = Platform.OS;
        console.log("Mevcut platform:", currentPlatform);
        
        // API yanıtını incele
        console.log("API'den gelen cihaz sayısı:", response.data.data.devices.length);
        
        // Cihaz token'larını logla
        response.data.data.devices.forEach((device, index) => {
          console.log(`Cihaz ${index + 1} token:`, device.token, "platform:", device.platform);
        });
        
        // API yanıtını SessionDevice[] formatına dönüştür
        return response.data.data.devices.map(device => {
          // Cihazın mevcut cihaz olup olmadığını belirle:
          // 1. İlk kontrol: DeviceStore'dan alınan token bilgisi ile eşleşiyorsa mevcut cihaz
          // 2. İkinci kontrol: Platformlar eşleşiyorsa ve tarih en yeniyse
          // 3. Son çare: En son güncellenen cihazı aktif say
          
          // API'den token değerinin gelip gelmediğini kontrol et
          if (!device.token) {
            console.warn(`API'den token değeri gelmiyor, Cihaz ID: ${device.id}, platform: ${device.platform}`);
          } else {
            console.log(`API'den token değeri başarıyla alındı, Cihaz ID: ${device.id}, token: ${device.token.substring(0, 10)}...`);
          }
          
          const tokenMatch = currentDeviceToken && device.token === currentDeviceToken;
          const platformMatch = device.platform === currentPlatform;
          const isLatest = new Date(device.updated_at).getTime() === 
            Math.max(...response.data.data.devices.map(d => new Date(d.updated_at).getTime()));
          
          let isCurrentDevice: boolean = Boolean(tokenMatch);
          
          // Token eşleşmiyorsa, platform ve tarih kontrolü yap
          if (!isCurrentDevice && platformMatch && isLatest) {
            isCurrentDevice = true;
            console.log("Platform ve tarih eşleşmesi ile cihaz tespit edildi:", device.id);
          }
          
          // Yine bulunamadıysa, en son cihazı kullan
          if (!isCurrentDevice && isLatest && !response.data.data.devices.some(d => d.token === currentDeviceToken)) {
            isCurrentDevice = true;
            console.log("En son tarih ile cihaz tespit edildi:", device.id);
          }
          
          if (isCurrentDevice) {
            console.log("Bu cihaz tespit edildi:", device.id, "token:", device.token ? device.token.substring(0, 10) + '...' : 'yok');
            
            // Eğer tespit edilen cihazın token'ı, mevcut token'dan farklıysa, güncelle
            if (device.token && device.token !== currentDeviceToken) {
              console.log(`Cihaz token'ı güncelleniyor... Eski: ${currentDeviceToken?.substring(0, 10) || 'yok'}, Yeni: ${device.token.substring(0, 10)}`);
              AsyncStorage.setItem(DEVICE_TOKEN_KEY, device.token);
              useDeviceStore.setState({ deviceToken: device.token });
              console.log("Cihaz token'ı güncellendi");
            }
          }
          
          // Token değerinin tanımlı olduğundan emin olalım
          const deviceToken = device.token || '';
          
          // Cihaz tipi belirleme
          let deviceType: DeviceType = 'unknown';
          if (device.platform === 'ios' || device.platform === 'android') {
            deviceType = 'mobile';
          } else if (device.platform === 'web') {
            deviceType = 'desktop';
          }
          
          // Cihaz adını belirle - mevcut cihaz ise kullanıcının cihaz adını göster
          let deviceName = device.deviceInfo?.deviceName || `${device.platform.charAt(0).toUpperCase() + device.platform.slice(1)} Cihaz`;
          
          // Eğer bu mevcut cihazsak, cihaz adını gerçek cihaz adı ile değiştir
          if (isCurrentDevice) {
            deviceName = currentDeviceName;
          }
          
          return {
            id: device.id,
            deviceName,
            deviceType,
            os: device.deviceInfo?.os || device.platform,
            browser: device.deviceInfo?.browser,
            location: device.deviceInfo?.location || 'Bilinmiyor',
            lastActive: device.lastActive || device.updated_at || device.created_at,
            isCurrentDevice,
            platform: device.platform as 'ios' | 'android' | 'expo' | 'web',
            token: deviceToken // Doğru token değerini ekledik
          };
        });
      } else {
        console.error('API yanıtı başarısız:', response.data);
        throw new Error(`API yanıtı başarısız: ${response.status}`);
      }
    } catch (error: any) {
      clearTimeout(timeoutId); // Hata durumunda timeout'u temizle
      
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error('API isteği zaman aşımına uğradı');
      }
      
      if (error.name === 'AbortError') {
        throw new Error('API isteği zaman aşımına uğradı');
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Cihazları getirme hatası:', error);
    
    // Hata durumunda boş dizi dön
    return [];
  }
};

const revokeDeviceFromApi = async (deviceId: string, token?: string): Promise<boolean> => {
  try {
    console.log('revokeDeviceFromApi çağrıldı:', { deviceId, token });
    
    // Önce yetkilendirme token'ını al
    const authToken = await tokenManager.getToken();
    if (!authToken) {
      console.error('Kimlik doğrulama token\'ı bulunamadı, oturum açılması gerekiyor');
      return false;
    }
    
    // API base URL'ini configStore'dan al
    const { apiBaseUrl } = getConfigValuesFromStore();
    
    // Token doğrulama kontrolleri
    if (!token || token.trim() === '') {
      console.warn('Silinecek cihaz token\'ı bulunamadı, deviceId kullanılacak:', deviceId);
      
      try {
        console.log('Cihazları listeleniyor, ID\'ye göre token bulunacak');
        
        // Timeout kontrolü ile istek gönderme
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // Cihazları listele
        const response = await axios.get(
          `${apiBaseUrl}/devices/my-devices`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        if (response.status === 200 && response.data.success) {
          const devices = response.data.data.devices;
          console.log(`${devices.length} cihaz bulundu, aranan cihaz ID: ${deviceId}`);
          
          // API yanıtındaki devices array'ini detaylı olarak incele
          console.log('Tüm cihaz verileri:', JSON.stringify(devices));
          
          // deviceId'ye göre cihazı bul - API'nin yapısına göre kontrol et
          // devices içinde id yerine _id veya başka bir özellik kullanılıyor olabilir
          const targetDevice = devices.find((d: any) => 
            d.id === deviceId || 
            d._id === deviceId || 
            (d.deviceInfo && d.deviceInfo.id === deviceId)
          );
          
          if (targetDevice) {
            console.log('Cihaz bulundu:', JSON.stringify(targetDevice));
            
            // token değeri var mı kontrol et
            if (targetDevice.token) {
              console.log('Cihaz token bulundu, silme işlemi yapılıyor:', targetDevice.token);
              
              // Bulunan token ile silme işlemini devam ettir
              return await performTokenDeletion(targetDevice.token, authToken, apiBaseUrl);
            } else {
              // Token yoksa ama cihaz bulunduysa, güncel cihazın token değerini kullanmayı dene
              const currentToken = useDeviceStore.getState().deviceToken;
              if (currentToken) {
                console.log('Cihaz için token bulunamadı, mevcut cihazın token değeri kullanılıyor:', currentToken);
                return await performTokenDeletion(currentToken, authToken, apiBaseUrl);
              } else {
                console.error('Cihazda token yok ve mevcut cihaz token değeri de bulunamadı:', deviceId);
                return false;
              }
            }
          } else {
            console.error('Cihaz bulunamadı, ID:', deviceId);
            console.log('Var olan cihaz ID değerleri:', devices.map((d: any) => d.id || d._id || 'ID yok').join(', '));
            return false;
          }
        } else {
          console.error('Cihazları listeleme yanıtı başarısız:', response.status, response.data);
          return false;
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
            console.error('Cihaz listeleme isteği zaman aşımına uğradı');
          } else {
            console.error('API hatası:', error.message);
            console.error('Yanıt durumu:', error.response?.status);
            console.error('Yanıt verisi:', error.response?.data);
          }
        } else {
          console.error('Cihazları listeleme hatası:', error);
        }
        return false;
      }
    }
    
    // Mevcut cihazın token'ı mı kontrol et
    const currentDeviceToken = useDeviceStore.getState().deviceToken;
    const isCurrentDevice = currentDeviceToken === token;
    
    console.log('Token silme işlemi başlatıldı:', { deviceId, token, isCurrentDevice });
    
    // Mevcut cihaz ise deviceStore'daki unregisterDeviceToken fonksiyonunu kullan
    if (isCurrentDevice) {
      console.log('Mevcut cihaz token\'ı siliniyor');
      const success = await useDeviceStore.getState().unregisterDeviceToken();
      
      if (success) {
        // Token başarıyla silindi, deviceToken'ı AsyncStorage'dan da temizle
        await AsyncStorage.removeItem(DEVICE_TOKEN_KEY);
        useDeviceStore.setState({ deviceToken: null });
        console.log('Mevcut cihaz token\'ı başarıyla silindi');
      } else {
        console.error('DeviceStore unregisterDeviceToken başarısız oldu');
      }
      
      return success;
    } 
    // Başka bir cihazın token'ı ise API'yi doğrudan çağır
    else {
      return await performTokenDeletion(token, authToken, apiBaseUrl);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API hatası:', error.message);
      console.error('Yanıt durumu:', error.response?.status);
      console.error('Yanıt verisi:', error.response?.data);
    } else {
      console.error('Cihaz oturumu kapatma hatası:', error);
    }
    return false;
  }
};

// Token silme işlemini gerçekleştiren yardımcı fonksiyon
const performTokenDeletion = async (token: string, authToken: string, apiBaseUrl: string): Promise<boolean> => {
  try {
    // Token geçerlilik kontrolü
    if (!token || token.trim() === '') {
      console.error('Geçersiz token değeri, silme işlemi yapılamıyor');
      return false;
    }
    
    console.log('Token silme isteği gönderiliyor:', token);
    
    // API isteği - devices/unregister endpoint'i
    const response = await axios.post(
      `${apiBaseUrl}/devices/unregister`,
      { token },  // API sadece token bekliyor
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 saniye timeout ekleyin
      }
    );
    
    console.log('API yanıtı:', response.status, response.data);
    
    // API yanıtı kontrolü - succcess değerini kontrol et
    if (response.data && response.data.success === true) {
      console.log('Token başarıyla silindi:', token);
      return true;
    } else {
      console.error('Token silme yanıtı başarısız:', response.data);
      return false;
    }
  } catch (error: any) {
    // Detaylı hata bilgisi
    if (axios.isAxiosError(error)) {
      console.error('API hatası:', error.message);
      console.error('Yanıt durumu:', error.response?.status);
      console.error('Yanıt verisi:', error.response?.data);
    } else {
      console.error('Token silme hatası:', error);
    }
    return false;
  }
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
      const devices = await fetchDevicesFromApi();
      
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
  
  revokeDevice: async (deviceId: string, token?: string) => {
    try {
      // API'ye istek at ve cihazı kaldır
      const success = await revokeDeviceFromApi(deviceId, token);
      
      if (success) {
        // Başarılı olursa cihazı listeden kaldır
        const updatedDevices = get().devices.filter(device => device.id !== deviceId);
        set({ devices: updatedDevices });
        return true;
      }
      
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Cihaz oturumu kapatılamadı';
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
  onRevoke: (deviceId: string, token?: string) => void;
  theme: any;
}

const DeviceItem: React.FC<DeviceItemProps> = ({ device, onRevoke, theme }) => {
  // Debug: token değerini konsola yazdır
  useEffect(() => {
    console.log(`Cihaz ID: ${device.id}, Token: ${device.token || 'undefined/null'}, Platform: ${device.platform}`);
  }, [device.id]);

  // Token kontrolü yapmak için yardımcı fonksiyon
  const handleRevoke = () => {
    if (!device.token) {
      console.warn(`Token değeri bulunamadı, Cihaz ID: ${device.id}`);
      // token değeri yoksa bile deviceId ile çağır
      onRevoke(device.id, '');
    } else {
      console.log(`Çıkış işlemi başlatılıyor, Token: ${device.token}`);
      onRevoke(device.id, device.token);
    }
  };

  return (
    <View 
      style={[
        styles.deviceItem, 
        { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: device.isCurrentDevice ? theme.colors.accent : 'transparent',
          borderWidth: device.isCurrentDevice ? 1.5 : 0,
        }
      ]}
    >
      {device.isCurrentDevice && (
        <View style={[styles.currentDeviceBadge, { backgroundColor: theme.colors.accent }]}>
          <Ionicons name="checkmark-circle" size={14} color="#FFF" />
          <Text style={styles.currentDeviceBadgeText}>Bu Cihaz</Text>
        </View>
      )}
      
      {/* Üst kısım - Cihaz adı, işletim sistemi ve çıkış butonu */}
      <View style={styles.deviceHeader}>
        <View style={styles.deviceTitleContainer}>
          <View style={[
            styles.deviceIconContainer, 
            { 
              backgroundColor: device.isCurrentDevice 
                ? theme.colors.accent + '20' 
                : theme.colors.accent + '10',
              width: device.isCurrentDevice ? 42 : 36,
              height: device.isCurrentDevice ? 42 : 36,
            }
          ]}>
            <Ionicons 
              name={getDeviceIcon(device.deviceType)} 
              size={device.isCurrentDevice ? 22 : 18} 
              color={theme.colors.accent} 
            />
          </View>
          <View style={styles.deviceTitleContent}>
            <Text style={[
              styles.deviceName, 
              { 
                color: theme.colors.text,
                fontWeight: device.isCurrentDevice ? '700' : '500',
                fontSize: device.isCurrentDevice ? 16 : 15
              }
            ]}>
              {device.deviceName}
            </Text>
            <Text style={[styles.deviceOs, { color: theme.colors.textSecondary }]}>
              {device.os}{device.browser ? ` • ${device.browser}` : ''}
            </Text>
          </View>
        </View>
        
        {!device.isCurrentDevice && (
          <TouchableOpacity 
            style={[
              styles.revokeButton, 
              { 
                borderColor: theme.colors.error + '30',
                backgroundColor: theme.colors.error + '08',
              }
            ]}
            onPress={handleRevoke}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons 
              name="exit-outline" 
              size={16} 
              color={theme.colors.error}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.revokeText, { color: theme.colors.error }]}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Alt kısım - Konum, platform ve süre bilgisi */}
      <View style={styles.deviceDetails}>
        {/* Konum ve platform bilgisi */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {device.location}
            </Text>
          </View>
          
          {device.platform && (
          <View style={styles.detailItem}>
              <Ionicons name="apps-outline" size={14} color={theme.colors.textSecondary} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                {device.platform.charAt(0).toUpperCase() + device.platform.slice(1)}
            </Text>
          </View>
          )}
        </View>
        
        {/* Zaman bilgisi - sağ altta */}
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} style={styles.detailIcon} />
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            {formatDate(device.lastActive)}
              </Text>
            </View>
      </View>
    </View>
  );
};

// Cihaz adını almak için yardımcı fonksiyon
const getDeviceName = async (): Promise<string> => {
  try {
    // Önce AsyncStorage'da kaydedilmiş bir cihaz adı var mı kontrol et
    const savedDeviceName = await AsyncStorage.getItem('@device_name');
    if (savedDeviceName) {
      return savedDeviceName;
    }

    // Platform bazlı cihaz adı alma
    let deviceName = '';
    
    // Android için
    if (Platform.OS === 'android') {
      // Android cihaz adı alma
      try {
        const { brand, model } = NativeModules.DeviceInfo || {};
        if (brand && model) {
          deviceName = `${brand} ${model}`;
        } else {
          deviceName = 'Android Cihaz';
        }
      } catch (err) {
        console.log('Android cihaz adı alınamadı:', err);
        deviceName = 'Android Cihaz';
      }
    } 
    // iOS için
    else if (Platform.OS === 'ios') {
      try {
        // iOS cihazı için model 
        const model = NativeModules.DeviceInfo?.model || 'iOS Cihaz';
        deviceName = model;
      } catch (err) {
        console.log('iOS cihaz adı alınamadı:', err);
        deviceName = 'iOS Cihaz';
      }
    } 
    // Web ve diğer platformlar için
    else {
      deviceName = `${Platform.OS.charAt(0).toUpperCase() + Platform.OS.slice(1)} Cihaz`;
    }

    // Alınan cihaz adını kaydet
    await AsyncStorage.setItem('@device_name', deviceName);
    return deviceName;
  } catch (error) {
    console.error('Cihaz adı alma hatası:', error);
    return `${Platform.OS.charAt(0).toUpperCase() + Platform.OS.slice(1)} Cihaz`;
  }
};

// Component didmount'ta token alıp kaydedilmesini sağlayacak fonksiyon
export const SessionSettings: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<SessionHistoryNavigationProp>();
  const { devices, isLoading, error, fetchDevices, revokeDevice, clearError } = useSessionHistoryStore();
  const { generateDeviceToken, deviceToken } = useDeviceStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [sortedDevices, setSortedDevices] = useState<SessionDevice[]>([]);
  
  // Cihazları sırala: "Bu cihaz" her zaman en üstte
  useEffect(() => {
    if (devices && devices.length > 0) {
      // Cihazları kopyala ve "Bu cihaz" en üstte olacak şekilde sırala
      const sorted = [...devices].sort((a, b) => {
        if (a.isCurrentDevice) return -1; // a "Bu cihaz" ise en üstte
        if (b.isCurrentDevice) return 1; // b "Bu cihaz" ise en üstte
        
        // Her ikisi de "Bu cihaz" değilse, isme veya tarihe göre sırala
        // Son güncelleme tarihine göre sırala (en yeni en üstte)
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      });
      
      setSortedDevices(sorted);
    } else {
      setSortedDevices([]);
    }
  }, [devices]);
  
  // Cihaz token bilgisini al ve kaydet
  const saveCurrentDeviceToken = async () => {
    try {
      // DeviceStore'dan token al - eğer yoksa yeni oluştur
      const existingToken = useDeviceStore.getState().deviceToken;
      console.log("Mevcut cihaz token (saveCurrentDeviceToken başlangıç):", existingToken);
      
      // Cihaz adını al
      const deviceName = await getDeviceName();
      console.log("Cihaz adı alındı:", deviceName);

      if (!existingToken) {
        // Token yoksa yeni oluştur
        const newToken = await generateDeviceToken();
        console.log("Yeni oluşturulan token:", newToken);
        
        // Token'ı kaydettikten sonra API'ye bildir
        try {
          // Platform bilgisini al
          const platform = Platform.OS;
          // Token'ı kaydet
          await useDeviceStore.getState().registerDeviceToken(platform);
          console.log("Token API'ye kaydedildi:", { token: newToken, platform, deviceName });
        } catch (registerError) {
          console.error("Token API kaydı sırasında hata:", registerError);
        }
      } else {
        console.log("Var olan token kullanılıyor:", existingToken);
      }
      
      // Token oluşturulduktan sonra cihaz listesini getir
      await fetchDevices();
    } catch (err) {
      console.error('Cihaz token işlemleri sırasında hata:', err);
    }
  };
  
  // Component mount olduğunda cihazları çek ve token kaydet
  useEffect(() => {
    saveCurrentDeviceToken();
    
    const refreshInterval = setInterval(() => {
      console.log("Otomatik cihaz listesi yenileniyor...");
    fetchDevices();
    }, 30000); // Her 30 saniyede bir yenile
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // deviceToken değiştiğinde cihaz listesini yenile
  useEffect(() => {
    if (deviceToken) {
      console.log("Device token değişti, cihaz listesi yenileniyor:", deviceToken);
      fetchDevices();
    }
  }, [deviceToken]);
  
  // Manüel yenileme işlemini güçlendir
  const onRefresh = async () => {
    setRefreshing(true);
    console.log("Manuel yenileme başlatıldı");
    
    // Cihaz token'ı yeniden doğrula
    const existingToken = useDeviceStore.getState().deviceToken;
    if (!existingToken) {
      await saveCurrentDeviceToken();
    } else {
    await fetchDevices();
    }
    
    setRefreshing(false);
  };
  
  // Hata durumunda uyarı göster
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearError();
    }
  }, [error]);
  
  // Cihaz erişimini iptal etme
  const handleRevokeDevice = (deviceId: string, token?: string) => {
    console.log('handleRevokeDevice çağrıldı:', { deviceId, token });
    
    // Mevcut cihazın token'ı ile karşılaştır
    const currentDeviceToken = useDeviceStore.getState().deviceToken;
    console.log('Mevcut cihaz token:', currentDeviceToken);
    
    // Mevcut cihaz mı kontrol et
    const isCurrent = token === currentDeviceToken || deviceId === devices.find(d => d.isCurrentDevice)?.id;
    
    // Eğer token parametresi yoksa ama deviceId'yi biliyorsak, devamda bug olmasın
    const effectiveToken = token || '';
    
    Alert.alert(
      'Oturumu Kapat',
      isCurrent ? 
        'Bu işlem mevcut cihazınızdaki oturumu kapatacak ve çıkış yapmanıza neden olacaktır. Devam etmek istiyor musunuz?' :
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
            // İşlem başladı uyarısı göster
            const loadingAlert = Alert.alert('İşlem Başladı', 'Oturum kapatılıyor, lütfen bekleyin...');
            
            try {
              console.log('Oturum kapatma işlemi başlatılıyor:', { deviceId, token: effectiveToken, isCurrent });
              
              // Cihaz token değerini sil
              const success = await revokeDevice(deviceId, effectiveToken);
              console.log('Oturum kapatma işlemi sonucu:', { success });
              
              if (success) {
                if (isCurrent) {
                  // Kendi cihazının oturumunu kapattıysa, uygulamada da çıkış yap
                  Alert.alert('Başarılı', 'Oturumunuz kapatıldı, çıkış yapılıyor');
                  
                  try {
                    // AuthStore'dan logout metodunu çağır
                    await useAuthStore.getState().logout();
                    
                    // Cihaz token'ını da kaldır
                    await AsyncStorage.removeItem(DEVICE_TOKEN_KEY);
                    
                    // Tüm oturum verilerini temizle ve çıkış yap
                    setTimeout(() => {
                      // Giriş ekranına yönlendir (navigation reset yapılmalı)
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Auth' as any }],
                      });
                    }, 1000);
                  } catch (error) {
                    console.error('Çıkış yapma hatası:', error);
                    Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu. Lütfen uygulamayı kapatıp tekrar açın.');
                  }
                } else {
                  Alert.alert('Başarılı', 'Cihaz oturumu kapatıldı');
                  // Cihaz listesini yenile
                  fetchDevices();
                }
              } else {
                Alert.alert(
                  'Hata', 
                  'Cihaz oturumu kapatılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.',
                  [
                    { 
                      text: 'Tekrar Dene', 
                      onPress: () => handleRevokeDevice(deviceId, token) 
                    },
                    { text: 'İptal', style: 'cancel' }
                  ]
                );
              }
            } catch (error) {
              console.error('Cihaz oturumu kapatma sırasında beklenmeyen hata:', error);
              Alert.alert(
                'Hata', 
                'Cihaz oturumu kapatılırken beklenmeyen bir hata oluştu.', 
                [
                  { 
                    text: 'Tekrar Dene', 
                    onPress: () => handleRevokeDevice(deviceId, token) 
                  },
                  { text: 'İptal', style: 'cancel' }
                ]
              );
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
            borderColor: theme.colors.accent + '30',
            borderLeftWidth: 3,
            borderTopWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: 0
          }
        ]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.accent} style={styles.infoIcon} />
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
            <Ionicons name="laptop-outline" size={40} color={theme.colors.textSecondary + '50'} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aktif oturum bulunamadı
            </Text>
          </View>
        )}
        
        {sortedDevices.map(device => (
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
            borderColor: theme.colors.border || theme.colors.textSecondary + '20',
            borderWidth: 0,
            borderTopWidth: 1,
            borderBottomWidth: 1
          }
        ]}>
          <Text style={[styles.securityTipsTitle, { color: theme.colors.text }]}>
            Güvenlik İpuçları
          </Text>
          <View style={styles.securityTipItem}>
            <Ionicons name="lock-closed-outline" size={16} color={theme.colors.accent} style={styles.tipIcon} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Tanımadığınız cihazlardan giriş yapıldığını fark ederseniz hemen şifrenizi değiştirin.
            </Text>
          </View>
          <View style={styles.securityTipItem}>
            <Ionicons name="shield-outline" size={16} color={theme.colors.accent} style={styles.tipIcon} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              İki faktörlü doğrulama kullanarak hesap güvenliğinizi artırabilirsiniz.
            </Text>
          </View>
          <View style={styles.securityTipItem}>
            <Ionicons name="log-out-outline" size={16} color={theme.colors.accent} style={styles.tipIcon} />
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
              backgroundColor: theme.colors.error + '10',
              borderColor: theme.colors.error + '30',
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
                  onPress: async () => {
                    // İşlem başladı bildirisi göster
                    const loadingAlert = Alert.alert(
                      'İşlem Başladı',
                      'Diğer cihazlardaki oturumlar kapatılıyor, lütfen bekleyin...'
                    );
                    
                    try {
                      // Tüm cihazları kapat
                      let allSuccess = true;
                      let failedDeviceCount = 0;
                      const currentDeviceToken = useDeviceStore.getState().deviceToken;
                      
                      // Çıkış yapılacak cihazları kontrol et
                      const otherDevices = devices.filter(
                        device => !device.isCurrentDevice && device.token !== currentDeviceToken
                      );
                      
                      if (otherDevices.length === 0) {
                        Alert.alert('Bilgi', 'Kapatılacak başka oturum bulunamadı. Sadece bu cihazda oturum açmış durumdasınız.');
                        return;
                      }
                      
                      console.log(`${otherDevices.length} cihazdan çıkış yapılacak`);
                      
                      // Her cihaz için çıkış işlemi başlat
                      const results = await Promise.allSettled(
                        otherDevices.map(device => 
                          revokeDevice(device.id, device.token || '')
                        )
                      );
                      
                      // Sonuçları kontrol et
                      results.forEach((result, index) => {
                        if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value)) {
                          console.error(`Cihaz ${otherDevices[index].id} çıkış işlemi başarısız oldu:`, result);
                          allSuccess = false;
                          failedDeviceCount++;
                        }
                      });
                      
                      // İşlem sonucunu kullanıcıya bildir
                      if (allSuccess) {
                        Alert.alert('Başarılı', 'Tüm diğer cihazlardaki oturumlar kapatıldı');
                        // Cihaz listesini yenile
                        fetchDevices();
                      } else {
                        if (failedDeviceCount === otherDevices.length) {
                          // Hiçbir cihazdan çıkış yapılamadı
                          Alert.alert(
                            'Hata', 
                            'Hiçbir cihazın oturumu kapatılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.',
                            [
                              { 
                                text: 'Tekrar Dene', 
                                onPress: () => document.getElementById('logoutAllButton')?.click() 
                              },
                              { text: 'İptal', style: 'cancel' }
                            ]
                          );
                        } else {
                          // Bazı cihazlardan çıkış yapılamadı
                          const successCount = otherDevices.length - failedDeviceCount;
                          Alert.alert(
                            'Kısmen Başarılı', 
                            `${successCount} cihazın oturumu kapatıldı, ${failedDeviceCount} cihazın oturumu kapatılamadı. Kalan cihazlar için tekrar deneyebilirsiniz.`,
                            [{ text: 'Tamam', onPress: () => fetchDevices() }]
                          );
                        }
                      }
                    } catch (error) {
                      console.error('Toplu çıkış işlemi sırasında hata:', error);
                      Alert.alert(
                        'Hata', 
                        'Oturumlar kapatılırken beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
                      );
                    }
                  }
                },
              ]
            );
          }}
          id="logoutAllButton"
        >
          <Ionicons 
            name="exit-outline" 
            size={18} 
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
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
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
    paddingBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 6,
    marginVertical: 12,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 10,
  },
  loadingContainer: {
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
  },
  deviceItem: {
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 2,
    padding: 12,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  deviceTitleContent: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '500',
  },
  deviceOs: {
    fontSize: 12,
    marginTop: 2,
  },
  revokeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  revokeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deviceDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 3,
  },
  detailIcon: {
    marginRight: 4,
  },
  detailText: {
    fontSize: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
  },
  securityTipsContainer: {
    padding: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  securityTipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  securityTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  logoutAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  logoutAllIcon: {
    marginRight: 6,
  },
  logoutAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  currentDeviceBadge: {
    position: 'absolute',
    top: -10,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  currentDeviceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 3,
  },
});
