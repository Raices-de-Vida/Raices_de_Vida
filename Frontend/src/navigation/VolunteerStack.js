import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen   from '../screens/Home';
import PerfilScreen from '../screens/PerfilScreen';
// … agrega aquí las pantallas propias de “Voluntario”

const Stack = createNativeStackNavigator();

export default function VolunteerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"   component={HomeScreen} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      {/* … más pantallas */}
    </Stack.Navigator>
  );
}
