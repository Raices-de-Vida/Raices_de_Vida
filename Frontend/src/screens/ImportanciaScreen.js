// src/screens/ImportanciaScreen.js (actualizado para i18n)
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';

export default function ImportanciaScreen({ navigation }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#F2D88F' }]}>
      {/* ===== App Bar tipo tarjeta ===== */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: isDarkMode ? theme.inputBackground : '#FFF7DA', borderColor: theme.border || '#F1E7C6' }
        ]}
      >
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <Image
            source={isDarkMode ? require('../styles/logos/LogoDARK.png') : require('../styles/logos/LogoBRIGHT.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View>
            <Text style={[styles.topTitle, { color: theme.text }]}>{t('screens.importance.title')}</Text>
            <Text style={[styles.topSubtitle, { color: isDarkMode ? theme.secondaryText : '#6698CC' }]}>
              {t('screens.importance.subtitle')}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={toggleDarkMode} style={styles.toggleButton} activeOpacity={0.7}>
          <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* ===== Contenido ===== */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.imageCard,
            { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder || 'rgba(0,0,0,0.06)' }
          ]}
        >
          <Image
            source={require('../../assets/importancia-higiene.png')} // asegúrate que exista
            style={styles.infografia}
            resizeMode="contain"
            accessible
            accessibilityLabel={t('screens.importance.subtitle')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const RADIUS = 16;

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* ===== App Bar ===== */
  topBar: {
    height: 72,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  leftGroup: { flexDirection: 'row', alignItems: 'center' },
  backButton: {
    padding: 8,
    borderRadius: 10,
    marginRight: 6
  },
  logo: { width: 36, height: 36, marginRight: 10, borderRadius: 8 },
  topTitle: { fontSize: 20, fontWeight: '800' },
  topSubtitle: { marginTop: 2, fontSize: 12, fontWeight: '700' },
  toggleButton: { padding: 6, borderRadius: 10 },

  /* ===== Contenido ===== */
  content: { padding: 20, paddingBottom: 40 },
  imageCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  infografia: {
    width: '100%',
    height: 420,
    borderRadius: 12
  }
});
