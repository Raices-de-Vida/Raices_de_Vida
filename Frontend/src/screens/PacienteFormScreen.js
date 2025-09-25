import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Animated
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { createPaciente } from '../services/pacientes';

const C = {
  bg: '#FFF7DA', card: '#FFFFFF', border: '#E9E2C6',
  text: '#1B1B1B', subtext: '#687076', primary: '#F08C21',
  accent: '#6698CC',
};

const ESTADOS = ['Activo', 'Inactivo', 'Derivado', 'Fallecido'];
const METODOS = ['Ninguno', 'Pastillas', 'Inyección', 'DIU', 'Condón', 'Natural', 'Otro'];

const onlyDigits = (s) => (s || '').replace(/\D+/g, '');
const toIntOrNull = (v) => (v === '' ? null : parseInt(v, 10));
const toFloatOrNull = (v) => {
  if (v === '') return null;
  const num = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(num) ? num : null;
};

const isoToDMY = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};
const dmyToISO = (dmy) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dmy);
  if (!m) return null;
  const dd = parseInt(m[1], 10), mm = parseInt(m[2], 10), yyyy = parseInt(m[3], 10);
  if (mm < 1 || mm > 12) return null;
  const maxDays = [31, (yyyy % 4 === 0 && yyyy % 100 !== 0) || yyyy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mm-1];
  if (dd < 1 || dd > maxDays) return null;
  const dt = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(dt.getTime()) ? null : `${yyyy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
};
const parseISODate = (iso) => {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? new Date() : dt;
};

export default function PacienteFormScreen({ navigation }) {
  // Animación
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 7 }),
    ]).start();
  }, []);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;
  const showSuccess = (msg) => {
    setToastMsg(msg);
    Animated.timing(toastAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
      setTimeout(() => Animated.timing(toastAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(), 1200);
    });
  };

  // DatePicker móvil
  const [showDatePicker, setShowDatePicker] = useState(null); // 'reg' | 'nac' | 'signos' | 'ultMen' | 'ultAct'

  //  General 
  const [fecha_registro, setFechaRegistro] = useState('');
  const [idioma, setIdioma] = useState('Español');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState(''); // 8 dígitos
  const [comunidad_pueblo, setComunidad] = useState('');
  const [genero, setGenero] = useState('F'); // 'M' | 'F'
  const [modoEdad, setModoEdad] = useState(false);
  const [fecha_nacimiento, setFechaNac] = useState('');
  const [edad, setEdad] = useState(''); // máx 2 dígitos

  // touched para errores limpios
  const [touchedEdad, setTouchedEdad] = useState(false);
  const [touchedNac, setTouchedNac] = useState(false);

  //  Signos snapshot
  const [presion_sis, setPresionSis] = useState('');
  const [presion_dia, setPresionDia] = useState('');
  const [frecuencia_cardiaca, setFC] = useState('');
  const [saturacion, setSatO2] = useState('');
  const [glucosa, setGlucosa] = useState('');
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [temperatura, setTemp] = useState('');
  const [fecha_signos_vitales, setFechaSignos] = useState('');

  //  Alergias
  const [tieneAlergias, setTieneAlergias] = useState(false);
  const [alergias, setAlergias] = useState('');

  //  Hábitos actuales/pasados
  const [tabaco_actual, setTabacoA] = useState(false);
  const [tabaco_actual_cantidad, setTabacoACant] = useState('');
  const [alcohol_actual, setAlcoholA] = useState(false);
  const [alcohol_actual_cantidad, setAlcoholACant] = useState('');
  const [drogas_actual, setDrogasA] = useState(false);
  const [drogas_actual_cantidad, setDrogasACant] = useState('');

  const [tabaco_pasado, setTabacoP] = useState(false);
  const [tabaco_pasado_cantidad, setTabacoPCant] = useState('');
  const [alcohol_pasado, setAlcoholP] = useState(false);
  const [alcohol_pasado_cantidad, setAlcoholPCant] = useState('');
  const [drogas_pasado, setDrogasP] = useState(false);
  const [drogas_pasado_cantidad, setDrogasPCant] = useState('');

  //  Salud reproductiva (F) 
  const [ultima_menstruacion, setUltM] = useState('');
  const [menopausia, setMenopausia] = useState(false);
  const [gestaciones, setGest] = useState('');
  const [partos, setPartos] = useState('');
  const [abortos_espontaneos, setAEsp] = useState('');
  const [abortos_inducidos, setAInd] = useState('');
  const [usa_anticonceptivos, setUsaAnti] = useState(false);
  const [metodo_anticonceptivo, setMetodo] = useState('Ninguno');

  const [estado_paciente, setEstado] = useState('Activo');
  const [fecha_ultima_actualizacion, setFechaUltAct] = useState('');
  const [observaciones_generales, setObs] = useState('');
  const [id_comunidad, setIdComunidad] = useState('');
  const [id_familia, setIdFamilia] = useState('');
  const [usuario_registro, setUsuarioRegistro] = useState('');

  // Errores de rango
  const [errors, setErrors] = useState({}); // {campo: 'mensaje'}
  const setRangeError = (key, msg) => setErrors((e) => ({ ...e, [key]: msg || undefined }));

  // Validaciones clave
  const telefonoValido = telefono === '' || telefono.length === 8;
  const edadValida = !modoEdad || (edad !== '' && edad.length <= 2);
  const fechaONedadOK = modoEdad ? edadValida : /^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento || '');

  const validar = () => {
    if (!idioma || !nombre || !genero) return false;
    if (!fechaONedadOK) return false;
    if (!telefonoValido) return false;
    if (!comunidad_pueblo.trim()) return false;
    if (!peso || !estatura) return false;
    if (presion_sis !== '' && presion_dia !== '' && Number(presion_sis) <= Number(presion_dia)) return false;
    if (Object.values(errors).some(Boolean)) return false;
    return true;
  };

  const buildPayload = () => ({
    fecha_registro: fecha_registro || null,
    idioma, nombre,
    apellido: apellido || null,
    telefono: telefono || null,
    comunidad_pueblo: comunidad_pueblo || null,
    fecha_nacimiento: modoEdad ? null : (fecha_nacimiento || null),
    edad: modoEdad ? toIntOrNull(edad) : null,
    genero,

    presion_arterial_sistolica: toIntOrNull(presion_sis),
    presion_arterial_diastolica: toIntOrNull(presion_dia),
    frecuencia_cardiaca: toIntOrNull(frecuencia_cardiaca),
    saturacion_oxigeno: toFloatOrNull(saturacion),
    glucosa: toFloatOrNull(glucosa),
    peso: toFloatOrNull(peso),
    estatura: toFloatOrNull(estatura),
    temperatura: toFloatOrNull(temperatura),
    fecha_signos_vitales: fecha_signos_vitales || null,

    tiene_alergias: !!tieneAlergias,
    alergias: tieneAlergias ? (alergias || null) : null,

    tabaco_actual: !!tabaco_actual,
    tabaco_actual_cantidad: tabaco_actual ? (tabaco_actual_cantidad || null) : null,
    alcohol_actual: !!alcohol_actual,
    alcohol_actual_cantidad: alcohol_actual ? (alcohol_actual_cantidad || null) : null,
    drogas_actual: !!drogas_actual,
    drogas_actual_cantidad: drogas_actual ? (drogas_actual_cantidad || null) : null,

    tabaco_pasado: !!tabaco_pasado,
    tabaco_pasado_cantidad: tabaco_pasado ? (tabaco_pasado_cantidad || null) : null,
    alcohol_pasado: !!alcohol_pasado,
    alcohol_pasado_cantidad: alcohol_pasado ? (alcohol_pasado_cantidad || null) : null,
    drogas_pasado: !!drogas_pasado,
    drogas_pasado_cantidad: drogas_pasado ? (drogas_pasado_cantidad || null) : null,

    ultima_menstruacion: genero === 'F' ? (ultima_menstruacion || null) : null,
    menopausia: genero === 'F' ? !!menopausia : null,
    gestaciones: genero === 'F' ? toIntOrNull(gestaciones) : null,
    partos: genero === 'F' ? toIntOrNull(partos) : null,
    abortos_espontaneos: genero === 'F' ? toIntOrNull(abortos_espontaneos) : null,
    abortos_inducidos: genero === 'F' ? toIntOrNull(abortos_inducidos) : null,
    usa_anticonceptivos: genero === 'F' ? !!usa_anticonceptivos : null,
    metodo_anticonceptivo: genero === 'F' ? metodo_anticonceptivo : 'Ninguno',

    estado_paciente,
    fecha_ultima_actualizacion: fecha_ultima_actualizacion || null,
    observaciones_generales: observaciones_generales || null,
    id_comunidad: id_comunidad ? toIntOrNull(id_comunidad) : null,
    id_familia: id_familia ? toIntOrNull(id_familia) : null,
    usuario_registro: usuario_registro ? toIntOrNull(usuario_registro) : null,
  });

  const handleSubmit = async () => {
    setTouchedEdad(true);
    setTouchedNac(true);
    if (!validar()) {
      Alert.alert('Revisa el formulario', 'Verifica requeridos, fecha/edad, teléfono (8 dígitos) y rangos válidos.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const payload = buildPayload();
      const resp = await createPaciente(payload, token);
      const id = resp?.id_paciente ?? resp?.paciente?.id_paciente;
      if (!id) throw new Error('No se recibió id_paciente.');
      try {
        await fetch(`http://localhost:3001/api/alertas/auto-evaluar/${id}`, { method: 'POST' });
      } catch (_) { /* no-op visual; el backend puede no estar disponible offline */ }
      showSuccess('Paciente guardado');
      setTimeout(() => navigation.navigate('RegistrarSignos', { id_paciente: id }), 900);
    } catch (e) {
      Alert.alert('Error', e?.message || 'No se pudo crear el paciente.');
    }
  };

  const onSis = (t) => {
    const v = onlyDigits(t);
    setPresionSis(v);
    if (v === '') return setRangeError('presion_sis', undefined);
    const n = parseInt(v, 10);
    if (n < 60 || n > 250) setRangeError('presion_sis', 'Rango 60–250');
    else setRangeError('presion_sis', undefined);
  };
  const onDia = (t) => {
    const v = onlyDigits(t);
    setPresionDia(v);
    if (v === '') return setRangeError('presion_dia', undefined);
    const n = parseInt(v, 10);
    if (n < 30 || n > 150) setRangeError('presion_dia', 'Rango 30–150');
    else setRangeError('presion_dia', undefined);
  };
  const onFC = (t) => {
    const v = onlyDigits(t);
    setFC(v);
    if (v === '') return setRangeError('fc', undefined);
    const n = parseInt(v, 10);
    if (n < 30 || n > 220) setRangeError('fc', 'Rango 30–220');
    else setRangeError('fc', undefined);
  };
  const onSpO2 = (t) => {
    const v = onlyDigits(t).slice(0,3);
    setSatO2(v);
    if (v === '') return setRangeError('spo2', undefined);
    const n = parseInt(v, 10);
    if (n < 50 || n > 100) setRangeError('spo2', 'Rango 50–100');
    else setRangeError('spo2', undefined);
  };
  const onGluc = (t) => {
    const v = onlyDigits(t);
    setGlucosa(v);
    if (v === '') return setRangeError('glu', undefined);
    const n = parseInt(v, 10);
    if (n < 20 || n > 600) setRangeError('glu', 'Rango 20–600');
    else setRangeError('glu', undefined);
  };
  const onTemp = (t) => {
    const v = t.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = v.split('.');
    const norm = parts[0].slice(0,2) + (parts[1] ? '.' + parts[1].slice(0,1) : '');
    setTemp(norm);
    if (norm === '') return setRangeError('temp', undefined);
    const n = parseFloat(norm);
    if (!(n >= 30 && n <= 43)) setRangeError('temp', 'Rango 30.0–43.0');
    else setRangeError('temp', undefined);
  };
  const onPeso = (t) => {
    const v = t.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = v.split('.');
    const norm = parts[0].slice(0,3) + (parts[1] ? '.' + parts[1].slice(0,1) : '');
    setPeso(norm);
    if (norm === '') return setRangeError('peso', undefined);
    const n = parseFloat(norm);
    if (!(n >= 1 && n <= 300)) setRangeError('peso', 'Rango 1–300 kg');
    else setRangeError('peso', undefined);
  };
  const onEst = (t) => {
    const v = t.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = v.split('.');
    const norm = parts[0].slice(0,3) + (parts[1] ? '.' + parts[1].slice(0,1) : '');
    setEstatura(norm);
    if (norm === '') return setRangeError('est', undefined);
    const n = parseFloat(norm);
    if (!(n >= 30 && n <= 250)) setRangeError('est', 'Rango 30–250 cm');
    else setRangeError('est', undefined);
  };


  const [dateTypingReg, setDateTypingReg] = useState('');
  const [dateTypingNac, setDateTypingNac] = useState('');
  const [dateTypingSV, setDateTypingSV] = useState('');
  const [dateTypingUlt, setDateTypingUlt] = useState('');
  const [dateTypingUA, setDateTypingUA] = useState('');

  useEffect(() => setDateTypingReg(isoToDMY(fecha_registro)), [fecha_registro]);
  useEffect(() => setDateTypingNac(isoToDMY(fecha_nacimiento)), [fecha_nacimiento]);
  useEffect(() => setDateTypingSV(isoToDMY(fecha_signos_vitales)), [fecha_signos_vitales]);
  useEffect(() => setDateTypingUlt(isoToDMY(ultima_menstruacion)), [ultima_menstruacion]);
  useEffect(() => setDateTypingUA(isoToDMY(fecha_ultima_actualizacion)), [fecha_ultima_actualizacion]);

  const maskDMY = (raw) => {
    const d = onlyDigits(raw).slice(0,8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0,2)}/${d.slice(2)}`;
    return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;
  };

  return (
    <View style={{ flex:1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.topTitle}>Nuevo Paciente</Text>
            <Text style={styles.topSubtitle}>Formulario de registro</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex:1}}>
        <ScrollView contentContainerStyle={{ padding:16, paddingBottom:140 }} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fade, transform:[{translateY: slide}] }}>

            {/* Identificación */}
            <Card title="Identificación">
              <Field label="Fecha de registro">
                <MaskedDateInput
                  value={dateTypingReg}
                  onChangeText={(t)=>{
                    const m = maskDMY(t);
                    setDateTypingReg(m);
                    if (m.length === 10) {
                      const iso = dmyToISO(m);
                      if (iso) setFechaRegistro(iso);
                    }
                    if (m.length === 0) setFechaRegistro('');
                  }}
                  onCalendarPress={()=>setShowDatePicker('reg')}
                />
              </Field>

              <Field label="Idioma *">
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={idioma} onValueChange={setIdioma}>
                    <Picker.Item label="Español" value="Español" />
                    <Picker.Item label="Kʼicheʼ" value="K'iche'" />
                    <Picker.Item label="Qʼeqchiʼ" value="Q'eqchi'" />
                    <Picker.Item label="Kaqchikel" value="Kaqchikel" />
                    <Picker.Item label="Otro" value="Otro" />
                  </Picker>
                </View>
              </Field>

              <Field label="Nombres *">
                <TextInput value={nombre} onChangeText={setNombre}
                  style={[styles.input, !nombre.trim() && styles.err]} placeholder="Ana" placeholderTextColor="#A2A7AE" />
                {!nombre.trim() && <Text style={styles.errText}>Campo requerido</Text>}
              </Field>

              <Field label="Apellidos">
                <TextInput value={apellido} onChangeText={setApellido}
                  style={[styles.input]} placeholder="Pérez" placeholderTextColor="#A2A7AE" />
              </Field>

              <Field label="Género *">
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={genero} onValueChange={setGenero}>
                    <Picker.Item label="Femenino" value="F" />
                    <Picker.Item label="Masculino" value="M" />
                  </Picker>
                </View>
              </Field>

              <Text style={styles.label}>Identificación de edad</Text>
              <View style={styles.radioRow}>
                <Radio
                  label="Usar fecha"
                  checked={!modoEdad}
                  onPress={()=>{ setModoEdad(false); setTouchedEdad(false); }}
                />
                <Radio
                  label="Usar edad"
                  checked={modoEdad}
                  onPress={()=>{ setModoEdad(true); setTouchedNac(false); }}
                />
              </View>

              {modoEdad ? (
                <Field label="Edad (años) *">
                  <TextInput
                    value={edad}
                    onChangeText={(t) => setEdad(onlyDigits(t).slice(0,2))}
                    onBlur={()=>setTouchedEdad(true)}
                    keyboardType="numeric" maxLength={2}
                    style={[styles.input, touchedEdad && !(edad !== '' && edad.length <= 2) && styles.err]}
                    placeholder="12" placeholderTextColor="#A2A7AE"
                  />
                  {touchedEdad && !(edad !== '' && edad.length <= 2) && (
                    <Text style={styles.errText}>Ingresa 1–2 dígitos</Text>
                  )}
                </Field>
              ) : (
                <Field label="Fecha de nacimiento *">
                  <MaskedDateInput
                    value={dateTypingNac}
                    onChangeText={(t)=>{
                      const m = maskDMY(t);
                      setDateTypingNac(m);
                      if (m.length === 10) {
                        const iso = dmyToISO(m);
                        if (iso) setFechaNac(iso);
                      }
                      if (m.length === 0) setFechaNac('');
                    }}
                    onBlur={()=>setTouchedNac(true)}
                    error={touchedNac && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento || '')}
                    onCalendarPress={()=>setShowDatePicker('nac')}
                  />
                  {touchedNac && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento || '') && (
                    <Text style={styles.errText}>Fecha inválida</Text>
                  )}
                </Field>
              )}

              <Field label="Teléfono (8 dígitos)">
                <TextInput
                  value={telefono}
                  onChangeText={(t)=> setTelefono(onlyDigits(t).slice(0,8))}
                  keyboardType="phone-pad" maxLength={8}
                  style={[styles.input, (!telefonoValido && telefono!=='') && styles.err]}
                  placeholder="50212345" placeholderTextColor="#A2A7AE"
                />
                {(!telefonoValido && telefono!=='') && <Text style={styles.errText}>Debe tener exactamente 8 dígitos.</Text>}
              </Field>

              <Field label="Comunidad / Pueblo *">
                  <TextInput value={comunidad_pueblo} onChangeText={setComunidad}
                    style={[styles.input, !comunidad_pueblo.trim() && styles.err]} placeholder="San Pedro La Laguna" placeholderTextColor="#A2A7AE" />
                  {!comunidad_pueblo.trim() && <Text style={styles.errText}>Campo requerido</Text>}
                </Field>
            </Card>

            {/* Signos (snapshot) */}
            <Card title="Signos vitales (snapshot)">
              <FieldRow>
                <Field label="PA Sistólica (mmHg)">
                  <TextInput value={presion_sis} onChangeText={onSis}
                    keyboardType="numeric" style={[styles.input, errors.presion_sis && styles.err]} maxLength={3}/>
                  {errors.presion_sis && <Text style={styles.errText}>{errors.presion_sis}</Text>}
                </Field>
                <Field label="PA Diastólica (mmHg)">
                  <TextInput value={presion_dia} onChangeText={onDia}
                    keyboardType="numeric" style={[styles.input, errors.presion_dia && styles.err]} maxLength={3}/>
                  {errors.presion_dia && <Text style={styles.errText}>{errors.presion_dia}</Text>}
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Frecuencia cardiaca (lpm)">
                  <TextInput value={frecuencia_cardiaca} onChangeText={onFC}
                    keyboardType="numeric" style={[styles.input, errors.fc && styles.err]} maxLength={3}/>
                  {errors.fc && <Text style={styles.errText}>{errors.fc}</Text>}
                </Field>
                <Field label="SpO₂ (%)">
                  <TextInput value={saturacion} onChangeText={onSpO2}
                    keyboardType="numeric" style={[styles.input, errors.spo2 && styles.err]} maxLength={3}/>
                  {errors.spo2 && <Text style={styles.errText}>{errors.spo2}</Text>}
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Glucosa (mg/dL)">
                  <TextInput value={glucosa} onChangeText={onGluc}
                    keyboardType="numeric" style={[styles.input, errors.glu && styles.err]} maxLength={3}/>
                  {errors.glu && <Text style={styles.errText}>{errors.glu}</Text>}
                </Field>
                <Field label="Temperatura (°C)">
                  <TextInput value={temperatura} onChangeText={onTemp}
                    keyboardType="decimal-pad" style={[styles.input, errors.temp && styles.err]} maxLength={4}/>
                  {errors.temp && <Text style={styles.errText}>{errors.temp}</Text>}
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Peso (kg)">
                  <TextInput value={peso} onChangeText={onPeso}
                    keyboardType="decimal-pad" style={[styles.input, errors.peso && styles.err]} maxLength={5}/>
                  {errors.peso && <Text style={styles.errText}>{errors.peso}</Text>}
                </Field>
                <Field label="Estatura (cm)">
                  <TextInput value={estatura} onChangeText={onEst}
                    keyboardType="decimal-pad" style={[styles.input, errors.est && styles.err]} maxLength={6}/>
                  {errors.est && <Text style={styles.errText}>{errors.est}</Text>}
                </Field>
              </FieldRow>

              <Field label="Fecha de signos vitales">
                <MaskedDateInput
                  value={dateTypingSV}
                  onChangeText={(t)=>{
                    const m = maskDMY(t);
                    setDateTypingSV(m);
                    if (m.length === 10) {
                      const iso = dmyToISO(m);
                      if (iso) setFechaSignos(iso);
                    }
                    if (m.length === 0) setFechaSignos('');
                  }}
                  onCalendarPress={()=>setShowDatePicker('signos')}
                />
              </Field>
            </Card>

            {/* Alergias */}
            <Card title="Alergias">
              <Toggle label="¿Tiene alergias?" value={tieneAlergias} onChange={setTieneAlergias} />
              {tieneAlergias && (
                <Field label="¿Qué alergias tiene?">
                  <TextInput value={alergias} onChangeText={setAlergias}
                    style={[styles.input, styles.textArea]} placeholder="Describir alergias" placeholderTextColor="#A2A7AE" multiline />
                </Field>
              )}
            </Card>

            {/* Hábitos */}
            <Card title="Hábitos actuales">
              <Toggle label="Tabaco" value={tabaco_actual} onChange={setTabacoA} />
              {tabaco_actual && (
                <Field label="Cantidad / Frecuencia">
                  <TextInput value={tabaco_actual_cantidad} onChangeText={setTabacoACant}
                    style={[styles.input]} placeholder="p.ej., 5 cig/día" placeholderTextColor="#A2A7AE" />
                </Field>
              )}
              <Toggle label="Alcohol" value={alcohol_actual} onChange={setAlcoholA} />
              {alcohol_actual && (
                <Field label="Cantidad / Frecuencia">
                  <TextInput value={alcohol_actual_cantidad} onChangeText={setAlcoholACant}
                    style={[styles.input]} placeholder="p.ej., 2 veces/sem" placeholderTextColor="#A2A7AE" />
                </Field>
              )}
              <Toggle label="Drogas" value={drogas_actual} onChange={setDrogasA} />
              {drogas_actual && (
                <Field label="Tipo / Frecuencia">
                  <TextInput value={drogas_actual_cantidad} onChangeText={setDrogasACant}
                    style={[styles.input]} placeholder="Detalle" placeholderTextColor="#A2A7AE" />
                </Field>
              )}
            </Card>

            <Card title="Hábitos pasados">
              <Toggle label="Tabaco (pasado)" value={tabaco_pasado} onChange={setTabacoP} />
              {tabaco_pasado && (
                <Field label="Cantidad / Frecuencia (pasado)">
                  <TextInput value={tabaco_pasado_cantidad} onChangeText={setTabacoPCant}
                    style={[styles.input]} placeholder="Detalle" placeholderTextColor="#A2A7AE" />
                </Field>
              )}
              <Toggle label="Alcohol (pasado)" value={alcohol_pasado} onChange={setAlcoholP} />
              {alcohol_pasado && (
                <Field label="Cantidad / Frecuencia (pasado)">
                  <TextInput value={alcohol_pasado_cantidad} onChangeText={setAlcoholPCant}
                    style={[styles.input]} placeholder="Detalle" placeholderTextColor="#A2A7AE" />
                </Field>
              )}
              <Toggle label="Drogas (pasado)" value={drogas_pasado} onChange={setDrogasP} />
              {drogas_pasado && (
                <Field label="Tipo / Frecuencia (pasado)">
                  <TextInput value={drogas_pasado_cantidad} onChangeText={setDrogasPCant}
                    style={[styles.input]} placeholder="Detalle" placeholderTextColor="#A2A7AE" />
                </Field>
              )}
            </Card>

            {/* Salud reproductiva (solo F) */}
            {genero === 'F' && (
              <Card title="Salud reproductiva">
                <Field label="Última menstruación">
                  <MaskedDateInput
                    value={dateTypingUlt}
                    onChangeText={(t)=>{
                      const m = maskDMY(t);
                      setDateTypingUlt(m);
                      if (m.length === 10) {
                        const iso = dmyToISO(m);
                        if (iso) setUltM(iso);
                      }
                      if (m.length === 0) setUltM('');
                    }}
                    onCalendarPress={()=>setShowDatePicker('ultMen')}
                  />
                </Field>

                <Toggle label="Menopausia" value={menopausia} onChange={setMenopausia} />

                <FieldRow>
                  <Field label="Gestaciones">
                    <TextInput value={gestaciones} onChangeText={(t)=>setGest(onlyDigits(t))}
                      keyboardType="numeric" style={[styles.input]} maxLength={3}/>
                  </Field>
                  <Field label="Partos">
                    <TextInput value={partos} onChangeText={(t)=>setPartos(onlyDigits(t))}
                      keyboardType="numeric" style={[styles.input]} maxLength={3}/>
                  </Field>
                </FieldRow>

                <FieldRow>
                  <Field label="Abortos espontáneos">
                    <TextInput value={abortos_espontaneos} onChangeText={(t)=>setAEsp(onlyDigits(t))}
                      keyboardType="numeric" style={[styles.input]} maxLength={3}/>
                  </Field>
                  <Field label="Abortos inducidos">
                    <TextInput value={abortos_inducidos} onChangeText={(t)=>setAInd(onlyDigits(t))}
                      keyboardType="numeric" style={[styles.input]} maxLength={3}/>
                  </Field>
                </FieldRow>

                <Toggle label="¿Usa anticonceptivos?" value={usa_anticonceptivos} onChange={setUsaAnti} />
                {usa_anticonceptivos && (
                  <Field label="Método anticonceptivo">
                    <View style={styles.pickerWrap}>
                      <Picker selectedValue={metodo_anticonceptivo} onValueChange={setMetodo}>
                        {METODOS.map(m => <Picker.Item key={m} label={m} value={m} />)}
                      </Picker>
                    </View>
                  </Field>
                )}
              </Card>
            )}

            {/* Estado / Relaciones */}
            <Card title="Estado y relaciones">
              <Field label="Estado del paciente">
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={estado_paciente} onValueChange={setEstado}>
                    {ESTADOS.map(e => <Picker.Item key={e} label={e} value={e} />)}
                  </Picker>
                </View>
              </Field>

              <Field label="Fecha última actualización">
                <MaskedDateInput
                  value={dateTypingUA}
                  onChangeText={(t)=>{
                    const m = maskDMY(t);
                    setDateTypingUA(m);
                    if (m.length === 10) {
                      const iso = dmyToISO(m);
                      if (iso) setFechaUltAct(iso);
                    }
                    if (m.length === 0) setFechaUltAct('');
                  }}
                  onCalendarPress={()=>setShowDatePicker('ultAct')}
                />
              </Field>

              <Field label="Observaciones generales">
                <TextInput value={observaciones_generales} onChangeText={setObs}
                  style={[styles.input, styles.textArea]} placeholder="Notas generales"
                  placeholderTextColor="#A2A7AE" multiline />
              </Field>

              <FieldRow>
                <Field label="ID comunidad">
                  <TextInput value={id_comunidad} onChangeText={(t)=>setIdComunidad(onlyDigits(t))}
                    keyboardType="numeric" style={[styles.input]} placeholder="(opcional)" placeholderTextColor="#A2A7AE" />
                </Field>
                <Field label="ID familia">
                  <TextInput value={id_familia} onChangeText={(t)=>setIdFamilia(onlyDigits(t))}
                    keyboardType="numeric" style={[styles.input]} placeholder="(opcional)" placeholderTextColor="#A2A7AE" />
                </Field>
              </FieldRow>

              <Field label="Usuario de registro (ID)">
                <TextInput value={usuario_registro} onChangeText={(t)=>setUsuarioRegistro(onlyDigits(t))}
                  keyboardType="numeric" style={[styles.input]} placeholder="(opcional)" placeholderTextColor="#A2A7AE" />
              </Field>
            </Card>

            <Text style={styles.hint}>
              * Requeridos: Idioma, Nombres, Género y <Text style={{fontWeight:'700'}}>Edad</Text> o <Text style={{fontWeight:'700'}}>Fecha de nacimiento</Text>.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* DateTimePicker móvil (opcional) */}
      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={
            showDatePicker==='reg'    ? parseISODate(fecha_registro) :
            showDatePicker==='nac'    ? parseISODate(fecha_nacimiento) :
            showDatePicker==='signos' ? parseISODate(fecha_signos_vitales) :
            showDatePicker==='ultMen' ? parseISODate(ultima_menstruacion) :
            parseISODate(fecha_ultima_actualizacion)
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (Platform.OS !== 'ios') setShowDatePicker(null);
            if (event.type === "set" && date) {
              const yyyy = date.getFullYear();
              const mm = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              const iso = `${yyyy}-${mm}-${dd}`;
              if (showDatePicker === 'reg') setFechaRegistro(iso);
              if (showDatePicker === 'nac') setFechaNac(iso);
              if (showDatePicker === 'signos') setFechaSignos(iso);
              if (showDatePicker === 'ultMen') setUltM(iso);
              if (showDatePicker === 'ultAct') setFechaUltAct(iso);
            }
          }}
          onTouchCancel={() => setShowDatePicker(null)}
        />
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.secBtn} onPress={() => navigation.goBack()} activeOpacity={0.9}>
          <Ionicons name="close-outline" size={18} color={C.text} />
          <Text style={styles.secTxt}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primBtn} onPress={handleSubmit} activeOpacity={0.9}>
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.primTxt}>Guardar paciente</Text>
        </TouchableOpacity>
      </View>

      {/* Toast */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          { opacity: toastAnim, transform: [{ translateY: toastAnim.interpolate({ inputRange: [0,1], outputRange: [20, 0] }) }] }
        ]}
      >
        <Ionicons name="checkmark-circle" size={18} color="#fff" />
        <Text style={styles.toastTxt}>{toastMsg}</Text>
      </Animated.View>
    </View>
  );
}

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}><Text style={styles.cardTitle}>{title}</Text></View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}
function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}
function FieldRow({ children }) {
  return <View style={{ flexDirection:'row', gap:10 }}>{React.Children.map(children, (ch) => <View style={{ flex:1 }}>{ch}</View>)}</View>;
}
function Toggle({ label, value, onChange }) {
  return (
    <TouchableOpacity onPress={() => onChange(!value)} activeOpacity={0.9} style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.toggleDot, value && styles.toggleDotOn]} />
      <Text style={[styles.toggleTxt, value && {color:'#fff'}]}>{label}</Text>
    </TouchableOpacity>
  );
}
function Radio({ label, checked, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.radioBtn} activeOpacity={0.85}>
      <View style={[styles.radioOuter, checked && { borderColor: C.accent }]}>
        {checked ? <View style={styles.radioInner}/> : null}
      </View>
      <Text style={styles.radioTxt}>{label}</Text>
    </TouchableOpacity>
  );
}
function MaskedDateInput({ value, onChangeText, onCalendarPress, onBlur, error }) {
  return (
    <View>
      <View style={[styles.input, error && styles.err, {flexDirection:'row', alignItems:'center', justifyContent:'space-between'}]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#A2A7AE"
          keyboardType={Platform.OS === 'web' ? 'default' : 'number-pad'}
          maxLength={10}
          style={{ fontSize:14, color:C.text, padding:0, flex:1 }}
        />
        <TouchableOpacity onPress={onCalendarPress} style={{ paddingLeft:8 }}>
          <Ionicons name="calendar-outline" size={18} color={C.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const R = 20;
const styles = StyleSheet.create({
  topBar: {
    height:72, marginHorizontal:16, marginTop:12, marginBottom:8, paddingHorizontal:12,
    borderWidth:1, borderRadius:16, flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    backgroundColor:'#FFF', borderColor:C.border,
    shadowOpacity:0.08, shadowRadius:12, shadowOffset:{width:0,height:6}, elevation:2,
  },
  topLeft:{ flexDirection:'row', alignItems:'center', gap:8 },
  iconBtn:{ padding:6, marginRight:6, borderRadius:10 },
  topTitle:{ fontSize:20, fontWeight:'800', color:C.text },
  topSubtitle:{ fontSize:12, color:C.accent, marginTop:2, fontWeight:'600' },

  card:{ backgroundColor:C.card, borderColor:C.border, borderWidth:1, borderRadius:R, marginBottom:14,
    shadowColor:'#000', shadowOpacity:0.05, shadowRadius:10, shadowOffset:{width:0,height:4}, elevation:1 },
  cardHeader:{ paddingHorizontal:14, paddingTop:12, paddingBottom:8 },
  cardTitle:{ fontSize:16, fontWeight:'800', color:C.text },
  cardBody:{ paddingHorizontal:14, paddingBottom:14 },

  label:{ fontSize:12, color:C.subtext, marginBottom:6, marginTop:6 },
  input:{ borderWidth:1, borderColor:C.border, borderRadius:12, backgroundColor:'#fff', paddingHorizontal:12, paddingVertical:10, fontSize:14, color:C.text },
  textArea:{ height:96, textAlignVertical:'top' },
  pickerWrap:{ borderWidth:1, borderRadius:12, backgroundColor:'#fff', borderColor:C.border, overflow:'hidden' },

  radioRow:{ flexDirection:'row', gap:16, alignItems:'center', paddingVertical:6 },
  radioBtn:{ flexDirection:'row', alignItems:'center', gap:8 },
  radioOuter:{ width:18, height:18, borderRadius:9, borderWidth:2, borderColor:'#B8BDC6', alignItems:'center', justifyContent:'center' },
  radioInner:{ width:10, height:10, borderRadius:5, backgroundColor:C.accent },
  radioTxt:{ color:C.text, fontWeight:'700' },

  toggle:{ flexDirection:'row', alignItems:'center', gap:10, paddingVertical:10, paddingHorizontal:12, borderRadius:12, borderWidth:1, borderColor:C.border, backgroundColor:'#fff', marginBottom:8 },
  toggleOn:{ backgroundColor:C.accent, borderColor:C.accent },
  toggleDot:{ width:16, height:16, borderRadius:8, borderWidth:1, borderColor:C.border, backgroundColor:'#fff' },
  toggleDotOn:{ backgroundColor:'#fff', borderColor:'#ffffff' },
  toggleTxt:{ color:C.text, fontWeight:'700' },

  err:{ borderColor:'#E57373', borderWidth:1.5 },
  errText:{ color:'#D32F2F', fontSize:11, marginTop:4 },

  hint:{ textAlign:'center', fontSize:12, color:C.subtext, marginTop:6, marginBottom:8 },

  footer:{ position:'absolute', left:0, right:0, bottom:0, paddingHorizontal:16, paddingTop:10, paddingBottom:14,
    backgroundColor:'#FFFFFFE6', borderTopWidth:1, borderTopColor:C.border, flexDirection:'row', gap:10,
    shadowColor:'#000', shadowOpacity:0.12, shadowRadius:10, shadowOffset:{width:0, height:-2}, elevation:10 },
  primBtn:{ flex:1, height:50, borderRadius:14, backgroundColor:C.primary, alignItems:'center', justifyContent:'center', flexDirection:'row', gap:8 },
  primTxt:{ color:'#fff', fontWeight:'800', fontSize:15 },
  secBtn:{ height:50, paddingHorizontal:16, borderRadius:14, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', flexDirection:'row', gap:6, borderWidth:1, borderColor:C.border },
  secTxt:{ color:C.text, fontWeight:'800', fontSize:14 },

  toast:{
    position:'absolute', bottom:80, alignSelf:'center',
    backgroundColor:'#2E7D32', paddingHorizontal:14, paddingVertical:10,
    borderRadius:12, flexDirection:'row', alignItems:'center', gap:8,
    shadowOpacity:0.15, shadowRadius:8, shadowOffset:{width:0,height:2}, elevation:4,
  },
  toastTxt:{ color:'#fff', fontWeight:'800' },
});
