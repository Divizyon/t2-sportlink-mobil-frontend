import React from 'react';
import { TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box, Pressable } from '@gluestack-ui/themed';
import { COLORS } from '../../../src/constants';
import useThemeStore from '../../../store/slices/themeSlice';
import { useSearch } from '../hooks/useSearch';
import { styles } from '../styles/findStyles';

export const SearchBar: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();

  return (
    <Box
      style={[
        styles.searchContainer,
        { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
      ]}
      flexDirection="row"
      alignItems="center"
    >
      <Ionicons
        name="search"
        size={20}
        color={isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark}
      />
      <TextInput
        style={[styles.searchInput, { color: isDarkMode ? COLORS.neutral.white : COLORS.primary }]}
        placeholder="Etkinlik veya tesis ara..."
        placeholderTextColor={isDarkMode ? '#718096' : '#A0AEC0'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery ? (
        <Pressable style={styles.filterButton} onPress={clearSearch}>
          <Ionicons name="close-circle" size={20} color={COLORS.accent} />
        </Pressable>
      ) : null}
    </Box>
  );
};
