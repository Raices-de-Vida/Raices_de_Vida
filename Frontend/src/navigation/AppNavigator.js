import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'react-native';

import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { OfflineProvider } from '../context/OfflineContext';
import { AuthProvider, AuthContext } from '../context/AuthContext';

import AuthStack from './AuthStack';
import OngStack from './OngStack';
import VolunteerStack from './VolunteerStack';

function RootNavigator() {
  const { role, loading } = useContext(AuthContext);
  const { isDarkMode } = useTheme();

  if (loading) return null;

  // TEMPORAL: Para ver pantallas sin login, descomenta la línea siguiente y comenta el return normal
  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#121212' : '#FFFFFF'}
      />
      <OngStack />
    </NavigationContainer>
  );

  /*
  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#121212' : '#FFFFFF'}
      />

      {!role
        ? <AuthStack />
        : role === 'Ong'
          ? <OngStack />
          : <VolunteerStack />
      }
    </NavigationContainer>
  );
  */
}

export default function AppNavigator() {
  return (
    <ThemeProvider>
      <OfflineProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </OfflineProvider>
    </ThemeProvider>
  );
}
