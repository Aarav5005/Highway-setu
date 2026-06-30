import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '../theme';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/driver/HomeScreen';
import TripPlannerScreen from '../screens/driver/TripPlannerScreen';
import MapScreen from '../screens/driver/MapScreen';
import SOSScreen from '../screens/driver/SOSScreen';
import DhabaDetailScreen from '../screens/driver/DhabaDetailScreen';
import MechanicDetailScreen from '../screens/driver/MechanicDetailScreen';
import OrderConfirmScreen from '../screens/driver/OrderConfirmScreen';
import OrderTrackingScreen from '../screens/driver/OrderTrackingScreen';
import TripHistoryScreen from '../screens/driver/TripHistoryScreen';
import MyOrdersScreen from '../screens/driver/MyOrdersScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DriverTabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {return <FeatherIcon name="home" size={size} color={color} />;}
          if (route.name === 'Trips') {return <FeatherIcon name="map" size={size} color={color} />;}
          if (route.name === 'Orders') {return <FeatherIcon name="clipboard" size={size} color={color} />;}
          if (route.name === 'Profile') {return <FeatherIcon name="user" size={size} color={color} />;}
          return <FeatherIcon name="home" size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.driverPrimary,
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Trips" component={TripHistoryScreen} />
      <Tab.Screen name="Orders" component={MyOrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const DriverNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverTabs" component={DriverTabNavigator} />
      <Stack.Screen name="TripPlanner" component={TripPlannerScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="SOS" component={SOSScreen} />
      <Stack.Screen name="DhabaDetail" component={DhabaDetailScreen} />
      <Stack.Screen name="MechanicDetail" component={MechanicDetailScreen} />
      <Stack.Screen name="OrderConfirm" component={OrderConfirmScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
};
