import React, { ReactNode, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  Box, 
  HStack, 
  VStack, 
  Text, 
  Pressable,
  View,
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';
import useThemeStore from '../../../store/slices/themeSlice';
import SideDrawer from './SideDrawer';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

/**
 * Yeniden kullanılabilir Header bileşeni
 * 
 * @param title - Başlık metni (varsayılan: "SportLink")
 * @param showLogo - Logo gösterilsin mi (varsayılan: true)
 * @param leftComponent - Sol tarafta gösterilecek özel bileşen
 * @param rightComponent - Sağ tarafta gösterilecek özel bileşen
 * @param onLeftPress - Sol taraftaki bileşene tıklandığında çalışacak fonksiyon
 * @param onRightPress - Sağ taraftaki bileşene tıklandığında çalışacak fonksiyon
 */
const Header: React.FC<HeaderProps> = ({
  title = "SportLink",
  showLogo = true,
  leftComponent,
  rightComponent,
  onLeftPress,
  onRightPress,
}) => {
  const { isDarkMode } = useThemeStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Tema renklerini belirle
  const getThemeColors = (isDark: boolean) => {
    return {
      primary: isDark ? COLORS.accent : COLORS.accent,
      secondary: isDark ? COLORS.info : COLORS.secondary,
      background: isDark ? COLORS.secondary : COLORS.neutral.white,
      text: isDark ? COLORS.neutral.white : COLORS.primary,
      divider: isDark ? COLORS.neutral.dark : COLORS.neutral.light,
    };
  };
  
  const themeColors = getThemeColors(isDarkMode);
  
  // Hamburger menü bileşeni
  const MenuButton = () => (
    <Pressable
      onPress={() => setDrawerOpen(true)}
      alignItems="center"
      justifyContent="center"
    >
      <Ionicons 
        name="menu-outline" 
        size={24} 
        color={themeColors.text} 
      />
    </Pressable>
  );

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <SafeAreaView 
        edges={['top']}
        style={{
          width: '100%',
          borderBottomWidth: 1,
          borderBottomColor: themeColors.divider,
          backgroundColor: themeColors.background
        }}
      >
        <HStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="$4"
          paddingVertical="$3"
          height={56}
        >
          {/* Sol kısım - Hamburger Menü */}
          {leftComponent ? (
            <Pressable
              width="$10"
              alignItems="flex-start"
              justifyContent="center"
              onPress={onLeftPress}
              disabled={!onLeftPress}
            >
              {leftComponent}
            </Pressable>
          ) : (
            <Box width="$10" alignItems="flex-start" justifyContent="center">
              <MenuButton />
            </Box>
          )}
          
          {/* Orta kısım - Logo ve Başlık */}
          <Box 
            flex={1} 
            alignItems="center" 
            justifyContent="center"
          >
            {showLogo && (
              <Text 
                fontSize="$xl" 
                fontWeight="$bold" 
                color={themeColors.primary}
              >
                <Text color={COLORS.accent}>Sport</Text>
                <Text color={COLORS.secondary}>Link</Text>
              </Text>
            )}
            {!showLogo && title && (
              <Text 
                fontSize="$lg" 
                fontWeight="$semibold" 
                color={themeColors.text}
                numberOfLines={1}
              >
                {title}
              </Text>
            )}
          </Box>
          
          {/* Sağ kısım */}
          {rightComponent ? (
            <Pressable
              width="$10"
              alignItems="flex-end"
              justifyContent="center"
              onPress={onRightPress}
              disabled={!onRightPress}
            >
              {rightComponent}
            </Pressable>
          ) : (
            <Box width="$10" />
          )}
        </HStack>
      </SafeAreaView>
      
      {/* Tam yükseklikte drawer menü */}
      <SideDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
    </>
  );
};

export default Header; 