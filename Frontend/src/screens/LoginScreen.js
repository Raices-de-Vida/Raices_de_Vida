import axios from 'axios';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const isEmpty = (value) => submitted && value.trim() === '';
  
  const handleLogin = async () => {
    console.log('Enviando datos:', { email, password });
  
    setSubmitted(true);
  
    if (email.trim() && password.trim()) {
      try { 
        const response = await axios.post("http://IP:3001/api/auth/login", {
          email,
          password
        });
  
        console.log('Login correcto:', response.data);
        
        navigation.navigate('Home');
  
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
  
  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background }
      ]}
    >
      <ThemeToggle />
      
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
});