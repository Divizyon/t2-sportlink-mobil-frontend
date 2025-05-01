import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileActions } from '../../components/Profile/ProfileActions';
import { useAuthStore } from '../../store/userStore/authStore';
import { ProfileStackParamList } from '../../navigation/ProfileStack';

type SettingsNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export const SettingsScreen = () => {
  const { signOut } = useAuth();
  const { logout } = useAuthStore();
  const navigation = useNavigation<SettingsNavigationProp>();
  const { theme, isDarkMode, toggleTheme } = useThemeStore();

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
              try {
                await logout();
                await signOut();
              } catch (error) {
                console.error('Çıkış yapılırken hata:', error);
                Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
              }
            }
          },
        ]
      );
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleManageNotifications = () => {
    // TODO: Bildirim ayarları sayfasına yönlendir
    navigation.navigate('NotificationSettings');
  };

  const handlePrivacySettings = () => {
    navigation.navigate('SecuritySettings');
  };

  const handleHelp = () => {
    navigation.navigate('Help');
  };

  const handleSessionHistory = () => {
    navigation.navigate('SessionHistory');
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['right', 'left']}
    >
      <View style={styles.content}>
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
          onSessionHistory={handleSessionHistory}
          onHelp={handleHelp}
          onLogout={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  }
}); 