import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserStats } from '../../store/userStore/profileStore';

interface StatsCardProps {
  stats: UserStats;
  themeColors: {
    cardBackground: string;
    text: string;
    textSecondary: string;
    accent: string;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, themeColors }) => {
  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>İstatistiklerim</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: themeColors.accent }]}>
            <Ionicons name="calendar" size={20} color="white" />
          </View>
          <Text style={[styles.statValue, { color: themeColors.text }]}>{stats.createdEventsCount}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Oluşturduğum Etkinlik</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: themeColors.accent }]}>
            <Ionicons name="people" size={20} color="white" />
          </View>
          <Text style={[styles.statValue, { color: themeColors.text }]}>{stats.joinedEventsCount}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Katıldığım Etkinlik</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: themeColors.accent }]}>
            <Ionicons name="star" size={20} color="white" />
          </View>
          <Text style={[styles.statValue, { color: themeColors.text }]}>{stats.rating.toFixed(1)}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Ortalama Puan</Text>
        </View>
      </View>
      
      {stats.favoriteEventType && (
        <View style={styles.favoriteType}>
          <Text style={[styles.favoriteLabel, { color: themeColors.textSecondary }]}>
            En Sevdiğin Etkinlik Türü:
          </Text>
          <Text style={[styles.favoriteValue, { color: themeColors.text }]}>
            {stats.favoriteEventType}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  favoriteType: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteLabel: {
    fontSize: 14,
    marginRight: 6,
  },
  favoriteValue: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 