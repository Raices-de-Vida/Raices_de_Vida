import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen    from '../screens/WelcomeScreen';
import LoginScreen      from '../screens/LoginScreen';
import RegisterScreen   from '../screens/RegisterScreen';
import TermsScreen      from '../screens/TermsScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome"  component={WelcomeScreen} />
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Terms"    component={TermsScreen} />
    </Stack.Navigator>
  );
}
