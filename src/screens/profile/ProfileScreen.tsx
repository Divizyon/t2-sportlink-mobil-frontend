import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { 
  Box, 
  Text, 
  Pressable, 
  Icon,
  ArrowLeftIcon,
  SettingsIcon
} from '@gluestack-ui/themed';
import useThemeStore from '../../../store/slices/themeSlice';
import { COLORS } from '../../constants/colors';
import { Header } from '../../components';

// Tema renk konfigürasyonları - Home.tsx ile aynı
const getThemeColors = (isDark: boolean) => {
  return {
    primary: isDark ? COLORS.accent : COLORS.accent,
    secondary: isDark ? COLORS.info : COLORS.secondary,
    background: isDark ? COLORS.secondary : COLORS.neutral.silver,
    card: isDark ? COLORS.primary : COLORS.neutral.white,
    text: {
      dark: isDark ? COLORS.neutral.white : COLORS.primary,
      light: isDark ? COLORS.neutral.dark : COLORS.neutral.dark,
    },
    divider: isDark ? COLORS.neutral.dark : COLORS.neutral.light,
  };
};

/**
 * Profil Ekranı
 * Kullanıcı profil bilgilerini ve ayarlarını gösterir
 */
export default function ProfileScreen() {
  const { isDarkMode } = useThemeStore();
  const themeColors = getThemeColors(isDarkMode);

  // Geri butonu bileşeni
  const BackButton = () => (
    <ArrowLeftIcon size="md" color={themeColors.text.dark} />
  );

  // Ayarlar butonu bileşeni
  const SettingsButton = () => (
    <SettingsIcon size="md" color={themeColors.text.dark} />
  );

  return (
    <Box flex={1} backgroundColor={themeColors.background}>
      {/* Header - başlık göster, logo gösterme */}
      <Header 
        title="Profil"
        showLogo={false}
        leftComponent={<BackButton />}
        rightComponent={<SettingsButton />}
        onLeftPress={() => router.back()}
        onRightPress={() => console.log('Ayarlar')}
      />
      
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Box
          borderRadius="$lg"
          padding="$5"
          marginBottom="$5"
          alignItems="center"
          backgroundColor={themeColors.card}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={2}
        >
          <Text
            fontSize="$2xl"
            fontWeight="$bold"
            marginBottom="$1"
            color={themeColors.text.dark}
          >
            Kullanıcı Adı
          </Text>
          <Text
            fontSize="$md"
            marginBottom="$5"
            color={themeColors.text.light}
          >
            kullanici@ornek.com
          </Text>
          
          <Pressable 
            paddingVertical="$2.5"
            paddingHorizontal="$5"
            borderRadius="$md"
            backgroundColor={themeColors.primary}
            onPress={() => console.log('Profili Düzenle')}
          >
            <Text color="white" fontWeight="$semibold">
              Profili Düzenle
            </Text>
          </Pressable>
        </Box>
        
        {/* Profil ekranının diğer içerikleri buraya eklenebilir */}
      </ScrollView>
    </Box>
  );
} 