import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  Text,
  TouchableOpacity
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useProfileStore } from '../../store/userStore/profileStore';
import { useMapsStore } from '../../store/appStore/mapsStore';
import { ProfileHeader } from '../../components/Profile/ProfileHeader';
import { SportPreferencesCard } from '../../components/Profile/SportPreferencesCard';
import { FriendsCard } from '../../components/Profile/FriendsCard';
import { LocationCard } from '../../components/Profile/LocationCard';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen: React.FC = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const { 
    userInfo, 
    stats, 
    sportPreferences, 
    defaultLocation, 
    friendsSummary,
    isLoading,
    fetchUserProfile
  } = useProfileStore();
  
  // Güncel konum bilgisini al
  const { 
    lastLocation, 
    locationStatus, 
    refreshLocation,
    getLastLocation
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
      await refreshLocation();
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
      await refreshLocation();
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
    // TODO: Spor tercihleri düzenleme sayfasına yönlendir
    console.log('Spor tercihleri düzenleme sayfasına yönlendirme');
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
    // TODO: Arkadaşlık istekleri sayfasına yönlendir
    console.log('Arkadaşlık istekleri sayfasına yönlendirme');
  };

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
            stats={{
              createdEvents: stats?.createdEventsCount || 0,
              joinedEvents: stats?.participatedEventsCount || 0,
              rating: stats?.averageRating || 0,
              friends: stats?.friendsCount || 0
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
        
        {/* Varsayılan Konum Bilgisi */}
        {defaultLocation && (
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
        )}
        
        {/* Güncel Konum Bilgisi */}
        {lastLocation && (
          <View style={[styles.currentLocationContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.locationHeader}>
              <View style={styles.headerTitleContainer}>
                <Ionicons name="navigate" size={20} color={theme.colors.accent} style={styles.headerIcon} />
                <Text style={[styles.currentLocationTitle, { color: theme.colors.text }]}>
                  Güncel Konumum
                </Text>
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
                <Text style={[styles.locationAddressText, { color: theme.colors.text }]}>
                  {lastLocation.address || 'Bilinmeyen adres'}
                </Text>
                <Text style={[styles.coordinatesText, { color: theme.colors.textSecondary }]}>
                  {lastLocation.latitude.toFixed(6)}, {lastLocation.longitude.toFixed(6)}
                </Text>
                <Text style={[styles.timestampText, { color: theme.colors.textSecondary }]}>
                  Son güncelleme: {new Date(lastLocation.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.updateButton, { borderColor: theme.colors.accent }]} 
              onPress={handleRefreshLocation}
              disabled={isRefreshingLocation}
            >
              <Ionicons name="navigate-outline" size={16} color={theme.colors.accent} style={styles.buttonIcon} />
              <Text style={[styles.updateButtonText, { color: theme.colors.accent }]}>
                Konumu Güncelle
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
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
  },
  // Güncel konum için stiller
  currentLocationContainer: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 6,
  },
  currentLocationTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 6,
  },
  locationDetailsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  locationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationAddressText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 20,
    alignSelf: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 