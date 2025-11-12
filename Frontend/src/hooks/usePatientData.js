// usePatientData.js - Hook personalizado para gestionar el estado del paciente
import { useState, useEffect } from 'react';
import { parseLMPDate } from '../utils/patientUtils';

export function usePatientData(pacienteParam) {
  const [paciente, setPaciente] = useState(pacienteParam);
  const [localPeso, setLocalPeso] = useState(pacienteParam.peso?.toString() || '');
  const [localAltura, setLocalAltura] = useState(pacienteParam.estatura?.toString() || '');
  const [localSeverity, setLocalSeverity] = useState(pacienteParam._flagWorst || '');
  const [calcIMC, setCalcIMC] = useState(null);

  const lmpParsed = parseLMPDate(paciente.ultima_menstruacion);

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
    usarEdad: paciente.edad ? true : false,
    
    // Signos Vitales
    presion_arterial_sistolica: paciente.presion_arterial_sistolica?.toString() || '',
    presion_arterial_diastolica: paciente.presion_arterial_diastolica?.toString() || '',
    frecuencia_cardiaca: paciente.frecuencia_cardiaca?.toString() || '',
    saturacion_oxigeno: paciente.saturacion_oxigeno?.toString() || '',
    glucosa: paciente.glucosa?.toString() || '',
    temperatura: paciente.temperatura?.toString() || '',
    peso: localPeso,
    estatura: localAltura,
    
    // Tipo de Consulta
    tipo_consulta: paciente.consultas?.[0]?.tipo_consulta || '',
    consult_other_text: paciente.consultas?.[0]?.consult_other_text || '',
    chief_complaint: paciente.consultas?.[0]?.chief_complaint || '',
    
    // Alergias y Medicamentos
    tiene_alergias: paciente.tiene_alergias || false,
    alergias: paciente.alergias || '',
    vitamins: paciente.consultas?.[0]?.vitamins || '',
    albendazole: paciente.consultas?.[0]?.albendazole || '',
    
    // Flags
    paciente_en_ayuno: paciente.consultas?.[0]?.paciente_en_ayuno || false,
    medicamento_bp_tomado: paciente.consultas?.[0]?.medicamento_bp_tomado || false,
    medicamento_bs_tomado: paciente.consultas?.[0]?.medicamento_bs_tomado || false,
    
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
    historia_enfermedad_actual: paciente.consultas?.[0]?.historia_enfermedad_actual || '',
    diagnosticos_previos: paciente.consultas?.[0]?.diagnosticos_previos || '',
    cirugias_previas: paciente.consultas?.[0]?.cirugias_previas || '',
    medicamentos_actuales: paciente.consultas?.[0]?.medicamentos_actuales || '',
    
    // Examen Físico
    examen_corazon: paciente.consultas?.[0]?.examen_corazon || '',
    examen_pulmones: paciente.consultas?.[0]?.examen_pulmones || '',
    examen_abdomen: paciente.consultas?.[0]?.examen_abdomen || '',
    examen_ginecologico: paciente.consultas?.[0]?.examen_ginecologico || '',
    
    // Evaluación y Plan
    impresion: paciente.consultas?.[0]?.impresion || '',
    plan: paciente.consultas?.[0]?.plan || '',
    rx_notes: paciente.consultas?.[0]?.rx_notes || '',
    
    // Consultas Adicionales
    further_consult_gensurg: paciente.consultas?.[0]?.further_consult?.toLowerCase().includes('gen') || false,
    further_consult_gyn: paciente.consultas?.[0]?.further_consult?.toLowerCase().includes('gyn') || false,
    further_consult_other: paciente.consultas?.[0]?.further_consult?.toLowerCase().includes('other') || false,
    further_consult_other_text: paciente.consultas?.[0]?.further_consult_other_text || '',
    provider: paciente.consultas?.[0]?.provider || '',
    interprete: paciente.consultas?.[0]?.interprete || '',
    
    // Sección Quirúrgica
    surgical_date: paciente.consultas?.[0]?.surgical_date || '',
    surgical_history: paciente.consultas?.[0]?.surgical_history || '',
    surgical_exam: paciente.consultas?.[0]?.surgical_exam || '',
    surgical_impression: paciente.consultas?.[0]?.surgical_impression || '',
    surgical_plan: paciente.consultas?.[0]?.surgical_plan || '',
    surgical_meds: paciente.consultas?.[0]?.surgical_meds || '',
    surgical_consult_gensurg: paciente.consultas?.[0]?.surgical_consult?.toLowerCase().includes('gen') || false,
    surgical_consult_gyn: paciente.consultas?.[0]?.surgical_consult?.toLowerCase().includes('gyn') || false,
    surgical_consult_other: paciente.consultas?.[0]?.surgical_consult?.toLowerCase().includes('other') || false,
    surgical_consult_other_text: paciente.consultas?.[0]?.surgical_consult_other_text || '',
    surgical_surgeon: paciente.consultas?.[0]?.surgical_surgeon || '',
    surgical_interpreter: paciente.consultas?.[0]?.surgical_interpreter || '',
    surgical_notes: paciente.consultas?.[0]?.surgical_notes || '',
    rx_slips_attached: paciente.consultas?.[0]?.rx_slips_attached || false,
  });

  // Calcular IMC automáticamente
  useEffect(() => {
    const peso = parseFloat(String(localPeso).replace(',', '.'));
    const alt = parseFloat(String(localAltura).replace(',', '.'));
    
    if (peso > 0 && alt > 0) {
      const imc = peso / Math.pow(alt / 100, 2);
      setCalcIMC(imc.toFixed(2));
    } else {
      setCalcIMC(null);
    }
  }, [localPeso, localAltura]);

  return {
    paciente,
    setPaciente,
    localPeso,
    setLocalPeso,
    localAltura,
    setLocalAltura,
    localSeverity,
    setLocalSeverity,
    calcIMC,
    setCalcIMC,
    editData,
    setEditData,
  };
}
