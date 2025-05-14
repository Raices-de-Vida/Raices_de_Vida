import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import BottomNav from '../components/BottomNav';

export default function ConfiguracionScreen({ navigation }) {
  const [mostrarIdiomas, setMostrarIdiomas] = useState(false);
  const [mostrarRegiones, setMostrarRegiones] = useState(false);
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState(null);
  const [regionSeleccionada, setRegionSeleccionada] = useState(null);
  const [notificacionesActivas, setNotificacionesActivas] = useState(false);

  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    const cargarPreferencia = async () => {
      try {
        const valorGuardado = await AsyncStorage.getItem('notificacionesActivas');
        if (valorGuardado !== null) {
          setNotificacionesActivas(JSON.parse(valorGuardado));
        }
      } catch (error) {
        console.error('Error al leer estado de notificaciones:', error);
      }
    };

    cargarPreferencia();
  }, []);

  const manejarToggleNotificaciones = async () => {
    const nuevoEstado = !notificacionesActivas;
    setNotificacionesActivas(nuevoEstado);
    await AsyncStorage.setItem('notificacionesActivas', JSON.stringify(nuevoEstado));

    if (nuevoEstado) {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert('Permiso denegado', 'No se pueden enviar notificaciones');
          setNotificacionesActivas(false);
          await AsyncStorage.setItem('notificacionesActivas', JSON.stringify(false));
          return;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Notificaciones activadas ✅',
            body: 'Ahora recibirás alertas importantes.',
          },
          trigger: null,
        });
      } else {
        Alert.alert('Simulador no compatible', 'Debes usar un dispositivo físico');
        setNotificacionesActivas(false);
        await AsyncStorage.setItem('notificacionesActivas', JSON.stringify(false));
      }
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Notificaciones desactivadas',
          body: 'Ya no recibirás notificaciones.',
        },
        trigger: null,
      });
    }
  };

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Configuración</Text>
        </View>

        {/* Idioma */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => setMostrarIdiomas(!mostrarIdiomas)}>
            <Ionicons name="language-outline" size={20} color="green" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Idioma</Text>
            <Ionicons
              name={mostrarIdiomas ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.secondaryText}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
          {mostrarIdiomas && (
            <View style={[styles.optionGroup, { backgroundColor: theme.inputBackground }]}>
              {['Español', 'English', 'Kaqchikel'].map((idioma) => (
                <TouchableOpacity key={idioma} onPress={() => setIdiomaSeleccionado(idioma)}>
                  <Text style={[
                    styles.option,
                    {
                      color: idiomaSeleccionado === idioma ? 'green' : theme.text,
                      fontWeight: idiomaSeleccionado === idioma ? 'bold' : 'normal'
                    }
                  ]}>{idioma}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Región */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => setMostrarRegiones(!mostrarRegiones)}>
            <Ionicons name="location-outline" size={20} color="green" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Región</Text>
            <Ionicons
              name={mostrarRegiones ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.secondaryText}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
          {mostrarRegiones && (
            <View style={[styles.optionGroup, { backgroundColor: theme.inputBackground }]}>
              {['Norte', 'Sur', 'Occidente'].map((region) => (
                <TouchableOpacity key={region} onPress={() => setRegionSeleccionada(region)}>
                  <Text style={[
                    styles.option,
                    {
                      color: regionSeleccionada === region ? 'green' : theme.text,
                      fontWeight: regionSeleccionada === region ? 'bold' : 'normal'
                    }
                  ]}>{region}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Organizaciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color="green" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Organizaciones</Text>
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={20} color="green" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notificaciones</Text>
            <Switch
              value={notificacionesActivas}
              onValueChange={manejarToggleNotificaciones}
              style={{ marginLeft: 'auto' }}
            />
          </View>
        </View>

        {/* Tema oscuro */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="dark-mode" size={20} color="green" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tema oscuro</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              style={{ marginLeft: 'auto' }}
            />
          </View>
        </View>

        {/* Cambiar contraseña */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => navigation.navigate('CambiarContrasena')}
          >
            <Ionicons name="lock-closed-outline" size={20} color="green" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Cambiar contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* Cerrar sesión */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={cerrarSesion}>
            <MaterialIcons name="logout" size={20} color="green" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    height: 80,
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  optionGroup: {
    borderRadius: 8,
    padding: 10,
    gap: 10,
  },
  option: {
    fontSize: 16,
  },
});
