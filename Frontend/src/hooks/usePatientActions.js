// usePatientActions.js - Hook para acciones del paciente (save, refresh, reclassify)
import { Alert } from 'react-native';
import ConnectivityService from '../services/ConnectivityService';
import OfflineStorage from '../services/OfflineStorage';
import { validatePatientData } from '../utils/validation';
import { parseLMPDate } from '../utils/patientUtils';

export function usePatientActions({ 
  paciente, 
  setPaciente, 
  editData, 
  setEditData, 
  setLocalPeso, 
  setLocalAltura, 
  setLocalSeverity, 
  setCalcIMC,
  t 
}) {
  
  const saveChanges = async () => {
    // Validar datos
    const validation = validatePatientData(editData, t);
    if (!validation.valid) {
      const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join('\n\n');
      Alert.alert('⚠️ Errores de Validación', errorMessages, [{ text: 'OK' }]);
      return { success: false, errors: validation.errors };
    }

    // Construir payload
    const payload = {
      id_paciente: paciente.id_paciente,
      
      // Identificación
      idioma: editData.idioma,
      nombre: editData.nombre,
      apellido: editData.apellido || null,
      genero: editData.genero,
      edad: editData.usarEdad ? (editData.edad ? Number(editData.edad) : null) : null,
      fecha_nacimiento: !editData.usarEdad ? editData.fecha_nacimiento : null,
      telefono: editData.telefono && editData.telefono.trim() !== '' ? editData.telefono : null,
      comunidad_pueblo: editData.comunidad_pueblo || null,
      
      // ✅ Severidad manual (si fue cambiada manualmente por el usuario)
      _flagWorst: editData._flagWorst || null,
      severidad_manual: editData.severityManuallySet ? editData._flagWorst : null,
      
      // Signos Vitales
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
      
      // Hábitos
      tabaco_actual: editData.tabaco_actual || false,
      tabaco_actual_cantidad: editData.tabaco_actual ? editData.tabaco_actual_cantidad : null,
      alcohol_actual: editData.alcohol_actual || false,
      alcohol_actual_cantidad: editData.alcohol_actual ? editData.alcohol_actual_cantidad : null,
      drogas_actual: editData.drogas_actual || false,
      drogas_actual_cantidad: editData.drogas_actual ? editData.drogas_actual_cantidad : null,
      tabaco_pasado: editData.tabaco_pasado || false,
      tabaco_pasado_cantidad: editData.tabaco_pasado ? editData.tabaco_pasado_cantidad : null,
      alcohol_pasado: editData.alcohol_pasado || false,
      alcohol_pasado_cantidad: editData.alcohol_pasado ? editData.alcohol_pasado_cantidad : null,
      drogas_pasado: editData.drogas_pasado || false,
      drogas_pasado_cantidad: editData.drogas_pasado ? editData.drogas_pasado_cantidad : null,
      
      // Salud Reproductiva
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
      
      // Datos de Consulta
      consulta: {
        tipo_consulta: editData.tipo_consulta || 'Other',
        consult_other_text: editData.consult_other_text ?? null,
        chief_complaint: editData.chief_complaint || 'N/A',
        paciente_en_ayuno: editData.paciente_en_ayuno || false,
        medicamento_bp_tomado: editData.medicamento_bp_tomado || false,
        medicamento_bs_tomado: editData.medicamento_bs_tomado || false,
        vitamins: editData.vitamins ? Number(editData.vitamins) : null,
        albendazole: editData.albendazole ? Number(editData.albendazole) : null,
        historia_enfermedad_actual: editData.historia_enfermedad_actual ?? null,
        diagnosticos_previos: editData.diagnosticos_previos ?? null,
        cirugias_previas: editData.cirugias_previas ?? null,
        medicamentos_actuales: editData.medicamentos_actuales ?? null,
        examen_corazon: editData.examen_corazon ?? null,
        examen_pulmones: editData.examen_pulmones ?? null,
        examen_abdomen: editData.examen_abdomen ?? null,
        examen_ginecologico: editData.examen_ginecologico ?? null,
        impresion: editData.impresion ?? null,
        plan: editData.plan ?? null,
        rx_notes: editData.rx_notes ?? null,
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

      const res = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Backend error: ${errorData.error || res.statusText}`);
      }

      // ✅ ESPERAR a que se recargue el paciente Y se actualice editData
      // PERO: Si el usuario cambió la severidad manualmente, NO la sobrescribir
      const severityWasManual = editData.severityManuallySet;
      const manualSeverityValue = editData._flagWorst;
      
      const refreshResult = await refreshPatient(severityWasManual, manualSeverityValue);
      if (!refreshResult.success) {
        throw new Error('Failed to refresh after save');
      }

      // Verificar si hay cambios en signos vitales para reclasificar
      // SOLO si NO fue severidad manual
      const vitalsChanged =
        payload.presion_arterial_sistolica !== paciente.presion_arterial_sistolica ||
        payload.presion_arterial_diastolica !== paciente.presion_arterial_diastolica ||
        payload.glucosa !== paciente.glucosa ||
        payload.saturacion_oxigeno !== paciente.saturacion_oxigeno ||
        payload.temperatura !== paciente.temperatura;

      if (vitalsChanged && !severityWasManual) {
        await reclassifySeverity();
      }

      Alert.alert('Éxito', 'Cambios guardados correctamente');
      return { success: true };

    } catch (e) {
      console.error('Error saving changes:', e);
      if (e.message === 'offline') {
        await OfflineStorage.savePendingPatientUpdate(payload);
        Alert.alert('Sin conexión', 'Los cambios se guardarán cuando haya conexión');
      } else {
        Alert.alert('Error', `No se pudo guardar: ${e.message}`);
      }
      return { success: false, error: e.message };
    }
  };

  const refreshPatient = async (preserveSeverity = false, manualSeverityValue = null) => {
    try {
      const res = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}`);
      if (res.ok) {
        const updatedPaciente = await res.json();
        setPaciente(updatedPaciente);
        
        // Actualizar estados locales
        setLocalPeso(updatedPaciente.peso?.toString() || '');
        setLocalAltura(updatedPaciente.estatura?.toString() || '');
        
        // ✅ Cargar severidad manual desde backend si existe
        if (updatedPaciente.severidad_manual) {
          console.log('🔄 Cargando severidad manual desde backend:', updatedPaciente.severidad_manual);
          setLocalSeverity(updatedPaciente.severidad_manual);
        } else if (!preserveSeverity) {
          setLocalSeverity(updatedPaciente._flagWorst || '');
        } else if (manualSeverityValue) {
          setLocalSeverity(manualSeverityValue);
        }
        
        setCalcIMC(updatedPaciente.peso && updatedPaciente.estatura
          ? (updatedPaciente.peso / Math.pow(updatedPaciente.estatura / 100, 2)).toFixed(2)
          : null);

        // Actualizar editData con datos frescos
        const lmpParsed = parseLMPDate(updatedPaciente.ultima_menstruacion);
        
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
          
          // ✅ Cargar severidad y flag de manual
          _flagWorst: updatedPaciente.severidad_manual || updatedPaciente._flagWorst || '',
          severityManuallySet: !!updatedPaciente.severidad_manual,
          
          presion_arterial_sistolica: updatedPaciente.presion_arterial_sistolica?.toString() || '',
          presion_arterial_diastolica: updatedPaciente.presion_arterial_diastolica?.toString() || '',
          frecuencia_cardiaca: updatedPaciente.frecuencia_cardiaca?.toString() || '',
          saturacion_oxigeno: updatedPaciente.saturacion_oxigeno?.toString() || '',
          glucosa: updatedPaciente.glucosa?.toString() || '',
          temperatura: updatedPaciente.temperatura?.toString() || '',
          peso: updatedPaciente.peso?.toString() || '',
          estatura: updatedPaciente.estatura?.toString() || '',
          tipo_consulta: updatedPaciente.consultas?.[0]?.tipo_consulta || '',
          consult_other_text: updatedPaciente.consultas?.[0]?.consult_other_text || '',
          chief_complaint: updatedPaciente.consultas?.[0]?.chief_complaint || '',
          alergias: updatedPaciente.alergias || '',
          tiene_alergias: !!updatedPaciente.alergias,
          vitamins: updatedPaciente.consultas?.[0]?.vitamins || '',
          albendazole: updatedPaciente.consultas?.[0]?.albendazole || '',
          paciente_en_ayuno: updatedPaciente.consultas?.[0]?.paciente_en_ayuno || false,
          medicamento_bp_tomado: updatedPaciente.consultas?.[0]?.medicamento_bp_tomado || false,
          medicamento_bs_tomado: updatedPaciente.consultas?.[0]?.medicamento_bs_tomado || false,
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
          ultima_menstruacion: updatedPaciente.ultima_menstruacion || '',
          lmp_month: lmpParsed.month,
          lmp_day: lmpParsed.day,
          lmp_year: lmpParsed.year,
          menopause: updatedPaciente.menopausia || false,
          gravida: updatedPaciente.gestaciones?.toString() || '',
          para: updatedPaciente.partos?.toString() || '',
          miscarriage: updatedPaciente.abortos_espontaneos?.toString() || '',
          abortion: updatedPaciente.abortos_inducidos?.toString() || '',
          usa_anticonceptivos: updatedPaciente.usa_anticonceptivos || false,
          birth_control: updatedPaciente.metodo_anticonceptivo || 'Ninguno',
          historia_enfermedad_actual: updatedPaciente.consultas?.[0]?.historia_enfermedad_actual || '',
          diagnosticos_previos: updatedPaciente.consultas?.[0]?.diagnosticos_previos || '',
          cirugias_previas: updatedPaciente.consultas?.[0]?.cirugias_previas || '',
          medicamentos_actuales: updatedPaciente.consultas?.[0]?.medicamentos_actuales || '',
          examen_corazon: updatedPaciente.consultas?.[0]?.examen_corazon || '',
          examen_pulmones: updatedPaciente.consultas?.[0]?.examen_pulmones || '',
          examen_abdomen: updatedPaciente.consultas?.[0]?.examen_abdomen || '',
          examen_ginecologico: updatedPaciente.consultas?.[0]?.examen_ginecologico || '',
          impresion: updatedPaciente.consultas?.[0]?.impresion || '',
          plan: updatedPaciente.consultas?.[0]?.plan || '',
          rx_notes: updatedPaciente.consultas?.[0]?.rx_notes || '',
          further_consult_gensurg: updatedPaciente.consultas?.[0]?.further_consult?.toLowerCase().includes('gen') || false,
          further_consult_gyn: updatedPaciente.consultas?.[0]?.further_consult?.toLowerCase().includes('gyn') || false,
          further_consult_other: updatedPaciente.consultas?.[0]?.further_consult?.toLowerCase().includes('other') || false,
          further_consult_other_text: updatedPaciente.consultas?.[0]?.further_consult_other_text || '',
          provider: updatedPaciente.consultas?.[0]?.provider || '',
          interprete: updatedPaciente.consultas?.[0]?.interprete || '',
          surgical_date: updatedPaciente.consultas?.[0]?.surgical_date || '',
          surgical_history: updatedPaciente.consultas?.[0]?.surgical_history || '',
          surgical_exam: updatedPaciente.consultas?.[0]?.surgical_exam || '',
          surgical_impression: updatedPaciente.consultas?.[0]?.surgical_impression || '',
          surgical_plan: updatedPaciente.consultas?.[0]?.surgical_plan || '',
          surgical_meds: updatedPaciente.consultas?.[0]?.surgical_meds || '',
          surgical_consult_gensurg: updatedPaciente.consultas?.[0]?.surgical_consult?.toLowerCase().includes('gen') || false,
          surgical_consult_gyn: updatedPaciente.consultas?.[0]?.surgical_consult?.toLowerCase().includes('gyn') || false,
          surgical_consult_other: updatedPaciente.consultas?.[0]?.surgical_consult?.toLowerCase().includes('other') || false,
          surgical_consult_other_text: updatedPaciente.consultas?.[0]?.surgical_consult_other_text || '',
          surgical_surgeon: updatedPaciente.consultas?.[0]?.surgical_surgeon || '',
          surgical_interpreter: updatedPaciente.consultas?.[0]?.surgical_interpreter || '',
          surgical_notes: updatedPaciente.consultas?.[0]?.surgical_notes || '',
          rx_slips_attached: updatedPaciente.consultas?.[0]?.rx_slips_attached || false,
        });

        Alert.alert('Recargado', 'Datos actualizados correctamente');
        return { success: true };
      }
    } catch (e) {
      console.error('Error refreshing patient:', e);
      Alert.alert('Error', 'No se pudo recargar los datos del paciente');
      return { success: false, error: e.message };
    }
  };

  const reclassifySeverity = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/pacientes/${paciente.id_paciente}/reclassify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Error al reclasificar');

      const data = await res.json();
      const { severidad } = data;

      setLocalSeverity(severidad);

      // Recargar paciente actualizado
      await refreshPatient();

      return { success: true, severidad };

    } catch (e) {
      console.error('Error reclassifying:', e);
      Alert.alert('Error', 'No se pudo reclasificar la severidad');
      return { success: false, error: e.message };
    }
  };

  return {
    saveChanges,
    refreshPatient,
    reclassifySeverity
  };
}
