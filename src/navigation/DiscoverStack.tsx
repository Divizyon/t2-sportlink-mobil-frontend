import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { AllSportsFriendsScreen } from '../screens/discover/AllSportsFriendsScreen';

export type DiscoverStackParamList = {
  DiscoverMain: undefined;
  AllSportsFriends: undefined;
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export const DiscoverStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="DiscoverMain"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="DiscoverMain" 
        component={DiscoverScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="AllSportsFriends" 
        component={AllSportsFriendsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />
    </Stack.Navigator>
  );
};
