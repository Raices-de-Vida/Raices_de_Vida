import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';
import { useOffline } from '../context/OfflineContext';
import OfflineStorage from '../services/OfflineStorage';
import BottomNav from '../components/BottomNav';

export default function Home({ navigation, route }) {
  const [activo, setActivo] = useState(true);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { isConnected, syncInfo, syncNow } = useOffline();

  // Solicitar permiso de notificaciones una sola vez
  useEffect(() => {
    const solicitarPermisoNotificaciones = async () => {
      const yaPreguntado = await AsyncStorage.getItem('notificacionesPermitidas');
      if (yaPreguntado === 'true' || yaPreguntado === 'false') {
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          await AsyncStorage.setItem('notificacionesPermitidas', 'true');
        } else {
          await AsyncStorage.setItem('notificacionesPermitidas', 'false');
          Alert.alert('Permiso denegado', 'No recibirás notificaciones.');
        }
      } else {
        await AsyncStorage.setItem('notificacionesPermitidas', 'true');
      }
    };

    solicitarPermisoNotificaciones();
  }, []);

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      let alertasData = [];

      if (isConnected) {
        try {
          const token = await OfflineStorage.getToken();
          const response = await axios.get('http://localhost:3001/api/alertas', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          alertasData = response.data.map(alerta => ({
            alerta_id: alerta.alerta_id,
            nombre: alerta.CasoCritico?.nombre_paciente || 'Nombre no disponible',
            descripcion: alerta.descripcion,
            comunidad: alerta.CasoCritico?.comunidad || 'Comunidad no disponible',
            edad: alerta.CasoCritico?.edad_paciente,
            estado: alerta.estado,
            tipo_alerta: alerta.tipo_alerta,
            prioridad: alerta.prioridad,
            pendingSync: false
          }));
        } catch (error) {
          console.error('Error cargando alertas del servidor:', error);
        }
      }

      const pendingAlerts = await OfflineStorage.getPendingAlerts();

      const localAlertas = pendingAlerts.map(alerta => ({
        alerta_id: alerta.tempId,
        nombre: alerta.nombre_paciente || 'Sin nombre',
        descripcion: alerta.descripcion,
        comunidad: alerta.comunidad || 'Sin comunidad',
        edad: alerta.edad_paciente,
        estado: 'Pendiente',
        tipo_alerta: alerta.tipo_alerta || 'Nutricional',
        prioridad: alerta.prioridad || 'Alta',
        pendingSync: true
      }));

      const todasAlertas = [...alertasData, ...localAlertas];

      const alertasFiltradas = todasAlertas.filter(alerta =>
        activo ? alerta.estado !== 'Cerrada' : alerta.estado === 'Cerrada'
      );

      setAlertas(alertasFiltradas);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, [activo, isConnected]);

  useEffect(() => {
    if (route.params?.refresh) {
      fetchAlertas();
    }
  }, [route.params?.refresh]);

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await OfflineStorage.getUserData();
        setUserData(data);
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      }
    };
    
    loadUserData();
  }, []);

  const renderSyncButton = () => {
    if (!isConnected) {
      return (
        <TouchableOpacity
          style={[styles.syncButton, { backgroundColor: theme.primaryButton }]}
          onPress={syncNow}
          disabled={syncInfo.isSyncing}>
          <Text style={styles.syncButtonText}>
            {syncInfo.isSyncing ? 'Sincronizando...' : 'Sincronizar cuando haya conexión'}
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderAlertItem = (alerta) => (
    <TouchableOpacity
      key={alerta.alerta_id}
      style={[styles.alertItem, { backgroundColor: theme.card }]}
    >
      <AntDesign name="exclamationcircle" size={28} color="red" style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.alertName, { color: theme.text }]}>
          {alerta.nombre}
          {alerta.pendingSync && (
            <Text style={styles.pendingBadge}> • Sin sincronizar</Text>
          )}
        </Text>
        <Text style={[styles.alertDesc, { color: theme.secondaryText }]}>{alerta.descripcion}</Text>
        <Text style={[styles.alertComunidad, { color: theme.secondaryText }]}>
          {alerta.comunidad} {alerta.edad ? `• ${alerta.edad} años` : ''}
        </Text>
      </View>
      <Text style={[styles.alertStatus, {
        color: alerta.estado === 'Pendiente' ? '#E65100' :
               alerta.estado === 'Atendida' ? '#2E7D32' : '#1565C0'
      }]}>
        {alerta.estado}
      </Text>
    </TouchableOpacity>
  );

  // Renderizar contenido basado en el rol del usuario
  const renderContent = () => {
    // Si no hay datos de usuario, mostrar cargando
    if (!userData) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primaryButton} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Cargando...</Text>
        </View>
      );
    }

    // Roles comunitarios
    if (userData.rol === 'Lider Comunitario' || userData.rol === 'Miembro Comunidad') {
      return (
        <View style={styles.communityContent}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>
            Bienvenido/a {userData.nombre}
          </Text>
          
          {/* Sección de alertas comunitarias */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Alertas en tu comunidad</Text>
            {/* Aquí mostrar alertas relevantes para la comunidad */}
            {/* ... */}
          </View>
          
          {/* Sección de información nutricional */}
          <TouchableOpacity 
            style={[styles.sectionCard, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('DatosAyuda')}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Información nutricional</Text>
            <Text style={[styles.sectionDescription, { color: theme.secondaryText }]}>
              Consejos y recursos para mejorar la nutrición en tu comunidad
            </Text>
          </TouchableOpacity>
          
          {/* Si es Líder Comunitario, mostrar botón para crear alerta */}
          {userData.rol === 'Lider Comunitario' && (
            <TouchableOpacity 
              style={[styles.createAlertButton, { backgroundColor: theme.primaryButton }]}
              onPress={() => navigation.navigate('RegisterAlertas')}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.createAlertText}>Crear Alerta</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    // Roles de ONG o Voluntario (contenido original)
    return (
      <>
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Home</Text>
        </View>

        {renderSyncButton()}

        <View style={styles.alertSection}>
          <Text style={[styles.alertTitle, { color: theme.text }]}>Alertas</Text>

          <View style={[styles.switchContainer, { backgroundColor: theme.switchInactive }]}>
            <TouchableOpacity
              style={[styles.switchButton, activo && { backgroundColor: theme.switchActive }]}
              onPress={() => setActivo(true)}>
              <Text style={[styles.switchText, { color: activo ? '#fff' : theme.secondaryText }]}>Activos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchButton, !activo && { backgroundColor: theme.switchActive }]}
              onPress={() => setActivo(false)}>
              <Text style={[styles.switchText, { color: !activo ? '#fff' : theme.secondaryText }]}>Inactivos</Text>
            </TouchableOpacity>
          </View>

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
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemeToggle />

      {!isConnected && (
        <View style={[styles.offlineIndicator, { backgroundColor: theme.toastInfo }]}>
          <Ionicons name="cloud-offline-outline" size={18} color="white" />
          <Text style={styles.offlineText}>Modo sin conexión</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        {renderContent()}
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

// Añadir estos nuevos estilos
const additionalStyles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  communityContent: {
    padding: 5,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  sectionCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  createAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 15,
  },
  createAlertText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
};

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
  offlineIndicator: {
    position: 'absolute',
    top: 80,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    zIndex: 5,
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
  syncButton: {
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pendingBadge: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#E65100',
  },
  ...additionalStyles,
});
