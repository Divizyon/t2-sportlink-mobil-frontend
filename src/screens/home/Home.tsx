import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import useThemeStore from '../../../store/slices/themeSlice';

// Renk paleti - Açık tema
const LIGHT_COLORS = {
  primary: "#44C26D",  // Ana renk - Yeşil
  secondary: "#3066BE", // İkincil renk - Mavi
  background: "#F5F7FA", // Arka plan - Açık gri
  card: "#FFFFFF",     // Kart arkaplanı - Beyaz
  text: {
    dark: "#1D2B4E", // Koyu metin
    light: "#89939E", // Açık metin
  },
  divider: "#E1E4E8", // Ayırıcı çizgi
};

// Renk paleti - Koyu tema
const DARK_COLORS = {
  primary: "#4BD07D",  // Ana renk - Daha parlak yeşil
  secondary: "#4080DD", // İkincil renk - Daha parlak mavi
  background: "#15202B", // Twitter benzeri koyu mavi arka plan
  card: "#192734",     // Kart arkaplanı - Koyu
  text: {
    dark: "#FFFFFF", // Beyaz metin
    light: "#8899A6", // Açık gri metin
  },
  divider: "#38444D", // Ayırıcı çizgi
};

// Örnek etkinlikler
const sampleActivities = [
  {
    id: 1,
    title: 'Haftalık Koşu',
    type: 'Koşu',
    location: 'Belgrad Ormanı',
    date: '25 Kasım, 08:00',
    participants: 24,
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=300&auto=format'
  },
  {
    id: 2,
    title: 'Bisiklet Turu',
    type: 'Bisiklet',
    location: 'Caddebostan Sahil',
    date: '27 Kasım, 10:30',
    participants: 18,
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=300&auto=format'
  },
  {
    id: 3,
    title: 'Yoga Buluşması',
    type: 'Yoga',
    location: 'Yıldız Parkı',
    date: '26 Kasım, 09:00',
    participants: 12,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300&auto=format'
  }
];

// Örnek öneriler
const recommendations = [
  {
    id: 101,
    title: 'Başlangıç Seviyesi Koşu Programı',
    duration: '4 Hafta',
    level: 'Başlangıç',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=300&auto=format'
  },
  {
    id: 102,
    title: 'Evde Fitness Rutini',
    duration: '8 Hafta',
    level: 'Orta',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format'
  },
  {
    id: 103,
    title: 'Bisiklet Antrenmanı',
    duration: '6 Hafta',
    level: 'İleri',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=300&auto=format'
  }
];

/**
 * Ana Sayfa Ekranı
 * Yaklaşan etkinlikler, öneriler ve kullanıcı istatistiklerini gösterir
 */
export default function HomeScreen() {
  const { isDarkMode } = useThemeStore();
  const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Üst Başlık */}
      <View style={[styles.header, { borderBottomColor: COLORS.divider }]}>
        <Text style={[styles.headerTitle, { color: COLORS.text.dark }]}>Merhaba, Kullanıcı!</Text>
        <TouchableOpacity 
          style={[styles.notificationButton, { backgroundColor: COLORS.card }]}
          onPress={() => console.log('Bildirimler')}
        >
          <Text style={{ fontSize: 16 }}>🔔</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Aktivite Özeti Kartı */}
        <View style={[styles.activityCard, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.cardTitle, { color: COLORS.text.dark }]}>Bugünkü Aktiviteler</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>2,453</Text>
              <Text style={[styles.statLabel, { color: COLORS.text.light }]}>Adım</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: COLORS.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>3.2</Text>
              <Text style={[styles.statLabel, { color: COLORS.text.light }]}>km</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: COLORS.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>247</Text>
              <Text style={[styles.statLabel, { color: COLORS.text.light }]}>kcal</Text>
            </View>
          </View>
        </View>
        
        {/* Yaklaşan Etkinlikler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: COLORS.text.dark }]}>Yaklaşan Etkinlikler</Text>
            <TouchableOpacity onPress={() => router.push('/events' as any)}>
              <Text style={[styles.seeAllButton, { color: COLORS.secondary }]}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {sampleActivities.map(activity => (
              <TouchableOpacity 
                key={activity.id}
                style={[styles.eventCard, { backgroundColor: COLORS.card }]}
                onPress={() => router.push(`/events/${activity.id}` as any)}
              >
                <Image 
                  source={{ uri: activity.image }} 
                  style={styles.eventImage}
                  resizeMode="cover"
                />
                <View style={styles.eventContent}>
                  <Text style={[styles.eventTitle, { color: COLORS.text.dark }]}>{activity.title}</Text>
                  <Text style={[styles.eventType, { color: COLORS.primary }]}>{activity.type}</Text>
                  <Text style={[styles.eventDetail, { color: COLORS.text.light }]}>📍 {activity.location}</Text>
                  <Text style={[styles.eventDetail, { color: COLORS.text.light }]}>🗓️ {activity.date}</Text>
                  <Text style={[styles.eventDetail, { color: COLORS.text.light }]}>👥 {activity.participants} katılımcı</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Önerilen Programlar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: COLORS.text.dark }]}>Önerilen Programlar</Text>
            <TouchableOpacity onPress={() => router.push('/programs' as any)}>
              <Text style={[styles.seeAllButton, { color: COLORS.secondary }]}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {recommendations.map(program => (
              <TouchableOpacity 
                key={program.id}
                style={[styles.programCard, { backgroundColor: COLORS.card }]}
                onPress={() => router.push(`/programs/${program.id}` as any)}
              >
                <Image 
                  source={{ uri: program.image }} 
                  style={styles.programImage}
                  resizeMode="cover"
                />
                <View style={styles.programContent}>
                  <Text style={[styles.programTitle, { color: COLORS.text.dark }]}>{program.title}</Text>
                  <Text style={[styles.programDetail, { color: COLORS.text.light }]}>⏱️ {program.duration}</Text>
                  <Text style={[styles.programDetail, { color: COLORS.text.light }]}>📊 {program.level}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  activityCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllButton: {
    fontSize: 14,
  },
  horizontalScrollContent: {
    paddingRight: 20,
  },
  eventCard: {
    width: 250,
    borderRadius: 15,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 120,
  },
  eventContent: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  eventDetail: {
    fontSize: 13,
    marginBottom: 5,
  },
  programCard: {
    width: 200,
    borderRadius: 15,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  programImage: {
    width: '100%',
    height: 100,
  },
  programContent: {
    padding: 15,
  },
  programTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  programDetail: {
    fontSize: 13,
    marginBottom: 4,
  },
}); 