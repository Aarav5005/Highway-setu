import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LanguageScreen from '../screens/auth/LanguageScreen';
import RoleScreen from '../screens/auth/RoleScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import TermsScreen from '../screens/auth/TermsScreen';
import PendingVerificationScreen from '../screens/shared/PendingVerificationScreen';
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();
  const initialRoute = (isAuthenticated && user?.role === 'pending') ? 'Role' : 'Language';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Role" component={RoleScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PendingVerification" component={PendingVerificationScreen} />
    </Stack.Navigator>
  );
};
