import { Tabs } from 'expo-router';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants';
import { View, TouchableOpacity } from 'react-native';
import { router, usePathname } from 'expo-router';

/**
 * Tab navigasyonu için layout
 * Ana sayfa, Etkinlikler, Bul, Bildirimler ve Hesabım sekmeleri
 * Tüm cihazlarda uyumlu çalışacak şekilde yapılandırıldı
 */
export default function TabLayout() {
  const pathname = usePathname();

  // Bul butonuna her tıklamada doğrudan find sayfasına yönlendirme
  const handleFindPress = () => {
    // Şu anki rota find ise ve başka bir ekranda değilsek
    // (mesela find içinde tümünü gör ekranı açıksa) sıfırla
    if (pathname.includes('/find')) {
      router.replace('/(tabs)/find');
    } else {
      // Diğer sayfalardaysak find sayfasına yönlendir
      router.navigate('/(tabs)/find');
    }
  };

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
          shadowColor: '#000', // iOS için gölge
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
        tabBarAllowFontScaling: false, // Font ölçeklemesini engelle
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={tabIconSize} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          title: 'Etkinlikler',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={tabIconSize} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="find"
        options={{
          title: 'Bul',
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                width: centralButtonSize,
                height: centralButtonSize,
                borderRadius: centralButtonSize / 2,
                backgroundColor: COLORS.accent,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Platform.OS === 'ios' ? 20 : 24,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Ionicons name="search" size={tabIconSize} color="white" />
            </View>
          ),
          tabBarButton: props => {
            return (
              <TouchableOpacity activeOpacity={0.7} onPress={handleFindPress} style={props.style}>
                {props.children}
              </TouchableOpacity>
            );
          },
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Bildirimler',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={tabIconSize} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hesabım',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={tabIconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
