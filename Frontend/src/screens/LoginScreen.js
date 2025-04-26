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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isEmpty = (value) => submitted && value.trim() === '';
  const handleLogin = async () => {
    alert('Se presionó el botón de login');
    console.log('Enviando datos:', { email, password });
  
    setSubmitted(true);
  
    if (email.trim() && password.trim()) {
      try { 
        const response = await axios.post("192.168.2.1:3001/api/auth/login", {
          email,
          password
        });
  
        console.log('Login correcto:', response.data);
        alert('Inicio de sesión exitoso');
  
        // Aquí puedes guardar el token si quieres:
        // await AsyncStorage.setItem('token', response.data.token);
  
        // Luego navegar a otra pantalla
        // navigation.navigate('Home');
  
      } catch (err) {
        console.error('Error de login completo:', err);
  
        if (err.response) {
          // Si el servidor respondió con error
          if (err.response.status === 401) {
            alert('Correo o contraseña incorrectos.');
          } else if (err.response.status === 400) {
            alert('Solicitud inválida. Verifica los datos.');
          } else {
            alert(`Error del servidor: ${err.response.status}`);
          }
        } else if (err.request) {
          // Si no se pudo contactar el backend
          alert('No se pudo conectar con el servidor. ¿Está el backend corriendo?');
        } else {
          // Otro error desconocido
          alert('Ocurrió un error: ' + err.message);
        }
      }
    } else {
      alert('Por favor llena todos los campos');
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        style={[styles.input, isEmpty(email) && styles.errorInput]}
        placeholder="correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#999"
      />
      <TextInput
        style={[styles.input, isEmpty(password) && styles.errorInput]}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 25,
    fontWeight: 'bold',
    color: '#1B1F3B',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    borderColor: '#2E7D32',
    borderWidth: 1,
  },
  errorInput: {
    borderColor: 'red',
  },
  button: {
    backgroundColor: '#2E7D32',
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
    color: '#2E7D32',
    marginTop: 15,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
