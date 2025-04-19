import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants';
import useThemeStore from '../../store/slices/themeSlice';

/**
 * Bul tab ekranı
 * Kullanıcıların etkinlik ve tesis araması yapmasını sağlar
 */
export default function FindTab() {
  const { isDarkMode } = useThemeStore();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : COLORS.neutral.silver }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white }]}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
          Keşfet
        </Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Arama Kutusu */}
        <View style={[
          styles.searchContainer, 
          { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white }
        ]}>
          <Ionicons name="search" size={20} color={isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark} />
          <TextInput
            style={[styles.searchInput, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}
            placeholder="Etkinlik veya tesis ara..."
            placeholderTextColor={isDarkMode ? '#718096' : '#A0AEC0'}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
        
        {/* Kategori Filtresi */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilters}
        >
          {['Tümü', 'Spor', 'Sanat', 'Eğitim', 'Müzik', 'Doğa', 'Teknoloji'].map((category, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.categoryItem,
                index === 0 && styles.categorySelected,
                { 
                  backgroundColor: index === 0 
                    ? COLORS.accent 
                    : (isDarkMode ? '#1E293B' : COLORS.neutral.white),
                  borderColor: isDarkMode ? '#2D3748' : COLORS.neutral.light,
                }
              ]}
            >
              <Text 
                style={[
                  styles.categoryText,
                  { 
                    color: index === 0 
                      ? COLORS.neutral.white 
                      : (isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark)
                  }
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Öneri Başlığı */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
            Yakındaki Etkinlikler
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: COLORS.accent }]}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        {/* Etkinlik Kartları - Şimdilik sadece boş görüntü gösteriyoruz */}
        <View style={styles.emptyStateContainer}>
          <Ionicons name="calendar-outline" size={70} color={isDarkMode ? '#2D3748' : COLORS.neutral.light} />
          <Text style={[styles.emptyStateText, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
            Yakınınızda etkinlik bulunamadı
          </Text>
          <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: COLORS.accent }]}
          >
            <Text style={styles.createButtonText}>Etkinlikleri Keşfet</Text>
          </TouchableOpacity>
        </View>
        
        {/* Öneri Başlığı */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}>
            Popüler Tesisler
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: COLORS.accent }]}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tesis Kartları - Şimdilik sadece boş görüntü gösteriyoruz */}
        <View style={styles.emptyStateContainer}>
          <Ionicons name="business-outline" size={70} color={isDarkMode ? '#2D3748' : COLORS.neutral.light} />
          <Text style={[styles.emptyStateText, { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark }]}>
            Yakınınızda tesis bulunamadı
          </Text>
          <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: COLORS.accent }]}
          >
            <Text style={styles.createButtonText}>Tesisleri Keşfet</Text>
          </TouchableOpacity>
        </View>
        
        {/* Boşluk */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
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
    justifyContent: 'center',
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
  scrollContent: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  categoryFilters: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categorySelected: {
    borderWidth: 0,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginVertical: 16,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 