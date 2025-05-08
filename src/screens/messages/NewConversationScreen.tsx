import 'react-native-get-random-values';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
  Alert
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useFriendsStore } from '../../store/userStore/friendsStore';
import { useMessageStore } from '../../store/messageStore/messageStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { UserListItem } from '../../components/Messages/UserListItem';

// Route tipi tanımı
type RouteParams = {
  params: {
    preSelectedUser?: string;
  }
}

// Basit bir arama bileşeni
const SearchInput = ({ 
  value, 
  onChangeText, 
  theme, 
  placeholder 
}: { 
  value: string; 
  onChangeText: (text: string) => void; 
  theme: any;
  placeholder: string;
}) => {
  return (
    <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
      <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.searchInput,
          { 
            color: theme.colors.text,
            backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          }
        ]}
      />
    </View>
  );
};

export const NewConversationScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const { friends, getFriends, isLoadingFriends, error } = useFriendsStore();
  const { createConversation } = useMessageStore();
  
  const preSelectedUser = route.params?.preSelectedUser;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>(preSelectedUser ? [preSelectedUser] : []);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Arkadaşları yükle, debounce ile tekrar deneme eklenmiş
  const loadFriends = useCallback(async () => {
    try {
      setLoadError(null);
      await getFriends();
    } catch (err) {
      setLoadError(error || 'Arkadaşlar yüklenirken bir hata oluştu');
      console.error('Arkadaşlar yüklenirken hata:', err);
    }
  }, [getFriends, error]);
  
  // Arkadaşları yükle
  useEffect(() => {
    loadFriends();
    
    // Önceden seçilmiş kullanıcı varsa ve henüz yüklenmemişse, doğrudan mesaj başlatma işlemini yap
    if (preSelectedUser && selectedUsers.length === 1 && !isCreatingGroup) {
      // Ancak önce arkadaşların yüklenmesini bekleyelim
      const timer = setTimeout(() => {
        // Arkadaş listesinde var mı kontrol et
        const friendExists = friends.some(friend => friend.id === preSelectedUser);
        if (friendExists && !isLoadingFriends) {
          handleStartConversation();
        }
      }, 500); // API yanıtını beklemek için kısa bir gecikme
      
      return () => clearTimeout(timer);
    }
  }, [preSelectedUser, friends, isLoadingFriends]);
  
  // API çağrısı başarısız olduğunda tekrar deneme mekanizması
  useEffect(() => {
    if (error && friends.length === 0 && retryCount < 3) {
      const retryTimer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        loadFriends();
      }, 2000); // 2 saniye sonra tekrar dene
      
      return () => clearTimeout(retryTimer);
    }
  }, [error, friends.length, retryCount, loadFriends]);
  
  // Kullanıcı seçme işlemi
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  // Filtrelenmiş arkadaşlar
  const filteredFriends = friends.filter(friend => {
    const fullName = `${friend.first_name} ${friend.last_name}`.toLowerCase();
    const username = friend.username?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || username.includes(query);
  });
  
  // Grup değiştirme işlemi
  const toggleGroupMode = () => {
    if (isCreatingGroup && selectedUsers.length > 0) {
      // Kullanıcı grup modundan çıkmak isterse, seçimleri korumak isteyip istemediğini sor
      Alert.alert(
        'Grup modundan çıkılıyor',
        'Seçili arkadaşlarınız korunsun mu?',
        [
          {
            text: 'Hayır, temizle',
            onPress: () => {
              setIsCreatingGroup(false);
              setSelectedUsers([]);
              setGroupName('');
            }
          },
          {
            text: 'Evet, koru',
            onPress: () => setIsCreatingGroup(false)
          }
        ]
      );
    } else {
      setIsCreatingGroup(!isCreatingGroup);
    }
  };
  
  // Mesaj başlatma işlemi
  const handleStartConversation = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir arkadaş seçin');
      return;
    }
    
    if (isCreatingGroup && !groupName.trim()) {
      Alert.alert('Uyarı', 'Lütfen grup adı girin');
      return;
    }
    
    try {
      setIsCreating(true);
      
      // Konuşma oluştur
      const conversation = await createConversation(
        selectedUsers,
        isCreatingGroup ? groupName.trim() : undefined,
        isCreatingGroup
      );
      
      if (conversation) {
        // Konuşma detayına git
        navigation.replace('ConversationDetail', { conversationId: conversation.id });
      } else {
        throw new Error('Konuşma oluşturulamadı');
      }
    } catch (error) {
      console.error('Konuşma başlatma hatası:', error);
      Alert.alert('Hata', 'Konuşma başlatılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsCreating(false);
    }
  };
  
  // Kullanıcı araması
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Burada API'den kullanıcı araması yapılacak
    // Şimdilik boş bir array döndürüyoruz
    setSearchResults([]);
  };

  // Kullanıcı seçildiğinde
  const handleSelectUser = (user: any) => {
    createConversation(user.id);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Grup Modu Seçeneği */}
      <View style={[styles.groupModeContainer, { 
        borderBottomColor: theme.colors.border,
        backgroundColor: isCreatingGroup ? theme.colors.accent + '15' : 'transparent' 
      }]}>
        <View style={styles.groupModeInfo}>
          <Ionicons 
            name={isCreatingGroup ? "people" : "people-outline"} 
            size={24} 
            color={isCreatingGroup ? theme.colors.accent : theme.colors.text} 
            style={{ marginRight: 10 }}
          />
          <View>
            <Text style={[styles.groupModeLabel, { 
              color: isCreatingGroup ? theme.colors.accent : theme.colors.text,
              fontWeight: isCreatingGroup ? 'bold' : 'normal'
            }]}>
              Grup Sohbeti Oluştur
            </Text>
            {isCreatingGroup && (
              <Text style={[styles.groupModeTip, { color: theme.colors.textSecondary }]}>
                Birden fazla arkadaş seçerek grup oluşturabilirsiniz
              </Text>
            )}
          </View>
        </View>
        <Switch
          value={isCreatingGroup}
          onValueChange={toggleGroupMode}
          trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
          thumbColor={theme.colors.cardBackground}
        />
      </View>
      
      {/* Grup İsmi (Grup modunda) */}
      {isCreatingGroup && (
        <View style={[styles.groupNameContainer, { 
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.cardBackground + '50'
        }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.accent} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.groupNameInput, { color: theme.colors.text }]}
            placeholder="Grup adı girin..."
            placeholderTextColor={theme.colors.textSecondary}
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>
      )}
      
      {/* Arama */}
      <SearchInput
        value={searchQuery}
        onChangeText={handleSearch}
        theme={theme}
        placeholder="Kullanıcı ara..."
      />
      
      {/* Seçilen Kullanıcı Sayısı */}
      {selectedUsers.length > 0 && (
        <View style={[styles.selectedCountContainer, { backgroundColor: theme.colors.accent }]}>
          <Text style={styles.selectedCountText}>
            {selectedUsers.length} arkadaş seçildi
          </Text>
        </View>
      )}
      
      {/* Arkadaş Listesi */}
      {isLoadingFriends ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Arkadaşlar yükleniyor...
          </Text>
          {retryCount > 0 && (
            <Text style={[styles.retryText, { color: theme.colors.textSecondary }]}>
              Tekrar deneniyor ({retryCount}/3)...
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserListItem
              user={item}
              onSelect={() => toggleUserSelection(item.id)}
              isSelected={selectedUsers.includes(item.id)}
            />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {loadError ? (
                <>
                  <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
                  <Text style={[styles.emptyText, { color: theme.colors.error }]}>
                    {loadError}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.retryButton, { backgroundColor: theme.colors.accent }]}
                    onPress={() => {
                      setRetryCount(0);
                      loadFriends();
                    }}
                  >
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    {searchQuery
                      ? `"${searchQuery}" için sonuç bulunamadı`
                      : 'Henüz arkadaşınız yok'}
                  </Text>
                </>
              )}
            </View>
          }
        />
      )}
      
      {/* Mesaj Başlat Butonu */}
      {selectedUsers.length > 0 && (
        <TouchableOpacity
          style={[
            styles.startButton,
            { backgroundColor: selectedUsers.length > 0 ? theme.colors.accent : theme.colors.border },
          ]}
          onPress={handleStartConversation}
          disabled={selectedUsers.length === 0 || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons 
                name={isCreatingGroup ? "people" : "chatbubble"} 
                size={18} 
                color="white" 
                style={{ marginRight: 8 }}
              />
              <Text style={styles.startButtonText}>
                {isCreatingGroup ? "Grup Sohbeti Başlat" : "Sohbet Başlat"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
      
      {/* Hata mesajı gösterimi */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.error }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  groupModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  groupModeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupModeLabel: {
    fontSize: 16,
  },
  groupModeTip: {
    fontSize: 12,
    marginTop: 2,
  },
  groupNameContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  groupNameInput: {
    fontSize: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 8,
  },
  searchIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderRadius: 12,
  },
  selectedCountContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  selectedCountText: {
    color: 'white',
    fontWeight: '500',
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
  retryText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  startButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    flex: 1,
    marginRight: 8,
  },
});

export default NewConversationScreen; 