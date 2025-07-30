import axios from 'axios';
import React, { useState, useContext } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dpi, setDpi] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const opcionesTipo = ['ONG', 'Voluntario', 'Lider Comunitario'];

  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const isEmpty = (val) => submitted && val.trim() === '';

  // dentro de RegisterScreen.js, justo antes de handleRegister:
const normalizeRole = (rol) => {
  if (rol === 'ONG') return 'Ong';
  if (rol === 'Voluntario') return 'Volunteer';
  return rol;
};

const handleRegister = async () => {
  setSubmitted(true);
  if (
    name.trim() &&
    phone.trim() &&
    dpi.trim() &&
    (email.trim() || dpi.trim()) &&
    password.trim() &&
    confirmPassword.trim() &&
    tipoUsuario
  ) {
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    try {
      const { data: user } = await axios.post(
        'http://localhost:3001/api/auth/register',
        {
          nombre:           name,
          apellido:         'SinApellido',
          email,
          password,
          rol:              tipoUsuario,
          tipo_referencia:  tipoUsuario,
          id_referencia:    1,
        }
      );

      // Guardar datos
      await AsyncStorage.setItem('nombre',   user.nombre);
      await AsyncStorage.setItem('dpi',      dpi);
      await AsyncStorage.setItem('telefono', phone);
      await AsyncStorage.setItem('tipo',     user.rol);

      // Normalizar rol al nombre de ruta y disparar contexto
      const mapped = normalizeRole(user.rol);
      signIn(mapped);

    } catch (error) {
      console.error('Error en el registro:', error);
      const msg = error.response?.data?.error || 'Error al registrar usuario';
      alert(msg);
    }
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
            color: theme.text,
          },
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
            color: theme.text,
          },
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
            color: theme.text,
          },
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
            color: theme.text,
          },
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
            color: theme.text,
          },
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
            color: theme.text,
          },
        ]}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
      />

      <View style={{ width: '100%', marginBottom: 15 }}>
        <Text style={{ marginBottom: 8, color: theme.text, fontWeight: 'bold' }}>Tipo de usuario</Text>

        <TouchableOpacity
          style={[
            styles.input,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme.inputBackground,
              borderColor: isEmpty(tipoUsuario) ? 'red' : theme.inputBorder,
            },
          ]}
          onPress={() => setMostrarOpciones(!mostrarOpciones)}
        >
          <Text style={{ color: tipoUsuario ? theme.text : theme.secondaryText }}>
            {tipoUsuario || 'Selecciona un tipo'}
          </Text>
          <Ionicons name={mostrarOpciones ? 'chevron-up' : 'chevron-down'} size={20} color={theme.text} />
        </TouchableOpacity>

        {mostrarOpciones && (
          <View
            style={{
              marginTop: 8,
              backgroundColor: theme.inputBackground,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.inputBorder,
            }}
          >
            {opcionesTipo.map((opcion) => (
              <TouchableOpacity
                key={opcion}
                onPress={() => {
                  setTipoUsuario(opcion);
                  setMostrarOpciones(false);
                }}
                style={{ padding: 12 }}
              >
                <Text style={{ color: theme.text }}>{opcion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primaryButton }]} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarme</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, { color: theme.secondaryButton }]}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
        <Text style={[styles.termsLink, { color: theme.secondaryButton }]}>Términos y condiciones</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, marginBottom: 25, fontWeight: 'bold' },
  optional: { fontSize: 12, marginBottom: 4, alignSelf: 'flex-start', marginLeft: 5 },
  input: { width: '100%', padding: 12, marginBottom: 15, borderRadius: 8, borderWidth: 1 },
  errorInput: { borderColor: 'red' },
  button: { paddingVertical: 14, paddingHorizontal: 100, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16, textAlign: 'center' },
  link: { marginTop: 15, textDecorationLine: 'underline', fontSize: 14 },
  termsLink: { marginTop: 5, fontSize: 13 },
});
