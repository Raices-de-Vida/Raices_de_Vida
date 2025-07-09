import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const GRAFICAS = [
  { id: '1', titulo: 'Casos reportados por departamento', icono: 'chart-bar', ruta: 'GraficaDepartamento', color: '#ff7043' },
  { id: '2', titulo: 'Tendencia mensual de casos reportados', icono: 'chart-line', ruta: 'GraficaTendencia', color: '#66bb6a' },
  { id: '3', titulo: 'Distribución por rango de edad y género', icono: 'chart-pie', ruta: 'GraficaEdadGenero', color: '#ff7043' },
  { id: '4', titulo: 'Peso vs. edad de los niños en casos reportados', icono: 'chart-scatter-plot', ruta: 'GraficaPesoEdad', color: '#66bb6a' }
];

export default function PantallaGraficas() {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate(item.ruta)}>
      <MaterialCommunityIcons name={item.icono} size={36} color={item.color} style={styles.icono} />
      <Text style={styles.texto}>{item.titulo}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gráficas</Text>
      </View>
      <FlatList
        data={GRAFICAS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingTop: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E1' },
  header: {
    backgroundColor: '#FFECB3',
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 20,
    elevation: 4
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  icono: {
    marginRight: 15
  },
  texto: {
    fontSize: 16,
    flex: 1,
    flexWrap: 'wrap',
    color: '#444'
  }
});