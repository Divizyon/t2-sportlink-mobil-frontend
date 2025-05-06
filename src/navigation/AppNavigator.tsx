import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, ViewStyle, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/userStore/authStore';
import { useFriendsStore } from '../store/userStore/friendsStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens - Auth
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

// Screens - Onboarding
import WelcomeScreen from '../screens/welcome/WelcomeScreen';

// Screens - Main
import { HomeScreen } from '../screens/home/HomeScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

// App Screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import FriendProfileScreen from '../screens/profile/friends/FriendProfileScreen';
import { AllSportsFriendsScreen } from '../screens/discover/AllSportsFriendsScreen';

// Screens - Events
import { EventDetailScreen } from '../screens/events/EventDetailScreen/EventDetailScreen';
import { EventMapScreen } from '../screens/events/EventMapScreen/EventMapScreen';
import { CreateEventScreen } from '../screens/events/CreateEventScreen';
import { EditEventScreen } from '../screens/events/EditEventScreen';

// Screens - News & Announcements
import { NewsDetailScreen } from '../screens/news/NewsDetailScreen';
import { AnnouncementDetailScreen } from '../screens/announcements/AnnouncementDetailScreen';
import AllNewsScreen from '../screens/news/AllNewsScreen';

// Navigation
import { ProfileStack } from './ProfileStack';

// Store
import { useThemeStore } from '../store/appStore/themeStore';
import { useNotificationStore } from '../store/appStore/notificationStore';
import { useMessageStore } from '../store/messageStore/messageStore';

// Message Screens
import MessagesScreen from '../screens/messages/MessagesScreen';
import ConversationDetailScreen from '../screens/messages/ConversationDetailScreen';
import NewConversationScreen from '../screens/messages/NewConversationScreen';

// Types
type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type AppStackParamList = {
  MainTabs: undefined;
  EventDetail: { eventId: string };
  EventMapScreen: { eventId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  NewsDetail: { newsId: string };
  AnnouncementDetail: { announcementId: string };
  FriendProfile: { userId: string };
  AllSportsFriends: undefined;
  Messages: undefined;
  ConversationDetail: { conversationId: string };
  NewConversation: undefined;
  AllNewsScreen: undefined;
};

type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: string };
  EventMapScreen: { eventId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const EventsStack = createNativeStackNavigator<EventsStackParamList>();
const Tab = createBottomTabNavigator();

// Etkinlikler Stack Navigator
const EventsStackNavigator = () => {
  return (
    <EventsStack.Navigator screenOptions={{ headerShown: false }}>
      <EventsStack.Screen name="EventsList" component={EventsScreen} />
      <EventsStack.Screen name="EventDetail" component={EventDetailScreen} />
      <EventsStack.Screen name="EventMapScreen" component={EventMapScreen} />
      <EventsStack.Screen 
        name="CreateEvent" 
        component={CreateEventScreen}
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
          contentStyle: { backgroundColor: 'transparent' }
        }}
      />
      <EventsStack.Screen 
        name="EditEvent" 
        component={EditEventScreen} 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
          contentStyle: { backgroundColor: 'transparent' }
        }}
      />
    </EventsStack.Navigator>
  );
};

// Tab Navigator
const TabNavigator = () => {
  const { theme } = useThemeStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const { unreadMessagesCount, getUnreadMessagesCount } = useMessageStore();
  
  // Bildirim sayılarını periyodik olarak güncelle
  useEffect(() => {
    // İlk yükleme
    fetchUnreadCount();
    getUnreadMessagesCount();
    
    // 60 saniyede bir güncelle
    const interval = setInterval(() => {
      fetchUnreadCount();
      getUnreadMessagesCount();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount, getUnreadMessagesCount]);
  
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
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="home-outline" size={size} color={color} />
              {unreadMessagesCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -6,
                  right: -10,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: theme.colors.accent,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}>
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsStackNavigator} 
        options={{
          tabBarLabel: 'Etkinlikler',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen} 
        options={({ navigation }) => ({
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
          tabBarButton: (props) => {
            return (
              <View style={{
                flex: 1,
                alignItems: 'center',
              }}>
                <TouchableOpacity
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: theme.colors.accent,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: -10,
                    position: 'absolute',
                    bottom: 5,
                  }}
                  activeOpacity={0.7}
                  onPress={() => {
                    navigation.navigate('Discover');
                    console.log("Keşfet butonuna tıklandı");
                  }}
                >
                  <Ionicons name="search" size={30} color="white" />
                </TouchableOpacity>
              </View>
            );
          },
        })}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Bildirimler',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="notifications-outline" size={size} color={color} />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -6,
                  right: -10,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: theme.colors.accent,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{
          tabBarLabel: 'Profilim',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const {isAuthenticated, checkAuth } = useAuthStore();
  const { resetState: resetFriendsState } = useFriendsStore();
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useThemeStore();

  useEffect(() => {
    const loadToken = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Kullanıcı oturum açtı, arkadaş durumu sıfırlanıyor...');
      resetFriendsState();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
          <AppStack.Screen name="MainTabs" component={TabNavigator} />
          <AppStack.Screen 
            name="EventDetail" 
            component={EventDetailScreen} 
            options={{ presentation: 'card' }}
          />
          <AppStack.Screen 
            name="EventMapScreen" 
            component={EventMapScreen} 
            options={{ presentation: 'card' }}
          />
          <AppStack.Screen 
            name="CreateEvent" 
            component={CreateEventScreen}
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: 'transparent' }
            }}
          />
          <AppStack.Screen 
            name="EditEvent" 
            component={EditEventScreen} 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: 'transparent' }
            }}
          />
          <AppStack.Screen 
            name="NewsDetail" 
            component={NewsDetailScreen} 
            options={{ presentation: 'card' }}
          />
          <AppStack.Screen 
            name="AnnouncementDetail" 
            component={AnnouncementDetailScreen} 
            options={{ presentation: 'card' }}
          />
          <AppStack.Screen 
            name="FriendProfile" 
            component={FriendProfileScreen} 
            options={{ 
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
          <AppStack.Screen 
            name="AllSportsFriends" 
            component={AllSportsFriendsScreen} 
            options={{ 
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
          <AppStack.Screen 
            name="Messages" 
            component={MessagesScreen} 
            options={{ 
              headerShown: true,
              title: 'Mesajlar',
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
          <AppStack.Screen 
            name="ConversationDetail" 
            component={ConversationDetailScreen} 
            options={{ 
              headerShown: true,
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
          <AppStack.Screen 
            name="NewConversation" 
            component={NewConversationScreen} 
            options={{ 
              headerShown: true,
              title: 'Yeni Mesaj',
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
          <AppStack.Screen 
            name="AllNewsScreen" 
            component={AllNewsScreen} 
            options={{ 
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
          <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};