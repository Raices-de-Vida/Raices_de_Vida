import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';

export default function RegisterAlertas({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoAlerta, setTipoAlerta] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [foto, setFoto] = useState(null);
  const [mostrarComunidades, setMostrarComunidades] = useState(false);
  const [mostrarTipos, setMostrarTipos] = useState(false);
  const [mostrarPrioridades, setMostrarPrioridades] = useState(false);

  const comunidades = ['San Gaspar Ixchil', 'Santa Bárbara', 'Huehuetenango', 'Cahabón', 'Colotenango', 'Lanquín'];
  const tipos = ['Médica', 'Nutricional', 'Psicosocial', 'Urgente'];
  const prioridades = ['Baja', 'Media', 'Alta', 'Crítica'];

  useEffect(() => {
    const cargarFotoGuardada = async () => {
      const uriGuardado = await AsyncStorage.getItem('fotoAlerta');
      if (uriGuardado) {
        setFoto(uriGuardado);
      }
    };
    cargarFotoGuardada();
  }, []);

  const seleccionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFoto(uri);
      await AsyncStorage.setItem('fotoAlerta', uri);
    }
  };

  const eliminarFoto = async () => {
    await AsyncStorage.removeItem('fotoAlerta');
    setFoto(null);
  };

  const handleCrear = async () => {
    if (!nombre || !edad || !ubicacion || !comunidad || !tipoAlerta || !prioridad || !descripcion) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    if (isNaN(edad)) {
      Alert.alert('Error', 'Por favor ingresa una edad válida (solo números).');
      return;
    }

    // Eliminar imagen y limpiar campos
    await AsyncStorage.removeItem('fotoAlerta');
    setFoto(null);
    setNombre('');
    setEdad('');
    setUbicacion('');
    setComunidad('');
    setDescripcion('');
    setTipoAlerta('');
    setPrioridad('');

    Alert.alert('Éxito', '¡Alerta creada correctamente!');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Crear Alerta</Text>
        </View>

        {/* Nombre */}
        <Text style={{ color: theme.text }}>Nombre:</Text>
        <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ingrese su nombre"
            placeholderTextColor={theme.secondaryText}
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        {/* Edad */}
        <Text style={{ color: theme.text }}>Edad:</Text>
        <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ingrese su edad"
            placeholderTextColor={theme.secondaryText}
            value={edad}
            onChangeText={setEdad}
            keyboardType="numeric"
          />
        </View>

        {/* Ubicación */}
        <Text style={{ color: theme.text }}>Ubicación:</Text>
        <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ingrese su ubicación"
            placeholderTextColor={theme.secondaryText}
            value={ubicacion}
            onChangeText={setUbicacion}
          />
        </View>

        {/* Comunidad */}
        <Text style={{ color: theme.text }}>Comunidad:</Text>
        <TouchableOpacity
          style={[styles.dropdownBox, { backgroundColor: theme.inputBackground }]}
          onPress={() => setMostrarComunidades(!mostrarComunidades)}
        >
          <Text style={[styles.dropdownText, { color: theme.text }]}>
            {comunidad || 'Selecciona una comunidad'}
          </Text>
          <Ionicons name={mostrarComunidades ? 'chevron-up' : 'chevron-down'} size={20} color={theme.text} />
        </TouchableOpacity>
        {mostrarComunidades && (
          <View style={[styles.optionGroup, { backgroundColor: theme.inputBackground }]}>
            {comunidades.map((item) => (
              <TouchableOpacity key={item} onPress={() => {
                setComunidad(item);
                setMostrarComunidades(false);
              }}>
                <Text style={[styles.option, { color: theme.text }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tipo de alerta */}
        <Text style={{ color: theme.text }}>Tipo de alerta:</Text>
        <TouchableOpacity
          style={[styles.dropdownBox, { backgroundColor: theme.inputBackground }]}
          onPress={() => setMostrarTipos(!mostrarTipos)}
        >
          <Text style={[styles.dropdownText, { color: theme.text }]}>
            {tipoAlerta || 'Selecciona el tipo'}
          </Text>
          <Ionicons name={mostrarTipos ? 'chevron-up' : 'chevron-down'} size={20} color={theme.text} />
        </TouchableOpacity>
        {mostrarTipos && (
          <View style={[styles.optionGroup, { backgroundColor: theme.inputBackground }]}>
            {tipos.map((item) => (
              <TouchableOpacity key={item} onPress={() => {
                setTipoAlerta(item);
                setMostrarTipos(false);
              }}>
                <Text style={[styles.option, { color: theme.text }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Prioridad */}
        <Text style={{ color: theme.text }}>Prioridad:</Text>
        <TouchableOpacity
          style={[styles.dropdownBox, { backgroundColor: theme.inputBackground }]}
          onPress={() => setMostrarPrioridades(!mostrarPrioridades)}
        >
          <Text style={[styles.dropdownText, { color: theme.text }]}>
            {prioridad || 'Selecciona la prioridad'}
          </Text>
          <Ionicons name={mostrarPrioridades ? 'chevron-up' : 'chevron-down'} size={20} color={theme.text} />
        </TouchableOpacity>
        {mostrarPrioridades && (
          <View style={[styles.optionGroup, { backgroundColor: theme.inputBackground }]}>
            {prioridades.map((item) => (
              <TouchableOpacity key={item} onPress={() => {
                setPrioridad(item);
                setMostrarPrioridades(false);
              }}>
                <Text style={[styles.option, { color: theme.text }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Descripción */}
        <Text style={{ color: theme.text }}>Descripción de la emergencia:</Text>
        <View style={[styles.inputBoxLarge, { backgroundColor: theme.inputBackground }]}>
          <TextInput
            style={[styles.inputLarge, { color: theme.text }]}
            placeholder="Describa la situación"
            placeholderTextColor={theme.secondaryText}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Foto */}
        <Text style={{ color: theme.text }}>Agregar foto:</Text>
        {foto ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: foto }} style={styles.imagePreview} />
            <TouchableOpacity onPress={eliminarFoto} style={styles.trashIcon}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoBox} onPress={seleccionarFoto}>
            <Ionicons name="camera-outline" size={32} color={theme.secondaryText} />
            <Text style={{ color: theme.secondaryText }}>Subir foto</Text>
          </TouchableOpacity>
        )}

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.secondaryButton }]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>CANCELAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.createButton, { backgroundColor: theme.primaryButton }]} onPress={handleCrear}>
            <Text style={styles.buttonText}>CREAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 50,
  },
  header: {
    height: 80,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputBox: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    height: 40,
  },
  inputBoxLarge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 8,
  },
  inputLarge: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdownBox: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginVertical: 8,
  },
  dropdownText: {
    fontSize: 16,
  },
  optionGroup: {
    borderRadius: 8,
    padding: 10,
    gap: 10,
    marginBottom: 8,
  },
  option: {
    fontSize: 16,
    paddingVertical: 4,
  },
  photoBox: {
    height: 120,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  trashIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  createButton: {
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

