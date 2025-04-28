import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  EditProfile: undefined;
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
          headerTintColor: '#44BD32',
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
          headerTintColor: '#44BD32',
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