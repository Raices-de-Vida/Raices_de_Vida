import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useFocusEffect } from '@react-navigation/native';

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
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="green" />
        <Text style={{ color: theme.text, marginTop: 10 }}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header con botón de regreso */}
      <View style={[styles.header, { backgroundColor: theme.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Datos de usuario</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        {user.foto ? (
          <Image source={{ uri: user.foto }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person-circle-outline" size={120} color={theme.secondaryText} />
        )}
      </View>

      {/* Datos básicos */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.name, { color: theme.text }]}>{user.nombre}</Text>
        <Text style={[styles.role, { color: theme.secondaryText }]}>{user.tipo}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.label, { color: theme.text }]}>DPI: {user.dpi}</Text>
        <Text style={[styles.label, { color: theme.text }]}>Teléfono: {user.telefono}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 80,
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 30,
    marginVertical: 10,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 14,
  },
  label: {
    fontSize: 15,
    marginVertical: 4,
  },
});
