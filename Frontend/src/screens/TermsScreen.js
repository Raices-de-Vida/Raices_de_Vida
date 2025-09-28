// src/screens/TermsScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';
import { useTranslation } from 'react-i18next';

const PALETTE = {
  tangerine: '#F08C21',
  blush:     '#E36888',
  butter:    '#F2D88F',
  sea:       '#6698CC',
  cream:     '#FFF7DA',
};

export default function TermsScreen({ navigation }) {
  const [accepted, setAccepted] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('Terms');

  // Colores para “vibes”: en claro usamos la paleta; en oscuro usamos el theme
  const bg       = isDarkMode ? theme.background        : PALETTE.butter;
  const paperBg  = isDarkMode ? (theme.card || theme.inputBackground) : PALETTE.cream;
  const border   = isDarkMode ? theme.border            : '#EAD8A6';
  const titleCol = isDarkMode ? theme.text              : PALETTE.blush;
  const accent   = isDarkMode ? theme.secondaryButton   : PALETTE.sea;
  const btnPrim  = isDarkMode ? theme.primaryButton     : PALETTE.tangerine;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: bg }]}>
      <ThemeToggle />

      {/* decor: blobs y un par de hojas */}
      <View style={[styles.blob, styles.blobTL, { backgroundColor: accent, opacity: 0.18 }]} />
      <View style={[styles.blob, styles.blobBR, { backgroundColor: titleCol, opacity: 0.16 }]} />
      <Leaf color={accent} rotate="-18deg" style={{ position: 'absolute', top: 110, left: 26 }} />
      <Leaf color={accent} rotate="16deg"  style={{ position: 'absolute', top: 160, left: 64 }} />
      <Leaf color={titleCol} rotate="-22deg" style={{ position: 'absolute', bottom: 70, right: 78 }} />

      {/* “paper” */}
      <View style={[styles.paper, { backgroundColor: paperBg, borderColor: border }]}>

        <Text style={[styles.title, { color: titleCol }]}>{t('title')}</Text>
        <Text style={[styles.small, { color: isDarkMode ? theme.secondaryText : '#6B7280' }]}>
          {t('lastUpdated')}
        </Text>

        <Section title={t('sections.s1.title')} color={accent}>
          {t('sections.s1.body')}
        </Section>

        <Section title={t('sections.s2.title')} color={accent}>
          {t('sections.s2.body')}
        </Section>

        <Section title={t('sections.s3.title')} color={accent}>
          {t('sections.s3.body')}
        </Section>

        <Section title={t('sections.s4.title')} color={accent}>
          {t('sections.s4.body')}
        </Section>

        <Section title={t('sections.s5.title')} color={accent}>
          {t('sections.s5.body')}
        </Section>

        <Section title={t('sections.s6.title')} color={accent}>
          {t('sections.s6.body')}
        </Section>

        <Section title={t('sections.s7.title')} color={accent}>
          {t('sections.s7.body')}
        </Section>

        <Section title={t('sections.s8.title')} color={accent}>
          {t('sections.s8.body')}
        </Section>

        <Section title={t('sections.s9.title')} color={accent}>
          {t('sections.s9.body')}
        </Section>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={() => setAccepted(!accepted)}>
            <MaterialIcons
              name={accepted ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={accepted ? accent : (isDarkMode ? theme.secondaryText : '#94A3B8')}
            />
          </TouchableOpacity>
          <Text style={[styles.checkboxText, { color: isDarkMode ? theme.text : '#1F2937' }]}>
            {t('acceptLabel')}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: btnPrim }, !accepted && { opacity: 0.5 }]}
          disabled={!accepted}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>{t('continue')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ====== Componentes auxiliares ====== */
const Section = ({ title, color, children }) => (
  <View style={{ marginTop: 16 }}>
    <Text style={{ fontSize: 16, fontWeight: '700', color }}>{title}</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, marginTop: 6 }}>{children}</Text>
  </View>
);

const Leaf = ({ color, rotate = '0deg', style }) => (
  <View
    style={[
      {
        width: 26,
        height: 17,
        backgroundColor: color,
        borderTopLeftRadius: 26,
        borderBottomRightRadius: 26,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        opacity: 0.85,
        transform: [{ rotate }],
      },
      style,
    ]}
  />
);

const RADIUS = 18;

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1, alignItems: 'center' },

  // blobs de fondo
  blob: { position: 'absolute', width: 260, height: 260, borderRadius: 90 },
  blobTL: { top: -70, left: -60, transform: [{ rotate: '18deg' }] },
  blobBR: { right: -70, bottom: -60, transform: [{ rotate: '-15deg' }] },

  // tarjeta “paper”
  paper: {
    width: '100%',
    maxWidth: 720,
    borderWidth: 1,
    borderRadius: RADIUS,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  title: { fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  small: { fontSize: 13, textAlign: 'center', marginBottom: 10 },

  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 14 },
  checkboxText: { marginLeft: 10, fontSize: 14 },

  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
