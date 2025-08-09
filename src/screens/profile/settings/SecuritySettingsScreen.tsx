import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '../../../navigation/ProfileStack';
import { useForgotPasswordStore } from '../../../store/userStore/forgotPasswordStore';
import { useAuthStore } from '../../../store/userStore/authStore';

// Daha açık bir yeşil renk tanımlıyoruz
const LIGHT_GREEN = '#4CB944'; // Daha açık ve canlı bir yeşil

type SecuritySettingsNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

// Her bir ayar öğesi için tip tanımı
type SecuritySettingItemProps = {
  title: string;
  subtitle?: string;
  icon: any; // Ionicons isimleri için any tipini kullanıyoruz
  type: 'toggle' | 'button' | 'navigation';
  value?: boolean;
  onValueChange?: (newValue: boolean) => void;
  onPress?: () => void;
  theme: any;
  isLoading?: boolean;
}

// Bir ayarın bölüm başlığı için tip tanımı
type SectionTitleProps = {
  title: string;
  theme: any;
}

// Bölüm başlığı bileşeni
const SectionTitle: React.FC<SectionTitleProps> = ({ title, theme }) => {
  return (
    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
      {title}
    </Text>
  );
};

// Ayar öğesi bileşeni
const SecuritySettingItem: React.FC<SecuritySettingItemProps> = ({ 
  title, 
  subtitle, 
  icon, 
  type, 
  value, 
  onValueChange, 
  onPress, 
  theme,
  isLoading
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.border || theme.colors.textSecondary + '30',
          borderWidth: 1 
        }
      ]}
      onPress={type === 'button' || type === 'navigation' ? onPress : undefined}
      activeOpacity={type === 'button' || type === 'navigation' ? 0.7 : 1}
    >
      <View style={styles.settingItemContent}>
        <View style={styles.settingItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: LIGHT_GREEN + '20' }]}>
            <Ionicons name={icon} size={22} color={LIGHT_GREEN} />
          </View>
          <View style={styles.settingItemTextContainer}>
            <Text style={[styles.settingItemTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.settingItemSubtitle, { color: theme.colors.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.settingItemRight}>
          {type === 'toggle' && (
            isLoading ? (
              <ActivityIndicator size="small" color={LIGHT_GREEN} />
            ) : (
              <Switch
                trackColor={{ false: theme.colors.textSecondary + '50', true: LIGHT_GREEN + '70' }}
                thumbColor={value ? LIGHT_GREEN : theme.colors.text + '50'}
                ios_backgroundColor={theme.colors.textSecondary + '50'}
                onValueChange={onValueChange}
                value={value}
              />
            )
          )}
          
          {type === 'button' && (
            <Text style={[styles.buttonText, { color: LIGHT_GREEN }]}>
              Değiştir
            </Text>
          )}
          
          {type === 'navigation' && (
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const SecuritySettingsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<SecuritySettingsNavigationProp>();
  const { resetPassword, isLoading: isPasswordResetLoading, success, error, message, clearState } = useForgotPasswordStore();
  const { user } = useAuthStore();
  
  // Ayarlar için state'ler
  const [isEmailAuthEnabled, setIsEmailAuthEnabled] = useState(true);
  const [isFaceIdEnabled, setIsFaceIdEnabled] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isLocationPrivate, setIsLocationPrivate] = useState(false);
  const [isProfilePrivate, setIsProfilePrivate] = useState(false);
  const [isActivityVisible, setIsActivityVisible] = useState(true);
  
  // Simüle edilmiş yükleme durumları
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  
  // Hata veya mesaj değiştiğinde göster
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearState();
    }
    
    if (message) {
      Alert.alert('Bilgi', message);
      clearState();
    }
  }, [error, message, clearState, success]);
  
  // Bir ayarı değiştirirken yükleme durumunu simüle etme
  const toggleSetting = (setting: string, currentValue: boolean, setFunction: (value: boolean) => void) => {
    setIsLoading({ ...isLoading, [setting]: true });
    
    // Sunucu isteğini simüle eden gecikme
    setTimeout(() => {
      setFunction(!currentValue);
      setIsLoading({ ...isLoading, [setting]: false });
    }, 600);
  };
  
  // Şifre değiştirme
  const handleChangePassword = () => {
    if (!user?.email) {
      Alert.alert('Hata', 'Kullanıcı e-posta bilgisi bulunamadı.');
      return;
    }

    Alert.alert(
      'Şifre Değiştir',
      'Şifrenizi değiştirmek için e-posta adresinize bir sıfırlama bağlantısı göndereceğiz. Devam etmek istiyor musunuz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Gönder',
          onPress: async () => {
            try {
              await resetPassword(user.email);
              // resetPassword başarılı olursa, useForgotPasswordStore içindeki success ve message state'leri güncellenir
              // ve useEffect içinde bu değişiklikler tespit edilip kullanıcıya bildirilir
            } catch (error) {
              // Hata zaten store tarafından yönetiliyor ve useEffect içinde kullanıcıya gösteriliyor
            }
          }
        }
      ]
    );
  };
  
  // İki faktörlü doğrulama
  const handleTwoFactorAuth = () => {
    if (isTwoFactorEnabled) {
      Alert.alert(
        'İki Faktörlü Doğrulamayı Kapat',
        'Bu özelliği kapatmak hesap güvenliğinizi azaltacaktır. Devam etmek istiyor musunuz?',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Kapat',
            style: 'destructive',
            onPress: () => toggleSetting('twoFactor', isTwoFactorEnabled, setIsTwoFactorEnabled)
          }
        ]
      );
    } else {
      toggleSetting('twoFactor', isTwoFactorEnabled, setIsTwoFactorEnabled);
    }
  };
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'right', 'left']}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Güvenlik ve Gizlilik
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hesap Güvenliği Bölümü */}
        <SectionTitle title="HESAP GÜVENLİĞİ" theme={theme} />
        
        <SecuritySettingItem 
          title="Şifre Değiştir"
          subtitle={isPasswordResetLoading ? "İşleminiz devam ediyor..." : "Şifrenizi güvenli bir şekilde değiştirin"}
          icon="key-outline"
          type="button"
          theme={theme}
          onPress={handleChangePassword}
          isLoading={isPasswordResetLoading}
        />
        
        <SecuritySettingItem 
          title="E-posta Doğrulama"
          subtitle="Hesap güvenliği için e-posta doğrulaması gereklidir"
          icon="mail-outline"
          type="toggle"
          value={isEmailAuthEnabled}
          theme={theme}
          isLoading={isLoading['emailAuth']}
          onValueChange={() => toggleSetting('emailAuth', isEmailAuthEnabled, setIsEmailAuthEnabled)}
        />
        
        <SecuritySettingItem 
          title="Biyometrik Kimlik Doğrulama"
          subtitle="Yüz Tanıma / Parmak İzi ile giriş yap"
          icon="finger-print-outline"
          type="toggle"
          value={isFaceIdEnabled}
          theme={theme}
          isLoading={isLoading['faceId']}
          onValueChange={() => toggleSetting('faceId', isFaceIdEnabled, setIsFaceIdEnabled)}
        />
        
        <SecuritySettingItem 
          title="İki Faktörlü Doğrulama"
          subtitle="SMS doğrulama kodu ile ekstra güvenlik"
          icon="shield-checkmark-outline"
          type="toggle"
          value={isTwoFactorEnabled}
          theme={theme}
          isLoading={isLoading['twoFactor']}
          onValueChange={handleTwoFactorAuth}
        />
        
        {/* Gizlilik Ayarları Bölümü */}
        <SectionTitle title="GİZLİLİK AYARLARI" theme={theme} />
        
        <SecuritySettingItem 
          title="Konum Gizliliği"
          subtitle="Konumunuzu sadece arkadaşlarınızla paylaşın"
          icon="location-outline"
          type="toggle"
          value={isLocationPrivate}
          theme={theme}
          isLoading={isLoading['locationPrivacy']}
          onValueChange={() => toggleSetting('locationPrivacy', isLocationPrivate, setIsLocationPrivate)}
        />
        
        <SecuritySettingItem 
          title="Profil Gizliliği"
          subtitle="Profilinizi sadece arkadaşlarınız görebilir"
          icon="person-outline"
          type="toggle"
          value={isProfilePrivate}
          theme={theme}
          isLoading={isLoading['profilePrivacy']}
          onValueChange={() => toggleSetting('profilePrivacy', isProfilePrivate, setIsProfilePrivate)}
        />
        
        <SecuritySettingItem 
          title="Aktivite Görünürlüğü"
          subtitle="Etkinliklere katılımınız diğer kullanıcılara görünür"
          icon="bicycle-outline"
          type="toggle"
          value={isActivityVisible}
          theme={theme}
          isLoading={isLoading['activityVisibility']}
          onValueChange={() => toggleSetting('activityVisibility', isActivityVisible, setIsActivityVisible)}
        />
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
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 8,
  },
  settingItem: {
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingItemContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemTextContainer: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingItemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  settingItemRight: {
    marginLeft: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
  }
});
