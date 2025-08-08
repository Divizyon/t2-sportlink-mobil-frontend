import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import { HelpScreen } from '../screens/profile/settings/HelpScreen';
import { SecuritySettingsScreen } from '../screens/profile/settings/SecuritySettingsScreen';
import { SessionSettings } from '../screens/profile/settings/SessionSettings';
import { NotificationSettingsScreen } from '../screens/profile/settings/NotificationSettingsScreen';
import { TermsOfServiceScreen } from '../screens/profile/settings/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from '../screens/profile/settings/PrivacyPolicyScreen';
import { FriendsListScreen } from '../screens/profile/FriendsListScreen';
import { UserEventsScreen } from '../screens/profile/UserEventsScreen';
import { EditSportPreferencesScreen } from '../screens/profile/EditSportPreferencesScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  EditProfile: undefined;
  Help: undefined;
  SecuritySettings: undefined;
  SessionHistory: undefined;
  NotificationSettings: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  FriendsList: undefined;
  UserEvents: {
    filter: 'created' | 'participated';
    userId: string | undefined;
    title: string;
  };
  EditSportPreferences: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Ayarlar',
          headerTintColor: '#338626',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: 'Profili Düzenle',
          headerTintColor: '#338626',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="SecuritySettings" 
        component={SecuritySettingsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="SessionHistory" 
        component={SessionSettings}
        options={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="TermsOfService" 
        component={TermsOfServiceScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="FriendsList" 
        component={FriendsListScreen}
        options={{
          headerShown: true,
          title: 'Arkadaşlarım',
          headerTintColor: '#338626',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="UserEvents" 
        component={UserEventsScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.title || 'Etkinliklerim',
          headerTintColor: '#338626',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          animation: 'slide_from_right'
        })}
      />
      <Stack.Screen 
        name="EditSportPreferences" 
        component={EditSportPreferencesScreen}
        options={{
          headerShown: true,
          title: 'Spor Tercihlerini Düzenle',
          headerTintColor: '#338626',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          animation: 'slide_from_right'
        }}
      />
    </Stack.Navigator>
  );
}; 