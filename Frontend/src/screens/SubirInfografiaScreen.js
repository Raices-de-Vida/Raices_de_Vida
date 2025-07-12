import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function App() {
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
    alert('Regresar');
  };

  const handleAgregarFoto = () => {
    alert('Abrir cámara o galería');
  };

  return (
    <View style={styles.container}>
      {/* Encabezado con Back */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Infografías</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <InputField
          label="Nombre del autor:"
          value={form.autor}
          onChange={(text) => handleChange('autor', text)}
          onClear={() => clearField('autor')}
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
        />

        {/* Botón de subir foto */}
        <TouchableOpacity style={styles.imageBox} onPress={handleAgregarFoto}>
          <MaterialCommunityIcons name="camera" size={32} color="#666" />
          <Text style={styles.imageText}>Agregar Foto</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InputField({ label, value, onChange, onClear, multiline }) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
          placeholder="Input"
          value={value}
          onChangeText={onChange}
          multiline={multiline}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Text style={styles.clearIcon}>✖</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    height: 60,
    backgroundColor: '#FFECB3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 3
  },
  backButton: {
    padding: 5,
    marginRight: 10
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 30
  },
  form: {
    padding: 20
  },
  inputContainer: {
    marginBottom: 15
  },
  label: {
    marginBottom: 5,
    fontWeight: '600'
  },
  inputBox: {
    backgroundColor: '#D0F0B3',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  input: {
    flex: 1,
    paddingVertical: 10
  },
  clearIcon: {
    fontSize: 18,
    color: '#444',
    marginLeft: 10
  },
  imageBox: {
    marginTop: 20,
    height: 100,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageText: {
    marginTop: 6,
    color: '#666'
  }
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 10,
    color: '#000'
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 10,
    color: '#000'
  }
};