// src/screens/GraficaPesoEdadNinos.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, RefreshControl, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Circle, Text as SvgText, Line } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';
import { fetchPesoEdadNinos } from '../services/statsService';

const PALETTE = { butter: '#F2D88F', cream: '#FFF7DA' };

export default function GraficaPesoEdadNinos({ navigation }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('Graficas');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [points, setPoints] = useState([]);
  const [edadMax] = useState(18);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const resp = await fetchPesoEdadNinos({ edad_maxima: edadMax });
      setPoints(resp.data || []); // [{edad, peso_kg, ...}]
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, [edadMax]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Escalas (como las tenías)
  const width = 340, height = 220, padding = 36;
  const maxEdad = Math.max(1, ...points.map(p => Number(p.edad || 0)));
  const maxPeso = Math.max(1, ...points.map(p => Number(p.peso_kg || 0)));
  const xScale = (edad) => padding + (edad / maxEdad) * (width - padding * 2);
  const yScale = (peso) => height - padding - (peso / maxPeso) * (height - padding * 2);

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
              {t('weightVsAgeKids.title', { defaultValue: 'Peso vs. edad (niños)' })}
            </Text>
            <Text style={[styles.topSubtitle, { color: isDarkMode ? theme.secondaryText : '#1E9E55' }]}>
              {t('weightVsAgeKids.subtitle', { defaultValue: 'Relación peso–edad para población infantil' })}
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
            {t('weightVsAgeKids.chartTitle', { defaultValue: 'Dispersión: peso (kg) vs edad (años)' })}
          </Text>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : error ? (
            <Text style={{ color: '#E11D48', marginTop: 10 }}>{error}</Text>
          ) : points.length === 0 ? (
            <Text style={{ color: theme.secondaryText, marginTop: 10 }}>
              {t('empty', { defaultValue: 'Sin datos.' })}
            </Text>
          ) : (
            <Svg width={width} height={height} style={{ alignSelf: 'center', marginTop: 10 }}>
              {/* Ejes */}
              <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={theme.secondaryText} strokeWidth="1" />
              <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke={theme.secondaryText} strokeWidth="1" />

              {/* Ticks X */}
              {Array.from({ length: maxEdad }, (_, i) => i + 1).map((e) => (
                <SvgText key={`xt${e}`} x={xScale(e)} y={height - padding + 14} fontSize="10" fill={theme.secondaryText} textAnchor="middle">
                  {e}
                </SvgText>
              ))}
              {/* Ticks Y */}
              {[0, Math.round(maxPeso / 2), maxPeso].map((p, i) => (
                <SvgText key={`yt${i}`} x={padding - 10} y={yScale(p)} fontSize="10" fill={theme.secondaryText} textAnchor="end">
                  {p}
                </SvgText>
              ))}

              {/* Puntos */}
              {points.map((p, idx) => (
                <Circle
                  key={idx}
                  cx={xScale(Number(p.edad))}
                  cy={yScale(Number(p.peso_kg))}
                  r="4"
                  fill={isDarkMode ? '#8BC34A' : '#2E7D32'}
                />
              ))}
            </Svg>
          )}

          <Text style={[styles.hint, { color: theme.secondaryText }]}>
            {t('weightVsAgeKids.hint2', { defaultValue: `Muestra hasta ${edadMax} años. Total niños: ${points.length}` })}
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
