
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import OfflineStorage from '../services/OfflineStorage';
import ConnectivityService from '../services/ConnectivityService';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';
import { 
  CharCounterInput, 
  PhoneInput, 
  DateInput,
  RangeInput,
  VitalSignInput 
} from '../components/ValidatedInput';
import { validatePatientData, VITAL_RANGES } from '../utils/validation';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DetallePacienteScreen({ route, navigation }) {
  const { paciente: pacienteParam } = route.params || {};
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('DetallePaciente');

  const [paciente, setPaciente] = useState(pacienteParam);
  const [tab, setTab] = useState('resumen');
  const [open, setOpen] = useState({ 
    ident:true, clin:true, repro:false, hab:false, ale:false, obs:false, 
    consultType:false, allergies:false, currentHabits:false, pastHabits:false,
    consult:false, meds:false, habits:false, pasthabits:false,
    // Clinical tab sections
    reproHealth:false, clinHistory:false, physExam:false, assessment:false, furtherConsult:false,
    // Surgical section
    surgical:false
  });
  const [editMode, setEditMode] = useState(false); // Vista de solo lectura por defecto
  const [localPeso, setLocalPeso] = useState(paciente.peso?.toString()||'');
  const [localAltura, setLocalAltura] = useState(paciente.estatura?.toString()||'');
  // ✅ Cargar severidad manual si existe, sino usar la calculada
  const [localSeverity, setLocalSeverity] = useState(paciente.severidad_manual || paciente._flagWorst || '');
  const [calcIMC, setCalcIMC] = useState(null);

  // Estados para validación y severidad manual
  const [validationErrors, setValidationErrors] = useState([]);
  const [showSeverityModal, setShowSeverityModal] = useState(false);
  const [vitalsEdited, setVitalsEdited] = useState(false);

  // Helper: Parsear fecha YYYY-MM-DD a componentes separados
  const parseLMPDate = (dateString) => {
    if (!dateString) return { month: '', day: '', year: '' };
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return {
        month: parts[1], // MM
        day: parts[2],   // DD
        year: parts[0]   // YYYY
      };
    }
    return { month: '', day: '', year: '' };
  };

  const lmpParsed = parseLMPDate(paciente.ultima_menstruacion);

  // Estado completo para edición (FASE 2)
  const [editData, setEditData] = useState({
    // Identificación
    idioma: paciente.idioma || 'Español',
    nombre: paciente.nombre || '',
    apellido: paciente.apellido || '',
    telefono: paciente.telefono || '',
    comunidad_pueblo: paciente.comunidad_pueblo || '',
    genero: paciente.genero || 'F',
    edad: paciente.edad?.toString() || '',
    fecha_nacimiento: paciente.fecha_nacimiento || '',
    usarEdad: paciente.edad ? true : false, // Toggle: true = usar edad, false = usar fecha
    
    // ✅ Severidad (manual si existe, sino calculada)
    _flagWorst: paciente.severidad_manual || paciente._flagWorst || '',
    severityManuallySet: !!paciente.severidad_manual,
    
    // Signos Vitales
    presion_arterial_sistolica: paciente.presion_arterial_sistolica?.toString() || '',
    presion_arterial_diastolica: paciente.presion_arterial_diastolica?.toString() || '',
    frecuencia_cardiaca: paciente.frecuencia_cardiaca?.toString() || '',
    saturacion_oxigeno: paciente.saturacion_oxigeno?.toString() || '',
    glucosa: paciente.glucosa?.toString() || '',
    temperatura: paciente.temperatura?.toString() || '',
    peso: localPeso,
    estatura: localAltura,
    
    // Tipo de Consulta (de última consulta si existe)
    tipo_consulta: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].tipo_consulta || '') : '',
    consult_other_text: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].consult_other_text || '') : '',
    chief_complaint: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].chief_complaint || '') : '',
    
    // Alergias y Medicamentos Preventivos
    tiene_alergias: paciente.tiene_alergias || false,
    alergias: paciente.alergias || '',
    vitamins: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].vitamins || '') : '',
    albendazole: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].albendazole || '') : '',
    
    // Flags
    paciente_en_ayuno: paciente.consultas && paciente.consultas.length > 0 ? paciente.consultas[0].paciente_en_ayuno : false,
    medicamento_bp_tomado: paciente.consultas && paciente.consultas.length > 0 ? paciente.consultas[0].medicamento_bp_tomado : false,
    medicamento_bs_tomado: paciente.consultas && paciente.consultas.length > 0 ? paciente.consultas[0].medicamento_bs_tomado : false,
    
    // Hábitos Actuales
    tabaco_actual: paciente.tabaco_actual || false,
    tabaco_actual_cantidad: paciente.tabaco_actual_cantidad || '',
    alcohol_actual: paciente.alcohol_actual || false,
    alcohol_actual_cantidad: paciente.alcohol_actual_cantidad || '',
    drogas_actual: paciente.drogas_actual || false,
    drogas_actual_cantidad: paciente.drogas_actual_cantidad || '',
    
    // Hábitos Pasados
    tabaco_pasado: paciente.tabaco_pasado || false,
    tabaco_pasado_cantidad: paciente.tabaco_pasado_cantidad || '',
    alcohol_pasado: paciente.alcohol_pasado || false,
    alcohol_pasado_cantidad: paciente.alcohol_pasado_cantidad || '',
    drogas_pasado: paciente.drogas_pasado || false,
    drogas_pasado_cantidad: paciente.drogas_pasado_cantidad || '',
    
    // ===== CLINICAL TAB (FASE 3) =====
    
    // Salud Reproductiva
    ultima_menstruacion: paciente.ultima_menstruacion || '',
    lmp_month: lmpParsed.month,
    lmp_day: lmpParsed.day,
    lmp_year: lmpParsed.year,
    menopause: paciente.menopausia || false,
    gravida: paciente.gestaciones?.toString() || '',
    para: paciente.partos?.toString() || '',
    miscarriage: paciente.abortos_espontaneos?.toString() || '',
    abortion: paciente.abortos_inducidos?.toString() || '',
    usa_anticonceptivos: paciente.usa_anticonceptivos || false,
    birth_control: paciente.metodo_anticonceptivo || 'Ninguno',
    
    // Historia Clínica
    historia_enfermedad_actual: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].historia_enfermedad_actual || '') : '',
    diagnosticos_previos: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].diagnosticos_previos || '') : '',
    cirugias_previas: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].cirugias_previas || '') : '',
    medicamentos_actuales: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].medicamentos_actuales || '') : '',
    
    // Examen Físico
    examen_corazon: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].examen_corazon || '') : '',
    examen_pulmones: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].examen_pulmones || '') : '',
    examen_abdomen: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].examen_abdomen || '') : '',
    examen_ginecologico: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].examen_ginecologico || '') : '',
    
    // Evaluación y Plan
    impresion: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].impresion || '') : '',
    plan: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].plan || '') : '',
    rx_notes: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].rx_notes || '') : '',
    
    // Consultas Adicionales - Descomponer string en checkboxes
    further_consult_gensurg: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].further_consult?.toLowerCase().includes('gen') || false) : false,
    further_consult_gyn: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].further_consult?.toLowerCase().includes('gyn') || false) : false,
    further_consult_other: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].further_consult?.toLowerCase().includes('other') || false) : false,
    further_consult_other_text: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].further_consult_other_text || '') : '',
    provider: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].provider || '') : '',
    interprete: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].interprete || '') : '',
    
    // ===== SURGICAL SECTION (FASE 4) ===== - Descomponer string en checkboxes
    surgical_date: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_date || '') : '',
    surgical_history: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_history || '') : '',
    surgical_exam: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_exam || '') : '',
    surgical_impression: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_impression || '') : '',
    surgical_plan: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_plan || '') : '',
    surgical_meds: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_meds || '') : '',
    surgical_consult_gensurg: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_consult?.toLowerCase().includes('gen') || false) : false,
    surgical_consult_gyn: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_consult?.toLowerCase().includes('gyn') || false) : false,
    surgical_consult_other: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_consult?.toLowerCase().includes('other') || false) : false,
    surgical_consult_other_text: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_consult_other_text || '') : '',
    surgical_surgeon: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_surgeon || '') : '',
    surgical_interpreter: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_interpreter || '') : '',
    surgical_notes: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].surgical_notes || '') : '',
    rx_slips_attached: paciente.consultas && paciente.consultas.length > 0 ? (paciente.consultas[0].rx_slips_attached || false) : false,
  });

  // --- helpers de traducción ---
  const severityMap = { 'Baja':'low','Media':'medium','Alta':'high','Crítica':'critical' };
  const tSeverity = (s) => s ? t(`severity.${severityMap[s] ?? 'unknown'}`) : '—';

  const bmiCategory = (bmiNum) => {
    if (bmiNum < 18.5) return { key: 'underweight', color: '#3B82F6' };
    if (bmiNum < 25)   return { key: 'normal',      color: '#10B981' };
    if (bmiNum < 30)   return { key: 'overweight',  color: '#F59E0B' };
    if (bmiNum < 35)   return { key: 'obesity1',    color: '#F97316' };
    if (bmiNum < 40)   return { key: 'obesity2',    color: '#DC2626' };
    return { key: 'obesity3', color: '#8B0000' };
  };

  const simulatedConsult1 = {
    date: '2025-09-25',
    patientName: `${paciente.nombre||''} ${paciente.apellido||''}`.trim(),
    town: paciente.comunidad_pueblo||t('placeholders.townDemo'),
    consultType: { diabetes:true, htn:false, respiratory:true, other:false, otherText:'' },
    chiefComplaint: t('seed.c1.chiefComplaint'),
    language: paciente.idioma || t('placeholders.langEs'),
    phone: paciente.telefono||'—',
    dobOrAge: paciente.edad? `${paciente.edad} ${t('units.years')}`:`12 ${t('units.years')}`,
    gender: paciente.genero||'F',
    vitals:{ bpSys:'110', bpDia:'70', hr:'82', spo2:'98', bs:'92', weight: localPeso||'28', height: localAltura||'128', temp:'37.1' },
    takenMed1:'N', fasting:'Y', takenMed2:'N',
    allergies:{ nka:false, list:t('seed.c1.allergy') }, vitaminPkts:'1', albendazoleTabs:'1',
    current:{ tobacco:{use:false,count:''}, alcohol:{use:false,count:''}, drugs:{use:false,count:''} },
    past:{ tobacco:{use:false,count:''}, alcohol:{use:false,count:''}, drugs:{use:false,count:''} },
    lmp:{ d:'05', m:'09', y:'2025' }, menopause:false,
    obstetric:{ G:'2', P:'1', Mc:'1', Ab:'0' }, birthControl:{ control:'N', method:'' },
    historyPresentIllness: t('seed.c1.hpi'),
    medicalDx: t('seed.c1.medDx'),
    surgery: t('seed.c1.surgery'),
    meds: t('seed.c1.meds'),
    physicalExam:{ heart:t('seed.c1.pe.heart'), lungs:t('seed.c1.pe.lungs'), abdomen:t('seed.c1.pe.abd'), gyn:t('seed.c1.pe.gyn') },
    impression:t('seed.c1.impression'),
    plan:t('seed.c1.plan'),
    further:{ genSurg:true, gyn:false, other:false, otherText:'' },
    provider:t('seed.c1.provider'), interpreter:'—'
  };
  const simulatedConsult2 = {
    date:'2025-09-25',
    historyPresentIllness:t('seed.c2.hpi'),
    physicalExam:t('seed.c2.pe'),
    impression:t('seed.c2.impression'),
    plan:t('seed.c2.plan'),
    medsRx:t('seed.c2.medsrx'),
    further:{ genSurg:true, gyn:false, other:true, otherText:t('seed.c2.otherRef') },
    surgeon:t('seed.c2.surgeon'),
    interpreter:'—'
  };

  const [consult1, setConsult1] = useState({
    date: '', patientName: `${paciente.nombre||''} ${paciente.apellido||''}`.trim(), town: paciente.comunidad_pueblo||'',
    consultType: { diabetes:false, htn:false, respiratory:false, other:false, otherText:'' },
    chiefComplaint:'', language: paciente.idioma || '', phone: paciente.telefono||'', dobOrAge: paciente.edad? `${paciente.edad} ${t('units.years')}`:'', gender: paciente.genero||'F',
    vitals:{ bpSys:'', bpDia:'', hr:'', spo2:'', bs:'', weight: localPeso||'', height: localAltura||'', temp:'' },
    takenMed1:null, fasting:null, takenMed2:null,
    allergies:{ nka:false, list:'' }, vitaminPkts:'', albendazoleTabs:'',
    current:{ tobacco:{use:false,count:''}, alcohol:{use:false,count:''}, drugs:{use:false,count:''} },
    past:{ tobacco:{use:false,count:''}, alcohol:{use:false,count:''}, drugs:{use:false,count:''} },
    lmp:{ d:'', m:'', y:'' }, menopause:false,
    obstetric:{ G:'', P:'', Mc:'', Ab:'' }, birthControl:{ control:null, method:'' },
    historyPresentIllness:'', medicalDx:'', surgery:'', meds:'',
    physicalExam:{ heart:'', lungs:'', abdomen:'', gyn:'' },
    impression:'', plan:'', further:{ genSurg:false, gyn:false, other:false, otherText:'' }, provider:'', interpreter:''
  });
  const [consult2, setConsult2] = useState({
    date:'', historyPresentIllness:'', physicalExam:'', impression:'', plan:'', medsRx:'', further:{ genSurg:false, gyn:false, other:false, otherText:'' }, surgeon:'', interpreter:''
  });

  const isSimulated1 = !consult1.date && !consult1.chiefComplaint;
  const isSimulated2 = !consult2.date && !consult2.historyPresentIllness;

  useEffect(()=>{
    if (isSimulated1) setConsult1(c=>({ ...c, ...simulatedConsult1 }));
    if (isSimulated2) setConsult2(c=>({ ...c, ...simulatedConsult2 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{
    const peso = parseFloat(String(localPeso).replace(',','.'));
    const alt = parseFloat(String(localAltura).replace(',','.'));
    if (peso>0 && alt>0) {
      const imc = peso / Math.pow(alt/100,2);
      setCalcIMC(imc.toFixed(2));
    } else {
      setCalcIMC(null);
    }
  },[localPeso, localAltura]);

  // Recargar paciente desde servidor al entrar o cuando cambie el ID
  useEffect(() => {
    const loadPatient = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/pacientes/${pacienteParam.id_paciente}`);
        if (res.ok) {
          const freshData = await res.json();
          setPaciente(freshData);
          setLocalPeso(freshData.peso?.toString() || '');
          setLocalAltura(freshData.estatura?.toString() || '');
          setLocalSeverity(freshData._flagWorst || '');
          setCalcIMC(freshData.peso && freshData.estatura 
            ? (freshData.peso / Math.pow(freshData.estatura / 100, 2)).toFixed(2) 
            : null);
        }
      } catch (e) {
        console.error('Error loading patient:', e);
      }
    };
    
    if (pacienteParam?.id_paciente) {
      loadPatient();
    }
  }, [pacienteParam?.id_paciente]);

  const toggle = key => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setOpen(o=>({...o,[key]:!o[key]})); };

  const worst = localSeverity || paciente?._flagWorst;
  const manualBadge = worst && paciente?.alertasMedicas?.some?.(a => /Override manual/i.test(a?.descripcion_medica||''));
  const severityColor = worst === 'Crítica' ? '#E53935' : worst === 'Alta' ? '#F08C21' : worst === 'Media' ? '#FFC107' : worst === 'Baja' ? '#4CAF50' : '#6698CC';

  const bmiVal = calcIMC || paciente.imc;
  let bmiCatKey = null; let bmiColor = '#6698CC';
  if (bmiVal) {
    const n = parseFloat(bmiVal);
    const { key, color } = bmiCategory(n);
    bmiCatKey = key; bmiColor = color;
  }

  const saveChanges = async () => {
    // ✅ VALIDAR TODOS LOS CAMPOS ANTES DE GUARDAR
    const validation = validatePatientData(editData, t);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join('\n\n');
      Alert.alert(
        '⚠️ Errores de Validación',
        errorMessages,
        [{ text: 'OK' }]
      );
      return; // No guardar si hay errores
    }
    setValidationErrors([]); // Limpiar errores previos
    
    // Payload completo con TODOS los campos editables (FASE 2)
    const payload = { 
      id_paciente: paciente.id_paciente,
      
      // ✅ SEVERIDAD MANUAL - Persistir si fue configurada
      severidad_manual: editData.severityManuallySet ? localSeverity : null,
      
      // Tabla Pacientes - Identificación
      idioma: editData.idioma,
      nombre: editData.nombre,
      apellido: editData.apellido || null,
      genero: editData.genero,
      edad: editData.usarEdad ? (editData.edad ? Number(editData.edad) : null) : null,
      fecha_nacimiento: !editData.usarEdad ? editData.fecha_nacimiento : null,
      telefono: editData.telefono && editData.telefono.trim() !== '' ? editData.telefono : null,
      comunidad_pueblo: editData.comunidad_pueblo || null,
      
      // Tabla Pacientes - Signos Vitales
      peso: editData.peso ? Number(editData.peso) : null,
      estatura: editData.estatura ? Number(editData.estatura) : null,
      presion_arterial_sistolica: editData.presion_arterial_sistolica ? Number(editData.presion_arterial_sistolica) : null,
      presion_arterial_diastolica: editData.presion_arterial_diastolica ? Number(editData.presion_arterial_diastolica) : null,
      frecuencia_cardiaca: editData.frecuencia_cardiaca ? Number(editData.frecuencia_cardiaca) : null,
      saturacion_oxigeno: editData.saturacion_oxigeno ? Number(editData.saturacion_oxigeno) : null,
      glucosa: editData.glucosa ? Number(editData.glucosa) : null,
      temperatura: editData.temperatura ? Number(editData.temperatura) : null,
      tiene_alergias: editData.tiene_alergias,
      alergias: editData.tiene_alergias ? editData.alergias : null,
      
      // Tabla Pacientes - Hábitos Actuales
      tabaco_actual: editData.tabaco_actual || false,
      tabaco_actual_cantidad: editData.tabaco_actual ? editData.tabaco_actual_cantidad : null,
      alcohol_actual: editData.alcohol_actual || false,
      alcohol_actual_cantidad: editData.alcohol_actual ? editData.alcohol_actual_cantidad : null,
      drogas_actual: editData.drogas_actual || false,
      drogas_actual_cantidad: editData.drogas_actual ? editData.drogas_actual_cantidad : null,
      
      // Tabla Pacientes - Hábitos Pasados
      tabaco_pasado: editData.tabaco_pasado || false,
      tabaco_pasado_cantidad: editData.tabaco_pasado ? editData.tabaco_pasado_cantidad : null,
      alcohol_pasado: editData.alcohol_pasado || false,
      alcohol_pasado_cantidad: editData.alcohol_pasado ? editData.alcohol_pasado_cantidad : null,
      drogas_pasado: editData.drogas_pasado || false,
      drogas_pasado_cantidad: editData.drogas_pasado ? editData.drogas_pasado_cantidad : null,
      
      // Tabla Pacientes - Salud Reproductiva
      ultima_menstruacion: (editData.lmp_month && editData.lmp_day && editData.lmp_year) 
        ? `${editData.lmp_year}-${editData.lmp_month.padStart(2, '0')}-${editData.lmp_day.padStart(2, '0')}`
        : (editData.ultima_menstruacion || null),
      menopausia: editData.menopause || false,
      gestaciones: editData.gravida ? Number(editData.gravida) : null,
      partos: editData.para ? Number(editData.para) : null,
      abortos_espontaneos: editData.miscarriage ? Number(editData.miscarriage) : null,
      abortos_inducidos: editData.abortion ? Number(editData.abortion) : null,
      usa_anticonceptivos: editData.usa_anticonceptivos || false,
      metodo_anticonceptivo: editData.birth_control || 'Ninguno',
      
      // ✅ DATOS DE CONSULTA (objeto separado para el backend)
      consulta: {
        tipo_consulta: editData.tipo_consulta || 'Other',
        consult_other_text: editData.consult_other_text ?? null,
        chief_complaint: editData.chief_complaint || 'N/A',
        
        // Flags
        paciente_en_ayuno: editData.paciente_en_ayuno || false,
        medicamento_bp_tomado: editData.medicamento_bp_tomado || false,
        medicamento_bs_tomado: editData.medicamento_bs_tomado || false,
        
        // Medicamentos preventivos
        vitamins: editData.vitamins ? Number(editData.vitamins) : null,
        albendazole: editData.albendazole ? Number(editData.albendazole) : null,
        
        // Historia Clínica (usar ?? en lugar de || para mantener strings vacíos)
        historia_enfermedad_actual: editData.historia_enfermedad_actual ?? null,
        diagnosticos_previos: editData.diagnosticos_previos ?? null,
        cirugias_previas: editData.cirugias_previas ?? null,
        medicamentos_actuales: editData.medicamentos_actuales ?? null,
        
        // Examen Físico
        examen_corazon: editData.examen_corazon ?? null,
        examen_pulmones: editData.examen_pulmones ?? null,
        examen_abdomen: editData.examen_abdomen ?? null,
        examen_ginecologico: editData.examen_ginecologico ?? null,
        
        // Evaluación y Plan
        impresion: editData.impresion ?? null,
        plan: editData.plan ?? null,
        rx_notes: editData.rx_notes ?? null,
        
        // Consultas Adicionales - Construir string desde checkboxes
        further_consult: (() => {
          const selected = [];
          if (editData.further_consult_gensurg) selected.push('Gen Surg');
          if (editData.further_consult_gyn) selected.push('GYN');
          if (editData.further_consult_other) selected.push('Other');
          return selected.length > 0 ? selected.join(', ') : null;
        })(),
        further_consult_other_text: editData.further_consult_other_text ?? null,
        provider: editData.provider ?? null,
        interprete: editData.interprete ?? null,
        
        // Sección Quirúrgica - Construir string desde checkboxes
        surgical_date: (editData.surgical_date && editData.surgical_date.trim() !== '') ? editData.surgical_date : null,
        surgical_history: editData.surgical_history ?? null,
        surgical_exam: editData.surgical_exam ?? null,
        surgical_impression: editData.surgical_impression ?? null,
        surgical_plan: editData.surgical_plan ?? null,
        surgical_meds: editData.surgical_meds ?? null,
        surgical_consult: (() => {
          const selected = [];
          if (editData.surgical_consult_gensurg) selected.push('Gen Surg');
          if (editData.surgical_consult_gyn) selected.push('GYN');
          if (editData.surgical_consult_other) selected.push('Other');
          return selected.length > 0 ? selected.join(', ') : null;
        })(),
        surgical_consult_other_text: editData.surgical_consult_other_text ?? null,
        surgical_surgeon: editData.surgical_surgeon ?? null,
        surgical_interpreter: editData.surgical_interpreter ?? null,
        surgical_notes: editData.surgical_notes ?? null,
        rx_slips_attached: editData.rx_slips_attached || false,
      }
    };
    
    try {
      const online = await ConnectivityService.getConnectionStatus();
      if (!online) throw new Error('offline');
      
      console.log('📤 Enviando payload al backend:', JSON.stringify(payload, null, 2));
      
      const res = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}`, { 
        method:'PUT', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Error del backend:', res.status, errorData);
        throw new Error(`Backend error: ${errorData.error || res.statusText}`);
      }
      
      // Recargar paciente actualizado desde el servidor
      const getRes = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}`);
      if (getRes.ok) {
        const updatedPaciente = await getRes.json();
        setPaciente(updatedPaciente);
        
        // ✅ ACTUALIZAR editData con los datos recargados desde el servidor
        setEditData({
          ...editData,
          // Datos de paciente
          idioma: updatedPaciente.idioma || '',
          nombre: updatedPaciente.nombre || '',
          apellido: updatedPaciente.apellido || '',
          genero: updatedPaciente.genero || '',
          edad: updatedPaciente.edad?.toString() || '',
          fecha_nacimiento: updatedPaciente.fecha_nacimiento || '',
          telefono: updatedPaciente.telefono || '',
          comunidad_pueblo: updatedPaciente.comunidad_pueblo || '',
          peso: updatedPaciente.peso?.toString() || '',
          estatura: updatedPaciente.estatura?.toString() || '',
          presion_arterial_sistolica: updatedPaciente.presion_arterial_sistolica?.toString() || '',
          presion_arterial_diastolica: updatedPaciente.presion_arterial_diastolica?.toString() || '',
          frecuencia_cardiaca: updatedPaciente.frecuencia_cardiaca?.toString() || '',
          saturacion_oxigeno: updatedPaciente.saturacion_oxigeno?.toString() || '',
          glucosa: updatedPaciente.glucosa?.toString() || '',
          temperatura: updatedPaciente.temperatura?.toString() || '',
          tiene_alergias: updatedPaciente.tiene_alergias || false,
          alergias: updatedPaciente.alergias || '',
          
          // Hábitos
          tabaco_actual: updatedPaciente.tabaco_actual || false,
          tabaco_actual_cantidad: updatedPaciente.tabaco_actual_cantidad || '',
          alcohol_actual: updatedPaciente.alcohol_actual || false,
          alcohol_actual_cantidad: updatedPaciente.alcohol_actual_cantidad || '',
          drogas_actual: updatedPaciente.drogas_actual || false,
          drogas_actual_cantidad: updatedPaciente.drogas_actual_cantidad || '',
          tabaco_pasado: updatedPaciente.tabaco_pasado || false,
          tabaco_pasado_cantidad: updatedPaciente.tabaco_pasado_cantidad || '',
          alcohol_pasado: updatedPaciente.alcohol_pasado || false,
          alcohol_pasado_cantidad: updatedPaciente.alcohol_pasado_cantidad || '',
          drogas_pasado: updatedPaciente.drogas_pasado || false,
          drogas_pasado_cantidad: updatedPaciente.drogas_pasado_cantidad || '',
          
          // Salud Reproductiva
          ultima_menstruacion: updatedPaciente.ultima_menstruacion || '',
          lmp_month: parseLMPDate(updatedPaciente.ultima_menstruacion).month,
          lmp_day: parseLMPDate(updatedPaciente.ultima_menstruacion).day,
          lmp_year: parseLMPDate(updatedPaciente.ultima_menstruacion).year,
          menopause: updatedPaciente.menopausia || false,
          gravida: updatedPaciente.gestaciones?.toString() || '',
          para: updatedPaciente.partos?.toString() || '',
          miscarriage: updatedPaciente.abortos_espontaneos?.toString() || '',
          abortion: updatedPaciente.abortos_inducidos?.toString() || '',
          usa_anticonceptivos: updatedPaciente.usa_anticonceptivos || false,
          birth_control: updatedPaciente.metodo_anticonceptivo || 'Ninguno',
          
          // Datos de consulta (desde la última consulta)
          tipo_consulta: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].tipo_consulta || '') : '',
          consult_other_text: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].consult_other_text || '') : '',
          chief_complaint: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].chief_complaint || '') : '',
          vitamins: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].vitamins?.toString() || '') : '',
          albendazole: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].albendazole?.toString() || '') : '',
          paciente_en_ayuno: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].paciente_en_ayuno || false) : false,
          medicamento_bp_tomado: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].medicamento_bp_tomado || false) : false,
          medicamento_bs_tomado: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].medicamento_bs_tomado || false) : false,
          historia_enfermedad_actual: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].historia_enfermedad_actual || '') : '',
          diagnosticos_previos: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].diagnosticos_previos || '') : '',
          cirugias_previas: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].cirugias_previas || '') : '',
          medicamentos_actuales: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].medicamentos_actuales || '') : '',
          examen_corazon: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].examen_corazon || '') : '',
          examen_pulmones: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].examen_pulmones || '') : '',
          examen_abdomen: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].examen_abdomen || '') : '',
          examen_ginecologico: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].examen_ginecologico || '') : '',
          impresion: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].impresion || '') : '',
          plan: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].plan || '') : '',
          rx_notes: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].rx_notes || '') : '',
          further_consult_gensurg: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].further_consult?.toLowerCase().includes('gen') || false) : false,
          further_consult_gyn: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].further_consult?.toLowerCase().includes('gyn') || false) : false,
          further_consult_other: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].further_consult?.toLowerCase().includes('other') || false) : false,
          further_consult_other_text: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].further_consult_other_text || '') : '',
          provider: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].provider || '') : '',
          interprete: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].interprete || '') : '',
          surgical_date: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_date || '') : '',
          surgical_history: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_history || '') : '',
          surgical_exam: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_exam || '') : '',
          surgical_impression: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_impression || '') : '',
          surgical_plan: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_plan || '') : '',
          surgical_meds: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_meds || '') : '',
          surgical_consult_gensurg: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_consult?.toLowerCase().includes('gen') || false) : false,
          surgical_consult_gyn: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_consult?.toLowerCase().includes('gyn') || false) : false,
          surgical_consult_other: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_consult?.toLowerCase().includes('other') || false) : false,
          surgical_consult_other_text: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_consult_other_text || '') : '',
          surgical_surgeon: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_surgeon || '') : '',
          surgical_interpreter: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_interpreter || '') : '',
          surgical_notes: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_notes || '') : '',
          rx_slips_attached: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].rx_slips_attached || false) : false,
        });
        
        // Actualizar estados locales con los nuevos valores
        setLocalPeso(updatedPaciente.peso?.toString() || '');
        setLocalAltura(updatedPaciente.estatura?.toString() || '');
        // ✅ Priorizar severidad_manual si existe, sino usar _flagWorst
        setLocalSeverity(updatedPaciente.severidad_manual || updatedPaciente._flagWorst || '');
        setCalcIMC(updatedPaciente.peso && updatedPaciente.estatura 
          ? (updatedPaciente.peso / Math.pow(updatedPaciente.estatura / 100, 2)).toFixed(1) 
          : null);
        
        // ✅ Actualizar el flag en editData también
        setEditData(prev => ({
          ...prev,
          severityManuallySet: !!updatedPaciente.severidad_manual,
          _flagWorst: updatedPaciente.severidad_manual || updatedPaciente._flagWorst || ''
        }));
      }
      
      // ✅ RECLASIFICAR SEVERIDAD DESPUÉS DE GUARDAR EXITOSAMENTE
      const vitalsChanged = 
        payload.presion_arterial_sistolica !== paciente.presion_arterial_sistolica ||
        payload.presion_arterial_diastolica !== paciente.presion_arterial_diastolica ||
        payload.glucosa !== paciente.glucosa ||
        payload.saturacion_oxigeno !== paciente.saturacion_oxigeno ||
        payload.temperatura !== paciente.temperatura;
      
      console.log('[DEBUG] vitalsChanged:', vitalsChanged);
      console.log('[DEBUG] editData.severityManuallySet:', editData.severityManuallySet);
      
      // ✅ SOLO reclasificar si cambió signos vitales Y NO hubo cambio manual de severidad
      if (vitalsChanged && !editData.severityManuallySet) {
        console.log('✅ Signos vitales cambiaron - reclasificando severidad...');
        await reclassifySeverity();
      } else if (editData.severityManuallySet) {
        console.log('✅ Severidad manual detectada - NO reclasificando');
        // Mantener la severidad manual
        setLocalSeverity(editData._flagWorst);
      }
      
      Alert.alert(t('alerts.saved.title'), t('alerts.saved.updated'));
      setEditMode(false);
    } catch (e) {
      console.error('💥 Error saving changes:', e);
      if (e.message === 'offline') {
        await OfflineStorage.savePendingPatientUpdate(payload);
        Alert.alert(t('alerts.offline.title'), t('alerts.offline.queued'));
      } else {
        Alert.alert('Error', `No se pudo guardar: ${e.message}`);
      }
      setEditMode(false);
    }
  };

  const reclassifySeverity = async () => {
    try {
      Alert.alert(t('alerts.reclassify.calculating'));
      
      const res = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}/reclassify`, { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}
      });
      
      if (!res.ok) throw new Error('fail');
      
      const data = await res.json();
      const { severidad, flags } = data;
      
      const oldSeverity = localSeverity || paciente._flagWorst;
      setLocalSeverity(severidad);
      
      // Recargar paciente actualizado desde el servidor
      const getRes = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}`);
      if (getRes.ok) {
        const updatedPaciente = await getRes.json();
        setPaciente(updatedPaciente);
        setLocalSeverity(updatedPaciente._flagWorst);
      }
      
      if (oldSeverity === severidad) {
        Alert.alert(
          t('alerts.reclassify.title'), 
          `${t('alerts.reclassify.noChange')} ${tSeverity(severidad)}`
        );
      } else {
        Alert.alert(
          t('alerts.reclassify.title'), 
          t('alerts.reclassify.changed', { old: tSeverity(oldSeverity), new: tSeverity(severidad) })
        );
      }
    } catch (e) {
      console.error('Error reclassifying:', e);
      Alert.alert(t('alerts.reclassify.title'), t('alerts.reclassify.error'));
    }
  };

  const handleRefresh = async () => {
    try {
      const getRes = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}`);
      if (getRes.ok) {
        const updatedPaciente = await getRes.json();
        setPaciente(updatedPaciente);
        setLocalPeso(updatedPaciente.peso?.toString() || '');
        setLocalAltura(updatedPaciente.estatura?.toString() || '');
        setLocalSeverity(updatedPaciente._flagWorst);
        setCalcIMC(updatedPaciente.peso && updatedPaciente.estatura 
          ? (updatedPaciente.peso / Math.pow(updatedPaciente.estatura / 100, 2)).toFixed(1) 
          : null);
        
        // Resetear editData con los datos frescos (incluyendo consultas)
        setEditData({
          idioma: updatedPaciente.idioma || 'Español',
          nombre: updatedPaciente.nombre || '',
          apellido: updatedPaciente.apellido || '',
          telefono: updatedPaciente.telefono || '',
          comunidad_pueblo: updatedPaciente.comunidad_pueblo || '',
          genero: updatedPaciente.genero || 'F',
          edad: updatedPaciente.edad?.toString() || '',
          fecha_nacimiento: updatedPaciente.fecha_nacimiento || '',
          usarEdad: updatedPaciente.edad ? true : false,
          presion_arterial_sistolica: updatedPaciente.presion_arterial_sistolica?.toString() || '',
          presion_arterial_diastolica: updatedPaciente.presion_arterial_diastolica?.toString() || '',
          frecuencia_cardiaca: updatedPaciente.frecuencia_cardiaca?.toString() || '',
          saturacion_oxigeno: updatedPaciente.saturacion_oxigeno?.toString() || '',
          glucosa: updatedPaciente.glucosa?.toString() || '',
          temperatura: updatedPaciente.temperatura?.toString() || '',
          peso: updatedPaciente.peso?.toString() || '',
          estatura: updatedPaciente.estatura?.toString() || '',
          
          // Tipo de Consulta (de última consulta si existe)
          tipo_consulta: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].tipo_consulta || '') : '',
          consult_other_text: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].consult_other_text || '') : '',
          chief_complaint: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].chief_complaint || '') : '',
          
          // Alergias y Medicamentos Preventivos
          alergias: updatedPaciente.alergias || '',
          tiene_alergias: !!updatedPaciente.alergias,
          vitamins: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].vitamins || '') : '',
          albendazole: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].albendazole || '') : '',
          
          // Flags
          paciente_en_ayuno: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? updatedPaciente.consultas[0].paciente_en_ayuno : false,
          medicamento_bp_tomado: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? updatedPaciente.consultas[0].medicamento_bp_tomado : false,
          medicamento_bs_tomado: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? updatedPaciente.consultas[0].medicamento_bs_tomado : false,
          
          // Hábitos
          tabaco_actual: updatedPaciente.tabaco_actual || false,
          tabaco_actual_cantidad: updatedPaciente.tabaco_actual_cantidad || '',
          alcohol_actual: updatedPaciente.alcohol_actual || false,
          alcohol_actual_cantidad: updatedPaciente.alcohol_actual_cantidad || '',
          drogas_actual: updatedPaciente.drogas_actual || false,
          drogas_actual_cantidad: updatedPaciente.drogas_actual_cantidad || '',
          tabaco_pasado: updatedPaciente.tabaco_pasado || false,
          tabaco_pasado_cantidad: updatedPaciente.tabaco_pasado_cantidad || '',
          alcohol_pasado: updatedPaciente.alcohol_pasado || false,
          alcohol_pasado_cantidad: updatedPaciente.alcohol_pasado_cantidad || '',
          drogas_pasado: updatedPaciente.drogas_pasado || false,
          drogas_pasado_cantidad: updatedPaciente.drogas_pasado_cantidad || '',
          
          // Salud Reproductiva
          ultima_menstruacion: updatedPaciente.ultima_menstruacion || '',
          lmp_month: parseLMPDate(updatedPaciente.ultima_menstruacion).month,
          lmp_day: parseLMPDate(updatedPaciente.ultima_menstruacion).day,
          lmp_year: parseLMPDate(updatedPaciente.ultima_menstruacion).year,
          menopause: updatedPaciente.menopausia || false,
          gravida: updatedPaciente.gestaciones?.toString() || '',
          para: updatedPaciente.partos?.toString() || '',
          miscarriage: updatedPaciente.abortos_espontaneos?.toString() || '',
          abortion: updatedPaciente.abortos_inducidos?.toString() || '',
          usa_anticonceptivos: updatedPaciente.usa_anticonceptivos || false,
          birth_control: updatedPaciente.metodo_anticonceptivo || 'Ninguno',
          
          // Historia Clínica
          historia_enfermedad_actual: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].historia_enfermedad_actual || '') : '',
          diagnosticos_previos: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].diagnosticos_previos || '') : '',
          cirugias_previas: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].cirugias_previas || '') : '',
          medicamentos_actuales: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].medicamentos_actuales || '') : '',
          
          // Examen Físico
          examen_corazon: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].examen_corazon || '') : '',
          examen_pulmones: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].examen_pulmones || '') : '',
          examen_abdomen: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].examen_abdomen || '') : '',
          examen_ginecologico: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].examen_ginecologico || '') : '',
          
          // Evaluación y Plan
          impresion: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].impresion || '') : '',
          plan: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].plan || '') : '',
          rx_notes: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].rx_notes || '') : '',
          
          // Consultas Adicionales - Descomponer string en checkboxes
          further_consult_gensurg: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].further_consult?.toLowerCase().includes('gen') || false) : false,
          further_consult_gyn: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].further_consult?.toLowerCase().includes('gyn') || false) : false,
          further_consult_other: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].further_consult?.toLowerCase().includes('other') || false) : false,
          further_consult_other_text: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].further_consult_other_text || '') : '',
          provider: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].provider || '') : '',
          interprete: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].interprete || '') : '',
          
          // Sección Quirúrgica - Descomponer string en checkboxes
          surgical_date: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_date || '') : '',
          surgical_history: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_history || '') : '',
          surgical_exam: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_exam || '') : '',
          surgical_impression: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_impression || '') : '',
          surgical_plan: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_plan || '') : '',
          surgical_meds: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_meds || '') : '',
          surgical_consult_gensurg: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_consult?.toLowerCase().includes('gen') || false) : false,
          surgical_consult_gyn: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_consult?.toLowerCase().includes('gyn') || false) : false,
          surgical_consult_other: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_consult?.toLowerCase().includes('other') || false) : false,
          surgical_consult_other_text: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_consult_other_text || '') : '',
          surgical_surgeon: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_surgeon || '') : '',
          surgical_interpreter: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_interpreter || '') : '',
          surgical_notes: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].surgical_notes || '') : '',
          rx_slips_attached: updatedPaciente.consultas && updatedPaciente.consultas.length > 0 ? (updatedPaciente.consultas[0].rx_slips_attached || false) : false,
        });
        
        Alert.alert('Recargado', 'Los datos del paciente se han actualizado correctamente');
      }
    } catch (e) {
      console.error('Error refreshing:', e);
      Alert.alert('Error', 'No se pudo recargar los datos del paciente');
    }
  };

  // Validar todos los campos antes de guardar
  const handleSave = async () => {
    // Preparar datos para validación (solo campos críticos)
    const dataToValidate = {
      nombre: editData.nombre,
      telefono: editData.telefono,
      // Solo validar signos vitales si tienen valor
      presion_arterial_sistolica: editData.presion_arterial_sistolica,
      presion_arterial_diastolica: editData.presion_arterial_diastolica,
      frecuencia_cardiaca: editData.frecuencia_cardiaca,
      saturacion_oxigeno: editData.saturacion_oxigeno,
      glucosa: editData.glucosa,
      peso: editData.peso,
      estatura: editData.estatura,
      temperatura: editData.temperatura,
    };

    // Validar solo campos con valor
    const validation = validatePatientData(dataToValidate, t);
    
    if (!validation.valid) {
      // Mostrar errores
      setValidationErrors(validation.errors);
      
      // Alert con lista de errores
      const errorList = validation.errors
        .map((err, idx) => `${idx + 1}. ${err.field}: ${err.message}`)
        .join('\n');
      
      Alert.alert(
        t('alerts.validation.title') || 'Errores de validación',
        `${t('alerts.validation.subtitle') || 'Corrige los siguientes errores'}:\n\n${errorList}`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Si todo es válido, guardar (llamar a la función saveChanges existente)
    setValidationErrors([]);
    await saveChanges();
  };

  // Función para cambiar severidad manualmente
  const changeSeverityManually = (newSeverity) => {
    setLocalSeverity(newSeverity);
    setShowSeverityModal(false);
    
    // ✅ Actualizar editData con la nueva severidad
    setEditData(prev => ({
      ...prev,
      _flagWorst: newSeverity,
      severityManuallySet: true
    }));
    
    // Marcar como cambio manual
    Alert.alert(
      'Severidad Actualizada',
      `Severidad cambiada manualmente a: ${t(`severity.${newSeverity === 'Baja' ? 'low' : newSeverity === 'Media' ? 'medium' : newSeverity === 'Alta' ? 'high' : 'critical'}`)}`,
      [{ text: 'OK' }]
    );
  };

  const cancelChanges = () => {
    // ✅ FIX: Resetear editData a valores originales INCLUYENDO consulta
    const consulta = paciente.consultas?.[0] || {};
    
    setEditData({
      idioma: paciente.idioma || 'Español',
      nombre: paciente.nombre || '',
      apellido: paciente.apellido || '',
      telefono: paciente.telefono || '',
      comunidad_pueblo: paciente.comunidad_pueblo || '',
      genero: paciente.genero || 'F',
      edad: paciente.edad?.toString() || '',
      fecha_nacimiento: paciente.fecha_nacimiento || '',
      usarEdad: paciente.edad ? true : false,
      presion_arterial_sistolica: paciente.presion_arterial_sistolica?.toString() || '',
      presion_arterial_diastolica: paciente.presion_arterial_diastolica?.toString() || '',
      frecuencia_cardiaca: paciente.frecuencia_cardiaca?.toString() || '',
      saturacion_oxigeno: paciente.saturacion_oxigeno?.toString() || '',
      glucosa: paciente.glucosa?.toString() || '',
      temperatura: paciente.temperatura?.toString() || '',
      peso: paciente.peso?.toString() || '',
      estatura: paciente.estatura?.toString() || '',
      
      // ✅ RESTAURAR datos de consulta desde paciente.consultas[0]
      tipo_consulta: consulta.tipo_consulta || '',
      consult_other_text: consulta.consult_other_text || '',
      chief_complaint: consulta.chief_complaint || '',
      vitamins: consulta.vitamins?.toString() || '',
      albendazole: consulta.albendazole?.toString() || '',
      paciente_en_ayuno: consulta.paciente_en_ayuno || false,
      medicamento_bp_tomado: consulta.medicamento_bp_tomado || false,
      medicamento_bs_tomado: consulta.medicamento_bs_tomado || false,
      historia_enfermedad_actual: consulta.historia_enfermedad_actual || '',
      diagnosticos_previos: consulta.diagnosticos_previos || '',
      cirugias_previas: consulta.cirugias_previas || '',
      medicamentos_actuales: consulta.medicamentos_actuales || '',
      examen_corazon: consulta.examen_corazon || '',
      examen_pulmones: consulta.examen_pulmones || '',
      examen_abdomen: consulta.examen_abdomen || '',
      examen_ginecologico: consulta.examen_ginecologico || '',
      impresion: consulta.impresion || '',
      plan: consulta.plan || '',
      rx_notes: consulta.rx_notes || '',
      rx_slips_attached: consulta.rx_slips_attached || false,
      
      // Parsear further_consult desde string CSV
      further_consult_gensurg: consulta.further_consult?.includes('Gen Surg') || false,
      further_consult_gyn: consulta.further_consult?.includes('GYN') || false,
      further_consult_other: consulta.further_consult?.includes('Other') || false,
      further_consult_other_text: consulta.further_consult_other_text || '',
      
      provider: consulta.provider || '',
      interprete: consulta.interprete || '',
      
      // Datos quirúrgicos
      surgical_date: consulta.surgical_date || '',
      surgical_history: consulta.surgical_history || '',
      surgical_exam: consulta.surgical_exam || '',
      surgical_impression: consulta.surgical_impression || '',
      surgical_plan: consulta.surgical_plan || '',
      surgical_meds: consulta.surgical_meds || '',
      
      // Parsear surgical_consult desde string CSV
      surgical_consult_gensurg: consulta.surgical_consult?.includes('Gen Surg') || false,
      surgical_consult_gyn: consulta.surgical_consult?.includes('GYN') || false,
      surgical_consult_other: consulta.surgical_consult?.includes('Other') || false,
      surgical_consult_other_text: consulta.surgical_consult_other_text || '',
      
      surgical_surgeon: consulta.surgical_surgeon || '',
      surgical_interpreter: consulta.surgical_interpreter || '',
      surgical_notes: consulta.surgical_notes || '',
      
      tiene_alergias: !!paciente.alergias,
      alergias: paciente.alergias || '',
      tabaco_actual: paciente.tabaco_actual || false,
      tabaco_actual_cantidad: paciente.tabaco_actual_cantidad || '',
      alcohol_actual: paciente.alcohol_actual || false,
      alcohol_actual_cantidad: paciente.alcohol_actual_cantidad || '',
      drogas_actual: paciente.drogas_actual || false,
      drogas_actual_cantidad: paciente.drogas_actual_cantidad || '',
      tabaco_pasado: paciente.tabaco_pasado || false,
      tabaco_pasado_cantidad: paciente.tabaco_pasado_cantidad || '',
      alcohol_pasado: paciente.alcohol_pasado || false,
      alcohol_pasado_cantidad: paciente.alcohol_actual_cantidad || '',
      drogas_pasado: paciente.drogas_pasado || false,
      drogas_pasado_cantidad: paciente.drogas_pasado_cantidad || '',
      
      // Clinical tab fields (FASE 3)
      ultima_menstruacion: paciente.ultima_menstruacion || '',
      lmp_month: parseLMPDate(paciente.ultima_menstruacion).month,
      lmp_day: parseLMPDate(paciente.ultima_menstruacion).day,
      lmp_year: parseLMPDate(paciente.ultima_menstruacion).year,
      menopause: paciente.menopausia || false,
      gravida: paciente.gestaciones?.toString() || '',
      para: paciente.partos?.toString() || '',
      miscarriage: paciente.abortos_espontaneos?.toString() || '',
      abortion: paciente.abortos_inducidos?.toString() || '',
      usa_anticonceptivos: paciente.usa_anticonceptivos || false,
      birth_control: paciente.metodo_anticonceptivo || 'Ninguno'
    });
    setLocalPeso(paciente.peso?.toString() || '');
    setLocalAltura(paciente.estatura?.toString() || '');
    setLocalSeverity(paciente._flagWorst || '');
    setEditMode(false);
  };

  if (!paciente) {
    return <View style={[styles.center,{backgroundColor:theme.background}]}><Text style={{color:theme.text}}>{t('errors.notFound')}</Text></View>;
  }

  // Componente Modal de Selector de Severidad
  const SeverityModal = () => {
    if (!showSeverityModal) return null;
    
    // ✅ FIX: Usar claves de traducción correctas (low, medium, high, critical)
    const severities = [
      { key: 'Baja', translationKey: 'low' },
      { key: 'Media', translationKey: 'medium' },
      { key: 'Alta', translationKey: 'high' },
      { key: 'Crítica', translationKey: 'critical' }
    ];
    
    return (
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{t('severitySelector.title')}</Text>
          <Text style={[styles.modalSubtitle, { color: theme.secondaryText }]}>{t('severitySelector.subtitle')}</Text>
          
          <View style={styles.severityButtons}>
            {severities.map(sev => (
              <TouchableOpacity
                key={sev.key}
                style={[
                  styles.severityButton,
                  localSeverity === sev.key && styles.severityButtonActive
                ]}
                onPress={() => changeSeverityManually(sev.key)}
              >
                <Text style={[
                  styles.severityButtonText,
                  localSeverity === sev.key && styles.severityButtonTextActive
                ]}>
                  {t(`severity.${sev.translationKey}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.modalCancelButton, { backgroundColor: '#E53935' }]}
            onPress={() => setShowSeverityModal(false)}
          >
            <Text style={styles.modalCancelText}>{t('severitySelector.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const section = (title, key, rows) => {
    const isOpen = open[key];
    return (
      <View style={[styles.section,{backgroundColor: isDarkMode? '# 1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
        <TouchableOpacity onPress={()=>toggle(key)} style={styles.sectionHeader} activeOpacity={0.8}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Ionicons name={isOpen? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
        </TouchableOpacity>
        {isOpen && rows.map(r => (
          <View key={r.label} style={styles.row}>
            <Text style={[styles.label,{color:theme.secondaryText}]}>{r.label}</Text>
            <Text style={[styles.value,{color:theme.text}]} numberOfLines={4}>{r.value??'—'}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      <SeverityModal />
      <View style={{flex:1, backgroundColor: theme.background}}>
        {/* Header con nombre del paciente */}
        <View style={[styles.header, {borderBottomWidth:1, borderBottomColor:'#E5E7EB'}]}>
          <TouchableOpacity onPress={()=>navigation.goBack()} style={{marginRight:12}}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <View style={{flex:1}}>
          <Text style={[styles.title,{color:theme.text}]} numberOfLines={1}>
            {`${paciente.nombre||''} ${paciente.apellido||''}`.trim()}
          </Text>
          <Text style={[styles.subtitle,{color:theme.secondaryText}]}>{t('top.subtitle')}</Text>
        </View>
      </View>

      {/* Tabs de navegación */}
      <View style={styles.tabsRow}>
        {[
          {k:'resumen',lbl:t('tabs.summary')},
          {k:'clinico',lbl:t('tabs.clinical')},
          {k:'pagina1',lbl:t('tabs.consult1')},
          {k:'pagina2',lbl:t('tabs.consult2')}
        ].map(ti => (
          <TouchableOpacity key={ti.k} onPress={()=>setTab(ti.k)} style={[styles.tabBtn, tab===ti.k && styles.tabBtnActive]}>
            <Text style={[styles.tabTxt, tab===ti.k && styles.tabTxtActive]}>{ti.lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Barra de acciones debajo de los tabs */}
      <View style={styles.actionBar}>
        <View style={{flexDirection:'row', alignItems:'center', gap:8, marginLeft:'auto'}}>
          {/* Botón de EDITAR (solo visible cuando NO está en modo edición) */}
          {!editMode && (
            <TouchableOpacity 
              onPress={() => setEditMode(true)} 
              style={[styles.actionCircleBtn, {backgroundColor: isDarkMode ? '#2D60C8' : '#2D60C8'}]}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          )}
          
          {/* Botón de RECARGAR */}
          {!editMode && (
            <TouchableOpacity 
              onPress={handleRefresh} 
              style={[styles.actionCircleBtn, {backgroundColor: isDarkMode ? '#28A745' : '#28A745'}]}
              activeOpacity={0.7}
            >
              <Ionicons name="reload-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          )}
          
          {/* Botón de RECLASIFICAR */}
          <TouchableOpacity 
            onPress={reclassifySeverity} 
            style={[styles.actionCircleBtn, {backgroundColor: isDarkMode ? '#333' : '#E0E0E0'}]}
            activeOpacity={0.7}
          >
            <Ionicons name="analytics-outline" size={18} color={isDarkMode ? '#FFF' : '#555'} />
          </TouchableOpacity>
          
          {/* Chip de severidad */}
          <View style={[styles.severityChip,{backgroundColor:severityColor}]}>
            <Text style={styles.severityTxt}>{tSeverity(worst) || '—'}</Text>
          </View>
          
          {/* Botón para cambiar severidad manualmente (solo en modo edición) */}
          {editMode && (
            <TouchableOpacity 
              style={styles.changeSeverityButton} 
              onPress={() => setShowSeverityModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color="#F08C21" />
              <Text style={styles.changeSeverityText}>{t('validation.changeSeverity')}</Text>
            </TouchableOpacity>
          )}
        </View>
        {manualBadge && (
          <Text style={{ marginTop:4, fontSize:10, fontWeight:'700', color:'#F08C21', textAlign:'right' }}>
            {t('badges.manual')}
          </Text>
        )}
      </View>

      <ScrollView contentContainerStyle={{padding:16, paddingBottom:90}}>
        {/* Botones de acción (fuera de la caja problemática) */}
        <View style={{flexDirection:'row', gap:12, marginBottom:16}}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.exportBtn, {flex:1}]}
            onPress={() => navigation.navigate('ExportacionPDF', { paciente })}
          >
            <Ionicons name="download-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>{t('buttons.exportPDF')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.imagesBtn, {flex:1}]}
            onPress={() => navigation.navigate('GestionImagenes', { paciente })}
          >
            <Ionicons name="images-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>{t('buttons.manageImages')}</Text>
          </TouchableOpacity>
        </View>

        {tab==='resumen' && (
          <>
            {!editMode ? (
              // ===== VISTA DE SOLO LECTURA EXPANDIDA =====
              <>
                {/* 1. IDENTIFICACIÓN - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('ident')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.ident')}</Text>
                    <Ionicons name={open.ident? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.ident && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.language')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.idioma || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.firstName')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.nombre || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.lastName')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.apellido || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.phone')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.telefono || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.community')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.comunidad_pueblo || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.gender')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.genero || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.age')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {paciente.edad ? `${paciente.edad} ${t('units.years')}` : (paciente.fecha_nacimiento || '—')}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 2. SIGNOS VITALES - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('clin')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.clin')}</Text>
                    <Ionicons name={open.clin? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.clin && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.weight')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.peso || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.heightAlt')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.estatura || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('c1.vitals.bp')} (mmHg)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {paciente.presion_arterial_sistolica && paciente.presion_arterial_diastolica 
                            ? `${paciente.presion_arterial_sistolica}/${paciente.presion_arterial_diastolica}` 
                            : '—'}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.heartRate')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.frecuencia_cardiaca || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.oxygenSaturation')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.saturacion_oxigeno || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.glucose')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.glucosa || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.temperature')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.temperatura || '—'}</Text>
                      </View>
                      {bmiVal && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.bmi')}</Text>
                          <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
                            <Text style={[styles.readOnlyValue,{color:theme.text}]}>{bmiVal}</Text>
                            {bmiCatKey && (
                              <View style={{backgroundColor:bmiColor, paddingHorizontal:8, paddingVertical:3, borderRadius:12}}>
                                <Text style={{color:'#fff', fontWeight:'700', fontSize:10}}>{t(`bmi.${bmiCatKey}`)}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* 3. TIPO DE CONSULTA - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('consultType')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.consultType')}</Text>
                    <Ionicons name={open.consultType? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.consultType && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.consultType')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.tipo_consulta || '—'}</Text>
                      </View>
                      {editData.tipo_consulta === 'Other' && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('common.specify')}</Text>
                          <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_other_text || '—'}</Text>
                        </View>
                      )}
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.chiefComplaint')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]} numberOfLines={3}>{editData.chief_complaint || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 4. ALERGIAS - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('allergies')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.allergiesAndMeds')}</Text>
                    <Ionicons name={open.allergies? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.allergies && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.hasAllergies')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.tiene_alergias ? t('common.yes') : t('common.no')}</Text>
                      </View>
                      {editData.tiene_alergias && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.allergies')}</Text>
                          <Text style={[styles.readOnlyValue,{color:theme.text}]} numberOfLines={3}>{editData.alergias || '—'}</Text>
                        </View>
                      )}
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.vitamins')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.vitamins || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.albendazole')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.albendazole || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 5. HÁBITOS ACTUALES - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('currentHabits')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.currentHabits')}</Text>
                    <Ionicons name={open.currentHabits? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.currentHabits && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.tobacco')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.tabaco_actual ? `${t('common.yes')} (${editData.tabaco_actual_cantidad || '—'})` : t('common.no')}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.alcohol')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.alcohol_actual ? `${t('common.yes')} (${editData.alcohol_actual_cantidad || '—'})` : t('common.no')}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.drugs')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.drogas_actual ? `${t('common.yes')} (${editData.drogas_actual_cantidad || '—'})` : t('common.no')}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 6. HÁBITOS PASADOS - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('pastHabits')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.pastHabits')}</Text>
                    <Ionicons name={open.pastHabits? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.pastHabits && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.tobaccoPast')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.tabaco_pasado ? `${t('common.yes')} (${editData.tabaco_pasado_cantidad || '—'})` : t('common.no')}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.alcoholPast')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.alcohol_pasado ? `${t('common.yes')} (${editData.alcohol_pasado_cantidad || '—'})` : t('common.no')}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.drugsPast')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.drogas_pasado ? `${t('common.yes')} (${editData.drogas_pasado_cantidad || '—'})` : t('common.no')}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </>
            ) : (
              // ===== MODO EDICIÓN (todos los campos editables) =====
              <>
            {/* 1. IDENTIFICACIÓN */}
            <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
              <TouchableOpacity onPress={()=>toggle('ident')} style={styles.sectionHeader} activeOpacity={0.8}>
                <Text style={styles.sectionTitle}>{t('sections.ident')}</Text>
                <Ionicons name={open.ident? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
              </TouchableOpacity>
              {open.ident && (
                <View>
                      {/* Idioma */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.language')}</Text>
                        <View style={[styles.editInput, {backgroundColor: isDarkMode ? theme.inputBackground : '#fff', borderWidth: 1, borderColor: isDarkMode ? theme.inputBorder : '#E9E2C6', borderRadius: 8, overflow: 'hidden'}]}>
                          <Picker
                            selectedValue={editData.idioma}
                            onValueChange={(v) => setEditData({...editData, idioma:v})}
                            style={{color:theme.text, backgroundColor: 'transparent'}}
                            dropdownIconColor={theme.text}
                          >
                            <Picker.Item label="Español" value="Español" />
                            <Picker.Item label="Inglés" value="Inglés" />
                            <Picker.Item label="K'iche'" value="K'iche'" />
                            <Picker.Item label="Kaqchikel" value="Kaqchikel" />
                            <Picker.Item label="Q'eqchi'" value="Q'eqchi'" />
                            <Picker.Item label="Mam" value="Mam" />
                          </Picker>
                        </View>
                      </View>

                      {/* Nombres */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.firstName')}</Text>
                        <TextInput 
                          value={editData.nombre} 
                          onChangeText={(v) => setEditData({...editData, nombre:v})} 
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                          placeholder={t('fields.firstName')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>                      {/* Apellidos */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.lastName')}</Text>
                        <TextInput 
                          value={editData.apellido} 
                          onChangeText={(v) => setEditData({...editData, apellido:v})} 
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                          placeholder={t('fields.lastName')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Teléfono */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.phone')}</Text>
                        <PhoneInput
                          value={editData.telefono} 
                          onChangeText={(v) => setEditData({...editData, telefono:v})} 
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                        />
                      </View>

                      {/* Comunidad */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.community')}</Text>
                        <TextInput 
                          value={editData.comunidad_pueblo} 
                          onChangeText={(v) => setEditData({...editData, comunidad_pueblo:v})} 
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                          placeholder={t('fields.community')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Género */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.gender')}</Text>
                        <View style={{flexDirection:'row', gap:16, marginTop:4}}>
                          <TouchableOpacity onPress={() => setEditData({...editData, genero:'F'})} style={{flexDirection:'row',alignItems:'center',gap:8}}>
                            <View style={[styles.radio, editData.genero==='F' && styles.radioActive]} />
                            <Text style={[styles.label,{color:theme.text}]}>F</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setEditData({...editData, genero:'M'})} style={{flexDirection:'row',alignItems:'center',gap:8}}>
                            <View style={[styles.radio, editData.genero==='M' && styles.radioActive]} />
                            <Text style={[styles.label,{color:theme.text}]}>M</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Toggle Edad vs Fecha Nacimiento */}
                      <View style={{flexDirection:'row', gap:16, marginBottom:12}}>
                        <TouchableOpacity onPress={() => setEditData({...editData, usarEdad:true})} style={{flexDirection:'row',alignItems:'center',gap:8}}>
                          <View style={[styles.radio, editData.usarEdad && styles.radioActive]} />
                          <Text style={[styles.label,{color:theme.text}]}>{t('fields.age')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditData({...editData, usarEdad:false})} style={{flexDirection:'row',alignItems:'center',gap:8}}>
                          <View style={[styles.radio, !editData.usarEdad && styles.radioActive]} />
                          <Text style={[styles.label,{color:theme.text}]}>{t('fields.birthDate')}</Text>
                        </TouchableOpacity>
                      </View>

                      {editData.usarEdad ? (
                        <View style={{marginBottom:12}}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.ageYears')}</Text>
                          <RangeInput
                            value={editData.edad}
                            onChangeText={(v) => setEditData({...editData, edad:v})}
                            min={0}
                            max={150}
                            unit="años"
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                            placeholder="35"
                          />
                        </View>
                      ) : (
                        <View style={{marginBottom:12}}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.birthDate')}</Text>
                          <DateInput
                            value={editData.fecha_nacimiento}
                            onChangeText={(v) => setEditData({...editData, fecha_nacimiento:v})}
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                            placeholder="MM/DD/YYYY"
                          />
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* 2. SIGNOS VITALES */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('clin')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.clin')}</Text>
                    <Ionicons name={open.clin? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.clin && (
                    <View>
                      {/* Peso y Altura */}
                      <View style={styles.inlineEditRow}>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.weight')}</Text>
                          <VitalSignInput
                            type="peso"
                            value={editData.peso}
                            onChangeText={(v) => setEditData({...editData, peso:v})}
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                            placeholder='70'
                          />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.heightAlt')}</Text>
                          <VitalSignInput
                            type="estatura"
                            value={editData.estatura}
                            onChangeText={(v) => setEditData({...editData, estatura:v})}
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                            placeholder='170'
                          />
                        </View>
                      </View>

                      {/* Presión Arterial */}
                      <View style={styles.inlineEditRow}>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.systolicBP')}</Text>
                          <VitalSignInput
                            type="presion_sistolica"
                            value={editData.presion_arterial_sistolica}
                            onChangeText={(v) => {
                              setEditData({...editData, presion_arterial_sistolica:v});
                              setVitalsEdited(true);
                            }}
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                            placeholder='120'
                          />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.diastolicBP')}</Text>
                          <VitalSignInput
                            type="presion_diastolica"
                            value={editData.presion_arterial_diastolica}
                            onChangeText={(v) => {
                              setEditData({...editData, presion_arterial_diastolica:v});
                              setVitalsEdited(true);
                            }}
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                            placeholder='80'
                          />
                        </View>
                      </View>

                      {/* Flags medicamentos BP/BS */}
                      <TouchableOpacity onPress={() => setEditData({...editData, medicamento_bp_tomado: !editData.medicamento_bp_tomado})} style={{flexDirection:'row',alignItems:'center',marginBottom:12}}>
                        <View style={[styles.toggle, editData.medicamento_bp_tomado && styles.toggleActive]}>
                          {editData.medicamento_bp_tomado && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Tomó medicamento BP</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setEditData({...editData, medicamento_bs_tomado: !editData.medicamento_bs_tomado})} style={{flexDirection:'row',alignItems:'center',marginBottom:12}}>
                        <View style={[styles.toggle, editData.medicamento_bs_tomado && styles.toggleActive]}>
                          {editData.medicamento_bs_tomado && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Tomó medicamento BS</Text>
                      </TouchableOpacity>

                      {/* Otros signos vitales */}
                      <View style={styles.inlineEditRow}>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.heartRate')}</Text>
                          <VitalSignInput
                            type="frecuencia_cardiaca"
                            value={editData.frecuencia_cardiaca}
                            onChangeText={(v) => {
                              setEditData({...editData, frecuencia_cardiaca:v});
                              setVitalsEdited(true);
                            }}
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                            placeholder='75'
                          />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.oxygenSaturation')}</Text>
                          <VitalSignInput
                            type="saturacion_oxigeno"
                            value={editData.saturacion_oxigeno}
                            onChangeText={(v) => {
                              setEditData({...editData, saturacion_oxigeno:v});
                              setVitalsEdited(true);
                            }}
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                            placeholder='98'
                          />
                        </View>
                      </View>

                      <View style={styles.inlineEditRow}>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.glucose')}</Text>
                          <VitalSignInput
                            type="glucosa"
                            value={editData.glucosa}
                            onChangeText={(v) => {
                              setEditData({...editData, glucosa:v});
                              setVitalsEdited(true);
                            }}
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                            placeholder='95'
                          />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.temperature')}</Text>
                          <VitalSignInput
                            type="temperatura"
                            value={editData.temperatura}
                            onChangeText={(v) => {
                              setEditData({...editData, temperatura:v});
                              setVitalsEdited(true);
                            }}
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]}
                            placeholder='36.8'
                          />
                        </View>
                      </View>

                      {/* Flag ayuno */}
                      <TouchableOpacity onPress={() => setEditData({...editData, paciente_en_ayuno: !editData.paciente_en_ayuno})} style={{flexDirection:'row',alignItems:'center',marginBottom:12}}>
                        <View style={[styles.toggle, editData.paciente_en_ayuno && styles.toggleActive]}>
                          {editData.paciente_en_ayuno && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Paciente en ayuno</Text>
                      </TouchableOpacity>

                      {/* IMC calculado */}
                      {bmiCatKey && (
                        <View style={{marginTop:8}}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>IMC: {bmiVal}</Text>
                          <View style={{ backgroundColor:bmiColor, paddingHorizontal:12, paddingVertical:6, borderRadius:16, alignSelf:'flex-start', marginTop:4 }}>
                            <Text style={{ color:'#fff', fontWeight:'800', fontSize:12 }}>{t(`bmi.${bmiCatKey}`)}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* 3. TIPO DE CONSULTA */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('consult')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Tipo de Consulta</Text>
                    <Ionicons name={open.consult? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.consult && (
                    <View>
                      <Text style={[styles.label,{color:theme.secondaryText,marginBottom:8}]}>Tipo</Text>
                      <Picker
                        selectedValue={editData.tipo_consulta}
                        onValueChange={(v) => setEditData({...editData, tipo_consulta:v})}
                        style={{backgroundColor: isDarkMode? '#2A2A2A':'#F9F9F9', color:theme.text, marginBottom:12}}
                      >
                        <Picker.Item label="-- Seleccionar --" value="" />
                        <Picker.Item label="Diabetes" value="Diabetes" />
                        <Picker.Item label="HTN (Hipertensión)" value="HTN" />
                        <Picker.Item label="Respiratory" value="Respiratory" />
                        <Picker.Item label="Other" value="Other" />
                      </Picker>

                      {editData.tipo_consulta === 'Other' && (
                        <View style={{marginBottom:12}}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('common.specify')}</Text>
                          <TextInput 
                            value={editData.consult_other_text} 
                            onChangeText={(v) => setEditData({...editData, consult_other_text:v})} 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder="Especificar tipo..." 
                            placeholderTextColor={theme.secondaryText}
                            maxLength={25}
                          />
                        </View>
                      )}

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.chiefComplaint')}</Text>
                        <CharCounterInput
                          value={editData.chief_complaint} 
                          onChangeText={(v) => setEditData({...editData, chief_complaint:v})} 
                          maxChars={250}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:80}]} 
                          multiline 
                          placeholder="Describir motivo..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* 4. ALERGIAS Y MEDICAMENTOS PREVENTIVOS */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('meds')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Alergias y Medicamentos Preventivos</Text>
                    <Ionicons name={open.meds? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.meds && (
                    <View>
                      <TouchableOpacity onPress={() => setEditData({...editData, tiene_alergias: !editData.tiene_alergias})} style={{flexDirection:'row',alignItems:'center',marginBottom:12}}>
                        <View style={[styles.toggle, editData.tiene_alergias && styles.toggleActive]}>
                          {editData.tiene_alergias && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Tiene alergias</Text>
                      </TouchableOpacity>

                      {editData.tiene_alergias && (
                        <View style={{marginBottom:12}}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.allergies')}</Text>
                          <TextInput 
                            value={editData.alergias} 
                            onChangeText={(v) => setEditData({...editData, alergias:v})} 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:60}]} 
                            multiline 
                            numberOfLines={3}
                            placeholder="Describir alergias..." 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}

                      <View style={styles.inlineEditRow}>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.vitamins')}</Text>
                          <TextInput 
                            value={editData.vitamins} 
                            onChangeText={(v)=>setEditData({...editData, vitamins:v})} 
                            keyboardType='numeric' 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder='Cantidad' 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.albendazole')}</Text>
                          <TextInput 
                            value={editData.albendazole} 
                            onChangeText={(v)=>setEditData({...editData, albendazole:v})} 
                            keyboardType='numeric' 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder='Cantidad' 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {/* 5. HÁBITOS ACTUALES */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('habits')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Hábitos Actuales</Text>
                    <Ionicons name={open.habits? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.habits && (
                    <View>
                      {/* Tabaco Actual */}
                      <TouchableOpacity onPress={() => setEditData({...editData, tabaco_actual: !editData.tabaco_actual})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.tabaco_actual && styles.toggleActive]}>
                          {editData.tabaco_actual && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>{t('fields.tobacco')}</Text>
                      </TouchableOpacity>
                      {editData.tabaco_actual && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>{t('placeholders.tobaccoAmount')}</Text>
                          <TextInput 
                            value={editData.tabaco_actual_cantidad} 
                            onChangeText={(v) => setEditData({...editData, tabaco_actual_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder="Cantidad..." 
                            placeholderTextColor={theme.secondaryText}
                            maxLength={20}
                          />
                        </View>
                      )}

                      {/* Alcohol Actual */}
                      <TouchableOpacity onPress={() => setEditData({...editData, alcohol_actual: !editData.alcohol_actual})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.alcohol_actual && styles.toggleActive]}>
                          {editData.alcohol_actual && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>{t('fields.alcohol')}</Text>
                      </TouchableOpacity>
                      {editData.alcohol_actual && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>{t('placeholders.alcoholAmount')}</Text>
                          <TextInput 
                            value={editData.alcohol_actual_cantidad} 
                            onChangeText={(v) => setEditData({...editData, alcohol_actual_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder="Cantidad..." 
                            placeholderTextColor={theme.secondaryText}
                            maxLength={20}
                          />
                        </View>
                      )}

                      {/* Drogas Actual */}
                      <TouchableOpacity onPress={() => setEditData({...editData, drogas_actual: !editData.drogas_actual})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.drogas_actual && styles.toggleActive]}>
                          {editData.drogas_actual && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>{t('fields.drugs')}</Text>
                      </TouchableOpacity>
                      {editData.drogas_actual && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>{t('placeholders.drugsType')}</Text>
                          <TextInput 
                            value={editData.drogas_actual_cantidad} 
                            onChangeText={(v) => setEditData({...editData, drogas_actual_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder="Tipo y cantidad..." 
                            placeholderTextColor={theme.secondaryText}
                            maxLength={10}
                          />
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* 6. HÁBITOS PASADOS */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('pasthabits')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.pastHabits')}</Text>
                    <Ionicons name={open.pasthabits? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.pasthabits && (
                    <View>
                      {/* Tabaco Pasado */}
                      <TouchableOpacity onPress={() => setEditData({...editData, tabaco_pasado: !editData.tabaco_pasado})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.tabaco_pasado && styles.toggleActive]}>
                          {editData.tabaco_pasado && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>{t('fields.tobacco')}</Text>
                      </TouchableOpacity>
                      {editData.tabaco_pasado && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>{t('placeholders.tobaccoPast')}</Text>
                          <TextInput 
                            value={editData.tabaco_pasado_cantidad} 
                            onChangeText={(v) => setEditData({...editData, tabaco_pasado_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder="Ej: '10 cigarros/día durante 5 años'" 
                            placeholderTextColor={theme.secondaryText}
                            maxLength={20}
                          />
                        </View>
                      )}

                      {/* Alcohol Pasado */}
                      <TouchableOpacity onPress={() => setEditData({...editData, alcohol_pasado: !editData.alcohol_pasado})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.alcohol_pasado && styles.toggleActive]}>
                          {editData.alcohol_pasado && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>{t('fields.alcohol')}</Text>
                      </TouchableOpacity>
                      {editData.alcohol_pasado && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>{t('placeholders.alcoholPast')}</Text>
                          <TextInput 
                            value={editData.alcohol_pasado_cantidad} 
                            onChangeText={(v) => setEditData({...editData, alcohol_pasado_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder="Ej: 'Consumo social hasta 2019'" 
                            placeholderTextColor={theme.secondaryText}
                            maxLength={20}
                          />
                        </View>
                      )}

                      {/* Drogas Pasado */}
                      <TouchableOpacity onPress={() => setEditData({...editData, drogas_pasado: !editData.drogas_pasado})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.drogas_pasado && styles.toggleActive]}>
                          {editData.drogas_pasado && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>{t('fields.drugs')}</Text>
                      </TouchableOpacity>
                      {editData.drogas_pasado && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Tipo, cantidad y período</Text>
                          <TextInput 
                            value={editData.drogas_pasado_cantidad} 
                            onChangeText={(v) => setEditData({...editData, drogas_pasado_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder="Tipo, cantidad y período..." 
                            placeholderTextColor={theme.secondaryText}
                            maxLength={10}
                          />
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* BOTONES GLOBALES */}
                <View style={{flexDirection:'row', gap:12, marginTop:20}}>
                  <TouchableOpacity onPress={cancelChanges} style={[styles.actionBtn, {flex:1, backgroundColor:'#E0E0E0'}]}>
                    <Ionicons name="close-outline" size={18} color="#555" />
                    <Text style={[styles.actionBtnText, {color:'#555'}]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} style={[styles.actionBtn, {flex:1, backgroundColor:'#16A34A'}]}>
                    <Ionicons name="checkmark-outline" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Guardar Cambios</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}

        {tab==='clinico' && (
          <>
            {!editMode ? (
              // ===== VISTA DE SOLO LECTURA EXPANDIDA - CLINICAL TAB =====
              <>
                {/* 1. SALUD REPRODUCTIVA - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('reproHealth')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.reproductiveHealth')}</Text>
                    <Ionicons name={open.reproHealth? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.reproHealth && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.lmp')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.lmp_month || editData.lmp_day || editData.lmp_year 
                            ? `${editData.lmp_month || '—'}/${editData.lmp_day || '—'}/${editData.lmp_year || '—'}` 
                            : '—'}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.menopause')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.menopause ? t('common.yes') : t('common.no')}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.gravida')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.gravida || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.para')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.para || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.miscarriage')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.miscarriage || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.abortion')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.abortion || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.birthControlMethod')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.birth_control || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 2. HISTORIA CLÍNICA - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('clinHistory')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.clinicalHistory')}</Text>
                    <Ionicons name={open.clinHistory? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.clinHistory && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.hpi')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.historia_enfermedad_actual || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.pastDx')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.diagnosticos_previos || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.pastSurgeries')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.cirugias_previas || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.currentMeds')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.medicamentos_actuales || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 3. EXAMEN FÍSICO - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('physExam')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.physicalExam')}</Text>
                    <Ionicons name={open.physExam? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.physExam && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.heart')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.examen_corazon || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.lungs')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.examen_pulmones || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.abdomen')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.examen_abdomen || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.gyn')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.examen_ginecologico || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 4. EVALUACIÓN Y PLAN - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('assessPlan')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.assessment')}</Text>
                    <Ionicons name={open.assessPlan? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.assessPlan && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.impression')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.impresion || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.plan')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.plan || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.rxNotes')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.rx_notes || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 5. CONSULTAS ADICIONALES - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('furtherConsult')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.furtherConsults')}</Text>
                    <Ionicons name={open.furtherConsult? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.furtherConsult && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.consultType')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.further_consult || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.provider')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.provider || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.interpreter')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.interprete || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 6. SECCIÓN QUIRÚRGICA - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('surgical')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.surgical')}</Text>
                    <Ionicons name={open.surgical? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.surgical && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalDate')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_date || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalHistory')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_history || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalExam')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_exam || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalImpression')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_impression || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalPlan')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_plan || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalMedications')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_meds || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.generalSurgery')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_gensurg ? t('common.yes') : t('common.no')}</Text>
                      </View>
                      {editData.consult_gensurg && editData.consult_gensurg_text && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.generalSurgeryDetails')}</Text>
                          <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_gensurg_text}</Text>
                        </View>
                      )}
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.gynecology')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_gyn ? t('common.yes') : t('common.no')}</Text>
                      </View>
                      {editData.consult_gyn && editData.consult_gyn_text && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.gynecologyDetails')}</Text>
                          <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_gyn_text}</Text>
                        </View>
                      )}
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.otherConsult')}</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_other ? t('common.yes') : t('common.no')}</Text>
                      </View>
                      {editData.consult_other && editData.consult_other_text && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.otherConsultDetails')}</Text>
                          <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_other_text}</Text>
                        </View>
                      )}
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Cirujano (Surgeon)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_surgeon || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Intérprete Quirúrgico</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_interpreter || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Notas Quirúrgicas</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_notes || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Recetas Adjuntas</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.rx_slips_attached ? 'Sí' : 'No'}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </>
            ) : (
              // ===== MODO EDICIÓN - CLINICAL TAB =====
              <>
                {/* 1. SALUD REPRODUCTIVA */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('reproHealth')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Salud Reproductiva</Text>
                    <Ionicons name={open.reproHealth? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.reproHealth && (
                    <View>
                      {/* LMP - Last Menstrual Period */}
                      <Text style={[styles.label,{color:theme.secondaryText,marginBottom:8}]}>LMP (Last Menstrual Period)</Text>
                      <View style={styles.inlineEditRow}>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Mes</Text>
                          <TextInput 
                            value={editData.lmp_month} 
                            onChangeText={(v)=>setEditData({...editData, lmp_month:v.replace(/\D/g,'').slice(0,2)})} 
                            keyboardType='numeric' 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder='MM' 
                            placeholderTextColor={theme.secondaryText}
                            maxLength={2}
                          />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Día</Text>
                          <TextInput 
                            value={editData.lmp_day} 
                            onChangeText={(v)=>setEditData({...editData, lmp_day:v.replace(/\D/g,'').slice(0,2)})} 
                            keyboardType='numeric' 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder='DD' 
                            placeholderTextColor={theme.secondaryText}
                            maxLength={2}
                          />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Año</Text>
                          <TextInput 
                            value={editData.lmp_year} 
                            onChangeText={(v)=>setEditData({...editData, lmp_year:v.replace(/\D/g,'').slice(0,4)})} 
                            keyboardType='numeric' 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder='YYYY' 
                            placeholderTextColor={theme.secondaryText}
                            maxLength={4}
                          />
                        </View>
                      </View>

                      {/* Menopause */}
                      <TouchableOpacity onPress={() => setEditData({...editData, menopause: !editData.menopause})} style={{flexDirection:'row',alignItems:'center',marginBottom:12,marginTop:8}}>
                        <View style={[styles.toggle, editData.menopause && styles.toggleActive]}>
                          {editData.menopause && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Menopausia</Text>
                      </TouchableOpacity>

                      {/* Obstétricos - Grid 2x2 */}
                      <Text style={[styles.label,{color:theme.secondaryText,marginBottom:8,marginTop:8}]}>Datos Obstétricos</Text>
                      <View style={styles.inlineEditRow}>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Gravida (G)</Text>
                          <TextInput 
                            value={editData.gravida} 
                            onChangeText={(v)=>setEditData({...editData, gravida:v.replace(/\D/g,'')})} 
                            keyboardType='numeric' 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder='0' 
                            placeholderTextColor={theme.secondaryText}
                          />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Para (P)</Text>
                          <TextInput 
                            value={editData.para} 
                            onChangeText={(v)=>setEditData({...editData, para:v.replace(/\D/g,'')})} 
                            keyboardType='numeric' 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder='0' 
                            placeholderTextColor={theme.secondaryText}
                          />
                        </View>
                      </View>

                      <View style={styles.inlineEditRow}>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Abortos (Mc)</Text>
                          <TextInput 
                            value={editData.miscarriage} 
                            onChangeText={(v)=>setEditData({...editData, miscarriage:v.replace(/\D/g,'')})} 
                            keyboardType='numeric' 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder='0' 
                            placeholderTextColor={theme.secondaryText}
                          />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Abortos Provocados (Ab)</Text>
                          <TextInput 
                            value={editData.abortion} 
                            onChangeText={(v)=>setEditData({...editData, abortion:v.replace(/\D/g,'')})} 
                            keyboardType='numeric' 
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder='0' 
                            placeholderTextColor={theme.secondaryText}
                          />
                        </View>
                      </View>

                      {/* Método Anticonceptivo */}
                      <View style={{marginBottom:12,marginTop:8}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Método Anticonceptivo</Text>
                        <TextInput 
                          value={editData.birth_control} 
                          onChangeText={(v) => setEditData({...editData, birth_control:v})} 
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                          placeholder="Pastillas, DIU, ninguno, etc." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* 2. HISTORIA CLÍNICA */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('clinHistory')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.clinicalHistory')}</Text>
                    <Ionicons name={open.clinHistory? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.clinHistory && (
                    <View>
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.hpi')}</Text>
                        <CharCounterInput
                          value={editData.historia_enfermedad_actual} 
                          onChangeText={(v) => setEditData({...editData, historia_enfermedad_actual:v})} 
                          maxChars={200}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:100}]} 
                          multiline 
                          placeholder={t('placeholders.hpi')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.pastDx')}</Text>
                        <CharCounterInput
                          value={editData.diagnosticos_previos} 
                          onChangeText={(v) => setEditData({...editData, diagnosticos_previos:v})} 
                          maxChars={200}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:100}]} 
                          multiline 
                          placeholder={t('placeholders.pastDx')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.pastSurgeries')}</Text>
                        <CharCounterInput
                          value={editData.cirugias_previas} 
                          onChangeText={(v) => setEditData({...editData, cirugias_previas:v})} 
                          maxChars={200}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:100}]} 
                          multiline 
                          placeholder={t('placeholders.pastSurgeries')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.currentMeds')}</Text>
                        <CharCounterInput
                          value={editData.medicamentos_actuales} 
                          onChangeText={(v) => setEditData({...editData, medicamentos_actuales:v})} 
                          maxChars={200}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:100}]} 
                          multiline 
                          placeholder="Metformina 500mg, Losartán 50mg, etc." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* 3. EXAMEN FÍSICO */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('physExam')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Examen Físico</Text>
                    <Ionicons name={open.physExam? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.physExam && (
                    <View>
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Corazón (Heart)</Text>
                        <CharCounterInput
                          value={editData.examen_corazon} 
                          onChangeText={(v) => setEditData({...editData, examen_corazon:v})} 
                          maxChars={40}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                          placeholder="Ruidos cardíacos normales, sin soplos..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Pulmones (Lungs)</Text>
                        <CharCounterInput
                          value={editData.examen_pulmones} 
                          onChangeText={(v) => setEditData({...editData, examen_pulmones:v})} 
                          maxChars={40}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                          placeholder="Murmullo vesicular bilateral, sin estertores..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Abdomen (Abdomen)</Text>
                        <CharCounterInput
                          value={editData.examen_abdomen} 
                          onChangeText={(v) => setEditData({...editData, examen_abdomen:v})} 
                          maxChars={40}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                          placeholder="Blando, no doloroso, sin masas..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Ginecológico (GYN)</Text>
                        <CharCounterInput
                          value={editData.examen_ginecologico} 
                          onChangeText={(v) => setEditData({...editData, examen_ginecologico:v})} 
                          maxChars={40}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                          placeholder="N/A o describir hallazgos..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* 4. EVALUACIÓN Y PLAN */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('assessment')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.assessment')}</Text>
                    <Ionicons name={open.assessment? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.assessment && (
                    <View>
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.impression')}</Text>
                        <CharCounterInput
                          value={editData.impresion} 
                          onChangeText={(v) => setEditData({...editData, impresion:v})} 
                          maxChars={400}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:120}]} 
                          multiline 
                          placeholder={t('placeholders.impression')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.plan')}</Text>
                        <CharCounterInput
                          value={editData.plan} 
                          onChangeText={(v) => setEditData({...editData, plan:v})} 
                          maxChars={400}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:120}]} 
                          multiline 
                          placeholder={t('placeholders.plan')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.rxNotes')}</Text>
                        <CharCounterInput
                          value={editData.rx_notes} 
                          onChangeText={(v) => setEditData({...editData, rx_notes:v})} 
                          maxChars={200}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:100}]} 
                          multiline 
                          placeholder={t('placeholders.rxNotes')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* 5. CONSULTAS ADICIONALES */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('furtherConsult')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.furtherConsults')}</Text>
                    <Ionicons name={open.furtherConsult? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.furtherConsult && (
                    <View>
                      <Text style={[styles.label,{color:theme.secondaryText,marginBottom:8}]}>{t('fields.referTo')}:</Text>
                      
                      <TouchableOpacity onPress={() => setEditData({...editData, further_consult_gensurg: !editData.further_consult_gensurg})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.further_consult_gensurg && styles.toggleActive]}>
                          {editData.further_consult_gensurg && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Cirugía General (GenSurg)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setEditData({...editData, further_consult_gyn: !editData.further_consult_gyn})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.further_consult_gyn && styles.toggleActive]}>
                          {editData.further_consult_gyn && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Ginecología (GYN)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setEditData({...editData, further_consult_other: !editData.further_consult_other})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.further_consult_other && styles.toggleActive]}>
                          {editData.further_consult_other && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Otro</Text>
                      </TouchableOpacity>

                      {editData.further_consult_other && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Especificar otro</Text>
                          <TextInput 
                            value={editData.further_consult_other_text} 
                            onChangeText={(v) => setEditData({...editData, further_consult_other_text:v})} 
                            maxLength={35}
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder="Cardiología, Neurología, etc." 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}

                      <View style={{marginBottom:12,marginTop:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.provider')}</Text>
                        <TextInput 
                          value={editData.provider} 
                          onChangeText={(v) => setEditData({...editData, provider:v})} 
                          maxLength={35}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                          placeholder={t('placeholders.provider')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.interpreter')}</Text>
                        <TextInput 
                          value={editData.interprete} 
                          onChangeText={(v) => setEditData({...editData, interprete:v})} 
                          maxLength={35}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                          placeholder={t('placeholders.interpreter')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* 6. SURGICAL CONSULTATION (FASE 4) */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('surgical')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>{t('sections.surgical')}</Text>
                    <Ionicons name={open.surgical? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.surgical && (
                    <View>
                      {/* Surgical Date */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalDate')}</Text>
                        <TextInput 
                          value={editData.surgical_date} 
                          onChangeText={(v) => setEditData({...editData, surgical_date:v})} 
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                          placeholder="DD/MM/YYYY" 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Surgical History */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalHistory')}</Text>
                        <CharCounterInput 
                          value={editData.surgical_history} 
                          onChangeText={(v) => setEditData({...editData, surgical_history:v})} 
                          maxChars={200}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:100}]} 
                          placeholder={t('placeholders.surgicalHistory')}
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                        />
                      </View>

                      {/* Surgical Exam */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalExam')}</Text>
                        <CharCounterInput 
                          value={editData.surgical_exam} 
                          onChangeText={(v) => setEditData({...editData, surgical_exam:v})} 
                          maxChars={200}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:100}]} 
                          placeholder={t('placeholders.surgicalExam')}
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                        />
                      </View>

                      {/* Surgical Impression */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalImpression')}</Text>
                        <CharCounterInput 
                          value={editData.surgical_impression} 
                          onChangeText={(v) => setEditData({...editData, surgical_impression:v})} 
                          maxChars={180}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:100}]} 
                          placeholder={t('placeholders.surgicalImpression')}
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                        />
                      </View>

                      {/* Surgical Plan */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalPlan')}</Text>
                        <CharCounterInput 
                          value={editData.surgical_plan} 
                          onChangeText={(v) => setEditData({...editData, surgical_plan:v})} 
                          maxChars={200}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:100}]} 
                          placeholder={t('placeholders.surgicalPlan')}
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                        />
                      </View>

                      {/* Surgical Medications */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalMeds')}</Text>
                        <CharCounterInput 
                          value={editData.surgical_meds} 
                          onChangeText={(v) => setEditData({...editData, surgical_meds:v})} 
                          maxChars={300}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:100}]} 
                          placeholder={t('placeholders.surgicalMeds')}
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                        />
                      </View>

                      {/* Surgical Consult Checkboxes */}
                      <Text style={[styles.label,{color:theme.secondaryText,marginBottom:8,marginTop:12}]}>{t('fields.referTo')}:</Text>
                      
                      <TouchableOpacity onPress={() => setEditData({...editData, surgical_consult_gensurg: !editData.surgical_consult_gensurg})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.surgical_consult_gensurg && styles.toggleActive]}>
                          {editData.surgical_consult_gensurg && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>{t('fields.generalSurgeryShort')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setEditData({...editData, surgical_consult_gyn: !editData.surgical_consult_gyn})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.surgical_consult_gyn && styles.toggleActive]}>
                          {editData.surgical_consult_gyn && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>{t('fields.gynecologyShort')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setEditData({...editData, surgical_consult_other: !editData.surgical_consult_other})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.surgical_consult_other && styles.toggleActive]}>
                          {editData.surgical_consult_other && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>{t('common.other')}</Text>
                      </TouchableOpacity>

                      {editData.surgical_consult_other && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>{t('common.specify')} {t('common.other').toLowerCase()}</Text>
                          <TextInput 
                            value={editData.surgical_consult_other_text} 
                            onChangeText={(v) => setEditData({...editData, surgical_consult_other_text:v})} 
                            maxLength={30}
                            style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                            placeholder={t('placeholders.otherConsultSpecify')}
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}

                      {/* Surgeon */}
                      <View style={{marginBottom:12,marginTop:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgeon')}</Text>
                        <TextInput 
                          value={editData.surgical_surgeon} 
                          onChangeText={(v) => setEditData({...editData, surgical_surgeon:v})} 
                          maxLength={35}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                          placeholder={t('placeholders.surgeon')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Surgical Interpreter */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalInterpreter')}</Text>
                        <TextInput 
                          value={editData.surgical_interpreter} 
                          onChangeText={(v) => setEditData({...editData, surgical_interpreter:v})} 
                          maxLength={35}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8}]} 
                          placeholder={t('placeholders.interpreter')}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Surgical Notes */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>{t('fields.surgicalNotes')}</Text>
                        <CharCounterInput 
                          value={editData.surgical_notes} 
                          onChangeText={(v) => setEditData({...editData, surgical_notes:v})} 
                          maxChars={2000}
                          style={[styles.editInput,{color:theme.text, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 8, minHeight:120}]} 
                          placeholder="Notas adicionales sobre la consulta quirúrgica..." 
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                        />
                      </View>

                      {/* Rx Slips Attached */}
                      <TouchableOpacity onPress={() => setEditData({...editData, rx_slips_attached: !editData.rx_slips_attached})} style={{flexDirection:'row',alignItems:'center',marginTop:8}}>
                        <View style={[styles.toggle, editData.rx_slips_attached && styles.toggleActive]}>
                          {editData.rx_slips_attached && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Recetas adjuntas</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* BOTONES GLOBALES */}
                <View style={{flexDirection:'row', gap:12, marginTop:20}}>
                  <TouchableOpacity onPress={cancelChanges} style={[styles.actionBtn, {flex:1, backgroundColor:'#E0E0E0'}]}>
                    <Ionicons name="close-outline" size={18} color="#555" />
                    <Text style={[styles.actionBtnText, {color:'#555'}]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} style={[styles.actionBtn, {flex:1, backgroundColor:'#16A34A'}]}>
                    <Ionicons name="checkmark-outline" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Guardar Cambios</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}

        {tab==='pagina1' && (
          <View style={{paddingVertical:4}}>
            <View style={{flexDirection:'row', alignItems:'center', marginBottom:14}}>
              <Text style={{fontSize:18,fontWeight:'900',color:theme.text,flex:1}}>{t('c1.title')}</Text>
              {(isSimulated1) && <View style={{backgroundColor:'#F59E0B',paddingHorizontal:10,paddingVertical:4,borderRadius:12}}><Text style={{color:'#fff',fontSize:10,fontWeight:'800'}}>{t('badges.simulated')}</Text></View>}
            </View>

            <Text style={[styles.groupHeader,{color:theme.text}]}>{t('c1.basic')}</Text>
            <View style={{flexDirection:'row', columnGap:18}}>
              <View style={{flex:1}}>
                <UnderlineInput label={t('c1.date')} value={consult1.date} onChange={v=>setConsult1(c=>({...c,date:v}))} />
                <UnderlineInput label={t('c1.patientName')} value={consult1.patientName} onChange={v=>setConsult1(c=>({...c,patientName:v}))} />
                <UnderlineInput label={t('c1.town')} value={consult1.town} onChange={v=>setConsult1(c=>({...c,town:v}))} />
              </View>
              <View style={{flex:1}}>
                <View style={{marginBottom:14}}>
                  <Text style={[stylesCx.label,{color:theme.secondaryText}]}>{t('c1.consultType.title')}</Text>
                  <View style={stylesCx.inlineWrap}>
                    <Check label={t('c1.consultType.diabetes')} checked={consult1.consultType.diabetes} onChange={()=>setConsult1(c=>({...c,consultType:{...c.consultType,diabetes:!c.consultType.diabetes}}))} />
                    <Check label={t('c1.consultType.htn')} checked={consult1.consultType.htn} onChange={()=>setConsult1(c=>({...c,consultType:{...c.consultType,htn:!c.consultType.htn}}))} />
                    <Check label={t('c1.consultType.respiratory')} checked={consult1.consultType.respiratory} onChange={()=>setConsult1(c=>({...c,consultType:{...c.consultType,respiratory:!c.consultType.respiratory}}))} />
                  </View>
                  <View style={{flexDirection:'row',alignItems:'center',marginTop:6}}>
                    <Check label={t('common.other')} checked={consult1.consultType.other} onChange={()=>setConsult1(c=>({...c,consultType:{...c.consultType,other:!c.consultType.other}}))} />
                    {consult1.consultType.other && (
                      <TextInput
                        placeholder={t('common.specify')}
                        value={consult1.consultType.otherText}
                        onChangeText={tval=>setConsult1(c=>({...c,consultType:{...c.consultType,otherText:tval}}))}
                        style={[stylesCx.underInput,{flex:1, marginLeft:8, color:theme.text, borderBottomColor:theme.secondaryText}]}
                        placeholderTextColor={theme.secondaryText}
                      />
                    )}
                  </View>
                </View>
                <UnderlineInput label={t('c1.cc')} value={consult1.chiefComplaint} onChange={v=>setConsult1(c=>({...c,chiefComplaint:v}))} long />
                <UnderlineInput label={t('c1.language')} value={consult1.language} onChange={v=>setConsult1(c=>({...c,language:v}))} />
                <UnderlineInput label={t('c1.phone')} value={consult1.phone} onChange={v=>setConsult1(c=>({...c,phone:v}))} />
                <View style={{flexDirection:'row', alignItems:'flex-end'}}>
                  <View style={{flex:1}}><UnderlineInput label={t('c1.dobAge')} value={consult1.dobOrAge} onChange={v=>setConsult1(c=>({...c,dobOrAge:v}))} /></View>
                  <View style={{marginLeft:12}}>
                    <Text style={[stylesCx.label,{color:theme.secondaryText, marginBottom:4}]}>{t('c1.gender')}</Text>
                    <RadioGroup options={['M','F']} value={consult1.gender} onChange={v=>setConsult1(c=>({...c,gender:v}))} />
                  </View>
                </View>
              </View>
            </View>

            <Text style={[styles.groupHeader,{color:theme.text}]}>{t('c1.vitals.title')}</Text>
            <View style={stylesCx.sectionSep} />
            <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c1.vitals.subtitle')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10}} contentContainerStyle={{paddingRight:20}}>
              <Vital label={t('c1.vitals.bp')} dual value1={consult1.vitals.bpSys} value2={consult1.vitals.bpDia} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,bpSys:v}}))} onChange2={v=>setConsult1(c=>({...c,vitals:{...c.vitals,bpDia:v}}))} />
              <Vital label={t('c1.vitals.hr')} value1={consult1.vitals.hr} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,hr:v}}))} />
              <Vital label={t('c1.vitals.spo2')} value1={consult1.vitals.spo2} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,spo2:v}}))} />
              <Vital label={t('c1.vitals.bs')} value1={consult1.vitals.bs} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,bs:v}}))} />
              <Vital label={t('c1.vitals.weight')} value1={consult1.vitals.weight} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,weight:v}}))} />
              <Vital label={t('c1.vitals.height')} value1={consult1.vitals.height} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,height:v}}))} />
              <Vital label={t('c1.vitals.temp')} value1={consult1.vitals.temp} onChange1={v=>setConsult1(c=>({...c,vitals:{...c.vitals,temp:v}}))} />
            </ScrollView>

            <Text style={[styles.groupHeader,{color:theme.text, marginTop:8}]}>{t('c1.fast.title')}</Text>
            <Row>
              <Col flex={1}><RadioLabeled label={t('c1.fast.takenMed')} value={consult1.takenMed1} onChange={v=>setConsult1(c=>({...c,takenMed1:v}))} /></Col>
              <Col flex={1}><RadioLabeled label={t('c1.fast.fasting')} value={consult1.fasting} onChange={v=>setConsult1(c=>({...c,fasting:v}))} /></Col>
              <Col flex={1}><RadioLabeled label={t('c1.fast.takenMed')} value={consult1.takenMed2} onChange={v=>setConsult1(c=>({...c,takenMed2:v}))} /></Col>
            </Row>

            <Text style={[styles.groupHeader,{color:theme.text, marginTop:8}]}>{t('c1.all.title')}</Text>
            <View style={{marginTop:14}}>
              <Text style={[stylesCx.label,{color:theme.secondaryText}]}>{t('c1.all.subtitle')}</Text>
              <View style={{flexDirection:'row', alignItems:'center', flexWrap:'wrap'}}>
                <Check label={t('c1.all.nka')} checked={consult1.allergies.nka} onChange={()=>setConsult1(c=>({...c,allergies:{...c.allergies,nka:!c.allergies.nka}}))} />
                {!consult1.allergies.nka && (
                  <TextInput
                    placeholder={t('c1.all.listPlaceholder')}
                    value={consult1.allergies.list}
                    onChangeText={tv=>setConsult1(c=>({...c,allergies:{...c.allergies,list:tv}}))}
                    style={[stylesCx.underInput,{flex:1,marginLeft:10,color:theme.text,borderBottomColor:theme.secondaryText}]}
                    placeholderTextColor={theme.secondaryText}
                  />
                )}
                <Text style={[stylesCx.smallLabel,{color:theme.secondaryText,marginLeft:14}]}>{t('c1.all.vit')}</Text>
                <TextInput value={consult1.vitaminPkts} onChangeText={tv=>setConsult1(c=>({...c,vitaminPkts:tv}))} style={[stylesCx.underMini,{color:theme.text}]} placeholder="0" placeholderTextColor={theme.secondaryText} />
                <Text style={[stylesCx.smallLabel,{color:theme.secondaryText,marginLeft:14}]}>{t('c1.all.alb')}</Text>
                <TextInput value={consult1.albendazoleTabs} onChangeText={tv=>setConsult1(c=>({...c,albendazoleTabs:tv}))} style={[stylesCx.underMini,{color:theme.text}]} placeholder="0" placeholderTextColor={theme.secondaryText} />
              </View>
            </View>

            <HabitsBlock title={t('c1.hab.current')} data={consult1.current} onChange={(d)=>setConsult1(c=>({...c,current:d}))} theme={theme} />
            <HabitsBlock title={t('c1.hab.past')} data={consult1.past} onChange={(d)=>setConsult1(c=>({...c,past:d}))} theme={theme} />

            <View style={{marginTop:16}}>
              <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c1.repro.title')}</Text>
              <Row>
                <Col flex={2}>
                  <Text style={[stylesCx.label,{color:theme.secondaryText}]}>{t('c1.repro.lmp')}</Text>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    {['d','m','y'].map(k=> (
                      <TextInput key={k} value={consult1.lmp[k]} onChangeText={v=>setConsult1(c=>({...c,lmp:{...c.lmp,[k]:v}}))} placeholder={k.toUpperCase()} placeholderTextColor={theme.secondaryText}
                        style={[stylesCx.underMini,{width: k==='y'?64:34, marginRight:8,color:theme.text}]} />
                    ))}
                    <Check label={t('c1.repro.menopause')} checked={consult1.menopause} onChange={()=>setConsult1(c=>({...c,menopause:!c.menopause}))} />
                  </View>
                </Col>
                <Col flex={3}>
                  <Text style={[stylesCx.label,{color:theme.secondaryText}]}>{t('c1.repro.obstetric')}</Text>
                  <View style={{flexDirection:'row',flexWrap:'wrap',alignItems:'center'}}>
                    {['G','P','Mc','Ab'].map(k=> (
                      <View key={k} style={{flexDirection:'row',alignItems:'center',marginRight:12}}>
                        <Text style={[stylesCx.smallLabel,{color:theme.secondaryText}]}>{'#'+k}</Text>
                        <TextInput value={consult1.obstetric[k]} onChangeText={v=>setConsult1(c=>({...c,obstetric:{...c.obstetric,[k]:v}}))}
                          style={[stylesCx.underMini,{width:40,marginLeft:4,color:theme.text}]} placeholder="" placeholderTextColor={theme.secondaryText} />
                      </View>
                    ))}
                  </View>
                </Col>
                <Col flex={2}>
                  <RadioLabeled label={t('c1.repro.controlQ')} value={consult1.birthControl.control} onChange={v=>setConsult1(c=>({...c,birthControl:{...c.birthControl,control:v}}))} />
                  {consult1.birthControl.control==='Y' && (
                    <UnderlineInput label={t('c1.repro.methodQ')} value={consult1.birthControl.method} onChange={v=>setConsult1(c=>({...c,birthControl:{...c.birthControl,method:v}}))} />
                  )}
                </Col>
              </Row>
            </View>

            <Multiline label={t('c1.hpi')} value={consult1.historyPresentIllness} onChange={v=>setConsult1(c=>({...c,historyPresentIllness:v}))} theme={theme} />
            <View style={{marginTop:16}}>
              <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c1.pmh.title')}</Text>
              <UnderlineInput label={t('c1.pmh.medDx')} value={consult1.medicalDx} onChange={v=>setConsult1(c=>({...c,medicalDx:v}))} />
              <UnderlineInput label={t('c1.pmh.surgery')} value={consult1.surgery} onChange={v=>setConsult1(c=>({...c,surgery:v}))} />
              <UnderlineInput label={t('c1.pmh.meds')} value={consult1.meds} onChange={v=>setConsult1(c=>({...c,meds:v}))} />
            </View>

            <View style={{marginTop:16}}>
              <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c1.pe.title')}</Text>
              <UnderlineInput label={t('c1.pe.heart')} value={consult1.physicalExam.heart} onChange={v=>setConsult1(c=>({...c,physicalExam:{...c.physicalExam,heart:v}}))} />
              <UnderlineInput label={t('c1.pe.lungs')} value={consult1.physicalExam.lungs} onChange={v=>setConsult1(c=>({...c,physicalExam:{...c.physicalExam,lungs:v}}))} />
              <UnderlineInput label={t('c1.pe.abdomen')} value={consult1.physicalExam.abdomen} onChange={v=>setConsult1(c=>({...c,physicalExam:{...c.physicalExam,abdomen:v}}))} />
              <UnderlineInput label={t('c1.pe.gyn')} value={consult1.physicalExam.gyn} onChange={v=>setConsult1(c=>({...c,physicalExam:{...c.physicalExam,gyn:v}}))} />
            </View>

            <Multiline label={t('c1.impression')} value={consult1.impression} onChange={v=>setConsult1(c=>({...c,impression:v}))} theme={theme} />
            <Multiline label={t('c1.plan')} value={consult1.plan} onChange={v=>setConsult1(c=>({...c,plan:v}))} theme={theme} />
            <Text style={{marginTop:8,fontSize:12,color:theme.secondaryText,fontStyle:'italic'}}>{t('c1.rxNote')}</Text>

            <View style={{marginTop:16}}>
              <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c1.further.title')}</Text>
              <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap'}}>
                <Check label={t('c1.further.genSurg')} checked={consult1.further.genSurg} onChange={()=>setConsult1(c=>({...c,further:{...c.further,genSurg:!c.further.genSurg}}))} />
                <Check label={t('c1.further.gyn')} checked={consult1.further.gyn} onChange={()=>setConsult1(c=>({...c,further:{...c.further,gyn:!c.further.gyn}}))} />
                <Check label={t('common.other')} checked={consult1.further.other} onChange={()=>setConsult1(c=>({...c,further:{...c.further,other:!c.further.other}}))} />
                {consult1.further.other && <TextInput value={consult1.further.otherText} onChangeText={tv=>setConsult1(c=>({...c,further:{...c.further,otherText:tv}}))} placeholder={t('common.specify')} placeholderTextColor={theme.secondaryText} style={[stylesCx.underInput,{flex:1,marginLeft:8,color:theme.text}]} />}
              </View>
              <UnderlineInput label={t('c1.provider')} value={consult1.provider} onChange={v=>setConsult1(c=>({...c,provider:v}))} />
              <UnderlineInput label={t('c1.interpreter')} value={consult1.interpreter} onChange={v=>setConsult1(c=>({...c,interpreter:v}))} />
            </View>
            <Text style={{marginTop:24,textAlign:'center',fontSize:11,color:theme.secondaryText,fontWeight:'700'}}>{t('c1.reverseNote')}</Text>
          </View>
        )}

        {tab==='pagina2' && (
          <View style={{paddingVertical:4}}>
            <View style={{flexDirection:'row', alignItems:'center', marginBottom:14}}>
              <Text style={{fontSize:18,fontWeight:'900',color:theme.text,flex:1}}>{t('c2.title')}</Text>
              {(isSimulated2) && <View style={{backgroundColor:'#F59E0B',paddingHorizontal:10,paddingVertical:4,borderRadius:12}}><Text style={{color:'#fff',fontSize:10,fontWeight:'800'}}>{t('badges.simulated')}</Text></View>}
            </View>

            <Text style={[styles.groupHeader,{color:theme.text}]}>{t('c2.general')}</Text>
            <UnderlineInput label={t('c2.date')} value={consult2.date} onChange={v=>setConsult2(c=>({...c,date:v}))} />
            <Multiline label={t('c2.hpi')} value={consult2.historyPresentIllness} onChange={v=>setConsult2(c=>({...c,historyPresentIllness:v}))} theme={theme} />

            <Text style={[styles.groupHeader,{color:theme.text, marginTop:8}]}>{t('c2.exam')}</Text>
            <Text style={[stylesCx.subHeader,{color:theme.text,marginTop:16}]}>{t('c2.examSub')}</Text>
            <Multiline label="" value={consult2.physicalExam} onChange={v=>setConsult2(c=>({...c,physicalExam:v}))} theme={theme} placeholder={t('common.freeText')} />

            <Text style={[styles.groupHeader,{color:theme.text, marginTop:8}]}>{t('c2.assessment')}</Text>
            <Multiline label={t('c2.impression')} value={consult2.impression} onChange={v=>setConsult2(c=>({...c,impression:v}))} theme={theme} />
            <Multiline label={t('c2.plan')} value={consult2.plan} onChange={v=>setConsult2(c=>({...c,plan:v}))} theme={theme} />
            <UnderlineInput label={t('c2.medsrx')} value={consult2.medsRx} onChange={v=>setConsult2(c=>({...c,medsRx:v}))} />

            <Text style={[styles.groupHeader,{color:theme.text, marginTop:8}]}>{t('c2.refs')}</Text>
            <View style={{marginTop:16}}>
              <Text style={[stylesCx.subHeader,{color:theme.text}]}>{t('c2.furtherTitle')}</Text>
              <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap'}}>
                <Check label={t('c1.further.genSurg')} checked={consult2.further.genSurg} onChange={()=>setConsult2(c=>({...c,further:{...c.further,genSurg:!c.further.genSurg}}))} />
                <Check label={t('c1.further.gyn')} checked={consult2.further.gyn} onChange={()=>setConsult2(c=>({...c,further:{...c.further,gyn:!c.further.gyn}}))} />
                <Check label={t('common.other')} checked={consult2.further.other} onChange={()=>setConsult2(c=>({...c,further:{...c.further,other:!c.further.other}}))} />
                {consult2.further.other && <TextInput value={consult2.further.otherText} onChangeText={tv=>setConsult2(c=>({...c,further:{...c.further,otherText:tv}}))} placeholder={t('common.specify')} placeholderTextColor={theme.secondaryText} style={[stylesCx.underInput,{flex:1,marginLeft:8,color:theme.text}]} />}
              </View>
              <View style={{flexDirection:'row', columnGap:16, marginTop:14}}>
                <View style={{flex:1}}><UnderlineInput label={t('c2.surgeon')} value={consult2.surgeon} onChange={v=>setConsult2(c=>({...c,surgeon:v}))} /></View>
                <View style={{flex:1}}><UnderlineInput label={t('c1.interpreter')} value={consult2.interpreter} onChange={v=>setConsult2(c=>({...c,interpreter:v}))} /></View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  header:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop:14, paddingBottom:10 },
  title:{ fontSize:20, fontWeight:'800', maxWidth:200 },
  subtitle:{ fontSize:12, fontWeight:'600' },
  actionBar:{ paddingHorizontal:16, paddingVertical:8 },
  severityChip:{ paddingHorizontal:10, paddingVertical:6, borderRadius:20 },
  severityTxt:{ color:'#fff', fontWeight:'800', fontSize:12, textTransform:'uppercase' },
  actionCircleBtn:{ 
    width:36, 
    height:36, 
    borderRadius:18, 
    alignItems:'center', 
    justifyContent:'center',
    shadowColor:'#000',
    shadowOpacity:0.15,
    shadowRadius:4,
    shadowOffset:{width:0,height:2},
    elevation:3
  },
  reclassifyBtn:{ 
    width:32, 
    height:32, 
    borderRadius:16, 
    alignItems:'center', 
    justifyContent:'center',
    shadowColor:'#000',
    shadowOpacity:0.1,
    shadowRadius:4,
    shadowOffset:{width:0,height:2},
    elevation:2
  },
  readOnlyRow:{ marginBottom:12, paddingBottom:8, borderBottomWidth:1, borderBottomColor:'#F3F4F6' },
  readOnlyValue:{ fontSize:14, fontWeight:'500', marginTop:4 },
  tabsRow:{ flexDirection:'row', paddingHorizontal:16, columnGap:10, marginTop:8, marginBottom:4 },
  tabBtn:{ paddingHorizontal:16, paddingVertical:8, borderRadius:20, backgroundColor:'#E5E7EB' },
  tabBtnActive:{ backgroundColor:'#2D60C8' },
  tabTxt:{ fontSize:13, fontWeight:'700', color:'#374151' },
  tabTxtActive:{ color:'#fff' },
  section:{ borderWidth:1, borderRadius:14, padding:14, marginBottom:14 },
  sectionHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  sectionTitle:{ fontSize:14, fontWeight:'800', color:'#6B7280', textTransform:'uppercase' },
  row:{ marginBottom:8 },
  label:{ fontSize:12, fontWeight:'600', marginBottom:2 },
  value:{ fontSize:14, fontWeight:'500' },
  center:{ flex:1, alignItems:'center', justifyContent:'center' },
  severityEditBar:{ flexDirection:'row', flexWrap:'wrap', columnGap:8, rowGap:8, paddingHorizontal:16, marginBottom:4 },
  sevOpt:{ paddingHorizontal:12, paddingVertical:6, backgroundColor:'#E5E7EB', borderRadius:16 },
  sevOptActive:{ backgroundColor:'#2D60C8' },
  sevOptTxt:{ fontSize:12, fontWeight:'700', color:'#374151' },
  sevOptTxtActive:{ color:'#fff' },
  saveBtn:{ paddingHorizontal:16, paddingVertical:8, backgroundColor:'#16A34A', borderRadius:18 },
  saveBtnTxt:{ color:'#fff', fontWeight:'800', fontSize:12 },
  inlineEditRow:{ flexDirection:'row', columnGap:14, marginBottom:12 },
  editField:{ flex:1 },
  editInput:{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:10, paddingHorizontal:10, paddingVertical:6, marginTop:4 },
  radio:{ width:20, height:20, borderRadius:10, borderWidth:2, borderColor:'#E5E7EB', backgroundColor:'#FFF' },
  radioActive:{ backgroundColor:'#2D60C8', borderColor:'#2D60C8' },
  toggle:{ width:24, height:24, borderRadius:4, borderWidth:2, borderColor:'#E5E7EB', backgroundColor:'#FFF', alignItems:'center', justifyContent:'center' },
  toggleActive:{ backgroundColor:'#2D60C8', borderColor:'#2D60C8' },
  actionsContainer:{ flexDirection:'row', paddingHorizontal:16, marginBottom:8, gap:10 },
  actionBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:10, paddingHorizontal:12, borderRadius:12, columnGap:6 },
  exportBtn:{ backgroundColor:'#F08C21' },
  imagesBtn:{ backgroundColor:'#6698CC' },
  actionBtnText:{ color:'#fff', fontWeight:'700', fontSize:13 },
  
  // Estilos del modal de severidad
  modalOverlay:{ 
    position:'absolute', 
    top:0, 
    left:0, 
    right:0, 
    bottom:0, 
    backgroundColor:'rgba(0,0,0,0.5)', 
    justifyContent:'center', 
    alignItems:'center', 
    zIndex:9999 
  },
  modalContent:{ 
    backgroundColor:'#FFFFFF', 
    borderRadius:12, 
    padding:24, 
    width:'85%', 
    maxWidth:400, 
    shadowColor:'#000', 
    shadowOpacity:0.25, 
    shadowRadius:4, 
    elevation:5 
  },
  modalTitle:{ 
    fontSize:20, 
    fontWeight:'700', 
    color:'#1B1B1B', 
    marginBottom:8, 
    textAlign:'center' 
  },
  modalSubtitle:{ 
    fontSize:14, 
    color:'#687076', 
    marginBottom:20, 
    textAlign:'center' 
  },
  severityButtons:{ gap:10 },
  severityButton:{ 
    paddingVertical:14, 
    paddingHorizontal:20, 
    borderRadius:8, 
    borderWidth:2, 
    borderColor:'#E9E2C6', 
    backgroundColor:'#FFFFFF', 
    alignItems:'center' 
  },
  severityButtonActive:{ 
    borderColor:'#F08C21', 
    backgroundColor:'#FFF7DA' 
  },
  severityButtonText:{ 
    fontSize:16, 
    fontWeight:'600', 
    color:'#687076' 
  },
  severityButtonTextActive:{ 
    color:'#F08C21' 
  },
  modalCancelButton:{ 
    marginTop:16, 
    paddingVertical:12, 
    alignItems:'center' 
  },
  modalCancelText:{ 
    fontSize:15, 
    color:'#687076', 
    fontWeight:'600' 
  },
  changeSeverityButton:{ 
    flexDirection:'row', 
    alignItems:'center', 
    marginLeft:12, 
    paddingVertical:6, 
    paddingHorizontal:12, 
    borderRadius:6, 
    borderWidth:1, 
    borderColor:'#F08C21' 
  },
  changeSeverityText:{ 
    marginLeft:4, 
    fontSize:13, 
    color:'#F08C21', 
    fontWeight:'600' 
  }
});

styles.groupHeader = {
  fontSize:12,
  fontWeight:'800',
  marginTop:16,
  marginBottom:6,
  letterSpacing:0.5,
  textTransform:'uppercase'
};

// ---- Subcomponentes (sin cambios de estilos) ----
const stylesCx = StyleSheet.create({
  label:{ fontSize:11, fontWeight:'700', textTransform:'uppercase', letterSpacing:0.5 },
  underInput:{ borderBottomWidth:1, borderColor:'#B0B5BC', paddingVertical:4, fontSize:13, minWidth:60 },
  underMini:{ borderBottomWidth:1, borderColor:'#B0B5BC', paddingVertical:2, fontSize:12, textAlign:'center' },
  inlineWrap:{ flexDirection:'row', flexWrap:'wrap', columnGap:16, rowGap:8, marginTop:6 },
  subHeader:{ fontSize:14, fontWeight:'800', marginTop:18, marginBottom:8 },
  smallLabel:{ fontSize:11, fontWeight:'700' },
  chip:{ paddingHorizontal:10, paddingVertical:4, borderRadius:14, backgroundColor:'#E5E7EB' },
  sectionSep:{ height:1, backgroundColor:'#E5E7EB', marginVertical:16 }
});

function UnderlineInput({ label, value, onChange, long, placeholder }) {
  return (
    <View style={{marginBottom:14}}>
      {label? <Text style={[stylesCx.label,{marginBottom:4,color:'#6B7280'}]}>{label}</Text>: null}
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder||label} placeholderTextColor="#9CA3AF"
        style={[stylesCx.underInput, long && {width:'100%' , minHeight:34}]} />
    </View>
  );
}
function Vital({ label, dual, value1, value2, onChange1, onChange2 }) {
  return (
    <View style={{marginRight:16}}>
      <Text style={{fontSize:11,fontWeight:'700',color:'#6B7280',marginBottom:4}}>{label}</Text>
      <View style={{flexDirection:'row', alignItems:'center'}}>
        <TextInput value={value1} onChangeText={onChange1} keyboardType='numeric' style={[stylesCx.underMini,{width:48, marginRight: dual?4:0}]} />
        {dual && <><Text style={{marginHorizontal:2}}>/</Text><TextInput value={value2} onChangeText={onChange2} keyboardType='numeric' style={[stylesCx.underMini,{width:48}]} /></>}
      </View>
    </View>
  );
}
function RadioGroup({ options, value, onChange }) {
  return (
    <View style={{flexDirection:'row',alignItems:'center'}}>
      {options.map(opt => (
        <TouchableOpacity key={opt} onPress={()=>onChange(opt)} style={{flexDirection:'row',alignItems:'center',marginRight:12}}>
          <View style={{width:16,height:16,borderRadius:8,borderWidth:2,borderColor:value===opt?'#2D60C8':'#9CA3AF',alignItems:'center',justifyContent:'center'}}>
            {value===opt && <View style={{width:8,height:8,borderRadius:4,backgroundColor:'#2D60C8'}} />}
          </View>
          <Text style={{marginLeft:4,fontSize:12,fontWeight:'700'}}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
function RadioLabeled({ label, value, onChange }) {
  return (
    <View style={{marginBottom:12}}>
      <Text style={[stylesCx.label,{color:'#6B7280',marginBottom:4}]}>{label}</Text>
      <RadioGroup options={['N','Y']} value={value||''} onChange={onChange} />
    </View>
  );
}
function Check({ label, checked, onChange }) {
  return (
    <TouchableOpacity onPress={onChange} style={{flexDirection:'row',alignItems:'center',marginRight:14, marginBottom:6}}>
      <View style={{width:18,height:18,borderWidth:2,borderColor:checked?'#2D60C8':'#9CA3AF',backgroundColor:checked?'#2D60C8':'transparent',borderRadius:4,alignItems:'center',justifyContent:'center'}}>
        {checked && <Ionicons name='check' size={12} color='#fff' />}
      </View>
      <Text style={{marginLeft:6,fontSize:12,fontWeight:'700'}}>{label}</Text>
    </TouchableOpacity>
  );
}
function HabitsBlock({ title, data, onChange, theme }) {
  const render = (k,label) => (
    <View key={k} style={{flexDirection:'row',alignItems:'center',marginRight:16,marginBottom:6}}>
      <Text style={{fontSize:11,fontWeight:'700',color:theme.secondaryText,marginRight:4}}>{label}?</Text>
      <RadioGroup options={['N','Y']} value={data[k].use? 'Y':'N'} onChange={v=>onChange({...data,[k]:{...data[k],use:v==='Y'}})} />
      {data[k].use && <TextInput value={data[k].count} onChangeText={t=>onChange({...data,[k]:{...data[k],count:t}})} placeholder='#' placeholderTextColor={theme.secondaryText} style={[stylesCx.underMini,{width:48,marginLeft:4,color:theme.text}]} />}
    </View>
  );
  return (
    <View style={{marginTop:16}}>
      <Text style={[stylesCx.subHeader,{color:theme.text}]}>{title} {t('c1.hab.titleSuffix')}</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap'}}>
        {render('tobacco',t('c1.hab.tobacco'))}
        {render('alcohol',t('c1.hab.alcohol'))}
        {render('drugs',t('c1.hab.drugs'))}
      </View>
    </View>
  );
}
function Multiline({ label, value, onChange, theme, placeholder }) {
  return (
    <View style={{marginTop:16}}>
      {label ? <Text style={[stylesCx.label,{color:theme.secondaryText,marginBottom:4}]}>{label}</Text>:null}
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder||label} placeholderTextColor={theme.secondaryText}
        multiline style={{minHeight:90,borderWidth:1,borderColor:'#E5E7EB',borderRadius:12,padding:10,fontSize:13,color:theme.text,textAlignVertical:'top'}} />
    </View>
  );
}
function Row({ children }) { return <View style={{flexDirection:'row', columnGap:16, flexWrap:'wrap'}}>{children}</View>; }
function Col({ children, flex }) { return <View style={{flex:flex||1}}>{children}</View>; }
