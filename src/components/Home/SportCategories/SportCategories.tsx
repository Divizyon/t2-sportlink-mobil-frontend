import React from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Sport } from '../../../types/apiTypes/api.types';

interface SportCategoriesProps {
  sports: Sport[];
  onSelectSport: (sport: Sport) => void;
  selectedSportId?: string;
}

const SportCategories: React.FC<SportCategoriesProps> = ({ 
  sports, 
  onSelectSport,
  selectedSportId
}) => {
  const { theme } = useThemeStore();
  
  // Spor için ikon belirleme
  const getSportIcon = (sportName: string): React.ComponentProps<typeof Ionicons>['name'] => {
    const sportLower = sportName.toLowerCase();
    
    if (sportLower.includes('futbol')) return 'football-outline';
    if (sportLower.includes('basketbol')) return 'basketball-outline';
    if (sportLower.includes('voleybol')) return 'baseball-outline';
    if (sportLower.includes('tenis')) return 'tennisball-outline';
    if (sportLower.includes('yüzme')) return 'water-outline';
    if (sportLower.includes('koşu')) return 'walk-outline';
    if (sportLower.includes('bisiklet')) return 'bicycle-outline';
    if (sportLower.includes('yoga')) return 'body-outline';
    if (sportLower.includes('fitness')) return 'barbell-outline';
    if (sportLower.includes('pilates')) return 'body-outline';
    if (sportLower.includes('dans')) return 'musical-notes-outline';
    
    return 'body-outline'; // Varsayılan ikon
  };
  
  return (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      style={styles.container}
    >
      {/* Tümü seçeneği */}
      <TouchableOpacity 
        style={[
          styles.categoryItem, 
          { 
            backgroundColor: !selectedSportId ? theme.colors.accent : theme.colors.card,
            borderColor: !selectedSportId ? theme.colors.accent : theme.colors.border 
          }
        ]}
        onPress={() => onSelectSport({ id: '', name: 'Tümü' } as Sport)}
      >
        <View 
          style={[
            styles.iconContainer, 
            { backgroundColor: !selectedSportId ? theme.colors.white : theme.colors.accent + '20' }
          ]}
        >
          <Ionicons 
            name="apps-outline"
            size={20} 
            color={!selectedSportId ? theme.colors.accent : theme.colors.accent} 
          />
        </View>
        <Text 
          style={[
            styles.categoryName,
            { color: !selectedSportId ? theme.colors.white : theme.colors.text }
          ]}
          numberOfLines={1}
        >
          Tümü
        </Text>
      </TouchableOpacity>

      {sports.map((sport) => {
        const isSelected = selectedSportId === sport.id;
        const iconName = getSportIcon(sport.name);
        
        return (
          <TouchableOpacity 
            key={sport.id} 
            style={[
              styles.categoryItem, 
              { 
                backgroundColor: isSelected ? theme.colors.accent : theme.colors.card,
                borderColor: isSelected ? theme.colors.accent : theme.colors.border 
              }
            ]}
            onPress={() => onSelectSport(sport)}
          >
            <View 
              style={[
                styles.iconContainer, 
                { backgroundColor: isSelected ? theme.colors.white : theme.colors.accent + '20' }
              ]}
            >
              <Ionicons 
                name={iconName}
                size={16} 
                color={isSelected ? theme.colors.accent : theme.colors.accent} 
              />
            </View>
            <Text 
              style={[
                styles.categoryName,
                { color: isSelected ? theme.colors.white : theme.colors.text }
              ]}
              numberOfLines={1}
            >
              {sport.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  contentContainer: {
    paddingRight: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  categoryName: {
    fontWeight: '600',
    fontSize: 13
  }
});

export default SportCategories;