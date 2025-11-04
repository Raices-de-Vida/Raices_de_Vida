// src/screens/GraficaCronicosEdad.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, RefreshControl, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';
import { fetchCronicosPorEdad } from '../services/statsService';

const PALETTE = { butter: '#F2D88F', cream: '#FFF7DA', sea: '#6698CC', blush: '#E36888' };

export default function GraficaCronicosEdad({ navigation }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('Graficas');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [rangos, setRangos] = useState([]);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const resp = await fetchCronicosPorEdad();
      setTotal(resp.total_pacientes_cronicos || 0);
      const r = resp.rangos || {};
      // Orden fijo para las barras
      setRangos([
        { rango: '0-17', total: r['0-17'] || 0 },
        { rango: '18-29', total: r['18-29'] || 0 },
        { rango: '30-44', total: r['30-44'] || 0 },
        { rango: '45-59', total: r['45-59'] || 0 },
        { rango: '60+', total: r['60+'] || 0 },
        { rango: t('unknown', { defaultValue: 'desconocida' }), total: r['desconocida'] || 0 },
      ]);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Parámetros del gráfico (se mantienen como los tuyos)
  const width = 340, height = 220, padding = 28;
  const barWidth = (width - padding * 2) / Math.max(rangos.length, 1) - 8;
  const maxVal = Math.max(1, ...rangos.map(d => d.total));
  const scaleY = (val) => (val / maxVal) * (height - padding * 2);

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : PALETTE.butter }}>
      {/* HEADER estilo UserManagementScreen */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDarkMode ? theme.inputBackground : PALETTE.cream,
            borderColor: isDarkMode ? (theme.border || '#EADFBF') : '#EADFBF',
          }
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={22} color={isDarkMode ? theme.text : '#1B1B1B'} />
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Image
            source={isDarkMode ? require('../styles/logos/LogoDARK.png') : require('../styles/logos/LogoBRIGHT.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.topTitle, { color: isDarkMode ? theme.text : '#1B1B1B' }]}>
              {t('chronicAges.title', { defaultValue: 'Rangos de edad (crónicos)' })}
            </Text>
            <Text style={[styles.topSubtitle, { color: isDarkMode ? theme.secondaryText : '#1E9E55' }]}>
              {t('chronicAges.subtitle', { defaultValue: 'Hipertensión y Diabetes — cantidades' })}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.themeToggle} onPress={toggleDarkMode}>
          <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={20} color={isDarkMode ? theme.text : '#1B1B1B'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border || '#E5E7EB' }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {t('chronicAges.chartTitle', { defaultValue: 'Pacientes crónicos por rango de edad' })}
          </Text>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : error ? (
            <Text style={{ color: '#E11D48', marginTop: 10 }}>{error}</Text>
          ) : rangos.length === 0 ? (
            <Text style={{ color: theme.secondaryText, marginTop: 10 }}>
              {t('empty', { defaultValue: 'Sin datos.' })}
            </Text>
          ) : (
            <Svg width={width} height={height} style={{ alignSelf: 'center', marginTop: 10 }}>
              {/* Ejes */}
              <Rect x={padding - 1} y={padding - 1} width={1} height={height - padding * 2} fill={theme.secondaryText} />
              <Rect x={padding - 2} y={height - padding} width={width - padding * 2} height={1} fill={theme.secondaryText} />

              {/* Barras */}
              {rangos.map((d, i) => {
                const h = scaleY(d.total);
                const x = padding + i * ((width - padding * 2) / rangos.length) + 4;
                const y = height - padding - h;
                return (
                  <React.Fragment key={`${d.rango}-${i}`}>
                    <Rect x={x} y={y} width={barWidth} height={h} fill={PALETTE.blush} rx={6} />
                    <SvgText x={x + barWidth / 2} y={height - padding + 14} fontSize="10" fill={theme.secondaryText} textAnchor="middle">
                      {d.rango}
                    </SvgText>
                    <SvgText x={x + barWidth / 2} y={y - 4} fontSize="10" fill={theme.text} textAnchor="middle">
                      {d.total}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          )}

          <Text style={[styles.hint, { color: theme.secondaryText }]}>
            {t('chronicAges.hint2', { defaultValue: `Total crónicos únicos: ${total}` })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 72, marginTop: 12, marginBottom: 8, paddingHorizontal: 12,
    borderWidth: 1, borderRadius: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2,
    marginHorizontal: 16,
  },
  backBtn: { padding: 8, borderRadius: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 4 },
  logo: { width: 30, height: 30, marginRight: 10, borderRadius: 8 },
  topTitle: { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  topSubtitle: { marginTop: 2, fontSize: 12, fontWeight: '700' },
  themeToggle: { padding: 6, borderRadius: 10 },

  card: {
    borderWidth: 1, borderRadius: 16, padding: 16,
    shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  hint: { marginTop: 8, fontSize: 12 },
});
