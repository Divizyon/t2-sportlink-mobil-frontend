import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { News } from '../../../types/apiTypes/api.types';
import { Ionicons } from '@expo/vector-icons';

interface NewsCardProps {
  news: News;
  onPress: (news: News) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, onPress }) => {
  const { theme } = useThemeStore();
  
  // Tarih formatlama
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Bugün';
    } else if (diffDays === 1) {
      return 'Dün';
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short'
      });
    }
  };
  
  // Spor ikonu belirle
  const getSportIcon = (sportName: string) => {
    const sportLower = sportName.toLowerCase();
    if (sportLower.includes('futbol')) return 'football-outline';
    if (sportLower.includes('basketbol')) return 'basketball-outline';
    if (sportLower.includes('voleybol')) return 'baseball-outline';
    if (sportLower.includes('tenis')) return 'tennisball-outline';
    if (sportLower.includes('yüzme')) return 'water-outline';
    if (sportLower.includes('koşu')) return 'walk-outline';
    if (sportLower.includes('bisiklet')) return 'bicycle-outline';
    return 'newspaper-outline'; // default for news
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress(news)}
      activeOpacity={0.7}
    >
      <View style={styles.headerRow}>
        <View style={styles.sourceContainer}>
          <View style={[styles.sourceIconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
            <Ionicons name={getSportIcon(news.sport.name)} size={14} color={theme.colors.accent} />
          </View>
          <Text style={[styles.sourceName, { color: theme.colors.text }]}>
            {news.source}
          </Text>
        </View>
        <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
          {formatDate(news.created_at)}
        </Text>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.textContent}>
          <Text style={[styles.sportCategory, { color: theme.colors.accent }]}>
            {news.sport.name}
          </Text>
          <Text 
            style={[styles.title, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {news.title}
          </Text>
          {news.content && (
            <Text 
              style={[styles.summary, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {news.content}
            </Text>
          )}
        </View>
        
        {news.image_url && (
          <Image 
            source={{ uri: news.image_url || 'https://via.placeholder.com/120' }} 
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </View>
      
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={18} color={theme.colors.accent} />
          <Text style={[styles.actionText, { color: theme.colors.accent }]}>
            Beğen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
            Yorum
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
            Paylaş
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  textContent: {
    flex: 1,
    marginRight: 12,
  },
  sportCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
});

export default NewsCard;