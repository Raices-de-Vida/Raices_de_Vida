// src/screens/DatosAyudaScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';

export default function DatosAyudaScreen({ navigation }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? theme.background : '#F2D88F' }}>
      {/* Header tipo píldora */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDarkMode ? theme.inputBackground : '#FFF7DA',
            borderColor: theme.border || '#EADFBF',
          },
        ]}
      >
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
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
            <Text style={[styles.topTitle, { color: theme.text }]}>Datos de ayuda</Text>
            <Text
              style={[
                styles.topSubtitle,
                { color: isDarkMode ? theme.secondaryText : '#6698CC' },
              ]}
            >
              Guías, tips e infografías
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.themeToggle} onPress={toggleDarkMode}>
          <Ionicons
            name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
            size={22}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Recomendaciones */}
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder || 'rgba(0,0,0,0.06)' },
          ]}
          onPress={() => navigation.navigate('Recomendaciones')}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBadge, { backgroundColor: isDarkMode ? '#243126' : '#E8F5E9' }]}>
            <Ionicons name="thumbs-up-outline" size={20} color="#2E7D32" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Recomendaciones</Text>
            <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>
              Cómo utilizar un alimento
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
        </TouchableOpacity>

        {/* Importancia */}
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder || 'rgba(0,0,0,0.06)' },
          ]}
          onPress={() => navigation.navigate('Importancia')}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBadge, { backgroundColor: isDarkMode ? '#203244' : '#EAF2FB' }]}>
            <Ionicons name="information-circle-outline" size={20} color="#6698CC" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Importancia</Text>
            <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>Buena salud</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
        </TouchableOpacity>

        {/* Agregar infografías */}
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder || 'rgba(0,0,0,0.06)' },
          ]}
          onPress={() => navigation.navigate('SubirInfografia')}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBadge, { backgroundColor: isDarkMode ? '#2B2A22' : '#FFF1DE' }]}>
            <Ionicons name="add-circle-outline" size={20} color="#E36888" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Agregar infografías</Text>
            <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>
              Sube nuevas infografías
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
  /* Header */
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
    alignItems: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 4, marginRight: 6 },
  logo: { width: 36, height: 36, marginRight: 10 },
  topTitle: { fontSize: 20, fontWeight: '800' },
  topSubtitle: { marginTop: 2, fontSize: 12, fontWeight: '700' },
  themeToggle: { padding: 6, borderRadius: 10 },

  /* Contenido */
  content: { flex: 1, padding: 20, paddingBottom: 120 },

  /* Cards */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
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
