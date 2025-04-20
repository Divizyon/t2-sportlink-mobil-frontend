import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar as RNStatusBar, ScrollView, TextInput, ImageBackground, Linking, Platform, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Etkinlik için tip tanımı
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  attendees: number;
  featured?: boolean;
  dateObj?: Date; // Tarih nesnesi eklenecek
}



// Spor kategorileri
interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

/**
 * Etkinlikler tab ekranı
 * Tüm etkinlikleri listeler
 */
export default function EventsTab() {
  // Router tanımı
  const router = useRouter();

  // Aktif kategori
  const [activeCategory, setActiveCategory] = useState<string>('all');
  // Arama metni
  const [searchText, setSearchText] = useState<string>('');
  // Filtrelenmiş etkinlikler
  const [filteredResults, setFilteredResults] = useState<Event[]>([]);
  
  // Tarih filtreleme için state'ler
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [selectedMonthsFor2025, setSelectedMonthsFor2025] = useState<number[]>([]);
  const [selectedMonthsFor2026, setSelectedMonthsFor2026] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2025); // Varsayılan yıl 2025

  // Spor kategorileri
  const categories: Category[] = [
    { id: 'all', name: 'Tümü', icon: 'apps-outline', color: '#4caf50' },
    { id: 'football', name: 'Futbol', icon: 'football-outline', color: '#2196f3' },
    { id: 'basketball', name: 'Basketbol', icon: 'basketball-outline', color: '#ff9800' },
    { id: 'volleyball', name: 'Voleybol', icon: 'tennisball-outline', color: '#e91e63' },
    { id: 'tennis', name: 'Tenis', icon: 'baseball-outline', color: '#9c27b0' },
    { id: 'swimming', name: 'Yüzme', icon: 'water-outline', color: '#00bcd4' },
    { id: 'athletics', name: 'Atletizm', icon: 'walk-outline', color: '#ff5722' },
    { id: 'cycling', name: 'Bisiklet', icon: 'bicycle-outline', color: '#607d8b' },
    { id: 'martial-arts', name: 'Dövüş Sporları', icon: 'fitness-outline', color: '#795548' },
  ];
  
  // Türkçe ay isimleri
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  // Tarih stringini Date objesine çevirme fonksiyonu
  const convertStringToDate = (dateStr: string): Date => {
    const months: { [key: string]: number } = {
      'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3, 'Mayıs': 4, 'Haziran': 5,
      'Temmuz': 6, 'Ağustos': 7, 'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11
    };
    
    const parts = dateStr.split(' ');
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    
    return new Date(year, month, day);
  };

  // Örnek etkinlik verileri
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'İstanbul Maratonu 2023',
      date: '12 Kasım 2023',
      time: '09:00 - 14:00',
      location: 'İstanbul, 15 Temmuz Şehitler Köprüsü',
      image: 'https://picsum.photos/id/1025/500/300',
      category: 'Atletizm',
      attendees: 356
    },
    {
      id: '2',
      title: 'Türkiye - Hırvatistan Futbol Maçı',
      date: '18 Kasım 2023',
      time: '20:45 - 22:30',
      location: 'Atatürk Olimpiyat Stadyumu',
      image: 'https://picsum.photos/id/106/500/300',
      category: 'Futbol',
      attendees: 1278
    },
    {
      id: '3',
      title: 'EuroLeague: Fenerbahçe - Barcelona',
      date: '24 Kasım 2023',
      time: '20:00 - 22:00',
      location: 'Ülker Sports Arena',
      image: 'https://picsum.photos/id/43/500/300',
      category: 'Basketbol',
      attendees: 845
    },
    {
      id: '4',
      title: 'CEV Şampiyonlar Ligi: VakıfBank - Milano',
      date: '5 Aralık 2023',
      time: '19:00 - 21:00',
      location: 'VakıfBank Spor Sarayı',
      image: 'https://picsum.photos/id/116/500/300',
      category: 'Voleybol',
      attendees: 623
    },
    {
      id: '5',
      title: 'Wimbledon 2023 - Final Maçı',
      date: '16 Temmuz 2023',
      time: '15:00 - 18:00',
      location: 'All England Lawn Tennis and Croquet Club, Londra',
      image: 'https://i.imgur.com/replaced-with-tennis-image.jpg',
      category: 'Tenis',
      attendees: 14582,
      featured: true
    },
    {
      id: '6',
      title: 'Türkiye Yüzme Şampiyonası',
      date: '15 Aralık 2023',
      time: '10:00 - 18:00',
      location: 'Burhan Felek Yüzme Havuzu',
      image: 'https://picsum.photos/id/40/500/300',
      category: 'Yüzme',
      attendees: 184
    },
    {
      id: '7',
      title: 'İstanbul Bisiklet Festivali 2023',
      date: '20 Aralık 2023',
      time: '08:00 - 17:00',
      location: 'Belgrad Ormanı',
      image: 'https://picsum.photos/id/146/500/300',
      category: 'Bisiklet',
      attendees: 275
    },
    {
      id: '8',
      title: 'MMA Fight Night İstanbul',
      date: '26 Aralık 2023',
      time: '19:30 - 23:00',
      location: 'Sinan Erdem Spor Salonu',
      image: 'https://picsum.photos/id/201/500/300',
      category: 'Dövüş Sporları',
      attendees: 563
    },
  ]);
  
  // Etkinliklere tarih objesi ekle
  useEffect(() => {
    const eventsWithDate = events.map(event => ({
      ...event,
      dateObj: convertStringToDate(event.date)
    }));
    setEvents(eventsWithDate);
  }, []);

  // Seçilen yıla göre doğru ayları al
  const getSelectedMonths = (): number[] => {
    return selectedYear === 2025 ? selectedMonthsFor2025 : selectedMonthsFor2026;
  };

  // Tüm seçili aylara göre filtreleme
  useEffect(() => {
    // Önce kategori filtrelemesi yap
    let categoryFiltered = activeCategory === 'all' 
      ? events 
      : events.filter(event => {
          const categoryObj = categories.find(cat => cat.id === activeCategory);
          return categoryObj ? event.category === categoryObj.name : true;
        });
    
    // Sonra arama filtrelemesi yap
    if (searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase();
      categoryFiltered = categoryFiltered.filter(
        event => 
          event.title.toLowerCase().includes(searchLower) || 
          event.category.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower)
      );
    }
    
    // Tarih filtrelemesi yap - seçilen yıla göre ay filtresi uygula
    const activeSelectedMonths = getSelectedMonths();
    if (activeSelectedMonths.length > 0) {
      categoryFiltered = categoryFiltered.filter(event => {
        if (!event.dateObj) return true;
        
        // Seçilen ay ve yıla göre filtrele
        const eventMonth = event.dateObj.getMonth();
        const eventYear = event.dateObj.getFullYear();
        
        return activeSelectedMonths.includes(eventMonth) && eventYear === selectedYear;
      });
    }
    
    setFilteredResults(categoryFiltered);
  }, [searchText, activeCategory, events, selectedMonthsFor2025, selectedMonthsFor2026, selectedYear]);

  // Bir ayın seçili olup olmadığını kontrol et
  const isMonthSelected = (monthIndex: number): boolean => {
    const activeSelectedMonths = getSelectedMonths();
    return activeSelectedMonths.includes(monthIndex);
  };

  // Ay seçme/kaldırma işlemi - Seçilen yıla göre doğru state'i güncelle
  const toggleMonthSelection = (monthIndex: number) => {
    if (selectedYear === 2025) {
      if (selectedMonthsFor2025.includes(monthIndex)) {
        // Ay zaten seçiliyse, seçimden kaldır
        setSelectedMonthsFor2025(selectedMonthsFor2025.filter(month => month !== monthIndex));
      } else {
        // Ay seçili değilse, seçilenlere ekle
        setSelectedMonthsFor2025([...selectedMonthsFor2025, monthIndex]);
      }
    } else {
      if (selectedMonthsFor2026.includes(monthIndex)) {
        // Ay zaten seçiliyse, seçimden kaldır
        setSelectedMonthsFor2026(selectedMonthsFor2026.filter(month => month !== monthIndex));
      } else {
        // Ay seçili değilse, seçilenlere ekle
        setSelectedMonthsFor2026([...selectedMonthsFor2026, monthIndex]);
      }
    }
  };

  // Tarih filtresini temizle
  const clearDateFilter = () => {
    setSelectedMonthsFor2025([]);
    setSelectedMonthsFor2026([]);
    setSelectedYear(2025);
    setShowDateFilterModal(false);
  };

  // Yıl değiştirme işleyicisi
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Harita sayfasına yönlendirme
  const navigateToMap = () => {
    router.push('/map');
  };
  
  // Etkinlik kartı bileşeni
  const renderEventCard = ({ item }: { item: Event }) => {
    // Tenis etkinliği için özel kart tasarımı
    if (item.category === 'Tenis' && item.featured) {
      return (
        <TouchableOpacity style={[styles.card, styles.featuredCard]}>
          <ImageBackground 
            source={require('../../assets/images/yoga.jpg')} 
            style={styles.featuredCardImage}
            imageStyle={styles.featuredCardImageStyle}
          >
            <View style={styles.featuredOverlay}>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTitle}>{item.title}</Text>
                <View style={styles.featuredDetails}>
                  <View style={styles.featuredDetailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#fff" />
                    <Text style={styles.featuredDetailText}>{item.date}</Text>
                  </View>
                  <View style={styles.featuredDetailItem}>
                    <Ionicons name="time-outline" size={16} color="#fff" />
                    <Text style={styles.featuredDetailText}>{item.time}</Text>
                  </View>
                  <View style={styles.featuredDetailItem}>
                    <Ionicons name="location-outline" size={16} color="#fff" />
                    <Text style={styles.featuredDetailText}>{item.location}</Text>
                  </View>
                </View>
                <View style={styles.featuredFooter}>
                  <View style={styles.featuredCategoryBadge}>
                    <Text style={styles.featuredCategoryText}>{item.category}</Text>
                  </View>
                  <View style={styles.featuredAttendeesInfo}>
                    <Ionicons name="people-outline" size={16} color="#fff" />
                    <Text style={styles.featuredAttendeesText}>{item.attendees} katılımcı</Text>
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    }
    
    // Normal etkinlik kartı
    return (
      <TouchableOpacity style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#555" />
              <Text style={styles.detailText}>{item.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#555" />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color="#555" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <View style={styles.attendeesInfo}>
              <Ionicons name="people-outline" size={16} color="#555" />
              <Text style={styles.attendeesText}>{item.attendees} katılımcı</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Ana içerik renderı
  const renderHeaderContent = () => (
    <View style={styles.headerContainer}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Spor Etkinlikleri</Text>
      </View>
      
      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Etkinlik veya kategori ara..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
          
          {/* Tarih filtreleme butonu */}
          <TouchableOpacity 
            onPress={() => setShowDateFilterModal(true)} 
            style={styles.actionButton}
          >
            <Ionicons 
              name="calendar-outline" 
              size={22} 
              color={(selectedMonthsFor2025.length > 0 || selectedMonthsFor2026.length > 0) ? "#e91e63" : "#2196f3"} 
            />
            {(selectedMonthsFor2025.length > 0 || selectedMonthsFor2026.length > 0) && (
              <View style={styles.filterActiveDot} />
            )}
          </TouchableOpacity>
          
          {/* Harita butonu */}
          <TouchableOpacity onPress={navigateToMap} style={styles.actionButton}>
            <Ionicons name="map-outline" size={22} color="#2196f3" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Aktif tarih filtresi gösterimi */}
      {(selectedMonthsFor2025.length > 0 || selectedMonthsFor2026.length > 0) && (
        <View style={styles.activeFilterContainer}>
          <Text style={styles.activeFilterText}>
            Tarih: {getSelectedMonths().map(monthIndex => monthNames[monthIndex]).join(', ')} {selectedYear}
          </Text>
          <TouchableOpacity onPress={clearDateFilter} style={styles.clearFilterButton}>
            <Ionicons name="close-circle" size={18} color="#e91e63" />
          </TouchableOpacity>
        </View>
      )}

      {/* Spor Kategorileri */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCircleButton,
                activeCategory === category.id && { borderColor: category.color, borderWidth: 2 }
              ]}
              onPress={() => setActiveCategory(category.id)}
            >
              <View 
                style={[
                  styles.iconContainer, 
                  { backgroundColor: category.color },
                  activeCategory === category.id && styles.activeIconContainer
                ]}
              >
                <Ionicons name={category.icon as any} size={28} color="white" />
              </View>
              <Text 
                style={[
                  styles.categoryCircleText,
                  activeCategory === category.id && { color: category.color, fontWeight: '700' }
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeaderContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aradığınız kriterlere uygun etkinlik bulunamadı</Text>
          </View>
        }
      />
      
      {/* Tarih Filtreleme Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDateFilterModal}
        onRequestClose={() => setShowDateFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDateFilterModal(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Tarihe Göre Filtrele</Text>
                  <TouchableOpacity onPress={() => setShowDateFilterModal(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.yearSelector}>
                  <Text style={styles.selectorLabel}>Yıl:</Text>
                  <View style={styles.yearPickerContainer}>
                    <TouchableOpacity 
                      onPress={() => handleYearChange(2025)} 
                      style={[
                        styles.yearOption, 
                        selectedYear === 2025 && styles.selectedOption
                      ]}
                    >
                      <Text style={selectedYear === 2025 ? styles.selectedOptionText : styles.optionText}>2025</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleYearChange(2026)} 
                      style={[
                        styles.yearOption, 
                        selectedYear === 2026 && styles.selectedOption
                      ]}
                    >
                      <Text style={selectedYear === 2026 ? styles.selectedOptionText : styles.optionText}>2026</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.monthSelector}>
                  <Text style={styles.selectorLabel}>Ay: (Birden fazla seçebilirsiniz)</Text>
                  <View style={styles.monthGrid}>
                    {monthNames.map((month, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.monthOption,
                          isMonthSelected(index) && styles.selectedOption
                        ]}
                        onPress={() => toggleMonthSelection(index)}
                      >
                        <Text style={isMonthSelected(index) ? styles.selectedOptionText : styles.optionText}>
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.selectedMonthsContainer}>
                  {getSelectedMonths().length > 0 ? (
                    <Text style={styles.selectedMonthsText}>
                      Seçilen aylar ({selectedYear}): {getSelectedMonths().map(monthIndex => monthNames[monthIndex]).join(', ')}
                    </Text>
                  ) : (
                    <Text style={styles.noSelectionText}>{selectedYear} için ay seçilmedi</Text>
                  )}
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: '#f5f5f5' }]} 
                    onPress={clearDateFilter}
                  >
                    <Text style={{ color: '#666', fontWeight: '600' }}>Temizle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalActionButton, { backgroundColor: '#2196f3' }]} 
                    onPress={() => setShowDateFilterModal(false)}
                  >
                    <Text style={{ color: 'white', fontWeight: '600' }}>Uygula</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    paddingTop: RNStatusBar.currentHeight || 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  // Arama çubuğu
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#eaeaea',
    position: 'relative',
  },
  mapButton: {
    padding: 8,
    marginLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#eaeaea',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e91e63',
  },
  // Aktif filtre gösterimi
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  activeFilterText: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: '500',
  },
  clearFilterButton: {
    marginLeft: 6,
    padding: 2,
  },
  // Kategori stilleri
  categoriesContainer: {
    paddingVertical: 12,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  // Eski kategori butonları (kullanılmayacak)
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  activeCategoryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  categoryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  // Yeni yuvarlak kategori butonları
  categoryCircleButton: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 80,
    borderRadius: 16,
    padding: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeIconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  categoryCircleText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  // Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  yearSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  yearPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  yearOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  optionText: {
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalActionButton: {
    borderRadius: 8,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  // Boş liste görünümü
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  // Etkinlik listesi stilleri
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  // Etkinlik kartı stilleri
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 170,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  categoryBadge: {
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0277bd',
  },
  attendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#555',
  },
  // Öne çıkan tenis etkinliği için özel stiller
  featuredCard: {
    height: 250,
  },
  featuredCardImage: {
    width: '100%',
    height: 250,
    justifyContent: 'flex-end',
  },
  featuredCardImageStyle: {
    borderRadius: 12,
  },
  featuredOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    height: '100%',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featuredDetails: {
    marginBottom: 12,
  },
  featuredDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featuredDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  featuredCategoryBadge: {
    backgroundColor: 'rgba(156, 39, 176, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  featuredCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  featuredAttendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredAttendeesText: {
    marginLeft: 6,
    fontSize: 12,
    color: 'white',
  },
  // Seçilen aylar gösterimi
  selectedMonthsContainer: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  selectedMonthsText: {
    color: '#2196f3',
    fontWeight: '500',
  },
  noSelectionText: {
    color: '#999',
    fontStyle: 'italic',
  },
  monthSelector: {
    marginBottom: 20,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthOption: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
}); 