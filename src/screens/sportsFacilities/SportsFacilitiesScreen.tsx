import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Linking,
  Alert,
  ScrollView,
  Modal,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { 
  SportsFacility, 
  FilterOptions, 
  SportType, 
  DistrictType,
  FacilityCardProps 
} from '../../types/sportsFacilities.types';
import { 
  sportsFacilitiesData, 
  sportIconMap, 
  sportColorMap, 
  availableSports, 
  availableDistricts 
} from '../../data/sportsFacilitiesData';

/**
 * Spor Tesisi Kartı Bileşeni
 */
const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onPress, onMapPress }) => {
  const { theme } = useThemeStore();
  const sportIcon = sportIconMap[facility.sport] || 'location-outline';
  const sportColor = sportColorMap[facility.sport] || theme.colors.accent;

  return (
    <TouchableOpacity
      style={[styles.facilityCard, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress?.(facility)}
      activeOpacity={0.7}
    >
      {/* Spor İkonu ve Tür */}
      <View style={styles.cardHeader}>
        <View style={[styles.sportIconContainer, { backgroundColor: `${sportColor}20` }]}>
          <Ionicons name={sportIcon as any} size={24} color={sportColor} />
        </View>
        <View style={styles.sportInfo}>
          <Text style={[styles.sportType, { color: sportColor }]}>
            {facility.sport}
          </Text>
          <Text style={[styles.facilityName, { color: theme.colors.text }]} numberOfLines={2}>
            {facility.name}
          </Text>
        </View>
      </View>

      {/* Adres Bilgisi */}
      <View style={styles.addressContainer}>
        <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
        <Text style={[styles.addressText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {facility.address}
        </Text>
      </View>

      {/* İlçe ve Harita Butonu */}
      <View style={styles.cardFooter}>
        <View style={[styles.districtBadge, { backgroundColor: `${theme.colors.accent}20` }]}>
          <Text style={[styles.districtText, { color: theme.colors.accent }]}>
            {facility.district}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.mapButton, { backgroundColor: sportColor }]}
          onPress={() => onMapPress?.(facility)}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={16} color="white" />
          <Text style={styles.mapButtonText}>Harita</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Filtreleme Modalı
 */
const FilterModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}> = ({ visible, onClose, onApplyFilters, currentFilters }) => {
  const { theme } = useThemeStore();
  const [tempFilters, setTempFilters] = useState<FilterOptions>(currentFilters);

  const toggleSport = (sport: SportType) => {
    setTempFilters(prev => ({
      ...prev,
      selectedSports: prev.selectedSports.includes(sport)
        ? prev.selectedSports.filter(s => s !== sport)
        : [...prev.selectedSports, sport]
    }));
  };

  const toggleDistrict = (district: DistrictType) => {
    setTempFilters(prev => ({
      ...prev,
      selectedDistricts: prev.selectedDistricts.includes(district)
        ? prev.selectedDistricts.filter(d => d !== district)
        : [...prev.selectedDistricts, district]
    }));
  };

  const clearFilters = () => {
    setTempFilters({
      selectedSports: [],
      selectedDistricts: [],
      searchText: ''
    });
  };

  const applyFilters = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Filtrele
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Spor Türleri */}
            <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>
              Spor Türleri
            </Text>
            <View style={styles.filterChips}>
              {availableSports.map((sport) => {
                const isSelected = tempFilters.selectedSports.includes(sport);
                const sportColor = sportColorMap[sport];
                
                return (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected ? sportColor : `${sportColor}20`,
                        borderColor: sportColor
                      }
                    ]}
                    onPress={() => toggleSport(sport)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: isSelected ? 'white' : sportColor }
                      ]}
                    >
                      {sport}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* İlçeler */}
            <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>
              İlçeler
            </Text>
            <View style={styles.filterChips}>
              {availableDistricts.map((district) => {
                const isSelected = tempFilters.selectedDistricts.includes(district);
                
                return (
                  <TouchableOpacity
                    key={district}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected ? theme.colors.accent : `${theme.colors.accent}20`,
                        borderColor: theme.colors.accent
                      }
                    ]}
                    onPress={() => toggleDistrict(district)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: isSelected ? 'white' : theme.colors.accent }
                      ]}
                    >
                      {district}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: theme.colors.border }]}
              onPress={clearFilters}
            >
              <Text style={[styles.clearButtonText, { color: theme.colors.textSecondary }]}>
                Temizle
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: theme.colors.accent }]}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Spor Alanları Ana Ekranı
 */
export const SportsFacilitiesScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    selectedSports: [],
    selectedDistricts: [],
    searchText: ''
  });

  // Filtrelenmiş tesisler
  const filteredFacilities = useMemo(() => {
    let result = sportsFacilitiesData;

    // Arama filtresi
    if (searchText.trim()) {
      result = result.filter(facility =>
        facility.name.toLowerCase().includes(searchText.toLowerCase()) ||
        facility.sport.toLowerCase().includes(searchText.toLowerCase()) ||
        facility.address.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Spor türü filtresi
    if (filters.selectedSports.length > 0) {
      result = result.filter(facility =>
        filters.selectedSports.includes(facility.sport)
      );
    }

    // İlçe filtresi
    if (filters.selectedDistricts.length > 0) {
      result = result.filter(facility =>
        filters.selectedDistricts.includes(facility.district)
      );
    }

    return result;
  }, [searchText, filters]);

  // Aktif filtre sayısı
  const activeFiltersCount = filters.selectedSports.length + filters.selectedDistricts.length;

  // Harita açma fonksiyonu
  const openMaps = (facility: SportsFacility) => {
    Linking.openURL(facility.maps_url).catch(() => {
      Alert.alert('Hata', 'Harita uygulaması açılamadı');
    });
  };

  // Tesis detayına gitme
  const handleFacilityPress = (facility: SportsFacility) => {
    Alert.alert(
      facility.name,
      `${facility.sport}\n\n${facility.address}\n\nİlçe: ${facility.district}`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Haritada Göster', onPress: () => openMaps(facility) }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Konya Spor Alanları
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {filteredFacilities.length} tesis bulundu
        </Text>
      </View>

      {/* Arama ve Filtre */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Tesis ara..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            { 
              backgroundColor: activeFiltersCount > 0 ? theme.colors.accent : theme.colors.card,
            }
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons 
            name="filter-outline" 
            size={20} 
            color={activeFiltersCount > 0 ? 'white' : theme.colors.text} 
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tesisler Listesi */}
      <FlatList
        data={filteredFacilities}
        renderItem={({ item }) => (
          <FacilityCard
            facility={item}
            onPress={handleFacilityPress}
            onMapPress={openMaps}
          />
        )}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Arama kriterlerinize uygun tesis bulunamadı
            </Text>
          </View>
        }
      />

      {/* Filtre Modalı */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  facilityCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  sportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sportInfo: {
    flex: 1,
  },
  sportType: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  districtBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  districtText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
