import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Announcement } from '../../../types/apiTypes/api.types';
import { Ionicons } from '@expo/vector-icons';

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress: (announcement: Announcement) => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, onPress }) => {
  const { theme } = useThemeStore();
  
  // Tarihi formatlama
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric' 
    });
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border
        }
      ]}
      onPress={() => onPress(announcement)}
      activeOpacity={0.7}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text 
            style={[styles.title, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {announcement.title}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {formatDate(announcement.created_at)}
          </Text>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
          <Ionicons name="megaphone-outline" size={16} color={theme.colors.accent} />
        </View>
      </View>
      
      <Text 
        style={[styles.content, { color: theme.colors.textSecondary }]}
        numberOfLines={3}
      >
        {announcement.content}
      </Text>
      
      <View style={styles.footer}>
        <View style={[styles.badge, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
            Duyuru
          </Text>
        </View>
        <Text 
          style={[styles.readMore, { color: theme.colors.primary }]}
        >
          Detaylar
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    marginLeft: 4,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  readMore: {
    fontSize: 13,
    fontWeight: '600',
  }
});

export default AnnouncementCard;