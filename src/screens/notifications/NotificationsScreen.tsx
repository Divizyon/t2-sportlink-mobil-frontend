import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { useNotificationStore } from '../../store/appStore/notificationStore';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Notification, NotificationType } from '../../types/apiTypes/notification.types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Navigasyon için tipleri tanımlama
type RootStackParamList = {
  Home: undefined;
  Events: undefined;
  Discover: undefined;
  Notifications: undefined;
  Profile: undefined;
  EventDetail: { eventId: string };
  NewsDetail: { newsId: string };
  AnnouncementDetail: { announcementId: string };
};

type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Bildirim tiplerine göre ikonlar
const notificationIcons: Record<NotificationType, string> = {
  event: 'calendar-outline',
  friend_request: 'person-add-outline',
  system: 'notifications-outline',
  message: 'chatbubble-outline',
  news: 'newspaper-outline',
  announcement: 'megaphone-outline'
};

// Bildirim öğesi bileşeni
const NotificationItem: React.FC<{ 
  item: Notification; 
  onPress: (item: Notification) => void;
  theme: any;
}> = ({ item, onPress, theme }) => {
  
  // Bildirim tipi ikon ve renklerini belirle
  const iconName = notificationIcons[item.type as NotificationType] || 'notifications-outline';
  
  let iconBgColor = '';
  switch (item.type) {
    case 'event':
      iconBgColor = '#4CB944'; // Yeşil
      break;
    case 'friend_request':
      iconBgColor = '#3498db'; // Mavi
      break;
    case 'system':
      iconBgColor = '#f39c12'; // Turuncu
      break;
    case 'message':
      iconBgColor = '#9b59b6'; // Mor
      break;
    case 'news':
    case 'announcement':
      iconBgColor = '#2ecc71'; // Açık yeşil
      break;
    default:
      iconBgColor = theme.colors.accent;
  }
  
  // Zaman formatı
  const timeAgo = item.created_at 
    ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: tr })
    : '';
  
  return (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { 
          backgroundColor: theme.colors.card,
          borderLeftColor: item.is_read ? 'transparent' : iconBgColor,
          borderLeftWidth: item.is_read ? 0 : 4,
        }
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconBgColor}20` }]}>
        <Ionicons name={iconName as any} size={22} color={iconBgColor} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text 
            style={[
              styles.notificationTitle, 
              { 
                color: theme.colors.text,
                fontWeight: item.is_read ? '400' : '700'
              }
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            {timeAgo}
          </Text>
        </View>
        
        <Text 
          style={[styles.notificationText, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.body}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Bildirimler ana bileşeni
export const NotificationsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const { 
    notifications, 
    isLoading, 
    unreadCount,
    error,
    pagination,
    fetchNotifications, 
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  } = useNotificationStore();
  
  // İlk yükleme
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);
  
  // Bildirim yenileme
  const onRefresh = async () => {
    await refreshNotifications();
  };
  
  // Daha fazla bildirim yükleme
  const loadMoreNotifications = () => {
    if (pagination.page < pagination.totalPages && !isLoading) {
      fetchNotifications(pagination.page + 1, pagination.limit);
    }
  };
  
  // Bildirime tıklanınca 
  const handleNotificationPress = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Yönlendirme URL varsa ona git
    if (notification.redirect_url) {
      // Yönlendirme işlemleri burada yapılacak
      console.log('Bildirim yönlendirmesi:', notification.redirect_url);
    }
    
    // Bildirim türüne göre aksiyon almak için
    switch (notification.type) {
      case 'event':
        if (notification.event_id) {
          // Etkinlik detayına git
          navigation.navigate('EventDetail', { eventId: notification.event_id });
        }
        break;
      case 'friend_request':
        // Arkadaşlık istekleri sayfasına git
        // navigation.navigate('FriendRequests');
        break;
      case 'message':
        // Mesajlaşma sayfasına git
        // Burada bildirimden gelen data içerisinden conversation_id alınabilir
        break;
      case 'news':
        if (notification.data?.newsId) {
          navigation.navigate('NewsDetail', { newsId: notification.data.newsId as string });
        }
        break;
      case 'announcement':
        if (notification.data?.announcementId) {
          navigation.navigate('AnnouncementDetail', { announcementId: notification.data.announcementId as string });
        }
        break;
      default:
        // Özel bir yönlendirme yoksa bildirimler ekranında kal
        break;
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Bildirimler</Text>
        
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={[styles.markAllButton, { borderColor: theme.colors.border }]}
            onPress={markAllAsRead}
          >
            <Text style={{ color: theme.colors.primary }}>Tümünü Okundu İşaretle</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem 
            item={item} 
            onPress={handleNotificationPress}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loaderContainer}>
              <Image
                source={require('../../../assets/loading/ball-toggle.gif')}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={60} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Henüz bildiriminiz bulunmuyor
              </Text>
            </View>
          )
        }
        onEndReached={loadMoreNotifications}
        onEndReachedThreshold={0.2}
      />
      
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={refreshNotifications}
          >
            <Text style={{ color: 'white' }}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  markAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    marginLeft: 8,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    marginRight: 10,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  }
}); 