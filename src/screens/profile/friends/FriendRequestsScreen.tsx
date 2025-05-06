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
  Dimensions
} from 'react-native';
import { useFriendsStore } from '../../../store/userStore/friendsStore';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../components/common/Avatar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// AppStackParamList type'ı için import 
type AppStackParamList = {
  FriendRequests: undefined;
  // diğer route'lar da eklenebilir
};

type FriendRequestsScreenProps = NativeStackScreenProps<AppStackParamList, 'FriendRequests'>;

const { width } = Dimensions.get('window');

const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({ navigation }) => {
  const { theme } = useThemeStore();
  const { 
    friendRequests, 
    friends,
    isLoadingRequests,
    isLoadingFriends,
    isProcessingRequest,
    fetchFriendRequests, 
    fetchFriends,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    error
  } = useFriendsStore();

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
            style={[styles.actionButton, styles.acceptButton, { backgroundColor: theme.colors.success }]}
            onPress={() => handleAcceptRequest(item.id)}
            disabled={isProcessingRequest}
          >
            {isProcessingRequest ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton, { backgroundColor: theme.colors.error }]}
            onPress={() => handleRejectRequest(item.id)}
            disabled={isProcessingRequest}
          >
            {isProcessingRequest ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="close" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Arkadaş ögesi render fonksiyonu
  const renderFriendItem = ({ item }: { item: any }) => {
    return (
      <View style={[styles.itemContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.userInfo}>
          <Avatar 
            source={item.profile_picture} 
            name={`${item.first_name} ${item.last_name}`}
            size={50}
          />
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={[styles.username, { color: theme.colors.textSecondary }]}>
              @{item.username}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveFriend(item.id, `${item.first_name} ${item.last_name}`)}
        >
          <Ionicons name="person-remove-outline" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
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
      {/* Tab seçimleri */}
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
};

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
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  removeButton: {
    padding: 10,
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