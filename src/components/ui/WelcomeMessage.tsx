import React from 'react';
import { Box, Text, VStack } from '@gluestack-ui/themed';
import { COLORS } from '../../constants/colors';
import useThemeStore from '../../../store/slices/themeSlice';

interface WelcomeMessageProps {
  /**
   * Kullanıcı adı
   */
  username?: string;

  /**
   * Karşılama için alternatif mesaj
   */
  customMessage?: string;
}

/**
 * Ana sayfa için karşılama mesajı bileşeni
 */
const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  username = 'Kullanıcı',
  customMessage,
}) => {
  const { isDarkMode } = useThemeStore();

  // Günün zamanına göre selamlama
  const getGreetingByTime = (): string => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'Günaydın';
    if (hour >= 12 && hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  // Günün adı
  const getDayName = (): string => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[new Date().getDay()];
  };

  return (
    <Box
      paddingVertical="$4"
      paddingHorizontal="$4"
      borderRadius="$lg"
      backgroundColor={isDarkMode ? COLORS.neutral.dark + '20' : COLORS.neutral.white + '80'}
      marginBottom="$2"
    >
      <VStack>
        <Text
          fontSize="$xl"
          fontWeight="$bold"
          color={isDarkMode ? COLORS.neutral.white : COLORS.primary}
        >
          {customMessage || `${getGreetingByTime()}, ${username}!`}
        </Text>
        <Text
          fontSize="$sm"
          color={isDarkMode ? COLORS.neutral.dark : COLORS.neutral.dark}
          marginTop="$1"
        >
          Bugün {getDayName()}, harika bir gün seni bekliyor.
        </Text>
      </VStack>
    </Box>
  );
};

export default WelcomeMessage;
