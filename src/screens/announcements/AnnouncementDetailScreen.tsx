import React, { useEffect, useState, useRef } from 'react';
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
  Easing
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { create } from 'zustand';
import { Announcement } from '../../types/apiTypes/api.types';
import announcementService from '../../api/announcements/announcementService';

// Route param tipini tanımla
type AnnouncementDetailRouteParams = {
  AnnouncementDetail: {
    announcementId: string;
    showAsModal?: boolean;
  };
};

// Türkçe karakterleri düzeltmek için yardımcı fonksiyon
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
      if (response.success && response.data && response.data.announcement) {
        // API'nin döndüğü formatta veri (tekil duyuru)
        const announcement = response.data.announcement;
        
    
        
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
const MODAL_HEIGHT = height * 0.8;

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
        message: `${currentAnnouncement.title} - ${currentAnnouncement.content}`,
        title: currentAnnouncement.title,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
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
              <Image
                source={{ uri: "https://img.freepik.com/free-vector/gradient-announcement-concept_23-2148829634.jpg" }}
                style={styles.announcementImage}
                resizeMode="cover"
              />
              
              {/* Duyuru Başlığı */}
              <View style={[styles.announcementHeader]}>
                <Text style={[styles.announcementTitle, { color: theme.colors.text }]}>
                  {currentAnnouncement.title}
                </Text>
              </View>
              
              {/* Duyuru Tarihi */}
              <View style={[styles.announcementMeta, { borderBottomColor: theme.colors.border }]}>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
                  <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                    {currentAnnouncement.created_at && !isNaN(new Date(currentAnnouncement.created_at).getTime())
                      ? new Date(currentAnnouncement.created_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Tarih belirtilmemiş'}
                  </Text>
                </View>
                
                <TouchableOpacity onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={22} color={theme.colors.accent} />
                </TouchableOpacity>
              </View>
              
              {/* Duyuru İçeriği */}
              <Text style={[styles.announcementContent, { color: theme.colors.text }]}>
                {(currentAnnouncement.content)}
              </Text>
              
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
          
          {/* Kapat butonu */}
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: theme.colors.card }]} 
            onPress={closeModal}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
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
    top: 10,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
  announcementHeader: {
    padding: 16,
    paddingTop: 8,
  },
  announcementTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
  },
  announcementImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  announcementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    marginLeft: 6,
  },
  announcementContent: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
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