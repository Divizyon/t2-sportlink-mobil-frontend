import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/home/HomeScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { SportsFacilitiesScreen } from '../screens/sportsFacilities/SportsFacilitiesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

import { useThemeStore } from '../store/appStore/themeStore';
import { useNotificationStore } from '../store/appStore/notificationStore';

const Tab = createBottomTabNavigator();

export function MainNavigator() {
  const { theme } = useThemeStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  
  // Unread count'u periyodik olarak güncelle
  useEffect(() => {
    // İlk yükleme
    fetchUnreadCount();
    
    // 60 saniyede bir güncelle
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: { 
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Ana sayfa',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Events" 
        component={EventsScreen} 
        options={{
          tabBarLabel: 'Etkinlikler',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen} 
        options={{
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="SportsFacilities"
        component={SportsFacilitiesScreen}
        options={{
          tabBarLabel: 'Spor Alanları',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="fitness-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profilim',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 