import { Tabs } from "expo-router";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants";
import { View, Platform, Dimensions } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from "../../store/slices/themeSlice";

/**
 * Tab navigasyonu için layout
 * Ana sayfa, Etkinlikler, Bul, Bildirimler ve Hesabım sekmeleri
 * Tüm cihazlarda uyumlu çalışacak şekilde yapılandırıldı
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const { width: screenWidth } = Dimensions.get('window');
  
  // iOS ve Android için farklı yükseklik değerleri
  const tabBarHeight = Platform.OS === 'ios' ? 50 : 60;
  
  // iOS için notch varsa ekstra padding
  const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 10) : 10;
  
  // Küçük ekranlarda tab bar ikonlarını ve yazılarını ayarlama
  const isSmallDevice = screenWidth < 375;
  const tabIconSize = isSmallDevice ? 20 : 24;
  const centralButtonSize = isSmallDevice ? 45 : 50;
  
  // Tema renklerini belirle
  const tabBarBackground = isDarkMode ? COLORS.primary : COLORS.neutral.white;
  const tabBarBorderColor = isDarkMode ? COLORS.neutral.dark : COLORS.neutral.light;
  const tabBarActiveTintColor = COLORS.accent;
  const tabBarInactiveTintColor = isDarkMode ? COLORS.neutral.light : COLORS.neutral.dark;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: tabBarBorderColor,
          height: tabBarHeight + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          position: 'absolute',
          elevation: 10, // Android için gölge
          shadowColor: "#000", // iOS için gölge
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: isSmallDevice ? 10 : 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        // Tab ekranları arasında geçiş yaparken animasyon
        tabBarHideOnKeyboard: true, // Klavye açıkken gizle
        // Animasyon ayarları
        animationEnabled: true, 
        tabBarAllowFontScaling: false, // Font ölçeklemesini engelle
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={tabIconSize} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="events"
        options={{
          title: "Etkinlikler",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={tabIconSize} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="find"
        options={{
          title: "Bul",
          tabBarIcon: ({ color, size }) => (
            <View style={{
              width: centralButtonSize,
              height: centralButtonSize,
              borderRadius: centralButtonSize / 2,
              backgroundColor: COLORS.accent,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Platform.OS === 'ios' ? 20 : 24,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
              <Ionicons name="search" size={tabIconSize} color="white" />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Bildirimler",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={tabIconSize} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hesabım",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={tabIconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 