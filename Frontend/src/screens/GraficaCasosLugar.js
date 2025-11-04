// src/screens/GraficaCasosLugar.js
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
import { fetchCasosPorLugar } from '../services/statsService';

const PALETTE = { butter: '#F2D88F', cream: '#FFF7DA', sea: '#6698CC' };

export default function GraficaCasosLugar({ navigation }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('Graficas');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [periodo, setPeriodo] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const resp = await fetchCasosPorLugar({ meses: 4 });
      setRows(resp.data || []); // [{municipio, comunidad, personas_vistas, consultas}]
      setPeriodo({ desde: resp.desde, hasta: resp.hasta });
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Adaptar a tu forma de pintar las barras
  const DATA_CASOS = rows.map(r => ({
    lugar: (r.municipio || r.comunidad)
      ? `${r.municipio || ''}${r.municipio && r.comunidad ? ' / ' : ''}${r.comunidad || ''}`.trim() || '—'
      : '—',
    casos: Number(r.personas_vistas || 0),
  }));

  // Parámetros del gráfico (igual a tu diseño)
  const width = 320, height = 200, padding = 28;
  const barWidth = (width - padding * 2) / Math.max(DATA_CASOS.length, 1) - 10;
  const maxVal = Math.max(1, ...DATA_CASOS.map(d => d.casos));
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
              {t('casesByPlace.title', { defaultValue: 'Casos por lugar' })}
            </Text>
            <Text style={[styles.topSubtitle, { color: isDarkMode ? theme.secondaryText : '#1E9E55' }]}>
              {t('casesByPlace.subtitle', { defaultValue: 'Cada 4 meses (municipios / comunidades)' })}
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
            {t('casesByPlace.chartTitle', { defaultValue: 'Casos reportados por lugar (último corte 4m)' })}
          </Text>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : error ? (
            <Text style={{ color: '#E11D48', marginTop: 10 }}>{error}</Text>
          ) : DATA_CASOS.length === 0 ? (
            <Text style={{ color: theme.secondaryText, marginTop: 10 }}>
              {t('empty', { defaultValue: 'Sin datos para el periodo.' })}
            </Text>
          ) : (
            <Svg width={width} height={height} style={{ alignSelf: 'center', marginTop: 10 }}>
              {/* Ejes */}
              <Rect x={padding - 1} y={padding - 1} width={1} height={height - padding * 2} fill={theme.secondaryText} />
              <Rect x={padding - 2} y={height - padding} width={width - padding * 2} height={1} fill={theme.secondaryText} />

              {/* Barras */}
              {DATA_CASOS.map((d, i) => {
                const h = scaleY(d.casos);
                const x = padding + i * ((width - padding * 2) / DATA_CASOS.length) + 5;
                const y = height - padding - h;
                return (
                  <React.Fragment key={`${d.lugar}-${i}`}>
                    <Rect x={x} y={y} width={barWidth} height={h} fill={PALETTE.sea} rx={6} />
                    <SvgText x={x + barWidth / 2} y={height - padding + 14} fontSize="10" fill={theme.secondaryText} textAnchor="middle">
                      {d.lugar?.length > 10 ? d.lugar.slice(0, 10) + '…' : d.lugar}
                    </SvgText>
                    <SvgText x={x + barWidth / 2} y={y - 4} fontSize="10" fill={theme.text} textAnchor="middle">
                      {d.casos}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          )}

          <Text style={[styles.hint, { color: theme.secondaryText }]}>
            {periodo ? `Periodo: ${periodo.desde} a ${periodo.hasta}` : ''}
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
