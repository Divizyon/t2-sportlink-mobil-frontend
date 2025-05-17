import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useFriendsStore } from '../../store/userStore/friendsStore';
import { ProfileHeader } from '../../components/Profile/ProfileHeader';
import { SportPreferencesCard } from '../../components/Profile/SportPreferencesCard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Navigasyon için tip tanımları
type RootStackParamList = {
  FriendProfile: { userId: string };
  NewConversation: { preSelectedUser: string };
};

type FriendProfileNavigationProp = StackNavigationProp<RootStackParamList>;

interface FriendProfileRouteParams {
  userId: string;
}

export const FriendProfileScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<FriendProfileNavigationProp>();
  const route = useRoute();
  const params = route.params as FriendProfileRouteParams;
  
  const { 
    userProfile, 
    isLoadingUserProfile, 
    userProfileError,
    getUserProfile,
    clearUserProfile,
    sendFriendRequest,
    checkFriendshipStatus,
    removeFriend,
    isProcessingRequest
  } = useFriendsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'friend' | 'sent' | 'received'>('none');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (params?.userId) {
        await getUserProfile(params.userId);
        
        // Arkadaşlık durumunu kontrol et
        const status = await checkFriendshipStatus(params.userId);
        if (status) {
          setFriendshipStatus(status.status);
        }
      } else {
        Alert.alert('Hata', 'Kullanıcı kimliği bulunamadı');
        navigation.goBack();
      }
    };
    
    fetchUserProfile();
    
    // Temizlik fonksiyonu
    return () => {
      clearUserProfile();
    };
  }, [params?.userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (params?.userId) {
        await getUserProfile(params.userId);
        
        // Arkadaşlık durumunu da yenile
        const status = await checkFriendshipStatus(params.userId);
        if (status) {
          setFriendshipStatus(status.status);
        }
      }
    } catch (error) {
      console.error('Profil yenilenirken hata:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Arkadaşlık isteği gönder
  const handleAddFriend = async () => {
    if (params?.userId) {
      const success = await sendFriendRequest(params.userId);
      if (success) {
        setFriendshipStatus('sent');
      }
    }
  };

  // Arkadaşlıktan çıkar
  const handleRemoveFriend = async () => {
    if (params?.userId) {
      Alert.alert(
        'Arkadaşlıktan Çıkar',
        `${userProfile?.first_name} ${userProfile?.last_name} adlı kişiyi arkadaşlıktan çıkarmak istediğinize emin misiniz?`,
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Çıkar', 
            style: 'destructive',
            onPress: async () => {
              const success = await removeFriend(params.userId);
              if (success) {
                setFriendshipStatus('none');
              }
            }
          }
        ]
      );
    }
  };

  // Mesajlaşma başlat
  const handleSendMessage = () => {
    if (params?.userId && userProfile) {
      navigation.navigate('NewConversation', {
        preSelectedUser: params.userId
      });
    }
  };

  // Arkadaşlık butonunu render et
  const renderFriendshipButton = () => {
    if (isProcessingRequest) {
      return (
        <TouchableOpacity 
          style={[styles.actionButton, styles.loadingButton, { borderColor: theme.colors.accent }]}
          disabled={true}
        >
          <ActivityIndicator size="small" color={theme.colors.accent} />
        </TouchableOpacity>
      );
    }

    switch (friendshipStatus) {
      case 'friend':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
            onPress={handleRemoveFriend}
          >
            <Ionicons name="people" size={18} color="white" />
            <Text style={[styles.buttonText, { color: 'white' }]}>Arkadaşım</Text>
          </TouchableOpacity>
        );
      case 'sent':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
            disabled={true}
          >
            <Ionicons name="time" size={18} color="white" />
            <Text style={[styles.buttonText, { color: 'white' }]}>İstek Gönderildi</Text>
          </TouchableOpacity>
        );
      case 'received':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: theme.colors.accent }]}
            disabled={true}
          >
            <Ionicons name="person-add" size={18} color={theme.colors.accent} />
            <Text style={[styles.buttonText, { color: theme.colors.accent }]}>İstek Alındı</Text>
          </TouchableOpacity>
        );
      default: // 'none'
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: theme.colors.accent }]}
            onPress={handleAddFriend}
          >
            <Ionicons name="person-add-outline" size={18} color={theme.colors.accent} />
            <Text style={[styles.buttonText, { color: theme.colors.accent }]}>Arkadaş Ekle</Text>
          </TouchableOpacity>
        );
    }
  };

  if (isLoadingUserProfile && !userProfile && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Profil bilgileri yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (userProfileError && !userProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {userProfileError}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { borderColor: theme.colors.accent }]}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={18} color={theme.colors.accent} />
            <Text style={[styles.buttonText, { color: theme.colors.accent }]}>
              Tekrar Dene
            </Text>
          </TouchableOpacity>
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
        {userProfile && (
          <>
            <ProfileHeader 
              firstName={userProfile.first_name}
              lastName={userProfile.last_name}
              username={userProfile.username}
              profilePicture={userProfile.profile_picture}
              stats={{
                createdEvents: userProfile.stats?.createdEventsCount || 0,
                joinedEvents: userProfile.stats?.participatedEventsCount || 0,
                rating: userProfile.stats?.averageRating || 0,
                friends: userProfile.stats?.friendsCount || 0
              }}
            />
            
            {/* Arkadaşlık Durumu ve Mesajlaşma Butonları */}
            <View style={styles.actionButtonsContainer}>
              {renderFriendshipButton()}
              
              {friendshipStatus === 'friend' && (
                <TouchableOpacity 
                  style={[styles.actionButton, { borderColor: theme.colors.accent }]}
                  onPress={handleSendMessage}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={theme.colors.accent} />
                  <Text style={[styles.buttonText, { color: theme.colors.accent }]}>Mesaj Gönder</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Spor Tercihleri */}
            {userProfile.user_sports && userProfile.user_sports.length > 0 && (
              <View style={[styles.sportPreferencesContainer, { backgroundColor: theme.colors.cardBackground }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="fitness" size={20} color={theme.colors.accent} style={styles.headerIcon} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Spor İlgi Alanları
                  </Text>
                </View>
                
                <View style={styles.sportsList}>
                  {userProfile.user_sports.map((sport, index) => (
                    <View key={index} style={styles.sportItem}>
                      <View style={[styles.sportIconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
                        <Ionicons 
                          name={sport.icon as any || 'fitness-outline' as any} 
                          size={18} 
                          color={theme.colors.accent} 
                        />
                      </View>
                      <Text style={[styles.sportName, { color: theme.colors.text }]}>
                        {sport.name}
                      </Text>
                      <View style={[styles.skillLevelBadge, { backgroundColor: theme.colors.accent + '20' }]}>
                        <Text style={[styles.skillLevelText, { color: theme.colors.accent }]}>
                          {sport.skill_level === 'beginner' ? 'Başlangıç' : 
                           sport.skill_level === 'intermediate' ? 'Orta' :
                           sport.skill_level === 'advanced' ? 'İleri' : 'Profesyonel'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 20,
    minWidth: 130,
  },
  loadingButton: {
    minWidth: 130,
    height: 36,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  sportPreferencesContainer: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sportsList: {
    gap: 12,
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sportName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  skillLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillLevelText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 