import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { SportFriendCard } from './SportFriendCard';

interface SportsFriendsProps {
  friends?: any[];
  isLoading?: boolean;
  onSeeAll?: () => void;
}

export const SportsFriends: React.FC<SportsFriendsProps> = ({
  friends = [],
  isLoading = false,
  onSeeAll
}) => {
  const { theme } = useThemeStore();

  // Mock veriler (gerçek implementasyonda API'den gelecek)
  const mockFriends = [
    {
      id: '1',
      first_name: 'Ahmet',
      last_name: 'Yılmaz',
      age: 28,
      distance: 2.5,
      sports: [
        { name: 'Futbol', icon: 'football-outline' },
        { name: 'Basketbol', icon: 'basketball-outline' },
        { name: 'Fitness', icon: 'fitness-outline' }
      ],
      profile_picture: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: '2',
      first_name: 'Ayşe',
      last_name: 'Kaya',
      age: 24,
      distance: 4,
      sports: [
        { name: 'Tenis', icon: 'tennisball-outline' },
        { name: 'Voleybol', icon: 'baseball-outline' },
      ],
      profile_picture: 'https://randomuser.me/api/portraits/women/44.jpg'
    }
  ];

  // Geçici olarak mockFriends kullan
  const displayFriends = friends.length > 0 ? friends : mockFriends;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Spor Arkadaşları
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
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {displayFriends.map((friend) => (
            <SportFriendCard key={friend.id} friend={friend} />
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
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 