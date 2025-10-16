import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/Home';
import PerfilScreen from '../screens/PerfilScreen';
import RegisterAlertas from '../screens/RegisterAlertas';
import EditarAlerta from '../screens/EditarAlerta';
import SeleccionPacienteAlertas from '../screens/SeleccionPacienteAlertas';
import GestionAlertasPaciente from '../screens/GestionAlertasPaciente';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import CambiarContrasena from '../screens/CambiarContrasenaScreen';
import PantallaGraficas from '../screens/Graficas';
import DatosUsuarioScreen from '../screens/DatosUsuarioScreen';
import ImportanciaScreen from '../screens/ImportanciaScreen';
import RecomendacionesScreen from '../screens/RecomendacionesScreen';
import SubirInfografiaScreen from '../screens/SubirInfografiaScreen';
import ImportacionDatosScreen from '../screens/ImportacionDatosScreen';
import MapaDepartamentos from '../screens/MapaDepartamentos';
import AlertasDepartamento from '../screens/AlertasDepartamento';
import DatosAyudaScreen from '../screens/DatosAyudaScreen';
import PacienteFormScreen from '../screens/PacienteFormScreen';
import RegistrarSignosScreen from '../screens/RegistrarSignosScreen';
import DetallePacienteScreen from '../screens/DetallePacienteScreen';
import ExportacionPDFScreen from '../screens/ExportacionPDFScreen';

const Stack = createNativeStackNavigator();

export default function OngStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
      {/* Principales */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />

      {/* Funcionalidades */}
      <Stack.Screen name="RegisterAlertas" component={RegisterAlertas} />
      <Stack.Screen name="EditarAlerta" component={EditarAlerta} />
  <Stack.Screen name="SeleccionPacienteAlertas" component={SeleccionPacienteAlertas} />
  <Stack.Screen name="GestionAlertasPaciente" component={GestionAlertasPaciente} />
      <Stack.Screen name="Graficas" component={PantallaGraficas} />

      {/* Configuración */}
      <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
      <Stack.Screen name="CambiarContrasena" component={CambiarContrasena} />
      <Stack.Screen name="DatosUsuario" component={DatosUsuarioScreen} />

      {/* Otras secciones */}
      <Stack.Screen name="ImportacionDatos" component={ImportacionDatosScreen} />
      <Stack.Screen name="MapaDepartamentos" component={MapaDepartamentos} />
      <Stack.Screen name="AlertasDepartamento" component={AlertasDepartamento} />
      <Stack.Screen name="DatosAyuda" component={DatosAyudaScreen} />
      <Stack.Screen name="Recomendaciones" component={RecomendacionesScreen} />
      <Stack.Screen name="Importancia" component={ImportanciaScreen} />
      <Stack.Screen name="SubirInfografia" component={SubirInfografiaScreen} />

      {/* Pacientes */}
      <Stack.Screen name="PacienteForm" component={PacienteFormScreen} />
      <Stack.Screen name="RegistrarSignos" component={RegistrarSignosScreen} />
      <Stack.Screen name="DetallePaciente" component={DetallePacienteScreen} />
      <Stack.Screen name="ExportacionPDF" component={ExportacionPDFScreen} />
    </Stack.Navigator>
  );
}
