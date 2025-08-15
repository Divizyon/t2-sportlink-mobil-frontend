import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Announcement } from '../../../types/apiTypes/api.types';
import { Ionicons } from '@expo/vector-icons';

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress: (announcement: Announcement) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8 > 300 ? 300 : width * 0.8;

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

  // Slug'dan resim URL'sini kontrol et
  const isImageUrl = (slug: string): boolean => {
    return slug.startsWith('http') && (slug.includes('.jpg') || slug.includes('.jpeg') || slug.includes('.png') || slug.includes('.gif') || slug.includes('.webp'));
  };

  // Slug alanından resim URL'sini al
  const imageUrl = announcement.slug && isImageUrl(announcement.slug) ? announcement.slug : null;
  
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
      {/* Resim Bölümü */}
      {imageUrl && (
        <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={[styles.dateTag, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.dateText}>{formatDate(announcement.created_at)}</Text>
          </View>
        </View>
      )}
      
      {/* İçerik Bölümü */}
      <View style={styles.contentContainer}>
        <Text 
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {announcement.title}
        </Text>
        
        {!imageUrl && (
          <Text 
            style={[styles.content, { color: theme.colors.textSecondary }]}
            numberOfLines={3}
          >
            {announcement.content}
          </Text>
        )}
        
        <View style={styles.footer}>
          {!imageUrl && (
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
              {formatDate(announcement.created_at)}
            </Text>
          )}
          <View style={styles.readMoreContainer}>
            <Text 
              style={[styles.readMore, { color: theme.colors.primary }]}
            >
              Detaylar
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={14} 
              color={theme.colors.primary} 
              style={styles.icon}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: 16,
    marginRight: 12,
    marginLeft: 4,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden'
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dateTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderTopRightRadius: 8,
  },
  dateText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 22,
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
    marginTop: 8,
  },
  date: {
    fontSize: 12,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMore: {
    fontSize: 13,
    fontWeight: '600',
  },
  icon: {
    marginLeft: 2,
  }
});

export default AnnouncementCard;