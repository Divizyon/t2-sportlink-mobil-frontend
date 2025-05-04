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
  Alert
} from 'react-native';
import { useProfileStore } from '../../store/userStore/profileStore';
import { useThemeStore } from '../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import { Avatar } from '../../components/common/Avatar';

type Props = NativeStackScreenProps<ProfileStackParamList, 'FriendsList'>;

export const FriendsListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeStore();
  
  // ProfileStore'dan gerekli verileri alalım
  const { 
    userInfo,
    stats, 
    isLoading: isLoadingProfile,
    error: profileError,
    fetchUserProfile
  } = useProfileStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Direkt ProfileStore'daki friends dizisini kullan
  const friends = useProfileStore(state => state.friends || []);
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  // Yenileme işlemi
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserProfile();
    } catch (error) {
      console.error('Yenileme hatası:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Arkadaşı kaldırma
  const handleRemoveFriend = (friend: any) => {
    Alert.alert(
      'Arkadaşı Kaldır',
      `${friend.first_name} ${friend.last_name} adlı kişiyi arkadaş listenizden kaldırmak istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            setIsRemoving(true);
            try {
              // Gerçek silme işlemi için API çağrısı
              // (Bu özellik daha sonra eklenecek)
              
              // İşlem sonrası profil verilerini yenile
              await fetchUserProfile();
            } catch (error) {
              console.error('Arkadaş kaldırma hatası:', error);
            } finally {
              setIsRemoving(false);
            }
          }
        }
      ]
    );
  };

  // Arkadaş listesi renderı
  const renderFriendItem = ({ item }: { item: any }) => {
    return (
      <View style={[styles.friendItem, { backgroundColor: theme.colors.cardBackground }]}>
        <View style={styles.friendInfo}>
          <Avatar 
            source={item.profile_picture} 
            name={`${item.first_name} ${item.last_name}`}
            size={50}
          />
          <View style={styles.friendDetails}>
            <Text style={[styles.friendName, { color: theme.colors.text }]}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={[styles.friendUsername, { color: theme.colors.textSecondary }]}>
              @{item.username}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleRemoveFriend(item)}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color={theme.colors.accent} />
          ) : (
            <Ionicons name="person-remove-outline" size={20} color={theme.colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const error = profileError;
  const friendsCount = stats?.friendsCount || 0;

  const ListEmptyComponent = () => {
    if (isLoadingProfile && !refreshing) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name="people-outline" 
          size={64} 
          color={theme.colors.textSecondary} 
          style={styles.emptyIcon}
        />
        
        {error ? (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Hata: {error}
          </Text>
        ) : friendsCount > 0 ? (
          <>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Profil bilgilerinizde {friendsCount} arkadaşınız olduğu görünüyor, 
              ancak liste yüklenemedi.
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.colors.accent }]}
              onPress={onRefresh}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Henüz arkadaşınız bulunmuyor.
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      
      {isLoadingProfile && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Arkadaşlar yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
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
          ListEmptyComponent={ListEmptyComponent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendDetails: {
    marginLeft: 12,
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  friendUsername: {
    fontSize: 14,
    marginBottom: 4,
  },
  actionButton: {
    padding: 8,
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
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  debugContainer: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  debugText: {
    fontSize: 12,
    color: '#333',
  },
  debugErrorText: {
    fontSize: 12,
    color: 'red',
  }
}); 