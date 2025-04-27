import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  Alert
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useAuthStore } from '../../store/userStore/authStore';
import { useProfileStore } from '../../store/userStore/profileStore';
import { ProfileHeader } from '../../components/Profile/ProfileHeader';
import { StatsCard } from '../../components/Profile/StatsCard';
import { SportPreferencesCard } from '../../components/Profile/SportPreferencesCard';
import { FriendsCard } from '../../components/Profile/FriendsCard';
import { LocationCard } from '../../components/Profile/LocationCard';
import { ProfileActions } from '../../components/Profile/ProfileActions';

export const ProfileScreen: React.FC = ({ navigation }: any) => {
  const { theme, isDarkMode, toggleTheme } = useThemeStore();
  const { logout } = useAuthStore();
  const { 
    userInfo, 
    stats, 
    sportPreferences, 
    defaultLocation, 
    friendsSummary,
    isLoading,
    error,
    fetchUserProfile
  } = useProfileStore();
  
  const [refreshing, setRefreshing] = useState(false);

  // İlk yüklemede profil verilerini getir
  useEffect(() => {
    fetchUserProfile().catch(err => {
      console.error('Profil verileri getirilirken hata:', err);
    });
  }, []);

  // Yenileme işlemi
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserProfile();
    } catch (error) {
      console.error('Profil yenilenirken hata:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Çıkış işlemi
  const handleLogout = async () => {
    try {
      Alert.alert(
        'Çıkış',
        'Uygulamadan çıkış yapmak istediğinize emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Çıkış Yap', 
            style: 'destructive', 
            onPress: async () => {
              await logout();
            }
          },
        ]
      );
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  // Profil düzenleme işlemi
  const handleEditProfile = () => {
    // EditProfile sayfasına yönlendir
    navigation.navigate('EditProfile');
  };

  // Spor tercihleri düzenleme
  const handleEditSports = () => {
    // TODO: Spor tercihleri düzenleme sayfasına yönlendir
    console.log('Spor tercihleri düzenleme sayfasına yönlendirme');
  };

  // Konum düzenleme
  const handleEditLocation = () => {
    // TODO: Konum düzenleme sayfasına yönlendir
    console.log('Konum düzenleme sayfasına yönlendirme');
  };

  // Arkadaşları görüntüle
  const handleViewFriends = () => {
    // TODO: Arkadaşlar sayfasına yönlendir
    console.log('Arkadaşlar sayfasına yönlendirme');
  };

  // Arkadaşlık isteklerini görüntüle
  const handleViewRequests = () => {
    // TODO: Arkadaşlık istekleri sayfasına yönlendir
    console.log('Arkadaşlık istekleri sayfasına yönlendirme');
  };

  // Bildirim yönetimi
  const handleManageNotifications = () => {
    // TODO: Bildirim ayarları sayfasına yönlendir
    console.log('Bildirim ayarları sayfasına yönlendirme');
  };

  // Gizlilik ayarları
  const handlePrivacySettings = () => {
    // TODO: Gizlilik ayarları sayfasına yönlendir
    console.log('Gizlilik ayarları sayfasına yönlendirme');
  };

  // Yardım/Destek
  const handleHelp = () => {
    // TODO: Yardım sayfasına yönlendir
    console.log('Yardım sayfasına yönlendirme');
  };

  // Yükleme durumunda
  if (isLoading && !refreshing && !userInfo) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
        {/* Profil Başlığı */}
        {userInfo && (
          <ProfileHeader 
            firstName={userInfo.firstName}
            lastName={userInfo.lastName}
            username={userInfo.username}
            profilePicture={userInfo.profilePicture}
            onEditProfile={handleEditProfile}
          />
        )}
        
        {/* İstatistikler */}
        {stats && (
          <StatsCard 
            stats={stats}
            themeColors={{
              cardBackground: theme.colors.cardBackground,
              text: theme.colors.text,
              textSecondary: theme.colors.textSecondary,
              accent: theme.colors.accent
            }}
          />
        )}
        
        {/* Spor Tercihleri */}
        <SportPreferencesCard 
          sportPreferences={sportPreferences}
          themeColors={{
            cardBackground: theme.colors.cardBackground,
            text: theme.colors.text,
            textSecondary: theme.colors.textSecondary,
            accent: theme.colors.accent
          }}
          onEditSports={handleEditSports}
        />
        
        {/* Konum Bilgisi */}
        <LocationCard 
          location={defaultLocation}
          themeColors={{
            cardBackground: theme.colors.cardBackground,
            text: theme.colors.text,
            textSecondary: theme.colors.textSecondary,
            accent: theme.colors.accent
          }}
          onEditLocation={handleEditLocation}
        />
        
        {/* Arkadaşlık Durumu */}
        {friendsSummary && (
          <FriendsCard 
            friendsSummary={friendsSummary}
            themeColors={{
              cardBackground: theme.colors.cardBackground,
              text: theme.colors.text,
              textSecondary: theme.colors.textSecondary,
              accent: theme.colors.accent,
              notification: theme.colors.notification
            }}
            onViewFriends={handleViewFriends}
            onViewRequests={handleViewRequests}
          />
        )}
        
        {/* Profil Aksiyonları */}
        <ProfileActions 
          themeColors={{
            cardBackground: theme.colors.cardBackground,
            text: theme.colors.text,
            textSecondary: theme.colors.textSecondary,
            accent: theme.colors.accent,
            error: theme.colors.error || '#FF3B30'
          }}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onEditProfile={handleEditProfile}
          onManageNotifications={handleManageNotifications}
          onPrivacySettings={handlePrivacySettings}
          onHelp={handleHelp}
          onLogout={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  }
}); 