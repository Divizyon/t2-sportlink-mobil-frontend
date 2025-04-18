import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Image, TouchableOpacity, Dimensions, SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Center,
  Pressable,
  Divider,
} from '@gluestack-ui/themed';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Renk paleti - Açık tema
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
  divider: "#E1E4E8",
};

// Renk paleti - Koyu tema
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
  divider: "#38444D", // Ayırıcı çizgi
};

// Demo profil verileri
const profileData = {
  name: "Alexander Thompson",
  age: 28,
  location: "New York",
  avatar: require('../assets/images/profile.jpg'),
  stats: {
    totalWorkouts: 156,
    activeStreak: 23,
    fitnessLevel: "Advanced",
    achievements: 12
  },
  activities: [
    {
      type: "Running",
      date: "March 12, 2025",
      duration: 45,
      location: "Central Park",
      partner: "Sarah Mitchell"
    },
    {
      type: "Yoga",
      date: "March 11, 2025",
      duration: 60,
      location: "Fitness Studio",
      partner: "Michael Chen"
    }
  ]
};

export default function ProfileScreen() {
  const systemColorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState('activities');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Renk temasını belirle
  const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  
  // StatusBar için barStyle belirle
  const statusBarStyle = isDarkMode ? 'light-content' : 'dark-content';
  
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
  
  const goBack = () => {
    router.back();
  };

  const goToHome = () => {
    router.push('/home');
  };

  const goToEvents = () => {
    router.push('/routes');
  };

  const goToFind = () => {
    router.push('/map');
  };

  const goToNotifications = () => {
    router.push('/facilities');
  };
  
  const getTabStyle = (tabName: string) => {
    return {
      ...styles.tabButton,
      borderBottomWidth: activeTab === tabName ? 2 : 0,
      borderBottomColor: activeTab === tabName ? COLORS.secondary : 'transparent',
    };
  };

  const getTabTextStyle = (tabName: string) => {
    return {
      ...styles.tabText,
      color: activeTab === tabName ? COLORS.secondary : COLORS.text.light,
    };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={COLORS.background}
        translucent={false}
      />
      <Box flex={1} backgroundColor={COLORS.background}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Info */}
          <VStack alignItems="center" paddingTop={20} paddingBottom={24}>
            <Box position="relative">
              <Center 
                width={100} 
                height={100} 
                borderRadius={50} 
                backgroundColor={COLORS.lightGray}
                overflow="hidden"
              >
                <Image 
                  source={profileData.avatar} 
                  style={styles.profileImage} 
                />
              </Center>
              <Center 
                position="absolute" 
                bottom={0} 
                right={0}
                width={30} 
                height={30} 
                borderRadius={15}
                backgroundColor={COLORS.secondary}
              >
                <Ionicons name="camera" size={16} color={COLORS.white === "#FFFFFF" ? "#FFFFFF" : "#192734"} />
              </Center>
            </Box>
            
            <Text 
              fontSize={22} 
              fontWeight="700" 
              color={COLORS.text.dark}
              marginTop={12}
            >
              {profileData.name}
            </Text>
            
            <Text 
              fontSize={14} 
              color={COLORS.text.light}
              marginTop={2}
            >
              {profileData.age} years old • {profileData.location}
            </Text>
            
            {/* Stats */}
            <HStack 
              width="100%" 
              justifyContent="space-around" 
              marginTop={24}
              paddingHorizontal={16}
            >
              <VStack alignItems="center">
                <Text color={COLORS.secondary} fontSize={22} fontWeight="700">
                  {profileData.stats.totalWorkouts}
                </Text>
                <Text color={COLORS.text.light} fontSize={12} marginTop={4}>
                  Total
                </Text>
                <Text color={COLORS.text.light} fontSize={12}>
                  Workouts
                </Text>
              </VStack>
              
              <VStack alignItems="center">
                <Text color={COLORS.secondary} fontSize={22} fontWeight="700">
                  {profileData.stats.activeStreak}
                </Text>
                <Text color={COLORS.text.light} fontSize={12} marginTop={4}>
                  Active
                </Text>
                <Text color={COLORS.text.light} fontSize={12}>
                  Streak
                </Text>
              </VStack>
              
              <VStack alignItems="center">
                <Text color={COLORS.secondary} fontSize={22} fontWeight="700">
                  {profileData.stats.fitnessLevel}
                </Text>
                <Text color={COLORS.text.light} fontSize={12} marginTop={4}>
                  Fitness
                </Text>
                <Text color={COLORS.text.light} fontSize={12}>
                  Level
                </Text>
              </VStack>
              
              <VStack alignItems="center">
                <Text color={COLORS.secondary} fontSize={22} fontWeight="700">
                  {profileData.stats.achievements}
                </Text>
                <Text color={COLORS.text.light} fontSize={12} marginTop={4}>
                  Achievements
                </Text>
              </VStack>
            </HStack>
          </VStack>
          
          {/* Tabs */}
          <HStack
            borderBottomWidth={1}
            borderBottomColor={COLORS.divider}
            marginBottom={16}
            backgroundColor={COLORS.white}
          >
            <Pressable 
              style={getTabStyle('overview')}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={getTabTextStyle('overview')}>Overview</Text>
            </Pressable>
            
            <Pressable 
              style={getTabStyle('activities')}
              onPress={() => setActiveTab('activities')}
            >
              <Text style={getTabTextStyle('activities')}>Activities</Text>
            </Pressable>
            
            <Pressable 
              style={getTabStyle('achievements')}
              onPress={() => setActiveTab('achievements')}
            >
              <Text style={getTabTextStyle('achievements')}>Achievements</Text>
            </Pressable>
          </HStack>
          
          {/* Activities List */}
          {activeTab === 'activities' && (
            <VStack paddingHorizontal={20} marginBottom={20}>
              {profileData.activities.map((activity, index) => (
                <View key={index} style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <HStack justifyContent="space-between" marginBottom={8}>
                    <Text fontSize={16} fontWeight="600" color={COLORS.text.dark}>
                      {activity.type}
                    </Text>
                    <Text fontSize={14} color={COLORS.text.light}>
                      {activity.date}
                    </Text>
                  </HStack>
                  
                  <HStack alignItems="center" marginBottom={8}>
                    <Center 
                      width={32} 
                      height={32} 
                      borderRadius={16}
                      backgroundColor={COLORS.lightGray}
                      marginRight={8}
                    >
                      <Ionicons name="time-outline" size={16} color={COLORS.text.light} />
                    </Center>
                    <Text color={COLORS.text.dark}>{activity.duration} mins</Text>
                  </HStack>
                  
                  <HStack alignItems="center" marginBottom={8}>
                    <Center 
                      width={32} 
                      height={32} 
                      borderRadius={16}
                      backgroundColor={COLORS.lightGray}
                      marginRight={8}
                    >
                      <Ionicons name="location-outline" size={16} color={COLORS.text.light} />
                    </Center>
                    <Text color={COLORS.text.dark}>{activity.location}</Text>
                  </HStack>
                  
                  <HStack alignItems="center">
                    <Center 
                      width={32} 
                      height={32} 
                      borderRadius={16}
                      backgroundColor={COLORS.lightGray}
                      marginRight={8}
                    >
                      <Ionicons name="people-outline" size={16} color={COLORS.text.light} />
                    </Center>
                    <Text color={COLORS.text.dark}>{activity.partner}</Text>
                  </HStack>
                </View>
              ))}
            </VStack>
          )}
          
          {/* Privacy Settings */}
          <TouchableOpacity 
            style={[
              styles.privacyButton, 
              { 
                borderTopColor: COLORS.divider, 
                borderBottomColor: COLORS.divider,
                backgroundColor: COLORS.white
              }
            ]}
          >
            <HStack alignItems="center">
              <Center 
                width={32} 
                height={32} 
                borderRadius={16}
                backgroundColor={COLORS.lightGray}
                marginRight={12}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.secondary} />
              </Center>
              <Text flex={1} fontSize={16} color={COLORS.text.dark}>Privacy Settings</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.text.light} />
            </HStack>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Bottom Navigation */}
        <HStack 
          backgroundColor={COLORS.white} 
          height={60} 
          justifyContent="space-around" 
          alignItems="center"
          borderTopWidth={1}
          borderTopColor={COLORS.divider}
        >
          <TouchableOpacity 
            style={styles.navItem}
            onPress={goToHome}
          >
            <Ionicons name="home-outline" size={22} color={COLORS.text.light} />
            <Text fontSize={12} color={COLORS.text.light} marginTop={2}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={goToEvents}
          >
            <Ionicons name="calendar-outline" size={22} color={COLORS.text.light} />
            <Text fontSize={12} color={COLORS.text.light} marginTop={2}>Events</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={goToFind}
          >
            <Ionicons name="search-outline" size={22} color={COLORS.text.light} />
            <Text fontSize={12} color={COLORS.text.light} marginTop={2}>Find</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={goToNotifications}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.text.light} />
            <Text fontSize={12} color={COLORS.text.light} marginTop={2}>Notifications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="person" size={22} color={COLORS.primary} />
            <Text fontSize={12} color={COLORS.primary} marginTop={2}>Profile</Text>
          </TouchableOpacity>
        </HStack>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  privacyButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 40,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 