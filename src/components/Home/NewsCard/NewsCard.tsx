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
  
  // Görsel var mı kontrol et
  const hasImage = news.image_url && news.image_url.length > 0;
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress(news)}
      activeOpacity={0.7}
    >

      
      <View style={[styles.contentWrapper, { paddingTop: hasImage ? 0 : 16 }]}>
        <View style={styles.headerRow}>
          <View style={styles.sourceContainer}>
            <View style={[styles.sourceIconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
              <Ionicons name={getSportIcon(news.sport.name)} size={16} color={theme.colors.accent} />
            </View>
            <Text style={[styles.sourceName, { color: theme.colors.text }]}>
              {news.source}
            </Text>
          </View>
          
          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} style={styles.dateIcon} />
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {formatDate(news.created_at)}
            </Text>
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.textContent}>
            <View style={[styles.sportCategoryBadge, { backgroundColor: theme.colors.accent + '15' }]}>
              <Text style={[styles.sportCategory, { color: theme.colors.accent }]}>
                {news.sport.name}
              </Text>
            </View>
            
            <Text 
              style={[styles.title, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {news.title}
            </Text>
            
            {news.content && (
              <Text 
                style={[styles.summary, { color: theme.colors.textSecondary }]}
                numberOfLines={3}
              >
                {news.content}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.readMoreText, { color: theme.colors.accent }]}>
            Devamını Oku
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 180,
  },
  contentWrapper: {
    padding: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    marginBottom: 16,
  },
  textContent: {
    flex: 1,
  },
  sportCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  sportCategory: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 2,
  },
});

export default NewsCard;