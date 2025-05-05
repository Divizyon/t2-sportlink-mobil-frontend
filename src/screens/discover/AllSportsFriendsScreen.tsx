import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  SafeAreaView, 
  ActivityIndicator, 
  RefreshControl,
  StatusBar 
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useFriendsStore } from '../../store/userStore/friendsStore';
import { SportFriendCard } from '../../components/Discover/SportFriendCard';
import { Ionicons } from '@expo/vector-icons';
import { SuggestedFriend } from '../../api/friends/friendsApi';

// SportFriend tipini tanımlayalım - SportFriendCard'da kullanılan tip
interface SportFriend {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  profile_picture?: string;
  common_friends?: number;
  common_sports?: number;
  // Spor bilgileri için alternatif alanlar (bunlardan biri dolu olacak)
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
  interests?: {
    id: string;
    name: string;
    icon: string;
    skill_level?: string;
  }[];
}

export const AllSportsFriendsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { 
    suggestedFriends, 
    fetchSuggestedFriends, 
    isLoadingSuggestions, 
    error 
  } = useFriendsStore();
  
  const [refreshing, setRefreshing] = useState(false);

  // İlk yüklemede arkadaş önerilerini getir
  useEffect(() => {
    // Daha fazla öneri getir (20 adet)
    fetchSuggestedFriends(20);
  }, []);

  // Yenileme işlemi
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchSuggestedFriends(20);
    } catch (err) {
      console.error('Arkadaş önerileri alınırken hata:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // API'den gelen SuggestedFriend verilerini SportFriendCard için uygun formata dönüştür
  const prepareDataForDisplay = (): SportFriend[] => {
    return suggestedFriends.map(friend => {
      // user_sports için formatlama
      const formattedSports = friend.user_sports?.map(sport => ({
        sport_id: sport.id,
        skill_level: sport.skill_level,
        sport: {
          id: sport.id,
          name: sport.name,
          icon: sport.icon
        }
      }));
      
      // İlgili alanlara atama
      return {
        id: friend.id,
        first_name: friend.first_name,
        last_name: friend.last_name,
        username: friend.username,
        profile_picture: friend.profile_picture,
        common_friends: friend.common_friends,
        common_sports: friend.common_sports,
        // Sport verileri - uygun formatta
        user_sports: formattedSports,
        // Alternatif olarak interests'e de atama yapabiliriz
        interests: friend.user_sports
      };
    });
  };

  // Görüntülenecek arkadaşlar
  const displayFriends = prepareDataForDisplay();

  // Yükleme durumu
  if (isLoadingSuggestions && !refreshing && displayFriends.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar 
          barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
          backgroundColor={theme.colors.background}
        />
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Spor Arkadaşları
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Spor arkadaşları yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Hata durumu
  if (error && !refreshing && displayFriends.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar 
          barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
          backgroundColor={theme.colors.background}
        />
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Spor Arkadaşları
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Arkadaş önerileri alınırken bir hata oluştu.
          </Text>
          <Text style={[styles.errorSubText, { color: theme.colors.textSecondary }]}>
            Lütfen daha sonra tekrar deneyin.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Spor Arkadaşları
        </Text>
      </View>
      
      <FlatList
        data={displayFriends}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <SportFriendCard 
              friend={item}
              cardStyle={styles.fullWidthCard}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Henüz arkadaş önerisi bulunmuyor
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  cardContainer: {
    marginBottom: 16,
    width: '48%',
  },
  fullWidthCard: {
    width: '100%',
    marginRight: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubText: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AllSportsFriendsScreen; 