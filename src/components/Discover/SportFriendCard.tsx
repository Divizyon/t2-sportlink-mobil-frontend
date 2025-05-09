import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useFriendsStore } from '../../store/userStore/friendsStore';
import { useNavigation } from '@react-navigation/native';

interface SportFriend {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  age?: number;
  user_sports?: {
    user_id?: string;
    sport_id: string;
    skill_level?: string;
    sport: {
      id: string;
      name: string;
      description?: string;
      icon: string;
    };
  }[];
  sports?: {
    id: string;
    name: string;
    icon: string;
    skill_level?: string;
  }[];
  profile_picture?: string;
  common_friends?: number;
  common_sports?: number;
  interests?: {
    id: string;
    name: string;
    icon: string;
    skill_level?: string;
  }[];
}

interface SportFriendCardProps {
  friend: SportFriend;
  onPress?: () => void;
  cardStyle?: object;
}

export const SportFriendCard: React.FC<SportFriendCardProps> = ({ friend, onPress, cardStyle }) => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const { 
    sendFriendRequest, 
    cancelFriendRequest,
    checkFriendshipStatus, 
    isProcessingRequest,
    error,
    message
  } = useFriendsStore();
  
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'sent' | 'received' | 'friend'>('none');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Arkadaşlık durumunu kontrol et
  useEffect(() => {
    const checkStatus = async () => {
      setIsCheckingStatus(true);
      const status = await checkFriendshipStatus(friend.id);
      if (status) {
        setFriendshipStatus(status.status);
      } else {
        setFriendshipStatus('none');
      }
      setIsCheckingStatus(false);
    };
    
    checkStatus();
  }, [friend.id]);



  // Arkadaşlık isteği gönder
  const handleAddFriend = async () => {
    try {
      setIsLoading(true); // Kart özel loading başlat
      const success = await sendFriendRequest(friend.id);
      if (success) {
        setFriendshipStatus('sent');
      } else {
      }
    } catch (err) {
      console.error("Arkadaşlık isteği gönderirken hata:", err);
    } finally {
      setIsLoading(false); // Kart özel loading bitir
    }
  };

  // İstek iptali modalını göster
  const handleCancelRequest = () => {
    setIsModalVisible(true);
  };

  // İstek iptalini onayla
  const confirmCancelRequest = async () => {
    try {
      setIsLoading(true); // Kart özel loading başlat
      const success = await cancelFriendRequest(friend.id);
      if (success) {
        setFriendshipStatus('none');
      } else {
        console.log("Arkadaşlık isteği iptal edilemedi:", error);
      }
    } catch (err) {
      console.error("Arkadaşlık isteği iptal edilirken hata:", err);
    } finally {
      setIsLoading(false); // Kart özel loading bitir
      setIsModalVisible(false);
    }
  };

  // Mesaj gönderme işlemi
  const handleSendMessage = () => {
    // Konuşma başlatmak için "NewConversation" ekranına yönlendir
    // ve başlatılacak konuşmanın kullanıcısını seç
    navigation.navigate('NewConversation', {
      preSelectedUser: friend.id
    });
  };

  // Buton içeriğini ve davranışını belirle
  const renderButton = () => {
    if (isCheckingStatus) {
      return (
        <View style={[styles.addButton, { borderColor: theme.colors.accent }]}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
        </View>
      );
    }

    if (friendshipStatus === 'friend') {
      return (
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.friendButton, { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
            disabled={true}
          >
            <Ionicons name="checkmark" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.messageButton, { borderColor: theme.colors.accent }]}
            onPress={handleSendMessage}
          >
            <Ionicons name="chatbubble-outline" size={18} color={theme.colors.accent} />
          </TouchableOpacity>
        </View>
      );
    }

    if (friendshipStatus === 'sent') {
      return (
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
          onPress={handleCancelRequest}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color="white" />
              <Text style={[styles.addButtonText, { color: "white" }]}>
                İstek Gönderildi
              </Text>
            </>
          )}
        </TouchableOpacity>
      );
    }

    if (friendshipStatus === 'received') {
      return (
        <TouchableOpacity 
          style={[styles.addButton, { borderColor: theme.colors.accent }]}
          disabled={true} // Bu kart içinde kabul etmeye izin vermiyoruz, bildirimlerden yapılabilir
        >
          <Ionicons name="time-outline" size={20} color={theme.colors.accent} />
          <Text style={[styles.addButtonText, { color: theme.colors.accent }]}>
            İstek Alındı
          </Text>
        </TouchableOpacity>
      );
    }

    // Varsayılan durum: 'none'
    return (
      <TouchableOpacity 
        style={[styles.addButton, { borderColor: theme.colors.accent }]}
        onPress={handleAddFriend}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.accent} />
        ) : (
          <>
            <Ionicons name="person-add-outline" size={18} color={theme.colors.accent} />
            <Text style={[styles.addButtonText, { color: theme.colors.accent }]}>
              Arkadaş Ekle
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };
  
  // Profil detaylarına git
  const handleProfilePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigasyon ile kullanıcı profil detayına git
      navigation.navigate('FriendProfile', { userId: friend.id });
    }
  };

  // Farklı formatlardaki spor verilerini standardize et ve getir
  const getSportsList = () => {

    
    // 1. Öncelikle interests alanını kontrol et - en basit format
    if (friend.interests && friend.interests.length > 0) {
      return friend.interests;
    }
    
    // 2. user_sports alanını kontrol et - API'den gelen kompleks format
    if (friend.user_sports && friend.user_sports.length > 0) {
      // user_sports'u standart formata dönüştür
      return friend.user_sports.map(item => ({
        id: item.sport_id || (item.sport && item.sport.id) || "",
        name: (item.sport && item.sport.name) || "Spor Bilgisi Yok",
        icon: (item.sport && item.sport.icon) || "fitness-outline",
        skill_level: item.skill_level || "beginner"
      }));
    }
    
    // 3. Basit sports alanını kontrol et
    if (friend.sports && friend.sports.length > 0) {
      return friend.sports;
    }
    
    // Hiçbir spor verisi bulunamadıysa boş dizi döndür
    return [];
  };

  const sportsList = getSportsList();

  // Spor ikonunu güvenli şekilde al (varsayılan değer ile)
  const getSportIcon = (item: any) => {
    // İkon adını ayarla, varsayılan olarak 'fitness-outline' kullan
    let iconName = 'fitness-outline';
    
    if (typeof item === 'object' && item !== null) {
      if (item.icon) {
        iconName = item.icon;
      }
    }
    
    // İkon adı sabit değerlerden birine uyuyorsa doğrudan döndür
    if (['football-icon', 'football-outline', 'basketball-icon', 'basketball-outline', 
         'tennis-icon', 'tennis-outline', 'fitness-outline', 'bicycle-outline', 
         'walk-outline', 'water-outline'].includes(iconName)) {
      return iconName;
    }
    
    // İkon eşleştirme - API'den gelen özel format
    if (iconName === 'football-icon') return 'football-outline';
    if (iconName === 'basketball-icon') return 'basketball-outline';
    if (iconName === 'tennis-icon') return 'tennisball-outline';
    
    // Aksi takdirde varsayılan ikonu döndür
    return 'fitness-outline';
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.colors.cardBackground }, cardStyle]}
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <View style={styles.contentContainer}>
          {/* Profil Fotoğrafı */}
          <View style={styles.profileImageContainer}>
            {friend.profile_picture ? (
              <Image
                source={{ uri: friend.profile_picture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.accent }]}>
                <Text style={styles.avatarInitial}>
                  {friend.first_name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>

          {/* İsim */}
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {friend.first_name} {friend.last_name}
          </Text>

          {/* Ortak Arkadaşlar veya Sporlar (Varsa) */}
          {(friend.common_friends || friend.common_sports) && (
            <View style={styles.commonContainer}>
              {friend.common_friends && friend.common_friends > 0 && (
                <Text style={[styles.commonText, { color: theme.colors.textSecondary }]}>
                  <Ionicons name="people-outline" size={12} /> {friend.common_friends} ortak arkadaş
                </Text>
              )}
              {friend.common_sports && friend.common_sports > 0 && (
                <Text style={[styles.commonText, { color: theme.colors.textSecondary }]}>
                  <Ionicons name="fitness-outline" size={12} /> {friend.common_sports} ortak spor
                </Text>
              )}
            </View>
          )}

          {/* Sporlar */}
          <View style={styles.sportsContainer}>
            {sportsList.length > 0 ? (
              <>
                {sportsList.slice(0, 2).map((sport, index) => (
                  <View key={index} style={styles.sportItem}>
                    <Ionicons 
                      name={getSportIcon(sport) as any} 
                      size={16} 
                      color={theme.colors.textSecondary} 
                    />
                    <Text style={[styles.sportText, { color: theme.colors.textSecondary }]}>
                      {sport.name || "Spor Belirsiz"}
                    </Text>
                  </View>
                ))}
                {sportsList.length > 2 && (
                  <Text style={[styles.moreSports, { color: theme.colors.textSecondary }]}>
                    +{sportsList.length - 2}
                  </Text>
                )}
              </>
            ) : (
              <Text style={[styles.sportText, { color: theme.colors.textSecondary, fontStyle: 'italic' }]}>
                Spor bilgisi belirtilmemiş
              </Text>
            )}
          </View>
        </View>

        {/* Ekle/İptal Butonu */}
        <View style={styles.buttonContainer}>
          {renderButton()}
        </View>
      </TouchableOpacity>

      <ConfirmationModal
        visible={isModalVisible}
        title="İstek İptali"
        message={`${friend.first_name} ${friend.last_name} adlı kişiye gönderdiğiniz arkadaşlık isteğini geri çekmek istediğinize emin misiniz?`}
        confirmText="İptal Et"
        cancelText="Vazgeç"
        confirmIcon="close-circle-outline"
        isDestructive={true}
        onConfirm={confirmCancelRequest}
        onCancel={() => setIsModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    marginRight: 12,
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    height: 280,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 8,
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 12,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  age: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 8,
  },
  commonContainer: {
    marginTop: 2,
    marginBottom: 4,
  },
  commonText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 2,
  },
  sportsContainer: {
    marginTop: 4,
    width: '100%',
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sportText: {
    fontSize: 14,
    marginLeft: 6,
  },
  moreSports: {
    fontSize: 14,
    marginTop: 2,
  },
  buttonContainer: {
    width: '100%',
    padding: 16,
    paddingTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    height: 36,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  friendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 18,
    width: 36,
    height: 36,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 18, 
    width: '70%',
    height: 36,
  },
}); 