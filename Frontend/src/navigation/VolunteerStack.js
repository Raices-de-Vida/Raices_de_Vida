// VolunteerStack actualizado
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/Home';
import PerfilScreen from '../screens/PerfilScreen';
import RegisterAlertas from '../screens/RegisterAlertas';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import CambiarContrasena from '../screens/cambiarContrasenaScreen';
import DatosUsuarioScreen from '../screens/DatosUsuarioScreen';
import SubirInfografiaScreen from '../screens/SubirInfografiaScreen';
import MapaDepartamentos from '../screens/MapaDepartamentos';
import DatosAyudaScreen from '../screens/DatosAyudaScreen';
import ImportanciaScreen from '../screens/ImportanciaScreen';
import RecomendacionesScreen from '../screens/RecomendacionesScreen';
const Stack = createNativeStackNavigator();

export default function VolunteerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="RegisterAlertas" component={RegisterAlertas} />
      <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
      <Stack.Screen name="CambiarContrasena" component={CambiarContrasena} />
      <Stack.Screen name="SubirInfografiaScreen" component={SubirInfografiaScreen} />
      <Stack.Screen name="MapaDepartamentos" component={MapaDepartamentos} />
      <Stack.Screen name="DatosUsuario" component={DatosUsuarioScreen} />

      {/* Sección de ayuda para voluntarios igual que ONG */}
      <Stack.Screen name="DatosAyuda" component={DatosAyudaScreen} />
      <Stack.Screen name="Recomendaciones" component={RecomendacionesScreen} />
      <Stack.Screen name="Importancia" component={ImportanciaScreen} />
      <Stack.Screen name="SubirInfografia" component={SubirInfografiaScreen} />
      
      
    </Stack.Navigator>
  );
}