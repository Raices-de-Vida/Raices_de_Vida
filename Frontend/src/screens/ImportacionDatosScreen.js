// src/screens/ImportacionDatosScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';

const PALETTE = { butter: '#F2D88F', cream: '#FFF7DA', blush: '#E36888', sea: '#6698CC' };

export default function ImportacionDatosScreen({ navigation }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('ImportacionDatos');

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : PALETTE.butter }}>
      {/* ===== Top bar ===== */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDarkMode ? theme.inputBackground : PALETTE.cream,
            borderColor: theme.border || '#EADFBF',
          },
        ]}
      >
        <View style={styles.titleRow}>
          <Image
            source={
              isDarkMode
                ? require('../styles/logos/LogoDARK.png')
                : require('../styles/logos/LogoBRIGHT.png')
            }
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.topTitle, { color: theme.text }]}>{t('top.title')}</Text>
            <Text style={[styles.topSubtitle, { color: PALETTE.sea }]}>{t('top.subtitle')}</Text>
          </View>
        </View>

        {/* Botón de modo oscuro/luz arriba */}
        <TouchableOpacity style={styles.themeToggle} onPress={toggleDarkMode}>
          <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* ===== Contenido ===== */}
      <View style={styles.content}>
        {/* Card: Cargar desde Excel */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
          onPress={() => {}}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBadge, { backgroundColor: isDarkMode ? '#203244' : '#EAF2FB' }]}>
            <Ionicons name="cloud-upload-outline" size={22} color={PALETTE.sea} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{t('cards.importExcel.title')}</Text>
            <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>
              {t('cards.importExcel.subtitle')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
        </TouchableOpacity>

        {/* Card: Exportar a Excel */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
          onPress={() => {}}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBadge, { backgroundColor: isDarkMode ? '#2B2A22' : '#FFF1DE' }]}>
            <Ionicons name="download-outline" size={22} color={PALETTE.blush} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{t('cards.exportExcel.title')}</Text>
            <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>
              {t('cards.exportExcel.subtitle')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
        </TouchableOpacity>

        {/* Card: Mapa de Guatemala */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
          onPress={() => navigation.navigate('MapaDepartamentos')}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBadge, { backgroundColor: isDarkMode ? '#243126' : '#E6F6EA' }]}>
            <Ionicons name="map-outline" size={22} color="#2E7D32" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{t('cards.mapGt.title')}</Text>
            <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>
              {t('cards.mapGt.subtitle')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
        </TouchableOpacity>
      </View>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  /* Top bar */
  topBar: {
    height: 72,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 34, height: 34, marginRight: 10, borderRadius: 8 },
  topTitle: { fontSize: 20, fontWeight: '800', lineHeight: 22 },
  topSubtitle: { marginTop: 4, fontSize: 12, fontWeight: '700' },
  themeToggle: { marginTop: 8, padding: 6, borderRadius: 10 },

  /* Contenido */
  content: { flex: 1, padding: 20, paddingBottom: 120 },

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
