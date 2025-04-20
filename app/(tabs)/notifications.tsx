import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants';
import useThemeStore from '../../store/slices/themeSlice';

// Örnek bildirim verileri
const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Yeni Etkinlik',
    message: '"Kadıköy Koşu Grubu" etkinliği oluşturuldu.',
    date: '2 saat önce',
    read: false,
    type: 'event'
  },
  {
    id: '2',
    title: 'Rezervasyon Onaylandı',
    message: 'Beşiktaş Spor Tesisi rezervasyonunuz onaylandı.',
    date: '3 saat önce',
    read: true,
    type: 'reservation'
  },
  {
    id: '3',
    title: 'Etkinlik Hatırlatma',
    message: 'Yarın sabah 08:00 Caddebostan Sahil Yürüyüşü etkinliğiniz var.',
    date: '5 saat önce',
    read: true,
    type: 'reminder'
  },
  {
    id: '4',
    title: 'Yeni Mesaj',
    message: 'Ahmet Yılmaz size mesaj gönderdi.',
    date: '1 gün önce',
    read: true,
    type: 'message'
  },
];

/**
 * Bildirimler tab ekranı
 * Kullanıcının bildirimlerini gösterir
 */
export default function NotificationsTab() {
  const { isDarkMode } = useThemeStore();
  
  // Bildirim ikonu tipine göre getir
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'event': 
        return <Ionicons name="calendar" size={24} color={COLORS.accent} />;
      case 'reservation': 
        return <Ionicons name="bookmark" size={24} color={COLORS.info} />;
      case 'reminder': 
        return <Ionicons name="alarm" size={24} color={COLORS.warning} />;
      case 'message': 
        return <Ionicons name="chatbubble" size={24} color={COLORS.secondary} />;
      default: 
        return <Ionicons name="notifications" size={24} color={COLORS.accent} />;
    }
  };

  // Bildirim öğesi renderer
  const renderNotification = ({ item }: { item: typeof NOTIFICATIONS[0] }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { 
          backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white,
          borderLeftColor: item.read ? 'transparent' : COLORS.accent,
        }
      ]}
    >
      <View style={styles.iconContainer}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.message, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
          {item.message}
        </Text>
        <Text style={[styles.date, { color: isDarkMode ? COLORS.neutral.dark : '#A0AEC0' }]}>
          {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : COLORS.neutral.silver }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white }]}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
          Bildirimler
        </Text>
      </View>
      
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
  },
}); 