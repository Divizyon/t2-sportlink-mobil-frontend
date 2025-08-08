import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '../../../navigation/ProfileStack';

// Daha açık bir yeşil renk tanımlıyoruz
const LIGHT_GREEN = '#4CB944'; // Daha açık ve canlı bir yeşil

type NotificationSettingsNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

// Bildirim ayarı öğesi için tip tanımı
type NotificationSettingItemProps = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap; // Ionicons için doğru tip tanımlaması
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  theme: any;
  isLoading?: boolean;
};

// Bölüm başlığı bileşeni
const SectionTitle: React.FC<{ title: string; theme: any }> = ({ title, theme }) => {
  return (
    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
      {title}
    </Text>
  );
};

// Bildirim ayarı öğesi bileşeni
const NotificationSettingItem: React.FC<NotificationSettingItemProps> = ({ 
  title, 
  subtitle, 
  icon, 
  value, 
  onValueChange, 
  theme,
  isLoading
}) => {
  return (
    <View 
      style={[
        styles.settingItem, 
        { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.border || theme.colors.textSecondary + '30',
          borderWidth: 1 
        }
      ]}
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
          {isLoading ? (
            <ActivityIndicator size="small" color={LIGHT_GREEN} />
          ) : (
            <Switch
              trackColor={{ false: theme.colors.textSecondary + '50', true: LIGHT_GREEN + '70' }}
              thumbColor={value ? LIGHT_GREEN : theme.colors.text + '50'}
              ios_backgroundColor={theme.colors.textSecondary + '50'}
              onValueChange={onValueChange}
              value={value}
            />
          )}
        </View>
      </View>
    </View>
  );
};

// Bilgi kartı bileşeni
const InfoCard: React.FC<{ message: string; theme: any }> = ({ message, theme }) => {
  return (
    <View 
      style={[
        styles.infoCard, 
        { 
          backgroundColor: LIGHT_GREEN + '15',
          borderColor: LIGHT_GREEN + '30',
        }
      ]}
    >
      <Ionicons name="information-circle-outline" size={24} color={LIGHT_GREEN} style={styles.infoIcon} />
      <Text style={[styles.infoText, { color: theme.colors.text }]}>
        {message}
      </Text>
    </View>
  );
};

export const NotificationSettingsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<NotificationSettingsNavigationProp>();
  
  // Bildirim ayarları için state'ler
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isEmailEnabled, setIsEmailEnabled] = useState(true);
  const [isSmsEnabled, setIsSmsEnabled] = useState(false);
  
  // Etkinlik bildirimleri için state'ler
  const [isNewEventNearbyEnabled, setIsNewEventNearbyEnabled] = useState(true);
  const [isEventReminderEnabled, setIsEventReminderEnabled] = useState(true);
  const [isEventCanceledEnabled, setIsEventCanceledEnabled] = useState(true);
  const [isEventChangedEnabled, setIsEventChangedEnabled] = useState(true);
  
  // Sosyal bildirimler için state'ler
  const [isNewFollowerEnabled, setIsNewFollowerEnabled] = useState(true);
  const [isNewCommentEnabled, setIsNewCommentEnabled] = useState(true);
  const [isDirectMessageEnabled, setIsDirectMessageEnabled] = useState(true);
  const [isMentionEnabled, setIsMentionEnabled] = useState(true);
  
  // Diğer bildirimler için state'ler
  const [isUpdatesEnabled, setIsUpdatesEnabled] = useState(true);
  const [isTipsEnabled, setIsTipsEnabled] = useState(false);
  
  // Simulasyon için loading state'leri
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  
  // Bildirim ayarlarını değiştirmek için fonksiyon
  const toggleSetting = (key: string, currentValue: boolean, setter: (value: boolean) => void) => {
    // Loading durumunu aktif et
    setIsLoading(prev => ({ ...prev, [key]: true }));
    
    // Gerçek uygulamada burada API çağrısı yapılır
    // Burada simülasyon için timeout kullanıyoruz
    setTimeout(() => {
      setter(!currentValue);
      setIsLoading(prev => ({ ...prev, [key]: false }));
    }, 500);
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
          Bildirim Ayarları
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <InfoCard 
          message="Bildirimleri açarak etkinlikler, arkadaşlarınız ve size özel fırsatlar hakkında güncel kalın."
          theme={theme}
        />
        
        {/* Bildirim Kanalları Bölümü */}
        <SectionTitle title="BİLDİRİM KANALLARI" theme={theme} />
        
        <NotificationSettingItem 
          title="Push Bildirimleri"
          subtitle="Anlık bildirimler alın"
          icon="notifications-outline"
          value={isPushEnabled}
          theme={theme}
          isLoading={isLoading['push']}
          onValueChange={() => toggleSetting('push', isPushEnabled, setIsPushEnabled)}
        />
        
        <NotificationSettingItem 
          title="E-posta Bildirimleri"
          subtitle="Önemli güncellemeler için e-posta alın"
          icon="mail-outline"
          value={isEmailEnabled}
          theme={theme}
          isLoading={isLoading['email']}
          onValueChange={() => toggleSetting('email', isEmailEnabled, setIsEmailEnabled)}
        />
        
        <NotificationSettingItem 
          title="SMS Bildirimleri"
          subtitle="Kritik güncellemeler için SMS alın"
          icon="chatbox-outline"
          value={isSmsEnabled}
          theme={theme}
          isLoading={isLoading['sms']}
          onValueChange={() => toggleSetting('sms', isSmsEnabled, setIsSmsEnabled)}
        />
        
        {/* Etkinlik Bildirimleri Bölümü */}
        <SectionTitle title="ETKİNLİK BİLDİRİMLERİ" theme={theme} />
        
        <NotificationSettingItem 
          title="Yakınımda Yeni Etkinlik"
          subtitle="Konumunuza yakın yeni etkinlikler oluşturulduğunda bildirim alın"
          icon="location-outline"
          value={isNewEventNearbyEnabled}
          theme={theme}
          isLoading={isLoading['newEventNearby']}
          onValueChange={() => toggleSetting('newEventNearby', isNewEventNearbyEnabled, setIsNewEventNearbyEnabled)}
        />
        
        <NotificationSettingItem 
          title="Etkinlik Hatırlatıcıları"
          subtitle="Etkinlikler başlamadan önce hatırlatmalar alın"
          icon="alarm-outline"
          value={isEventReminderEnabled}
          theme={theme}
          isLoading={isLoading['eventReminder']}
          onValueChange={() => toggleSetting('eventReminder', isEventReminderEnabled, setIsEventReminderEnabled)}
        />
        
        <NotificationSettingItem 
          title="Etkinlik İptalleri"
          subtitle="Katılacağınız bir etkinlik iptal edildiğinde bildirim alın"
          icon="close-circle-outline"
          value={isEventCanceledEnabled}
          theme={theme}
          isLoading={isLoading['eventCanceled']}
          onValueChange={() => toggleSetting('eventCanceled', isEventCanceledEnabled, setIsEventCanceledEnabled)}
        />
        
        <NotificationSettingItem 
          title="Etkinlik Değişiklikleri"
          subtitle="Etkinlik detayları değiştiğinde haberdar olun"
          icon="refresh-outline"
          value={isEventChangedEnabled}
          theme={theme}
          isLoading={isLoading['eventChanged']}
          onValueChange={() => toggleSetting('eventChanged', isEventChangedEnabled, setIsEventChangedEnabled)}
        />
        
        {/* Sosyal Bildirimler Bölümü */}
        <SectionTitle title="SOSYAL BİLDİRİMLER" theme={theme} />
        
        <NotificationSettingItem 
          title="Yeni Takipçiler"
          subtitle="Birisi sizi takip etmeye başladığında bildirim alın"
          icon="person-add-outline"
          value={isNewFollowerEnabled}
          theme={theme}
          isLoading={isLoading['newFollower']}
          onValueChange={() => toggleSetting('newFollower', isNewFollowerEnabled, setIsNewFollowerEnabled)}
        />
        
        <NotificationSettingItem 
          title="Yorumlar"
          subtitle="Etkinliklerinize yorum yapıldığında bildirim alın"
          icon="chatbubble-outline"
          value={isNewCommentEnabled}
          theme={theme}
          isLoading={isLoading['newComment']}
          onValueChange={() => toggleSetting('newComment', isNewCommentEnabled, setIsNewCommentEnabled)}
        />
        
        <NotificationSettingItem 
          title="Direkt Mesajlar"
          subtitle="Yeni mesaj aldığınızda bildirim alın"
          icon="mail-outline"
          value={isDirectMessageEnabled}
          theme={theme}
          isLoading={isLoading['directMessage']}
          onValueChange={() => toggleSetting('directMessage', isDirectMessageEnabled, setIsDirectMessageEnabled)}
        />
        
        <NotificationSettingItem 
          title="Bahsetmeler"
          subtitle="Birisi sizi etiketlediğinde bildirim alın"
          icon="at-outline"
          value={isMentionEnabled}
          theme={theme}
          isLoading={isLoading['mention']}
          onValueChange={() => toggleSetting('mention', isMentionEnabled, setIsMentionEnabled)}
        />
        
        {/* Diğer Bildirimler Bölümü */}
        <SectionTitle title="DİĞER BİLDİRİMLER" theme={theme} />
        
        <NotificationSettingItem 
          title="Uygulama Güncellemeleri"
          subtitle="Yeni özellikler ve iyileştirmeler hakkında bilgi alın"
          icon="construct-outline"
          value={isUpdatesEnabled}
          theme={theme}
          isLoading={isLoading['updates']}
          onValueChange={() => toggleSetting('updates', isUpdatesEnabled, setIsUpdatesEnabled)}
        />
        
        <NotificationSettingItem 
          title="İpuçları ve Öneriler"
          subtitle="Uygulamayı daha iyi kullanmanız için ipuçları alın"
          icon="bulb-outline"
          value={isTipsEnabled}
          theme={theme}
          isLoading={isLoading['tips']}
          onValueChange={() => toggleSetting('tips', isTipsEnabled, setIsTipsEnabled)}
        />
        
        <Text style={[styles.disclaimer, { color: theme.colors.textSecondary }]}>
          Not: Bildirim ayarlarınızı istediğiniz zaman değiştirebilirsiniz. Acil durumlarla ilgili önemli bildirimleri kapatmanız mümkün olmayabilir.
        </Text>
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
    paddingVertical: 20,
    paddingTop: 40,
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
    borderWidth: 1,
    alignItems: 'center',
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
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 8,
  },
  settingItem: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    marginHorizontal: 16,
    lineHeight: 18,
  }
});
