// src/screens/Home.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
// ❌ Nada de backend aquí
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useOffline } from '../context/OfflineContext';
import OfflineStorage from '../services/OfflineStorage';
import BottomNav from '../components/BottomNav';

const PALETTE = {
  tangerine: '#F08C21',
  blush:     '#E36888',
  butter:    '#F2D88F',
  sea:       '#6698CC',
  cream:     '#FFF7DA',
};

/** ===== Mock: 4 alertas quemadas ===== */
const MOCK_ALERTS = [
  { alerta_id: 'm1', nombre: 'María López', descripcion: 'Bajo peso y pérdida de apetito en las últimas 2 semanas.', comunidad: 'San Miguel', edad: 2, estado: 'Pendiente', tipo_alerta: 'Nutricional', prioridad: 'Alta', pendingSync: false },
  { alerta_id: 'm2', nombre: 'Juan Pérez',  descripcion: 'Se detectó anemia leve, se requiere seguimiento.', comunidad: 'La Esperanza', edad: 5, estado: 'Atendida', tipo_alerta: 'Médica', prioridad: 'Media', pendingSync: false },
  { alerta_id: 'm3', nombre: 'Ana Gómez',   descripcion: 'Reporte de deshidratación moderada por diarrea.', comunidad: 'Las Flores', edad: 3, estado: 'Pendiente', tipo_alerta: 'Salud', prioridad: 'Alta', pendingSync: false },
  { alerta_id: 'm4', nombre: 'Carlos Ruiz', descripcion: 'Caso cerrado tras entrega de suplemento alimenticio.', comunidad: 'Santa Cruz', edad: 4, estado: 'Cerrada', tipo_alerta: 'Nutricional', prioridad: 'Baja', pendingSync: false },
];

export default function Home({ navigation, route }) {
  const [activo, setActivo] = useState(true);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { isConnected } = useOffline();

  // === permisos de notificación ===
  useEffect(() => {
    const solicitarPermisoNotificaciones = async () => {
      const yaPreguntado = await AsyncStorage.getItem('notificacionesPermitidas');
      if (yaPreguntado) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        await AsyncStorage.setItem('notificacionesPermitidas', status === 'granted' ? 'true' : 'false');
        if (status !== 'granted') Alert.alert('Permiso denegado', 'No recibirás notificaciones.');
      } else {
        await AsyncStorage.setItem('notificacionesPermitidas', 'true');
      }
    };
    solicitarPermisoNotificaciones();
  }, []);

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      // 🚫 Nada de backend: usamos exclusivamente los MOCKS
      let alertasData = MOCK_ALERTS;

      // Mantener también las alertas locales pendientes (si existieran)
      const pendingAlerts = (await OfflineStorage.getPendingAlerts?.()) || [];
      const localAlertas = pendingAlerts.map((a) => ({
        alerta_id: a.tempId,
        nombre: a.nombre_paciente || 'Sin nombre',
        descripcion: a.descripcion,
        comunidad: a.comunidad || 'Sin comunidad',
        edad: a.edad_paciente,
        estado: 'Pendiente',
        tipo_alerta: a.tipo_alerta || 'Nutricional',
        prioridad: a.prioridad || 'Alta',
        pendingSync: true,
      }));

      const todas = [...alertasData, ...localAlertas];
      setAlertas(todas.filter((a) => (activo ? a.estado !== 'Cerrada' : a.estado === 'Cerrada')));
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
          {a.nombre}{a.pendingSync && <Text style={styles.pendingBadge}> • Sin sincronizar</Text>}
        </Text>
        <Text style={[styles.alertDesc, { color: theme.secondaryText }]}>{a.descripcion}</Text>
        <Text style={[styles.alertComunidad, { color: theme.secondaryText }]}>
          {a.comunidad}{a.edad ? ` • ${a.edad} años` : ''}
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
            <Text style={[styles.topTitle, { color: theme.text }]}>Inicio</Text>
            <Text style={[styles.topSubtitle, { color: isDarkMode ? theme.secondaryText : '#6698CC' }]}>
              Panel de alertas
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleDarkMode}>
          <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={PALETTE.tangerine} style={{ marginVertical: 20 }} />
        ) : alertas.length === 0 ? (
          <Text style={[styles.noAlertsText, { color: theme.secondaryText }]}>
            No hay alertas {activo ? 'activas' : 'inactivas'} por el momento.
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
                <Text style={styles.verMasText}>Ver más</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, paddingBottom: 100 },

  /* ===== Header ===== */
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

  /* ===== Card estilo gráficas ===== */
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
    borderColor: '#EAD8A6', // borde suave (no negro)
  }),

  alertName: { fontSize: 16, fontWeight: '800' },
  alertDesc: { fontSize: 14, marginVertical: 4 },
  alertComunidad: { fontSize: 12 },
  alertStatus: { fontSize: 12, fontWeight: '800', padding: 5 },
  pendingBadge: { fontSize: 12, fontStyle: 'italic', color: PALETTE.tangerine },

  /* ===== Botón "Ver más" ===== */
  verMasContainer: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
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
  verMasText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  noAlertsText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
});
