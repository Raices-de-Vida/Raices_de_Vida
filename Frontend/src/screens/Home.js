import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';

export default function Home({ navigation, route }) {
  const [activo, setActivo] = useState(true);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  // Función para cargar alertas desde la API
  const fetchAlertas = async () => {
    setLoading(true);
    try {
      // En un entorno real, debes usar un token almacenado en AsyncStorage
      // const token = await AsyncStorage.getItem('token');
      
      // Usamos una URL de ejemplo, en producción deberías usar variables de entorno
      const response = await axios.get('http://IP:3001/api/alertas');
      
      // Filtrar alertas según el estado activo/inactivo
      const alertasFiltradas = response.data.filter(alerta => 
        activo ? alerta.estado !== 'Cerrada' : alerta.estado === 'Cerrada'
      );
      
      setAlertas(alertasFiltradas);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      // Si estamos en desarrollo, añadimos datos de prueba cuando la API falla
      if (__DEV__) {
        setAlertas([
          {
            alerta_id: 1,
            nombre: 'Juan Pérez',
            descripcion: 'Caso urgente de desnutrición',
            comunidad: 'San Pedro Ayampuc',
            edad: 4,
            estado: 'Pendiente'
          },
          {
            alerta_id: 2,
            nombre: 'María López',
            descripcion: 'Requiere asistencia médica',
            comunidad: 'Villa Nueva',
            edad: 7,
            estado: 'Atendida'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, [activo]);

  //efecto para actualizar cuando regresamos de otra pantalla
  useEffect(() => {
    if (route.params?.refresh) {
      fetchAlertas();
    }
  }, [route.params?.refresh]);

  //navegación a pantalla de crear alerta
  const handleCreateAlert = () => {
    navigation.navigate('RegisterAlertas');
  };

  //navegación a pantalla de editar alerta
  const handleEditAlert = (alerta) => {
    navigation.navigate('EditarAlerta', { alerta });
  };

  const renderAlertItem = (alerta) => (
    <TouchableOpacity 
      key={alerta.alerta_id} 
      style={[styles.alertItem, { backgroundColor: theme.card, borderLeftColor: theme.primaryButton }]}
      onPress={() => handleEditAlert(alerta)}
    >
      <AntDesign name="exclamationcircle" size={28} color="red" style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.alertName, { color: theme.text }]}>{alerta.nombre}</Text>
        <Text style={[styles.alertDesc, { color: theme.secondaryText }]}>{alerta.descripcion}</Text>
        <Text style={[styles.alertComunidad, { color: theme.secondaryText }]}>
          {alerta.comunidad} {alerta.edad ? `• ${alerta.edad} años` : ''}
        </Text>
      </View>
      <Text style={[
        styles.alertStatus, 
        { color: alerta.estado === 'Pendiente' ? theme.pendingStatus : 
                 alerta.estado === 'Atendida' ? theme.attendedStatus : 
                 theme.derivedStatus }]}>
        {alerta.estado}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemeToggle />
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Home</Text>
        </View>

        {/* Sección de Alertas */}
        <View style={styles.alertSection}>
          <Text style={[styles.alertTitle, { color: theme.text }]}>Alertas</Text>

          {/* Switch Activos/Inactivos */}
          <View style={[styles.switchContainer, { backgroundColor: theme.switchInactive }]}>
            <TouchableOpacity
              style={[
                styles.switchButton, 
                activo && { backgroundColor: theme.switchActive }
              ]}
              onPress={() => setActivo(true)}
            >
              <Text style={[
                styles.switchText, 
                { color: activo ? '#fff' : theme.secondaryText }
              ]}>Activos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.switchButton, 
                !activo && { backgroundColor: theme.switchActive }
              ]}
              onPress={() => setActivo(false)}
            >
              <Text style={[
                styles.switchText, 
                { color: !activo ? '#fff' : theme.secondaryText }
              ]}>Inactivos</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Alertas */}
          {loading ? (
            <ActivityIndicator size="large" color={theme.primaryButton} style={{ marginVertical: 20 }} />
          ) : alertas.length === 0 ? (
            <Text style={[styles.noAlertsText, { color: theme.secondaryText }]}>No hay alertas {activo ? 'activas' : 'inactivas'} por el momento.</Text>
          ) : (
            alertas.map(renderAlertItem)
          )}

          {/* Botón Ver Más */}
          {alertas.length > 0 && (
            <TouchableOpacity 
              style={[
                styles.seeMoreButton, 
                { borderColor: theme.text }
              ]}
            >
              <Text style={[styles.seeMoreText, { color: theme.text }]}>VER MÁS</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Barra inferior */}
      <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.borderColor }]}>
        <TouchableOpacity>
          <Ionicons name="home" size={28} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={28} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.addButton }]}
          onPress={handleCreateAlert}
        >
          <Entypo name="plus" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity>
          <AntDesign name="exclamationcircle" size={28} color="red" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="user-o" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    height: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  alertSection: {
    marginTop: 10,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  switchText: {
    fontWeight: 'bold',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  alertName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertDesc: {
    marginTop: 2,
  },
  alertComunidad: {
    fontSize: 12,
    marginTop: 2,
  },
  alertStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    padding: 5,
  },
  noAlertsText: {
    fontStyle: 'italic',
    marginVertical: 20,
    textAlign: 'center',
  },
  seeMoreButton: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  seeMoreText: {
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    elevation: 5,
  },
});