import React from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { Sport } from '../../../types/apiTypes/api.types';
import { 
  spacing, 
  borderRadius, 
  typography, 
  shadows, 
  componentPresets, 
  iconSizes, 
  createAlphaColor 
} from '../../../utils/designSystem';

interface SportCategoriesProps {
  sports: Sport[];
  onSelectSport: (sport: Sport) => void;
  selectedSportId?: string;
  variant?: 'default' | 'compact' | 'pill';
  showAllOption?: boolean;
}

const SportCategories: React.FC<SportCategoriesProps> = ({ 
  sports, 
  onSelectSport,
  selectedSportId,
  variant = 'default',
  showAllOption = true
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
  
  const getCategoryItemStyle = (isSelected: boolean) => {
    const baseStyle = variant === 'pill' ? styles.pillItem : styles.categoryItem;
    const selectedBg = isSelected ? theme.colors.accent : 
                     variant === 'pill' ? createAlphaColor(theme.colors.accent, 0.08) : theme.colors.card;
    const borderColor = isSelected ? theme.colors.accent : 
                       variant === 'pill' ? 'transparent' : theme.colors.border;
    
    return [
      baseStyle,
      {
        backgroundColor: selectedBg,
        borderColor: borderColor,
      }
    ];
  };
  
  const getIconContainerStyle = (isSelected: boolean) => {
    if (variant === 'pill') {
      return [
        styles.modernIconContainer,
        {
          backgroundColor: isSelected ? 
            createAlphaColor(theme.colors.white, 0.2) : 
            createAlphaColor(theme.colors.accent, 0.15)
        }
      ];
    }
    
    return [
      styles.iconContainer,
      {
        backgroundColor: isSelected ? theme.colors.white : createAlphaColor(theme.colors.accent, 0.15)
      }
    ];
  };
  
  const getTextColor = (isSelected: boolean) => {
    if (variant === 'pill') {
      return isSelected ? theme.colors.white : theme.colors.text;
    }
    return isSelected ? theme.colors.white : theme.colors.text;
  };
  
  return (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.contentContainer,
        variant === 'compact' && styles.compactContainer
      ]}
      style={styles.container}
    >
      {/* Tümü seçeneği */}
      {showAllOption && (
        <TouchableOpacity 
          style={getCategoryItemStyle(!selectedSportId)}
          onPress={() => onSelectSport({ id: '', name: 'Tümü' } as Sport)}
          activeOpacity={0.7}
        >
          <View style={getIconContainerStyle(!selectedSportId)}>
            <Ionicons 
              name="apps-outline"
              size={variant === 'pill' ? iconSizes.sm : iconSizes.md} 
              color={!selectedSportId ? theme.colors.white : theme.colors.accent} 
            />
          </View>
          <Text 
            style={[
              variant === 'pill' ? styles.pillText : styles.categoryName,
              { color: getTextColor(!selectedSportId) }
            ]}
            numberOfLines={1}
          >
            Tümü
          </Text>
        </TouchableOpacity>
      )}

      {sports.map((sport) => {
        const isSelected = selectedSportId === sport.id;
        const iconName = getSportIcon(sport.name);
        
        return (
          <TouchableOpacity 
            key={sport.id} 
            style={getCategoryItemStyle(isSelected)}
            onPress={() => onSelectSport(sport)}
            activeOpacity={0.7}
          >
            <View style={getIconContainerStyle(isSelected)}>
              <Ionicons 
                name={iconName}
                size={variant === 'pill' ? iconSizes.sm : iconSizes.md} 
                color={isSelected ? theme.colors.white : theme.colors.accent} 
              />
            </View>
            <Text 
              style={[
                variant === 'pill' ? styles.pillText : styles.categoryName,
                { color: getTextColor(isSelected) }
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
    marginBottom: spacing.lg,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingRight: spacing.md,
  },
  compactContainer: {
    paddingHorizontal: spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    marginRight: spacing.md,
    borderWidth: 1,
    ...shadows.sm,
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    marginRight: spacing.md,
    borderWidth: 0,
    ...shadows.md,
  },
  iconContainer: {
    ...componentPresets.iconContainer.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  modernIconContainer: {
    ...componentPresets.iconContainer.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  categoryName: {
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
    letterSpacing: typography.letterSpacing.tight,
  },
  pillText: {
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.md,
    letterSpacing: typography.letterSpacing.tight,
  },
});

export default SportCategories;