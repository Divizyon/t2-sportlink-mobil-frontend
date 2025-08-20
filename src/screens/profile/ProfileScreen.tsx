import React, { useEffect, useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
  Image
} from 'react-native';

import { useThemeStore } from '../../store/appStore/themeStore';
import { useProfileStore } from '../../store/userStore/profileStore';
import { useMapsStore } from '../../store/appStore/mapsStore';
import { ProfileHeader } from '../../components/Profile/ProfileHeader';
import { SportPreferencesCard } from '../../components/Profile/SportPreferencesCard';
import { FriendsCard } from '../../components/Profile/FriendsCard';
import { LocationCard } from '../../components/Profile/LocationCard';
import { Ionicons } from '@expo/vector-icons';
import { BasketballLoader, DivizyonFooter } from '../../components/common';

export const ProfileScreen: React.FC = ({ navigation }: any) => {
  // ...existing code...
  // ...existing code...
  const { theme } = useThemeStore();
  const { 
    userInfo, 
    stats, 
    sportPreferences, 
    defaultLocation, 
    friendsSummary,
    isLoading,
    fetchUserProfile,
    updateSportPreference,
    removeSportPreference
  } = useProfileStore();
  
  // Güncel konum bilgisini al
  const { 
    lastLocation, 
    initLocation 
  } = useMapsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        await fetchUserProfile();
      } catch (err) {
        console.error('Profil verileri getirilirken hata:', err);
      }
    };
    
    loadProfileData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserProfile();
      // Konum bilgisini de yenile
      await initLocation();
    } catch (error) {
      console.error('Profil yenilenirken hata:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Konumu güncelle
  const handleRefreshLocation = async () => {
    setIsRefreshingLocation(true);
    try {
      await initLocation();
    } catch (error) {
      console.error('Konum güncellenirken hata:', error);
    } finally {
      setIsRefreshingLocation(false);
    }
  };

  // Profil düzenleme işlemi
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  // Spor tercihleri düzenleme
  const handleEditSports = () => {
    navigation.navigate('EditSportPreferences');
  };

  // Konum düzenleme
  const handleEditLocation = () => {
    navigation.navigate('EditProfile', { showLocationSection: true });
  };

  // Arkadaşları görüntüle
  const handleViewFriends = () => {
    navigation.navigate('FriendsList');
  };

  // Arkadaşlık isteklerini görüntüle
  const handleViewRequests = () => {
    navigation.navigate('FriendRequests');
  };

    // Katılım etkinliklerine yönlendir
    const handleViewParticipatedEvents = () => {
      if (userInfo) {
        navigation.navigate('UserEvents', { filter: 'participated', userId: userInfo.id, title: 'Katıldığım Etkinlikler' });
      }
    };

  if (isLoading && !refreshing && !userInfo) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <View style={styles.loadingContainer}>
          <BasketballLoader size={120} />
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
        {/* Modern Profil Kartı */}
        {userInfo && (
          <View style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <View style={styles.avatarContainer}>
                <Image
                  source={userInfo.profilePicture ? { uri: userInfo.profilePicture } : require('../../../assets/pp.png')}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.profileInfoContainer}>
                <Text style={[styles.profileName, { color: theme.colors.text }]}>
                  {userInfo.firstName} {userInfo.lastName}
                </Text>
                <Text style={[styles.profileUsername, { color: theme.colors.textSecondary }]}>@{userInfo.username}</Text>
                <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                  <Ionicons name="create-outline" size={18} color={theme.colors.accent} />
                  <Text style={[styles.editProfileText, { color: theme.colors.accent }]}>Profili Düzenle</Text>
                </TouchableOpacity>
              </View>
              {/* Ayarlar Butonu */}
              <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}> 
                <Ionicons name="settings-outline" size={26} color={theme.colors.accent} />
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('UserEvents', { filter: 'created', userId: userInfo.id, title: 'Oluşturulan Etkinlikler' })}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.accent} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats?.createdEventsCount || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Oluşturulan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem} onPress={handleViewParticipatedEvents}>
                <Ionicons name="checkmark-done-outline" size={18} color={theme.colors.accent} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats?.participatedEventsCount || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Katılım</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem} onPress={handleViewFriends}>
                <Ionicons name="people-outline" size={18} color={theme.colors.accent} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats?.friendsCount || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Arkadaş</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Expandable Spor Tercihleri Kartı */}
        {/* Spor Tercihleri */}
        <View style={styles.cardWrapper}>
          <SportPreferencesCard
            sportPreferences={sportPreferences}
            themeColors={{
              cardBackground: theme.colors.cardBackground,
              text: theme.colors.text,
              textSecondary: theme.colors.textSecondary,
              accent: theme.colors.accent
            }}
          />
        </View>

        {/* Varsayılan Konum Bilgisi */}
        {defaultLocation && (
          <View style={styles.cardWrapper}>
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
          </View>
        )}

        {/* Güncel Konum Bilgisi */}
        {lastLocation && (
          <View style={[styles.currentLocationContainer, { backgroundColor: theme.colors.cardBackground }]}> 
            <View style={styles.locationHeader}>
              <View style={styles.headerTitleContainer}>
                <Ionicons name="navigate" size={20} color={theme.colors.accent} style={styles.headerIcon} />
                <Text style={[styles.currentLocationTitle, { color: theme.colors.text }]}>Güncel Konumum</Text>
              </View>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={handleRefreshLocation}
                disabled={isRefreshingLocation}
              >
                {isRefreshingLocation ? (
                  <ActivityIndicator size="small" color={theme.colors.accent} />
                ) : (
                  <Ionicons name="refresh" size={22} color={theme.colors.accent} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.locationDetailsContainer}>
              <View style={[styles.locationIconContainer, { backgroundColor: theme.colors.accent + '20' }]}> 
                <Ionicons name="location" size={24} color={theme.colors.accent} />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={[styles.locationAddressText, { color: theme.colors.text }]}>{lastLocation.address || 'Bilinmeyen adres'}</Text>
                <Text style={[styles.coordinatesText, { color: theme.colors.textSecondary }]}>{lastLocation.latitude.toFixed(6)}, {lastLocation.longitude.toFixed(6)}</Text>
                <Text style={[styles.timestampText, { color: theme.colors.textSecondary }]}>Son güncelleme: {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.updateButton, { borderColor: theme.colors.accent }]} 
              onPress={handleRefreshLocation}
              disabled={isRefreshingLocation}
            >
              <Ionicons name="navigate-outline" size={16} color={theme.colors.accent} style={styles.buttonIcon} />
              <Text style={[styles.updateButtonText, { color: theme.colors.accent }]}>Konumu Güncelle</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Arkadaşlık Durumu */}
        {friendsSummary && (
          <View style={styles.cardWrapper}>
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
          </View>
        )}
      </ScrollView>
      <DivizyonFooter />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  settingsButton: {
    marginLeft: 12,
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    alignSelf: 'flex-start',
  },
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
    paddingVertical: 24,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },
  avatarContainer: {
    marginRight: 18,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#eee',
    width: 80,
    height: 80,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  profileInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 8,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    marginBottom: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  cardWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  // Güncel konum için stiller
  currentLocationContainer: {
    padding: 16,
    borderRadius: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 6,
  },
  currentLocationTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
  },
  locationDetailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  locationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f7f7f7',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationAddressText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  coordinatesText: {
    fontSize: 12,
    marginBottom: 2,
  },
  timestampText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 18,
    alignSelf: 'center',
    backgroundColor: '#f2f2f2',
    marginTop: 2,
  },
  buttonIcon: {
    marginRight: 6,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});