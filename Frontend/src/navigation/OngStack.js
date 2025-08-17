import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/Home';
import PerfilScreen from '../screens/PerfilScreen';
import RegisterAlertas from '../screens/RegisterAlertas';
import EditarAlerta from '../screens/EditarAlerta';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import CambiarContrasena from '../screens/cambiarContrasenaScreen';
import PantallaGraficas from '../screens/Graficas';
import DatosUsuarioScreen from '../screens/DatosUsuarioScreen';
import ImportanciaScreen from '../screens/ImportanciaScreen';
import RecomendacionesScreen from '../screens/RecomendacionesScreen';
import SubirInfografiaScreen from '../screens/SubirInfografiaScreen';
import ImportacionDatosScreen from '../screens/ImportacionDatosScreen'; // Nueva pantalla
import MapaDepartamentos from '../screens/MapaDepartamentos'; // Para navegación desde el botón
import AlertasDepartamento from '../screens/AlertasDepartamento'; // Pantalla de alertas por departamento
import DatosAyudaScreen from '../screens/DatosAyudaScreen'; // Pantalla de datos de ayuda

const Stack = createNativeStackNavigator();

export default function OngStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      // TEMPORAL: Cambia 'Home' por la pantalla que quieras ver primero
      initialRouteName="MapaDepartamentos"
      // initialRouteName="MapaDepartamentos"
      // initialRouteName="Configuracion"  
      // initialRouteName="Graficas"
      // initialRouteName="Home"
    >
      {/* Pantallas principales */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />

      {/* Funcionalidades */}
      <Stack.Screen name="RegisterAlertas" component={RegisterAlertas} />
      <Stack.Screen name="EditarAlerta" component={EditarAlerta} />
      <Stack.Screen name="Graficas" component={PantallaGraficas} />

      {/* Configuración y perfil */}
      <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
      <Stack.Screen name="CambiarContrasena" component={CambiarContrasena} />
      <Stack.Screen name="DatosUsuario" component={DatosUsuarioScreen} />

      {/* Nueva sección de importación */}
      <Stack.Screen name="ImportacionDatos" component={ImportacionDatosScreen} />
      <Stack.Screen name="MapaDepartamentos" component={MapaDepartamentos} />
      <Stack.Screen name="AlertasDepartamento" component={AlertasDepartamento} />

      {/* Sección de ayuda */}
      <Stack.Screen name="DatosAyuda" component={DatosAyudaScreen} />
      <Stack.Screen name="Recomendaciones" component={RecomendacionesScreen} />
      <Stack.Screen name="Importancia" component={ImportanciaScreen} />
      <Stack.Screen name="SubirInfografia" component={SubirInfografiaScreen} />
    </Stack.Navigator>
  );
}
