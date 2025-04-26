import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';

export default function EditarAlerta({ navigation, route }) {
  const { alerta } = route.params;
  const [nombre, setNombre] = useState(alerta.nombre || '');
  const [edad, setEdad] = useState(alerta.edad ? alerta.edad.toString() : '');
  const [ubicacion, setUbicacion] = useState(alerta.ubicacion || '');
  const [comunidad, setComunidad] = useState(alerta.comunidad || '');
  const [descripcion, setDescripcion] = useState(alerta.descripcion || '');
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const handleUpdate = async () => {
    if (!nombre || !descripcion || !comunidad) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const alertaActualizada = {
        ...alerta,
        nombre,
        edad: edad ? parseInt(edad) : null,
        ubicacion,
        comunidad,
        descripcion
      };

      //Cambiar la URL a la correcta en cada computadora
      await axios.put(`http://IP:3001/api/alertas/${alerta.alerta_id}`, alertaActualizada);
      
      Alert.alert('Éxito', 'Alerta actualizada correctamente', [
        { text: 'OK', onPress: () => navigation.navigate('Home', { refresh: true }) }
      ]);
    } catch (error) {
      console.error('Error al actualizar la alerta:', error);
      Alert.alert('Error', 'No se pudo actualizar la alerta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres eliminar esta alerta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await axios.delete(`http://IP:3001/api/alertas/${alerta.alerta_id}`);
              Alert.alert('Éxito', 'Alerta eliminada correctamente');
              navigation.navigate('Home', { refresh: true });
            } catch (error) {
              console.error('Error al eliminar la alerta:', error);
              Alert.alert('Error', 'No se pudo eliminar la alerta');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemeToggle />
      
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Editar Alerta</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Nombre:</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
            />
            <TouchableOpacity onPress={() => setNombre('')}>
              <Ionicons name="close-circle-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Edad:</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Edad"
              value={edad}
              onChangeText={setEdad}
              keyboardType="numeric"
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
            />
            <TouchableOpacity onPress={() => setEdad('')}>
              <Ionicons name="close-circle-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Ubicación:</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Ubicación"
              value={ubicacion}
              onChangeText={setUbicacion}
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
            />
            <TouchableOpacity onPress={() => setUbicacion('')}>
              <Ionicons name="close-circle-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Comunidad:</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Comunidad"
              value={comunidad}
              onChangeText={setComunidad}
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
            />
            <TouchableOpacity onPress={() => setComunidad('')}>
              <Ionicons name="close-circle-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Descripción de la emergencia:</Text>
          <View style={[styles.inputBoxLarge, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.inputLarge, { color: theme.text }]}
              placeholder="Descripción"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
            />
            <TouchableOpacity onPress={() => setDescripcion('')}>
              <Ionicons name="close-circle-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.deleteButton, { backgroundColor: theme.deleteButton }]} 
              onPress={handleDelete}
            >
              <Text style={styles.buttonText}>ELIMINAR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.updateButton, { backgroundColor: theme.primaryButton }]} 
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
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
  label: {
    marginBottom: 5,
    fontWeight: '500',
  },
  inputContainer: {
    flex: 1,
  },
  inputBox: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    height: 40,
  },
  inputBoxLarge: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  inputLarge: {
    flex: 1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  deleteButton: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  updateButton: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});