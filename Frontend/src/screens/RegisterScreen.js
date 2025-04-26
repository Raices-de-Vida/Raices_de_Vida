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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dpi, setDpi] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const isEmpty = (value) => submitted && value.trim() === '';

  const handleRegister = async () => {
    alert('Se presionó el botón');
    setSubmitted(true);

    if (
      name.trim() &&
      phone.trim() &&
      dpi.trim() &&
      (email.trim() || dpi.trim()) &&
      password.trim() &&
      confirmPassword.trim()
    ) {
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }

      const response = await axios.post('http://IP:3001/api/auth/register', {
        nombre: name,
        apellido: 'SinApellido',
        email,
        password,
        rol: 'ONG',
        tipo_referencia: 'ONG',
        id_referencia: 1,
      });

      console.log(' Usuario registrado:', response.data);
      alert('Registro exitoso');
      navigation.navigate('Login');
    } else {
      alert('Por favor llena todos los campos');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <ThemeToggle />
      
      <Text style={[styles.title, { color: theme.text }]}>Crear cuenta</Text>

      <TextInput
        style={[
          styles.input, 
          isEmpty(name) && styles.errorInput,
          { 
            borderColor: isEmpty(name) ? 'red' : theme.inputBorder,
            backgroundColor: theme.inputBackground,
            color: theme.text
          }
        ]}
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
      />
      
      <TextInput
        style={[
          styles.input, 
          isEmpty(phone) && styles.errorInput,
          { 
            borderColor: isEmpty(phone) ? 'red' : theme.inputBorder,
            backgroundColor: theme.inputBackground,
            color: theme.text
          }
        ]}
        placeholder="Teléfono"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
      />
      
      <TextInput
        style={[
          styles.input, 
          isEmpty(dpi) && styles.errorInput,
          { 
            borderColor: isEmpty(dpi) ? 'red' : theme.inputBorder,
            backgroundColor: theme.inputBackground,
            color: theme.text
          }
        ]}
        placeholder="DPI"
        value={dpi}
        onChangeText={setDpi}
        keyboardType="numeric"
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
      />
      
      <Text style={[styles.optional, { color: theme.secondaryText }]}>
        O ingresa tu correo electrónico
      </Text>
      
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
        placeholder="Correo electrónico"
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
      
      <TextInput
        style={[
          styles.input, 
          isEmpty(confirmPassword) && styles.errorInput,
          { 
            borderColor: isEmpty(confirmPassword) ? 'red' : theme.inputBorder,
            backgroundColor: theme.inputBackground,
            color: theme.text
          }
        ]}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
      />

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.primaryButton }]} 
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Registrarme</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, { color: theme.secondaryButton }]}>
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
        <Text style={[styles.termsLink, { color: theme.secondaryButton }]}>
          Términos y condiciones
        </Text>
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
  optional: {
    fontSize: 12,
    marginBottom: 4,
    alignSelf: 'flex-start',
    marginLeft: 5,
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
  termsLink: {
    marginTop: 5,
    fontSize: 13,
  },
});