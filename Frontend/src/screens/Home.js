import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useOffline } from '../context/OfflineContext';
import OfflineStorage from '../services/OfflineStorage';
import BottomNav from '../components/BottomNav';
import { useTranslation } from 'react-i18next';

const PALETTE = {
  tangerine: '#F08C21',
  blush:     '#E36888',
  butter:    '#F2D88F',
  sea:       '#6698CC',
  cream:     '#FFF7DA',
};

// 🔥 CAMBIO: URL del backend - ACTUALIZA CON TU IP LOCAL
const API_BASE_URL = 'http://localhost:3001'; // Cambia "localhost" por tu IP local si usas dispositivo físico

export default function Home({ navigation, route }) {
  const [activo, setActivo] = useState(true);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { isConnected } = useOffline();
  const { t } = useTranslation('Home');

  // === Permisos de notificación ===
  useEffect(() => {
    const solicitarPermisoNotificaciones = async () => {
      const yaPreguntado = await AsyncStorage.getItem('notificacionesPermitidas');
      if (yaPreguntado) return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        await AsyncStorage.setItem('notificacionesPermitidas', status === 'granted' ? 'true' : 'false');
        if (status !== 'granted') {
          Alert.alert(
            t('notifications.permissionDeniedTitle'),
            t('notifications.permissionDeniedBody')
          );
        }
      } else {
        await AsyncStorage.setItem('notificacionesPermitidas', 'true');
      }
    };
    solicitarPermisoNotificaciones();
  }, [t]);

  // 🔥 CAMBIO: Función para obtener alertas REALES del backend
  const fetchAlertas = async () => {
    setLoading(true);
    try {
      let alertasData = [];

      // Si hay conexión, obtener alertas del backend
      if (isConnected) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/alertas`);
          console.log('Alertas del backend:', response.data);
          
          // Mapear las alertas del backend al formato esperado por la UI
          alertasData = response.data.map(alerta => ({
            alerta_id: alerta.alerta_id,
            nombre: alerta.caso?.descripcion || t('placeholders.noName'), // Usar descripción del caso como nombre
            descripcion: alerta.descripcion,
            comunidad: t('placeholders.noCommunity'), // Por ahora sin comunidad en el modelo
            edad: null, // No está en el modelo actual de Alertas
            estado: alerta.estado, // 'Pendiente', 'Atendida', 'Escalada', 'Cerrada'
            tipo_alerta: alerta.tipo_alerta, // 'Médica', 'Nutricional', 'Psicosocial', 'Urgente'
            prioridad: alerta.prioridad, // 'Baja', 'Media', 'Alta', 'Crítica'
            fecha_alerta: alerta.fecha_alerta,
            observaciones: alerta.observaciones,
            pendingSync: false
          }));
        } catch (error) {
          console.error('Error al obtener alertas del backend:', error);
          Alert.alert(
            t('errors.loadingAlertsTitle') || 'Error',
            t('errors.loadingAlertsMessage') || 'No se pudieron cargar las alertas del servidor'
          );
        }
      }

      // Agregar alertas pendientes de sincronización (offline)
      const pendingAlerts = (await OfflineStorage.getPendingAlerts?.()) || [];
      const localAlertas = pendingAlerts.map((a) => ({
        alerta_id: a.tempId,
        nombre: a.nombre_paciente || t('placeholders.noName'),
        descripcion: a.descripcion,
        comunidad: a.comunidad || t('placeholders.noCommunity'),
        edad: a.edad_paciente,
        estado: 'Pendiente',
        tipo_alerta: a.tipo_alerta || 'Nutricional',
        prioridad: a.prioridad || 'Alta',
        pendingSync: true,
      }));

      // Combinar alertas del servidor con alertas locales pendientes
      const todas = [...alertasData, ...localAlertas];
      
      // Filtrar según el tab activo (Activas o Cerradas)
      const filtradas = todas.filter((a) => 
        activo ? a.estado !== 'Cerrada' : a.estado === 'Cerrada'
      );
      
      setAlertas(filtradas);
    } catch (error) {
      console.error('Error general en fetchAlertas:', error);
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

  // Función para obtener el color según el estado
  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Pendiente': return PALETTE.tangerine;
      case 'Atendida': return '#2E7D32'; // Verde
      case 'Escalada': return '#D32F2F'; // Rojo
      case 'Cerrada': return '#1565C0'; // Azul
      default: return PALETTE.tangerine;
    }
  };

  const renderAlertItem = (a) => (
    <TouchableOpacity 
      key={a.alerta_id} 
      style={styles.card(theme, isDarkMode)}
      onPress={() => navigation.navigate('EditarAlerta', { alerta: a })}
    >
      <AntDesign name="exclamationcircle" size={28} color={PALETTE.blush} style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.alertName, { color: theme.text }]}>
          {a.nombre}
          {a.pendingSync && <Text style={styles.pendingBadge}> {t('badges.unsynced')}</Text>}
        </Text>
        <Text style={[styles.alertDesc, { color: theme.secondaryText }]}>
          {a.descripcion}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={[styles.alertComunidad, { color: theme.secondaryText }]}>
            {a.tipo_alerta} • {a.prioridad}
          </Text>
        </View>
      </View>
      <Text style={[styles.alertStatus, { color: getEstadoColor(a.estado) }]}>
        {a.estado}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : '#F2D88F' }}>
      {/* ===== Header moderno ===== */}
      <View style={[styles.topBar, { backgroundColor: isDarkMode ? theme.inputBackground : '#FFF7DA' }]}>
        <View style={styles.titleRow}>
          <Image
            source={isDarkMode
              ? require('../styles/logos/LogoDARK.png')
              : require('../styles/logos/LogoBRIGHT.png')}
            style={{ width: 45, height: 45, marginRight: 8 }}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.text }]}>{t('screens.home.title')}</Text>
        </View>

        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={toggleDarkMode} style={{ marginRight: 12 }}>
            <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Configuracion')}>
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== Tabs (Activas / Cerradas) ===== */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.inputBackground }]}>
        <TouchableOpacity
          onPress={() => setActivo(true)}
          style={[styles.tab, activo && { backgroundColor: PALETTE.tangerine, borderRadius: 8 }]}
        >
          <Text style={[styles.tabText, { color: activo ? '#FFF' : theme.secondaryText }]}>
            {t('tabs.active')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActivo(false)}
          style={[styles.tab, !activo && { backgroundColor: PALETTE.sea, borderRadius: 8 }]}
        >
          <Text style={[styles.tabText, { color: !activo ? '#FFF' : theme.secondaryText }]}>
            {t('tabs.closed')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===== Lista de Alertas ===== */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={PALETTE.tangerine} />
          <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
            {t('loading.alerts')}
          </Text>
        </View>
      ) : alertas.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
          <Ionicons name="checkmark-circle-outline" size={80} color={theme.secondaryText} />
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {activo ? t('empty.noActiveAlerts') : t('empty.noClosedAlerts')}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16, paddingTop: 12 }}>
          {alertas.map(renderAlertItem)}
        </ScrollView>
      )}

      {/* ===== Botón flotante "Nueva Alerta" ===== */}
      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: PALETTE.blush }]}
        onPress={() => navigation.navigate('RegisterAlertas')}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700' },
  rightIcons: { flexDirection: 'row', alignItems: 'center' },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: { fontSize: 15, fontWeight: '600' },
  card: (theme, isDark) => ({
    backgroundColor: theme.inputBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 3,
    elevation: 2,
  }),
  alertName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  alertDesc: { fontSize: 14, marginBottom: 2 },
  alertComunidad: { fontSize: 12 },
  alertStatus: { fontSize: 14, fontWeight: '600' },
  pendingBadge: { color: PALETTE.tangerine, fontSize: 12, fontWeight: '500' },
  fabButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  loadingText: { marginTop: 12, fontSize: 16 },
  emptyText: { fontSize: 18, textAlign: 'center', marginTop: 16, fontWeight: '500' },
});