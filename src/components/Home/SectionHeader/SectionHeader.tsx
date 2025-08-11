import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';
import { 
  spacing, 
  borderRadius, 
  typography, 
  shadows, 
  componentPresets, 
  iconSizes, 
  createAlphaColor 
} from '../../../utils/designSystem';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  showViewAll?: boolean;
  variant?: 'default' | 'featured' | 'compact';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle,
  icon,
  onPress, 
  showViewAll = true,
  variant = 'default'
}) => {
  const { theme } = useThemeStore();
  
  const getContainerStyle = () => {
    switch (variant) {
      case 'featured':
        return [styles.container, styles.featuredContainer];
      case 'compact':
        return [styles.container, styles.compactContainer];
      default:
        return styles.container;
    }
  };
  
  return (
    <View style={getContainerStyle()}>
      <View style={styles.leftSection}>
        {icon && (
          <View style={[
            styles.iconContainer, 
            { backgroundColor: createAlphaColor(theme.colors.accent, 0.1) }
          ]}>
            <Ionicons 
              name={icon} 
              size={iconSizes.md} 
              color={theme.colors.accent} 
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[
            styles.title, 
            { color: theme.colors.text },
            variant === 'featured' && styles.featuredTitle
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      {showViewAll && onPress && (
        <TouchableOpacity 
          onPress={onPress} 
          style={[
            styles.viewAllButton,
            { backgroundColor: createAlphaColor(theme.colors.accent, 0.08) }
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: theme.colors.accent }]}>
            Tümü
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={iconSizes.sm} 
            color={theme.colors.accent} 
            style={styles.buttonIcon} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  featuredContainer: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  compactContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    ...componentPresets.iconContainer.md,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  featuredTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.extrabold,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginTop: spacing.xs,
    opacity: 0.8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  buttonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  buttonIcon: {
    marginLeft: spacing.xs,
  },
});

export default SectionHeader;