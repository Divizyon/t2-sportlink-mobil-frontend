import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TextInput,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/appStore/themeStore';
import { EventParticipant } from '../../types/eventTypes/event.types';
import { EventParticipantItem } from '../EventParticipantItem/EventParticipantItem';
import { horizontalScale, verticalScale } from '../../utils/dimensionsUtils';
import { ParticipantSortOption } from '../../store/eventStore/eventStore';

// Prop türleri tanımı
interface EventParticipantsListProps {
  participants: EventParticipant[];
  isLoading: boolean;
  onPressParticipant?: (participant: EventParticipant) => void;
  onSearch?: (query: string) => void;
  onSort?: (sortOption: ParticipantSortOption) => void;
  currentUser?: { id: string };
  searchQuery?: string;
  currentSortOption?: ParticipantSortOption;
  totalParticipants?: number;
}

export const EventParticipantsList: React.FC<EventParticipantsListProps> = ({
  participants,
  isLoading,
  onPressParticipant,
  onSearch,
  onSort,
  currentUser,
  searchQuery = '',
  currentSortOption = 'none',
  totalParticipants = 0
}) => {
  const { theme } = useThemeStore();
  const [searchText, setSearchText] = useState(searchQuery);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Arama metnini güncellediğimizde dışarı bildiriyoruz
  useEffect(() => {
    setSearchText(searchQuery);
  }, [searchQuery]);

  // Arama işlemi
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  // Sıralama işlemi
  const handleSort = (option: ParticipantSortOption) => {
    if (onSort) {
      onSort(option);
    }
    setShowSortMenu(false);
  };

  // Boş durumu render et
  const renderEmptyList = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Katılımcılar yükleniyor...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="account-group-outline"
          size={70}
          color={theme.colors.textSecondary}
          style={styles.emptyIcon}
        />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          Bu etkinliğe henüz katılımcı yok
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          İlk katılan sen ol! Etkinlik detay sayfasından
          'Etkinliğe Katıl' butonuna tıklayarak
          katılabilirsin.
        </Text>
      </View>
    );
  };

  // Sıralama menüsü
  const renderSortMenu = () => {
    if (!showSortMenu) return null;

    return (
      <View style={[styles.sortMenu, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.sortOption, 
            currentSortOption === 'name' && styles.selectedSortOption,
            currentSortOption === 'name' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => handleSort('name')}
        >
          <Text style={[
            styles.sortOptionText, 
            { color: theme.colors.text },
            currentSortOption === 'name' && { color: theme.colors.primary, fontWeight: '600' }
          ]}>
            İsim (A-Z)
          </Text>
          {currentSortOption === 'name' && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.sortOption, 
            currentSortOption === 'none' && styles.selectedSortOption,
            currentSortOption === 'none' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => handleSort('none')}
        >
          <Text style={[
            styles.sortOptionText, 
            { color: theme.colors.text },
            currentSortOption === 'none' && { color: theme.colors.primary, fontWeight: '600' }
          ]}>
            Varsayılan Sıralama
          </Text>
          {currentSortOption === 'none' && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.sortOption, 
            currentSortOption === 'joinDate' && styles.selectedSortOption,
            currentSortOption === 'joinDate' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => handleSort('joinDate')}
        >
          <Text style={[
            styles.sortOptionText, 
            { color: theme.colors.text },
            currentSortOption === 'joinDate' && { color: theme.colors.primary, fontWeight: '600' }
          ]}>
            Katılım Tarihi (Önce Yeni)
          </Text>
          {currentSortOption === 'joinDate' && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Başlık ve Toplam Sayı */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Katılımcılar ({totalParticipants})
        </Text>
        
        <TouchableOpacity 
          style={[styles.sortButton, { borderColor: theme.colors.border }]}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Ionicons name="filter-outline" size={18} color={theme.colors.text} />
          <Text style={[styles.sortButtonText, { color: theme.colors.text }]}>Sırala</Text>
        </TouchableOpacity>
      </View>
      
      {/* Sıralama Menüsü */}
      {renderSortMenu()}
      
      {/* Arama Çubuğu */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="İsim, kullanıcı adı ara..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Katılımcılar Listesi */}
      <FlatList
        data={participants}
        keyExtractor={(item) => item.user_id.toString()}
        renderItem={({ item }) => (
          <EventParticipantItem
            participant={item} 
            isCurrentUser={currentUser?.id === item.user_id}
            onPress={() => onPressParticipant && onPressParticipant(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 15,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  sortMenu: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortOptionText: {
    fontSize: 15,
  },
  selectedSortOption: {
    borderLeftWidth: 3,
  }
}); 