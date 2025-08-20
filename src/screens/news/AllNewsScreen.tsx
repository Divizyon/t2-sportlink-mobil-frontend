import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  Animated,
  StatusBar,
  RefreshControl,
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../../store/appStore/themeStore';
import { News, Sport } from '../../types/apiTypes/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useNewsStore } from '../../store/newsStore';

// Stack tipini tanımlayalım
type NewsStackParamList = {
  AllNewsScreen: undefined;
  NewsDetail: { newsId: string };
  HomeScreen: undefined;
};

// Navigator tipini tanımlayalım
type NewsScreenNavigationProp = NativeStackNavigationProp<NewsStackParamList>;

const AllNewsScreen: React.FC = () => {
  const navigation = useNavigation<NewsScreenNavigationProp>();
  const { theme } = useThemeStore();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Zustand store'dan state ve metodları çekelim
  const { 
    news, 
    filteredNews, 
    isLoading, 
    isRefreshing, 
    error, 
    selectedSportId,
    sportCategories,
    fetchAllNews,
    fetchSportCategories,
    refreshNews,
    loadMoreNews,
    filterNewsBySport
  } = useNewsStore();
  
  // Ekran ilk açıldığında haberleri ve kategorileri yükle
  useEffect(() => {
    fetchAllNews();
    fetchSportCategories();
  }, []);
  
  // Animasyon değerleri
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [80, 60],
    extrapolate: 'clamp'
  });
  
  // FlatList için referans oluştur
  const flatListRef = useRef<FlatList>(null);
  
  // Yukarı kaydırma fonksiyonu
  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  // Kaydırma olayını işle
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        
        // 100 pikselden fazla kaydırıldıysa butonu göster, 50 pikselden az ise gizle
        if (offsetY > 100 && !showScrollToTop) {
          setShowScrollToTop(true);
        } else if (offsetY < 50 && showScrollToTop) {
          setShowScrollToTop(false);
        }
      }
    }
  );
  
  // Haber detayına git
  const handleNewsPress = (item: News) => {
    navigation.navigate('NewsDetail', { newsId: item.id });
  };
  
  // Tarih formatlama
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Aynı gün - saat göster
      return `Bugün ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
      return 'Dün';
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
    }
  };
  
  // Liste öğelerini render et
  const renderNewsItem = ({ item }: { item: News }) => (
    <TouchableOpacity 
      style={[styles.newsCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleNewsPress(item)}
      activeOpacity={0.7}
    >
      {/* Haber resmi */}
      {item.image_url ? (
        <View style={styles.newsImageContainer}>
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.newsImage}
            resizeMode="cover"
          />
          <View style={[styles.sportBadge, { backgroundColor: theme.colors.card + 'E6' }]}>
            <Text style={[styles.sportBadgeText, { color: theme.colors.primary }]}>
              {item.sport?.name || 'Genel'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.newsImagePlaceholder, { backgroundColor: theme.colors.accent + '15' }]}>
          <Ionicons name="newspaper-outline" size={40} color={theme.colors.accent} />
          <View style={[styles.sportBadge, { backgroundColor: theme.colors.card + 'E6' }]}>
            <Text style={[styles.sportBadgeText, { color: theme.colors.primary }]}>
              {item.sport?.name || 'Genel'}
            </Text>
          </View>
        </View>
      )}
      
      {/* Haber içeriği */}
      <View style={styles.newsContent}>
        <Text style={[styles.newsTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={[styles.newsExcerpt, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.content}
        </Text>
        
        <View style={styles.newsFooter}>
          

          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Yükleniyor göstergesi
  const renderFooter = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color={theme.colors.accent} />
        <Text style={[styles.loaderText, { color: theme.colors.textSecondary }]}>
          Daha fazla haber yükleniyor...
        </Text>
      </View>
    );
  };
  
  // Boş liste
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyImageContainer}>
        <Ionicons name="newspaper-outline" size={60} color={theme.colors.textSecondary + '60'} />
        <View style={[styles.emptyImageOverlay, { backgroundColor: theme.colors.accent + '10' }]} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {selectedSportId !== 'all' 
          ? 'Bu kategoride haber yok'
          : 'Henüz haber bulunmuyor'
        }
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        {selectedSportId !== 'all' 
          ? 'Bu spor kategorisinde henüz haber paylaşılmamış.'
          : 'Henüz haber bulunmuyor, daha sonra tekrar kontrol edin.'
        }
      </Text>
      {selectedSportId !== 'all' && (
        <TouchableOpacity 
          style={[styles.resetButton, { backgroundColor: theme.colors.accent + '20' }]}
          onPress={() => filterNewsBySport('all')}
        >
          <Ionicons name="refresh-outline" size={16} color={theme.colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.resetButtonText, { color: theme.colors.accent }]}>
            Tüm Haberleri Göster
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Spor kategorisi öğesi
  const renderSportItem = ({ item }: { item: Sport }) => (
    <TouchableOpacity
      style={[
        styles.sportItem,
        { 
          backgroundColor: selectedSportId === item.id 
            ? theme.colors.accent
            : theme.colors.accent + '15',
        }
      ]}
      onPress={() => filterNewsBySport(item.id)}
      activeOpacity={0.7}
    >
      <Text 
        style={[
          styles.sportItemText, 
          { 
            color: selectedSportId === item.id 
              ? 'white'
              : theme.colors.accent
          }
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  // Hata durumu
  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
        <Ionicons name="alert-circle-outline" size={24} color={theme.colors.error} style={styles.errorIcon} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.errorButton, { backgroundColor: theme.colors.error + '30' }]}
          onPress={() => fetchAllNews()}
        >
          <Text style={[styles.errorButtonText, { color: theme.colors.error }]}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      
      {/* Animasyonlu Header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            height: headerHeight,
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1
          }
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Spor Haberleri
          </Text>
          
          <TouchableOpacity style={styles.filterButton}>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Spor türü filtreleri */}
      <View style={styles.sportsContainer}>
        <FlatList
          data={sportCategories}
          renderItem={renderSportItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sportsList}
        />
      </View>
      
      {/* Ana içerik */}
      <View style={styles.contentContainer}>
        {/* Hata mesajı */}
        {renderError()}
        
        {/* İlk yükleme sırasında gösterilecek loader */}
        {isLoading && filteredNews.length === 0 ? (
          <View style={styles.initialLoaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={[styles.loaderText, { color: theme.colors.textSecondary, marginTop: 16 }]}>
              Haberler yükleniyor...
            </Text>
          </View>
        ) : (
          /* Haber listesi */
          <FlatList
            ref={flatListRef}
            data={filteredNews}
            renderItem={renderNewsItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.newsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshNews}
                colors={[theme.colors.accent]}
                tintColor={theme.colors.accent}
              />
            }
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            onEndReached={loadMoreNews}
            onEndReachedThreshold={0.3}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
        )}
      </View>
      
      {/* Yukarı Kaydırma Butonu */}
      {showScrollToTop && (
        <TouchableOpacity 
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#2196F3',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 999,
          }} 
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-up" size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 4,
  },
  sportsContainer: {
    paddingTop: 8,
    zIndex: 5,
  },
  sportsList: {
    paddingHorizontal: 16,
  },
  sportItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  sportItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  newsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  newsCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsImageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  newsImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  newsImagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  sportBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sportBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newsExcerpt: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  loaderFooter: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loaderText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 40,
  },
  emptyImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyImageOverlay: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  initialLoaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  errorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  errorButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
});

export default AllNewsScreen;
