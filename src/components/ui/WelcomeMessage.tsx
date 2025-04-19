import React from 'react';
import { Box, HStack, Text, VStack } from '@gluestack-ui/themed';
import { COLORS } from '../../constants/colors';
import useThemeStore from '../../../store/slices/themeSlice';

interface WelcomeMessageProps {
  /**
   * Kullanıcı adı
   */
  username?: string;
  
  /**
   * Karşılama öncesi gösterilecek emoji
   * @default "👋"
   */
  emoji?: string;
  
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
  emoji = "👋",
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
    const days = [
      'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 
      'Perşembe', 'Cuma', 'Cumartesi'
    ];
    return days[new Date().getDay()];
  };

  return (
    <Box
      paddingVertical="$6"
      paddingHorizontal="$4"
    >
      <HStack space="md" alignItems="center">
        <Text fontSize="$2xl">{emoji}</Text>
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
          >
            Bugün {getDayName()}, harika bir gün seni bekliyor.
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default WelcomeMessage; 