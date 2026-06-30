import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '../theme';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import JobsScreen from '../screens/mechanic/JobsScreen';
import MechanicProfileScreen from '../screens/mechanic/MechanicProfileScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MechanicTabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Jobs') {return <FeatherIcon name="tool" size={size} color={color} />;}
          if (route.name === 'Profile') {return <FeatherIcon name="user" size={size} color={color} />;}
          return <FeatherIcon name="home" size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.mechanicPrimary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          height: 65 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
          paddingBottom: (insets.bottom > 0 ? insets.bottom : 10),
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          elevation: 0,
          shadowOpacity: 0,
        },
      })}
    >
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const MechanicNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MechanicTabs" component={MechanicTabNavigator} />
      <Stack.Screen name="MechanicProfile" component={MechanicProfileScreen} />
    </Stack.Navigator>
  );
};
