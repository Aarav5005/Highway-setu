import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import './src/i18n'; // Initialize i18n
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
