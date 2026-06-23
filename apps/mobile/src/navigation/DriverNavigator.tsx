import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/driver/HomeScreen';
import TripPlannerScreen from '../screens/driver/TripPlannerScreen';
import MapScreen from '../screens/driver/MapScreen';
import SOSScreen from '../screens/driver/SOSScreen';
import DhabaDetailScreen from '../screens/driver/DhabaDetailScreen';
import OrderConfirmScreen from '../screens/driver/OrderConfirmScreen';
import OrderTrackingScreen from '../screens/driver/OrderTrackingScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import { View, Text } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Placeholder = ({ name }: { name: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>{name}</Text></View>
);

const DriverTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Trips" children={() => <Placeholder name="Trips History" />} />
      <Tab.Screen name="Orders" children={() => <Placeholder name="My Orders" />} />
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
      <Stack.Screen name="OrderConfirm" component={OrderConfirmScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
};
