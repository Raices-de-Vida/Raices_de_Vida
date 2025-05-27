import React from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'

const DATA = {
  'Alta Verapaz': [
    { id: '1', nombre: 'Juan Luis', tipo: 'Desnutrición crónica', ubicacion: 'Aldea Las Luces' }
  ],
  'Izabal': [
    { id: '2', nombre: 'Jose Rodrigo', tipo: 'Desnutrición Aguda', ubicacion: 'Aldea Las Palmas' }
  ],
}

export default function AlertasDepartamento({ route }) {
  const { departamento } = route.params
  const alertas = DATA[departamento] || []

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{departamento}</Text>
      <FlatList
        data={alertas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.alerta}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text>{item.tipo}</Text>
            <Text>{item.ubicacion}, {departamento}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  alerta: { marginBottom: 15 },
  nombre: { fontWeight: 'bold' }
})
