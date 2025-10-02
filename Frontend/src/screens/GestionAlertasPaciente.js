// src/screens/GestionAlertasPaciente.js (actualizado para i18n)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ConnectivityService from '../services/ConnectivityService';
import OfflineStorage from '../services/OfflineStorage';
import SyncService from '../services/SyncService';
import { useTranslation } from 'react-i18next';

const PALETTE = { tangerine: '#F08C21', blush: '#E36888', butter: '#F2D88F', sea: '#6698CC', cream: '#FFF7DA' };

export default function GestionAlertasPaciente({ route }) {
  const { paciente } = route.params;
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation();

  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signos, setSignos] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStage, setSyncStage] = useState('idle');

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}/alertas-medicas`);
      const data = await res.json();
      setFlags(Array.isArray(data) ? data : []);
    } catch (_) { setFlags([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFlags(); }, [paciente?.id_paciente]);

  const fetchSignos = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}/signos`);
      const data = await res.json();
      setSignos(Array.isArray(data) ? data : []);
    } catch (_) { setSignos([]); }
  };

  const refreshPending = async () => {
    try {
      const items = await OfflineStorage.getPendingFlags();
      setPendingCount(items.filter(i => i.id_paciente === paciente.id_paciente).length);
    } catch (_) { setPendingCount(0); }
  };

  useEffect(() => {
    fetchSignos();
    refreshPending();
    const off = SyncService.addSyncListener((status) => {
      setSyncStage(status);
      if (status === 'complete') {
        refreshPending();
        fetchFlags();
      }
    });
    return () => { if (typeof off === 'function') off(); };
  }, [paciente?.id_paciente]);

  const crearFlagManual = async () => {
    try {
      const payload = {
        tipo_alerta_medica: 'Otro',
        descripcion_medica: 'Marcado manual para seguimiento',
        prioridad_medica: 'Media',
        estado_alerta: 'Pendiente'
      };
      const res = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}/alertas-medicas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(t('alerts.createFailed'));
      Alert.alert(t('alerts.ok'), t('alerts.created'));
    } catch (e) {
      Alert.alert(t('alerts.error'), e.message);
    }
  };

  const autoEvaluar = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/alertas/auto-evaluar/${paciente.id_paciente}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t('alerts.createFailed'));
      Alert.alert(t('alerts.autoEvalTitle'), data.mensaje || t('alerts.autoEvalDone'));
      fetchFlags();
    } catch (e) {
      Alert.alert(t('alerts.error'), e.message);
    }
  };

  const levelKeyToLabel = (nivel) => t(`levels.${nivel}`, { defaultValue: nivel });

  const setManual = async (nivel) => {
    try {
      const online = await ConnectivityService.getConnectionStatus();
      if (!online) {
        await OfflineStorage.savePendingFlag({ id_paciente: paciente.id_paciente, nivel });
        refreshPending();
        Alert.alert(t('alerts.offlineTitle'), t('alerts.offlineSaved'));
        return;
      }
      const res = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}/alertas-medicas/manual`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nivel })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t('alerts.createFailed'));
      Alert.alert(t('alerts.ok'), t('alerts.flagApplied', { level: levelKeyToLabel(nivel) }));
      fetchFlags();
      SyncService.manualSync();
    } catch (e) { Alert.alert(t('alerts.error'), e.message); }
  };

  const priorityColor = (p) => {
    if (p === 'Crítica' || p === 'Critical') return '#E53935';
    if (p === 'Alta' || p === 'High') return '#F08C21';
    if (p === 'Media' || p === 'Medium') return '#FFC107';
    return '#4CAF50';
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : PALETTE.butter }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      <View style={[styles.card, { backgroundColor: theme.cardBackground || (isDarkMode ? '#1E1E1E' : '#fff'), borderColor: '#EAD8A6' }]}>
        <Text style={[styles.title, { color: theme.text }]}>{t('screens.alertsMgmt.title')}</Text>
        <Text style={{ color: theme.secondaryText }}>
          {paciente.nombre} {paciente.apellido || ''} • {paciente.comunidad_pueblo || 'Sin comunidad'}
        </Text>

        {/* Estado de sincronización de flags manuales */}
        <View style={[styles.syncRow, { backgroundColor: isDarkMode ? '#262626' : '#FFFDF6', borderColor: '#EAD8A6' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {syncStage === 'started' ? (
              <ActivityIndicator size="small" color={PALETTE.tangerine} />
            ) : (
              <View style={[styles.dot, { backgroundColor: pendingCount > 0 ? '#FFC107' : '#4CAF50' }]} />
            )}
            <Text style={{ color: theme.text, fontWeight: '700' }}>
              {syncStage === 'started'
                ? t('sync.syncing')
                : pendingCount > 0
                ? t('sync.queued', { count: pendingCount })
                : t('sync.synced')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => SyncService.manualSync()} style={[styles.retryBtn, { borderColor: '#EAD8A6' }]}>
            <Ionicons name="refresh" size={16} color={PALETTE.tangerine} />
            <Text style={{ color: PALETTE.tangerine, fontWeight: '800' }}>{t('sync.retry')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: PALETTE.tangerine }]} onPress={crearFlagManual}>
            <Ionicons name="flag-outline" color="#fff" size={18} />
            <Text style={styles.btnText}>{t('actions.markFollowUp')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: PALETTE.blush }]} onPress={autoEvaluar}>
            <Ionicons name="pulse-outline" color="#fff" size={18} />
            <Text style={styles.btnText}>{t('actions.autoEvaluate')}</Text>
          </TouchableOpacity>
        </View>

        {/* Escalera de colores */}
        <View style={[styles.row, { marginTop: 12 }]}>
          <TouchableOpacity style={[styles.badge, { backgroundColor: '#86C5FF' }]} onPress={() => setManual('celeste')}>
            <Text style={styles.badgeText}>{t('levels.celeste')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.badge, { backgroundColor: '#4CAF50' }]} onPress={() => setManual('verde')}>
            <Text style={styles.badgeText}>{t('levels.verde')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.badge, { backgroundColor: '#FFC107' }]} onPress={() => setManual('amarillo')}>
            <Text style={styles.badgeText}>{t('levels.amarillo')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.badge, { backgroundColor: '#F08C21' }]} onPress={() => setManual('naranja')}>
            <Text style={styles.badgeText}>{t('levels.naranja')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.badge, { backgroundColor: '#E53935' }]} onPress={() => setManual('rojo')}>
            <Text style={styles.badgeText}>{t('levels.rojo')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.cardBackground || (isDarkMode ? '#1E1E1E' : '#fff'), borderColor: '#EAD8A6' }]}>
        <Text style={[styles.subtitle, { color: theme.text }]}>{t('screens.alertsMgmt.patientAlerts')}</Text>
        {flags.length === 0 ? (
          <Text style={{ color: theme.secondaryText }}>{t('screens.alertsMgmt.noAlerts')}</Text>
        ) : flags.map(f => (
          <View key={f.id_alerta_medica} style={styles.flagItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.dot, { backgroundColor: priorityColor(f.prioridad_medica) }]} />
              <Text style={{ color: theme.text, fontWeight: '700' }}>
                {f.tipo_alerta_medica} • {f.prioridad_medica}
              </Text>
            </View>
            <Text style={{ color: theme.secondaryText }}>{f.descripcion_medica}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: theme.cardBackground || (isDarkMode ? '#1E1E1E' : '#fff'), borderColor: '#EAD8A6' }]}>
        <Text style={[styles.subtitle, { color: theme.text }]}>{t('screens.alertsMgmt.history')}</Text>
        {signos.length === 0 ? (
          <Text style={{ color: theme.secondaryText }}>{t('screens.alertsMgmt.noForms')}</Text>
        ) : (
          signos.map((s, idx) => {
            const peso = Number(s.peso) || null;
            const est = Number(s.estatura) || null;
            let imc = null;
            if (peso && est) { const m = est/100; imc = (peso/(m*m)).toFixed(1); }
            const fecha = (s.fecha_toma || s.createdAt || '').slice(0,10);
            return (
              <View key={s.id_signo || idx} style={styles.histItem}>
                <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                  <Text style={{ color: theme.text, fontWeight:'700' }}>{fecha || t('screens.alertsMgmt.noDate')}</Text>
                  {imc && <Text style={{ color: theme.secondaryText }}>{t('metrics.bmi')}: {imc}</Text>}
                </View>
                <Text style={{ color: theme.secondaryText }}>
                  {t('metrics.bp')} {s.presion_arterial_sistolica ?? '-'} / {s.presion_arterial_diastolica ?? '-'}
                  {' '}• {t('metrics.hr')} {s.frecuencia_cardiaca ?? '-'}
                  {' '}• {t('metrics.spo2')} {s.saturacion_oxigeno ?? '-'}
                  {' '}• {t('metrics.glucose')} {s.glucosa ?? '-'}
                  {' '}• {t('metrics.temp')} {s.temperatura ?? '-'}
                  {' '}• {t('metrics.weight')} {s.peso ?? '-'}{t('metrics.kg')}
                  {' '}• {t('metrics.height')} {s.estatura ?? '-'}{t('metrics.cm')}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '800' },
  flagItem: { paddingVertical: 8, borderTopWidth: 1, borderColor: '#EAD8A6' },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#EAD8A6' },
  syncRow: { marginTop: 12, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  retryBtn: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  histItem: { paddingVertical: 8, borderTopWidth: 1, borderColor: '#EAD8A6' }
});
