import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TermsScreen from '../screens/TermsScreen';
import HomeScreen from '../screens/Home';
import RegisterAlertasScreen from '../screens/RegisterAlertas';
import EditarAlertaScreen from '../screens/EditarAlerta';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

function AppStack() {
  const { isDarkMode } = useTheme();
  
  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? '#121212' : '#FFFFFF'} 
      />
      <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack.Navigator initialRouteName="Welcome" 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right' 
          }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />         
          <Stack.Screen name="RegisterAlertas" component={RegisterAlertasScreen} />
          <Stack.Screen name="EditarAlerta" component={EditarAlertaScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function AppNavigator() {
  return (
    <ThemeProvider>
      <AppStack />
    </ThemeProvider>
  );
}