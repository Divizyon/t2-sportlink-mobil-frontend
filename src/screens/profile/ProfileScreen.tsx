import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useProfileStore } from '../../store/userStore/profileStore';
import { ProfileHeader } from '../../components/Profile/ProfileHeader';
import { SportPreferencesCard } from '../../components/Profile/SportPreferencesCard';
import { FriendsCard } from '../../components/Profile/FriendsCard';
import { LocationCard } from '../../components/Profile/LocationCard';

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
  
  const [refreshing, setRefreshing] = useState(false);

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
    } catch (error) {
      console.error('Profil yenilenirken hata:', error);
    } finally {
      setRefreshing(false);
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
    // TODO: Konum düzenleme sayfasına yönlendir
    console.log('Konum düzenleme sayfasına yönlendirme');
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
        
        {/* Konum Bilgisi */}
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
  }
}); 