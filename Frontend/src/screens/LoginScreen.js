import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';
import { useOffline } from '../context/OfflineContext';
import OfflineStorage from '../services/OfflineStorage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { isConnected } = useOffline();

  const isEmpty = (value) => submitted && value.trim() === '';
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await OfflineStorage.getToken();
        const userData = await OfflineStorage.getUserData();
        
        if (token && userData) {
          navigation.replace('Home');
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };
    
    checkSession();
  }, []);
  
  const handleLogin = async () => {
    console.log('Enviando datos:', { email, password });
  
    setSubmitted(true);
  
    if (email.trim() && password.trim()) {
      //Si no hay conexión pero hay credenciales guardadas, verificar localmente
      if (!isConnected) {
        try {
          //Verificar si las credenciales coinciden con las guardadas
          const userData = await OfflineStorage.getUserData();
          if (userData && userData.email === email) {
            Alert.alert('Modo sin conexión', 'Has iniciado sesión en modo offline');
            navigation.replace('Home');
            return;
          } else {
            Alert.alert('Error', 'No se puede verificar en modo offline. Necesitas conexión a internet para el primer inicio de sesión.');
            return;
          }
        } catch (error) {
          Alert.alert('Error', 'No se puede iniciar sesión en modo offline');
          return;
        }
      }
      
      //Si hay conexión, intentar login normal
      try { 
        const response = await axios.post("//localhost:3001/api/auth/login", {
          email,
          password
        });
        const { token, user } = response.data;
        
        //Guardar token y datos de usuario para uso offline
        await OfflineStorage.saveToken(token);
        await OfflineStorage.saveUserData({
          id: user?.id,
          email: email,
          nombre: user?.nombre,
          dpi: user?.dpi,
          telefono: user?.telefono,
          rol: user?.rol
        });
        
        console.log('Login correcto:', response.data);
        
        navigation.replace('Home');
  
      } catch (err) {
        console.error('Error de login completo:', err);
  
        if (err.response) {
          if (err.response.status === 401) {
            alert('Correo o contraseña incorrectos.');
          } else if (err.response.status === 400) {
            alert('Solicitud inválida. Verifica los datos.');
          } else {
            alert(`Error del servidor: ${err.response.status}`);
          }
        } else if (err.request) {
          alert('No se pudo conectar con el servidor. ¿Está el backend corriendo?');
        } else {
          alert('Ocurrió un error: ' + err.message);
        }
      }
    } else {
      alert('Por favor llena todos los campos');
    }
  };
  
  if (isCheckingSession) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[{ color: theme.text }]}>Verificando sesión...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background }
      ]}
    >
      <ThemeToggle />
      
      {/* Indicador de modo offline */}
      {!isConnected && (
        <View style={[styles.offlineIndicator, { backgroundColor: theme.toastInfo }]}>
          <Text style={styles.offlineText}>Modo sin conexión</Text>
        </View>
      )}
      
      <Text style={[styles.title, { color: theme.text }]}>Iniciar sesión</Text>

      <TextInput
        style={[
          styles.input, 
          isEmpty(email) && styles.errorInput,
          { 
            borderColor: isEmpty(email) ? 'red' : theme.inputBorder,
            backgroundColor: theme.inputBackground,
            color: theme.text
          }
        ]}
        placeholder="correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
      />
      
      <TextInput
        style={[
          styles.input, 
          isEmpty(password) && styles.errorInput,
          { 
            borderColor: isEmpty(password) ? 'red' : theme.inputBorder,
            backgroundColor: theme.inputBackground,
            color: theme.text
          }
        ]}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
      />

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.secondaryButton }]} 
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={[styles.link, { color: theme.secondaryButton }]}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 25,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorInput: {
    borderColor: 'red',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 100,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  offlineIndicator: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 20,
    alignSelf: 'center',
  },
  offlineText: {
    color: 'white',
    fontWeight: '500',
  },
});