import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { SportFriendCard } from './SportFriendCard';
import { useFriendsStore } from '../../store/userStore/friendsStore';
import { SuggestedFriend } from '../../api/friends/friendsApi';

interface SportsFriendsProps {
  isLoading?: boolean;
  onSeeAll?: () => void;
}

export const SportsFriends: React.FC<SportsFriendsProps> = ({
  isLoading: externalLoading,
  onSeeAll
}) => {
  const { theme } = useThemeStore();
  const { 
    suggestedFriends, 
    fetchSuggestedFriends, 
    isLoadingSuggestions, 
    error 
  } = useFriendsStore();

  // Component mount olduğunda arkadaş önerilerini çek
  useEffect(() => {
    fetchSuggestedFriends(10);
  }, []);

  // Veri yoksa ve hala yükleniyor değilse yeniden dene
  useEffect(() => {
    if (suggestedFriends.length === 0 && !isLoadingSuggestions && !error) {
      fetchSuggestedFriends(10);
    }
  }, [suggestedFriends, isLoadingSuggestions, error]);

  // Loading state'ini belirle (dışarıdan gelen veya store'dan)
  const isLoading = externalLoading || isLoadingSuggestions;

  // Spor bilgilerini formatlayan yardımcı fonksiyon
  const mapSportsData = (friend: SuggestedFriend) => {
    if (!friend.user_sports || friend.user_sports.length === 0) {
      return [{ name: 'Spor Belirsiz', icon: 'help-circle-outline' }];
    }
    
    return friend.user_sports.map(sport => ({
      name: sport.name,
      icon: sport.icon || 'fitness-outline', // Özel ikon yoksa varsayılan kullan
    }));
  };

  // Yaş hesaplama fonksiyonu (belirsiz ise varsayılan kullan)
  const getAge = (friend: SuggestedFriend) => {
    return friend.age || Math.floor(20 + Math.random() * 15); // 20-35 arası rastgele yaş
  };

  // Gösterilecek arkadaş verilerini hazırla
  const displayFriends = suggestedFriends.map(friend => ({
    id: friend.id,
    first_name: friend.first_name,
    last_name: friend.last_name,
    username: friend.username,
    age: getAge(friend),
    sports: mapSportsData(friend),
    profile_picture: friend.profile_picture,
    common_friends: friend.common_friends,
    common_sports: friend.common_sports
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Spor Arkadaşları Bul
        </Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.seeAllText, { color: theme.colors.accent }]}>
            Tümünü Gör
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
        </View>
      ) : displayFriends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Henüz spor arkadaşı önerisi bulunmuyor
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {displayFriends.map((friend) => (
            <SportFriendCard 
              key={friend.id} 
              friend={friend} 
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollViewContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  loadingContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  }
}); 