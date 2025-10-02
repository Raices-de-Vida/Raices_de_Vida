// src/screens/RecomendacionesScreen.js (actualizado para i18n)
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';

export default function RecomendacionesScreen({ navigation }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation();

  // Animaciones: entrada + “pop” al presionar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;   // entrada
  const pressScale = useRef(new Animated.Value(1)).current;     // pop on press

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const onPressIn = () => {
    Animated.spring(pressScale, {
      toValue: 1.04,
      friction: 6,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 6,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

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
            <Text style={[styles.topTitle, { color: theme.text }]}>
              {t('screens.recommendations.title')}
            </Text>
            <Text style={[styles.topSubtitle, { color: isDarkMode ? theme.secondaryText : '#6698CC' }]}>
              {t('screens.recommendations.subtitle')}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.themeToggle} onPress={toggleDarkMode}>
          <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, pressScale) }],
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={{ borderRadius: 16, overflow: 'hidden' }}
          >
            <Image
              source={require('../../assets/recomendaciones-plato.png')}
              style={styles.infografia}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Bloque opcional de texto/descripción */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder || 'rgba(0,0,0,0.06)' }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {t('cards.plate.title')}
          </Text>
          <Text style={[styles.cardText, { color: theme.secondaryText }]}>
            {t('cards.plate.text')}
          </Text>
        </View>
      </ScrollView>
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
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 8, padding: 4 },
  logo: { width: 36, height: 36, marginRight: 10 },
  topTitle: { fontSize: 20, fontWeight: '800' },
  topSubtitle: { marginTop: 2, fontSize: 12, fontWeight: '700' },
  themeToggle: { padding: 6, borderRadius: 10 },

  /* Contenido */
  content: { padding: 20, paddingBottom: 40 },
  infografia: {
    width: '100%',
    height: 360,
    backgroundColor: '#fff',
  },

  /* Card descriptiva */
  card: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  cardText: { fontSize: 14, lineHeight: 20 },
});
