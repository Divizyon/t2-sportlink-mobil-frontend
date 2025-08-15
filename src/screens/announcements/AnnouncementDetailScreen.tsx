import React, { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  Share,
  StatusBar,
  Dimensions,
  Image,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Easing,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { create } from 'zustand';
import { Announcement } from '../../types/apiTypes/api.types';
import announcementService from '../../api/announcements/announcementService';
import { colors } from '../../constants/colors/colors';

// Route param tipini tanımla
type AnnouncementDetailRouteParams = {
  AnnouncementDetail: {
    announcementId: string;
    showAsModal?: boolean;
  };
};

// Zustand store oluştur - Duyuru detayı için
interface AnnouncementDetailState {
  currentAnnouncement: Announcement | null;
  isLoading: boolean;
  error: string | null;
  fetchAnnouncementDetail: (announcementId: string) => Promise<void>;
  clearError: () => void;
}

export const useAnnouncementDetailStore = create<AnnouncementDetailState>((set) => ({
  currentAnnouncement: null,
  isLoading: false,
  error: null,
  
  fetchAnnouncementDetail: async (announcementId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await announcementService.getAnnouncementDetail(announcementId);
      
      // API yanıtını kontrol et
      if (response.success && response.data) {
        // API yanıtı announcement nesnesi içerebilir
        const announcement = (response.data as any).announcement || response.data;
        console.log('Gelen duyuru detayı:', announcement);
        set({ currentAnnouncement: announcement, isLoading: false });
      } else {
        throw new Error('API yanıtı beklenmeyen formatta');
      }
    } catch (error) {
      console.error('Duyuru detayı alınırken hata oluştu:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Duyuru detayları alınırken bir hata oluştu',
        isLoading: false 
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));

const { width, height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.9;

export const AnnouncementDetailScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AnnouncementDetailRouteParams, 'AnnouncementDetail'>>();
  const { announcementId } = route.params;
  const showAsModal = route.params.showAsModal !== false; // Varsayılan olarak modal olarak göster
  
  const [modalVisible, setModalVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  
  const { currentAnnouncement, isLoading, error, fetchAnnouncementDetail } = useAnnouncementDetailStore();
  
  // Sayfaya geldiğimizde duyurunun detaylarını getir ve animasyon başlat
  useEffect(() => {
    fetchAnnouncementDetail(announcementId);
    
    // Modal animasyonu
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
    
  }, [announcementId]);
  
  // Modal'ı kapat
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      setModalVisible(false);
      navigation.goBack();
    });
  };
  
  // Paylaş fonksiyonu
  const handleShare = async () => {
    if (!currentAnnouncement) return;
    
    try {
      await Share.share({
        message: `${currentAnnouncement.title} - ${currentAnnouncement.content.replace(/<[^>]*>/g, '')}`,
        title: currentAnnouncement.title,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  // Slug'dan resim URL'sini kontrol et
  const isImageUrl = (slug?: string): boolean => {
    if (!slug) return false;
    return slug.startsWith('http') && (slug.includes('.jpg') || slug.includes('.jpeg') || slug.includes('.png') || slug.includes('.gif') || slug.includes('.webp'));
  };

  // HTML içeriğinden resim URL'sini çıkarma
  const extractImageUrlFromHtml = (content?: string): string | null => {
    if (!content) return null;
    
    // HTML içindeki img tag'lerini ara
    const htmlImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const htmlMatch = htmlImgRegex.exec(content);
    
    if (htmlMatch && htmlMatch[1]) {
      const imagePath = htmlMatch[1].trim();
      
      // Eğer relative path ise (uploads ile başlıyorsa) tam URL'ye çevir
      if (imagePath.startsWith('/uploads/')) {
        return `https://sepet.konya.bel.tr/wwwsporkonyacomtr${imagePath}`;
      }
      
      // Eğer zaten tam URL ise direkt döndür
      return imagePath;
    }
    
    return null;
  };

  // HTML içeriğinden metni çıkarma
  const extractTextFromHtml = (content?: string): string => {
    if (!content) return '';
    
    // HTML tag'lerini kaldır
    let cleanText = content.replace(/<[^>]*>/g, '');
    
    // Fazla boşlukları temizle
    cleanText = cleanText.replace(/\n\s*\n/g, '\n').trim();
    
    // HTML entities'leri decode et
    cleanText = cleanText
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    return cleanText;
  };

  // Tarihi formatlama
  const formatDate = (dateString?: string): string => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'Tarih belirtilmemiş';
    }
    
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Kaynak URL'sini açma
  const openSourceUrl = (content?: string) => {
    if (!content) return;
    
    // Kaynak URL'sini çıkar
    const sourceRegex = /\*\*Kaynak:\*\* \[(.*?)\]\((https?:\/\/[^\s)]+)\)/;
    const match = content.match(sourceRegex);
    
    if (match && match[2]) {
      const url = match[2];
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("URL açılamıyor:", url);
        }
      });
    }
  };

  // Resim URL'sini belirle
  const getImageUrl = (): string | null => {
    if (!currentAnnouncement) return null;
    
    // Önce slug'dan kontrol et (slug alanı artık resim URL'si içeriyor)
    if (currentAnnouncement.slug && isImageUrl(currentAnnouncement.slug)) {
      return currentAnnouncement.slug;
    }
    
    // Sonra içerikten kontrol et
    return extractImageUrlFromHtml(currentAnnouncement.content);
  };

  // Klasik sayfa olarak göster
  if (!showAsModal) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* ... Normal ekran içeriği ... */}
      </View>
    );
  }

  // Modal içeriği göster
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.centeredView}>
        {/* Arka plan karartması */}
        <TouchableWithoutFeedback onPress={closeModal}>
          <Animated.View 
            style={[
              styles.backdrop, 
              { 
                backgroundColor: 'black',
                opacity: backdropOpacity
              }
            ]} 
          />
        </TouchableWithoutFeedback>
        
        {/* Modal içeriği */}
        <Animated.View 
          style={[
            styles.modalView,
            {
              backgroundColor: theme.colors.card,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Üstteki çubuk - kaydırma indikatörü */}
          <View style={styles.dragIndicator} />
          
          {/* İçerik */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={56} color={theme.colors.error} />
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                Duyuru yüklenirken bir sorun oluştu
              </Text>
              <TouchableOpacity 
                onPress={() => fetchAnnouncementDetail(announcementId)}
                style={[styles.retryButton, { backgroundColor: theme.colors.accent }]}
              >
                <Text style={[styles.retryText, { color: theme.colors.white }]}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : currentAnnouncement ? (
            <ScrollView 
              contentContainerStyle={styles.contentContainer} 
              showsVerticalScrollIndicator={false}
            >
              {/* Duyuru Görseli */}
              {getImageUrl() && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: getImageUrl() || '' }}
                    style={styles.announcementImage}
                    resizeMode="contain"
                    onError={(error) => console.log('Resim yükleme hatası:', error.nativeEvent.error)}
                  />
                </View>
              )}
              
              {/* Duyuru Başlığı ve Tarihi */}
              <View style={[styles.announcementHeader]}>
                <Text style={[styles.announcementTitle, { color: theme.colors.text }]}>
                  {currentAnnouncement.title}
                </Text>
                
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
                  <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                    {formatDate(currentAnnouncement.created_at)}
                  </Text>
                </View>
              </View>
              
              {/* Duyuru İçeriği */}
              <View style={[styles.contentSection, { borderTopColor: theme.colors.border }]}>
                <Text style={[styles.announcementContent, { color: theme.colors.text }]}>
                  {extractTextFromHtml(currentAnnouncement.content) || 'İçerik yüklenemedi.'}
                </Text>
          
              </View>
              
              {/* Kaynak Bölümü */}
              {currentAnnouncement.content && currentAnnouncement.content.includes("**Kaynak:**") && (
                <TouchableOpacity 
                  style={[styles.sourceButton, { backgroundColor: theme.colors.primary + '15' }]}
                  onPress={() => openSourceUrl(currentAnnouncement.content)}
                >
                  <Ionicons name="link-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.sourceText, { color: theme.colors.primary }]}>
                    Kaynak Sitesini Ziyaret Et
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Alt Boşluk */}
              <View style={styles.bottomPadding} />
            </ScrollView>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                Duyuru bilgisi bulunamadı
              </Text>
            </View>
          )}
          
          {/* Paylaş butonu */}
          {currentAnnouncement && (
            <TouchableOpacity 
              style={[styles.shareButton, { backgroundColor: theme.colors.primary }]} 
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          {/* Kapat butonu */}
          <TouchableOpacity 
            style={[styles.closeButton, { 
              backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' 
            }]} 
            onPress={closeModal}
          >
            <Ionicons name="close" size={24} color={theme.mode === 'dark' ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalView: {
    width: '100%',
    height: MODAL_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CCCCCC',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  announcementImage: {
    width: '100%',
    height: '100%',
  },
  announcementHeader: {
    padding: 20,
  },
  announcementTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    marginLeft: 6,
  },
  contentSection: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  announcementContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  sourceText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 80,
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
  debugContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  }
});