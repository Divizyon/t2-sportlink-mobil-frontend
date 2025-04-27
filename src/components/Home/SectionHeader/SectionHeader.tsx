import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../store/appStore/themeStore';

interface SectionHeaderProps {
  title: string;
  onPress?: () => void;
  showViewAll?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  onPress, 
  showViewAll = true 
}) => {
  const { theme } = useThemeStore();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {showViewAll && onPress && (
        <TouchableOpacity onPress={onPress} style={styles.button}>
          <Text style={[styles.buttonText, { color: theme.colors.accent }]}>
            Tümünü Gör
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={theme.colors.accent} 
            style={styles.icon} 
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
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
  },
  icon: {
    marginLeft: 2,
  },
});

export default SectionHeader;