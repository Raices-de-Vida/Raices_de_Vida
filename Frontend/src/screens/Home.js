import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

export default function Home({ navigation, route }) {
  const [activo, setActivo] = useState(true);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para cargar alertas desde la API
  const fetchAlertas = async () => {
    setLoading(true);
    try {
      // En un entorno real, debes usar un token almacenado en AsyncStorage
      // const token = await AsyncStorage.getItem('token');
      
      // Usamos una URL de ejemplo, en producción deberías usar variables de entorno
      const response = await axios.get('http://192.168.2.1:3001/api/alertas');
      
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
      style={styles.alertItem}
      onPress={() => handleEditAlert(alerta)}
    >
      <AntDesign name="exclamationcircle" size={28} color="red" style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.alertName}>{alerta.nombre}</Text>
        <Text style={styles.alertDesc}>{alerta.descripcion}</Text>
        <Text style={styles.alertComunidad}>
          {alerta.comunidad} {alerta.edad ? `• ${alerta.edad} años` : ''}
        </Text>
      </View>
      <Text style={[styles.alertStatus, 
        { color: alerta.estado === 'Pendiente' ? '#FF6B6B' : 
                 alerta.estado === 'Atendida' ? '#4CAF50' : '#FF9800' }]}>
        {alerta.estado}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
        </View>

        {/* Sección de Alertas */}
        <View style={styles.alertSection}>
          <Text style={styles.alertTitle}>Alertas</Text>

          {/* Switch Activos/Inactivos */}
          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[styles.switchButton, activo && styles.switchButtonActive]}
              onPress={() => setActivo(true)}
            >
              <Text style={[styles.switchText, activo && styles.switchTextActive]}>Activos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchButton, !activo && styles.switchButtonActive]}
              onPress={() => setActivo(false)}
            >
              <Text style={[styles.switchText, !activo && styles.switchTextActive]}>Inactivos</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Alertas */}
          {loading ? (
            <ActivityIndicator size="large" color="#E8A074" style={{ marginVertical: 20 }} />
          ) : alertas.length === 0 ? (
            <Text style={styles.noAlertsText}>No hay alertas {activo ? 'activas' : 'inactivas'} por el momento.</Text>
          ) : (
            alertas.map(renderAlertItem)
          )}

          {/* Botón Ver Más */}
          {alertas.length > 0 && (
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>VER MÁS</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Barra inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateAlert}
        >
          <Entypo name="plus" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity>
          <AntDesign name="exclamationcircle" size={28} color="red" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="user-o" size={28} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#FFE7A0',
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
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#F3B27A',
  },
  switchText: {
    color: 'gray',
    fontWeight: 'bold',
  },
  switchTextActive: {
    color: 'white',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#E8A074',
  },
  alertName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertDesc: {
    color: 'gray',
    marginTop: 2,
  },
  alertComunidad: {
    color: 'gray',
    fontSize: 12,
    marginTop: 2,
  },
  alertStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    padding: 5,
  },
  noAlertsText: {
    color: 'gray',
    fontStyle: 'italic',
    marginVertical: 20,
    textAlign: 'center',
  },
  seeMoreButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'black',
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
    borderColor: '#ccc',
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#E8A074',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    elevation: 5,
  },
});