import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';
import { CustomToast, ToastTypes } from '../components/CustomToast';

export default function RegisterAlertas({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  
  // Estados para el toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState(ToastTypes.INFO);

  // Función para mostrar el toast
  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Función para ocultar el toast
  const hideToast = () => {
    setToastVisible(false);
  };

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
      showToast("Por favor completa todos los campos obligatorios: Nombre, Comunidad y Descripción", ToastTypes.ERROR);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('jwtToken');
      const userId = 1; // Obtén dinámicamente del token (ej: req.user.id)
      const casoId = 1; // Asegúrate de que exista en Casos_Criticos
    
      const nuevaAlerta = {
        descripcion: "Descripción de la alerta", // Campo obligatorio
        caso_id: casoId,
        usuario_id: userId,
        tipo_alerta: 'Nutricional',
        prioridad: 'Alta',
        estado: 'Pendiente'
      };
    
      await axios.post('http://localhost:3001/api/alertas', nuevaAlerta, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    
      showToast("Alerta creada correctamente", ToastTypes.SUCCESS);
      setTimeout(() => navigation.navigate('Home', { refresh: true }), 2000);
    
    } catch (error) {
      console.error('Error al crear la alerta:', error);
      showToast("No se pudo crear la alerta", ToastTypes.ERROR); // Evita simular éxito en DEV
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemeToggle />
      
      {/* Toast component */}
      <CustomToast 
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
        duration={3000}
      />
      
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleCancel}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Crear Alerta</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Nombre: <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Nombre de la persona"
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
              placeholder="Ubicación específica"
              value={ubicacion}
              onChangeText={setUbicacion}
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
            />
            <TouchableOpacity onPress={() => setUbicacion('')}>
              <Ionicons name="close-circle-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Comunidad: <Text style={styles.required}>*</Text></Text>
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

          <Text style={[styles.label, { color: theme.text }]}>Descripción de la emergencia: <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputBoxLarge, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.inputLarge, { color: theme.text }]}
              placeholder="Describe la situación"
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

          <Text style={styles.requiredText}>* Campos obligatorios</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: theme.primaryButton }]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.buttonText}>CANCELAR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: theme.primaryButton }]}
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
      <View style={[styles.bottomNav, { backgroundColor: theme.background, borderColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={28} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={28} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.addButton }]}>
          <Entypo name="plus" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity>
          <AntDesign name="exclamationcircle" size={28} color="red" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="user-o" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>
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
  },
});