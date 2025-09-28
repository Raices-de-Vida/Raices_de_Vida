// src/screens/Graficas.js
import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const GRAFICAS = [
  { id: '1', labelKey: 'cards.byDept',       icono: 'chart-bar',          ruta: 'GraficaDepartamento', color: '#ff7043' },
  { id: '2', labelKey: 'cards.monthlyTrend', icono: 'chart-line',         ruta: 'GraficaTendencia',    color: '#66bb6a' },
  { id: '3', labelKey: 'cards.ageGender',    icono: 'chart-pie',          ruta: 'GraficaEdadGenero',   color: '#ff7043' },
  { id: '4', labelKey: 'cards.weightVsAge',  icono: 'chart-scatter-plot', ruta: 'GraficaPesoEdad',     color: '#66bb6a' }
];

export default function PantallaGraficas() {
  const navigation = useNavigation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('Graficas');

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card(theme, isDarkMode)}
      onPress={() => navigation.navigate(item.ruta)}
    >
      <MaterialCommunityIcons name={item.icono} size={36} color={item.color} style={styles.icono} />
      <Text style={[styles.texto, { color: theme.text }]}>{t(item.labelKey)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#F2D88F' }]}>
      {/* ===== Header moderno como Home ===== */}
      <View style={[styles.topBar, { backgroundColor: isDarkMode ? theme.inputBackground : '#FFF7DA' }]}>
        <View style={styles.titleRow}>
          <Image
            source={
              isDarkMode
                ? require('../styles/logos/LogoDARK.png')
                : require('../styles/logos/LogoBRIGHT.png')
            }
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

      {/* Lista de gráficas */}
      <FlatList
        data={GRAFICAS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingTop: 10, paddingBottom: 100 }}
      />

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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

  /* ===== Cards ===== */
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
  icono: { marginRight: 15 },
  texto: { fontSize: 16, flex: 1, flexWrap: 'wrap' },
});
