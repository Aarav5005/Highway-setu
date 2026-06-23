import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { DriverNavigator } from './DriverNavigator';
import { DhabaNavigator } from './DhabaNavigator';
import { MechanicNavigator } from './MechanicNavigator';

export const RootNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'driver' ? (
        <DriverNavigator />
      ) : user?.role === 'dhaba_owner' ? (
        <DhabaNavigator />
      ) : user?.role === 'mechanic' ? (
        <MechanicNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
