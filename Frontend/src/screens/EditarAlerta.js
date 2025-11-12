// src/screens/EditarAlerta.js  (actualizado para i18n)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import ThemeToggle from '../components/ThemeToggle';
import BottomNav from '../components/BottomNav';
import { useTranslation } from 'react-i18next';

export default function EditarAlerta({ navigation, route }) {
  const { t } = useTranslation();
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
      Alert.alert(t('alerts.validation.title'), t('alerts.validation.requiredFields'));
      return;
    }

    setLoading(true);
    try {
      const alertaActualizada = {
        nombre,
        edad: edad ? parseInt(edad, 10) : null,
        ubicacion,
        comunidad,
        descripcion
      };

      console.log('[EDITAR ALERTA] 📤 Enviando actualización:', alertaActualizada);
      
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.put(
        `${API_URL}/api/alertas/${alerta.alerta_id}`, 
        alertaActualizada
      );
      
      console.log('[EDITAR ALERTA] ✅ Respuesta recibida:', response.data);

      Alert.alert(t('alerts.update.title'), t('alerts.update.success'), [
        { text: t('common.ok'), onPress: () => navigation.navigate('Home', { refresh: true }) }
      ]);
    } catch (error) {
      console.error('[EDITAR ALERTA] ❌ Error al actualizar:', error.response?.data || error.message);
      Alert.alert(t('alerts.update.title'), t('alerts.update.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('alerts.delete.confirmTitle'),
      t('alerts.delete.confirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
              await axios.delete(`${API_URL}/api/alertas/${alerta.alerta_id}`);
              Alert.alert(t('alerts.delete.successTitle'), t('alerts.delete.success'));
              navigation.navigate('Home', { refresh: true });
            } catch (error) {
              console.error('Error al eliminar la alerta:', error);
              Alert.alert(t('alerts.delete.errorTitle'), t('alerts.delete.error'));
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
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t('screens.editAlert.title')}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>{t('fields.name')}</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={t('placeholders.name')}
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
            />
            <TouchableOpacity onPress={() => setNombre('')}>
              <Ionicons name="close-circle-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>{t('fields.age')}</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={t('placeholders.age')}
              value={edad}
              onChangeText={setEdad}
              keyboardType="numeric"
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
            />
            <TouchableOpacity onPress={() => setEdad('')}>
              <Ionicons name="close-circle-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>{t('fields.location')}</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={t('placeholders.location')}
              value={ubicacion}
              onChangeText={setUbicacion}
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
            />
            <TouchableOpacity onPress={() => setUbicacion('')}>
              <Ionicons name="close-circle-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>{t('fields.community')}</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={t('placeholders.community')}
              value={comunidad}
              onChangeText={setComunidad}
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
            />
            <TouchableOpacity onPress={() => setComunidad('')}>
              <Ionicons name="close-circle-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>{t('fields.emergencyDescription')}</Text>
          <View style={[styles.inputBoxLarge, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              style={[styles.inputLarge, { color: theme.text }]}
              placeholder={t('placeholders.description')}
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
              <Text style={styles.buttonText}>{t('buttons.delete')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.updateButton, { backgroundColor: theme.primaryButton }]}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? t('buttons.updating') : t('buttons.update')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <BottomNav navigation={navigation} />
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
