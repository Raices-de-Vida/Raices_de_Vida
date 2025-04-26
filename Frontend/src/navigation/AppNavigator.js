import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TermsScreen from '../screens/TermsScreen';
import HomeScreen from '../screens/Home';
import RegisterAlertasScreen from '../screens/RegisterAlertas';
import EditarAlertaScreen from '../screens/EditarAlerta';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
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
  );
}