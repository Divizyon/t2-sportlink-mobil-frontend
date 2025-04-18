import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity, TextInput, Dimensions, useColorScheme } from 'react-native';
import { Box, Text, VStack, HStack, Icon, Center, Pressable } from '@gluestack-ui/themed';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Renk paleti
const LIGHT_COLORS = {
  primary: "#44C26D",  // Ana renk - Yeşil
  secondary: "#3066BE", // İkincil renk - Mavi
  background: "#F5F7FA", // Arka plan - Açık gri
  text: {
    dark: "#1D2B4E", // Koyu metin
    light: "#89939E", // Açık metin
  },
  white: "#FFFFFF",
  lightGray: "#F0F2F5",
};

// Koyu tema renkleri
const DARK_COLORS = {
  primary: "#4BD07D",  // Ana renk - Daha parlak yeşil
  secondary: "#4080DD", // İkincil renk - Daha parlak mavi
  background: "#15202B", // Twitter benzeri koyu mavi arka plan
  text: {
    dark: "#FFFFFF", // Beyaz metin
    light: "#8899A6", // Açık gri metin
  },
  white: "#192734", // Kart arka planı
  lightGray: "#253341", // Ayırıcı, girdi arka planı
};

interface SportItem {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface EventItem {
  id: number;
  title: string;
  time: string;
  location: string;
  participants: string;
  image: any; // React Native image source type
}

// Sahte veriler
const popularSports: SportItem[] = [
  { id: 1, name: 'Basketbol', icon: 'basketball', color: '#FF6B35' },
  { id: 2, name: 'Tenis', icon: 'tennis', color: '#EB4B98' },
  { id: 3, name: 'Yüzme', icon: 'swimming', color: '#4BB4DE' },
  { id: 4, name: 'Yoga', icon: 'yoga', color: '#9A77CF' },
  { id: 5, name: 'Futbol', icon: 'soccer', color: '#44C26D' },
  { id: 6, name: 'Koşu', icon: 'running', color: '#FFC107' },
];

const featuredEvents: EventItem[] = [
  {
    id: 1,
    title: 'Morning Yoga Session',
    time: '7:30 AM',
    location: 'Central Park',
    participants: '12/20',
    image: require('../assets/images/yoga.jpg'),
  },
  {
    id: 2,
    title: 'Basketball Match',
    time: '6:00 PM',
    location: 'City Sports Center',
    participants: '8/10',
    image: require('../assets/images/basketball.jpg'),
  },
  {
    id: 3,
    title: 'Swimming Class',
    time: '10:00 AM',
    location: 'Olympic Pool',
    participants: '5/15',
    image: require('../assets/images/swimming.jpg'),
  },
];

// Spor dalına göre ikon seçimi
const getSportIcon = (sportName: string): string => {
  switch (sportName.toLowerCase()) {
    case 'basketball':
    case 'basketbol':
      return 'basketball-ball'; // FontAwesome için uygun ikon ismi
    case 'tennis':
    case 'tenis':
      return 'tennis-ball'; // FontAwesome için uygun ikon ismi
    case 'swimming':
    case 'yüzme':
      return 'swimmer'; // FontAwesome için uygun ikon ismi
    case 'yoga':
      return 'yin-yang'; // FontAwesome için uygun ikon ismi
    case 'soccer':
    case 'futbol':
      return 'futbol'; // FontAwesome için uygun ikon ismi
    case 'running':
    case 'koşu':
      return 'running'; // FontAwesome için uygun ikon ismi
    default:
      return 'heartbeat';
  }
};

export default function HomeScreen() {
  // Sistem teması
  const systemColorScheme = useColorScheme();
  
  // Tema durumu (light veya dark)
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Renk temasını belirle
  const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  
  // Uygulama başladığında tema tercihini yükle
  useEffect(() => {
    loadThemePreference();
  }, []);
  
  // Tema tercihini yükle
  const loadThemePreference = async () => {
    try {
      const themePreference = await AsyncStorage.getItem('themePreference');
      if (themePreference !== null) {
        setIsDarkMode(themePreference === 'dark');
      } else {
        // Eğer tercih kaydedilmemişse sistem temasını kullan
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.log('Tema yüklenirken hata:', error);
    }
  };
  
  // Tema tercihini kaydet
  const saveThemePreference = async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem('themePreference', isDark ? 'dark' : 'light');
    } catch (error) {
      console.log('Tema kaydedilirken hata:', error);
    }
  };
  
  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    const newThemeValue = !isDarkMode;
    setIsDarkMode(newThemeValue);
    saveThemePreference(newThemeValue);
  };

  const navigateToMap = () => {
    router.push('/map');
  };

  const navigateToRoutes = () => {
    router.push('/routes');
  };

  const navigateToFacilities = () => {
    router.push('/facilities');
  };

  const navigateToProfile = () => {
    router.push('/profile');
  };

  return (
    <Box flex={1} backgroundColor={COLORS.background}>
      {/* Header */}
      <Box 
        backgroundColor={COLORS.white} 
        paddingTop={50} 
        paddingBottom={15}
        paddingHorizontal={20}
        borderBottomWidth={1}
        borderBottomColor={COLORS.lightGray}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center">
            <Ionicons name="menu-outline" size={24} color={COLORS.text.dark} />
            <Text 
              marginLeft={15} 
              color={COLORS.secondary} 
              fontSize={20} 
              fontWeight="bold"
            >
              SportLink
            </Text>
          </HStack>
          
          <HStack alignItems="center">
            {/* Tema değiştirme butonu */}
            <TouchableOpacity onPress={toggleTheme} style={{marginRight: 15}}>
              <Ionicons 
                name={isDarkMode ? "sunny-outline" : "moon-outline"} 
                size={24} 
                color={COLORS.text.dark} 
              />
            </TouchableOpacity>
            
            {/* Profil fotoğrafı */}
            <TouchableOpacity onPress={navigateToProfile}>
              <Image 
                source={require('../assets/images/profile.jpg')} 
                style={styles.profileImage} 
              />
            </TouchableOpacity>
          </HStack>
        </HStack>
        
        {/* Arama çubuğu */}
        <View style={[styles.searchContainer, { backgroundColor: COLORS.lightGray }]}>
          <Ionicons name="search" size={18} color={COLORS.text.light} style={styles.searchIcon} />
          <TextInput 
            style={[styles.searchInput, { color: COLORS.text.dark }]} 
            placeholder="Search events, partners, or venues" 
            placeholderTextColor={COLORS.text.light}
          />
        </View>
      </Box>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Popüler Spor Dalları */}
        <Box padding={16}>
          <Text fontSize={18} fontWeight="700" color={COLORS.text.dark} marginBottom={12}>
            Popular Sports
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack>
              {popularSports.map((sport) => (
                <TouchableOpacity key={sport.id} style={{marginRight: 16}}>
                  <VStack alignItems="center">
                    <Center 
                      width={60} 
                      height={60} 
                      borderRadius={30} 
                      backgroundColor={sport.color}
                    >
                      <FontAwesome 
                        name={getSportIcon(sport.name) as any} 
                        size={28} 
                        color="white" 
                      />
                    </Center>
                    <Text 
                      textAlign="center" 
                      fontSize={14} 
                      color={COLORS.text.dark}
                      marginTop={6}
                    >
                      {sport.name}
                    </Text>
                  </VStack>
                </TouchableOpacity>
              ))}
            </HStack>
          </ScrollView>
        </Box>
        
        {/* Öne Çıkan Etkinlikler */}
        <Box padding={16} paddingTop={0}>
          <Text fontSize={18} fontWeight="700" color={COLORS.text.dark} marginBottom={12}>
            Featured Events
          </Text>
          
          <VStack>
            {featuredEvents.map((event) => (
              <TouchableOpacity 
                key={event.id} 
                style={[styles.eventCard, { backgroundColor: COLORS.white, shadowColor: isDarkMode ? '#000' : '#000' }]}
                onPress={navigateToRoutes}
              >
                <Image source={event.image} style={styles.eventImage} />
                <Box padding={12}>
                  <Text fontSize={16} fontWeight="700" color={COLORS.text.dark}>
                    {event.title}
                  </Text>
                  <HStack alignItems="center" marginTop={6}>
                    <Ionicons name="time-outline" size={14} color={COLORS.text.light} />
                    <Text marginLeft={4} fontSize={14} color={COLORS.text.light}>
                      {event.time}
                    </Text>
                    <Ionicons name="location-outline" size={14} color={COLORS.text.light} style={{ marginLeft: 10 }} />
                    <Text marginLeft={4} fontSize={14} color={COLORS.text.light}>
                      {event.location}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between" marginTop={8} alignItems="center">
                    <Text fontSize={14} color={COLORS.text.light}>
                      {event.participants} participants
                    </Text>
                    <Pressable 
                      backgroundColor={COLORS.primary} 
                      paddingHorizontal={16} 
                      paddingVertical={6} 
                      borderRadius={4}
                    >
                      <Text color="white" fontWeight="600">
                        Join
                      </Text>
                    </Pressable>
                  </HStack>
                </Box>
              </TouchableOpacity>
            ))}
          </VStack>
        </Box>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <HStack 
        backgroundColor={COLORS.white} 
        height={60} 
        justifyContent="space-around" 
        alignItems="center"
        borderTopWidth={1}
        borderTopColor={COLORS.lightGray}
      >
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={22} color={COLORS.primary} />
          <Text fontSize={12} color={COLORS.primary} marginTop={2}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={navigateToRoutes}
        >
          <Ionicons name="calendar" size={22} color={COLORS.text.light} />
          <Text fontSize={12} color={COLORS.text.light} marginTop={2}>Events</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={navigateToMap}
        >
          <Ionicons name="compass" size={22} color={COLORS.text.light} />
          <Text fontSize={12} color={COLORS.text.light} marginTop={2}>Find</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={navigateToFacilities}
        >
          <Ionicons name="notifications" size={22} color={COLORS.text.light} />
          <Text fontSize={12} color={COLORS.text.light} marginTop={2}>Facilities</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={navigateToProfile}
        >
          <Ionicons name="person" size={22} color={COLORS.text.light} />
          <Text fontSize={12} color={COLORS.text.light} marginTop={2}>Profile</Text>
        </TouchableOpacity>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 15,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  eventCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  eventImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 