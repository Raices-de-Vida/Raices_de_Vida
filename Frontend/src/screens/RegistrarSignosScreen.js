import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registrarSignos } from '../services/pacientes';

export default function RegistrarSignosScreen({ route, navigation }) {
  const { id_paciente } = route.params;
  const [sistolica, setSistolica] = useState('');
  const [diastolica, setDiastolica] = useState('');
  const [fc, setFc] = useState('');
  const [spo2, setSpo2] = useState('');
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [temp, setTemp] = useState('');

  const handleGuardar = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const payload = {
        presion_arterial_sistolica: parseInt(sistolica) || null,
        presion_arterial_diastolica: parseInt(diastolica) || null,
        frecuencia_cardiaca: parseInt(fc) || null,
        saturacion_oxigeno: parseFloat(spo2) || null,
        peso: parseFloat(peso) || null,
        estatura: parseFloat(estatura) || null,
        temperatura: parseFloat(temp) || null,
      };
      await registrarSignos(id_paciente, payload, token);
      Alert.alert('Éxito', 'Signos vitales guardados', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err?.message || 'No se pudieron guardar los signos.');
    }
  };

  return (
    <View style={{ flex:1, backgroundColor:'#FFF7DA' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Registrar signos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Input label="PA Sistólica" value={sistolica} onChangeText={setSistolica} keyboardType="numeric" />
        <Input label="PA Diastólica" value={diastolica} onChangeText={setDiastolica} keyboardType="numeric" />
        <Input label="Frecuencia cardiaca" value={fc} onChangeText={setFc} keyboardType="numeric" />
        <Input label="SpO₂ (%)" value={spo2} onChangeText={setSpo2} keyboardType="decimal-pad" />
        <Input label="Peso (kg)" value={peso} onChangeText={setPeso} keyboardType="decimal-pad" />
        <Input label="Estatura (cm)" value={estatura} onChangeText={setEstatura} keyboardType="decimal-pad" />
        <Input label="Temperatura (°C)" value={temp} onChangeText={setTemp} keyboardType="decimal-pad" />

        <TouchableOpacity style={styles.btn} onPress={handleGuardar}>
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.btnTxt}>Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom:12 }}>
      <Text style={{ fontSize:12, color:'#555', marginBottom:4 }}>{label}</Text>
      <TextInput {...props} style={{
        borderWidth:1, borderColor:'#E9E2C6', borderRadius:12,
        paddingHorizontal:12, paddingVertical:10, backgroundColor:'#fff'
      }}/>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar:{
    height:60, flexDirection:'row', alignItems:'center', paddingHorizontal:12,
    borderBottomWidth:1, borderColor:'#E9E2C6'
  },
  backBtn:{ padding:6, marginRight:8 },
  title:{ fontSize:18, fontWeight:'700' },
  body:{ padding:16 },
  btn:{
    marginTop:20, backgroundColor:'#F08C21', padding:14, borderRadius:14,
    alignItems:'center', flexDirection:'row', justifyContent:'center', gap:8
  },
  btnTxt:{ color:'#fff', fontWeight:'800', fontSize:16 },
});
