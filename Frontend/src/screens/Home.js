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

const PALETTE = {
  tangerine: '#F08C21',
  blush:     '#E36888',
  butter:    '#F2D88F',
  sea:       '#6698CC',
  cream:     '#FFF7DA',
};

export default function Home({ navigation, route }) {
  const [activo, setActivo] = useState(true);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { isConnected, syncInfo, syncNow } = useOffline();

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
      let alertasData = [];
      if (isConnected) {
        try {
          //const token = await OfflineStorage.getToken();
          const response = await axios.get('http://localhost:3001/api/alertas');
          alertasData = response.data.map((a) => ({
            alerta_id: a.alerta_id,
            nombre: a.CasoCritico?.nombre_paciente || 'Nombre no disponible',
            descripcion: a.descripcion,
            comunidad: a.CasoCritico?.comunidad || 'Comunidad no disponible',
            edad: a.CasoCritico?.edad_paciente,
            estado: a.estado,
            tipo_alerta: a.tipo_alerta,
            prioridad: a.prioridad,
            pendingSync: false,
          }));
        } catch (err) { console.error('Error cargando alertas:', err); }
      }
      const pendingAlerts = await OfflineStorage.getPendingAlerts();
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
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAlertas(); }, [activo, isConnected]);
  useEffect(() => { if (route.params?.refresh) fetchAlertas(); }, [route.params?.refresh]);

  const renderAlertItem = (a) => (
    <TouchableOpacity key={a.alerta_id} style={[styles.alertItem, { backgroundColor: isDarkMode ? theme.card : PALETTE.cream }]}>
      <AntDesign name="exclamationcircle" size={28} color={PALETTE.blush} style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.alertName, { color: theme.text }]}>
          {a.nombre}{a.pendingSync && <Text style={styles.pendingBadge}> • Sin sincronizar</Text>}
        </Text>
        <Text style={[styles.alertDesc, { color: theme.secondaryText }]}>{a.descripcion}</Text>
        <Text style={[styles.alertComunidad, { color: theme.secondaryText }]}>{a.comunidad}{a.edad ? ` • ${a.edad} años` : ''}</Text>
      </View>
      <Text style={[
        styles.alertStatus,
        { color: a.estado === 'Pendiente' ? PALETTE.tangerine : a.estado === 'Atendida' ? '#2E7D32' : '#1565C0' }
      ]}>{a.estado}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : PALETTE.butter }}>
      <ThemeToggle />

      {/* decor blobs */}
      <View style={[styles.blob, styles.blobTL, { backgroundColor: PALETTE.sea, opacity: 0.22 }]} />
      <View style={[styles.blob, styles.blobBR, { backgroundColor: PALETTE.blush, opacity: 0.18 }]} />

      {!isConnected && (
        <View style={[styles.offlineIndicator, { backgroundColor: theme.toastInfo || '#9CA3AF' }]}>
          <Ionicons name="cloud-offline-outline" size={18} color="white" />
          <Text style={styles.offlineText}>Modo sin conexión</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.header, { backgroundColor: isDarkMode ? theme.header : PALETTE.cream }]}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? theme.text : PALETTE.blush }]}>Inicio</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={PALETTE.tangerine} style={{ marginVertical: 20 }} />
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
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const RADIUS = 16;

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, paddingBottom: 100 },
  header: { height: 72, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  alertItem: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 12, borderRadius: 12 },
  alertName: { fontSize: 16, fontWeight: '800' },
  alertDesc: { fontSize: 14, marginVertical: 4 },
  alertComunidad: { fontSize: 12 },
  alertStatus: { fontSize: 12, fontWeight: '800', padding: 5 },
  noAlertsText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  seeMoreButton: { borderWidth: 1, borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 10 },
  seeMoreText: { fontWeight: '800' },
  offlineIndicator: { position: 'absolute', top: 80, right: 20, flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, zIndex: 5 },
  offlineText: { color: 'white', fontSize: 12, fontWeight: '600', marginLeft: 5 },
  blob: { position: 'absolute', width: 260, height: 260, borderRadius: 90 },
  blobTL: { top: -70, left: -60, transform: [{ rotate: '18deg' }] },
  blobBR: { right: -70, bottom: -60, transform: [{ rotate: '-15deg' }] },
  pendingBadge: { fontSize: 12, fontStyle: 'italic', color: PALETTE.tangerine },
});
