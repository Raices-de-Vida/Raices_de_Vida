import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import OfflineStorage from '../services/OfflineStorage';
import { useTranslation } from 'react-i18next';

const PALETTE = {
  butter: '#F2D88F',
  cream:  '#FFF7DA',
  sea:    '#6698CC',
};

export default function PerfilScreen({ navigation }) {
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('Perfil');

  useEffect(() => {
    const cargarDatos = async () => {
      const uriGuardado = await AsyncStorage.getItem('fotoPerfil');
      if (uriGuardado) setFotoPerfil(uriGuardado);

      let firstName = '';
      let userRole = '';
      try {
        const userData = await OfflineStorage.getUserData();
        if (userData?.nombre) firstName = userData.nombre.split(' ')[0];
        if (userData?.rol) userRole = userData.rol;
      } catch {}

      if (!firstName) {
        const nombreRegistro = await AsyncStorage.getItem('nombre');
        if (nombreRegistro) firstName = nombreRegistro.split(' ')[0];
      }
      if (!userRole) {
        const tipoRegistro = await AsyncStorage.getItem('tipo');
        if (tipoRegistro) userRole = tipoRegistro;
      }

      if (firstName) setName(firstName);
      if (userRole) setRole(userRole);
    };

    cargarDatos();
  }, []);

  const seleccionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert(t('gallery.permission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFotoPerfil(uri);
      await AsyncStorage.setItem('fotoPerfil', uri);
    }
  };

  const eliminarFoto = async () => {
    await AsyncStorage.removeItem('fotoPerfil');
    setFotoPerfil(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : PALETTE.butter }}>
      {/* ===== Top Bar estilo tarjeta ===== */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDarkMode ? theme.inputBackground : PALETTE.cream,
            borderColor: theme.border || '#F1E7C6',
          },
        ]}
      >
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <Image
            source={isDarkMode ? require('../styles/logos/LogoDARK.png') : require('../styles/logos/LogoBRIGHT.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View>
            <Text style={[styles.topTitle, { color: theme.text }]}>{t('top.title')}</Text>
            <Text style={[styles.topSubtitle, { color: isDarkMode ? theme.secondaryText : PALETTE.sea }]}>
              {t('top.subtitle')}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={toggleDarkMode} style={styles.toggleButton} activeOpacity={0.7}>
          <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* ===== Contenido ===== */}
      <View style={styles.pagePadding}>
        {/* Avatar */}
        <View style={[styles.avatarWrapper, { backgroundColor: isDarkMode ? '#555' : '#E7E3D0' }]}>
          <TouchableOpacity style={styles.avatarContainer} onPress={seleccionarFoto} activeOpacity={0.85}>
            {fotoPerfil ? (
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={72} color={theme.text} />
            )}
          </TouchableOpacity>
        </View>

        {fotoPerfil && (
          <TouchableOpacity onPress={eliminarFoto} style={styles.deletePhotoBtn} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.deletePhotoTxt}>{t('buttons.deletePhoto')}</Text>
          </TouchableOpacity>
        )}

        {/* Nombre y Rol */}
        <Text style={[styles.nameText, { color: theme.text }]}>{name || t('placeholders.name')}</Text>
        <Text style={[styles.roleText, { color: theme.secondaryText }]}>{role || t('placeholders.role')}</Text>

        {/* Tarjetas de opciones */}
        <View style={styles.cardsBlock}>
          <TouchableOpacity
            style={[
              styles.infoCard,
              { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder || 'rgba(0,0,0,0.06)' }
            ]}
            onPress={() => navigation.navigate('DatosUsuario')}
            activeOpacity={0.85}
          >
            <Ionicons name="information-circle-outline" size={26} color={theme.text} style={styles.infoIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>{t('cards.userData.title')}</Text>
              <Text style={[styles.infoSubtitle, { color: theme.secondaryText }]}>{t('cards.userData.subtitle')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.infoCard,
              { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder || 'rgba(0,0,0,0.06)' }
            ]}
            onPress={() => navigation.navigate('Configuracion')}
            activeOpacity={0.85}
          >
            <Ionicons name="settings-outline" size={26} color={theme.text} style={styles.infoIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>{t('cards.settings.title')}</Text>
              <Text style={[styles.infoSubtitle, { color: theme.secondaryText }]}>{t('cards.settings.subtitle')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
          </TouchableOpacity>

          {/* NUEVA tarjeta: Registrar paciente */}
          <TouchableOpacity
            style={[
              styles.infoCard,
              { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder || 'rgba(0,0,0,0.06)' }
            ]}
            onPress={() => navigation.navigate('PacienteForm')}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={26} color={theme.text} style={styles.infoIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>{t('cards.register.title')}</Text>
              <Text style={[styles.infoSubtitle, { color: theme.secondaryText }]}>{t('cards.register.subtitle')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
          </TouchableOpacity>
        </View>
      </View>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const RADIUS = 16;

const styles = StyleSheet.create({
  topBar: {
    height: 72,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  leftGroup: { flexDirection: 'row', alignItems: 'center' },
  backButton: { padding: 8, borderRadius: 10, marginRight: 6 },
  logo: { width: 36, height: 36, marginRight: 10, borderRadius: 8 },
  topTitle: { fontSize: 20, fontWeight: '800', lineHeight: 22 },
  topSubtitle: { marginTop: 2, fontSize: 12, fontWeight: '700' },
  toggleButton: { padding: 6, borderRadius: 10 },

  pagePadding: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 110, alignItems: 'center' },

  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  avatarContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  deletePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#EC5A5A',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 8,
  },
  deletePhotoTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },

  nameText: { fontSize: 18, fontWeight: '800', marginTop: 6 },
  roleText: { fontSize: 13, marginBottom: 22, fontWeight: '600' },

  cardsBlock: { width: '100%', gap: 14 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIcon: { width: 30, textAlign: 'center' },
  infoTitle: { fontSize: 16, fontWeight: '800' },
  infoSubtitle: { fontSize: 13, marginTop: 2 },
});
