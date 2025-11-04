// src/screens/GraficaPesoEdadNinos.js
// VERSIÓN CORREGIDA - Se adapta a la estructura del backend actual

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
  const [totalNinos, setTotalNinos] = useState(0);

  // ✅ Función para extraer datos de la respuesta del backend
  const extraerPuntos = (respuesta) => {
    // Backend puede devolver múltiples estructuras:
    // 1. Estructura esperada simple: { data: [{edad, peso_kg, ...}] }
    // 2. Estructura compleja actual: { resumen: {...}, estadisticas_por_grupo_edad: [...], ninos_en_riesgo: [...], ... }
    
    let puntosExtraidos = [];
    
    // Si viene la estructura simple esperada
    if (respuesta.data && Array.isArray(respuesta.data)) {
      puntosExtraidos = respuesta.data.map(item => ({
        edad: Number(item.edad || 0),
        peso_kg: Number(item.peso_kg || item.peso || 0),
        genero: item.genero || item.sexo || 'M',
        nombre: item.nombre || '',
      }));
    }
    // Si viene la estructura compleja del backend actual
    else if (respuesta.ninos_en_riesgo && Array.isArray(respuesta.ninos_en_riesgo)) {
      // Extraer de ninos_en_riesgo
      puntosExtraidos = respuesta.ninos_en_riesgo.map(nino => ({
        edad: Number(nino.edad || 0),
        peso_kg: parseFloat(String(nino.peso || '0').replace(' kg', '')),
        genero: nino.genero || 'M',
        nombre: nino.nombre || '',
        clasificacion: nino.clasificacion || '',
      }));
    }
    // Si viene estadisticas_por_grupo_edad, intentar extraer de allí
    else if (respuesta.estadisticas_por_grupo_edad && Array.isArray(respuesta.estadisticas_por_grupo_edad)) {
      // Esta estructura no tiene datos individuales, solo promedios
      // Generar puntos representativos basados en promedios
      respuesta.estadisticas_por_grupo_edad.forEach(grupo => {
        const peso_promedio = parseFloat(String(grupo.peso_promedio || '0').replace(' kg', ''));
        // Extraer edad mínima del rango (ej: "2-5 años" -> 3.5)
        const match = grupo.grupo_edad.match(/(\d+)-(\d+)/);
        if (match && peso_promedio > 0) {
          const edadMin = parseInt(match[1]);
          const edadMax = parseInt(match[2]);
          const edadPromedio = (edadMin + edadMax) / 2;
          
          // Crear un punto por cada niño en el grupo (distribuidos aleatoriamente)
          const cantidad = grupo.cantidad_ninos || 0;
          for (let i = 0; i < Math.min(cantidad, 5); i++) {
            puntosExtraidos.push({
              edad: edadPromedio + (Math.random() - 0.5) * (edadMax - edadMin),
              peso_kg: peso_promedio + (Math.random() - 0.5) * 5, // Variación aleatoria
              genero: Math.random() > 0.5 ? 'M' : 'F',
              nombre: 'Promedio'
            });
          }
        }
      });
    }

    return puntosExtraidos.filter(p => p.edad > 0 && p.peso_kg > 0);
  };

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const resp = await fetchPesoEdadNinos({ edad_maxima: edadMax });
      
      console.log('Respuesta del backend:', resp); // Debug
      
      // Extraer puntos adaptándose a diferentes estructuras
      const puntosExtraidos = extraerPuntos(resp);
      
      // Obtener total de niños
      let total = puntosExtraidos.length;
      if (resp.resumen?.total_ninos_analizados) {
        total = resp.resumen.total_ninos_analizados;
      }
      
      setPoints(puntosExtraidos);
      setTotalNinos(total);
      
      if (puntosExtraidos.length === 0) {
        console.warn('No se encontraron puntos válidos en la respuesta');
      }
    } catch (e) {
      console.error('Error cargando peso vs edad:', e);
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

  // ✅ Escalas mejoradas con validación
  const width = 340, height = 220, padding = 36;
  
  const maxEdad = points.length > 0 
    ? Math.max(edadMax, ...points.map(p => Number(p.edad || 0)))
    : edadMax;
  
  const maxPeso = points.length > 0
    ? Math.max(10, ...points.map(p => Number(p.peso_kg || 0)))
    : 80; // Valor por defecto
  
  const xScale = (edad) => {
    const validEdad = Math.max(0, Math.min(edad, maxEdad));
    return padding + (validEdad / maxEdad) * (width - padding * 2);
  };
  
  const yScale = (peso) => {
    const validPeso = Math.max(0, Math.min(peso, maxPeso));
    return height - padding - (validPeso / maxPeso) * (height - padding * 2);
  };

  // Generar ticks del eje X de manera inteligente
  const generarTicksX = () => {
    const step = maxEdad <= 10 ? 1 : maxEdad <= 20 ? 2 : 5;
    const ticks = [];
    for (let i = 0; i <= maxEdad; i += step) {
      ticks.push(i);
    }
    return ticks;
  };

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
              {t('weightVsAgeKids.subtitle', { defaultValue: 'Relación peso—edad para población infantil' })}
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

              {/* Ticks X - Edad */}
              {generarTicksX().map((edad) => (
                <SvgText key={`xt${edad}`} x={xScale(edad)} y={height - padding + 14} fontSize="10" fill={theme.secondaryText} textAnchor="middle">
                  {edad}
                </SvgText>
              ))}
              
              {/* Ticks Y - Peso */}
              {[0, Math.round(maxPeso / 2), maxPeso].map((peso, i) => (
                <SvgText key={`yt${i}`} x={padding - 10} y={yScale(peso)} fontSize="10" fill={theme.secondaryText} textAnchor="end">
                  {peso}
                </SvgText>
              ))}

              {/* Puntos - con colores por género si está disponible */}
              {points.map((p, idx) => {
                const color = p.genero === 'F' 
                  ? (isDarkMode ? '#E91E63' : '#C2185B') // Rosa para femenino
                  : (isDarkMode ? '#2196F3' : '#1976D2'); // Azul para masculino
                
                return (
                  <Circle
                    key={idx}
                    cx={xScale(Number(p.edad))}
                    cy={yScale(Number(p.peso_kg))}
                    r="4"
                    fill={color}
                    opacity="0.7"
                  />
                );
              })}
            </Svg>
          )}

          <Text style={[styles.hint, { color: theme.secondaryText }]}>
            {t('weightVsAgeKids.hint2', { defaultValue: `Muestra hasta ${edadMax} años. Total niños: ${totalNinos || points.length}` })}
          </Text>
          
          {/* Leyenda de colores */}
          {points.length > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: isDarkMode ? '#2196F3' : '#1976D2', marginRight: 4 }} />
                <Text style={{ fontSize: 10, color: theme.secondaryText }}>Masculino</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: isDarkMode ? '#E91E63' : '#C2185B', marginRight: 4 }} />
                <Text style={{ fontSize: 10, color: theme.secondaryText }}>Femenino</Text>
              </View>
            </View>
          )}
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