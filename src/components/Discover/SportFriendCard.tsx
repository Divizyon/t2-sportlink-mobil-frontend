import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useFriendsStore } from '../../store/userStore/friendsStore';

interface SportFriend {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  age?: number;
  sports?: { name: string; icon: string }[];
  profile_picture?: string;
  common_friends?: number;
  common_sports?: number;
}

interface SportFriendCardProps {
  friend: SportFriend;
  onPress?: () => void;
}

export const SportFriendCard: React.FC<SportFriendCardProps> = ({ friend, onPress }) => {
  const { theme } = useThemeStore();
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

  // İstek durumunu gösteren bildirim ekleyelim
  useEffect(() => {
    // Arkadaşlık isteği gönderildiğinde veya iptal edildiğinde kullanıcıya bilgi ver
    if (message) {
      console.log("Arkadaşlık durumu mesajı:", message);
      // Burada bir Toast bildirim gösterilebilir (henüz implementasyonu yok)
    }
  }, [message]);

  // Hata durumlarını izleyelim
  useEffect(() => {
    if (error) {
      console.log("Arkadaşlık durumu hatası:", error);
      // Burada bir hata bildirimi gösterilebilir
    }
  }, [error]);

  // Arkadaşlık isteği gönder
  const handleAddFriend = async () => {
    try {
      setIsLoading(true); // Kart özel loading başlat
      const success = await sendFriendRequest(friend.id);
      if (success) {
        setFriendshipStatus('sent');
        console.log("Arkadaşlık isteği başarıyla gönderildi:", friend.first_name);
      } else {
        console.log("Arkadaşlık isteği gönderilemedi:", error);
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
        console.log("Arkadaşlık isteği başarıyla iptal edildi:", friend.first_name);
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
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
          disabled={true}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={[styles.addButtonText, { color: "white" }]}>
            Arkadaş
          </Text>
        </TouchableOpacity>
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

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}
        onPress={onPress}
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

          {/* İsim ve Yaş */}
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {friend.first_name} {friend.last_name}
          </Text>
          {friend.age && (
            <Text style={[styles.age, { color: theme.colors.textSecondary }]}>
              {friend.age} yaş
            </Text>
          )}

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
            {friend.sports && friend.sports.slice(0, 2).map((sport, index) => (
              <View key={index} style={styles.sportItem}>
                <Ionicons name={sport.icon as any} size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.sportText, { color: theme.colors.textSecondary }]}>
                  {sport.name}
                </Text>
              </View>
            ))}
            {friend.sports && friend.sports.length > 2 && (
              <Text style={[styles.moreSports, { color: theme.colors.textSecondary }]}>
                +{friend.sports.length - 2}
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
}); 