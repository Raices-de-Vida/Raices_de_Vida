// src/screens/LoginScreen.js
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { isConnected } = useOffline();

  const isEmpty = (val) => submitted && val.trim() === '';

  useEffect(() => {
    (async () => {
      try {
        const userData = await OfflineStorage.getUserData();
        if (userData?.rol) {
          signIn(userData.rol);
        }
      } catch {}
      setIsCheckingSession(false);
    })();
  }, []);

  const handleLogin = async () => {
    console.log('🔑 handleLogin disparado');
    setSubmitted(true);

    if (!email.trim() || !password.trim()) {
      alert('Por favor llena todos los campos');
      return;
    }

    const normalizeRole = (rol) => {
      if (rol === 'ONG') return 'Ong';
      if (rol === 'Voluntario') return 'Volunteer';
      return rol;
    };

    if (!isConnected) {
      try {
        const userData = await OfflineStorage.getUserData();
        if (userData?.email === email) {
          Alert.alert('Modo sin conexión', 'Has iniciado sesión en modo offline');
          const mapped = normalizeRole(userData.rol);
          signIn(mapped);
          return;
        } else {
          Alert.alert('Error', 'Necesitas conexión para el primer inicio.');
          return;
        }
      } catch {
        Alert.alert('Error', 'No se puede iniciar en modo offline');
        return;
      }
    }

    try {
      const { data: user } = await axios.post(
        'http://localhost:3001/api/auth/login',
        { email, password }
      );

      // Guardar datos en AsyncStorage de forma segura
      const safeSet = async (key, value) => {
        if (value !== undefined && value !== null) {
          await AsyncStorage.setItem(key, String(value));
        }
      };

      await safeSet('nombre', user.nombre);
      await safeSet('dpi', user.dpi);
      await safeSet('telefono', user.telefono);
      await safeSet('tipo', user.rol);
      await safeSet('fotoPerfil', user.fotoPerfil);

      await OfflineStorage.saveUserData(user);

      const mapped = normalizeRole(user.rol);
      signIn(mapped);

    } catch (error) {
      console.error('Error de login:', error);
      Alert.alert('Error', 'Credenciales incorrectas o problema de conexión');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <ThemeToggle />
      <Text style={[styles.title, { color: theme.text }]}>Iniciar Sesión</Text>
      {!isConnected && (
        <View style={[styles.offlineIndicator, { backgroundColor: theme.error }]}>
          <Text style={styles.offlineText}>Sin conexión</Text>
        </View>
      )}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
          isEmpty(email) && styles.errorInput,
        ]}
        placeholder="Correo electrónico"
        placeholderTextColor={theme.placeholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border },
          isEmpty(password) && styles.errorInput,
        ]}
        placeholder="Contraseña"
        placeholderTextColor={theme.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primaryButton }]}
        onPress={handleLogin}
        disabled={isCheckingSession}
      >
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={[styles.link, { color: theme.secondaryButton }]}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, marginBottom: 25, fontWeight: 'bold' },
  offlineIndicator: { padding: 8, borderRadius: 4, marginBottom: 20 },
  offlineText: { color: 'white', fontWeight: '500' },
  input: { width: '100%', padding: 12, marginBottom: 15, borderRadius: 8, borderWidth: 1 },
  errorInput: { borderColor: 'red' },
  button: { paddingVertical: 14, paddingHorizontal: 100, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16, textAlign: 'center' },
  link: { marginTop: 15, textDecorationLine: 'underline', fontSize: 14 },
});
