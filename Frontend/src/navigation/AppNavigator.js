import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar, View, Text } from 'react-native';

import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { OfflineProvider } from '../context/OfflineContext';
import { AuthProvider, AuthContext } from '../context/AuthContext';

import AuthStack from './AuthStack';
import OngStack from './OngStack';
import VolunteerStack from './VolunteerStack';

function RootNavigator() {
  const { role, loading } = useContext(AuthContext);
  const { isDarkMode } = useTheme();

  // Agregar un componente de carga para debug
  if (loading) {
    return (
      <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#121212' : '#FFFFFF'}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Cargando...</Text>
        </View>
      </NavigationContainer>
    );
  }



  // CONFIGURACIÓN NORMAL (comentada temporalmente)
  
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
  
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
