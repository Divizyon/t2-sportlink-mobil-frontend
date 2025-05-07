import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  RefreshControl,
  SafeAreaView,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { useFriendsStore } from '../../../store/userStore/friendsStore';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { useMessageStore } from '../../../store/messageStore/messageStore';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../components/common/Avatar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// AppStackParamList type'ı için import 
type AppStackParamList = {
  FriendRequests: undefined;
  ConversationDetail: { conversationId: string; userName: string };
  // diğer route'lar da eklenebilir
};

type FriendRequestsScreenProps = NativeStackScreenProps<AppStackParamList, 'FriendRequests'>;

const { width } = Dimensions.get('window');

const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({ navigation }) => {
  const { 
    friendRequests, 
    friends, 
    fetchFriendRequests, 
    fetchFriends,
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend, 
    isLoadingRequests,
    isLoadingFriends,
    isProcessingRequest, 
    error 
  } = useFriendsStore();
  
  const { theme } = useThemeStore();
  const { createConversation } = useMessageStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' veya 'friends'
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // İki veriyi de paralel olarak yükle
    await Promise.all([
      fetchFriendRequests(),
      fetchFriends()
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Arkadaşlık isteğini kabul et
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const success = await acceptFriendRequest(requestId);
      if (success) {
        // İstekler ve arkadaşlar listesini güncelle
        await loadData();
      }
    } catch (error) {
      console.error('İstek kabul hatası:', error);
    }
  };

  // Arkadaşlık isteğini reddet
  const handleRejectRequest = async (requestId: string) => {
    try {
      const success = await rejectFriendRequest(requestId);
      if (success) {
        await fetchFriendRequests();
      }
    } catch (error) {
      console.error('İstek reddetme hatası:', error);
    }
  };

  // Arkadaşı kaldır
  const handleRemoveFriend = (friendId: string, friendName: string) => {
    Alert.alert(
      'Arkadaşı Kaldır',
      `${friendName} adlı kişiyi arkadaş listenizden kaldırmak istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await removeFriend(friendId);
              if (success) {
                await fetchFriends();
              }
            } catch (error) {
              console.error('Arkadaş kaldırma hatası:', error);
            }
          }
        }
      ]
    );
  };

  // Sohbete yönlendirme fonksiyonu
  const handleStartConversation = async (userId: string, userName: string) => {
    try {
      // Önce yeni bir konuşma oluştur
      const conversation = await createConversation([userId]);
      
      if (conversation) {
        // Oluşturulan konuşma ile sohbet sayfasına yönlendir
        navigation.navigate('ConversationDetail', { 
          conversationId: conversation.id,
          userName: userName
        });
      } else {
        Alert.alert('Hata', 'Konuşma başlatılamadı. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      console.error('Konuşma başlatma hatası:', error);
      Alert.alert('Hata', 'Konuşma başlatılırken bir sorun oluştu.');
    }
  };

  // Arkadaşlık isteği ögesi render fonksiyonu
  const renderRequestItem = ({ item }: { item: any }) => {
    const sender = item.sender;
    
    return (
      <View style={[styles.itemContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.userInfo}>
          <Avatar 
            source={sender.profile_picture} 
            name={`${sender.first_name} ${sender.last_name}`}
            size={50}
          />
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {sender.first_name} {sender.last_name}
            </Text>
            <Text style={[styles.username, { color: theme.colors.textSecondary }]}>
              @{sender.username}
            </Text>
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              {new Date(item.created_at).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.acceptButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => handleAcceptRequest(item.id)}
            disabled={isProcessingRequest}
          >
            {isProcessingRequest ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Onayla</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.rejectButton, { borderColor: theme.colors.textSecondary }]}
            onPress={() => handleRejectRequest(item.id)}
            disabled={isProcessingRequest}
          >
            {isProcessingRequest ? (
              <ActivityIndicator size="small" color={theme.colors.textSecondary} />
            ) : (
              <Text style={[styles.rejectButtonText, { color: theme.colors.textSecondary }]}>Sil</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Arkadaş ögesi render fonksiyonu
  const renderFriendItem = ({ item }: { item: any }) => {
    return (
      <View 
        style={[
          styles.friendItemContainer, 
          { 
            backgroundColor: theme.colors.card
          }
        ]}
      >
        <View style={styles.friendHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Avatar 
                source={item.profile_picture} 
                name={`${item.first_name} ${item.last_name}`}
                size={54}
              />
              <View style={[styles.onlineIndicator, { backgroundColor: '#2ecc71' }]} />
            </View>
            
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {item.first_name} {item.last_name}
              </Text>
              <Text style={[styles.username, { color: theme.colors.textSecondary }]}>
                @{item.username}
              </Text>
              
              <View style={styles.friendSince}>
                <Ionicons name="people-outline" size={12} color={theme.colors.accent} style={styles.buttonIcon} />
                <Text style={[styles.friendSinceText, { color: theme.colors.accent }]}>
                  {item.friendship_date ? 
                    `Arkadaş: ${new Date(item.friendship_date).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}` :
                    'Arkadaş'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.friendActionsContainer}>
          <TouchableOpacity 
            style={[styles.messageButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => handleStartConversation(item.id, `${item.first_name} ${item.last_name}`)}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Mesaj Gönder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.removeFriendButton, { borderColor: theme.colors.border }]}
            onPress={() => handleRemoveFriend(item.id, `${item.first_name} ${item.last_name}`)}
          >
            <Ionicons name="person-remove-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.removeFriendButtonText, { color: theme.colors.textSecondary }]}>Arkadaşı Kaldır</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Boş liste bileşeni
  const RequestsEmptyComponent = () => {
    if (isLoadingRequests && !refreshing) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name="heart-outline" 
          size={64} 
          color={theme.colors.textSecondary} 
        />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Gelen arkadaşlık isteği bulunmuyor
        </Text>
      </View>
    );
  };

  // Boş liste bileşeni
  const FriendsEmptyComponent = () => {
    if (isLoadingFriends && !refreshing) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name="people-outline" 
          size={64} 
          color={theme.colors.textSecondary} 
        />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Henüz arkadaşınız bulunmuyor
        </Text>
      </View>
    );
  };

  // Yükleme göstergesi
  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        Yükleniyor...
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Sekme seçimleri */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'requests' && [styles.activeTabButton, { borderBottomColor: theme.colors.accent }]
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <Text 
            style={[
              styles.tabButtonText, 
              { color: activeTab === 'requests' ? theme.colors.accent : theme.colors.textSecondary }
            ]}
          >
            İstekler {friendRequests.length > 0 && `(${friendRequests.length})`}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'friends' && [styles.activeTabButton, { borderBottomColor: theme.colors.accent }]
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text 
            style={[
              styles.tabButtonText, 
              { color: activeTab === 'friends' ? theme.colors.accent : theme.colors.textSecondary }
            ]}
          >
            Arkadaşlarım {friends.length > 0 && `(${friends.length})`}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* İçerik */}
      {activeTab === 'requests' ? (
        // Arkadaşlık İstekleri
        isLoadingRequests && !refreshing ? (
          <LoadingIndicator />
        ) : (
          <FlatList
            contentContainerStyle={styles.listContainer}
            data={friendRequests}
            renderItem={renderRequestItem}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[theme.colors.accent]}
                tintColor={theme.colors.accent}
              />
            }
            ListEmptyComponent={RequestsEmptyComponent}
          />
        )
      ) : (
        // Arkadaşlar Listesi
        isLoadingFriends && !refreshing ? (
          <LoadingIndicator />
        ) : (
          <FlatList
            contentContainerStyle={styles.listContainer}
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[theme.colors.accent]}
                tintColor={theme.colors.accent}
              />
            }
            ListEmptyComponent={FriendsEmptyComponent}
          />
        )
      )}
      
      {/* Hata Göstergesi */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={[styles.retryText, { color: theme.colors.accent }]}>
              Tekrar Dene
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  rejectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  friendItemContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  friendHeader: {
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  onlineIndicator: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    bottom: 0,
    right: 0,
  },
  friendSince: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  friendSinceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  friendActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    maxWidth: '48%',
  },
  removeFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
    flex: 1,
    maxWidth: '48%',
  },
  removeFriendButtonText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 12,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FriendRequestsScreen; 