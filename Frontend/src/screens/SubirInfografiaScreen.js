// src/screens/SubirInfografiaScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';

export default function SubirInfografiaScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const [form, setForm] = useState({
    autor: '',
    fecha: new Date(),
    showFecha: false,
    organizacion: '',
    tema: '',
    bibliografia: ''
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const clearField = (field) => {
    setForm({ ...form, [field]: '' });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAgregarFoto = () => {
    alert('Abrir cámara o galería');
  };

  const handleSubir = () => {
    alert('Infografía subida correctamente');
  };

  const pickerSelectStyles = {
    inputIOS: {
      fontSize: 16,
      paddingVertical: 10,
      color: theme.text
    },
    inputAndroid: {
      fontSize: 16,
      paddingVertical: 10,
      color: theme.text
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      height: 80,
      backgroundColor: theme.header,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      elevation: 3,
      borderRadius: 10,
      marginBottom: 10,
    },
    backButton: {
      position: 'absolute',
      left: 15,
      top: 25,
      zIndex: 1
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center'
    },
    form: {
      padding: 20,
      paddingBottom: 100,
    },
    inputContainer: {
      marginBottom: 15
    },
    label: {
      marginBottom: 5,
      fontWeight: '600',
      color: theme.text
    },
    inputBox: {
      backgroundColor: theme.inputBackground,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10
    },
    input: {
      flex: 1,
      paddingVertical: 10,
      color: theme.text
    },
    clearIcon: {
      fontSize: 18,
      color: theme.text,
      marginLeft: 10
    },
    imageBox: {
      marginTop: 20,
      height: 100,
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 8,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center'
    },
    imageText: {
      marginTop: 6,
      color: theme.text
    },
    submitButton: {
      marginTop: 30,
      backgroundColor: '#4CAF50',
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center'
    },
    submitButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Infografías</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <InputField
          label="Nombre del autor:"
          value={form.autor}
          onChange={(text) => handleChange('autor', text)}
          onClear={() => clearField('autor')}
          theme={theme}
        />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha:</Text>
          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => handleChange('showFecha', true)}
          >
            <Text style={styles.input}>
              {form.fecha.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {form.showFecha && (
            <DateTimePicker
              value={form.fecha}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                handleChange('showFecha', false);
                if (selectedDate) handleChange('fecha', selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Organización:</Text>
          <View style={styles.inputBox}>
            <RNPickerSelect
              value={form.organizacion}
              onValueChange={(value) => handleChange('organizacion', value)}
              placeholder={{ label: 'Selecciona una organización...', value: '' }}
              items={[
                { label: 'Yoop', value: 'Yoop' },
                { label: 'ONU', value: 'ONU' },
                { label: 'Voluntario', value: 'Voluntario' }
              ]}
              style={pickerSelectStyles}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tema:</Text>
          <View style={styles.inputBox}>
            <RNPickerSelect
              value={form.tema}
              onValueChange={(value) => handleChange('tema', value)}
              placeholder={{ label: 'Selecciona un tema...', value: '' }}
              items={[
                { label: 'Nutrición', value: 'Nutrición' },
                { label: 'Higiene', value: 'Higiene' },
                { label: 'Otros', value: 'Otros' }
              ]}
              style={pickerSelectStyles}
            />
          </View>
        </View>

        <InputField
          label="Bibliografía:"
          value={form.bibliografia}
          onChange={(text) => handleChange('bibliografia', text)}
          onClear={() => clearField('bibliografia')}
          multiline={true}
          theme={theme}
        />

        <TouchableOpacity style={styles.imageBox} onPress={handleAgregarFoto}>
          <MaterialCommunityIcons name="camera" size={32} color={theme.text} />
          <Text style={styles.imageText}>Agregar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubir}>
          <Text style={styles.submitButtonText}>Subir infografía</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

function InputField({ label, value, onChange, onClear, multiline, theme }) {
  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={{ marginBottom: 5, fontWeight: '600', color: theme.text }}>{label}</Text>
      <View style={{
        backgroundColor: theme.inputBackground,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10
      }}>
        <TextInput
          style={[{ flex: 1, paddingVertical: 10, color: theme.text }, multiline && { height: 80, textAlignVertical: 'top' }]}
          placeholder="Input"
          placeholderTextColor={theme.placeholder}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Text style={{ fontSize: 18, color: theme.text, marginLeft: 10 }}>✖</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
