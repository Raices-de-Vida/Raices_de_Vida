import React from 'react'
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import BottomNav from '../components/BottomNav'
import { useTheme } from '../context/ThemeContext'
import { getTheme } from '../styles/theme'

export default function MapaDepartamentos() {
  const navigation = useNavigation()
  const { isDarkMode } = useTheme()
  const theme = getTheme(isDarkMode)

  const irADepartamento = (departamento) => {
    navigation.navigate('AlertasDepartamento', { departamento })
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Encabezado */}
      <View style={[styles.header, { backgroundColor: theme.header }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Departamentos</Text>
      </View>

      {/* Mapa con overlay de botones */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mapContainer}>
          <Image source={require('../../assets/mapaGuatemala.png')} style={styles.mapa} />

          {/* Botones interactivos por departamento */}
          <TouchableOpacity
            style={[styles.departamento, { top: 120, left: 100 }]}
            onPress={() => irADepartamento('Alta Verapaz')}
          />
          <TouchableOpacity
            style={[styles.departamento, { top: 200, left: 150 }]}
            onPress={() => irADepartamento('Izabal')}
          />
          {/* Puedes agregar más botones aquí */}
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 100, // espacio para el BottomNav
  },
  header: {
    height: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginHorizontal: 10,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  mapContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapa: {
    width: 300,
    height: 400,
  },
  departamento: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
  },
})
