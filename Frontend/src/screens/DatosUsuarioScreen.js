// src/screens/DatosUsuarioScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useFocusEffect } from '@react-navigation/native';
import ThemeToggle from '../components/ThemeToggle';

const PALETTE = { butter: '#F2D88F', cream: '#FFF7DA', sea: '#6698CC' };

export default function DatosUsuarioScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const cargarUsuario = async () => {
        setLoading(true);
        try {
          const nombre = await AsyncStorage.getItem('nombre');
          const dpi = await AsyncStorage.getItem('dpi');
          const telefono = await AsyncStorage.getItem('telefono');
          const tipo = await AsyncStorage.getItem('tipo');
          const foto = await AsyncStorage.getItem('fotoPerfil');

          setUser({
            nombre: nombre || 'Nombre no disponible',
            dpi: dpi || '---',
            telefono: telefono || '---',
            tipo: tipo || '---',
            foto: foto || null,
          });
        } catch (error) {
          console.error('Error al cargar datos del usuario', error);
        } finally {
          setLoading(false);
        }
      };
      cargarUsuario();
    }, [])
  );

  if (loading || !user) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : PALETTE.butter, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primaryButton || 'green'} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Cargando datos...</Text>
      </View>
    );
  }

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
            <Text style={[styles.topTitle, { color: theme.text }]}>Datos de usuario</Text>
            <Text style={[styles.topSubtitle, { color: PALETTE.sea }]}>Tu información personal</Text>
          </View>
        </View>

        <ThemeToggle />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.avatarWrapper}>
          {user.foto ? (
            <Image source={{ uri: user.foto }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={120} color={theme.secondaryText} />
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.name, { color: theme.text }]}>{user.nombre}</Text>
          <Text style={[styles.role, { color: theme.secondaryText }]}>{user.tipo}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.label, { color: theme.text }]}>DPI: {user.dpi}</Text>
          <Text style={[styles.label, { color: theme.text }]}>Teléfono: {user.telefono}</Text>
        </View>
      </View>
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
  container: { flex: 1 },
  content: { flex: 1, padding: 20, paddingBottom: 40 },
  avatarWrapper: { alignItems: 'center', marginVertical: 20 },
  avatarImage: { width: 120, height: 120, borderRadius: 60, resizeMode: 'cover' },
  card: {
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  role: { fontSize: 14 },
  label: { fontSize: 15, marginVertical: 4 },
});
