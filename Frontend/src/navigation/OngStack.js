import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen            from '../screens/Home';
import PerfilScreen          from '../screens/PerfilScreen';
import RegisterAlertas       from '../screens/RegisterAlertas';
import EditarAlerta          from '../screens/EditarAlerta';
import DatosAyudaScreen      from '../screens/DatosAyudaScreen';
import ConfiguracionScreen   from '../screens/ConfiguracionScreen';
import CambiarContrasena     from '../screens/cambiarContrasenaScreen';
import ImportanciaScreen     from '../screens/ImportanciaScreen';
import RecomendacionesScreen from '../screens/RecomendacionesScreen';
import MapaDepartamentos     from '../screens/MapaDepartamentos';
import AlertasDepartamento   from '../screens/AlertasDepartamento';
import DatosUsuarioScreen    from '../screens/DatosUsuarioScreen';

const Stack = createNativeStackNavigator();

export default function OngStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"            component={HomeScreen} />
      <Stack.Screen name="Perfil"          component={PerfilScreen} />
      <Stack.Screen name="RegisterAlertas" component={RegisterAlertas} />
      <Stack.Screen name="EditarAlerta"    component={EditarAlerta} />
      <Stack.Screen name="DatosAyuda"      component={DatosAyudaScreen} />
      <Stack.Screen name="Configuracion"   component={ConfiguracionScreen} />
      <Stack.Screen name="CambiarContrasena" component={CambiarContrasena} />
      <Stack.Screen name="Importancia"     component={ImportanciaScreen} />
      <Stack.Screen name="Recomendaciones" component={RecomendacionesScreen} />
      <Stack.Screen name="MapaDepartamentos" component={MapaDepartamentos} />
      <Stack.Screen
        name="AlertasDepartamento"
        component={AlertasDepartamento}
        options={{ headerShown: true }}
      />
      <Stack.Screen name="DatosUsuario" component={DatosUsuarioScreen} />
    </Stack.Navigator>
  );
}
