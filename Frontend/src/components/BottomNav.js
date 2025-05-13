import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme'; // 👈 asegúrate que el path es correcto

export default function BottomNav({ navigation }) {
  const { isDarkMode } = useTheme(); // ✅ esto sí existe
  const theme = getTheme(isDarkMode); // ✅ esto construye el objeto con los colores

  return (
    <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.borderColor }]}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home" size={28} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="search-outline" size={28} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.addButton }]}
        onPress={() => navigation.navigate('RegisterAlertas')}
      >
        <Entypo name="plus" size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('DatosAyuda')}>
        <AntDesign name="exclamationcircle" size={28} color="red" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Configuracion')}>
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
