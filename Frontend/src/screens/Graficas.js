// src/screens/Graficas.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';

const PALETTE = { butter: '#F2D88F', cream: '#FFF7DA' };
const BRAND = { primary: '#1E9E55', blush: '#E36888', sea: '#6698CC', green: '#2E7D32' };

const CARDS = [
  {
    id: '1',
    titleKey: 'cards.casesByPlace.title',
    subKey:   'cards.casesByPlace.subtitle',
    title: 'Casos reportados por lugar',
    subtitle: 'Personas vistas por un doctor — cada 4 meses (municipios / comunidades)',
    icon: 'stats-chart-outline',
    color: BRAND.sea,
    route: 'GraficaCasosLugar',
    badgeBgLight: '#EAF2FB',
    badgeBgDark:  '#203244',
  },
  {
    id: '2',
    titleKey: 'cards.chronicAges.title',
    subKey:   'cards.chronicAges.subtitle',
    title: 'Rangos de edad (crónicos)',
    subtitle: 'Pacientes con Hipertensión y Diabetes — cantidades por rango de edad',
    icon: 'pulse-outline',
    color: BRAND.blush,
    route: 'GraficaCronicosEdad',
    badgeBgLight: '#FFF1DE',
    badgeBgDark:  '#2B2A22',
  },
  {
    id: '3',
    titleKey: 'cards.weightVsAgeKids.title',
    subKey:   'cards.weightVsAgeKids.subtitle',
    title: 'Peso vs. edad (niños)',
    subtitle: 'Relación peso–edad para población infantil',
    icon: 'analytics-outline',
    color: BRAND.green,
    route: 'GraficaPesoEdadNinos',
    badgeBgLight: '#E6F6EA',
    badgeBgDark:  '#243126',
  },
];

export default function PantallaGraficas() {
  const navigation = useNavigation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('Graficas');

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : PALETTE.butter }}>
      {/* ===== Header estilo UserManagementScreen ===== */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDarkMode ? theme.inputBackground : PALETTE.cream,
            borderColor: isDarkMode ? (theme.border || '#EADFBF') : '#EADFBF',
          },
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
              {t('top.title', { defaultValue: 'Gráficas y Reportes' })}
            </Text>
            <Text style={[styles.topSubtitle, { color: isDarkMode ? theme.secondaryText : BRAND.primary }]}>
              {t('top.subtitle', { defaultValue: 'Indicadores y visualizaciones' })}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.themeToggle} onPress={toggleDarkMode} activeOpacity={0.9}>
          <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={20} color={isDarkMode ? theme.text : '#1B1B1B'} />
        </TouchableOpacity>
      </View>

      {/* ===== Contenido: tarjetas ===== */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {CARDS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground, borderColor: theme.border || '#E5E7EB' },
            ]}
            onPress={() => navigation.navigate(c.route)}
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: isDarkMode ? c.badgeBgDark : c.badgeBgLight },
              ]}
            >
              <Ionicons name={c.icon} size={22} color={c.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {t(c.titleKey, { defaultValue: c.title })}
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>
                {t(c.subKey, { defaultValue: c.subtitle })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  /* Header (copiado del layout de UserManagementScreen) */
  topBar: {
    height: 72,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    marginHorizontal: 16,
  },
  backBtn: { padding: 8, borderRadius: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 4 },
  logo: { width: 30, height: 30, marginRight: 10, borderRadius: 8 },
  topTitle: { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  topSubtitle: { marginTop: 2, fontSize: 12, fontWeight: '700' },
  themeToggle: { padding: 6, borderRadius: 10 },

  /* Tarjetas */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSubtitle: { fontSize: 13, marginTop: 2 },
});
