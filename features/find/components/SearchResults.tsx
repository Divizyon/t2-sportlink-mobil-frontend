import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Box, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { COLORS } from '../../../src/constants';
import useThemeStore from '../../../store/slices/themeSlice';
import { useSearch } from '../hooks/useSearch';
import { styles } from '../styles/findStyles';
import { useEvents } from '../hooks/useEvents';

export const SearchResults: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { searchResults, getMatchedEvent } = useSearch();
  const { showEventDetails } = useEvents();

  if (!searchResults.length) return null;

  return (
    <VStack style={styles.searchResultsContainer}>
      {searchResults.map(item => (
        <Pressable
          key={item.id}
          style={[
            styles.searchResultItem,
            { backgroundColor: isDarkMode ? '#1E293B' : COLORS.neutral.white },
          ]}
          onPress={() => {
            // Etkinlik ise etkinlik detayını göster, tesis ise tesise git
            if (item.type === 'Etkinlik') {
              const matchedEvent = getMatchedEvent(item.title);
              if (matchedEvent) showEventDetails(matchedEvent);
            }
            // Tesisler için gelecekte yapılacak
          }}
        >
          <Box style={styles.searchResultIconContainer}>
            <Ionicons
              name={item.type === 'Etkinlik' ? 'calendar' : 'business'}
              size={20}
              color={COLORS.accent}
            />
          </Box>
          <VStack style={styles.searchResultTextContainer}>
            <Text
              style={[
                styles.searchResultTitle,
                { color: isDarkMode ? COLORS.neutral.white : COLORS.primary },
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.searchResultSubtitle,
                { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
              ]}
            >
              {item.sportType} • {item.location}
            </Text>
          </VStack>
          <Text style={[styles.searchResultType, { color: COLORS.accent }]}>{item.type}</Text>
        </Pressable>
      ))}
    </VStack>
  );
};
