import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Share,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { create } from 'zustand';
import { News } from '../../types/apiTypes/api.types';
import newsService from '../../api/news/newsService';

// Route param tipini tanımla
type NewsDetailRouteParams = {
  NewsDetail: {
    newsId: string;
  };
};

// Zustand store oluştur - Haber detayı için
interface NewsDetailState {
  currentNews: News | null;
  isLoading: boolean;
  error: string | null;
  fetchNewsDetail: (newsId: string) => Promise<void>;
  clearError: () => void;
}

export const useNewsDetailStore = create<NewsDetailState>((set) => ({
  currentNews: null,
  isLoading: false,
  error: null,
  
  fetchNewsDetail: async (newsId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await newsService.getNewsDetail(newsId) as any;
      console.log('Haber detayları:', response);
      
      set({ currentNews: response.data.news, isLoading: false });
    } catch (error) {
      console.error('Haber detayı alınırken hata oluştu:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Haber detayları alınırken bir hata oluştu',
        isLoading: false 
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));

export const NewsDetailScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<NewsDetailRouteParams, 'NewsDetail'>>();
  const { newsId } = route.params;
  
  const { currentNews, isLoading, error, fetchNewsDetail } = useNewsDetailStore();
  
  // Sayfaya geldiğimizde haberin detaylarını getir
  useEffect(() => {
    fetchNewsDetail(newsId);
  }, [newsId]);
  
  // Paylaş fonksiyonu
  const handleShare = async () => {
    if (!currentNews) return;
    
    try {
      await Share.share({
        message: `${currentNews.title} - ${currentNews.content}`,
        url: currentNews.image_url,
        title: currentNews.title,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };
  
  // Haberi göster
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.cardBackground }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={theme.colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Haber Detayı</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={24} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>
      
      {/* İçerik */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={56} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Haber yüklenirken bir sorun oluştu
          </Text>
          <TouchableOpacity 
            onPress={() => fetchNewsDetail(newsId)}
            style={[styles.retryButton, { backgroundColor: theme.colors.accent }]}
          >
            <Text style={[styles.retryText, { color: theme.colors.white }]}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : currentNews ? (
        <ScrollView 
          contentContainerStyle={styles.contentContainer} 
          showsVerticalScrollIndicator={false}
        >
          {/* Haber Görseli */}
          {currentNews.image_url && (
            <Image 
              source={{ uri: currentNews.image_url }} 
              style={styles.newsImage} 
              resizeMode="cover"
            />
          )}
          
          {/* Haber Başlığı */}
          <Text style={[styles.newsTitle, { color: theme.colors.text }]}>
            {currentNews.title}
          </Text>
          
          {/* Haber Tarihi ve Kaynağı */}
          <View style={styles.newsMetaContainer}>
            <Text style={[styles.newsDate, { color: theme.colors.textSecondary }]}>
              {currentNews.created_at && !isNaN(new Date(currentNews.created_at).getTime())
                ? new Date(currentNews.created_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : currentNews.created_at && !isNaN(new Date(currentNews.created_at).getTime())
                  ? new Date(currentNews.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Tarih belirtilmemiş'}
            </Text>
            {currentNews.source && (
              <Text style={[styles.newsSource, { color: theme.colors.accent }]}>
                {currentNews.source}
              </Text>
            )}
          </View>
          
          {/* Haber İçeriği */}
          <Text style={[styles.newsContent, { color: theme.colors.text }]}>
            {currentNews.content}
          </Text>
          
     
          
          {/* Alt Boşluk */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
            Haber bilgisi bulunamadı
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 0,
  },
  newsImage: {
    width: '100%',
    height: 240,
  },
  newsTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    padding: 16,
    paddingTop: 20,
  },
  newsMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  newsDate: {
    fontSize: 14,
  },
  newsSource: {
    fontSize: 14,
    fontWeight: '500',
  },
  newsContent: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    paddingTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 4,
  },
  tagItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
  },
});