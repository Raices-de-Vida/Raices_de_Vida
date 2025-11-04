import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Animated
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { createPaciente, autoEvaluarAlertas } from '../services/pacientes';
import { useTranslation } from 'react-i18next';

const C = { bg:'#FFF7DA', card:'#FFFFFF', border:'#E9E2C6', text:'#1B1B1B', subtext:'#687076', primary:'#F08C21', accent:'#6698CC' };

// Los valores que envías al backend se mantienen en ES; las etiquetas se traducen con i18n.
const ESTADOS = ['Activo', 'Inactivo', 'Derivado', 'Fallecido'];
const METODOS = ['Ninguno', 'Pastillas', 'Inyección', 'DIU', 'Condón', 'Natural', 'Otro'];
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
  const [showDatePicker, setShowDatePicker] = useState(null); // 'reg' | 'nac' | 'signos' | 'ultMen' | 'ultAct' | 'surgical'

  // General
  const [fecha_registro, setFechaRegistro] = useState('');
  const [idioma, setIdioma] = useState('Español'); // valor guardado en ES
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comunidad_pueblo, setComunidad] = useState('');
  const [genero, setGenero] = useState('F'); // 'M' | 'F'
  const [modoEdad, setModoEdad] = useState(false);
  const [fecha_nacimiento, setFechaNac] = useState('');
  const [edad, setEdad] = useState('');

  const [touchedEdad, setTouchedEdad] = useState(false);
  const [touchedNac, setTouchedNac] = useState(false);

  // Signos
  const [presion_sis, setPresionSis] = useState('');
  const [presion_dia, setPresionDia] = useState('');
  const [frecuencia_cardiaca, setFC] = useState('');
  const [saturacion, setSatO2] = useState('');
  const [glucosa, setGlucosa] = useState('');
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [temperatura, setTemp] = useState('');
  const [fecha_signos_vitales, setFechaSignos] = useState('');

  // Alergias
  const [tieneAlergias, setTieneAlergias] = useState(false);
  const [alergias, setAlergias] = useState('');

  // Hábitos
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

  // Salud reproductiva
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

  // Estados Consulta Médica
  const [tipo_consulta, setTipoConsulta] = useState('');
  const [consult_other_text, setConsultOtherText] = useState('');
  const [chief_complaint, setChiefComplaint] = useState('');

  // Flags médicos
  const [paciente_en_ayuno, setPacienteAyuno] = useState(false);
  const [medicamento_bp_tomado, setMedicamentoBP] = useState(false);
  const [medicamento_bs_tomado, setMedicamentoBS] = useState(false);

  // Medicamentos preventivos
  const [vitamins, setVitamins] = useState('');
  const [albendazole, setAlbendazole] = useState('');

  // Historia clínica
  const [historia_enfermedad_actual, setHistoriaEnfermedad] = useState('');
  const [diagnosticos_previos, setDiagnosticosPrevios] = useState('');
  const [cirugias_previas, setCirugiasPrevias] = useState('');
  const [medicamentos_actuales, setMedicamentosActuales] = useState('');

  // Examen físico
  const [examen_corazon, setExamenCorazon] = useState('');
  const [examen_pulmones, setExamenPulmones] = useState('');
  const [examen_abdomen, setExamenAbdomen] = useState('');
  const [examen_ginecologico, setExamenGinecologico] = useState('');

  // Evaluación y plan
  const [impresion, setImpresion] = useState('');
  const [plan, setPlan] = useState('');
  const [rx_notes, setRxNotes] = useState('');
  const [further_consult, setFurtherConsult] = useState('');
  const [further_consult_other_text, setFurtherConsultOtherText] = useState('');
  const [provider, setProvider] = useState('');
  const [interprete, setInterprete] = useState('');

  // Consulta quirúrgica
  const [mostrarQuirurgica, setMostrarQuirurgica] = useState(false);
  const [surgical_date, setSurgicalDate] = useState('');
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

  // Errores
  const [errors, setErrors] = useState({});
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
    
    // Si existe consulta médica, validar campos requeridos
    if (tipo_consulta && chief_complaint) {
      if (!historia_enfermedad_actual || !examen_corazon || !impresion) return false;
    }
    
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
    ...(id_comunidad ? { id_comunidad: toIntOrNull(id_comunidad) } : {}),
    ...(id_familia ? { id_familia: toIntOrNull(id_familia) } : {}),
    ...(usuario_registro ? { usuario_registro: toIntOrNull(usuario_registro) } : {}),

    // Campos de consulta médica (opcionales)
    ...(tipo_consulta && chief_complaint ? {
      tipo_consulta,
      ...(tipo_consulta === 'Other' && consult_other_text ? { consult_other_text } : {}),
      chief_complaint,
      paciente_en_ayuno: !!paciente_en_ayuno,
      medicamento_bp_tomado: !!medicamento_bp_tomado,
      medicamento_bs_tomado: !!medicamento_bs_tomado,
      vitamins: vitamins ? toIntOrNull(vitamins) : null,
      albendazole: albendazole ? toIntOrNull(albendazole) : null,
      historia_enfermedad_actual: historia_enfermedad_actual || null,
      diagnosticos_previos: diagnosticos_previos || null,
      cirugias_previas: cirugias_previas || null,
      medicamentos_actuales: medicamentos_actuales || null,
      examen_corazon: examen_corazon || null,
      examen_pulmones: examen_pulmones || null,
      examen_abdomen: examen_abdomen || null,
      examen_ginecologico: genero === 'F' ? (examen_ginecologico || null) : null,
      impresion: impresion || null,
      plan: plan || null,
      rx_notes: rx_notes || null,
      further_consult: further_consult || null,
      ...(further_consult === 'Other' && further_consult_other_text ? { further_consult_other_text } : {}),
      provider: provider || null,
      interprete: interprete || null,
    } : {}),

    // Campos quirúrgicos (opcionales)
    ...(mostrarQuirurgica ? {
      surgical_date: surgical_date || null,
      surgical_history: surgical_history || null,
      surgical_exam: surgical_exam || null,
      surgical_impression: surgical_impression || null,
      surgical_plan: surgical_plan || null,
      surgical_meds: surgical_meds || null,
      surgical_consult: surgical_consult || null,
      ...(surgical_consult === 'Other' && surgical_consult_other_text ? { surgical_consult_other_text } : {}),
      surgical_surgeon: surgical_surgeon || null,
      surgical_interpreter: surgical_interpreter || null,
      surgical_notes: surgical_notes || null,
      rx_slips_attached: !!rx_slips_attached,
    } : {}),
  });

const handleSubmit = async () => {
  setTouchedEdad(true);
  setTouchedNac(true);
  if (!validar()) {
    Alert.alert(t('errors.formTitle'), t('errors.formMsg'));
    return;
  }
  
  try {
    const token = await AsyncStorage.getItem('token');
    const payload = buildPayload();
    
    // 1. Crear paciente
    const resp = await createPaciente(payload);
    const id = resp?.id_paciente ?? resp?.paciente?.id_paciente;
    if (!id) throw new Error('No id_paciente en la respuesta');
    
    // 2. Auto-evaluar alertas médicas
    try {
      console.log('🔍 Auto-evaluando alertas para paciente:', id); // Debug
      await autoEvaluarAlertas(id);
    } catch (evalError) {
      console.warn('⚠️ Error en auto-evaluación:', evalError);
      // No bloqueamos el flujo si falla la auto-evaluación
    }
    
    // 3. Mostrar éxito y regresar
    showSuccess(t('toast.saved'));
    setTimeout(() => navigation.goBack(), 900);
    
  } catch (e) {
    console.error('❌ Error al crear paciente:', e);
    Alert.alert(t('errors.errorTitle'), t('errors.createFail') + '\n\n' + e.message);
  }
};

  const onSis = (t_) => {
    const v = onlyDigits(t_);
    setPresionSis(v);
    if (v === '') return setRangeError('presion_sis', undefined);
    const n = parseInt(v, 10);
    if (n < 60 || n > 250) setRangeError('presion_sis', t('ranges.sis'));
    else setRangeError('presion_sis', undefined);
  };
  const onDia = (t_) => {
    const v = onlyDigits(t_);
    setPresionDia(v);
    if (v === '') return setRangeError('presion_dia', undefined);
    const n = parseInt(v, 10);
    if (n < 30 || n > 150) setRangeError('presion_dia', t('ranges.dia'));
    else setRangeError('presion_dia', undefined);
  };
  const onFC = (t_) => {
    const v = onlyDigits(t_);
    setFC(v);
    if (v === '') return setRangeError('fc', undefined);
    const n = parseInt(v, 10);
    if (n < 30 || n > 220) setRangeError('fc', t('ranges.hr'));
    else setRangeError('fc', undefined);
  };
  const onSpO2 = (t_) => {
    const v = onlyDigits(t_).slice(0,3);
    setSatO2(v);
    if (v === '') return setRangeError('spo2', undefined);
    const n = parseInt(v, 10);
    if (n < 50 || n > 100) setRangeError('spo2', t('ranges.spo2'));
    else setRangeError('spo2', undefined);
  };
  const onGluc = (t_) => {
    const v = onlyDigits(t_);
    setGlucosa(v);
    if (v === '') return setRangeError('glu', undefined);
    const n = parseInt(v, 10);
    if (n < 20 || n > 600) setRangeError('glu', t('ranges.glu'));
    else setRangeError('glu', undefined);
  };
  const onTemp = (t_) => {
    const v = t_.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = v.split('.');
    const norm = parts[0].slice(0,2) + (parts[1] ? '.' + parts[1].slice(0,1) : '');
    setTemp(norm);
    if (norm === '') return setRangeError('temp', undefined);
    const n = parseFloat(norm);
    if (!(n >= 30 && n <= 43)) setRangeError('temp', t('ranges.temp'));
    else setRangeError('temp', undefined);
  };
  const onPeso = (t_) => {
    const v = t_.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = v.split('.');
    const norm = parts[0].slice(0,3) + (parts[1] ? '.' + parts[1].slice(0,1) : '');
    setPeso(norm);
    if (norm === '') return setRangeError('peso', undefined);
    const n = parseFloat(norm);
    if (!(n >= 1 && n <= 300)) setRangeError('peso', t('ranges.weight'));
    else setRangeError('peso', undefined);
  };
  const onEst = (t_) => {
    const v = t_.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = v.split('.');
    const norm = parts[0].slice(0,3) + (parts[1] ? '.' + parts[1].slice(0,1) : '');
    setEstatura(norm);
    if (norm === '') return setRangeError('est', undefined);
    const n = parseFloat(norm);
    if (!(n >= 30 && n <= 250)) setRangeError('est', t('ranges.height'));
    else setRangeError('est', undefined);
  };

  const [dateTypingReg, setDateTypingReg] = useState('');
  const [dateTypingNac, setDateTypingNac] = useState('');
  const [dateTypingSV, setDateTypingSV] = useState('');
  const [dateTypingUlt, setDateTypingUlt] = useState('');
  const [dateTypingUA, setDateTypingUA] = useState('');
  const [dateTypingSurg, setDateTypingSurg] = useState('');

  useEffect(() => setDateTypingReg(isoToDMY(fecha_registro)), [fecha_registro]);
  useEffect(() => setDateTypingNac(isoToDMY(fecha_nacimiento)), [fecha_nacimiento]);
  useEffect(() => setDateTypingSV(isoToDMY(fecha_signos_vitales)), [fecha_signos_vitales]);
  useEffect(() => setDateTypingUlt(isoToDMY(ultima_menstruacion)), [ultima_menstruacion]);
  useEffect(() => setDateTypingUA(isoToDMY(fecha_ultima_actualizacion)), [fecha_ultima_actualizacion]);
  useEffect(() => setDateTypingSurg(isoToDMY(surgical_date)), [surgical_date]);

  const maskDMY = (raw) => {
    const d = onlyDigits(raw).slice(0,8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0,2)}/${d.slice(2)}`;
    return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;
  };

  // helpers de etiqueta traducida
  const labelEstado = (e) => t(`options.states.${e}`);
  const labelMetodo = (m) => t(`options.methods.${m}`);

  return (
    <View style={{ flex:1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.topTitle}>{t('top.title')}</Text>
            <Text style={styles.topSubtitle}>{t('top.subtitle')}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex:1}}>
        <ScrollView contentContainerStyle={{ padding:16, paddingBottom:140 }} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fade, transform:[{translateY: slide}] }}>

            {/* Identificación */}
            <Card title={t('cards.id')}>
              <Field label={t('fields.dateReg')}>
                <MaskedDateInput
                  value={dateTypingReg}
                  placeholder={t('placeholders.ddmmyyyy')}
                  onChangeText={(t_)=>{
                    const m = maskDMY(t_);
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

              <Field label={t('fields.language')}>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={idioma} onValueChange={setIdioma}>
                    {/* sin Kaqchikel */}
                    <Picker.Item label={t('options.languages.es')} value="Español" />
                    <Picker.Item label={t('options.languages.kich')} value="K'iche'" />
                    <Picker.Item label={t('options.languages.qeq')} value="Q'eqchi'" />
                    <Picker.Item label={t('options.languages.other')} value="Otro" />
                  </Picker>
                </View>
              </Field>

              <Field label={t('fields.firstName')}>
                <TextInput
                  value={nombre} onChangeText={setNombre}
                  style={[styles.input, !nombre.trim() && styles.err]}
                  placeholder={t('placeholders.firstName')} placeholderTextColor="#A2A7AE"
                />
                {!nombre.trim() && <Text style={styles.errText}>{t('errors.requiredField')}</Text>}
              </Field>

              <Field label={t('fields.lastName')}>
                <TextInput
                  value={apellido} onChangeText={setApellido}
                  style={styles.input}
                  placeholder={t('placeholders.lastName')} placeholderTextColor="#A2A7AE"
                />
              </Field>

              <Field label={t('fields.gender')}>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={genero} onValueChange={setGenero}>
                    <Picker.Item label={t('options.genders.F')} value="F" />
                    <Picker.Item label={t('options.genders.M')} value="M" />
                  </Picker>
                </View>
              </Field>

              <Text style={styles.label}>{t('fields.useDate')} / {t('fields.useAge')}</Text>
              <View style={styles.radioRow}>
                <Radio label={t('fields.useDate')} checked={!modoEdad} onPress={()=>{ setModoEdad(false); setTouchedEdad(false); }} />
                <Radio label={t('fields.useAge')} checked={modoEdad} onPress={()=>{ setModoEdad(true); setTouchedNac(false); }} />
              </View>

              {modoEdad ? (
                <Field label={t('fields.ageYears')}>
                  <TextInput
                    value={edad}
                    onChangeText={(t_) => setEdad(onlyDigits(t_).slice(0,2))}
                    onBlur={()=>setTouchedEdad(true)}
                    keyboardType="numeric" maxLength={2}
                    style={[styles.input, touchedEdad && !(edad !== '' && edad.length <= 2) && styles.err]}
                    placeholder={t('placeholders.ageSample')} placeholderTextColor="#A2A7AE"
                  />
                  {touchedEdad && !(edad !== '' && edad.length <= 2) && (
                    <Text style={styles.errText}>1–2</Text>
                  )}
                </Field>
              ) : (
                <Field label={t('fields.birthdate')}>
                  <MaskedDateInput
                    value={dateTypingNac}
                    placeholder={t('placeholders.ddmmyyyy')}
                    onChangeText={(t_)=>{
                      const m = maskDMY(t_);
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
                    <Text style={styles.errText}>{t('errors.invalidDate')}</Text>
                  )}
                </Field>
              )}

              <Field label={t('fields.phone')}>
                <TextInput
                  value={telefono}
                  onChangeText={(t_)=> setTelefono(onlyDigits(t_).slice(0,8))}
                  keyboardType="phone-pad" maxLength={8}
                  style={[styles.input, (!telefonoValido && telefono!=='') && styles.err]}
                  placeholder={t('placeholders.phone')} placeholderTextColor="#A2A7AE"
                />
                {(!telefonoValido && telefono!=='') && <Text style={styles.errText}>{t('errors.phone8')}</Text>}
              </Field>

              <Field label={t('fields.community')}>
                <TextInput
                  value={comunidad_pueblo} onChangeText={setComunidad}
                  style={[styles.input, !comunidad_pueblo.trim() && styles.err]}
                  placeholder={t('placeholders.community')} placeholderTextColor="#A2A7AE"
                />
                {!comunidad_pueblo.trim() && <Text style={styles.errText}>{t('errors.requiredField')}</Text>}
              </Field>
            </Card>

            {/* Signos */}
            <Card title={t('cards.vitals')}>
              <FieldRow>
                <Field label={t('fields.sysBP')}>
                  <TextInput value={presion_sis} onChangeText={onSis} keyboardType="numeric" style={[styles.input, errors.presion_sis && styles.err]} maxLength={3}/>
                  {errors.presion_sis && <Text style={styles.errText}>{errors.presion_sis}</Text>}
                </Field>
                <Field label={t('fields.diaBP')}>
                  <TextInput value={presion_dia} onChangeText={onDia} keyboardType="numeric" style={[styles.input, errors.presion_dia && styles.err]} maxLength={3}/>
                  {errors.presion_dia && <Text style={styles.errText}>{errors.presion_dia}</Text>}
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label={t('fields.heartRate')}>
                  <TextInput value={frecuencia_cardiaca} onChangeText={onFC} keyboardType="numeric" style={[styles.input, errors.fc && styles.err]} maxLength={3}/>
                  {errors.fc && <Text style={styles.errText}>{errors.fc}</Text>}
                </Field>
                <Field label={t('fields.spo2')}>
                  <TextInput value={saturacion} onChangeText={onSpO2} keyboardType="numeric" style={[styles.input, errors.spo2 && styles.err]} maxLength={3}/>
                  {errors.spo2 && <Text style={styles.errText}>{errors.spo2}</Text>}
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label={t('fields.glucose')}>
                  <TextInput value={glucosa} onChangeText={onGluc} keyboardType="numeric" style={[styles.input, errors.glu && styles.err]} maxLength={3}/>
                  {errors.glu && <Text style={styles.errText}>{errors.glu}</Text>}
                </Field>
                <Field label={t('fields.temperature')}>
                  <TextInput value={temperatura} onChangeText={onTemp} keyboardType="decimal-pad" style={[styles.input, errors.temp && styles.err]} maxLength={4}/>
                  {errors.temp && <Text style={styles.errText}>{errors.temp}</Text>}
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label={t('fields.weight')}>
                  <TextInput value={peso} onChangeText={onPeso} keyboardType="decimal-pad" style={[styles.input, errors.peso && styles.err]} maxLength={5}/>
                  {errors.peso && <Text style={styles.errText}>{errors.peso}</Text>}
                </Field>
                <Field label={t('fields.height')}>
                  <TextInput value={estatura} onChangeText={onEst} keyboardType="decimal-pad" style={[styles.input, errors.est && styles.err]} maxLength={6}/>
                  {errors.est && <Text style={styles.errText}>{errors.est}</Text>}
                </Field>
              </FieldRow>

              <Field label={t('fields.vitalsDate')}>
                <MaskedDateInput
                  value={dateTypingSV}
                  placeholder={t('placeholders.ddmmyyyy')}
                  onChangeText={(t_)=>{
                    const m = maskDMY(t_);
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
            <Card title={t('cards.allergies')}>
              <Toggle label={t('fields.hasAllergies')} value={tieneAlergias} onChange={setTieneAlergias} />
              {tieneAlergias && (
                <Field label={t('fields.whatAllergies')}>
                  <TextInput value={alergias} onChangeText={setAlergias}
                    style={[styles.input, styles.textArea]} placeholder={t('placeholders.allergies')} placeholderTextColor="#A2A7AE" multiline />
                </Field>
              )}
            </Card>

            {/* Hábitos */}
            <Card title={t('cards.habitsCurrent')}>
              <Toggle label={t('fields.tobacco')} value={tabaco_actual} onChange={setTabacoA} />
              {tabaco_actual && (
                <Field label={t('fields.qtyFreq')}>
                  <TextInput value={tabaco_actual_cantidad} onChangeText={setTabacoACant}
                    style={styles.input} placeholder={t('placeholders.qtyCigs')} placeholderTextColor="#A2A7AE" />
                </Field>
              )}
              <Toggle label={t('fields.alcohol')} value={alcohol_actual} onChange={setAlcoholA} />
              {alcohol_actual && (
                <Field label={t('fields.qtyFreq')}>
                  <TextInput value={alcohol_actual_cantidad} onChangeText={setAlcoholACant}
                    style={styles.input} placeholder={t('placeholders.qtyAlcohol')} placeholderTextColor="#A2A7AE" />
                </Field>
              )}
              <Toggle label={t('fields.drugs')} value={drogas_actual} onChange={setDrogasA} />
              {drogas_actual && (
                <Field label={t('fields.drugsDetail')}>
                  <TextInput value={drogas_actual_cantidad} onChangeText={setDrogasACant}
                    style={styles.input} placeholder={t('placeholders.drugsDetail')} placeholderTextColor="#A2A7AE" />
                </Field>
              )}
            </Card>

            <Card title={t('cards.habitsPast')}>
              <Toggle label={`${t('fields.tobacco')} ${t('fields.pastSuffix')}`} value={tabaco_pasado} onChange={setTabacoP} />
              {tabaco_pasado && (
                <Field label={t('fields.qtyFreqPast')}>
                  <TextInput value={tabaco_pasado_cantidad} onChangeText={setTabacoPCant}
                    style={styles.input} placeholder={t('placeholders.drugsDetail')} placeholderTextColor="#A2A7AE" />
                </Field>
              )}
              <Toggle label={`${t('fields.alcohol')} ${t('fields.pastSuffix')}`} value={alcohol_pasado} onChange={setAlcoholP} />
              {alcohol_pasado && (
                <Field label={t('fields.qtyFreqPast')}>
                  <TextInput value={alcohol_pasado_cantidad} onChangeText={setAlcoholPCant}
                    style={styles.input} placeholder={t('placeholders.drugsDetail')} placeholderTextColor="#A2A7AE" />
                </Field>
              )}
              <Toggle label={`${t('fields.drugs')} ${t('fields.pastSuffix')}`} value={drogas_pasado} onChange={setDrogasP} />
              {drogas_pasado && (
                <Field label={t('fields.drugsDetail')}>
                  <TextInput value={drogas_pasado_cantidad} onChangeText={setDrogasPCant}
                    style={styles.input} placeholder={t('placeholders.drugsDetail')} placeholderTextColor="#A2A7AE" />
                </Field>
              )}
            </Card>

            {/* Salud reproductiva (solo F) */}
            {genero === 'F' && (
              <Card title={t('cards.reproductive')}>
                <Field label={t('fields.lastMenstruation')}>
                  <MaskedDateInput
                    value={dateTypingUlt}
                    placeholder={t('placeholders.ddmmyyyy')}
                    onChangeText={(t_)=>{
                      const m = maskDMY(t_);
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

                <Toggle label={t('fields.menopause')} value={menopausia} onChange={setMenopausia} />

                <FieldRow>
                  <Field label={t('fields.pregnancies')}>
                    <TextInput value={gestaciones} onChangeText={(t_)=>setGest(onlyDigits(t_))} keyboardType="numeric" style={styles.input} maxLength={3}/>
                  </Field>
                  <Field label={t('fields.births')}>
                    <TextInput value={partos} onChangeText={(t_)=>setPartos(onlyDigits(t_))} keyboardType="numeric" style={styles.input} maxLength={3}/>
                  </Field>
                </FieldRow>

                <FieldRow>
                  <Field label={t('fields.spontaneousAbortions')}>
                    <TextInput value={abortos_espontaneos} onChangeText={(t_)=>setAEsp(onlyDigits(t_))} keyboardType="numeric" style={styles.input} maxLength={3}/>
                  </Field>
                  <Field label={t('fields.inducedAbortions')}>
                    <TextInput value={abortos_inducidos} onChangeText={(t_)=>setAInd(onlyDigits(t_))} keyboardType="numeric" style={styles.input} maxLength={3}/>
                  </Field>
                </FieldRow>

                <Toggle label={t('fields.useContraceptives')} value={usa_anticonceptivos} onChange={setUsaAnti} />
                {usa_anticonceptivos && (
                  <Field label={t('fields.method')}>
                    <View style={styles.pickerWrap}>
                      <Picker selectedValue={metodo_anticonceptivo} onValueChange={setMetodo}>
                        {METODOS.map(m => <Picker.Item key={m} label={labelMetodo(m)} value={m} />)}
                      </Picker>
                    </View>
                  </Field>
                )}
              </Card>
            )}

            {/* Consulta Médica */}
            <Card title={t('cards.consultation')}>
              <Field label={t('fields.consultType')}>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={tipo_consulta} onValueChange={setTipoConsulta}>
                    <Picker.Item label="--" value="" />
                    {TIPOS_CONSULTA.map(tc => (
                      <Picker.Item key={tc} label={t(`options.consultTypes.${tc}`)} value={tc} />
                    ))}
                  </Picker>
                </View>
              </Field>

              {tipo_consulta === 'Other' && (
                <Field label={t('fields.consultOtherText')}>
                  <TextInput
                    value={consult_other_text}
                    onChangeText={(txt) => setConsultOtherText(txt.slice(0, 25))}
                    style={styles.input}
                    maxLength={25}
                    placeholder={t('placeholders.consultOtherText')}
                    placeholderTextColor="#A2A7AE"
                  />
                </Field>
              )}

              <Field label={t('fields.chiefComplaint')}>
                <TextInput
                  value={chief_complaint}
                  onChangeText={setChiefComplaint}
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder={t('placeholders.chiefComplaint')}
                  placeholderTextColor="#A2A7AE"
                />
              </Field>

              <Toggle label={t('fields.fasting')} value={paciente_en_ayuno} onChange={setPacienteAyuno} />
              <Toggle label={t('fields.takenMedBP')} value={medicamento_bp_tomado} onChange={setMedicamentoBP} />
              <Toggle label={t('fields.takenMedBS')} value={medicamento_bs_tomado} onChange={setMedicamentoBS} />
            </Card>

            {/* Medicamentos Preventivos */}
            <Card title={t('cards.preventiveMeds')}>
              <FieldRow>
                <Field label={t('fields.vitamins')}>
                  <TextInput
                    value={vitamins}
                    onChangeText={(txt) => setVitamins(onlyDigits(txt))}
                    keyboardType="numeric"
                    style={styles.input}
                    maxLength={3}
                    placeholder={t('placeholders.vitamins')}
                    placeholderTextColor="#A2A7AE"
                  />
                </Field>
                <Field label={t('fields.albendazole')}>
                  <TextInput
                    value={albendazole}
                    onChangeText={(txt) => setAlbendazole(onlyDigits(txt))}
                    keyboardType="numeric"
                    style={styles.input}
                    maxLength={3}
                    placeholder={t('placeholders.albendazole')}
                    placeholderTextColor="#A2A7AE"
                  />
                </Field>
              </FieldRow>
            </Card>

            {/* Historia Clínica */}
            <Card title={t('cards.clinicalHistory')}>
              <Field label={t('fields.currentIllnessHistory')}>
                <TextInput
                  value={historia_enfermedad_actual}
                  onChangeText={setHistoriaEnfermedad}
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder={t('placeholders.currentIllnessHistory')}
                  placeholderTextColor="#A2A7AE"
                />
              </Field>

              <Field label={t('fields.previousDiagnoses')}>
                <TextInput
                  value={diagnosticos_previos}
                  onChangeText={setDiagnosticosPrevios}
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder={t('placeholders.previousDiagnoses')}
                  placeholderTextColor="#A2A7AE"
                />
              </Field>

              <Field label={t('fields.previousSurgeries')}>
                <TextInput
                  value={cirugias_previas}
                  onChangeText={setCirugiasPrevias}
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder={t('placeholders.previousSurgeries')}
                  placeholderTextColor="#A2A7AE"
                />
              </Field>

              <Field label={t('fields.currentMedications')}>
                <TextInput
                  value={medicamentos_actuales}
                  onChangeText={setMedicamentosActuales}
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder={t('placeholders.currentMedications')}
                  placeholderTextColor="#A2A7AE"
                />
              </Field>
            </Card>

            {/* Examen Físico */}
            <Card title={t('cards.physicalExam')}>
              <Field label={t('fields.heartExam')}>
                <TextInput
                  value={examen_corazon}
                  onChangeText={(txt) => setExamenCorazon(txt.slice(0, 40))}
                  style={styles.input}
                  maxLength={40}
                  placeholder={t('placeholders.heartExam')}
                  placeholderTextColor="#A2A7AE"
                />
                <Text style={styles.charCount}>{examen_corazon.length}/40</Text>
              </Field>

              <Field label={t('fields.lungsExam')}>
                <TextInput
                  value={examen_pulmones}
                  onChangeText={(txt) => setExamenPulmones(txt.slice(0, 40))}
                  style={styles.input}
                  maxLength={40}
                  placeholder={t('placeholders.lungsExam')}
                  placeholderTextColor="#A2A7AE"
                />
                <Text style={styles.charCount}>{examen_pulmones.length}/40</Text>
              </Field>

              <Field label={t('fields.abdomenExam')}>
                <TextInput
                  value={examen_abdomen}
                  onChangeText={(txt) => setExamenAbdomen(txt.slice(0, 40))}
                  style={styles.input}
                  maxLength={40}
                  placeholder={t('placeholders.abdomenExam')}
                  placeholderTextColor="#A2A7AE"
                />
                <Text style={styles.charCount}>{examen_abdomen.length}/40</Text>
              </Field>

              {genero === 'F' && (
                <Field label={t('fields.gynExam')}>
                  <TextInput
                    value={examen_ginecologico}
                    onChangeText={(txt) => setExamenGinecologico(txt.slice(0, 40))}
                    style={styles.input}
                    maxLength={40}
                    placeholder={t('placeholders.gynExam')}
                    placeholderTextColor="#A2A7AE"
                  />
                  <Text style={styles.charCount}>{examen_ginecologico.length}/40</Text>
                </Field>
              )}
            </Card>

            {/* Evaluación y Plan */}
            <Card title={t('cards.assessmentPlan')}>
              <Field label={t('fields.impression')}>
                <TextInput
                  value={impresion}
                  onChangeText={setImpresion}
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder={t('placeholders.impression')}
                  placeholderTextColor="#A2A7AE"
                />
              </Field>

              <Field label={t('fields.plan')}>
                <TextInput
                  value={plan}
                  onChangeText={setPlan}
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder={t('placeholders.plan')}
                  placeholderTextColor="#A2A7AE"
                />
              </Field>

              <Field label={t('fields.rxNotes')}>
                <TextInput
                  value={rx_notes}
                  onChangeText={setRxNotes}
                  style={[styles.input, styles.textArea]}
                  multiline
                  placeholder={t('placeholders.rxNotes')}
                  placeholderTextColor="#A2A7AE"
                />
              </Field>

              <Field label={t('fields.furtherConsult')}>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={further_consult} onValueChange={setFurtherConsult}>
                    <Picker.Item label="--" value="" />
                    {FURTHER_CONSULTS.map(fc => (
                      <Picker.Item key={fc} label={t(`options.furtherConsults.${fc}`)} value={fc} />
                    ))}
                  </Picker>
                </View>
              </Field>

              {further_consult === 'Other' && (
                <Field label={t('fields.furtherConsultOtherText')}>
                  <TextInput
                    value={further_consult_other_text}
                    onChangeText={(txt) => setFurtherConsultOtherText(txt.slice(0, 35))}
                    style={styles.input}
                    maxLength={35}
                    placeholder={t('placeholders.furtherConsultOtherText')}
                    placeholderTextColor="#A2A7AE"
                  />
                </Field>
              )}

              <Field label={t('fields.provider')}>
                <TextInput
                  value={provider}
                  onChangeText={(txt) => setProvider(txt.slice(0, 35))}
                  style={styles.input}
                  maxLength={35}
                  placeholder={t('placeholders.provider')}
                  placeholderTextColor="#A2A7AE"
                />
              </Field>

              <Field label={t('fields.interpreter')}>
                <TextInput
                  value={interprete}
                  onChangeText={(txt) => setInterprete(txt.slice(0, 35))}
                  style={styles.input}
                  maxLength={35}
                  placeholder={t('placeholders.interpreter')}
                  placeholderTextColor="#A2A7AE"
                />
              </Field>
            </Card>

            {/* Consulta Quirúrgica (Colapsable) */}
            <Card title={t('cards.surgical')}>
              <Toggle 
                label="Mostrar campos quirúrgicos" 
                value={mostrarQuirurgica} 
                onChange={setMostrarQuirurgica} 
              />

              {mostrarQuirurgica && (
                <View>
                  <Field label={t('fields.surgicalDate')}>
                    <MaskedDateInput
                      value={dateTypingSurg}
                      placeholder={t('placeholders.ddmmyyyy')}
                      onChangeText={(t_)=>{
                        const m = maskDMY(t_);
                        setDateTypingSurg(m);
                        if (m.length === 10) {
                          const iso = dmyToISO(m);
                          if (iso) setSurgicalDate(iso);
                        }
                        if (m.length === 0) setSurgicalDate('');
                      }}
                      onCalendarPress={()=>setShowDatePicker('surgical')}
                    />
                  </Field>

                  <Field label={t('fields.surgicalHistory')}>
                    <TextInput
                      value={surgical_history}
                      onChangeText={setSurgicalHistory}
                      style={[styles.input, styles.textArea]}
                      multiline
                      placeholder={t('placeholders.surgicalHistory')}
                      placeholderTextColor="#A2A7AE"
                    />
                  </Field>

                  <Field label={t('fields.surgicalExam')}>
                    <TextInput
                      value={surgical_exam}
                      onChangeText={setSurgicalExam}
                      style={[styles.input, styles.textArea]}
                      multiline
                      placeholder={t('placeholders.surgicalExam')}
                      placeholderTextColor="#A2A7AE"
                    />
                  </Field>

                  <Field label={t('fields.surgicalImpression')}>
                    <TextInput
                      value={surgical_impression}
                      onChangeText={setSurgicalImpression}
                      style={[styles.input, styles.textArea]}
                      multiline
                      placeholder={t('placeholders.surgicalImpression')}
                      placeholderTextColor="#A2A7AE"
                    />
                  </Field>

                  <Field label={t('fields.surgicalPlan')}>
                    <TextInput
                      value={surgical_plan}
                      onChangeText={setSurgicalPlan}
                      style={[styles.input, styles.textArea]}
                      multiline
                      placeholder={t('placeholders.surgicalPlan')}
                      placeholderTextColor="#A2A7AE"
                    />
                  </Field>

                  <Field label={t('fields.surgicalMeds')}>
                    <TextInput
                      value={surgical_meds}
                      onChangeText={setSurgicalMeds}
                      style={[styles.input, styles.textArea]}
                      multiline
                      placeholder={t('placeholders.surgicalMeds')}
                      placeholderTextColor="#A2A7AE"
                    />
                  </Field>

                  <Field label={t('fields.surgicalConsult')}>
                    <View style={styles.pickerWrap}>
                      <Picker selectedValue={surgical_consult} onValueChange={setSurgicalConsult}>
                        <Picker.Item label="--" value="" />
                        {FURTHER_CONSULTS.map(fc => (
                          <Picker.Item key={fc} label={t(`options.furtherConsults.${fc}`)} value={fc} />
                        ))}
                      </Picker>
                    </View>
                  </Field>

                  {surgical_consult === 'Other' && (
                    <Field label={t('fields.surgicalConsultOtherText')}>
                      <TextInput
                        value={surgical_consult_other_text}
                        onChangeText={(txt) => setSurgicalConsultOtherText(txt.slice(0, 35))}
                        style={styles.input}
                        maxLength={35}
                        placeholder={t('placeholders.surgicalConsultOtherText')}
                        placeholderTextColor="#A2A7AE"
                      />
                    </Field>
                  )}

                  <Field label={t('fields.surgicalSurgeon')}>
                    <TextInput
                      value={surgical_surgeon}
                      onChangeText={(txt) => setSurgicalSurgeon(txt.slice(0, 35))}
                      style={styles.input}
                      maxLength={35}
                      placeholder={t('placeholders.surgicalSurgeon')}
                      placeholderTextColor="#A2A7AE"
                    />
                  </Field>

                  <Field label={t('fields.surgicalInterpreter')}>
                    <TextInput
                      value={surgical_interpreter}
                      onChangeText={(txt) => setSurgicalInterpreter(txt.slice(0, 35))}
                      style={styles.input}
                      maxLength={35}
                      placeholder={t('placeholders.surgicalInterpreter')}
                      placeholderTextColor="#A2A7AE"
                    />
                  </Field>

                  <Field label={t('fields.surgicalNotes')}>
                    <TextInput
                      value={surgical_notes}
                      onChangeText={setSurgicalNotes}
                      style={[styles.input, styles.textArea]}
                      multiline
                      placeholder={t('placeholders.surgicalNotes')}
                      placeholderTextColor="#A2A7AE"
                    />
                  </Field>

                  <Toggle label={t('fields.rxSlipsAttached')} value={rx_slips_attached} onChange={setRxSlipsAttached} />
                </View>
              )}
            </Card>

            {/* Estado / Relaciones */}
            <Card title={t('cards.stateRelations')}>
              <Field label={t('fields.patientState')}>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={estado_paciente} onValueChange={setEstado}>
                    {ESTADOS.map(e => <Picker.Item key={e} label={labelEstado(e)} value={e} />)}
                  </Picker>
                </View>
              </Field>

              <Field label={t('fields.lastUpdate')}>
                <MaskedDateInput
                  value={dateTypingUA}
                  placeholder={t('placeholders.ddmmyyyy')}
                  onChangeText={(t_)=>{
                    const m = maskDMY(t_);
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

              <Field label={t('fields.notes')}>
                <TextInput value={observaciones_generales} onChangeText={setObs}
                  style={[styles.input, styles.textArea]} placeholder={t('placeholders.notes')}
                  placeholderTextColor="#A2A7AE" multiline />
              </Field>

              <FieldRow>
                <Field label={t('fields.communityId')}>
                  <TextInput value={id_comunidad} onChangeText={(t_)=>setIdComunidad(onlyDigits(t_))}
                    keyboardType="numeric" style={styles.input} placeholder={t('placeholders.optional')} placeholderTextColor="#A2A7AE" />
                </Field>
                <Field label={t('fields.familyId')}>
                  <TextInput value={id_familia} onChangeText={(t_)=>setIdFamilia(onlyDigits(t_))}
                    keyboardType="numeric" style={styles.input} placeholder={t('placeholders.optional')} placeholderTextColor="#A2A7AE" />
                </Field>
              </FieldRow>

              <Field label={t('fields.userId')}>
                <TextInput value={usuario_registro} onChangeText={(t_)=>setUsuarioRegistro(onlyDigits(t_))}
                  keyboardType="numeric" style={styles.input} placeholder={t('placeholders.optional')} placeholderTextColor="#A2A7AE" />
              </Field>
            </Card>

            <Text style={styles.hint}>{t('hint')}</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* DateTimePicker */}
      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={
            showDatePicker==='reg'     ? parseISODate(fecha_registro) :
            showDatePicker==='nac'     ? parseISODate(fecha_nacimiento) :
            showDatePicker==='signos'  ? parseISODate(fecha_signos_vitales) :
            showDatePicker==='ultMen'  ? parseISODate(ultima_menstruacion) :
            showDatePicker==='surgical'? parseISODate(surgical_date) :
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
              if (showDatePicker === 'surgical') setSurgicalDate(iso);
            }
          }}
          onTouchCancel={() => setShowDatePicker(null)}
        />
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.secBtn} onPress={() => navigation.goBack()} activeOpacity={0.9}>
          <Ionicons name="close-outline" size={18} color={C.text} />
          <Text style={styles.secTxt}>{t('footer.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primBtn} onPress={handleSubmit} activeOpacity={0.9}>
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.primTxt}>{t('footer.save')}</Text>
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
      <View style={[styles.radioOuter, checked && { borderColor: C.accent }]}>{checked ? <View style={styles.radioInner}/> : null}</View>
      <Text style={styles.radioTxt}>{label}</Text>
    </TouchableOpacity>
  );
}
function MaskedDateInput({ value, onChangeText, onCalendarPress, onBlur, error, placeholder }) {
  return (
    <View>
      <View style={[styles.input, error && styles.err, {flexDirection:'row', alignItems:'center', justifyContent:'space-between'}]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder || 'DD/MM/AAAA'}
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
  topBar:{ height:72, marginHorizontal:16, marginTop:12, marginBottom:8, paddingHorizontal:12, borderWidth:1, borderRadius:16, flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#FFF', borderColor:C.border, shadowOpacity:0.08, shadowRadius:12, shadowOffset:{width:0,height:6}, elevation:2 },
  topLeft:{ flexDirection:'row', alignItems:'center', gap:8 },
  iconBtn:{ padding:6, marginRight:6, borderRadius:10 },
  topTitle:{ fontSize:20, fontWeight:'800', color:C.text },
  topSubtitle:{ fontSize:12, color:C.accent, marginTop:2, fontWeight:'600' },

  card:{ backgroundColor:C.card, borderColor:C.border, borderWidth:1, borderRadius:R, marginBottom:14, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:10, shadowOffset:{width:0,height:4}, elevation:1 },
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

  charCount:{ fontSize:11, color:C.subtext, marginTop:4, textAlign:'right' },

  hint:{ textAlign:'center', fontSize:12, color:C.subtext, marginTop:6, marginBottom:8 },

  footer:{ position:'absolute', left:0, right:0, bottom:0, paddingHorizontal:16, paddingTop:10, paddingBottom:14, backgroundColor:'#FFFFFFE6', borderTopWidth:1, borderTopColor:C.border, flexDirection:'row', gap:10, shadowColor:'#000', shadowOpacity:0.12, shadowRadius:10, shadowOffset:{width:0, height:-2}, elevation:10 },
  primBtn:{ flex:1, height:50, borderRadius:14, backgroundColor:C.primary, alignItems:'center', justifyContent:'center', flexDirection:'row', gap:8 },
  primTxt:{ color:'#fff', fontWeight:'800', fontSize:15 },
  secBtn:{ height:50, paddingHorizontal:16, borderRadius:14, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', flexDirection:'row', gap:6, borderWidth:1, borderColor:C.border },
  secTxt:{ color:C.text, fontWeight:'800', fontSize:14 },

  toast:{ position:'absolute', bottom:80, alignSelf:'center', backgroundColor:'#2E7D32', paddingHorizontal:14, paddingVertical:10, borderRadius:12, flexDirection:'row', alignItems:'center', gap:8, shadowOpacity:0.15, shadowRadius:8, shadowOffset:{width:0,height:2}, elevation:4 },
  toastTxt:{ color:'#fff', fontWeight:'800' }
});
