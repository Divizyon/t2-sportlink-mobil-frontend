import React from 'react';
import { Center, Text, Button } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../../store/slices/themeSlice';
import { COLORS } from '../../../src/constants';
import { styles } from '../styles/findStyles';

interface EmptyStateProps {
  icon: string;
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  buttonText,
  onButtonPress,
}) => {
  const { isDarkMode } = useThemeStore();

  return (
    <Center style={styles.emptyStateContainer}>
      <Ionicons
        name={icon as any}
        size={70}
        color={isDarkMode ? '#2D3748' : COLORS.neutral.light}
      />
      <Text
        style={[
          styles.emptyStateText,
          { color: isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark },
        ]}
      >
        {message}
      </Text>
      {buttonText && onButtonPress && (
        <Button
          style={[styles.createButton, { backgroundColor: COLORS.accent }]}
          onPress={onButtonPress}
        >
          <Text style={styles.createButtonText}>{buttonText}</Text>
        </Button>
      )}
    </Center>
  );
};
