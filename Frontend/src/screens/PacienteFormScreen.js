import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Animated
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { createPaciente, autoEvaluarAlertas } from '../services/pacientes';
import { useTranslation } from 'react-i18next';

// Importación condicional de DateTimePicker (solo funciona en móvil)
let DateTimePicker = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const C = { bg:'#FFF7DA', card:'#FFFFFF', border:'#E9E2C6', text:'#1B1B1B', subtext:'#687076', primary:'#F08C21', accent:'#6698CC' };

const TIPOS_CONSULTA = ['Diabetes', 'HTN', 'Respiratory', 'Other'];
const FURTHER_CONSULTS = ['GenSurg', 'GYN', 'Other'];

const onlyDigits = (s) => (s || '').replace(/\D+/g, '');
const toIntOrNull = (v) => (v === '' ? null : parseInt(v, 10));
const toFloatOrNull = (v) => {
  if (v === '') return null;
  const num = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(num) ? num : null;
};

const isoToDMY = (iso) => { if (!iso) return ''; const [y,m,d]=iso.split('-'); return `${d}/${m}/${y}`; };
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
const parseISODate = (iso) => { if (!iso) return new Date(); const [y,m,d]=iso.split('-').map((x)=>parseInt(x,10)); const dt = new Date(y, m-1, d); return Number.isNaN(dt.getTime()) ? new Date() : dt; };

// Límites de caracteres según pdfFieldsMap.json
const LIMITS = {
  date: 15,
  language: 20,
  patient_name: 50,
  phone: 20,
  town: 40,
  dob: 12,
  age: 10,
  consult_other_text: 25,
  chief_complaint: 250,
  vitals_bp: 10,
  vitals_hr: 6,
  vitals_spo2: 6,
  vitals_bs: 6,
  vitals_weight: 12,
  vitals_height: 12,
  vitals_temp: 8,
  allergies: 80,
  current_tobacco_details: 20,
  current_alcohol_details: 20,
  current_drugs_details: 10,
  past_tobacco_details: 20,
  past_alcohol_details: 20,
  past_drugs_details: 10,
  lmp: 18,
  gravida: 4,
  para: 4,
  miscarriage: 4,
  abortion: 4,
  control_method: 15,
  history: 200,
  medical_dx: 200,
  surgeries: 200,
  meds: 200,
  physical_exam_heart: 40,
  physical_exam_lungs: 40,
  physical_exam_abdomen: 40,
  physical_exam_gyn: 40,
  impression: 400,
  plan: 400,
  rx_notes: 200,
  further_consult_other_text: 35,
  provider: 35,
  interpreter: 35,
  surgical_history: 200,
  surgical_exam: 200,
  surgical_impression: 180,
  surgical_plan: 200,
  surgical_meds: 300,
  surgical_consult_other_text: 30,
  surgical_surgeon: 35,
  surgical_interpreter: 35,
  surgical_notes: 2000
};

// ===== COMPONENTE REUTILIZABLE (FUERA DEL RENDER PRINCIPAL) =====
const CharLimitedInput = ({ value, onChangeText, limit, multiline = false, placeholder = '', rows = 1 }) => {
  const pct = limit ? (value.length / limit) * 100 : 0;
  const color = pct < 70 ? '#4CAF50' : pct < 90 ? '#FFA726' : '#EF5350';
  
  return (
    <View>
      <TextInput
        style={[styles.input, multiline && { height: Math.max(40, rows * 22), textAlignVertical: 'top', paddingTop: 10 }]}
        value={value}
        onChangeText={(text) => {
          if (limit && text.length > limit) return;
          onChangeText(text);
        }}
        placeholder={placeholder}
        placeholderTextColor={C.subtext}
        multiline={multiline}
        numberOfLines={multiline ? rows : 1}
      />
      {limit && (
        <Text style={[styles.charCount, { color }]}>
          {value.length}/{limit}
        </Text>
      )}
    </View>
  );
};

export default function PacienteFormScreen({ navigation }) {
  const { t } = useTranslation('PacienteForm');

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

  // DatePicker
  const [showDatePicker, setShowDatePicker] = useState(null); // 'reg' | 'nac' | 'ultMen' | 'surgical'
  
  // ===== ESTADOS - ORDEN DEL PDF =====
  
  // 1) Header Info (página 0, líneas 63-112)
  const [fecha_registro, setFechaRegistro] = useState('');
  const [dateTypingReg, setDateTypingReg] = useState('');
  const [idioma, setIdioma] = useState('Español');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comunidad_pueblo, setComunidad] = useState('');
  const [modoEdad, setModoEdad] = useState(false); // false = fecha_nacimiento, true = edad
  const [fecha_nacimiento, setFechaNac] = useState('');
  const [dateTypingNac, setDateTypingNac] = useState('');
  const [edad, setEdad] = useState('');
  const [genero, setGenero] = useState('F');
  const [touchedEdad, setTouchedEdad] = useState(false);
  const [touchedNac, setTouchedNac] = useState(false);
  
  // 2) Consultation Type (página 0, línea 133-139)
  const [tipo_consulta, setTipoConsulta] = useState('');
  const [consult_other_text, setConsultOtherText] = useState('');
  
  // 3) Chief Complaint (página 0, línea 161)
  const [chief_complaint, setChiefComplaint] = useState('');
  
  // 4) Vitals + Flags (página 0, línea 189-232)
  const [presion_sistolica, setPresionSis] = useState('');
  const [presion_diastolica, setPresionDia] = useState('');
  const [frecuencia_cardiaca, setFC] = useState('');
  const [saturacion_oxigeno, setSatO2] = useState('');
  const [glucosa, setGlucosa] = useState('');
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [temperatura, setTemp] = useState('');
  const [medicamento_bp_tomado, setMedicamentoBP] = useState(false);
  const [medicamento_bs_tomado, setMedicamentoBS] = useState(false);
  const [paciente_en_ayuno, setPacienteAyuno] = useState(false);
  
  // 5) Allergies + Preventive Meds (página 0, línea 225-232)
  const [tiene_alergias, setTieneAlergias] = useState(false);
  const [alergias, setAlergias] = useState('');
  const [vitamins, setVitamins] = useState('');
  const [albendazole, setAlbendazole] = useState('');
  
  // 6) Current Habits (página 0, línea 241-258)
  const [tabaco_actual, setTabacoA] = useState(false);
  const [tabaco_actual_cantidad, setTabacoACant] = useState('');
  const [alcohol_actual, setAlcoholA] = useState(false);
  const [alcohol_actual_cantidad, setAlcoholACant] = useState('');
  const [drogas_actual, setDrogasA] = useState(false);
  const [drogas_actual_cantidad, setDrogasACant] = useState('');
  
  // 7) Past Habits (página 0, línea 262-279)
  const [tabaco_pasado, setTabacoP] = useState(false);
  const [tabaco_pasado_cantidad, setTabacoPCant] = useState('');
  const [alcohol_pasado, setAlcoholP] = useState(false);
  const [alcohol_pasado_cantidad, setAlcoholPCant] = useState('');
  const [drogas_pasado, setDrogasP] = useState(false);
  const [drogas_pasado_cantidad, setDrogasPCant] = useState('');
  
  // 8) Reproductive Health (página 0, línea 292-319)
  const [ultima_menstruacion, setUltimaMenstruacion] = useState('');
  const [dateTypingLMP, setDateTypingLMP] = useState('');
  const [menopausia, setMenopausia] = useState(false);
  const [gestaciones, setGestaciones] = useState('');
  const [partos, setPartos] = useState('');
  const [abortos_espontaneos, setAbortosEsp] = useState('');
  const [abortos_inducidos, setAbortosInd] = useState('');
  const [usa_anticonceptivos, setUsaAnticonceptivos] = useState(false);
  const [metodo_anticonceptivo, setMetodoAnticonceptivo] = useState('');
  
  // 9) Clinical History (página 0, línea 356-495)
  const [historia_enfermedad_actual, setHistoriaEnfermedad] = useState('');
  const [diagnosticos_previos, setDiagnosticosPrevios] = useState('');
  const [cirugias_previas, setCirugiasPrevias] = useState('');
  const [medicamentos_actuales, setMedicamentosActuales] = useState('');
  
  // 10) Physical Exam (página 0, línea 522-567)
  const [examen_corazon, setExamenCorazon] = useState('');
  const [examen_pulmones, setExamenPulmones] = useState('');
  const [examen_abdomen, setExamenAbdomen] = useState('');
  const [examen_ginecologico, setExamenGinecologico] = useState('');
  
  // 11) Assessment & Plan (página 0, línea 589-705)
  const [impresion, setImpresion] = useState('');
  const [plan, setPlan] = useState('');
  const [rx_notes, setRxNotes] = useState('');
  
  // 12) Further Consultation (página 0, línea 717-740)
  const [further_consult, setFurtherConsult] = useState('');
  const [further_consult_other_text, setFurtherConsultOtherText] = useState('');
  
  // 13) Provider & Interpreter (página 0, línea 752)
  const [provider, setProvider] = useState('');
  const [interprete, setInterprete] = useState('');
  
  // 14) Surgical Section (página 1)
  const [mostrarQuirurgica, setMostrarQuirurgica] = useState(false);
  const [surgical_date, setSurgicalDate] = useState('');
  const [dateTypingSurg, setDateTypingSurg] = useState('');
  const [surgical_history, setSurgicalHistory] = useState('');
  const [surgical_exam, setSurgicalExam] = useState('');
  const [surgical_impression, setSurgicalImpression] = useState('');
  const [surgical_plan, setSurgicalPlan] = useState('');
  const [surgical_meds, setSurgicalMeds] = useState('');
  const [surgical_consult, setSurgicalConsult] = useState('');
  const [surgical_consult_other_text, setSurgicalConsultOtherText] = useState('');
  const [surgical_surgeon, setSurgicalSurgeon] = useState('');
  const [surgical_interpreter, setSurgicalInterpreter] = useState('');
  const [surgical_notes, setSurgicalNotes] = useState('');
  const [rx_slips_attached, setRxSlipsAttached] = useState(false);
  
  // Auto-formateo de fechas
  useEffect(() => setDateTypingReg(isoToDMY(fecha_registro)), [fecha_registro]);
  useEffect(() => setDateTypingNac(isoToDMY(fecha_nacimiento)), [fecha_nacimiento]);
  useEffect(() => setDateTypingLMP(isoToDMY(ultima_menstruacion)), [ultima_menstruacion]);
  useEffect(() => setDateTypingSurg(isoToDMY(surgical_date)), [surgical_date]);
  
  // Inicializar fecha de registro
  useEffect(() => {
    if (!fecha_registro) {
      const hoy = new Date();
      const iso = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
      setFechaRegistro(iso);
    }
  }, []);

  // Validación
  const validar = () => {
    // Campos obligatorios básicos
    if (!idioma || !nombre || !genero) return false;
    
    // Debe tener edad O fecha de nacimiento
    if (!modoEdad && !fecha_nacimiento) return false;
    if (modoEdad && !edad) return false;
    
    // Si hay consulta, validar campos requeridos
    if (tipo_consulta && chief_complaint) {
      if (!historia_enfermedad_actual || !examen_corazon || !impresion) return false;
    }
    
    return true;
  };

  // Construir payload
  const buildPayload = () => {
    const pacienteData = {
      fecha_registro: fecha_registro || null,
      idioma,
      nombre,
      apellido,
      telefono: telefono || null,
      comunidad_pueblo: comunidad_pueblo || null,
      fecha_nacimiento: modoEdad ? null : (fecha_nacimiento || null),
      edad: modoEdad ? toIntOrNull(edad) : null,
      genero,
      presion_arterial_sistolica: toIntOrNull(presion_sistolica),
      presion_arterial_diastolica: toIntOrNull(presion_diastolica),
      frecuencia_cardiaca: toIntOrNull(frecuencia_cardiaca),
      saturacion_oxigeno: toFloatOrNull(saturacion_oxigeno),
      glucosa: toFloatOrNull(glucosa),
      peso: toFloatOrNull(peso),
      estatura: toFloatOrNull(estatura),
      temperatura: toFloatOrNull(temperatura),
      tiene_alergias,
      alergias: tiene_alergias ? alergias : null,
      tabaco_actual,
      tabaco_actual_cantidad: tabaco_actual ? tabaco_actual_cantidad : null,
      alcohol_actual,
      alcohol_actual_cantidad: alcohol_actual ? alcohol_actual_cantidad : null,
      drogas_actual,
      drogas_actual_cantidad: drogas_actual ? drogas_actual_cantidad : null,
      tabaco_pasado,
      tabaco_pasado_cantidad: tabaco_pasado ? tabaco_pasado_cantidad : null,
      alcohol_pasado,
      alcohol_pasado_cantidad: alcohol_pasado ? alcohol_pasado_cantidad : null,
      drogas_pasado,
      drogas_pasado_cantidad: drogas_pasado ? drogas_pasado_cantidad : null,
      ultima_menstruacion: ultima_menstruacion || null,
      menopausia,
      gestaciones: toIntOrNull(gestaciones),
      partos: toIntOrNull(partos),
      abortos_espontaneos: toIntOrNull(abortos_espontaneos),
      abortos_inducidos: toIntOrNull(abortos_inducidos),
      usa_anticonceptivos,
      metodo_anticonceptivo: usa_anticonceptivos ? metodo_anticonceptivo : null,
      estado_paciente: 'Activo'
    };
    
    // Datos de consulta (solo si hay tipo_consulta Y chief_complaint)
    if (tipo_consulta && chief_complaint) {
      return {
        ...pacienteData,
        tipo_consulta,
        ...(tipo_consulta === 'Other' && consult_other_text ? { consult_other_text } : {}),
        chief_complaint,
        paciente_en_ayuno,
        medicamento_bp_tomado,
        medicamento_bs_tomado,
        vitamins: toIntOrNull(vitamins),
        albendazole: toIntOrNull(albendazole),
        historia_enfermedad_actual,
        diagnosticos_previos,
        cirugias_previas,
        medicamentos_actuales,
        examen_corazon,
        examen_pulmones,
        examen_abdomen,
        examen_ginecologico,
        impresion,
        plan,
        rx_notes,
        further_consult,
        ...(further_consult === 'Other' && further_consult_other_text ? { further_consult_other_text } : {}),
        provider,
        interprete,
        ...(mostrarQuirurgica ? {
          surgical_date: surgical_date || null,
          surgical_history,
          surgical_exam,
          surgical_impression,
          surgical_plan,
          surgical_meds,
          surgical_consult,
          ...(surgical_consult === 'Other' && surgical_consult_other_text ? { surgical_consult_other_text } : {}),
          surgical_surgeon,
          surgical_interpreter,
          surgical_notes,
          rx_slips_attached
        } : {})
      };
    }
    
    return pacienteData;
  };

  // Guardar
  const guardar = async () => {
    if (!validar()) {
      Alert.alert(t('errors.incomplete'));
      return;
    }
    
    try {
      const payload = buildPayload();
      const token = await AsyncStorage.getItem('token');
      const resp = await createPaciente(payload, token);
      
      if (resp && resp.id_paciente) {
        showSuccess(t('toast.saved'));
        
        // Auto-evaluar alertas si hay signos vitales
        if (presion_sistolica || presion_diastolica || frecuencia_cardiaca || saturacion_oxigeno || glucosa || temperatura) {
          try {
            await autoEvaluarAlertas(resp.id_paciente, token);
          } catch (e) {
            console.warn('Error auto-evaluar:', e);
          }
        }
        
        setTimeout(() => navigation.goBack(), 1400);
      }
    } catch (err) {
      console.error('Error guardar:', err);
      Alert.alert(t('errors.createFail'));
    }
  };

  // Manejo de fecha con DateTimePicker (solo móvil)
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(null);
    if (event.type === 'dismissed' || !selectedDate) return;
    const iso = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`;
    if (showDatePicker === 'reg') setFechaRegistro(iso);
    if (showDatePicker === 'nac') { setFechaNac(iso); setTouchedNac(true); }
    if (showDatePicker === 'ultMen') setUltimaMenstruacion(iso);
    if (showDatePicker === 'surgical') setSurgicalDate(iso);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View style={[styles.container, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header con botón de regresar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('top.title')}</Text>
              <Text style={styles.subtitle}>{t('top.subtitle')}</Text>
            </View>
          </View>

          {/* 1) HEADER INFO */}
          <Card title="Información del Paciente">
            <Field label={t('fields.dateReg')}>
              <MaskedDateInput
                value={dateTypingReg}
                onChangeText={(txt) => {
                  setDateTypingReg(txt);
                  const iso = dmyToISO(txt);
                  if (iso) setFechaRegistro(iso);
                }}
                onCalendarPress={Platform.OS !== 'web' ? () => setShowDatePicker('reg') : null}
                onBlur={() => {
                  if (!fecha_registro || !dmyToISO(dateTypingReg)) {
                    const hoy = new Date();
                    const iso = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
                    setFechaRegistro(iso);
                  }
                }}
                placeholder="DD/MM/AAAA"
              />
            </Field>

            <Field label={t('fields.language')}>
              <Picker selectedValue={idioma} onValueChange={setIdioma} style={styles.picker}>
                <Picker.Item label="Español" value="Español" />
                <Picker.Item label="Inglés" value="Inglés" />
                <Picker.Item label="K'iche'" value="K'iche'" />
                <Picker.Item label="Kaqchikel" value="Kaqchikel" />
                <Picker.Item label="Q'eqchi'" value="Q'eqchi'" />
                <Picker.Item label="Mam" value="Mam" />
              </Picker>
            </Field>

            <Field label={t('fields.firstName')}>
              <CharLimitedInput value={nombre} onChangeText={setNombre} limit={LIMITS.patient_name} placeholder="Nombres" />
            </Field>

            <Field label={t('fields.lastName')}>
              <CharLimitedInput value={apellido} onChangeText={setApellido} limit={LIMITS.patient_name} placeholder="Apellidos" />
            </Field>

            <Field label={t('fields.phone')}>
              <CharLimitedInput
                value={telefono}
                onChangeText={(txt) => setTelefono(onlyDigits(txt))}
                limit={LIMITS.phone}
                placeholder="12345678"
              />
            </Field>

            <Field label={t('fields.community')}>
              <CharLimitedInput value={comunidad_pueblo} onChangeText={setComunidad} limit={LIMITS.town} placeholder="Comunidad o pueblo" />
            </Field>

            <Field label={t('fields.gender')}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Radio label="F" checked={genero === 'F'} onPress={() => setGenero('F')} />
                <Radio label="M" checked={genero === 'M'} onPress={() => setGenero('M')} />
              </View>
            </Field>

            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setModoEdad(false)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.radio, !modoEdad && styles.radioActive]} />
                <Text style={styles.label}>{t('fields.useDate')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModoEdad(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.radio, modoEdad && styles.radioActive]} />
                <Text style={styles.label}>{t('fields.useAge')}</Text>
              </TouchableOpacity>
            </View>

            {modoEdad ? (
              <Field label={t('fields.ageYears')}>
                <CharLimitedInput
                  value={edad}
                  onChangeText={(txt) => {
                    setEdad(onlyDigits(txt));
                    setTouchedEdad(true);
                  }}
                  limit={LIMITS.age}
                  placeholder="35"
                />
              </Field>
            ) : (
              <Field label={t('fields.birthdate')}>
                <MaskedDateInput
                  value={dateTypingNac}
                  onChangeText={(txt) => {
                    setDateTypingNac(txt);
                    const iso = dmyToISO(txt);
                    if (iso) {
                      setFechaNac(iso);
                      setTouchedNac(true);
                    }
                  }}
                  onCalendarPress={Platform.OS !== 'web' ? () => setShowDatePicker('nac') : null}
                  error={touchedNac && !fecha_nacimiento}
                  placeholder="DD/MM/AAAA"
                />
              </Field>
            )}
          </Card>

          {/* 2) CONSULTATION TYPE */}
          <Card title="Tipo de Consulta">
            <Field label={t('fields.consultType')}>
              <Picker selectedValue={tipo_consulta} onValueChange={setTipoConsulta} style={styles.picker}>
                <Picker.Item label="-- Seleccionar --" value="" />
                {TIPOS_CONSULTA.map((tipo) => (
                  <Picker.Item key={tipo} label={tipo} value={tipo} />
                ))}
              </Picker>
            </Field>

            {tipo_consulta === 'Other' && (
              <Field label="Especificar">
                <CharLimitedInput value={consult_other_text} onChangeText={setConsultOtherText} limit={LIMITS.consult_other_text} placeholder="Ej: Respiratory Issues" />
              </Field>
            )}

            {tipo_consulta && (
              <Field label={t('fields.chiefComplaint')}>
                <CharLimitedInput
                  value={chief_complaint}
                  onChangeText={setChiefComplaint}
                  limit={LIMITS.chief_complaint}
                  multiline
                  rows={4}
                  placeholder="Queja principal del paciente"
                />
              </Field>
            )}
          </Card>

          {/* 3) VITALS + FLAGS */}
          {tipo_consulta && chief_complaint && (
            <Card title="Signos Vitales">
              <FieldRow>
                <Field label="BP (mmHg)">
                  <CharLimitedInput value={presion_sistolica} onChangeText={(txt) => setPresionSis(onlyDigits(txt))} limit={3} placeholder="120" />
                </Field>
                <View style={{ justifyContent: 'center', paddingTop: 24 }}>
                  <Text style={{ fontSize: 16, color: C.text }}>/</Text>
                </View>
                <Field label=" ">
                  <CharLimitedInput value={presion_diastolica} onChangeText={(txt) => setPresionDia(onlyDigits(txt))} limit={3} placeholder="80" />
                </Field>
              </FieldRow>

              <Toggle label="Tomó medicamento BP?" value={medicamento_bp_tomado} onChange={setMedicamentoBP} />
              <Toggle label="Tomó medicamento BS?" value={medicamento_bs_tomado} onChange={setMedicamentoBS} />

              <FieldRow>
                <Field label="HR (bpm)">
                  <CharLimitedInput value={frecuencia_cardiaca} onChangeText={(txt) => setFC(onlyDigits(txt))} limit={LIMITS.vitals_hr} placeholder="75" />
                </Field>
                <Field label="SpO₂ (%)">
                  <CharLimitedInput value={saturacion_oxigeno} onChangeText={(txt) => setSatO2(txt)} limit={LIMITS.vitals_spo2} placeholder="98" />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Glucosa (mg/dL)">
                  <CharLimitedInput value={glucosa} onChangeText={(txt) => setGlucosa(txt)} limit={LIMITS.vitals_bs} placeholder="95" />
                </Field>
                <Field label="Temperatura (°C)">
                  <CharLimitedInput value={temperatura} onChangeText={(txt) => setTemp(txt)} limit={LIMITS.vitals_temp} placeholder="36.8" />
                </Field>
              </FieldRow>

              <Toggle label="Paciente en ayuno?" value={paciente_en_ayuno} onChange={setPacienteAyuno} />

              <FieldRow>
                <Field label="Peso (kg)">
                  <CharLimitedInput value={peso} onChangeText={(txt) => setPeso(txt)} limit={LIMITS.vitals_weight} placeholder="70" />
                </Field>
                <Field label="Estatura (cm)">
                  <CharLimitedInput value={estatura} onChangeText={(txt) => setEstatura(txt)} limit={LIMITS.vitals_height} placeholder="170" />
                </Field>
              </FieldRow>
            </Card>
          )}

          {/* 4) ALLERGIES + PREVENTIVE MEDS */}
          {tipo_consulta && chief_complaint && (
            <Card title="Alergias y Medicamentos Preventivos">
              <Toggle label={t('fields.hasAllergies')} value={tiene_alergias} onChange={setTieneAlergias} />
              {tiene_alergias && (
                <Field label={t('fields.whatAllergies')}>
                  <CharLimitedInput value={alergias} onChangeText={setAlergias} limit={LIMITS.allergies} placeholder="Penicilina, etc." />
                </Field>
              )}

              <FieldRow>
                <Field label="Vitaminas (#)">
                  <CharLimitedInput value={vitamins} onChangeText={(txt) => setVitamins(onlyDigits(txt))} limit={2} placeholder="2" />
                </Field>
                <Field label="Albendazol (#)">
                  <CharLimitedInput value={albendazole} onChangeText={(txt) => setAlbendazole(onlyDigits(txt))} limit={2} placeholder="1" />
                </Field>
              </FieldRow>
            </Card>
          )}

          {/* 5) CURRENT HABITS */}
          {tipo_consulta && chief_complaint && (
            <Card title="Hábitos Actuales">
              <Toggle label="Tabaco" value={tabaco_actual} onChange={setTabacoA} />
              {tabaco_actual && (
                <Field label="Cantidad/Frecuencia">
                  <CharLimitedInput value={tabaco_actual_cantidad} onChangeText={setTabacoACant} limit={LIMITS.current_tobacco_details} placeholder="1 pack/day" />
                </Field>
              )}

              <Toggle label="Alcohol" value={alcohol_actual} onChange={setAlcoholA} />
              {alcohol_actual && (
                <Field label="Cantidad/Frecuencia">
                  <CharLimitedInput value={alcohol_actual_cantidad} onChangeText={setAlcoholACant} limit={LIMITS.current_alcohol_details} placeholder="2 beers/week" />
                </Field>
              )}

              <Toggle label="Drogas" value={drogas_actual} onChange={setDrogasA} />
              {drogas_actual && (
                <Field label="Tipo/Frecuencia">
                  <CharLimitedInput value={drogas_actual_cantidad} onChangeText={setDrogasACant} limit={LIMITS.current_drugs_details} placeholder="Tipo" />
                </Field>
              )}
            </Card>
          )}

          {/* 6) PAST HABITS */}
          {tipo_consulta && chief_complaint && (
            <Card title="Hábitos Pasados">
              <Toggle label="Tabaco (pasado)" value={tabaco_pasado} onChange={setTabacoP} />
              {tabaco_pasado && (
                <Field label="Cantidad/Frecuencia (pasado)">
                  <CharLimitedInput value={tabaco_pasado_cantidad} onChangeText={setTabacoPCant} limit={LIMITS.past_tobacco_details} placeholder="1 pack/day x 5yrs" />
                </Field>
              )}

              <Toggle label="Alcohol (pasado)" value={alcohol_pasado} onChange={setAlcoholP} />
              {alcohol_pasado && (
                <Field label="Cantidad/Frecuencia (pasado)">
                  <CharLimitedInput value={alcohol_pasado_cantidad} onChangeText={setAlcoholPCant} limit={LIMITS.past_alcohol_details} placeholder="3 beers/week" />
                </Field>
              )}

              <Toggle label="Drogas (pasado)" value={drogas_pasado} onChange={setDrogasP} />
              {drogas_pasado && (
                <Field label="Tipo/Frecuencia (pasado)">
                  <CharLimitedInput value={drogas_pasado_cantidad} onChangeText={setDrogasPCant} limit={LIMITS.past_drugs_details} placeholder="Tipo" />
                </Field>
              )}
            </Card>
          )}

          {/* 7) REPRODUCTIVE HEALTH */}
          {tipo_consulta && chief_complaint && genero === 'F' && (
            <Card title="Salud Reproductiva">
              <Field label="Última Menstruación (LMP)">
                <MaskedDateInput
                  value={dateTypingLMP}
                  onChangeText={(txt) => {
                    setDateTypingLMP(txt);
                    const iso = dmyToISO(txt);
                    if (iso) setUltimaMenstruacion(iso);
                  }}
                  onCalendarPress={Platform.OS !== 'web' ? () => setShowDatePicker('ultMen') : null}
                  placeholder="DD/MM/AAAA"
                />
              </Field>

              <Toggle label="Menopausia" value={menopausia} onChange={setMenopausia} />

              <FieldRow>
                <Field label="Gestaciones">
                  <CharLimitedInput value={gestaciones} onChangeText={(txt) => setGestaciones(onlyDigits(txt))} limit={LIMITS.gravida} placeholder="0" />
                </Field>
                <Field label="Partos">
                  <CharLimitedInput value={partos} onChangeText={(txt) => setPartos(onlyDigits(txt))} limit={LIMITS.para} placeholder="0" />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Abortos Espontáneos">
                  <CharLimitedInput value={abortos_espontaneos} onChangeText={(txt) => setAbortosEsp(onlyDigits(txt))} limit={LIMITS.miscarriage} placeholder="0" />
                </Field>
                <Field label="Abortos Inducidos">
                  <CharLimitedInput value={abortos_inducidos} onChangeText={(txt) => setAbortosInd(onlyDigits(txt))} limit={LIMITS.abortion} placeholder="0" />
                </Field>
              </FieldRow>

              <Toggle label="Usa Anticonceptivos?" value={usa_anticonceptivos} onChange={setUsaAnticonceptivos} />
              {usa_anticonceptivos && (
                <Field label="Método">
                  <CharLimitedInput value={metodo_anticonceptivo} onChangeText={setMetodoAnticonceptivo} limit={LIMITS.control_method} placeholder="Pastillas" />
                </Field>
              )}
            </Card>
          )}

          {/* 8) CLINICAL HISTORY */}
          {tipo_consulta && chief_complaint && (
            <Card title="Historia Clínica">
              <Field label="Historia de Enfermedad Actual">
                <CharLimitedInput
                  value={historia_enfermedad_actual}
                  onChangeText={setHistoriaEnfermedad}
                  limit={LIMITS.history}
                  multiline
                  rows={3}
                  placeholder="Descripción de la enfermedad actual"
                />
              </Field>

              <Field label="Diagnósticos Previos">
                <CharLimitedInput
                  value={diagnosticos_previos}
                  onChangeText={setDiagnosticosPrevios}
                  limit={LIMITS.medical_dx}
                  multiline
                  rows={3}
                  placeholder="Antecedentes médicos"
                />
              </Field>

              <Field label="Cirugías Previas">
                <CharLimitedInput
                  value={cirugias_previas}
                  onChangeText={setCirugiasPrevias}
                  limit={LIMITS.surgeries}
                  multiline
                  rows={3}
                  placeholder="Cirugías realizadas"
                />
              </Field>

              <Field label="Medicamentos Actuales">
                <CharLimitedInput
                  value={medicamentos_actuales}
                  onChangeText={setMedicamentosActuales}
                  limit={LIMITS.meds}
                  multiline
                  rows={3}
                  placeholder="Medicamentos que toma actualmente"
                />
              </Field>
            </Card>
          )}

          {/* 9) PHYSICAL EXAM */}
          {tipo_consulta && chief_complaint && (
            <Card title="Examen Físico">
              <Field label="Corazón">
                <CharLimitedInput value={examen_corazon} onChangeText={setExamenCorazon} limit={LIMITS.physical_exam_heart} placeholder="Normal" />
              </Field>

              <Field label="Pulmones">
                <CharLimitedInput value={examen_pulmones} onChangeText={setExamenPulmones} limit={LIMITS.physical_exam_lungs} placeholder="Normal" />
              </Field>

              <Field label="Abdomen">
                <CharLimitedInput value={examen_abdomen} onChangeText={setExamenAbdomen} limit={LIMITS.physical_exam_abdomen} placeholder="Normal" />
              </Field>

              {genero === 'F' && (
                <Field label="Ginecológico">
                  <CharLimitedInput value={examen_ginecologico} onChangeText={setExamenGinecologico} limit={LIMITS.physical_exam_gyn} placeholder="N/A" />
                </Field>
              )}
            </Card>
          )}

          {/* 10) ASSESSMENT & PLAN */}
          {tipo_consulta && chief_complaint && (
            <Card title="Evaluación y Plan">
              <Field label="Impresión">
                <CharLimitedInput
                  value={impresion}
                  onChangeText={setImpresion}
                  limit={LIMITS.impression}
                  multiline
                  rows={3}
                  placeholder="Impresión diagnóstica"
                />
              </Field>

              <Field label="Plan">
                <CharLimitedInput
                  value={plan}
                  onChangeText={setPlan}
                  limit={LIMITS.plan}
                  multiline
                  rows={3}
                  placeholder="Plan de tratamiento"
                />
              </Field>

              <Field label="Notas de Rx">
                <CharLimitedInput
                  value={rx_notes}
                  onChangeText={setRxNotes}
                  limit={LIMITS.rx_notes}
                  multiline
                  rows={3}
                  placeholder="Recetas/medicamentos"
                />
              </Field>
            </Card>
          )}

          {/* 11) FURTHER CONSULTATION */}
          {tipo_consulta && chief_complaint && (
            <Card title="Consulta Adicional">
              <Field label="Requiere Consulta con">
                <Picker selectedValue={further_consult} onValueChange={setFurtherConsult} style={styles.picker}>
                  <Picker.Item label="-- Ninguna --" value="" />
                  {FURTHER_CONSULTS.map((tipo) => (
                    <Picker.Item key={tipo} label={tipo} value={tipo} />
                  ))}
                </Picker>
              </Field>

              {further_consult === 'Other' && (
                <Field label="Especificar">
                  <CharLimitedInput value={further_consult_other_text} onChangeText={setFurtherConsultOtherText} limit={LIMITS.further_consult_other_text} placeholder="Cardiology" />
                </Field>
              )}

              <Field label="Proveedor/Médico">
                <CharLimitedInput value={provider} onChangeText={setProvider} limit={LIMITS.provider} placeholder="Dr. Juan Pérez" />
              </Field>

              <Field label="Intérprete">
                <CharLimitedInput value={interprete} onChangeText={setInterprete} limit={LIMITS.interpreter} placeholder="María López" />
              </Field>
            </Card>
          )}

          {/* 12) SURGICAL SECTION */}
          {tipo_consulta && chief_complaint && (
            <Card title="Consulta Quirúrgica">
              <Toggle label="Incluir Sección Quirúrgica?" value={mostrarQuirurgica} onChange={setMostrarQuirurgica} />

              {mostrarQuirurgica && (
                <>
                  <Field label="Fecha Quirúrgica">
                    <MaskedDateInput
                      value={dateTypingSurg}
                      onChangeText={(txt) => {
                        setDateTypingSurg(txt);
                        const iso = dmyToISO(txt);
                        if (iso) setSurgicalDate(iso);
                      }}
                      onCalendarPress={Platform.OS !== 'web' ? () => setShowDatePicker('surgical') : null}
                      placeholder="DD/MM/AAAA"
                    />
                  </Field>

                  <Field label="Historia Quirúrgica">
                    <CharLimitedInput
                      value={surgical_history}
                      onChangeText={setSurgicalHistory}
                      limit={LIMITS.surgical_history}
                      multiline
                      rows={3}
                      placeholder="Antecedentes quirúrgicos"
                    />
                  </Field>

                  <Field label="Examen Quirúrgico">
                    <CharLimitedInput
                      value={surgical_exam}
                      onChangeText={setSurgicalExam}
                      limit={LIMITS.surgical_exam}
                      multiline
                      rows={2}
                      placeholder="Hallazgos del examen"
                    />
                  </Field>

                  <Field label="Impresión Quirúrgica">
                    <CharLimitedInput
                      value={surgical_impression}
                      onChangeText={setSurgicalImpression}
                      limit={LIMITS.surgical_impression}
                      multiline
                      rows={2}
                      placeholder="Impresión del cirujano"
                    />
                  </Field>

                  <Field label="Plan Quirúrgico">
                    <CharLimitedInput
                      value={surgical_plan}
                      onChangeText={setSurgicalPlan}
                      limit={LIMITS.surgical_plan}
                      multiline
                      rows={2}
                      placeholder="Plan de cirugía"
                    />
                  </Field>

                  <Field label="Medicamentos Quirúrgicos">
                    <CharLimitedInput
                      value={surgical_meds}
                      onChangeText={setSurgicalMeds}
                      limit={LIMITS.surgical_meds}
                      multiline
                      rows={2}
                      placeholder="Medicamentos relacionados"
                    />
                  </Field>

                  <Field label="Consulta con">
                    <Picker selectedValue={surgical_consult} onValueChange={setSurgicalConsult} style={styles.picker}>
                      <Picker.Item label="-- Ninguna --" value="" />
                      {FURTHER_CONSULTS.map((tipo) => (
                        <Picker.Item key={tipo} label={tipo} value={tipo} />
                      ))}
                    </Picker>
                  </Field>

                  {surgical_consult === 'Other' && (
                    <Field label="Especificar">
                      <CharLimitedInput value={surgical_consult_other_text} onChangeText={setSurgicalConsultOtherText} limit={LIMITS.surgical_consult_other_text} placeholder="Internal Medicine" />
                    </Field>
                  )}

                  <Field label="Cirujano">
                    <CharLimitedInput value={surgical_surgeon} onChangeText={setSurgicalSurgeon} limit={LIMITS.surgical_surgeon} placeholder="Dr. Ana Morales" />
                  </Field>

                  <Field label="Intérprete Quirúrgico">
                    <CharLimitedInput value={surgical_interpreter} onChangeText={setSurgicalInterpreter} limit={LIMITS.surgical_interpreter} placeholder="Carlos Ruiz" />
                  </Field>

                  <Field label="Notas Quirúrgicas">
                    <CharLimitedInput
                      value={surgical_notes}
                      onChangeText={setSurgicalNotes}
                      limit={LIMITS.surgical_notes}
                      multiline
                      rows={10}
                      placeholder="Notas adicionales extensas"
                    />
                  </Field>

                  <Toggle label="Recetas Adjuntas?" value={rx_slips_attached} onChange={setRxSlipsAttached} />
                </>
              )}
            </Card>
          )}

          {/* Hint */}
          <Text style={styles.hint}>{t('hint')}</Text>

          {/* Botones */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.goBack()}>
              <Text style={styles.btnCancelText}>{t('footer.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnSave, !validar() && styles.btnDisabled]} onPress={guardar}>
              <Text style={styles.btnSaveText}>{t('footer.save')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* DateTimePicker - SOLO MÓVIL */}
        {showDatePicker && DateTimePicker && (
          <DateTimePicker
            value={
              showDatePicker === 'reg' ? parseISODate(fecha_registro) :
              showDatePicker === 'nac' ? parseISODate(fecha_nacimiento) :
              showDatePicker === 'ultMen' ? parseISODate(ultima_menstruacion) :
              showDatePicker === 'surgical' ? parseISODate(surgical_date) :
              new Date()
            }
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* Toast */}
        {toastMsg ? (
          <Animated.View style={[styles.toast, { opacity: toastAnim }]}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.toastText}>{toastMsg}</Text>
          </Animated.View>
        ) : null}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// ===== COMPONENTES =====

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function FieldRow({ children }) {
  return <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>{children}</View>;
}

function Toggle({ label, value, onChange }) {
  return (
    <TouchableOpacity onPress={() => onChange(!value)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 }}>
      <View style={[styles.toggle, value && styles.toggleActive]}>
        {value && <Ionicons name="checkmark" size={16} color="#FFF" />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

function Radio({ label, checked, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={[styles.radio, checked && styles.radioActive]} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

function MaskedDateInput({ value, onChangeText, onCalendarPress, onBlur, error, placeholder }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <TextInput
        style={[styles.input, { flex: 1 }, error && { borderColor: '#EF5350' }]}
        value={value}
        onChangeText={(txt) => {
          let clean = txt.replace(/[^\d]/g, '');
          if (clean.length >= 2) clean = clean.slice(0,2) + '/' + clean.slice(2);
          if (clean.length >= 5) clean = clean.slice(0,5) + '/' + clean.slice(5, 9);
          onChangeText(clean);
        }}
        onBlur={onBlur}
        placeholder={placeholder || 'DD/MM/AAAA'}
        placeholderTextColor={C.subtext}
        maxLength={10}
        keyboardType="numeric"
      />
      {onCalendarPress && (
        <TouchableOpacity onPress={onCalendarPress} style={{ padding: 8 }}>
          <Ionicons name="calendar-outline" size={24} color={C.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const R = 20;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingTop: 50, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { padding: 4 },
  title: { fontSize: 26, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  card: { backgroundColor: C.card, marginHorizontal: 16, marginTop: 16, borderRadius: R, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: C.border },
  cardTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 6 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: C.text },
  picker: { backgroundColor: '#FFF', borderWidth: 1, borderColor: C.border, borderRadius: 8 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, backgroundColor: '#FFF' },
  radioActive: { backgroundColor: C.primary, borderColor: C.primary },
  toggle: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: C.border, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  toggleActive: { backgroundColor: C.primary, borderColor: C.primary },
  charCount: { fontSize: 11, marginTop: 4, textAlign: 'right', fontWeight: '600' },
  hint: { fontSize: 12, color: C.subtext, marginHorizontal: 16, marginTop: 16, fontStyle: 'italic' },
  footer: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 24 },
  btnCancel: { flex: 1, backgroundColor: '#E0E0E0', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnCancelText: { fontSize: 16, fontWeight: '600', color: '#555' },
  btnSave: { flex: 1, backgroundColor: C.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnSaveText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  btnDisabled: { opacity: 0.4 },
  toast: { position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  toastText: { color: '#FFF', fontSize: 15, fontWeight: '600' }
});
