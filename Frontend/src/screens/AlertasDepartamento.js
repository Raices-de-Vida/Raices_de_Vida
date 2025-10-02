// AlertasDepartamento.jsx
import React from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

const DATA = {
  'Alta Verapaz': [
    { id: '1', nombre: 'Juan Luis', tipo: 'chronic_malnutrition', ubicacion: 'Aldea Las Luces' }
  ],
  'Izabal': [
    { id: '2', nombre: 'Jose Rodrigo', tipo: 'acute_malnutrition', ubicacion: 'Aldea Las Palmas' }
  ],
}

export default function AlertasDepartamento({ route }) {
  const { t } = useTranslation()
  const { departamento } = route.params
  const alertas = DATA[departamento] || []

  const deptLabel = t(`departments.${departamento}`, { defaultValue: departamento })

  return (
    <View style={styles.container}>
      {/* título de la pantalla opcional, si quieres mostrar la sección */}
      {/* <Text style={styles.sectionTitle}>{t('screens.alertsByDepartment.title')}</Text> */}

      <Text style={styles.titulo}>{deptLabel}</Text>

      <FlatList
        data={alertas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.alerta}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text>{t(`alert.types.${item.tipo}`)}</Text>
            <Text>
              {t('labels.location_in_department', {
                location: item.ubicacion,
                department: deptLabel
              })}
            </Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 14, opacity: 0.7, marginBottom: 4 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  alerta: { marginBottom: 15 },
  nombre: { fontWeight: 'bold' }
})
