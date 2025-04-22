import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';

export default function App() {
  const [activo, setActivo] = useState(true);

  const alertas = []; // <-- Lista vacía ahora

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
        </View>

        {/* Sección de Alertas */}
        <View style={styles.alertSection}>
          <Text style={styles.alertTitle}>Alertas</Text>

          {/* Switch Activos/Inactivos */}
          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[styles.switchButton, activo && styles.switchButtonActive]}
              onPress={() => setActivo(true)}
            >
              <Text style={[styles.switchText, activo && styles.switchTextActive]}>Activos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchButton, !activo && styles.switchButtonActive]}
              onPress={() => setActivo(false)}
            >
              <Text style={[styles.switchText, !activo && styles.switchTextActive]}>Inactivos</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Alertas */}
          {alertas.length === 0 ? (
            <Text style={styles.noAlertsText}>No hay alertas por el momento.</Text>
          ) : (
            alertas.map((alerta) => (
              <View key={alerta.id} style={styles.alertItem}>
                <AntDesign name="exclamationcircle" size={28} color="red" style={{ marginRight: 10 }} />
                <View>
                  <Text style={styles.alertName}>{alerta.nombre}</Text>
                  <Text style={styles.alertDesc}>{alerta.descripcion}</Text>
                  <Text style={styles.alertComunidad}>{alerta.comunidad}</Text>
                </View>
              </View>
            ))
          )}

          {/* Botón See More */}
          <TouchableOpacity style={styles.seeMoreButton}>
            <Text style={styles.seeMoreText}>SEE MORE</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* Barra inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home-outline" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton}>
          <Entypo name="plus" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity>
          <AntDesign name="exclamationcircle" size={28} color="red" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="user-o" size={28} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#FFE7A0',
    height: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  alertSection: {
    marginTop: 10,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#F3B27A',
  },
  switchText: {
    color: 'gray',
    fontWeight: 'bold',
  },
  switchTextActive: {
    color: 'white',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  alertName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertDesc: {
    color: 'gray',
    marginTop: 2,
  },
  alertComunidad: {
    color: 'gray',
    fontSize: 12,
    marginTop: 2,
  },
  noAlertsText: {
    color: 'gray',
    fontStyle: 'italic',
    marginVertical: 20,
    textAlign: 'center',
  },
  seeMoreButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  seeMoreText: {
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#E8A074',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
});