import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';

export default function CambiarContrasenaScreen({ navigation }) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const handleGuardar = () => {
    if (!actual || !nueva || !confirmar) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (nueva !== confirmar) {
      Alert.alert('Error', 'La nueva contraseña no coincide');
      return;
    }
    Alert.alert('Éxito', 'Contraseña actualizada correctamente');
    setActual('');
    setNueva('');
    setConfirmar('');
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cambiar Contraseña</Text>
      </View>

      <Text style={[styles.label, { color: theme.text }]}>Contraseña actual</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
        value={actual}
        onChangeText={setActual}
        placeholder="Ingresa tu contraseña actual"
        secureTextEntry
        placeholderTextColor={theme.secondaryText}
      />

      <Text style={[styles.label, { color: theme.text }]}>Nueva contraseña</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
        value={nueva}
        onChangeText={setNueva}
        placeholder="Ingresa tu nueva contraseña"
        secureTextEntry
        placeholderTextColor={theme.secondaryText}
      />

      <Text style={[styles.label, { color: theme.text }]}>Confirmar nueva contraseña</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
        value={confirmar}
        onChangeText={setConfirmar}
        placeholder="Confirma la nueva contraseña"
        secureTextEntry
        placeholderTextColor={theme.secondaryText}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primaryButton }]} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    height: 80,
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
  },
  backButton: { padding: 4 },
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
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  button: {
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
