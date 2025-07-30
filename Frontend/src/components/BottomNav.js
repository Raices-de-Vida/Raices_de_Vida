// src/components/BottomNav.js
import React, { useContext } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { AuthContext } from '../context/AuthContext';

export default function BottomNav({ navigation }) {
  const { isDarkMode } = useTheme();
  const { role } = useContext(AuthContext);
  const theme = getTheme(isDarkMode);

  return (
    <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.borderColor }]}>
      
      {/* 🏠 Home */}
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home" size={28} color={theme.text} />
      </TouchableOpacity>

      {/* 🔍 Búsqueda */}
      <TouchableOpacity onPress={() => {
        if (role === 'Ong') {
          navigation.navigate('Graficas');
        } else {
          navigation.navigate('MapaDepartamentos');
        }
      }}>
        <Ionicons name="search-outline" size={28} color={theme.text} />
      </TouchableOpacity>

      {/* ➕ Agregar Alerta */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.addButton }]}
        onPress={() => navigation.navigate('RegisterAlertas')}
      >
        <Entypo name="plus" size={28} color="white" />
      </TouchableOpacity>

      {/* ❗ Acción especial */}
      <TouchableOpacity onPress={() => {
        if (role === 'Ong') {
          navigation.navigate('ImportacionDatos');
        } else {
          navigation.navigate('DatosAyuda');
        }
      }}>
        <AntDesign name="exclamationcircle" size={28} color="red" />
      </TouchableOpacity>

      {/* 👤 Perfil */}
      <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
        <FontAwesome name="user-o" size={28} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    elevation: 5,
  },
});
