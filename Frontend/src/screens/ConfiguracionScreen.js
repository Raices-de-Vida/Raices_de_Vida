// src/screens/ConfiguracionScreen.js
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const PALETTE = { butter: '#F2D88F', cream: '#FFF7DA', sea: '#6698CC' };
const LANG_OPTIONS = ['es', 'en'];                // 👈 solo Español e English
const REGION_OPTIONS = ['north', 'south', 'west'];

export default function ConfiguracionScreen({ navigation }) {
  const [mostrarIdiomas, setMostrarIdiomas] = useState(false);
  const [mostrarRegiones, setMostrarRegiones] = useState(false);
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState(null); // 'es' | 'en'
  const [regionSeleccionada, setRegionSeleccionada] = useState(null); // 'north' | ...

  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { signOut } = useContext(AuthContext);
  const { t, i18n } = useTranslation('Configuracion');

  // Refleja el idioma actual al abrir la pantalla
  useEffect(() => {
    setIdiomaSeleccionado(i18n.language === 'en' ? 'en' : 'es');
  }, [i18n.language]);

  const cerrarSesion = async () => {
    try {
      await signOut();
    } catch {
      Alert.alert(t('alerts.signOutErrorTitle'), t('alerts.signOutErrorMsg'));
    }
  };

  // 🔤 Cambia el idioma global y persiste preferencia
  const onSelectIdioma = async (code) => {
    setIdiomaSeleccionado(code);
    setMostrarIdiomas(false);
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem('app_language', code);
  };

  const langLabel = (code) => t(`sections.language.options.${code}`);
  const regionLabel = (code) => t(`sections.region.options.${code}`);

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : PALETTE.butter }}>
      {/* Top bar tipo píldora */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDarkMode ? theme.inputBackground : PALETTE.cream,
            borderColor: theme.border || '#EADFBF',
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Image
            source={
              isDarkMode
                ? require('../styles/logos/LogoDARK.png')
                : require('../styles/logos/LogoBRIGHT.png')
            }
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.topTitle, { color: theme.text }]}>{t('top.title')}</Text>
            <Text style={[styles.topSubtitle, { color: PALETTE.sea }]}>{t('top.subtitle')}</Text>
          </View>
        </View>

        <ThemeToggle />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Idioma */}
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.cardBackground }]}
          onPress={() => setMostrarIdiomas(!mostrarIdiomas)}
          activeOpacity={0.8}
        >
          <Ionicons name="language-outline" size={22} color="green" />
          <Text style={[styles.optionText, { color: theme.text }]}>
            {t('sections.language.title')}
            {idiomaSeleccionado
              ? t('sections.language.selectedSuffix', { value: langLabel(idiomaSeleccionado) })
              : ''}
          </Text>
          <Ionicons
            name={mostrarIdiomas ? 'chevron-up' : 'chevron-forward'}
            size={20}
            color={theme.secondaryText}
            style={{ marginLeft: 'auto' }}
          />
        </TouchableOpacity>

        {mostrarIdiomas && (
          <View style={[styles.dropdown, { backgroundColor: theme.inputBackground }]}>
            {LANG_OPTIONS.map((code) => (
              <TouchableOpacity key={code} onPress={() => onSelectIdioma(code)}>
                <Text
                  style={[
                    styles.dropdownText,
                    {
                      color: idiomaSeleccionado === code ? 'green' : theme.text,
                      fontWeight: idiomaSeleccionado === code ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {langLabel(code)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Región */}
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.cardBackground }]}
          onPress={() => setMostrarRegiones(!mostrarRegiones)}
          activeOpacity={0.8}
        >
          <Ionicons name="location-outline" size={22} color="green" />
          <Text style={[styles.optionText, { color: theme.text }]}>
            {t('sections.region.title')}
            {regionSeleccionada
              ? t('sections.region.selectedSuffix', { value: regionLabel(regionSeleccionada) })
              : ''}
          </Text>
          <Ionicons
            name={mostrarRegiones ? 'chevron-up' : 'chevron-forward'}
            size={20}
            color={theme.secondaryText}
            style={{ marginLeft: 'auto' }}
          />
        </TouchableOpacity>

        {mostrarRegiones && (
          <View style={[styles.dropdown, { backgroundColor: theme.inputBackground }]}>
            {REGION_OPTIONS.map((code) => (
              <TouchableOpacity key={code} onPress={() => setRegionSeleccionada(code)}>
                <Text
                  style={[
                    styles.dropdownText,
                    {
                      color: regionSeleccionada === code ? 'green' : theme.text,
                      fontWeight: regionSeleccionada === code ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {regionLabel(code)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Organizaciones */}
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.cardBackground }]}
          activeOpacity={0.8}
        >
          <Ionicons name="people-outline" size={22} color="green" />
          <Text style={[styles.optionText, { color: theme.text }]}>{t('sections.organizations')}</Text>
        </TouchableOpacity>

        {/* Cambiar contraseña */}
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.cardBackground }]}
          onPress={() => navigation.navigate('CambiarContrasena')}
          activeOpacity={0.8}
        >
          <Ionicons name="lock-closed-outline" size={22} color="green" />
          <Text style={[styles.optionText, { color: theme.text }]}>{t('sections.changePassword')}</Text>
        </TouchableOpacity>

        {/* Cerrar sesión */}
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.cardBackground }]}
          onPress={cerrarSesion}
          activeOpacity={0.8}
        >
          <MaterialIcons name="logout" size={22} color="green" />
          <Text style={[styles.optionText, { color: theme.text }]}>{t('sections.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Top bar
  topBar: {
    height: 72,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logo: { width: 34, height: 34, marginRight: 10, borderRadius: 8 },
  topTitle: { fontSize: 20, fontWeight: '800', lineHeight: 22 },
  topSubtitle: { marginTop: 4, fontSize: 12, fontWeight: '700' },

  // Contenido
  container: { padding: 20, paddingBottom: 120 },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  optionText: { fontSize: 16, fontWeight: '600', marginLeft: 10 },
  dropdown: { borderRadius: 12, padding: 12, marginBottom: 12 },
  dropdownText: { fontSize: 15, marginVertical: 6 },
});
