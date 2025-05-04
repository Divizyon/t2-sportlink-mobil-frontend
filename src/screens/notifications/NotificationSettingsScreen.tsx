import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useNotificationStore } from '../../store/appStore/notificationStore';

export const NotificationSettingsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation();
  const { 
    settings, 
    isSettingsLoading, 
    fetchNotificationSettings, 
    updateNotificationSettings,
    registerPushNotifications,
    unregisterPushNotifications
  } = useNotificationStore();

  // Sayfa ilk açıldığında ayarları getir
  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  // Toggle fonksiyonu - herhangi bir anahtar için genel fonksiyon
  const toggleSetting = (settingKey: keyof typeof settings) => {
    updateNotificationSettings({
      [settingKey]: !settings[settingKey],
    });
  };

  // Push notification değişikliği - token kaydını etkileyeceği için özel işlem
  const togglePushNotifications = () => {
    const newValue = !settings.pushEnabled;
    
    // Push aktivasyon değişikliği
    if (newValue) {
      registerPushNotifications();
    } else {
      unregisterPushNotifications();
    }
    
    // Store'da güncelle
    updateNotificationSettings({
      pushEnabled: newValue,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Bildirim Ayarları</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {isSettingsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Temel Bildirim Ayarları */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Bildirim Kanalları
            </Text>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Push Bildirimleri
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Uygulama bildirimleri
                </Text>
              </View>
              <Switch
                value={settings.pushEnabled}
                onValueChange={togglePushNotifications}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.pushEnabled ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  E-posta Bildirimleri
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  E-posta bildirimlerini al
                </Text>
              </View>
              <Switch
                value={settings.emailEnabled}
                onValueChange={() => toggleSetting('emailEnabled')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.emailEnabled ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  SMS Bildirimleri
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  SMS bildirimleri al
                </Text>
              </View>
              <Switch
                value={settings.smsEnabled}
                onValueChange={() => toggleSetting('smsEnabled')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.smsEnabled ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Etkinlik Bildirimleri */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Etkinlik Bildirimleri
            </Text>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Yakındaki Etkinlikler
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Yakınınızda yeni etkinlikler oluşturulduğunda bildir
                </Text>
              </View>
              <Switch
                value={settings.newEventNearby}
                onValueChange={() => toggleSetting('newEventNearby')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.newEventNearby ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Etkinlik Hatırlatmaları
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Katılacağınız etkinlikleri yaklaştığında hatırlat
                </Text>
              </View>
              <Switch
                value={settings.eventReminder}
                onValueChange={() => toggleSetting('eventReminder')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.eventReminder ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Etkinlik İptalleri
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Katılacağım etkinlikler iptal edildiğinde bildir
                </Text>
              </View>
              <Switch
                value={settings.eventCanceled}
                onValueChange={() => toggleSetting('eventCanceled')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.eventCanceled ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Etkinlik Değişiklikleri
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Katılacağım etkinliklerde değişiklik olduğunda bildir
                </Text>
              </View>
              <Switch
                value={settings.eventChanged}
                onValueChange={() => toggleSetting('eventChanged')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.eventChanged ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Sosyal Bildirimler */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Sosyal Bildirimler
            </Text>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Yeni Takipçiler
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Birisi sizi takip ettiğinde bildir
                </Text>
              </View>
              <Switch
                value={settings.newFollower}
                onValueChange={() => toggleSetting('newFollower')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.newFollower ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Yeni Yorumlar
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Paylaşımlarınıza yeni yorum geldiğinde bildir
                </Text>
              </View>
              <Switch
                value={settings.newComment}
                onValueChange={() => toggleSetting('newComment')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.newComment ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Direkt Mesajlar
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Yeni mesaj geldiğinde bildir
                </Text>
              </View>
              <Switch
                value={settings.directMessage}
                onValueChange={() => toggleSetting('directMessage')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.directMessage ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Etiketlenmeler
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Biri sizi etiketlediğinde bildir
                </Text>
              </View>
              <Switch
                value={settings.mention}
                onValueChange={() => toggleSetting('mention')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.mention ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Diğer Bildirimler */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Diğer Bildirimler
            </Text>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Uygulama Güncellemeleri
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Yeni özellikler ve güncellemeler hakkında bildir
                </Text>
              </View>
              <Switch
                value={settings.appUpdates}
                onValueChange={() => toggleSetting('appUpdates')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.appUpdates ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  İpuçları ve Öneriler
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Yararlı ipuçları ve öneriler
                </Text>
              </View>
              <Switch
                value={settings.tipsEnabled}
                onValueChange={() => toggleSetting('tipsEnabled')}
                trackColor={{ false: '#767577', true: `${theme.colors.primary}40` }}
                thumbColor={settings.tipsEnabled ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </ScrollView>
      )}
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
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
}); 