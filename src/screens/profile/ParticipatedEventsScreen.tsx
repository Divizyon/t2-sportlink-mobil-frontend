import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useProfileStore } from '../../store/userStore/profileStore';
import { useThemeStore } from '../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { navigationRef } from '../../navigation/navigationRef';
import footballImage from '../../../assets/sportImage/football.png';
import basketballImage from '../../../assets/sportImage/basketball.png';
import tennisImage from '../../../assets/sportImage/tennis.png';
import volleyballImage from '../../../assets/sportImage/volleyball.png';
import walkImage from '../../../assets/sportImage/walk.png';

const sportImages = {
  basketbol: basketballImage,
  futbol: footballImage,
  tenis: tennisImage,
  voleybol: volleyballImage,
  koşu: walkImage,
  yoga: walkImage,
  fitness: walkImage,
  yüzme: walkImage,
  badminton: tennisImage,
  bisiklet: walkImage,
  default: footballImage,
};

// Removed duplicate definition
const getSportImageSource = (sportName: string | undefined): any => {
  if (!sportName) return sportImages.default;
  const sport = sportName.toLowerCase();
  switch (sport) {
    case 'basketbol':
      return sportImages.basketbol;
    case 'futbol':
      return sportImages.futbol;
    case 'tenis':
      return sportImages.tenis;
    case 'voleybol':
      return sportImages.voleybol;
    case 'koşu':
      return sportImages.koşu;
    case 'yoga':
      return sportImages.yoga;
    case 'fitness':
      return sportImages.fitness;
    case 'yüzme':
      return sportImages.yüzme;
    case 'badminton':
      return sportImages.badminton;
    case 'bisiklet':
      return sportImages.bisiklet;
    default:
      return sportImages.default;
  }
};

export const ParticipatedEventsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useThemeStore();
  const { userInfo, stats, fetchUserProfile, pastEvents } = useProfileStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      await fetchUserProfile();
      setLoading(false);
    };
    loadProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={pastEvents || []}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accent]} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Ionicons name="checkmark-done-outline" size={24} color={theme.colors.accent} />
            <Text style={[styles.headerText, { color: theme.colors.text }]}>Katıldığım Etkinlikler</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.eventCard, { backgroundColor: theme.colors.cardBackground }]}
            onPress={() => navigationRef.current?.navigate('EventDetail', { eventId: item.id })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={getSportImageSource(item.sport?.name)}
                style={{ width: 40, height: 40, marginRight: 12, borderRadius: 8 }}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.eventDate, { color: theme.colors.textSecondary }]}>{item.event_date}</Text>
                <Text style={[styles.eventLocation, { color: theme.colors.textSecondary }]}>{item.location_name}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: theme.colors.textSecondary }}>Henüz bir etkinliğe katılmadınız.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  eventCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 13,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 13,
  },
});
