// src/screens/RegisterCommunityScreen.js (actualizado para i18n)
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export default function RegisterCommunityScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dpi, setDpi] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [esLider, setEsLider] = useState(false);
  const [comunidades, setComunidades] = useState([]);
  const [mostrarComunidades, setMostrarComunidades] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmpty = (value) => submitted && value.trim() === '';

  useEffect(() => {
    const fetchComunidades = async () => {
      try {
        const response = await axios.get('//localhost:3001/api/comunidades');
        setComunidades(response.data);
      } catch (error) {
        console.error('Error cargando comunidades:', error);
        setComunidades([
          { id_comunidad: 1, nombre_comunidad: 'San Gaspar Ixchil' },
          { id_comunidad: 2, nombre_comunidad: 'Santa Bárbara' },
          { id_comunidad: 3, nombre_comunidad: 'Huehuetenango' },
          { id_comunidad: 4, nombre_comunidad: 'Cahabón' },
          { id_comunidad: 5, nombre_comunidad: 'Colotenango' },
          { id_comunidad: 6, nombre_comunidad: 'Lanquín' }
        ]);
      }
    };
    fetchComunidades();
  }, []);

  const handleRegister = async () => {
    setSubmitted(true);

    if (!nombre || !apellido || !dpi || !comunidad || !password || !confirmPassword) {
      Alert.alert(t('alerts.errorTitle'), t('alerts.required'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('alerts.errorTitle'), t('alerts.passwordMismatch'));
      return;
    }

    if (dpi.length !== 13 || isNaN(dpi)) {
      Alert.alert(t('alerts.errorTitle'), t('alerts.dpiInvalid'));
      return;
    }

    setLoading(true);
    try {
      const comunidadSeleccionada = comunidades.find(c => c.nombre_comunidad === comunidad);
      const id_comunidad = comunidadSeleccionada?.id_comunidad || 1;

      const userData = {
        nombre,
        apellido,
        dpi,
        telefono,
        email: email || `${dpi}@raicesdevida.app`,
        password,
        // IMPORTANTE: mantén estos valores tal cual si el backend los espera en español
        rol: esLider ? 'Lider Comunitario' : 'Miembro Comunidad',
        tipo_referencia: 'Comunidad',
        id_referencia: id_comunidad
      };

      await axios.post('//localhost:3001/api/auth/register/community', userData);

      Alert.alert(
        t('alerts.registerSuccessTitle'),
        t('alerts.registerSuccessMsg'),
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('Error en el registro:', error);
      let errorMessage = t('alerts.registerGenericError');
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = t('alerts.duplicate');
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      Alert.alert(t('alerts.errorTitle'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <ThemeToggle />

        <Text style={[styles.title, { color: theme.text }]}>{t('screens.registerCommunity.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {t('screens.registerCommunity.subtitle')}
        </Text>

        {/* Nombre */}
        <Text style={[styles.label, { color: theme.text }]}>{t('fields.firstName')}</Text>
        <View style={[
          styles.inputBox,
          isEmpty(nombre) && styles.errorInput,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={nombre}
            onChangeText={setNombre}
            placeholder={t('placeholders.firstName')}
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Apellido */}
        <Text style={[styles.label, { color: theme.text }]}>{t('fields.lastName')}</Text>
        <View style={[
          styles.inputBox,
          isEmpty(apellido) && styles.errorInput,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={apellido}
            onChangeText={setApellido}
            placeholder={t('placeholders.lastName')}
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* DPI */}
        <Text style={[styles.label, { color: theme.text }]}>{t('fields.dpi')}</Text>
        <View style={[
          styles.inputBox,
          isEmpty(dpi) && styles.errorInput,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={dpi}
            onChangeText={setDpi}
            placeholder={t('placeholders.dpi')}
            keyboardType="numeric"
            maxLength={13}
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Teléfono */}
        <Text style={[styles.label, { color: theme.text }]}>{t('fields.phone')}</Text>
        <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={telefono}
            onChangeText={setTelefono}
            placeholder={t('placeholders.phone')}
            keyboardType="phone-pad"
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Email (opcional) */}
        <Text style={[styles.label, { color: theme.text }]}>{t('fields.emailOpt')}</Text>
        <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={email}
            onChangeText={setEmail}
            placeholder={t('placeholders.email')}
            keyboardType="email-address"
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Contraseña */}
        <Text style={[styles.label, { color: theme.text }]}>{t('fields.password')}</Text>
        <View style={[
          styles.inputBox,
          isEmpty(password) && styles.errorInput,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={password}
            onChangeText={setPassword}
            placeholder={t('placeholders.password')}
            secureTextEntry
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Confirmar Contraseña */}
        <Text style={[styles.label, { color: theme.text }]}>{t('fields.confirmPassword')}</Text>
        <View style={[
          styles.inputBox,
          isEmpty(confirmPassword) && styles.errorInput,
          { backgroundColor: theme.inputBackground }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('placeholders.confirmPassword')}
            secureTextEntry
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        {/* Comunidad (dropdown simple) */}
        <Text style={[styles.label, { color: theme.text }]}>{t('fields.community')}</Text>
        <TouchableOpacity
          style={[
            styles.dropdownBox,
            isEmpty(comunidad) && styles.errorInput,
            { backgroundColor: theme.inputBackground }
          ]}
          onPress={() => setMostrarComunidades(!mostrarComunidades)}
        >
          <Text style={[styles.dropdownText, { color: comunidad ? theme.text : theme.secondaryText }]}>
            {comunidad || t('fields.selectCommunity')}
          </Text>
          <Ionicons name={mostrarComunidades ? 'chevron-up' : 'chevron-down'} size={20} color={theme.text} />
        </TouchableOpacity>

        {mostrarComunidades && (
          <View style={[styles.optionGroup, { backgroundColor: theme.inputBackground }]}>
            {comunidades.map((item) => (
              <TouchableOpacity
                key={item.id_comunidad}
                onPress={() => {
                  setComunidad(item.nombre_comunidad);
                  setMostrarComunidades(false);
                }}
              >
                <Text style={[styles.option, { color: theme.text }]}>{item.nombre_comunidad}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Checkbox para Líder Comunitario */}
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setEsLider(!esLider)}>
          <Ionicons
            name={esLider ? 'checkbox-outline' : 'square-outline'}
            size={24}
            color={theme.secondaryButton}
          />
          <Text style={[styles.checkboxText, { color: theme.text }]}>{t('checkbox.isLeader')}</Text>
        </TouchableOpacity>

        {/* Botón de registro */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.secondaryButton }, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? t('buttons.processing') : t('buttons.register')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: theme.secondaryButton }]}>{t('buttons.login')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
          <Text style={[styles.termsLink, { color: theme.secondaryButton }]}>{t('buttons.terms')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    paddingTop: 90,
    paddingBottom: 40
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    marginLeft: 4
  },
  inputBox: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16
  },
  errorInput: {
    borderWidth: 1,
    borderColor: '#FF3B30'
  },
  dropdownBox: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    height: 48
  },
  dropdownText: {
    fontSize: 16
  },
  optionGroup: {
    borderRadius: 8,
    padding: 10,
    marginTop: -14,
    marginBottom: 16,
    maxHeight: 200
  },
  option: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 5
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 10
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  termsLink: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13
  }
});
