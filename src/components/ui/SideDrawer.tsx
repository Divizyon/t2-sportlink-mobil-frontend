import React from 'react';
import { StyleSheet, Dimensions, Modal, TouchableWithoutFeedback, Animated, View } from 'react-native';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Pressable, 
  Divider
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useThemeStore from '../../../store/slices/themeSlice';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  route: string;
  color?: string;
  action?: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useThemeStore();
  const translateX = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  
  const menuItems: MenuItem[] = [
    {
      key: 'profile',
      label: 'Profil',
      icon: 'person-outline',
      route: '/profile',
    },
    {
      key: 'my-events',
      label: 'Etkinliklerim',
      icon: 'calendar-outline',
      route: '/my-events',
    },
    {
      key: 'create-event',
      label: 'Etkinlik Oluştur',
      icon: 'add-circle-outline',
      route: '/create-event',
    },
    {
      key: 'discover',
      label: 'Keşfet',
      icon: 'compass-outline',
      route: '/discover',
    },
    {
      key: 'communities',
      label: 'Topluluklar',
      icon: 'people-outline',
      route: '/communities',
    },
    {
      key: 'news',
      label: 'Haberler ve Duyurular',
      icon: 'newspaper-outline',
      route: '/news',
    },
    {
      key: 'settings',
      label: 'Ayarlar',
      icon: 'settings-outline',
      route: '/settings',
    },
    {
      key: 'help',
      label: 'Yardım & Destek',
      icon: 'help-circle-outline',
      route: '/help',
    },
    {
      key: 'logout',
      label: 'Çıkış Yap',
      icon: 'log-out-outline',
      route: '/auth',
      color: COLORS.danger || 'red',
    },
  ];

  React.useEffect(() => {
    if (isOpen) {
      // Drawer'ı aç
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Drawer'ı kapat
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, translateX]);

  const handleNavigate = (route: string) => {
    onClose(); // Önce drawer'ı kapat
    
    // Küçük bir gecikme ile yönlendirme yap (animasyon tamamlansın)
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  if (!isOpen) return null;

  const backgroundColor = isDarkMode ? COLORS.primary : COLORS.neutral.white;
  const textColor = isDarkMode ? COLORS.neutral.white : COLORS.primary;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Arkaplan overlay - tıklandığında drawer'ı kapatır */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        
        {/* Drawer içeriği */}
        <Animated.View 
          style={[
            styles.drawer,
            { 
              transform: [{ translateX }],
              backgroundColor,
            }
          ]}
        >
          {/* Kullanıcı profil bölümü */}
          <Box padding="$6" borderBottomWidth={1} borderBottomColor={isDarkMode ? 'rgba(255,255,255,0.1)' : COLORS.neutral.light}>
            <HStack space="md" alignItems="center">
              <Box 
                width={60} 
                height={60} 
                borderRadius={30} 
                backgroundColor={COLORS.accent}
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontSize="$2xl" fontWeight="$bold">A</Text>
              </Box>
              <VStack>
                <Text fontSize="$lg" fontWeight="$bold" color={textColor}>Ahmet Yılmaz</Text>
                <Text fontSize="$sm" color={isDarkMode ? COLORS.neutral.dark : COLORS.neutral.dark}>ahmet@example.com</Text>
              </VStack>
            </HStack>
          </Box>
          
          {/* Menü öğeleri */}
          <VStack padding="$4" space="xs" flex={1}>
            {menuItems.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => handleNavigate(item.route)}
                padding="$3"
                borderRadius="$md"
                $hover={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : COLORS.neutral.silver }}
              >
                <HStack space="md" alignItems="center">
                  <Ionicons 
                    name={item.icon as any} 
                    size={22} 
                    color={item.color || COLORS.accent} 
                  />
                  <Text 
                    fontSize="$md" 
                    color={item.color || textColor}
                  >
                    {item.label}
                  </Text>
                </HStack>
              </Pressable>
            ))}
          </VStack>
          
          {/* Versiyon bilgisi */}
          <Box padding="$4" alignItems="center">
            <Text fontSize="$xs" color={isDarkMode ? COLORS.neutral.dark : COLORS.neutral.dark}>
              SportLink v1.0.0
            </Text>
          </Box>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default SideDrawer; 