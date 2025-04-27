import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // Obtener token de AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      // En un entorno real, debes usar un token almacenado en AsyncStorage
      // const token = await AsyncStorage.getItem('token');
      
      // Usamos una URL de ejemplo, en producción deberías usar variables de entorno
      const response = await axios.get('http://IP:3001/api/alertas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Mapear los datos de la API 
      const alertasFormateadas = response.data.map(alerta => ({
        alerta_id: alerta.alerta_id,
        nombre: alerta.CasoCritico?.nombre_paciente || 'Nombre no disponible',
        descripcion: alerta.descripcion,
        comunidad: alerta.CasoCritico?.comunidad || 'Comunidad no disponible',
        edad: alerta.CasoCritico?.edad_paciente,
        estado: alerta.estado,
        tipo_alerta: alerta.tipo_alerta,
        prioridad: alerta.prioridad
      }));

      // Filtrar alertas según el estado activo/inactivo
      const alertasFiltradas = alertasFormateadas.filter(alerta => 
        activo ? alerta.estado !== 'Cerrada' : alerta.estado === 'Cerrada'
      );
      
      setAlertas(alertasFiltradas);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      Alert.alert('Error', 'No se pudieron cargar las alertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, [activo]);

  // efecto para actualizar cuando se regresa a la otra pantalla
  useEffect(() => {
    if (route.params?.refresh) {
      fetchAlertas();
    }
  }, [route.params?.refresh]);

  // Renderizar cada item de alerta (navegacion)
 // Datos de prueba (simulando la API)
 const alertasPrueba = [
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
];

// Simular carga de datos
useEffect(() => {
  const timer = setTimeout(() => {
    setAlertas(alertasPrueba);
    setLoading(false);
  }, 1000);
  return () => clearTimeout(timer);
}, []);

// Renderizar cada alerta
const renderAlertItem = (alerta) => (
  <TouchableOpacity 
    key={alerta.alerta_id} 
    style={[styles.alertItem, { backgroundColor: theme.card }]}
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
      { 
        color: alerta.estado === 'Pendiente' ? '#E65100' : 
              alerta.estado === 'Atendida' ? '#2E7D32' : '#1565C0' 
      }]}>
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

        {/* Filtro Activos/Inactivos */}
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
          <Text style={[styles.noAlertsText, { color: theme.secondaryText }]}>
            No hay alertas {activo ? 'activas' : 'inactivas'} por el momento.
          </Text>
        ) : (
          <>
            {alertas.map(renderAlertItem)}
            <TouchableOpacity style={[styles.seeMoreButton, { borderColor: theme.text }]}>
              <Text style={[styles.seeMoreText, { color: theme.text }]}>VER MÁS</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>

    {/* Barra inferior */}
    <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.borderColor }]}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home" size={28} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="search-outline" size={28} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: theme.addButton }]}
        onPress={() => navigation.navigate('RegisterAlertas')}
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
  alignItems: 'center',
  padding: 15,
  marginBottom: 15,
  borderRadius: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
alertName: {
  fontSize: 16,
  fontWeight: 'bold',
},
alertDesc: {
  fontSize: 14,
  marginVertical: 4,
},
alertComunidad: {
  fontSize: 12,
},
alertStatus: {
  fontSize: 12,
  fontWeight: 'bold',
  padding: 5,
},
noAlertsText: {
  textAlign: 'center',
  marginTop: 20,
  fontSize: 16,
},
seeMoreButton: {
  borderWidth: 1,
  borderRadius: 8,
  padding: 12,
  alignItems: 'center',
  marginTop: 10,
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