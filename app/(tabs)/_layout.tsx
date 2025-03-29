import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store';

export default function TabLayout() {
  const { isDarkMode } = useThemeStore();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0078d7',
        tabBarInactiveTintColor: isDarkMode ? '#aaa' : '#777',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
          borderTopColor: isDarkMode ? '#333' : '#ddd',
        },
        headerStyle: {
          backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
        },
        headerTintColor: isDarkMode ? '#fff' : '#333',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Ana Sayfa',
          headerTitle: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profil',
          headerTitle: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: 'Ayarlar',
          headerTitle: 'Ayarlar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 