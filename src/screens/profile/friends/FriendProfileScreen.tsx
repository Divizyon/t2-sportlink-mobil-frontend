import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { useFriendsStore } from '../../../store/userStore/friendsStore';
import { FriendshipStatus } from '../../../api/friends/friendsApi';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { getConfigValues } from '../../../store/appStore/configStore';
import { tokenManager } from '../../../utils/tokenManager';

// Tipler
type FriendProfileParams = {
  FriendProfile: {
    userId: string;
  };
};

// Kullanıcı profil bilgileri
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture?: string;
  user_sports?: {
    id: string;
    name: string;
    icon: string;
    skill_level: string;
  }[];
  stats?: {
    createdEventsCount: number;
    participatedEventsCount: number;
    averageRating: number;
    friendsCount: number;
  };
}

/**
 * Arkadaş profil detayları ekranı
 */
export const FriendProfileScreen: React.FC = () => {
  const route = useRoute<RouteProp<FriendProfileParams, 'FriendProfile'>>();
  const navigation = useNavigation();
  const { theme } = useThemeStore();
  const { 
    checkFriendshipStatus, 
    sendFriendRequest, 
    cancelFriendRequest,
    acceptFriendRequest,
    removeFriend,
    rejectFriendRequest,
    getUserProfile,
    isLoadingUserProfile,
    userProfileError
  } = useFriendsStore();

  const userId = route.params.userId;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'cancel' | 'remove'>('cancel');
  const [retryCount, setRetryCount] = useState(0);

  // Profil yükleme fonksiyonu
  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Arkadaşlık durumunu kontrol et
      const status = await checkFriendshipStatus(userId);
      if (status) {
        setFriendshipStatus(status);
      }
      
      // Zustand store ile kullanıcı profilini al
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
        setError(null);
      } else {
        // userProfileError kontrolü
        if (userProfileError) {
          setError(userProfileError);
        } else {
          setError('Kullanıcı profili bulunamadı.');
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
      
      // Detaylı hata mesajı
      let errorMessage = 'Profil bilgileri yüklenirken bir hata oluştu.';
      if (error instanceof Error) {
        if (error.message.includes('Network Error')) {
          errorMessage = 'İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Kullanıcı profili bulunamadı.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Profil bilgisini ve arkadaşlık durumunu yükle
  useEffect(() => {
    loadProfileData();
  }, [userId, userProfileError]);

  // Retry fonksiyonu
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
    
    // Kısa bir gecikme ile yeniden dene
    setTimeout(() => {
      loadProfileData();
    }, 1000);
  };

  // Arkadaşlık isteği gönder
  const handleSendRequest = async () => {
    try {
      setIsActionLoading(true);
      const success = await sendFriendRequest(userId);
      if (success) {
        // Durumu güncelle
        const newStatus = await checkFriendshipStatus(userId);
        setFriendshipStatus(newStatus || null);
      }
    } catch (error) {
      console.error('İstek gönderme hatası:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  // İstek iptalini onayla
  const confirmCancelRequest = async () => {
    try {
      setIsActionLoading(true);
      const success = await cancelFriendRequest(userId);
      if (success) {
        // Durumu güncelle
        const newStatus = await checkFriendshipStatus(userId);
        setFriendshipStatus(newStatus || null);
      }
    } catch (error) {
      console.error('İstek iptal hatası:', error);
    } finally {
      setIsActionLoading(false);
      setIsModalVisible(false);
    }
  };

  // Arkadaşlıktan çıkarmayı onayla
  const confirmRemoveFriend = async () => {
    try {
      setIsActionLoading(true);
      const success = await removeFriend(userId);
      if (success) {
        // Durumu güncelle
        const newStatus = await checkFriendshipStatus(userId);
        setFriendshipStatus(newStatus || null);
      }
    } catch (error) {
      console.error('Arkadaş silme hatası:', error);
    } finally {
      setIsActionLoading(false);
      setIsModalVisible(false);
    }
  };

  // Arkadaşlık isteğini kabul et
  const handleAcceptRequest = async () => {
    if (!friendshipStatus?.request?.id) {
      console.error('İstek ID bulunamadı');
      return;
    }
    
    try {
      setIsActionLoading(true);
      const success = await acceptFriendRequest(friendshipStatus.request.id);
      if (success) {
        // Durumu güncelle
        const newStatus = await checkFriendshipStatus(userId);
        setFriendshipStatus(newStatus || null);
      }
    } catch (error) {
      console.error('İstek kabul hatası:', error);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Arkadaşlık isteğini reddet
  const handleRejectRequest = async () => {
    if (!friendshipStatus?.request?.id) {
      console.error('İstek ID bulunamadı');
      return;
    }
    
    try {
      setIsActionLoading(true);
      
      // Arkadaşlık isteğini reddet API çağrısı
      const success = await rejectFriendRequest(friendshipStatus.request.id);
      
      if (success) {
        // Durumu güncelle
        const newStatus = await checkFriendshipStatus(userId);
        setFriendshipStatus(newStatus || null);
      }
    } catch (error) {
      console.error('İstek reddetme hatası:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Modal işlemlerini yönet
  const handleModalAction = (action: 'cancel' | 'remove') => {
    setModalAction(action);
    setIsModalVisible(true);
  };

  // Arkadaşlık durumuna göre buton render et
  const renderActionButton = () => {
    if (!friendshipStatus) return null;
    
    switch (friendshipStatus.status) {
      case 'friend':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: theme.colors.error }]}
            onPress={() => handleModalAction('remove')}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <ActivityIndicator size="small" color={theme.colors.error} />
            ) : (
              <>
                <Ionicons name="person-remove-outline" size={18} color={theme.colors.error} />
                <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                  Arkadaşlıktan Çıkar
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
        
      case 'sent':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: theme.colors.accent }]}
            onPress={() => handleModalAction('cancel')}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={18} color={theme.colors.accent} />
                <Text style={[styles.actionButtonText, { color: theme.colors.accent }]}>
                  İsteği İptal Et
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
        
      case 'received':
        return (
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.halfButton, { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
              onPress={handleAcceptRequest}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={18} color="white" />
                  <Text style={[styles.actionButtonText, { color: "white" }]}>
                    Kabul Et
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.halfButton, { borderColor: theme.colors.error }]}
              onPress={handleRejectRequest}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ActivityIndicator size="small" color={theme.colors.error} />
              ) : (
                <>
                  <Ionicons name="close-outline" size={18} color={theme.colors.error} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                    Reddet
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );
        
      case 'none':
      default:
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: theme.colors.accent }]}
            onPress={handleSendRequest}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={18} color={theme.colors.accent} />
                <Text style={[styles.actionButtonText, { color: theme.colors.accent }]}>
                  Arkadaş Ekle
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
    }
  };

  // Yükleme durumu
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profil</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Profil yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profil</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => {
              setIsLoading(true);
              setError(null);
              // Profil bilgisini yeniden yükle
            }}
          >
            <Text style={[styles.retryButtonText, { color: 'white' }]}>
              Tekrar Dene
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profil</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.accent }]}
            onPress={handleRetry}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={16} color="white" />
            <Text style={styles.retryButtonText}>
              {isLoading ? 'Yükleniyor...' : 'Tekrar Dene'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Profil bulunamadı
  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profil</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Kullanıcı profili bulunamadı.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profil</Text>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profil Bölümü */}
        <View style={[styles.profileSection, { backgroundColor: theme.colors.cardBackground }]}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {profile.profile_picture ? (
              <Image 
                source={{ uri: profile.profile_picture }} 
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.accent }]}>
                <Text style={styles.avatarText}>
                  {profile.first_name?.charAt(0).toUpperCase() || ''}
                  {profile.last_name?.charAt(0).toUpperCase() || ''}
                </Text>
              </View>
            )}
          </View>
          
          {/* Kullanıcı Bilgileri */}
          <Text style={[styles.fullName, { color: theme.colors.text }]}>
            {profile.first_name} {profile.last_name}
          </Text>
          
          <Text style={[styles.username, { color: theme.colors.textSecondary }]}>
            @{profile.username}
          </Text>
          
          {/* İstatistikler */}
          {profile.stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {profile.stats.createdEventsCount || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Oluşturulan
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {profile.stats.participatedEventsCount || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Katılınan
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {profile.stats.friendsCount || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Arkadaş
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {profile.stats.averageRating ? 
                    (typeof profile.stats.averageRating === 'number' 
                      ? profile.stats.averageRating.toFixed(1) 
                      : profile.stats.averageRating)
                    : '0.0'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Değerlendirme
                </Text>
              </View>
            </View>
          )}
          
          {/* Arkadaşlık Butonu */}
          <View style={styles.actionButtonContainer}>
            {renderActionButton()}
          </View>
        </View>
        
        {/* Spor Tercihleri Bölümü */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Spor Tercihleri
          </Text>
          
          {profile.user_sports && profile.user_sports.length > 0 ? (
            <View style={styles.sportsList}>
              {profile.user_sports.map((sport, index) => (
                <View key={index} style={styles.sportItem}>
                  <Ionicons 
                    name={sport.icon as any} 
                    size={24} 
                    color={theme.colors.accent}
                    style={styles.sportIcon}
                  />
                  <View>
                    <Text style={[styles.sportName, { color: theme.colors.text }]}>
                      {sport.name}
                    </Text>
                    <Text style={[styles.sportLevel, { color: theme.colors.textSecondary }]}>
                      {sport.skill_level === 'beginner' && 'Başlangıç'}
                      {sport.skill_level === 'intermediate' && 'Orta Seviye'}
                      {sport.skill_level === 'advanced' && 'İleri Seviye'}
                      {sport.skill_level === 'professional' && 'Profesyonel'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptySportsText, { color: theme.colors.textSecondary }]}>
              Bu kullanıcı henüz spor tercihi belirtmemiş.
            </Text>
          )}
        </View>
      </ScrollView>
      
      {/* Onay Modalı */}
      <ConfirmationModal
        visible={isModalVisible}
        title={modalAction === 'cancel' ? 'İstek İptali' : 'Arkadaşlıktan Çıkar'}
        message={
          modalAction === 'cancel'
            ? `${profile.first_name} ${profile.last_name} adlı kişiye gönderdiğiniz arkadaşlık isteğini iptal etmek istediğinize emin misiniz?`
            : `${profile.first_name} ${profile.last_name} adlı kişiyi arkadaşlıktan çıkarmak istediğinize emin misiniz?`
        }
        confirmText={modalAction === 'cancel' ? 'İptal Et' : 'Çıkar'}
        cancelText="Vazgeç"
        confirmIcon={modalAction === 'cancel' ? 'close-circle-outline' : 'person-remove-outline'}
        isDestructive={true}
        onConfirm={modalAction === 'cancel' ? confirmCancelRequest : confirmRemoveFriend}
        onCancel={() => setIsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scrollContainer: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileSection: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  actionButtonContainer: {
    marginTop: 24,
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 0.48,
  },
  sectionContainer: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sportsList: {
    width: '100%',
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportIcon: {
    marginRight: 12,
  },
  sportName: {
    fontSize: 16,
    fontWeight: '500',
  },
  sportLevel: {
    fontSize: 14,
    marginTop: 2,
  },
  emptySportsText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginLeft: 8,
  },
});

export default FriendProfileScreen; 