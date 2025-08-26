// src/screens/LoginScreen.js
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';
import { useOffline } from '../context/OfflineContext';
import OfflineStorage from '../services/OfflineStorage';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PALETTE = {
  tangerine: '#F08C21',
  blush:     '#E36888',
  butter:    '#F2D88F',
  sea:       '#6698CC',
  cream:     '#FFF7DA',
};

export default function LoginScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { isConnected } = useOffline();

  const isEmpty = (val) => submitted && val.trim() === '';

  const normalizeRole = (rol) => (rol === 'ONG' ? 'Ong' : rol === 'Voluntario' ? 'Volunteer' : rol);

  // Cargar email guardado si el usuario marcó "Recordarme"
  useEffect(() => {
    (async () => {
      try {
        const savedRemember = await AsyncStorage.getItem('remember_me');
        const savedEmail    = await AsyncStorage.getItem('remember_email');
        if (savedRemember === 'true' && savedEmail) {
          setRemember(true);
          setEmail(savedEmail);
        }
      } catch {}
    })();
  }, []);

  // Restaurar sesión previa
  useEffect(() => {
    (async () => {
      try {
        const userData = await OfflineStorage.getUserData();
        if (userData?.rol) {
          const mapped = normalizeRole(userData.rol);
          signIn(mapped);
        }
      } catch {}
      setIsCheckingSession(false);
    })();
  }, []);

  const handleLogin = async () => {
    setSubmitted(true);
    if (!email.trim() || !password.trim()) {
      alert('Por favor llena todos los campos');
      return;
    }

    // Guardar/quitar email recordado
    try {
      await AsyncStorage.setItem('remember_me', remember ? 'true' : 'false');
      if (remember) await AsyncStorage.setItem('remember_email', email);
      else await AsyncStorage.removeItem('remember_email');
    } catch {}

    if (!isConnected) {
      try {
        const userData = await OfflineStorage.getUserData();
        if (userData?.email === email) {
          Alert.alert('Modo sin conexión', 'Has iniciado sesión en modo offline');
          signIn(normalizeRole(userData.rol));
          return;
        }
        Alert.alert('Error', 'Necesitas conexión para el primer inicio.');
        return;
      } catch {
        Alert.alert('Error', 'No se puede iniciar en modo offline');
        return;
      }
    }

    // 🔑 Intentar login online
    try {
      const payload = {
        email: email.trim().toLowerCase(), // normalizamos a minúsculas
        password: String(password),
      };

      const { data: user } = await axios.post('http://localhost:3001/api/auth/login', payload);

      if (!user?.rol) {
        Alert.alert('Error', 'El servidor no devolvió el rol del usuario.');
        return;
      }

      const safeSet = async (k, v) => {
        if (v !== undefined && v !== null) await AsyncStorage.setItem(k, String(v));
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
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Error desconocido';

      console.error('Error de login:', error?.response || error);
      Alert.alert('Error al iniciar sesión', serverMsg);
    }
  };

  const gotoOrAlert = (routeName, fallbackText) => {
    try { navigation.navigate(routeName); }
    catch { Alert.alert('Próximamente', fallbackText || 'Esta pantalla aún no está disponible.'); }
  };

  // Colores
  const bg       = isDarkMode ? theme.background    : PALETTE.butter;
  const cardBg   = isDarkMode ? theme.inputBackground : PALETTE.cream;
  const border   = isDarkMode ? theme.border : '#EAD8A6';
  const titleCol = isDarkMode ? theme.text : PALETTE.blush;
  const linkCol  = isDarkMode ? theme.secondaryButton : PALETTE.sea;
  const btnPrim  = isDarkMode ? theme.primaryButton : PALETTE.tangerine;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: bg }]} keyboardShouldPersistTaps="handled">
      <ThemeToggle />

      {/* decor */}
      <View style={[styles.blob, styles.blobTL, { backgroundColor: linkCol, opacity: 0.22 }]} />
      <View style={[styles.blob, styles.blobBR, { backgroundColor: titleCol, opacity: 0.18 }]} />
      <View style={[styles.leaf, { backgroundColor: linkCol, top: 110, left: 26, transform: [{ rotate: '-18deg'}]}]} />
      <View style={[styles.leaf, { backgroundColor: linkCol, top: 160, left: 64, transform: [{ rotate: '16deg'}]}]} />
      <View style={[styles.leaf, { backgroundColor: btnPrim, bottom: 70, right: 78, transform: [{ rotate: '-22deg'}]}]} />

      <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
        <Text style={[styles.title, { color: titleCol }]}>¡Bienvenido de nuevo!</Text>

        {!isConnected && (
          <View style={[styles.offlineIndicator, { backgroundColor: theme.error || '#E57373' }]}>
            <Text style={styles.offlineText}>Sin conexión</Text>
          </View>
        )}

        <TextInput
          style={[styles.input, { borderColor: border, backgroundColor: '#FFFFFF', color: theme.text }, isEmpty(email) && styles.errorInput]}
          placeholder="Correo electrónico"
          placeholderTextColor={theme.placeholder || '#98A2B3'}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { borderColor: border, backgroundColor: '#FFFFFF', color: theme.text }, isEmpty(password) && styles.errorInput]}
          placeholder="Contraseña"
          placeholderTextColor={theme.placeholder || '#98A2B3'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Recordarme + Recuperación */}
        <View style={styles.rowBetween}>
          <TouchableOpacity
            style={styles.remember}
            onPress={() => setRemember(!remember)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: remember }}
          >
            <MaterialIcons
              name={remember ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={remember ? linkCol : (isDarkMode ? theme.secondaryText : '#94A3B8')}
            />
            <Text style={[styles.rememberText, { color: theme.text }]}>Recordarme</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => gotoOrAlert('ForgotPassword', 'Habilita la pantalla "ForgotPassword" para continuar.')}>
            <Text style={[styles.smallLink, { color: linkCol }]}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: btnPrim }]} onPress={handleLogin} disabled={isCheckingSession}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.link, { color: linkCol }]}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  blob: { position: 'absolute', width: 260, height: 260, borderRadius: 90 },
  blobTL: { top: -70, left: -60, transform: [{ rotate: '18deg' }] },
  blobBR: { right: -70, bottom: -60, transform: [{ rotate: '-15deg' }] },
  leaf: { position: 'absolute', width: 26, height: 17, borderTopLeftRadius: 26, borderBottomRightRadius: 26, borderTopRightRadius: 4, borderBottomLeftRadius: 4 },

  card: {
    width: '100%', maxWidth: 520, borderRadius: RADIUS, padding: 22, borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  title: { fontSize: 26, marginBottom: 16, fontWeight: '800', textAlign: 'center' },

  offlineIndicator: { padding: 8, borderRadius: 10, marginBottom: 12 },
  offlineText: { color: 'white', fontWeight: '600', textAlign: 'center' },

  input: { width: '100%', paddingVertical: 14, paddingHorizontal: 16, marginBottom: 12, borderRadius: RADIUS, borderWidth: 1, fontSize: 15 },
  errorInput: { borderColor: '#E57373' },

  rowBetween: { width: '100%', marginTop: 4, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  remember: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { marginLeft: 8, fontSize: 14, fontWeight: '600' },
  smallLink: { fontSize: 12, textDecorationLine: 'underline', fontWeight: '700' },

  button: {
    paddingVertical: 14, borderRadius: RADIUS, marginTop: 10,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16, textAlign: 'center', letterSpacing: 0.3 },

  link: { marginTop: 14, textDecorationLine: 'underline', fontSize: 14, textAlign: 'center', fontWeight: '600' },
});
