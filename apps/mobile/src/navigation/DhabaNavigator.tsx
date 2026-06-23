import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DhabaHomeScreen from '../screens/dhaba/DhabaHomeScreen';
import MenuScreen from '../screens/dhaba/MenuScreen';
import DhabaProfileScreen from '../screens/dhaba/DhabaProfileScreen';
import ReviewsScreen from '../screens/dhaba/ReviewsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DhabaTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Orders" component={DhabaHomeScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const DhabaNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DhabaTabs" component={DhabaTabNavigator} />
      <Stack.Screen name="DhabaProfile" component={DhabaProfileScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
    </Stack.Navigator>
  );
};
