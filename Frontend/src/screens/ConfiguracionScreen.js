import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import BottomNav from '../components/BottomNav'; // 👈 barra de navegación reutilizable

export default function ConfiguracionScreen({ navigation }) {
  const [mostrarIdiomas, setMostrarIdiomas] = useState(false);
  const [mostrarRegiones, setMostrarRegiones] = useState(false);
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState(null);
  const [regionSeleccionada, setRegionSeleccionada] = useState(null);
  const [notificacionesActivas, setNotificacionesActivas] = useState(false);
  const [temaOscuro, setTemaOscuro] = useState(false);

  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const manejarToggleNotificaciones = () => {
    const nuevoEstado = !notificacionesActivas;
    setNotificacionesActivas(nuevoEstado);
    if (nuevoEstado) {
      Alert.alert(
        "Notificaciones activadas",
        "Gracias por aceptar recibir notificaciones.",
        [{ text: "Aceptar" }]
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Configuración</Text>
        </View>

        {/* Idioma */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setMostrarIdiomas(!mostrarIdiomas)}
          >
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
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setMostrarRegiones(!mostrarRegiones)}
          >
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

        {/* Tema oscuro (simulado) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="dark-mode" size={20} color="green" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tema oscuro</Text>
            <Switch
              value={isDarkMode}
              disabled={true}
              style={{ marginLeft: 'auto', opacity: 0.4 }}
            />
          </View>
        </View>

        {/* Cambiar contraseña */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed-outline" size={20} color="green" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Cambiar contraseña</Text>
          </View>
        </View>

        {/* Cerrar sesión */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="logout" size={20} color="green" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Cerrar sesión</Text>
          </View>
        </View>
      </ScrollView>

      {/* Barra de navegación al final */}
      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100, // espacio para la barra
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
  backButton: {
    padding: 4,
  },
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
