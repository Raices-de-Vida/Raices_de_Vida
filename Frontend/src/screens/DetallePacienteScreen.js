
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import OfflineStorage from '../services/OfflineStorage';
import ConnectivityService from '../services/ConnectivityService';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';
import { useTranslation } from 'react-i18next';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DetallePacienteScreen({ route, navigation }) {
  const { paciente } = route.params || {};
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const { t } = useTranslation('DetallePaciente');

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
  const [localPeso, setLocalPeso] = useState(paciente.peso_kg?.toString()||'');
  const [localAltura, setLocalAltura] = useState(paciente.altura_cm?.toString()||'');
  const [localSeverity, setLocalSeverity] = useState(paciente._flagWorst || '');
  const [calcIMC, setCalcIMC] = useState(null);

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
    
    // Signos Vitales
    presion_sistolica: paciente.presion_sistolica?.toString() || '',
    presion_diastolica: paciente.presion_diastolica?.toString() || '',
    frecuencia_cardiaca: paciente.frecuencia_cardiaca?.toString() || '',
    saturacion_oxigeno: paciente.saturacion_oxigeno?.toString() || '',
    glucosa: paciente.glucosa?.toString() || '',
    temperatura: paciente.temperatura?.toString() || '',
    peso_kg: localPeso,
    altura_cm: localAltura,
    
    // Tipo de Consulta (de última consulta si existe)
    tipo_consulta: '',
    consult_other_text: '',
    chief_complaint: '',
    
    // Alergias y Medicamentos Preventivos
    tiene_alergias: false,
    alergias: paciente.alergias || '',
    vitamins: '',
    albendazole: '',
    
    // Flags
    paciente_en_ayuno: false,
    medicamento_bp_tomado: false,
    medicamento_bs_tomado: false,
    
    // Hábitos Actuales
    tabaco_actual: false,
    tabaco_actual_cantidad: '',
    alcohol_actual: false,
    alcohol_actual_cantidad: '',
    drogas_actual: false,
    drogas_actual_cantidad: '',
    
    // Hábitos Pasados
    tabaco_pasado: false,
    tabaco_pasado_cantidad: '',
    alcohol_pasado: false,
    alcohol_pasado_cantidad: '',
    drogas_pasado: false,
    drogas_pasado_cantidad: '',
    
    // ===== CLINICAL TAB (FASE 3) =====
    
    // Salud Reproductiva
    lmp_month: '',
    lmp_day: '',
    lmp_year: '',
    menopause: false,
    gravida: '',
    para: '',
    miscarriage: '',
    abortion: '',
    birth_control: '',
    
    // Historia Clínica
    historia_enfermedad_actual: '',
    diagnosticos_previos: '',
    cirugias_previas: '',
    medicamentos_actuales: '',
    
    // Examen Físico
    examen_corazon: '',
    examen_pulmones: '',
    examen_abdomen: '',
    examen_ginecologico: '',
    
    // Evaluación y Plan
    impresion: '',
    plan: '',
    rx_notes: '',
    
    // Consultas Adicionales
    further_consult_gensurg: false,
    further_consult_gyn: false,
    further_consult_other: false,
    further_consult_other_text: '',
    provider: '',
    interprete: '',
    
    // ===== SURGICAL SECTION (FASE 4) =====
    surgical_date: '',
    surgical_history: '',
    surgical_exam: '',
    surgical_impression: '',
    surgical_plan: '',
    surgical_meds: '',
    surgical_consult_gensurg: false,
    surgical_consult_gyn: false,
    surgical_consult_other: false,
    surgical_consult_other_text: '',
    surgical_surgeon: '',
    surgical_interpreter: '',
    surgical_notes: '',
    rx_slips_attached: false,
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
    // Payload completo con TODOS los campos editables (FASE 2)
    const payload = { 
      id_paciente: paciente.id_paciente,
      
      // Tabla Pacientes - Identificación
      idioma: editData.idioma,
      nombre: editData.nombre,
      apellido: editData.apellido,
      genero: editData.genero,
      edad: editData.usarEdad ? (editData.edad ? Number(editData.edad) : null) : null,
      fecha_nacimiento: !editData.usarEdad ? editData.fecha_nacimiento : null,
      telefono: editData.telefono,
      comunidad_pueblo: editData.comunidad_pueblo,
      
      // Tabla Pacientes - Signos Vitales
      peso_kg: editData.peso_kg ? Number(editData.peso_kg) : null,
      altura_cm: editData.altura_cm ? Number(editData.altura_cm) : null,
      presion_sistolica: editData.presion_sistolica ? Number(editData.presion_sistolica) : null,
      presion_diastolica: editData.presion_diastolica ? Number(editData.presion_diastolica) : null,
      frecuencia_cardiaca: editData.frecuencia_cardiaca ? Number(editData.frecuencia_cardiaca) : null,
      saturacion_oxigeno: editData.saturacion_oxigeno ? Number(editData.saturacion_oxigeno) : null,
      glucosa: editData.glucosa ? Number(editData.glucosa) : null,
      temperatura: editData.temperatura ? Number(editData.temperatura) : null,
      alergias: editData.tiene_alergias ? editData.alergias : null,
      
      // Consulta (si existe datos de consulta)
      consulta: {
        tipo_consulta: editData.tipo_consulta || 'Other',
        consult_other_text: editData.consult_other_text || null,
        chief_complaint: editData.chief_complaint || 'N/A',
        
        // Flags
        paciente_en_ayuno: editData.paciente_en_ayuno || false,
        medicamento_bp_tomado: editData.medicamento_bp_tomado || false,
        medicamento_bs_tomado: editData.medicamento_bs_tomado || false,
        
        // Medicamentos preventivos
        vitamins: editData.vitamins ? Number(editData.vitamins) : null,
        albendazole: editData.albendazole ? Number(editData.albendazole) : null,
        
        // Historia Clínica
        historia_enfermedad_actual: editData.historia_enfermedad_actual || null,
        diagnosticos_previos: editData.diagnosticos_previos || null,
        cirugias_previas: editData.cirugias_previas || null,
        medicamentos_actuales: editData.medicamentos_actuales || null,
        
        // Examen Físico
        examen_corazon: editData.examen_corazon || null,
        examen_pulmones: editData.examen_pulmones || null,
        examen_abdomen: editData.examen_abdomen || null,
        examen_ginecologico: editData.examen_ginecologico || null,
        
        // Evaluación y Plan
        impresion: editData.impresion || null,
        plan: editData.plan || null,
        rx_notes: editData.rx_notes || null,
        
        // Consultas Adicionales
        further_consult: editData.further_consult || null,
        further_consult_other_text: editData.further_consult_other_text || null,
        provider: editData.provider || null,
        interprete: editData.interprete || null,
        
        // Sección Quirúrgica
        surgical_date: editData.surgical_date || null,
        surgical_history: editData.surgical_history || null,
        surgical_exam: editData.surgical_exam || null,
        surgical_impression: editData.surgical_impression || null,
        surgical_plan: editData.surgical_plan || null,
        surgical_meds: editData.surgical_meds || null,
        surgical_consult: editData.surgical_consult || null,
        surgical_consult_other_text: editData.surgical_consult_other_text || null,
        surgical_surgeon: editData.surgical_surgeon || null,
        surgical_interpreter: editData.surgical_interpreter || null,
        surgical_notes: editData.surgical_notes || null,
        rx_slips_attached: editData.rx_slips_attached || false,
      }
    };
    
    try {
      const online = await ConnectivityService.getConnectionStatus();
      if (!online) throw new Error('offline');
      
      const res = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}`, { 
        method:'PUT', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('fail');
      
      Alert.alert(t('alerts.saved.title'), t('alerts.saved.updated'));
      setEditMode(false);
      
      // Recargar paciente desde servidor
      setTimeout(() => navigation.replace('DetallePaciente', { paciente: { ...paciente, ...payload } }), 500);
    } catch (e) {
      await OfflineStorage.savePendingPatientUpdate(payload);
      Alert.alert(t('alerts.offline.title'), t('alerts.offline.queued'));
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
      
      // Recargar paciente para actualizar UI
      setTimeout(() => {
        navigation.replace('DetallePaciente', { paciente: { ...paciente, _flagWorst: severidad } });
      }, 1000);
    } catch (e) {
      console.error('Error reclassifying:', e);
      Alert.alert(t('alerts.reclassify.title'), t('alerts.reclassify.error'));
    }
  };

  const cancelChanges = () => {
    // Resetear editData a valores originales
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
      presion_sistolica: paciente.presion_sistolica?.toString() || '',
      presion_diastolica: paciente.presion_diastolica?.toString() || '',
      frecuencia_cardiaca: paciente.frecuencia_cardiaca?.toString() || '',
      saturacion_oxigeno: paciente.saturacion_oxigeno?.toString() || '',
      glucosa: paciente.glucosa?.toString() || '',
      temperatura: paciente.temperatura?.toString() || '',
      peso_kg: paciente.peso_kg?.toString() || '',
      altura_cm: paciente.altura_cm?.toString() || '',
      tipo_consulta: '',
      consult_other_text: '',
      chief_complaint: '',
      tiene_alergias: !!paciente.alergias,
      alergias: paciente.alergias || '',
      vitamins: '',
      albendazole: '',
      paciente_en_ayuno: false,
      medicamento_bp_tomado: false,
      medicamento_bs_tomado: false,
      tabaco_actual: false,
      tabaco_actual_cantidad: '',
      alcohol_actual: false,
      alcohol_actual_cantidad: '',
      drogas_actual: false,
      drogas_actual_cantidad: '',
      tabaco_pasado: false,
      tabaco_pasado_cantidad: '',
      alcohol_pasado: false,
      alcohol_pasado_cantidad: '',
      drogas_pasado: false,
      drogas_pasado_cantidad: '',
      
      // Clinical tab fields (FASE 3)
      lmp_month: '',
      lmp_day: '',
      lmp_year: '',
      menopause: false,
      gravida: '',
      para: '',
      miscarriage: '',
      abortion: '',
      birth_control: '',
      historia_enfermedad_actual: '',
      diagnosticos_previos: '',
      cirugias_previas: '',
      medicamentos_actuales: '',
      examen_corazon: '',
      examen_pulmones: '',
      examen_abdomen: '',
      examen_ginecologico: '',
      impresion: '',
      plan: '',
      rx_notes: '',
      further_consult_gensurg: false,
      further_consult_gyn: false,
      further_consult_other: false,
      further_consult_other_text: '',
      provider: '',
      interprete: '',
      
      // Surgical fields (FASE 4)
      surgical_date: '',
      surgical_history: '',
      surgical_exam: '',
      surgical_impression: '',
      surgical_plan: '',
      surgical_meds: '',
      surgical_consult_gensurg: false,
      surgical_consult_gyn: false,
      surgical_consult_other: false,
      surgical_consult_other_text: '',
      surgical_surgeon: '',
      surgical_interpreter: '',
      surgical_notes: '',
      rx_slips_attached: false,
    });
    setLocalPeso(paciente.peso_kg?.toString() || '');
    setLocalAltura(paciente.altura_cm?.toString() || '');
    setLocalSeverity(paciente._flagWorst || '');
    setEditMode(false);
  };

  if (!paciente) {
    return <View style={[styles.center,{backgroundColor:theme.background}]}><Text style={{color:theme.text}}>{t('errors.notFound')}</Text></View>;
  }

  const section = (title, key, rows) => {
    const isOpen = open[key];
    return (
      <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
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
    <View style={{flex:1, backgroundColor: theme.background}}>
      {/* Header con nombre del paciente */}
      <View style={styles.header}>
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

      {/* Barra de acciones debajo del header (lado derecho) */}
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
          
          {/* Botón de RECLASIFICAR */}
          <TouchableOpacity 
            onPress={reclassifySeverity} 
            style={[styles.actionCircleBtn, {backgroundColor: isDarkMode ? '#333' : '#E0E0E0'}]}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color={isDarkMode ? '#FFF' : '#555'} />
          </TouchableOpacity>
          
          {/* Chip de severidad */}
          <View style={[styles.severityChip,{backgroundColor:severityColor}]}>
            <Text style={styles.severityTxt}>{tSeverity(worst) || '—'}</Text>
          </View>
        </View>
        {manualBadge && (
          <Text style={{ marginTop:4, fontSize:10, fontWeight:'700', color:'#F08C21', textAlign:'right' }}>
            {t('badges.manual')}
          </Text>
        )}
      </View>

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

      {/* Botón de exportación a PDF */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.exportBtn]}
          onPress={() => navigation.navigate('ExportacionPDF', { paciente })}
        >
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>{t('buttons.exportPDF')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.imagesBtn]}
          onPress={() => navigation.navigate('GestionImagenes', { paciente })}
        >
          <Ionicons name="images-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>{t('buttons.manageImages')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{padding:16, paddingBottom:90}}>
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
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Idioma</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.idioma || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Nombres</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.nombre || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Apellidos</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.apellido || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Teléfono</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.telefono || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Comunidad / Pueblo</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.comunidad_pueblo || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Género</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.genero || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Edad</Text>
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
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Peso (kg)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.peso_kg || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Estatura (cm)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.altura_cm || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Presión Arterial (mmHg)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {paciente.presion_sistolica && paciente.presion_diastolica 
                            ? `${paciente.presion_sistolica}/${paciente.presion_diastolica}` 
                            : '—'}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Frecuencia Cardíaca (lpm)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.frecuencia_cardiaca || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>SpO₂ (%)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.saturacion_oxigeno || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Glucosa (mg/dL)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.glucosa || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Temperatura (°C)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{paciente.temperatura || '—'}</Text>
                      </View>
                      {bmiVal && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>IMC</Text>
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
                    <Text style={styles.sectionTitle}>Tipo de Consulta</Text>
                    <Ionicons name={open.consultType? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.consultType && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Tipo de Consulta</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.tipo_consulta || '—'}</Text>
                      </View>
                      {editData.tipo_consulta === 'Other' && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Especificar</Text>
                          <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_other_text || '—'}</Text>
                        </View>
                      )}
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Queja Principal</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]} numberOfLines={3}>{editData.chief_complaint || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 4. ALERGIAS - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('allergies')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Alergias y Medicamentos Preventivos</Text>
                    <Ionicons name={open.allergies? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.allergies && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Tiene Alergias</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.tiene_alergias ? 'Sí' : 'No'}</Text>
                      </View>
                      {editData.tiene_alergias && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Alergias</Text>
                          <Text style={[styles.readOnlyValue,{color:theme.text}]} numberOfLines={3}>{editData.alergias || '—'}</Text>
                        </View>
                      )}
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Vitaminas</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.vitamins || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Albendazole</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.albendazole || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 5. HÁBITOS ACTUALES - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('currentHabits')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Hábitos Actuales</Text>
                    <Ionicons name={open.currentHabits? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.currentHabits && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Tabaco</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.tabaco_actual ? `Sí (${editData.tabaco_actual_cantidad || '—'})` : 'No'}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Alcohol</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.alcohol_actual ? `Sí (${editData.alcohol_actual_cantidad || '—'})` : 'No'}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Drogas</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.drogas_actual ? `Sí (${editData.drogas_actual_cantidad || '—'})` : 'No'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 6. HÁBITOS PASADOS - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('pastHabits')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Hábitos Pasados</Text>
                    <Ionicons name={open.pastHabits? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.pastHabits && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Tabaco (pasado)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.tabaco_pasado ? `Sí (${editData.tabaco_pasado_cantidad || '—'})` : 'No'}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Alcohol (pasado)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.alcohol_pasado ? `Sí (${editData.alcohol_pasado_cantidad || '—'})` : 'No'}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Drogas (pasado)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.drogas_pasado ? `Sí (${editData.drogas_pasado_cantidad || '—'})` : 'No'}
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
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Idioma</Text>
                        <Picker
                          selectedValue={editData.idioma}
                          onValueChange={(v) => setEditData({...editData, idioma:v})}
                          style={[styles.editInput,{color:theme.text}]}
                        >
                          <Picker.Item label="Español" value="Español" />
                          <Picker.Item label="Inglés" value="Inglés" />
                          <Picker.Item label="K'iche'" value="K'iche'" />
                          <Picker.Item label="Kaqchikel" value="Kaqchikel" />
                          <Picker.Item label="Q'eqchi'" value="Q'eqchi'" />
                          <Picker.Item label="Mam" value="Mam" />
                        </Picker>
                      </View>

                      {/* Nombres */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Nombres</Text>
                        <TextInput 
                          value={editData.nombre} 
                          onChangeText={(v) => setEditData({...editData, nombre:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="Nombres" 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Apellidos */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Apellidos</Text>
                        <TextInput 
                          value={editData.apellido} 
                          onChangeText={(v) => setEditData({...editData, apellido:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="Apellidos" 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Teléfono */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Teléfono</Text>
                        <TextInput 
                          value={editData.telefono} 
                          onChangeText={(v) => setEditData({...editData, telefono:v.replace(/\D/g,'')})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="12345678" 
                          keyboardType="numeric"
                          maxLength={8}
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Comunidad */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Comunidad / Pueblo</Text>
                        <TextInput 
                          value={editData.comunidad_pueblo} 
                          onChangeText={(v) => setEditData({...editData, comunidad_pueblo:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="Comunidad" 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Género */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Género</Text>
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
                          <Text style={[styles.label,{color:theme.text}]}>Usar Edad</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditData({...editData, usarEdad:false})} style={{flexDirection:'row',alignItems:'center',gap:8}}>
                          <View style={[styles.radio, !editData.usarEdad && styles.radioActive]} />
                          <Text style={[styles.label,{color:theme.text}]}>Usar Fecha Nac.</Text>
                        </TouchableOpacity>
                      </View>

                      {editData.usarEdad ? (
                        <View style={{marginBottom:12}}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Edad (años)</Text>
                          <TextInput 
                            value={editData.edad} 
                            onChangeText={(v) => setEditData({...editData, edad:v.replace(/\D/g,'')})} 
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder="35" 
                            keyboardType="numeric"
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      ) : (
                        <View style={{marginBottom:12}}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Fecha de Nacimiento (YYYY-MM-DD)</Text>
                          <TextInput 
                            value={editData.fecha_nacimiento} 
                            onChangeText={(v) => setEditData({...editData, fecha_nacimiento:v})} 
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder="1990-05-15" 
                            placeholderTextColor={theme.secondaryText} 
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
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Peso (kg)</Text>
                          <TextInput value={editData.peso_kg} onChangeText={(v)=>setEditData({...editData, peso_kg:v})} keyboardType='numeric' style={[styles.editInput,{color:theme.text}]} placeholder='70' placeholderTextColor={theme.secondaryText} />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Estatura (cm)</Text>
                          <TextInput value={editData.altura_cm} onChangeText={(v)=>setEditData({...editData, altura_cm:v})} keyboardType='numeric' style={[styles.editInput,{color:theme.text}]} placeholder='170' placeholderTextColor={theme.secondaryText} />
                        </View>
                      </View>

                      {/* Presión Arterial */}
                      <View style={styles.inlineEditRow}>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>PA Sistólica (mmHg)</Text>
                          <TextInput value={editData.presion_sistolica} onChangeText={(v)=>setEditData({...editData, presion_sistolica:v.replace(/\D/g,'')})} keyboardType='numeric' style={[styles.editInput,{color:theme.text}]} placeholder='120' placeholderTextColor={theme.secondaryText} />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>PA Diastólica (mmHg)</Text>
                          <TextInput value={editData.presion_diastolica} onChangeText={(v)=>setEditData({...editData, presion_diastolica:v.replace(/\D/g,'')})} keyboardType='numeric' style={[styles.editInput,{color:theme.text}]} placeholder='80' placeholderTextColor={theme.secondaryText} />
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
                          <Text style={[styles.label,{color:theme.secondaryText}]}>FC (lpm)</Text>
                          <TextInput value={editData.frecuencia_cardiaca} onChangeText={(v)=>setEditData({...editData, frecuencia_cardiaca:v.replace(/\D/g,'')})} keyboardType='numeric' style={[styles.editInput,{color:theme.text}]} placeholder='75' placeholderTextColor={theme.secondaryText} />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>SpO₂ (%)</Text>
                          <TextInput value={editData.saturacion_oxigeno} onChangeText={(v)=>setEditData({...editData, saturacion_oxigeno:v})} keyboardType='numeric' style={[styles.editInput,{color:theme.text}]} placeholder='98' placeholderTextColor={theme.secondaryText} />
                        </View>
                      </View>

                      <View style={styles.inlineEditRow}>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Glucosa (mg/dL)</Text>
                          <TextInput value={editData.glucosa} onChangeText={(v)=>setEditData({...editData, glucosa:v})} keyboardType='numeric' style={[styles.editInput,{color:theme.text}]} placeholder='95' placeholderTextColor={theme.secondaryText} />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Temperatura (°C)</Text>
                          <TextInput value={editData.temperatura} onChangeText={(v)=>setEditData({...editData, temperatura:v})} keyboardType='numeric' style={[styles.editInput,{color:theme.text}]} placeholder='36.8' placeholderTextColor={theme.secondaryText} />
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
                        <Picker.Item label="Medical" value="Medical" />
                        <Picker.Item label="Surgical" value="Surgical" />
                        <Picker.Item label="Dental" value="Dental" />
                        <Picker.Item label="Other" value="Other" />
                      </Picker>

                      {editData.tipo_consulta === 'Other' && (
                        <View style={{marginBottom:12}}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Especificar</Text>
                          <TextInput 
                            value={editData.consult_other_text} 
                            onChangeText={(v) => setEditData({...editData, consult_other_text:v})} 
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder="Especificar tipo..." 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Motivo de Consulta</Text>
                        <TextInput 
                          value={editData.chief_complaint} 
                          onChangeText={(v) => setEditData({...editData, chief_complaint:v})} 
                          style={[styles.editInput,{color:theme.text, minHeight:80}]} 
                          multiline 
                          numberOfLines={4}
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
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Alergias</Text>
                          <TextInput 
                            value={editData.alergias} 
                            onChangeText={(v) => setEditData({...editData, alergias:v})} 
                            style={[styles.editInput,{color:theme.text, minHeight:60}]} 
                            multiline 
                            numberOfLines={3}
                            placeholder="Describir alergias..." 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}

                      <View style={styles.inlineEditRow}>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Vitaminas</Text>
                          <TextInput 
                            value={editData.vitamins} 
                            onChangeText={(v)=>setEditData({...editData, vitamins:v})} 
                            keyboardType='numeric' 
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder='Cantidad' 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                        <View style={styles.editField}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Albendazol</Text>
                          <TextInput 
                            value={editData.albendazole} 
                            onChangeText={(v)=>setEditData({...editData, albendazole:v})} 
                            keyboardType='numeric' 
                            style={[styles.editInput,{color:theme.text}]} 
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
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Tabaco</Text>
                      </TouchableOpacity>
                      {editData.tabaco_actual && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Cantidad (ej: "5 cigarros/día")</Text>
                          <TextInput 
                            value={editData.tabaco_actual_cantidad} 
                            onChangeText={(v) => setEditData({...editData, tabaco_actual_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder="Cantidad..." 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}

                      {/* Alcohol Actual */}
                      <TouchableOpacity onPress={() => setEditData({...editData, alcohol_actual: !editData.alcohol_actual})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.alcohol_actual && styles.toggleActive]}>
                          {editData.alcohol_actual && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Alcohol</Text>
                      </TouchableOpacity>
                      {editData.alcohol_actual && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Cantidad (ej: "2 cervezas/semana")</Text>
                          <TextInput 
                            value={editData.alcohol_actual_cantidad} 
                            onChangeText={(v) => setEditData({...editData, alcohol_actual_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder="Cantidad..." 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}

                      {/* Drogas Actual */}
                      <TouchableOpacity onPress={() => setEditData({...editData, drogas_actual: !editData.drogas_actual})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.drogas_actual && styles.toggleActive]}>
                          {editData.drogas_actual && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Drogas</Text>
                      </TouchableOpacity>
                      {editData.drogas_actual && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Tipo y cantidad</Text>
                          <TextInput 
                            value={editData.drogas_actual_cantidad} 
                            onChangeText={(v) => setEditData({...editData, drogas_actual_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder="Tipo y cantidad..." 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* 6. HÁBITOS PASADOS */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('pasthabits')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Hábitos Pasados</Text>
                    <Ionicons name={open.pasthabits? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.pasthabits && (
                    <View>
                      {/* Tabaco Pasado */}
                      <TouchableOpacity onPress={() => setEditData({...editData, tabaco_pasado: !editData.tabaco_pasado})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.tabaco_pasado && styles.toggleActive]}>
                          {editData.tabaco_pasado && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Tabaco</Text>
                      </TouchableOpacity>
                      {editData.tabaco_pasado && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Cantidad y período</Text>
                          <TextInput 
                            value={editData.tabaco_pasado_cantidad} 
                            onChangeText={(v) => setEditData({...editData, tabaco_pasado_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder="Ej: '10 cigarros/día durante 5 años'" 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}

                      {/* Alcohol Pasado */}
                      <TouchableOpacity onPress={() => setEditData({...editData, alcohol_pasado: !editData.alcohol_pasado})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.alcohol_pasado && styles.toggleActive]}>
                          {editData.alcohol_pasado && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Alcohol</Text>
                      </TouchableOpacity>
                      {editData.alcohol_pasado && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Cantidad y período</Text>
                          <TextInput 
                            value={editData.alcohol_pasado_cantidad} 
                            onChangeText={(v) => setEditData({...editData, alcohol_pasado_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder="Ej: 'Consumo social hasta 2019'" 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}

                      {/* Drogas Pasado */}
                      <TouchableOpacity onPress={() => setEditData({...editData, drogas_pasado: !editData.drogas_pasado})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.drogas_pasado && styles.toggleActive]}>
                          {editData.drogas_pasado && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Drogas</Text>
                      </TouchableOpacity>
                      {editData.drogas_pasado && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Tipo, cantidad y período</Text>
                          <TextInput 
                            value={editData.drogas_pasado_cantidad} 
                            onChangeText={(v) => setEditData({...editData, drogas_pasado_cantidad:v})} 
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder="Tipo, cantidad y período..." 
                            placeholderTextColor={theme.secondaryText} 
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
                  <TouchableOpacity onPress={saveChanges} style={[styles.actionBtn, {flex:1, backgroundColor:'#16A34A'}]}>
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
                    <Text style={styles.sectionTitle}>Salud Reproductiva</Text>
                    <Ionicons name={open.reproHealth? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.reproHealth && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>LMP (Last Menstrual Period)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>
                          {editData.lmp_month || editData.lmp_day || editData.lmp_year 
                            ? `${editData.lmp_month || '—'}/${editData.lmp_day || '—'}/${editData.lmp_year || '—'}` 
                            : '—'}
                        </Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Menopausia</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.menopause ? 'Sí' : 'No'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Gravida (G)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.gravida || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Para (P)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.para || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Abortos (Mc)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.miscarriage || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Abortos Provocados (Ab)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.abortion || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Método Anticonceptivo</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.birth_control || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 2. HISTORIA CLÍNICA - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('clinHistory')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Historia Clínica</Text>
                    <Ionicons name={open.clinHistory? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.clinHistory && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Historia de Enfermedad Actual</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.historia_enfermedad_actual || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Diagnósticos Previos</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.diagnosticos_previos || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Cirugías Previas</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.cirugias_previas || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Medicamentos Actuales</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.medicamentos_actuales || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 3. EXAMEN FÍSICO - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('physExam')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Examen Físico</Text>
                    <Ionicons name={open.physExam? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.physExam && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Corazón (Heart)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.examen_corazon || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Pulmones (Lungs)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.examen_pulmones || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Abdomen (Abdomen)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.examen_abdomen || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Ginecológico (GYN)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.examen_ginecologico || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 4. EVALUACIÓN Y PLAN - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('assessPlan')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Evaluación y Plan</Text>
                    <Ionicons name={open.assessPlan? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.assessPlan && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Impresión (Impression)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.impresion || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Plan (Plan)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.plan || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Notas Rx (Rx Notes)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.rx_notes || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 5. CONSULTAS ADICIONALES - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('furtherConsult')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Consultas Adicionales</Text>
                    <Ionicons name={open.furtherConsult? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.furtherConsult && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Tipo de Consulta</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.further_consult || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Proveedor (Provider)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.provider || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Intérprete (Interpreter)</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.interprete || '—'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 6. SECCIÓN QUIRÚRGICA - Solo Lectura */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('surgical')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Consulta Quirúrgica</Text>
                    <Ionicons name={open.surgical? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.surgical && (
                    <View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Fecha de Consulta Quirúrgica</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_date || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Historia Quirúrgica</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_history || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Examen Quirúrgico</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_exam || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Impresión Quirúrgica</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_impression || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Plan Quirúrgico</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_plan || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Medicamentos Quirúrgicos</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.surgical_meds || '—'}</Text>
                      </View>
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Cirugía General</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_gensurg ? 'Sí' : 'No'}</Text>
                      </View>
                      {editData.consult_gensurg && editData.consult_gensurg_text && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Detalles Cirugía General</Text>
                          <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_gensurg_text}</Text>
                        </View>
                      )}
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Ginecología</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_gyn ? 'Sí' : 'No'}</Text>
                      </View>
                      {editData.consult_gyn && editData.consult_gyn_text && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Detalles Ginecología</Text>
                          <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_gyn_text}</Text>
                        </View>
                      )}
                      <View style={styles.readOnlyRow}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Otra Consulta</Text>
                        <Text style={[styles.readOnlyValue,{color:theme.text}]}>{editData.consult_other ? 'Sí' : 'No'}</Text>
                      </View>
                      {editData.consult_other && editData.consult_other_text && (
                        <View style={styles.readOnlyRow}>
                          <Text style={[styles.label,{color:theme.secondaryText}]}>Detalles Otra Consulta</Text>
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
                            style={[styles.editInput,{color:theme.text}]} 
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
                            style={[styles.editInput,{color:theme.text}]} 
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
                            style={[styles.editInput,{color:theme.text}]} 
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
                            style={[styles.editInput,{color:theme.text}]} 
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
                            style={[styles.editInput,{color:theme.text}]} 
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
                            style={[styles.editInput,{color:theme.text}]} 
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
                            style={[styles.editInput,{color:theme.text}]} 
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
                          style={[styles.editInput,{color:theme.text}]} 
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
                    <Text style={styles.sectionTitle}>Historia Clínica</Text>
                    <Ionicons name={open.clinHistory? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.clinHistory && (
                    <View>
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Historia de Enfermedad Actual</Text>
                        <TextInput 
                          value={editData.historia_enfermedad_actual} 
                          onChangeText={(v) => setEditData({...editData, historia_enfermedad_actual:v})} 
                          style={[styles.editInput,{color:theme.text, minHeight:100}]} 
                          multiline 
                          numberOfLines={5}
                          placeholder="Descripción detallada de la enfermedad actual..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Diagnósticos Previos</Text>
                        <TextInput 
                          value={editData.diagnosticos_previos} 
                          onChangeText={(v) => setEditData({...editData, diagnosticos_previos:v})} 
                          style={[styles.editInput,{color:theme.text, minHeight:100}]} 
                          multiline 
                          numberOfLines={5}
                          placeholder="Diabetes, hipertensión, asma, etc." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Cirugías Previas</Text>
                        <TextInput 
                          value={editData.cirugias_previas} 
                          onChangeText={(v) => setEditData({...editData, cirugias_previas:v})} 
                          style={[styles.editInput,{color:theme.text, minHeight:100}]} 
                          multiline 
                          numberOfLines={5}
                          placeholder="Apendicectomía, cesárea, etc." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Medicamentos Actuales</Text>
                        <TextInput 
                          value={editData.medicamentos_actuales} 
                          onChangeText={(v) => setEditData({...editData, medicamentos_actuales:v})} 
                          style={[styles.editInput,{color:theme.text, minHeight:100}]} 
                          multiline 
                          numberOfLines={5}
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
                        <TextInput 
                          value={editData.examen_corazon} 
                          onChangeText={(v) => setEditData({...editData, examen_corazon:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="Ruidos cardíacos normales, sin soplos..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Pulmones (Lungs)</Text>
                        <TextInput 
                          value={editData.examen_pulmones} 
                          onChangeText={(v) => setEditData({...editData, examen_pulmones:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="Murmullo vesicular bilateral, sin estertores..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Abdomen (Abdomen)</Text>
                        <TextInput 
                          value={editData.examen_abdomen} 
                          onChangeText={(v) => setEditData({...editData, examen_abdomen:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="Blando, no doloroso, sin masas..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Ginecológico (GYN)</Text>
                        <TextInput 
                          value={editData.examen_ginecologico} 
                          onChangeText={(v) => setEditData({...editData, examen_ginecologico:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
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
                    <Text style={styles.sectionTitle}>Evaluación y Plan</Text>
                    <Ionicons name={open.assessment? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.assessment && (
                    <View>
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Impresión Diagnóstica</Text>
                        <TextInput 
                          value={editData.impresion} 
                          onChangeText={(v) => setEditData({...editData, impresion:v})} 
                          style={[styles.editInput,{color:theme.text, minHeight:120}]} 
                          multiline 
                          numberOfLines={6}
                          placeholder="Diagnóstico principal y diferenciales..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Plan de Tratamiento</Text>
                        <TextInput 
                          value={editData.plan} 
                          onChangeText={(v) => setEditData({...editData, plan:v})} 
                          style={[styles.editInput,{color:theme.text, minHeight:120}]} 
                          multiline 
                          numberOfLines={6}
                          placeholder="Manejo, seguimiento, educación al paciente..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Notas de Prescripción (Rx)</Text>
                        <TextInput 
                          value={editData.rx_notes} 
                          onChangeText={(v) => setEditData({...editData, rx_notes:v})} 
                          style={[styles.editInput,{color:theme.text, minHeight:100}]} 
                          multiline 
                          numberOfLines={5}
                          placeholder="Paracetamol 500mg VO c/8h x 3 días..." 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* 5. CONSULTAS ADICIONALES */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('furtherConsult')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Consultas Adicionales</Text>
                    <Ionicons name={open.furtherConsult? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.furtherConsult && (
                    <View>
                      <Text style={[styles.label,{color:theme.secondaryText,marginBottom:8}]}>Referir a:</Text>
                      
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
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder="Cardiología, Neurología, etc." 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}

                      <View style={{marginBottom:12,marginTop:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Proveedor / Médico</Text>
                        <TextInput 
                          value={editData.provider} 
                          onChangeText={(v) => setEditData({...editData, provider:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="Dr. Juan Pérez" 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Intérprete</Text>
                        <TextInput 
                          value={editData.interprete} 
                          onChangeText={(v) => setEditData({...editData, interprete:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="María López" 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* 6. SURGICAL CONSULTATION (FASE 4) */}
                <View style={[styles.section,{backgroundColor: isDarkMode? '#1E1E1E':'#fff', borderColor:isDarkMode? '#333':'#EAD8A6'}]}>
                  <TouchableOpacity onPress={()=>toggle('surgical')} style={styles.sectionHeader} activeOpacity={0.8}>
                    <Text style={styles.sectionTitle}>Consulta Quirúrgica</Text>
                    <Ionicons name={open.surgical? 'chevron-up':'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                  {open.surgical && (
                    <View>
                      {/* Surgical Date */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Fecha de Consulta Quirúrgica</Text>
                        <TextInput 
                          value={editData.surgical_date} 
                          onChangeText={(v) => setEditData({...editData, surgical_date:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="DD/MM/YYYY" 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Surgical History */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Historia Quirúrgica</Text>
                        <TextInput 
                          value={editData.surgical_history} 
                          onChangeText={(v) => setEditData({...editData, surgical_history:v})} 
                          style={[styles.editInput,{color:theme.text,minHeight:100}]} 
                          placeholder="Cirugías previas, complicaciones, etc." 
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                          numberOfLines={5} 
                        />
                      </View>

                      {/* Surgical Exam */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Examen Quirúrgico</Text>
                        <TextInput 
                          value={editData.surgical_exam} 
                          onChangeText={(v) => setEditData({...editData, surgical_exam:v})} 
                          style={[styles.editInput,{color:theme.text,minHeight:100}]} 
                          placeholder="Corazón, pulmones, abdomen, extremidades, etc." 
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                          numberOfLines={5} 
                        />
                      </View>

                      {/* Surgical Impression */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Impresión Quirúrgica</Text>
                        <TextInput 
                          value={editData.surgical_impression} 
                          onChangeText={(v) => setEditData({...editData, surgical_impression:v})} 
                          style={[styles.editInput,{color:theme.text,minHeight:100}]} 
                          placeholder="Evaluación y diagnóstico quirúrgico" 
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                          numberOfLines={5} 
                        />
                      </View>

                      {/* Surgical Plan */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Plan Quirúrgico</Text>
                        <TextInput 
                          value={editData.surgical_plan} 
                          onChangeText={(v) => setEditData({...editData, surgical_plan:v})} 
                          style={[styles.editInput,{color:theme.text,minHeight:100}]} 
                          placeholder="Procedimientos recomendados, seguimiento, etc." 
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                          numberOfLines={5} 
                        />
                      </View>

                      {/* Surgical Medications */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Medicamentos Quirúrgicos</Text>
                        <TextInput 
                          value={editData.surgical_meds} 
                          onChangeText={(v) => setEditData({...editData, surgical_meds:v})} 
                          style={[styles.editInput,{color:theme.text,minHeight:100}]} 
                          placeholder="Antibióticos, analgésicos, etc." 
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                          numberOfLines={5} 
                        />
                      </View>

                      {/* Surgical Consult Checkboxes */}
                      <Text style={[styles.label,{color:theme.secondaryText,marginBottom:8,marginTop:12}]}>Referir a:</Text>
                      
                      <TouchableOpacity onPress={() => setEditData({...editData, surgical_consult_gensurg: !editData.surgical_consult_gensurg})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.surgical_consult_gensurg && styles.toggleActive]}>
                          {editData.surgical_consult_gensurg && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Cirugía General (GenSurg)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setEditData({...editData, surgical_consult_gyn: !editData.surgical_consult_gyn})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.surgical_consult_gyn && styles.toggleActive]}>
                          {editData.surgical_consult_gyn && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Ginecología (GYN)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setEditData({...editData, surgical_consult_other: !editData.surgical_consult_other})} style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                        <View style={[styles.toggle, editData.surgical_consult_other && styles.toggleActive]}>
                          {editData.surgical_consult_other && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={[styles.label,{color:theme.text,marginLeft:10}]}>Otro</Text>
                      </TouchableOpacity>

                      {editData.surgical_consult_other && (
                        <View style={{marginBottom:12,marginLeft:30}}>
                          <Text style={[styles.label,{color:theme.secondaryText,fontSize:12}]}>Especificar otro</Text>
                          <TextInput 
                            value={editData.surgical_consult_other_text} 
                            onChangeText={(v) => setEditData({...editData, surgical_consult_other_text:v})} 
                            style={[styles.editInput,{color:theme.text}]} 
                            placeholder="Cardiología, Neurología, etc." 
                            placeholderTextColor={theme.secondaryText} 
                          />
                        </View>
                      )}

                      {/* Surgeon */}
                      <View style={{marginBottom:12,marginTop:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Cirujano</Text>
                        <TextInput 
                          value={editData.surgical_surgeon} 
                          onChangeText={(v) => setEditData({...editData, surgical_surgeon:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="Dr. Ana Morales" 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Surgical Interpreter */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Intérprete Quirúrgico</Text>
                        <TextInput 
                          value={editData.surgical_interpreter} 
                          onChangeText={(v) => setEditData({...editData, surgical_interpreter:v})} 
                          style={[styles.editInput,{color:theme.text}]} 
                          placeholder="Carlos Ruiz" 
                          placeholderTextColor={theme.secondaryText} 
                        />
                      </View>

                      {/* Surgical Notes */}
                      <View style={{marginBottom:12}}>
                        <Text style={[styles.label,{color:theme.secondaryText}]}>Notas Quirúrgicas</Text>
                        <TextInput 
                          value={editData.surgical_notes} 
                          onChangeText={(v) => setEditData({...editData, surgical_notes:v})} 
                          style={[styles.editInput,{color:theme.text,minHeight:120}]} 
                          placeholder="Notas adicionales sobre la consulta quirúrgica..." 
                          placeholderTextColor={theme.secondaryText} 
                          multiline 
                          numberOfLines={6} 
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
                  <TouchableOpacity onPress={saveChanges} style={[styles.actionBtn, {flex:1, backgroundColor:'#16A34A'}]}>
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
  );
}

const styles = StyleSheet.create({
  header:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop:14, paddingBottom:10 },
  title:{ fontSize:20, fontWeight:'800', maxWidth:200 },
  subtitle:{ fontSize:12, fontWeight:'600' },
  actionBar:{ paddingHorizontal:16, paddingVertical:8, borderBottomWidth:1, borderBottomColor:'#E5E7EB' },
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
  tabsRow:{ flexDirection:'row', paddingHorizontal:16, columnGap:10, marginBottom:4 },
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
  actionBtnText:{ color:'#fff', fontWeight:'700', fontSize:13 }
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
