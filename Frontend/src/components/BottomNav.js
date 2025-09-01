// src/components/BottomNav.js
import React, { useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { AuthContext } from '../context/AuthContext';

const NAV_HEIGHT = 64;

export default function BottomNav({ navigation }) {
  const { isDarkMode } = useTheme();
  const { role } = useContext(AuthContext);
  const theme = getTheme(isDarkMode);

  return (
    <View
      style={[
        styles.bottomNav,
        Platform.select({
          web: styles.fixedWeb, // 👇 siempre pegado abajo en web
          default: styles.absoluteNative,
        }),
        {
          backgroundColor: isDarkMode ? theme.inputBackground : '#FFF7DA',
          borderColor: theme.border || '#EAD8A6',
          shadowColor: isDarkMode ? '#000' : '#000',
        },
      ]}
    >
      {/* 🏠 Home */}
      <TouchableOpacity onPress={() => navigation.navigate('Home')} accessibilityLabel="Inicio">
        <Ionicons name="home" size={26} color={theme.text} />
      </TouchableOpacity>

      {/* 🔍 Búsqueda */}
      <TouchableOpacity
        onPress={() => {
          if (role === 'Ong') navigation.navigate('Graficas');
          else navigation.navigate('MapaDepartamentos');
        }}
        accessibilityLabel="Buscar"
      >
        <Ionicons name="search-outline" size={26} color={theme.text} />
      </TouchableOpacity>

      {/* ➕ Agregar Alerta (botón flotante central) */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.addButton || '#F08C21' }]}
        onPress={() => navigation.navigate('RegisterAlertas')}
        accessibilityLabel="Agregar alerta"
      >
        <Entypo name="plus" size={28} color="white" />
      </TouchableOpacity>

      {/* ❗ Acción especial */}
      <TouchableOpacity
        onPress={() => {
          if (role === 'Ong') navigation.navigate('ImportacionDatos');
          else navigation.navigate('DatosAyuda');
        }}
        accessibilityLabel="Acción especial"
      >
        <AntDesign name="exclamationcircleo" size={24} color="#E36888" />
      </TouchableOpacity>

      {/* 👤 Perfil */}
      <TouchableOpacity onPress={() => navigation.navigate('Perfil')} accessibilityLabel="Perfil">
        <FontAwesome name="user-o" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    height: NAV_HEIGHT,
    borderTopWidth: 1,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    // sombra suave
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  // 👇 Nativo: absoluto al final
  absoluteNative: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },

  // 👇 Web: fijo al viewport (lo que te fallaba)
  fixedWeb: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
  },

  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // efecto “flotante”
    marginTop: -24,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
