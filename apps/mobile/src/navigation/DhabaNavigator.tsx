import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '../theme';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DhabaHomeScreen from '../screens/dhaba/DhabaHomeScreen';
import MenuScreen from '../screens/dhaba/MenuScreen';
import DhabaProfileScreen from '../screens/dhaba/DhabaProfileScreen';
import ReviewsScreen from '../screens/dhaba/ReviewsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DhabaTabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Orders') {return <FeatherIcon name="clipboard" size={size} color={color} />;}
          if (route.name === 'Menu') {return <MaterialCommunityIcons name="silverware" size={size} color={color} />;}
          if (route.name === 'Profile') {return <FeatherIcon name="user" size={size} color={color} />;}
          return <FeatherIcon name="home" size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.dhabaPrimary,
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
