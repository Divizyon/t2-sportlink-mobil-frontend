import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FriendSummary } from '../../store/userStore/profileStore';

interface FriendsCardProps {
  friendsSummary: FriendSummary;
  themeColors: {
    cardBackground: string;
    text: string;
    textSecondary: string;
    accent: string;
    notification: string;
  };
  onViewFriends?: () => void;
  onViewRequests?: () => void;
}

export const FriendsCard: React.FC<FriendsCardProps> = ({
  friendsSummary,
  themeColors,
  onViewFriends,
  onViewRequests
}) => {
  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: themeColors.text }]}>Arkadaşlarım</Text>
        <TouchableOpacity onPress={onViewFriends}>
          <Text style={[styles.viewAll, { color: themeColors.accent }]}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem} onPress={onViewFriends}>
          <View style={[styles.statIcon, { backgroundColor: themeColors.accent }]}>
            <Ionicons name="people" size={22} color="white" />
          </View>
          <Text style={[styles.statValue, { color: themeColors.text }]}>
            {friendsSummary.totalFriends}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Toplam Arkadaş
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statItem} 
          onPress={onViewRequests}
          disabled={friendsSummary.pendingRequests === 0}
        >
          <View style={[styles.statIcon, 
            { backgroundColor: friendsSummary.pendingRequests > 0 ? themeColors.notification : '#CCCCCC' }
          ]}>
            <Ionicons name="person-add" size={22} color="white" />
            {friendsSummary.pendingRequests > 0 && (
              <View style={[styles.badge, { backgroundColor: 'white' }]}>
                <Text style={[styles.badgeText, { color: themeColors.notification }]}>
                  {friendsSummary.pendingRequests}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.statValue, { color: themeColors.text }]}>
            {friendsSummary.pendingRequests}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Bekleyen İstek
          </Text>
        </TouchableOpacity>
      </View>
      
      {friendsSummary.mostActiveWith && (
        <View style={styles.mostActiveContainer}>
          <Text style={[styles.mostActiveLabel, { color: themeColors.textSecondary }]}>
            En Çok Birlikte Etkinliklere Katıldığın Kişi:
          </Text>
          <Text style={[styles.mostActiveName, { color: themeColors.text }]}>
            {friendsSummary.mostActiveWith}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  mostActiveContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  mostActiveLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  mostActiveName: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 