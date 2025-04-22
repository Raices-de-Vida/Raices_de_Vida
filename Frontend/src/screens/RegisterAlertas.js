import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';

export default function App() {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [descripcion, setDescripcion] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header SIN icono de configuración */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alertas</Text>
        </View>

        {/* Formulario */}
        <View style={styles.inputContainer}>
          <Text>Nombre:</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Input"
              value={nombre}
              onChangeText={setNombre}
            />
            <TouchableOpacity onPress={() => setNombre('')}>
              <Ionicons name="close-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text>Edad:</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Input"
              value={edad}
              onChangeText={setEdad}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={() => setEdad('')}>
              <Ionicons name="close-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text>Ubicación:</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Input"
              value={ubicacion}
              onChangeText={setUbicacion}
            />
            <TouchableOpacity onPress={() => setUbicacion('')}>
              <Ionicons name="close-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text>Comunidad:</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Input"
              value={comunidad}
              onChangeText={setComunidad}
            />
            <TouchableOpacity onPress={() => setComunidad('')}>
              <Ionicons name="close-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text>Descripción de la emergencia:</Text>
          <View style={styles.inputBoxLarge}>
            <TextInput
              style={styles.inputLarge}
              placeholder="Input"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity onPress={() => setDescripcion('')}>
              <Ionicons name="close-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.buttonText}>CANCELAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.buttonText}>CREAR</Text>
            </TouchableOpacity>
          </View>
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
  inputContainer: {
    flex: 1,
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