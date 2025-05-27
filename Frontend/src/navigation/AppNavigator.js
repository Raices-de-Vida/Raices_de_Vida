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
import DatosAyudaScreen from '../screens/DatosAyudaScreen'; // ajusta el path si es necesario
import CambiarContrasenaScreen from '../screens/cambiarContrasenaScreen'; 
import ImportanciaScreen from '../screens/ImportanciaScreen';
import RecomendacionesScreen from '../screens/RecomendacionesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen'; //  Asegúrate que el nombre y path coincidan
import AlertasDepartamento from '../screens/AlertasDepartamento'; // Asegúrate que el nombre y path coincidan
import MapaDepartamentos from '../screens/MapaDepartamentos';


//import ConfiguracionScreen from '../screens/ConfiguracionScreen'; 
//import RegisterCommunityScreen from '../screens/RegisterCommunityScreen';


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
        <Stack.Navigator initialRouteName="LoginScreen" 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right' 
          }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="RegisterCommunity" component={RegisterCommunityScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />         
          <Stack.Screen name="RegisterAlertas" component={RegisterAlertasScreen} />
          <Stack.Screen name="EditarAlerta" component={EditarAlertaScreen} />
          <Stack.Screen name="DatosAyuda" component={DatosAyudaScreen} />
          <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
          <Stack.Screen name="CambiarContrasena" component={CambiarContrasenaScreen} />
          <Stack.Screen name="Importancia" component={ImportanciaScreen} />
          <Stack.Screen name="Recomendaciones" component={RecomendacionesScreen} />
          <Stack.Screen name="Perfil" component={PerfilScreen} />
          <Stack.Screen name="MapaDepartamentos" component={require('../screens/MapaDepartamentos').default} />
          <Stack.Screen name="AlertasDepartamento" component={AlertasDepartamento} options={{ headerShown: true }}/>
          <Stack.Screen name="DatosUsuario" component={require('../screens/DatosUsuarioScreen').default} />


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