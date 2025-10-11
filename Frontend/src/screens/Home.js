import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Cambia esta URL a tu IP local cuando pruebes en dispositivo físico
// Ejemplo: const API_BASE_URL = 'http://192.168.1.100:3001';
const API_BASE_URL = 'http://localhost:3001';

export default function Home({ navigation, route }) {
  const [activo, setActivo] = useState(true);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { isConnected } = useOffline();
  const { t } = useTranslation('Home');

  // === permisos de notificación ===
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

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      let alertasData = [];

      // Intentar obtener alertas del backend si hay conexión
      if (isConnected) {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/api/alertas`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` })
            },
          });

          if (response.ok) {
            const data = await response.json();
            alertasData = Array.isArray(data) ? data.map(alerta => ({
              alerta_id: alerta.alerta_id,
              nombre: alerta.nombre_paciente || t('placeholders.noName'),
              descripcion: alerta.descripcion,
              comunidad: alerta.comunidad || t('placeholders.noCommunity'),
              edad: alerta.edad_paciente,
              estado: alerta.estado || 'Pendiente',
              tipo_alerta: alerta.tipo_alerta || 'Nutricional',
              prioridad: alerta.prioridad || 'Media',
              pendingSync: false,
            })) : [];
          } else {
            console.warn('Error al obtener alertas del servidor:', response.status);
          }
        } catch (error) {
          console.warn('Error de red al obtener alertas:', error.message);
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

      // Combinar alertas del servidor y locales
      const todas = [...alertasData, ...localAlertas];
      setAlertas(todas.filter((a) => (activo ? a.estado !== 'Cerrada' : a.estado === 'Cerrada')));
    } catch (error) {
      console.error('Error general al cargar alertas:', error);
      Alert.alert(
        t('errors.loadTitle') || 'Error',
        t('errors.loadMessage') || 'No se pudieron cargar las alertas'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlertas(); }, [activo, isConnected]);
  useEffect(() => { if (route.params?.refresh) fetchAlertas(); }, [route.params?.refresh]);

  const renderAlertItem = (a) => (
    <TouchableOpacity key={a.alerta_id} style={styles.card(theme, isDarkMode)}>
      <AntDesign name="exclamationcircle" size={28} color={PALETTE.blush} style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.alertName, { color: theme.text }]}>
          {a.nombre}{a.pendingSync && <Text style={styles.pendingBadge}> {t('badges.unsynced')}</Text>}
        </Text>
        <Text style={[styles.alertDesc, { color: theme.secondaryText }]}>{a.descripcion}</Text>
        <Text style={[styles.alertComunidad, { color: theme.secondaryText }]}>
          {a.comunidad}{a.edad ? ` • ${a.edad} ${t('units.years')}` : ''}
        </Text>
      </View>
      <Text
        style={[
          styles.alertStatus,
          { color: a.estado === 'Pendiente' ? PALETTE.tangerine : a.estado === 'Atendida' ? '#2E7D32' : '#1565C0' }
        ]}
      >
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
            style={styles.logo}
          />
          <View>
            <Text style={[styles.topTitle, { color: theme.text }]}>{t('top.title')}</Text>
            <Text style={[styles.topSubtitle, { color: isDarkMode ? theme.secondaryText : '#6698CC' }]}>
              {t('top.subtitle')}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleDarkMode}>
          <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Indicador de conexión cuando está offline */}
        {!isConnected && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
            <Text style={styles.offlineText}>
              {t('offline.banner') || 'Modo sin conexión'}
            </Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={PALETTE.tangerine} style={{ marginVertical: 20 }} />
        ) : alertas.length === 0 ? (
          <Text style={[styles.noAlertsText, { color: theme.secondaryText }]}>
            {activo ? t('empty.active') : t('empty.inactive')}
          </Text>
        ) : (
          <>
            {alertas.map(renderAlertItem)}
            {/* Botón "Ver más" moderno */}
            <View style={styles.verMasContainer}>
              <TouchableOpacity
                style={styles.verMasButton}
                onPress={() => console.log('Ver más')}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.verMasText}>{t('seeMore')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* === FAB: Nuevo Paciente === */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PacienteForm')}
      >
        <Ionicons name="person-add-outline" size={22} color="#fff" />
        <Text style={styles.fabText}>{t('fab.newPatient')}</Text>
      </TouchableOpacity>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const RADIUS = 16;

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, paddingBottom: 100 },

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
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderColor: '#EAD8A6',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 36, height: 36, marginRight: 10, resizeMode: 'contain' },
  topTitle: { fontSize: 20, fontWeight: '800' },
  topSubtitle: { marginTop: 4, fontSize: 12, fontWeight: '700' },
  toggleButton: { padding: 6, borderRadius: 10 },

  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.sea,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  offlineText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  card: (theme, isDarkMode) => ({
    backgroundColor: theme.cardBackground || (isDarkMode ? '#1E1E1E' : '#fff'),
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#EAD8A6',
  }),

  alertName: { fontSize: 16, fontWeight: '800' },
  alertDesc: { fontSize: 14, marginVertical: 4 },
  alertComunidad: { fontSize: 12 },
  alertStatus: { fontSize: 12, fontWeight: '800', padding: 5 },

  pendingBadge: { fontSize: 12, fontStyle: 'italic', color: PALETTE.tangerine },

  verMasContainer: { alignItems: 'center', marginTop: 6, marginBottom: 10 },
  verMasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.tangerine,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 28,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    gap: 8,
  },
  verMasText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  noAlertsText: { textAlign: 'center', marginTop: 20, fontSize: 16 },

  fab: {
    position: 'absolute',
    right: 18,
    bottom: 88,
    backgroundColor: PALETTE.tangerine,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});