import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  StatusBar
} from 'react-native';
import { useThemeStore } from '../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';

// Bildirim tipi tanımı
interface Notification {
  id: string;
  type: 'event' | 'friend' | 'system' | 'mention' | 'comment';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  image?: string;
  actionUrl?: string;
}

// Bildirim tiplerine göre ikonlar
const notificationIcons = {
  event: 'calendar-outline',
  friend: 'person-add-outline',
  system: 'notifications-outline',
  mention: 'at-outline',
  comment: 'chatbubble-outline',
} as const;

// Bildirim öğesi bileşeni
const NotificationItem: React.FC<{ 
  item: Notification; 
  onPress: (item: Notification) => void;
  theme: any;
}> = ({ item, onPress, theme }) => {
  
  // Bildirim tipi ikon ve renklerini belirle
  const iconName = notificationIcons[item.type];
  
  let iconBgColor = '';
  switch (item.type) {
    case 'event':
      iconBgColor = '#4CB944'; // Yeşil
      break;
    case 'friend':
      iconBgColor = '#3498db'; // Mavi
      break;
    case 'system':
      iconBgColor = '#f39c12'; // Turuncu
      break;
    case 'mention':
      iconBgColor = '#9b59b6'; // Mor
      break;
    case 'comment':
      iconBgColor = '#2ecc71'; // Açık yeşil
      break;
    default:
      iconBgColor = theme.colors.accent;
  }
  
  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { 
          backgroundColor: item.isRead ? theme.colors.cardBackground : `${iconBgColor}10`,
          borderColor: theme.colors.border
        }
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.unreadDot, { opacity: item.isRead ? 0 : 1, backgroundColor: iconBgColor }]} />
      
      <View style={[styles.iconContainer, { backgroundColor: `${iconBgColor}20` }]}>
        <Ionicons name={iconName} size={20} color={iconBgColor} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
            {item.time}
          </Text>
        </View>
        
        <Text style={[styles.message, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Bildirim türü sekmesi
const NotificationTypeTab: React.FC<{
  title: string;
  isActive: boolean;
  onPress: () => void;
  theme: any;
}> = ({ title, isActive, onPress, theme }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.tab,
        isActive && { 
          backgroundColor: '#4CB94420',
          borderBottomColor: '#4CB944', 
          borderBottomWidth: 2 
        }
      ]} 
      onPress={onPress}
    >
      <Text 
        style={[
          styles.tabText, 
          { color: isActive ? '#4CB944' : theme.colors.textSecondary }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Örnek bildirim verileri
const dummyNotifications: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'Yeni Futbol Etkinliği',
    message: 'Yakınınızda "Pazar Futbol Maçı" etkinliği oluşturuldu. Katılmak ister misiniz?',
    time: '5 dk önce',
    isRead: false,
  },
  {
    id: '2',
    type: 'friend',
    title: 'Arkadaşlık İsteği',
    message: 'Ahmet Kaya size arkadaşlık isteği gönderdi. Kabul etmek ister misiniz?',
    time: '30 dk önce',
    isRead: false,
  },
  {
    id: '3',
    type: 'comment',
    title: 'Yeni Yorum',
    message: 'Mehmet etkinliğinize yorum yaptı: "Saati 18:00\'e alabilir miyiz?"',
    time: '1 saat önce',
    isRead: true,
  },
  {
    id: '4',
    type: 'mention',
    title: 'Etkinlikte Etiketlendiniz',
    message: 'Ayşe sizi "Hafta Sonu Voleybol Turnuvası" etkinliğinde etiketledi.',
    time: '3 saat önce',
    isRead: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'Hesap Doğrulaması',
    message: 'E-posta adresiniz başarıyla doğrulandı. Artık tüm özelliklere erişebilirsiniz.',
    time: '1 gün önce',
    isRead: true,
  },
  {
    id: '6',
    type: 'event',
    title: 'Etkinlik Hatırlatması',
    message: 'Basketbol maçınız yarın saat 16:00\'da başlayacak.',
    time: '1 gün önce',
    isRead: true,
  },
  {
    id: '7',
    type: 'friend',
    title: 'Yeni Takipçi',
    message: 'Zeynep sizi takip etmeye başladı.',
    time: '2 gün önce',
    isRead: true,
  },
  {
    id: '8',
    type: 'system',
    title: 'Yeni Özellik',
    message: 'Uygulamamıza etkinlik sohbet odaları özelliği eklendi. Hemen deneyin!',
    time: '1 hafta önce',
    isRead: true,
  },
];

// Bildirimler ana bileşeni
export const NotificationsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);
  
  // Bildirim listesini yenile
  const onRefresh = () => {
    setRefreshing(true);
    // Gerçek uygulamada burada API çağrısı olacak
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Bildirimleri filtrele
  const getFilteredNotifications = () => {
    if (activeTab === 'all') {
      return notifications;
    }
    
    return notifications.filter(notification => notification.type === activeTab);
  };
  
  // Bildirime tıklanınca
  const handleNotificationPress = (notification: Notification) => {
    // Bildirimi okundu olarak işaretle
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );
    
    // Gerçek uygulamada burada yönlendirme yapılabilir
    console.log('Bildirime tıklandı:', notification);
  };
  
  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };
  
  // Okunmamış bildirim sayısı
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Bildirimler
        </Text>
        
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.readAllButton} onPress={markAllAsRead}>
            <Text style={[styles.readAllText, { color: '#4CB944' }]}>
              Tümünü Okundu İşaretle
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={[styles.tabContainer, { borderBottomColor: theme.colors.border, borderBottomWidth: 1 }]}>
        <NotificationTypeTab 
          title="Tümü" 
          isActive={activeTab === 'all'} 
          onPress={() => setActiveTab('all')}
          theme={theme}
        />
        <NotificationTypeTab 
          title="Etkinlikler" 
          isActive={activeTab === 'event'} 
          onPress={() => setActiveTab('event')}
          theme={theme}
        />
        <NotificationTypeTab 
          title="Sosyal" 
          isActive={activeTab === 'friend'} 
          onPress={() => setActiveTab('friend')}
          theme={theme}
        />
        <NotificationTypeTab 
          title="Yorumlar" 
          isActive={activeTab === 'comment'} 
          onPress={() => setActiveTab('comment')}
          theme={theme}
        />
      </View>
      
      <FlatList
        data={getFilteredNotifications()}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <NotificationItem 
            item={item} 
            onPress={handleNotificationPress}
            theme={theme}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CB944']}
            tintColor={theme.colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              Bildirim Bulunamadı
            </Text>
            <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
              Bu kategoride bildiriminiz bulunmuyor.
            </Text>
          </View>
        }
      />
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  readAllButton: {
    padding: 8,
  },
  readAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    fontSize: 12,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
}); 