import { Tabs } from "expo-router";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants";
import { View } from "react-native";

/**
 * Tab navigasyonu için layout
 * Ana sayfa, Etkinlikler, Bul, Bildirimler ve Hesabım sekmeleri
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.neutral.dark,
        tabBarStyle: {
          backgroundColor: COLORS.neutral.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.neutral.light,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="events"
        options={{
          title: "Etkinlikler",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="find"
        options={{
          title: "Bul",
          tabBarIcon: ({ color, size }) => (
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: COLORS.accent,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
              <Ionicons name="search" size={26} color="white" />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Bildirimler",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hesabım",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 