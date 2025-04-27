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
  const getSportIcon = (sportName: string): string => {
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryName: {
    fontWeight: '600',
    fontSize: 14
  }
});

export default SportCategories;