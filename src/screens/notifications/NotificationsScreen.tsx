import React, { useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  StatusBar,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../store/notificationStore/notificationStore';
import { NotificationItem } from '../../api/notifications/notificationService';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/userStore/authStore';

export const NotificationsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { 
    notifications, 
    pagination, 
    unreadCount,
    isLoading, 
    isRefreshing, 
    error, 
    fetchNotifications, 
    fetchUnreadCount,
    markAsRead, 
    markAllAsRead,
    clearError,
    subscribeToRealtimeNotifications,
    unsubscribeFromRealtimeNotifications,
    isSubscribed,
    connectionStatus
  } = useNotificationStore();

  // İlk yükleme ve ekran odaklandığında veri yenileme
  useEffect(() => {
    loadNotifications();
    
    // Kullanıcı ID'si Auth store'dan alınıyor
    const userId = user?.id || 'guest';
    
    // Realtime bildirimlere abone ol
    if (!isSubscribed) {
      subscribeToRealtimeNotifications(userId);
    }
    
    // Component unmount olduğunda aboneliği kapat
    return () => {
      unsubscribeFromRealtimeNotifications();
    };
  }, [user?.id]);
  
  // Ekran odaklandığında okunmamış sayısını güncelle
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  // Bildirimleri yükle
  const loadNotifications = async () => {
    await fetchNotifications(1, 20);
  };

  // Yenileme işlemi
  const onRefresh = async () => {
    await fetchNotifications(1, 20);
  };
  
  // Daha fazla bildirim yükle
  const loadMoreNotifications = async () => {
    if (!isLoading && pagination.hasNextPage) {
      await fetchNotifications(pagination.currentPage + 1, 20);
    }
  };

  // Bildirim tipine göre ikon getir
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'event':
        return 'calendar-outline';
      case 'friend':
        return 'person-add-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'system':
        return 'information-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  // Bildirim tipine göre renk getir
  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'event':
        return theme.colors.accent; // Yeşil
      case 'friend':
        return theme.colors.info; // Mavi
      case 'message':
        return theme.colors.primary; // Koyu mavi
      case 'system':
        return theme.colors.warning; // Turuncu
      default:
        return theme.colors.dark;
    }
  };

  // Bildirim tipine göre soluk renk arka plan getir
  const getNotificationBackgroundColor = (type: string) => {
    switch(type) {
      case 'event':
        return `${theme.colors.accent}15`; // Yeşil %15 opaklık
      case 'friend':
        return `${theme.colors.info}15`; // Mavi %15 opaklık
      case 'message':
        return `${theme.colors.primary}15`; // Koyu mavi %15 opaklık
      case 'system':
        return `${theme.colors.warning}15`; // Turuncu %15 opaklık
      default:
        return `${theme.colors.dark}15`;
    }
  };

  // Zamanı formatla (ne kadar süre önce)
  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return diffDay === 1 ? 'Dün' : `${diffDay} gün önce`;
    } else if (diffHour > 0) {
      return `${diffHour} saat önce`;
    } else if (diffMin > 0) {
      return `${diffMin} dakika önce`;
    } else {
      return 'Az önce';
    }
  };

  // Bildirimi okundu olarak işaretle
  const handleMarkAsRead = async (id: string, data?: any) => {
    await markAsRead(id);
    
    // Eğer bildirimin data alanında redirectUrl varsa o URL'e yönlendir
    if (data?.redirectUrl) {
      try {
        await Linking.openURL(data.redirectUrl);
      } catch (error) {
        console.error('URL açılamadı:', error);
      }
    }
  };

  // Tüm bildirimleri okundu olarak işaretle
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      
      // Manuel olarak bildirimleri yeniden yükle
      await fetchNotifications(1, 20);
      
      // Okunmamış sayısını da güncelle
      await fetchUnreadCount();
    } catch (error) {
      console.error('Tümünü okundu işaretleme hatası:', error);
    }
  };

  // Bildirim tipine göre başlık rengi getir
  const getNotificationTitleColor = (type: string, isRead: boolean) => {
    if (!isRead) {
      return getNotificationColor(type);
    }
    return theme.colors.text;
  };

  // Bildirim tipine göre içerik metni
  const getNotificationContent = (type: string) => {
    switch(type) {
      case 'event':
        return 'Etkinlik';
      case 'friend':
        return 'Arkadaşlık';
      case 'message':
        return 'Mesaj';
      case 'system':
        return 'Sistem';
      default:
        return 'Bildirim';
    }
  };

  // Bildirim öğesi render fonksiyonu
  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    // Bildirim türüne göre arka plan rengi
    const getBgColor = () => {
      switch(item.type) {
        case 'event':
          return '#f0fff5'; // Açık yeşil
        case 'friend':
          return '#f0f7ff'; // Açık mavi
        case 'message':
          return '#f5f0ff'; // Açık mor
        case 'system':
          return '#fff7f0'; // Açık turuncu
        default:
          return '#f5f5f5';
      }
    };
    
    // Bildirim türüne göre ikon rengi ve adı
    const getIconColor = () => {
      switch(item.type) {
        case 'event':
          return '#4CAF50'; // Yeşil
        case 'friend':
          return '#2196F3'; // Mavi
        case 'message':
          return '#9C27B0'; // Mor
        case 'system':
          return '#FF9800'; // Turuncu
        default:
          return '#757575';
      }
    };
    
    const getIconName = () => {
      switch(item.type) {
        case 'event':
          return 'calendar-outline';
        case 'friend':
          return 'person-add-outline';
        case 'message':
          return 'chatbubble-outline';
        case 'system':
          return 'warning-outline';
        default:
          return 'information-circle-outline';
      }
    };
    
    // Ayrıntılar için dokunun gösterilecek mi
    const showDetails = ['event', 'friend'].includes(item.type) || !!item.data?.redirectUrl;
    
    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem, 
          { 
            backgroundColor: theme.mode === 'dark' ? theme.colors.cardBackground : getBgColor(),
            borderLeftColor: getIconColor(),
          }
        ]}
        onPress={() => handleMarkAsRead(item.id, item.data)}
        activeOpacity={0.7}
      >
        {/* Sol taraftaki ikon bölgesi */}
        <View style={[styles.iconCircle, {backgroundColor: theme.mode === 'dark' ? theme.colors.background : '#f5f5f5'}]}>
          <Ionicons 
            name={getIconName()} 
            size={24} 
            color={getIconColor()} 
          />
        </View>
        
        {/* Sağ taraftaki içerik kısmı */}
        <View style={styles.contentContainer}>
          {/* Başlık */}
          <Text 
            style={[
              styles.notificationTitle, 
              { color: theme.colors.text }
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          
          {/* İçerik */}
          <Text 
            style={[
              styles.notificationMessage, 
              { color: theme.colors.textSecondary }
            ]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          
          {/* Ayrıntılar için dokunun (sadece belirli türdeki bildirimlerde) */}
          {showDetails && (
            <Text style={styles.detailsLink}>
              Ayrıntılar için dokunun
            </Text>
          )}
        </View>
        
        {/* Zaman bilgisi */}
        <View style={styles.timeSection}>
          <Ionicons 
            name="time-outline" 
            size={14} 
            color={theme.colors.textSecondary} 
            style={{marginRight: 4}}
          />
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            {formatTime(item.time)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Liste footer (loading spinner)
  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.info} />
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Bildirimler yükleniyor...
        </Text>
      </View>
    );
  };

  // Bildirimler boşsa gösterilecek içerik
  const renderEmptyComponent = () => {
    if (isLoading && !isRefreshing) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.info} />
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary, marginTop: 16 }]}>
            Bildirimler yükleniyor...
          </Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="alert-circle-outline" 
            size={70} 
            color={theme.colors.error} 
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Bir Hata Oluştu
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.info }]}
            onPress={() => {
              clearError();
              loadNotifications();
            }}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name="notifications-off-outline" 
          size={70} 
          color={theme.colors.dark} 
        />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          Bildiriminiz Yok
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
          Yeni bildirimler geldiğinde burada görünecek
        </Text>
      </View>
    );
  };

  // Bağlantı durumu ikonu
  const getConnectionStatusIcon = () => {
    switch(connectionStatus) {
      case 'connected':
        return <Ionicons name="radio-outline" size={14} color="#4CAF50" />;
      case 'connecting':
        return <Ionicons name="sync-outline" size={14} color="#FF9800" />;
      case 'disconnected':
        return <Ionicons name="cloud-offline-outline" size={14} color="#607D8B" />;
      case 'error':
        return <Ionicons name="warning-outline" size={14} color="#F44336" />;
      default:
        return null;
    }
  };

  // Header kısmı
  const renderHeader = () => (
    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Bildirimler {unreadCount > 0 && <Text style={styles.unreadCountText}>({unreadCount})</Text>}
        </Text>
        <View style={styles.connectionStatus}>
          {getConnectionStatusIcon()}
          <Text style={[styles.connectionStatusText, { color: theme.colors.textSecondary }]}>
            {connectionStatus === 'connected' ? 'Çevrimiçi' : 
             connectionStatus === 'connecting' ? 'Bağlanıyor...' : 
             connectionStatus === 'disconnected' ? 'Çevrimdışı' : 'Hata'}
          </Text>
        </View>
      </View>
      {notifications.some((notification: NotificationItem) => !notification.isRead) && (
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
          <Text style={[styles.markAllText, { color: theme.colors.info }]}>
            Tümünü Okundu İşaretle
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Alt kısımdaki "Tümünü Okundu İşaretle" floating butonu
  const renderMarkAllReadButton = () => {
    const hasUnreadNotifications = notifications.some((notification: NotificationItem) => !notification.isRead);
    
    if (!hasUnreadNotifications || notifications.length === 0) return null;
    
    return (
      <TouchableOpacity 
        style={[styles.floatingButton, { backgroundColor: theme.colors.info }]} 
        onPress={handleMarkAllAsRead}
        activeOpacity={0.8}
      >
        <Ionicons name="checkmark-done-outline" size={20} color="white" />
        <Text style={styles.floatingButtonText}>Tümünü Okundu İşaretle</Text>
      </TouchableOpacity>
    );
  };
  
  // Yeniden bağlan butonu
  const renderReconnectButton = () => {
    if (connectionStatus !== 'disconnected' && connectionStatus !== 'error') return null;
    
    return (
      <TouchableOpacity 
        style={[
          styles.reconnectButton, 
          { backgroundColor: connectionStatus === 'error' ? theme.colors.error : theme.colors.warning }
        ]} 
        onPress={() => subscribeToRealtimeNotifications(user?.id || 'guest')}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh-outline" size={18} color="white" />
        <Text style={styles.reconnectButtonText}>
          {connectionStatus === 'error' ? 'Bağlantı Hatası' : 'Yeniden Bağlan'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {renderHeader()}
      
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && { flex: 1 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.info]}
            tintColor={theme.colors.info}
          />
        }
        onEndReached={loadMoreNotifications}
        onEndReachedThreshold={0.3}
      />
      
      {renderMarkAllReadButton()}
      {renderReconnectButton()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  connectionStatusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  unreadCountText: {
    color: '#FF3B30', // Bildirim kırmızısı
    fontWeight: 'bold',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
    paddingBottom: 80, // Alt buton için boşluk
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    backgroundColor: '#f5f5f5',
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    paddingRight: 36, // Sağdaki zaman göstergesi için boşluk
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.8,
  },
  detailsLink: {
    fontSize: 14,
    color: '#2196F3', // Mavi bağlantı rengi
    fontWeight: '500',
  },
  timeSection: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    marginLeft: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  reconnectButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reconnectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  }
}); 