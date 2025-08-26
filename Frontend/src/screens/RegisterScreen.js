// src/screens/RegisterScreen.js
import axios from 'axios';
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

const PALETTE = {
  tangerine: '#F08C21',
  blush:     '#E36888',
  butter:    '#F2D88F',
  sea:       '#6698CC',
  cream:     '#FFF7DA',
};

export default function RegisterScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);

  // NUEVO: nombre y apellido separados
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');

  const [phone, setPhone] = useState('');
  const [dpi,   setDpi]   = useState('');
  const [email, setEmail] = useState('');
  const [password,         setPassword]         = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [submitted,        setSubmitted]        = useState(false);
  const [tipoUsuario,      setTipoUsuario]      = useState('');
  const [mostrarOpciones,  setMostrarOpciones]  = useState(false);
  const opcionesTipo = ['ONG', 'Voluntario', 'Lider Comunitario'];

  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const isEmpty = (val) => submitted && val.trim() === '';

  const normalizeRole = (rol) => (rol === 'ONG' ? 'Ong' : rol === 'Voluntario' ? 'Volunteer' : rol);

  // helpers para restringir a dígitos y tope de longitud
  const onlyDigits = (s) => s.replace(/\D/g, '');
  const onChangeDpi   = (t) => setDpi( onlyDigits(t).slice(0, 13) );
  const onChangePhone = (t) => setPhone( onlyDigits(t).slice(0, 8) );

  const handleRegister = async () => {
    setSubmitted(true);

    // Validaciones de campos requeridos
    if (!(firstName.trim() && lastName.trim() && phone.trim() && dpi.trim() &&
          (email.trim() || dpi.trim()) && password.trim() && confirmPassword.trim() && tipoUsuario)) {
      alert('Por favor llena todos los campos'); return;
    }

    // Validaciones de formato
    if (dpi.length !== 13) {
      alert('El DPI debe tener exactamente 13 dígitos.');
      return;
    }
    if (phone.length !== 8) {
      alert('El teléfono debe tener 8 dígitos.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const { data: user } = await axios.post('http://localhost:3001/api/auth/register', {
        nombre: firstName,
        apellido: lastName,
        email,
        password,
        rol: tipoUsuario,
        tipo_referencia: tipoUsuario,
        id_referencia: 1,
      });

      await AsyncStorage.setItem('nombre',   user.nombre ?? `${firstName} ${lastName}`);
      await AsyncStorage.setItem('dpi',      dpi);
      await AsyncStorage.setItem('telefono', phone);
      await AsyncStorage.setItem('tipo',     user.rol);

      signIn(normalizeRole(user.rol));
    } catch (error) {
      console.error('Error en el registro:', error);
      const msg = error.response?.data?.error || 'Error al registrar usuario';
      alert(msg);
    }
  };

  // Colores/UI
  const bg       = isDarkMode ? theme.background       : PALETTE.butter;
  const cardBg   = isDarkMode ? theme.inputBackground  : PALETTE.cream;
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

      <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
        <Text style={[styles.title, { color: titleCol }]}>Crear cuenta</Text>

        {/* Nombres en dos columnas (responsivo: se apilan si no cabe) */}
        <View style={styles.rowWrap}>
          <TextInput
            style={[
              styles.inputHalf,
              { borderColor: border, backgroundColor: '#FFFFFF', color: theme.text },
              isEmpty(firstName) && styles.errorInput
            ]}
            placeholder="Nombre"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor={theme.placeholder || '#98A2B3'}
          />
          <TextInput
            style={[
              styles.inputHalf,
              { borderColor: border, backgroundColor: '#FFFFFF', color: theme.text },
              isEmpty(lastName) && styles.errorInput,
              { marginRight: 0 }
            ]}
            placeholder="Apellido"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor={theme.placeholder || '#98A2B3'}
          />
        </View>

        <TextInput
          style={[
            styles.input,
            { borderColor: border, backgroundColor: '#FFFFFF', color: theme.text },
            isEmpty(phone) && styles.errorInput
          ]}
          placeholder="Teléfono (8 dígitos)"
          value={phone}
          onChangeText={onChangePhone}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          placeholderTextColor={theme.placeholder || '#98A2B3'}
          maxLength={8}
        />

        <TextInput
          style={[
            styles.input,
            { borderColor: border, backgroundColor: '#FFFFFF', color: theme.text },
            isEmpty(dpi) && styles.errorInput
          ]}
          placeholder="DPI (13 dígitos)"
          value={dpi}
          onChangeText={onChangeDpi}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          placeholderTextColor={theme.placeholder || '#98A2B3'}
          maxLength={13}
        />

        <Text style={styles.optional}>O ingresa tu correo electrónico</Text>

        <TextInput
          style={[
            styles.input,
            { borderColor: border, backgroundColor: '#FFFFFF', color: theme.text },
            isEmpty(email) && styles.errorInput
          ]}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={theme.placeholder || '#98A2B3'}
        />

        <TextInput
          style={[
            styles.input,
            { borderColor: border, backgroundColor: '#FFFFFF', color: theme.text },
            isEmpty(password) && styles.errorInput
          ]}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={theme.placeholder || '#98A2B3'}
        />

        <TextInput
          style={[
            styles.input,
            { borderColor: border, backgroundColor: '#FFFFFF', color: theme.text },
            isEmpty(confirmPassword) && styles.errorInput
          ]}
          placeholder="Confirmar contraseña"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor={theme.placeholder || '#98A2B3'}
        />

        <View style={{ width: '100%', marginBottom: 14 }}>
          <Text style={styles.selectLabel}>Tipo de usuario</Text>

          <TouchableOpacity
            style={[styles.input, styles.select, { borderColor: border, backgroundColor: '#FFFFFF' }]}
            onPress={() => setMostrarOpciones(!mostrarOpciones)}
          >
            <Text style={{ color: tipoUsuario ? theme.text : (theme.placeholder || '#98A2B3') }}>
              {tipoUsuario || 'Selecciona un tipo'}
            </Text>
            <Ionicons name={mostrarOpciones ? 'chevron-up' : 'chevron-down'} size={20} color={theme.text} style={{ position: 'absolute', right: 16 }} />
          </TouchableOpacity>

          {mostrarOpciones && (
            <View style={[styles.dropdown, { borderColor: border, backgroundColor: '#FFFFFF' }]}>
              {opcionesTipo.map((opcion) => (
                <TouchableOpacity
                  key={opcion}
                  onPress={() => { setTipoUsuario(opcion); setMostrarOpciones(false); }}
                  style={styles.dropdownItem}
                >
                  <Text style={{ color: theme.text }}>{opcion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: btnPrim }]} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarme</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: linkCol }]}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
          <Text style={[styles.termsLink, { color: linkCol }]}>Términos y condiciones</Text>
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

  card: {
    width: '100%', maxWidth: 520, borderRadius: RADIUS, padding: 22, borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  title: { fontSize: 26, marginBottom: 10, fontWeight: '800', textAlign: 'center' },
  optional: { fontSize: 12, marginBottom: 6, alignSelf: 'flex-start', marginLeft: 6, color: '#667085' },

  // inputs
  input: { width: '100%', paddingVertical: 14, paddingHorizontal: 16, marginBottom: 14, borderRadius: RADIUS, borderWidth: 1, fontSize: 15 },
  errorInput: { borderColor: '#E57373' },

  // fila nombres
  rowWrap: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  inputHalf: {
    flexGrow: 1,
    flexBasis: '48%',
    marginRight: '4%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS,
    borderWidth: 1,
    fontSize: 15,
  },

  selectLabel: { marginBottom: 8, fontWeight: '700' },
  select: { flexDirection: 'row', alignItems: 'center', paddingRight: 40 },
  dropdown: { marginTop: 8, borderRadius: RADIUS, borderWidth: 1, overflow: 'hidden' },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1E7C6' },

  button: {
    paddingVertical: 14, borderRadius: RADIUS, marginTop: 6,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16, textAlign: 'center', letterSpacing: 0.3 },
  link: { marginTop: 14, textDecorationLine: 'underline', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  termsLink: { marginTop: 6, fontSize: 13, textAlign: 'center', fontWeight: '600' },
});
