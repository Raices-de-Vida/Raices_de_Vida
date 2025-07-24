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

export default function PerfilScreen({ navigation }) {
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    const cargarDatos = async () => {
      // 1) Foto de perfil
      const uriGuardado = await AsyncStorage.getItem('fotoPerfil');
      if (uriGuardado) {
        setFotoPerfil(uriGuardado);
      }

      // 2) Intentar leer desde OfflineStorage (login)
      let firstName = '';
      let userRole = '';
      try {
        const userData = await OfflineStorage.getUserData();
        if (userData?.nombre) {
          firstName = userData.nombre.split(' ')[0];
        }
        if (userData?.rol) {
          userRole = userData.rol;
        }
      } catch (err) {
        // No había datos en OfflineStorage
      }

      // 3) Si no viene de login, leer desde AsyncStorage (register)
      if (!firstName) {
        const nombreRegistro = await AsyncStorage.getItem('nombre');
        if (nombreRegistro) {
          firstName = nombreRegistro.split(' ')[0];
        }
      }
      if (!userRole) {
        const tipoRegistro = await AsyncStorage.getItem('tipo');
        if (tipoRegistro) {
          userRole = tipoRegistro;
        }
      }

      // 4) Setear en estado
      if (firstName) setName(firstName);
      if (userRole) setRole(userRole);
    };

    cargarDatos();
  }, []);

  const seleccionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesita permiso para acceder a la galería');
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.header }]}>
        <Text style={[styles.headerText, { color: theme.text }]}>Perfil</Text>
      </View>

      <View style={[styles.avatarWrapper, { backgroundColor: isDarkMode ? '#666' : '#e0e0e0' }]}>
        <TouchableOpacity style={styles.avatarContainer} onPress={seleccionarFoto}>
          {fotoPerfil ? (
            <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={64} color={theme.text} />
          )}
        </TouchableOpacity>
      </View>

      {fotoPerfil && (
        <TouchableOpacity onPress={eliminarFoto} style={{ marginBottom: 10 }}>
          <Ionicons name="trash-outline" size={28} color="red" />
        </TouchableOpacity>
      )}

      <Text style={[styles.nameText, { color: theme.text }]}>
        {name || 'Nombre'}
      </Text>
      <Text style={[styles.roleText, { color: theme.secondaryText }]}>
        {role || 'Rol de usuario'}
      </Text>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={[styles.infoCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('DatosUsuario')}
        >
          <Ionicons name="information-circle-outline" size={30} color={theme.text} style={styles.infoIcon} />
          <View>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Datos de usuario</Text>
            <Text style={[styles.infoSubtitle, { color: theme.secondaryText }]}>Información del perfil</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.infoCard, { backgroundColor: isDarkMode ? '#2c2c2c' : '#f9f9f9' }]}
          onPress={() => navigation.navigate('Configuracion')}
        >
          <Ionicons name="settings-outline" size={30} color={theme.text} style={styles.infoIcon} />
          <View>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Configuración</Text>
            <Text style={[styles.infoSubtitle, { color: theme.secondaryText }]}>Ajustes de la app</Text>
          </View>
        </TouchableOpacity>
      </View>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    width: '100%',
    height: 80,
    paddingVertical: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  roleText: {
    fontSize: 14,
    marginBottom: 30,
  },
  cardContainer: {
    width: '100%',
    gap: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoIcon: {
    width: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSubtitle: {
    fontSize: 13,
  },
});
