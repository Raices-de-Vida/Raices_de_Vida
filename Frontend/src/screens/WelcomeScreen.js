// src/screens/WelcomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';

const PALETTE = {
  tangerine: '#F08C21',
  blush:     '#E36888',
  butter:    '#ffeb9a',
  sea:       '#6698CC',
  matcha:    '#B4B534',
  cream:     '#FFF7DA',
};

export default function WelcomeScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const bg        = isDarkMode ? theme.background    : PALETTE.butter;
  const titleCol  = isDarkMode ? theme.text          : PALETTE.blush;
  const subCol    = isDarkMode ? theme.secondaryText : PALETTE.sea;
  const btnPrim   = isDarkMode ? theme.primaryButton : PALETTE.tangerine;
  const btnSec    = isDarkMode ? theme.secondaryButton : PALETTE.sea;
  const leafA     = isDarkMode ? theme.border : PALETTE.sea;
  const leafB     = isDarkMode ? theme.error  : 'rgba(240,140,33,0.3)'; // naranja suave
  const leafC     = isDarkMode ? theme.card   : 'rgba(227,104,136,0.28)'; // blush suave

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ThemeToggle />

      {/* Decoración de fondo (curvas y hojas) */}
      <Decor bgA={leafA} bgB={leafB} bgC={leafC} />

      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      <Text style={[styles.title, { color: titleCol }]}>Raíces de vida</Text>
      <Text style={[styles.subtitle, { color: subCol }]}>ayudar es nuestra misión</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.loginButton, { borderColor: btnSec }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.loginText, { color: btnSec }]}>LOG IN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: btnPrim }]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>REGISTER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** =======================
 *  Componentes decorativos
 *  ======================= */
const Leaf = ({ color, size = 26, rotate = '0deg', style }) => (
  <View
    style={[
      {
        width: size,
        height: size * 0.65,
        backgroundColor: color,
        borderTopLeftRadius: size,
        borderTopRightRadius: size * 0.1,
        borderBottomLeftRadius: size * 0.1,
        borderBottomRightRadius: size,
        transform: [{ rotate }],
        opacity: 0.85,
      },
      style,
    ]}
  />
);

const Decor = ({ bgA, bgB, bgC }) => (
  <>
    {/* manchas curvas */}
    <View style={[styles.blob, styles.blobTL, { backgroundColor: bgA, opacity: 0.22 }]} />
    <View style={[styles.blob, styles.blobBR, { backgroundColor: bgC, opacity: 0.22 }]} />
    {/* lluvia de hojas */}
    <Leaf color={bgA} rotate="-20deg" style={{ position: 'absolute', top: 110, left: 24 }} />
    <Leaf color={bgA} rotate="15deg"  style={{ position: 'absolute', top: 160, left: 62 }} />
    <Leaf color={bgB} rotate="-10deg" style={{ position: 'absolute', top: 210, left: 28 }} />
    <Leaf color={bgA} rotate="30deg"  style={{ position: 'absolute', bottom: 130, left: 26 }} />
    <Leaf color={bgA} rotate="-25deg" style={{ position: 'absolute', bottom: 90,  left: 84 }} />
    <Leaf color={bgB} rotate="18deg"  style={{ position: 'absolute', bottom: 58,  left: 36 }} />

    <Leaf color={bgA} rotate="-15deg" style={{ position: 'absolute', top: 80,  right: 26 }} />
    <Leaf color={bgA} rotate="25deg"  style={{ position: 'absolute', top: 130, right: 72 }} />
    <Leaf color={bgC} rotate="-10deg" style={{ position: 'absolute', top: 175, right: 28 }} />
    <Leaf color={bgB} rotate="18deg"  style={{ position: 'absolute', bottom: 120, right: 40 }} />
    <Leaf color={bgA} rotate="-28deg" style={{ position: 'absolute', bottom: 70,  right: 78 }} />
  </>
);

const RADIUS = 18;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  // “curvas” grandes en las esquinas
  blob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 90,
  },
  blobTL: { top: -70, left: -60, transform: [{ rotate: '18deg' }] },
  blobBR: { right: -70, bottom: -60, transform: [{ rotate: '-15deg' }] },

  logo: {
    width: 230,
    height: 230,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 34,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButton: {
    borderWidth: 2,
    borderRadius: RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 26,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  loginText: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  registerButton: {
    borderRadius: RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 26,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  registerText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
