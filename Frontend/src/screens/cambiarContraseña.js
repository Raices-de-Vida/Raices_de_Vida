import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CambiarContrasenaScreen({ navigation }) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const handleGuardar = () => {
    if (!actual || !nueva || !confirmar) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (nueva !== confirmar) {
      Alert.alert('Error', 'La nueva contraseña no coincide');
      return;
    }
    // Aquí podrías agregar lógica real de actualización de contraseña
    Alert.alert('Éxito', 'Contraseña actualizada correctamente');
    setActual('');
    setNueva('');
    setConfirmar('');
    navigation.goBack(); // vuelve a configuración
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
      </View>

      <Text style={styles.label}>Contraseña actual</Text>
      <TextInput
        style={styles.input}
        value={actual}
        onChangeText={setActual}
        placeholder="Ingresa tu contraseña actual"
        secureTextEntry
      />

      <Text style={styles.label}>Nueva contraseña</Text>
      <TextInput
        style={styles.input}
        value={nueva}
        onChangeText={setNueva}
        placeholder="Ingresa tu nueva contraseña"
        secureTextEntry
      />

      <Text style={styles.label}>Confirmar nueva contraseña</Text>
      <TextInput
        style={styles.input}
        value={confirmar}
        onChangeText={setConfirmar}
        placeholder="Confirma la nueva contraseña"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#FFE7A0',
    height: 80,
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#E8A074',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
