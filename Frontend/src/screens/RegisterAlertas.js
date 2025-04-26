import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

export default function RegisterAlertas({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const limpiarFormulario = () => {
    setNombre('');
    setEdad('');
    setUbicacion('');
    setComunidad('');
    setDescripcion('');
  };

  const handleCancel = () => {
    if (nombre || edad || ubicacion || comunidad || descripcion) {
      Alert.alert(
        "Confirmar cancelación",
        "¿Estás seguro que deseas cancelar? Perderás toda la información ingresada.",
        [
          { text: "No", style: "cancel" },
          { text: "Sí", onPress: () => {
            limpiarFormulario();
            navigation.goBack();
          }}
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleCreate = async () => {
    if (!nombre || !comunidad || !descripcion) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios: Nombre, Comunidad y Descripción");
      return;
    }

    setLoading(true);
    try {
      // En un entorno real, deberías obtener el ID del usuario autenticado
      const userId = 1; // ID de ejemplo
      const casoId = 1; // ID de caso de ejemplo

      // Crear objeto de alerta
      const nuevaAlerta = {
        nombre,
        comunidad,
        descripcion,
        edad: edad ? parseInt(edad) : null,
        ubicacion,
        caso_id: casoId,
        usuario_id: userId,
        tipo_alerta: 'Nutricional',
        prioridad: 'Alta',
        estado: 'Pendiente'
      };

      await axios.post('http://192.168.2.1:3001/api/alertas', nuevaAlerta);

      Alert.alert(
        "Éxito",
        "Alerta creada correctamente",
        [{ text: "OK", onPress: () => navigation.navigate('Home', { refresh: true }) }]
      );
    } catch (error) {
      console.error('Error al crear la alerta:', error);
      
      // Si estamos en desarrollo, simulamos un éxito para probar la UI
      if (__DEV__) {
        Alert.alert(
          "Éxito (Modo desarrollo)",
          "Alerta creada correctamente (simulado)",
          [{ text: "OK", onPress: () => navigation.navigate('Home', { refresh: true }) }]
        );
      } else {
        Alert.alert("Error", "No se pudo crear la alerta. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleCancel}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Alerta</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre: <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la persona"
              value={nombre}
              onChangeText={setNombre}
            />
            <TouchableOpacity onPress={() => setNombre('')}>
              <Ionicons name="close-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Edad:</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Edad"
              value={edad}
              onChangeText={setEdad}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={() => setEdad('')}>
              <Ionicons name="close-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Ubicación:</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Ubicación específica"
              value={ubicacion}
              onChangeText={setUbicacion}
            />
            <TouchableOpacity onPress={() => setUbicacion('')}>
              <Ionicons name="close-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Comunidad: <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Comunidad"
              value={comunidad}
              onChangeText={setComunidad}
            />
            <TouchableOpacity onPress={() => setComunidad('')}>
              <Ionicons name="close-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Descripción de la emergencia: <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputBoxLarge}>
            <TextInput
              style={styles.inputLarge}
              placeholder="Describe la situación"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity onPress={() => setDescripcion('')}>
              <Ionicons name="close-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.requiredText}>* Campos obligatorios</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.buttonText}>CANCELAR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>CREAR</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Barra inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  placeholder: {
    width: 24,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    marginBottom: 5,
    fontWeight: '500',
  },
  required: {
    color: 'red',
    fontWeight: 'bold',
  },
  requiredText: {
    color: 'red',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 5,
    fontStyle: 'italic',
  },
  inputBox: {
    backgroundColor: '#D9F5B7',
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
    backgroundColor: '#D9F5B7',
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
  cancelButton: {
    backgroundColor: '#E8A074',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#E8A074',
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