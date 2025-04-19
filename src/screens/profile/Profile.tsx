import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import useThemeStore from '../../../store/slices/themeSlice';
import useAuthStore from '../../../store/slices/authSlice';

// Renk paleti - Açık tema
const LIGHT_COLORS = {
  primary: "#44C26D",  // Ana renk - Yeşil
  secondary: "#3066BE", // İkincil renk - Mavi
  background: "#F5F7FA", // Arka plan - Açık gri
  card: "#FFFFFF",     // Kart arkaplanı - Beyaz
  text: {
    dark: "#1D2B4E", // Koyu metin
    light: "#89939E", // Açık metin
  },
  divider: "#E1E4E8", // Ayırıcı çizgi
};

// Renk paleti - Koyu tema
const DARK_COLORS = {
  primary: "#4BD07D",  // Ana renk - Daha parlak yeşil
  secondary: "#4080DD", // İkincil renk - Daha parlak mavi
  background: "#15202B", // Twitter benzeri koyu mavi arka plan
  card: "#192734",     // Kart arkaplanı - Koyu
  text: {
    dark: "#FFFFFF", // Beyaz metin
    light: "#8899A6", // Açık gri metin
  },
  divider: "#38444D", // Ayırıcı çizgi
};

/**
 * Profil Ekranı
 * Kullanıcı profili, aktiviteler ve istatistikleri görüntüler
 */
export default function ProfileScreen() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  
  const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  // Kullanıcı çıkışı için
  const handleLogout = () => {
    logout();
  };

  // Tema değiştirme
  const handleToggleTheme = () => {
    toggleTheme();
  };

  // Profil sayfasına git
  const navigateToEditProfile = () => {
    router.push('/profile/edit' as any);
  };

  // Ayarlar sayfasına git
  const navigateToSettings = () => {
    router.push('/profile/settings' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Başlık */}
      <View style={[styles.header, { borderBottomColor: COLORS.divider }]}>
        <Text style={[styles.headerTitle, { color: COLORS.text.dark }]}>Profil</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={navigateToSettings}
        >
          <Text style={{ fontSize: 16 }}>⚙️</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Profil Bilgileri */}
        <View style={[styles.profileCard, { backgroundColor: COLORS.card }]}>
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: COLORS.text.dark }]}>
                {user?.username || 'Test Kullanıcı'}
              </Text>
              <Text style={[styles.profileUsername, { color: COLORS.text.light }]}>
                @{user?.username?.toLowerCase() || 'testuser'}
              </Text>
              <Text style={[styles.profileBio, { color: COLORS.text.dark }]}>
                Spor tutkunu, doğa yürüyüşçüsü ve bisiklet sever.
              </Text>
            </View>
          </View>
          
          <View style={[styles.statsRow, { borderTopColor: COLORS.divider }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.text.dark }]}>24</Text>
              <Text style={[styles.statLabel, { color: COLORS.text.light }]}>Etkinlik</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.text.dark }]}>158</Text>
              <Text style={[styles.statLabel, { color: COLORS.text.light }]}>Takipçi</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.text.dark }]}>142</Text>
              <Text style={[styles.statLabel, { color: COLORS.text.light }]}>Takip</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.editProfileButton, { borderColor: COLORS.primary }]}
            onPress={navigateToEditProfile}
          >
            <Text style={[styles.editProfileButtonText, { color: COLORS.primary }]}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>
        
        {/* Aktivite Özeti */}
        <View style={[styles.sectionCard, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text.dark }]}>Aktivite Özeti</Text>
          <View style={styles.activityGrid}>
            <View style={[styles.activityItem, { backgroundColor: COLORS.background }]}>
              <Text style={[styles.activityValue, { color: COLORS.primary }]}>124</Text>
              <Text style={[styles.activityLabel, { color: COLORS.text.light }]}>km</Text>
              <Text style={[styles.activityType, { color: COLORS.text.light }]}>Koşu</Text>
            </View>
            <View style={[styles.activityItem, { backgroundColor: COLORS.background }]}>
              <Text style={[styles.activityValue, { color: COLORS.primary }]}>2,453</Text>
              <Text style={[styles.activityLabel, { color: COLORS.text.light }]}>kcal</Text>
              <Text style={[styles.activityType, { color: COLORS.text.light }]}>Yakılan</Text>
            </View>
            <View style={[styles.activityItem, { backgroundColor: COLORS.background }]}>
              <Text style={[styles.activityValue, { color: COLORS.primary }]}>32</Text>
              <Text style={[styles.activityLabel, { color: COLORS.text.light }]}>saat</Text>
              <Text style={[styles.activityType, { color: COLORS.text.light }]}>Egzersiz</Text>
            </View>
            <View style={[styles.activityItem, { backgroundColor: COLORS.background }]}>
              <Text style={[styles.activityValue, { color: COLORS.primary }]}>8</Text>
              <Text style={[styles.activityLabel, { color: COLORS.text.light }]}>rota</Text>
              <Text style={[styles.activityType, { color: COLORS.text.light }]}>Tamamlanan</Text>
            </View>
          </View>
        </View>
        
        {/* Rozetler */}
        <View style={[styles.sectionCard, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text.dark }]}>Rozetlerim</Text>
          <View style={styles.badgesContainer}>
            <View style={styles.badgeItem}>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>🏃</Text>
              </View>
              <Text style={[styles.badgeName, { color: COLORS.text.dark }]}>Koşucu</Text>
            </View>
            <View style={styles.badgeItem}>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>🚴</Text>
              </View>
              <Text style={[styles.badgeName, { color: COLORS.text.dark }]}>Bisikletçi</Text>
            </View>
            <View style={styles.badgeItem}>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>🏆</Text>
              </View>
              <Text style={[styles.badgeName, { color: COLORS.text.dark }]}>Şampiyon</Text>
            </View>
            <View style={styles.badgeItem}>
              <View style={[styles.badge, styles.lockedBadge]}>
                <Text style={styles.badgeIcon}>🏊</Text>
              </View>
              <Text style={[styles.badgeName, { color: COLORS.text.light }]}>Yüzücü</Text>
            </View>
          </View>
        </View>
        
        {/* Ayarlar */}
        <View style={[styles.sectionCard, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text.dark }]}>Hızlı Ayarlar</Text>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleToggleTheme}
          >
            <Text style={[styles.settingLabel, { color: COLORS.text.dark }]}>
              {isDarkMode ? '🌙 Karanlık Mod' : '☀️ Aydınlık Mod'}
            </Text>
            <Text style={[styles.settingValue, { color: COLORS.text.light }]}>
              {isDarkMode ? 'Açık' : 'Kapalı'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingRow, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <Text style={[styles.settingLabel, { color: 'red' }]}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    marginTop: 5,
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  editProfileButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editProfileButtonText: {
    fontWeight: 'bold',
  },
  sectionCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityItem: {
    width: '48%',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  activityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  activityLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  activityType: {
    fontSize: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeItem: {
    alignItems: 'center',
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE082',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  lockedBadge: {
    backgroundColor: '#E0E0E0',
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeName: {
    fontSize: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
}); 