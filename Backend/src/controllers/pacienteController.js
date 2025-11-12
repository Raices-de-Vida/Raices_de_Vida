const { Op } = require('sequelize');
const Paciente = require('../models/Paciente');
const Consulta = require('../models/Consulta');
const Signos = require('../models/SignosVitalesHistorial');
const CirugiaPaciente = require('../models/CirugiaPaciente');
const HistorialMedico = require('../models/HistorialMedico');
const AlertaMedica = require('../models/AlertaMedica');
const { fillConsultSummaryPDF } = require('../services/pdfService');

exports.createPaciente = async (req, res) => {
  try {
    // Separar datos de paciente y datos de consulta
    const {
      // Campos de consulta médica (para crear registro en Consultas)
      tipo_consulta, consult_other_text, chief_complaint,
      vitamins, albendazole,
      historia_enfermedad_actual, diagnosticos_previos, cirugias_previas, medicamentos_actuales,
      examen_corazon, examen_pulmones, examen_abdomen, examen_ginecologico,
      impresion, plan, rx_notes, further_consult, further_consult_other_text,
      provider, interprete,
      paciente_en_ayuno, medicamento_bp_tomado, medicamento_bs_tomado,
      surgical_date, surgical_history, surgical_exam, surgical_impression,
      surgical_plan, surgical_meds, surgical_consult, surgical_consult_other_text,
      surgical_surgeon, surgical_interpreter, surgical_notes, rx_slips_attached,
      ...datosPaciente // Resto de campos son para Paciente
    } = req.body;
    
    // Crear paciente
    const paciente = await Paciente.create(datosPaciente);
    
    // Si vienen datos de consulta, crear registro de consulta
    let consulta = null;
    if (tipo_consulta && chief_complaint) {
      consulta = await Consulta.create({
        id_paciente: paciente.id_paciente,
        idioma: datosPaciente.idioma,
        tipo_consulta,
        consult_other_text,
        chief_complaint,
        vitamins,
        albendazole,
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
        further_consult_other_text,
        provider,
        interprete,
        paciente_en_ayuno,
        medicamento_bp_tomado,
        medicamento_bs_tomado,
        surgical_date,
        surgical_history,
        surgical_exam,
        surgical_impression,
        surgical_plan,
        surgical_meds,
        surgical_consult,
        surgical_consult_other_text,
        surgical_surgeon,
        surgical_interpreter,
        surgical_notes,
        rx_slips_attached
      });
    }
    
    const pacienteCompleto = await Paciente.findByPk(paciente.id_paciente, {
      include: [
        { model: Consulta, as: 'consultas' }
      ]
    });
    
    res.status(201).json(pacienteCompleto);
  } catch (err) {
    console.error('Error createPaciente:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getPacientes = async (req, res) => {
  try {
    const { q, estado, comunidad, limit = 50, offset = 0, minEdad, maxEdad, genero, minIMC, maxIMC } = req.query;

    const where = {};
    if (estado) where.estado_paciente = estado;
    if (comunidad) where.comunidad_pueblo = comunidad;
    if (genero) where.genero = genero;
    if (minEdad) where.edad = { ...(where.edad || {}), [Op.gte]: Number(minEdad) };
    if (maxEdad) where.edad = { ...(where.edad || {}), [Op.lte]: Number(maxEdad) };
    if (q) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${q}%` } },
        { apellido: { [Op.iLike]: `%${q}%` } },
        { comunidad_pueblo: { [Op.iLike]: `%${q}%` } }
      ];
    }

    //filter por IMC usando snapshot (peso y estatura en Pacientes)
    const havingIMC = [];
    const replacements = {};
    if (minIMC) { havingIMC.push(`(peso / POWER(estatura/100.0, 2)) >= :minIMC`); replacements.minIMC = Number(minIMC); }
    if (maxIMC) { havingIMC.push(`(peso / POWER(estatura/100.0, 2)) <= :maxIMC`); replacements.maxIMC = Number(maxIMC); }

    const pacientes = await Paciente.findAll({
      where,
      order: [['nombre', 'ASC']],
      limit: Number(limit),
      offset: Number(offset),
      include: [
        { model: Consulta, as: 'consultas', order: [['fecha', 'DESC']] }
      ],
      ...(havingIMC.length > 0
        ? { where: { ...where, peso: { [Op.ne]: null }, estatura: { [Op.ne]: null } },
            having: Paciente.sequelize.literal(havingIMC.join(' AND ')),
            group: ['Pacientes.id_paciente'] } : {})
    }, { replacements });

    res.json(pacientes);
  } catch (err) {
    console.error('Error getPacientes:', err);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
};

exports.getPacienteById = async (req, res) => {
  try {
    let paciente = await Paciente.findByPk(req.params.id, {
      include: [
        { model: Consulta, as: 'consultas', order: [['fecha', 'DESC']] },
        { model: Signos, as: 'signos', order: [['fecha_toma', 'DESC']] },
        { model: CirugiaPaciente, as: 'cirugias' },
        { model: HistorialMedico, as: 'historial' },
        { model: AlertaMedica, as: 'alertasMedicas', order: [['fecha_alerta', 'DESC']] }
      ]
    });
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
    paciente = paciente.toJSON();
    
    // Calcular IMC
    if (paciente.peso && paciente.estatura) {
      const imc = Number(paciente.peso) / Math.pow(Number(paciente.estatura)/100,2);
      paciente.imc = Number(imc.toFixed(2));
      paciente.imc_categoria = classifyIMC(imc);
    }
    
    if (paciente.severidad_manual) {
      paciente._flagWorst = paciente.severidad_manual;
      console.log('Usando severidad manual:', paciente.severidad_manual);
    } else if (paciente.alertasMedicas && paciente.alertasMedicas.length > 0) {
      const prioridadMap = { 'Crítica': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
      const maxPrioridad = Math.max(...paciente.alertasMedicas.map(a => prioridadMap[a.prioridad_medica] || 0));
      paciente._flagWorst = Object.keys(prioridadMap).find(k => prioridadMap[k] === maxPrioridad) || null;
      console.log('Calculando severidad desde alertas:', paciente._flagWorst);
    } else {
      paciente._flagWorst = null;
      console.log('No hay severidad ni alertas');
    }
    
    res.json(paciente);
  } catch (err) {
    console.error('Error getPacienteById:', err);
    res.status(500).json({ error: 'Error al obtener paciente' });
  }
};

exports.updatePaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    const { consulta, ...datosPaciente } = req.body;
    
    
    if (datosPaciente.severidad_manual !== undefined) {
    }
    
    await paciente.update(datosPaciente);
    
    if (consulta && Object.keys(consulta).length > 0) {
      const ultimaConsulta = await Consulta.findOne({
        where: { id_paciente: req.params.id },
        order: [['fecha', 'DESC']]
      });
      
      
      if (ultimaConsulta) {
        // Actualizar última consulta
        await ultimaConsulta.update(consulta);
        console.log('Consulta actualizada. Nuevos valores:', {
          tipo_consulta: ultimaConsulta.tipo_consulta,
          chief_complaint: ultimaConsulta.chief_complaint
        });
      } else {
        // Crear nueva consulta
        console.log('Creando nueva consulta');
        const nuevaConsulta = await Consulta.create({
          id_paciente: req.params.id,
          ...consulta
        });
        console.log('Consulta creada:', nuevaConsulta.id_consulta);
      }
    } else {
      console.log('No se recibieron datos de consulta');
    }
    
    // Recargar paciente con relaciones
    const pacienteActualizado = await Paciente.findByPk(req.params.id, {
      include: [{ model: Consulta, as: 'consultas' }]
    });
    
    res.json(pacienteActualizado);
  } catch (err) {
    console.error('Error updatePaciente:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.updatePacienteBasic = async (req, res) => {
  try {
    const { id } = req.params;
    const { peso_kg, altura_cm, manualSeverity } = req.body || {};
    const paciente = await Paciente.findByPk(id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    const updates = {};
    if (peso_kg !== undefined) updates.peso = peso_kg === null ? null : Number(peso_kg);
    if (altura_cm !== undefined) updates.estatura = altura_cm === null ? null : Number(altura_cm);
    let imc = null;
    if (updates.peso && updates.estatura) {
      const estM = Number(updates.estatura) / 100;
      if (estM > 0) imc = Number(updates.peso) / (estM * estM);
    }

    if (Object.keys(updates).length > 0) {
      updates.fecha_ultima_actualizacion = new Date();
      await paciente.update(updates);
    }

    let createdAlert = null;
    if (manualSeverity) {
      const map = { 'Baja':'Baja','Media':'Media','Alta':'Alta','Crítica':'Crítica' };
      if (!map[manualSeverity]) {
        return res.status(400).json({ error: 'manualSeverity inválido' });
      }
      createdAlert = await AlertaMedica.create({
        id_paciente: id,
        tipo_alerta_medica: 'Otro',
        descripcion_medica: `Override manual de severidad (${manualSeverity})`,
        prioridad_medica: manualSeverity,
        estado_alerta: 'Pendiente'
      });
    }

    let out = paciente.toJSON();
    if (out.peso && out.estatura) {
      const bmiCalc = Number(out.peso) / Math.pow(Number(out.estatura)/100,2);
      out.imc = Number(bmiCalc.toFixed(2));
      out.imc_categoria = classifyIMC(bmiCalc);
    }
    res.json({ ok: true, paciente: out, imc: out.imc || null, imc_categoria: out.imc_categoria || null, manualAlert: createdAlert });
  } catch (err) {
    console.error('Error updatePacienteBasic:', err);
    res.status(400).json({ error: err.message });
  }
};

function classifyIMC(imc) {
  if (imc < 18.5) return 'Bajo';
  if (imc < 25) return 'Normal';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidad I';
  if (imc < 40) return 'Obesidad II';
  return 'Obesidad III';
}

exports.deletePaciente = async (req, res) => {
  try {
    const deleted = await Paciente.destroy({ where: { id_paciente: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deletePaciente:', err);
    res.status(500).json({ error: 'Error al eliminar paciente' });
  }
};

/* ------- Endpoints anidados ------- */

// POST /:id/signos  (inserta en historial; trigger actualiza snapshot en Pacientes)
exports.addSignos = async (req, res) => {
  try {
    const { id } = req.params;
    const existe = await Paciente.findByPk(id);
    if (!existe) return res.status(404).json({ error: 'Paciente no encontrado' });

    const row = await Signos.create({ ...req.body, id_paciente: id });
    res.status(201).json(row);
  } catch (err) {
    console.error('Error addSignos:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getSignos = async (req, res) => {
  try {
    const rows = await Signos.findAll({
      where: { id_paciente: req.params.id },
      order: [['fecha_toma', 'DESC']]
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener signos' });
  }
};

// POST /:id/consultas
exports.addConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    const existe = await Paciente.findByPk(id);
    if (!existe) return res.status(404).json({ error: 'Paciente no encontrado' });

    const row = await Consulta.create({ ...req.body, id_paciente: id });
    res.status(201).json(row);
  } catch (err) {
    console.error('Error addConsulta:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getConsultas = async (req, res) => {
  try {
    const rows = await Consulta.findAll({
      where: { id_paciente: req.params.id },
      order: [['fecha', 'DESC']]
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener consultas' });
  }
};

// POST /:id/alertas-medicas
exports.addAlertaMedica = async (req, res) => {
  try {
    const { id } = req.params;
    const existe = await Paciente.findByPk(id);
    if (!existe) return res.status(404).json({ error: 'Paciente no encontrado' });

    const row = await AlertaMedica.create({ ...req.body, id_paciente: id });
    res.status(201).json(row);
  } catch (err) {
    console.error('Error addAlertaMedica:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAlertasMedicas = async (req, res) => {
  try {
    const rows = await AlertaMedica.findAll({
      where: { id_paciente: req.params.id },
      order: [['fecha_alerta', 'DESC']]
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alertas médicas' });
  }
};

// GET /flags-summary?ids=1,2,3  -> { summaries: [{ id_paciente, maxPrioridad }] }
exports.getFlagsSummary = async (req, res) => {
  try {
    const idsParam = String(req.query.ids || '').trim();
    if (!idsParam) return res.json({ summaries: [] });
    const ids = idsParam.split(',').map((s) => parseInt(s, 10)).filter(Boolean);
    if (ids.length === 0) return res.json({ summaries: [] });

    const rows = await AlertaMedica.findAll({
      where: { id_paciente: { [Op.in]: ids }, estado_alerta: { [Op.ne]: 'Cerrada' } },
      attributes: ['id_paciente', 'prioridad_medica']
    });

    const weight = { 'Crítica': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
    const best = new Map();
    for (const r of rows) {
      const w = weight[r.prioridad_medica] || 0;
      const prev = best.get(r.id_paciente) || { w: 0, prioridad: null };
      if (w > prev.w) best.set(r.id_paciente, { w, prioridad: r.prioridad_medica });
    }
    const summaries = ids.map((id) => ({ id_paciente: id, maxPrioridad: best.get(id)?.prioridad || null }));
    res.json({ summaries });
  } catch (err) {
    console.error('Error getFlagsSummary:', err);
    res.status(500).json({ error: 'Error al obtener resumen de flags' });
  }
};

exports.setManualFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const { nivel, descripcion } = req.body || {};
    const existe = await Paciente.findByPk(id);
    if (!existe) return res.status(404).json({ error: 'Paciente no encontrado' });

    const map = {
      verde: 'Baja',
      amarillo: 'Media',
      naranja: 'Alta',
      rojo: 'Crítica'
    };

    if (!nivel) return res.status(400).json({ error: 'nivel requerido' });

    if (nivel.toLowerCase() === 'celeste') {
      const closed = await AlertaMedica.update(
        { estado_alerta: 'Cerrada', fecha_atencion: new Date() },
        { where: { id_paciente: id, estado_alerta: { [Op.ne]: 'Cerrada' } } }
      );
      return res.json({ mensaje: 'Flags cerrados', result: closed });
    }

    const prioridad = map[nivel.toLowerCase()];
    if (!prioridad) return res.status(400).json({ error: 'nivel inválido' });

    const row = await AlertaMedica.create({
      id_paciente: id,
      tipo_alerta_medica: 'Otro',
      descripcion_medica: descripcion || `Flag manual: ${nivel}`,
      prioridad_medica: prioridad,
      estado_alerta: 'Pendiente'
    });
    return res.status(201).json(row);
  } catch (err) {
    console.error('Error setManualFlag:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.closeAllFlags = async (req, res) => {
  try {
    const { id } = req.params;
    const existe = await Paciente.findByPk(id);
    if (!existe) return res.status(404).json({ error: 'Paciente no encontrado' });
    const result = await AlertaMedica.update(
      { estado_alerta: 'Cerrada', fecha_atencion: new Date() },
      { where: { id_paciente: id, estado_alerta: { [Op.ne]: 'Cerrada' } } }
    );
    res.json({ mensaje: 'Todas las alertas cerradas', result });
  } catch (err) {
    console.error('Error closeAllFlags:', err);
    res.status(500).json({ error: 'Error al cerrar alertas' });
  }
};

//genera PDF del formulario Patient Consult Summary
exports.exportarPDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    //datos completos del paciente
    const paciente = await Paciente.findByPk(id, {
      include: [
        { model: Consulta, as: 'consultas', order: [['fecha', 'DESC']], limit: 1 },
        { model: Signos, as: 'signos', order: [['fecha_toma', 'DESC']], limit: 1 },
        { model: CirugiaPaciente, as: 'cirugias' },
        { model: HistorialMedico, as: 'historial' },
        { model: AlertaMedica, as: 'alertasMedicas', order: [['fecha_alerta', 'DESC']] }
      ]
    });
    
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    //prep datos para el PDF
    const datosPaciente = mapearDatosPaciente(paciente);
    const pdfBuffer = await fillConsultSummaryPDF(datosPaciente);
    const filename = `Patient_Consult_${paciente.nombre}_${paciente.apellido || ''}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error exportarPDF:', err);
    res.status(500).json({ error: 'Error al generar PDF', details: err.message });
  }
};

/**
 * Mapea los datos del modelo Sequelize al formato esperado por el servicio PDF
 */
function mapearDatosPaciente(paciente) {
  const p = paciente.toJSON();
  const ultimaConsulta = p.consultas?.[0] || {};
  const ultimosSignos = p.signos?.[0] || {};
  
  // Calcular edad si hay fecha de nacimiento
  let edadCalculada = p.edad;
  if (p.fecha_nacimiento && !p.edad) {
    const hoy = new Date();
    const nacimiento = new Date(p.fecha_nacimiento);
    edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edadCalculada--;
    }
  }
  
  // Formatear última menstruación con espacios: "MM    DD    YYYY"
  let lmpFormateado = '';
  if (p.ultima_menstruacion) {
    const fecha = new Date(p.ultima_menstruacion);
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const anio = String(fecha.getFullYear());
    lmpFormateado = `${mes}    ${dia}    ${anio}`;
  }
  
  // Combinar examen quirúrgico si está separado en campos
  let surgical_exam_combined = '';
  if (typeof ultimaConsulta.surgical_exam === 'string') {
    surgical_exam_combined = ultimaConsulta.surgical_exam;
  } else if (ultimaConsulta.surgical_exam && typeof ultimaConsulta.surgical_exam === 'object') {
    const parts = [];
    if (ultimaConsulta.surgical_exam.heart) parts.push(`Heart: ${ultimaConsulta.surgical_exam.heart}`);
    if (ultimaConsulta.surgical_exam.lungs) parts.push(`Lungs: ${ultimaConsulta.surgical_exam.lungs}`);
    if (ultimaConsulta.surgical_exam.abdomen) parts.push(`Abdomen: ${ultimaConsulta.surgical_exam.abdomen}`);
    if (ultimaConsulta.surgical_exam.gyn) parts.push(`Gyn: ${ultimaConsulta.surgical_exam.gyn}`);
    surgical_exam_combined = parts.join('. ');
  }
  
  return {
    // Info básica
    date: new Date().toLocaleDateString('en-US'),
    language: p.idioma || ultimaConsulta.idioma || 'Spanish',
    patient_name: `${p.nombre} ${p.apellido || ''}`.trim(),
    phone: p.telefono || '',
    town: p.comunidad_pueblo || '',
    
    // IMPORTANTE: Preferir Age sobre DOB - solo enviar uno
    dob: '', // Dejar vacío para que solo se imprima Age
    age: edadCalculada ? `${edadCalculada}` : '', // Solo el número
    
    gender: p.genero || '',
    
    // Tipo de consulta
    consult_type: ultimaConsulta.tipo_consulta || '',
    consult_other_text: ultimaConsulta.consult_other_text || '',
    chief_complaint: ultimaConsulta.chief_complaint || '',
    
    // Signos vitales (preferir snapshot del paciente sobre historial)
    vitals: {
      bp: p.presion_arterial_sistolica && p.presion_arterial_diastolica
        ? `${p.presion_arterial_sistolica} / ${p.presion_arterial_diastolica}`
        : '',
      hr: p.frecuencia_cardiaca || '',
      spo2: p.saturacion_oxigeno ? `${p.saturacion_oxigeno}` : '',
      bs: p.glucosa || '',
      weight: p.peso ? `${p.peso} kg` : '',
      height: p.estatura ? `${p.estatura} cm` : '',
      temp: p.temperatura ? `${p.temperatura}°C` : '',
    },
    
    // Flags médicos
    fasting: ultimaConsulta.paciente_en_ayuno ? 'Y' : 'N',
    taken_med_bp: ultimaConsulta.medicamento_bp_tomado ? 'Y' : 'N',
    taken_med_bs: ultimaConsulta.medicamento_bs_tomado ? 'Y' : 'N',
    
    // Alergias
    allergies: p.tiene_alergias && p.alergias ? p.alergias : 'NKA',
    
    // Medicamentos preventivos
    vitamins: ultimaConsulta.vitamins || '0',
    albendazole: ultimaConsulta.albendazole || '0',
    
    // Hábitos actuales
    current: {
      tobacco: p.tabaco_actual ? 'Y' : 'N',
      tobacco_details: p.tabaco_actual_cantidad || '',
      alcohol: p.alcohol_actual ? 'Y' : 'N',
      alcohol_details: p.alcohol_actual_cantidad || '',
      drugs: p.drogas_actual ? 'Y' : 'N',
      drugs_details: p.drogas_actual_cantidad || '',
    },
    
    // Hábitos pasados
    past: {
      tobacco: p.tabaco_pasado ? 'Y' : 'N',
      tobacco_details: p.tabaco_pasado_cantidad || '',
      alcohol: p.alcohol_pasado ? 'Y' : 'N',
      alcohol_details: p.alcohol_pasado_cantidad || '',
      drugs: p.drogas_pasado ? 'Y' : 'N',
      drugs_details: p.drogas_pasado_cantidad || '',
    },
    
    // Info reproductiva (solo para mujeres)
    lmp: p.genero === 'F' ? lmpFormateado : '',
    menopause: p.genero === 'F' && p.menopausia ? 'Yes' : 'No',
    gravida: p.genero === 'F' && p.gestaciones ? `${p.gestaciones}` : '0',
    para: p.genero === 'F' && p.partos ? `${p.partos}` : '0',
    miscarriage: p.genero === 'F' && p.abortos_espontaneos ? `${p.abortos_espontaneos}` : '0',
    abortion: p.genero === 'F' && p.abortos_inducidos ? `${p.abortos_inducidos}` : '0',
    uses_birth_control: p.genero === 'F' && p.usa_anticonceptivos,
    control_method: p.genero === 'F' ? (p.metodo_anticonceptivo || 'Ninguno') : '',
    
    // Historia clínica
    history: ultimaConsulta.historia_enfermedad_actual || '',
    medical_dx: ultimaConsulta.diagnosticos_previos || '',
    surgeries: ultimaConsulta.cirugias_previas || '',
    meds: ultimaConsulta.medicamentos_actuales || '',
    
    // Examen físico
    physical_exam: {
      heart: ultimaConsulta.examen_corazon || '',
      lungs: ultimaConsulta.examen_pulmones || '',
      abdomen: ultimaConsulta.examen_abdomen || '',
      gyn: ultimaConsulta.examen_ginecologico || '',
    },
    
    // Evaluación y plan
    impression: ultimaConsulta.impresion || '',
    plan: ultimaConsulta.plan || '',
    rx_notes: ultimaConsulta.rx_notes || '',
    
    // Consulta adicional
    further_consult: ultimaConsulta.further_consult || '',
    further_consult_other_text: ultimaConsulta.further_consult_other_text || '',
    
    // Proveedor e intérprete
    provider: ultimaConsulta.provider || '',
    interpreter: ultimaConsulta.interprete || '',
    
    // Página 2 - Surgical Consult Summary
    surgical_date: ultimaConsulta.surgical_date ? new Date(ultimaConsulta.surgical_date).toLocaleDateString('en-US') : '',
    surgical_history: ultimaConsulta.surgical_history || '',
    surgical_exam: surgical_exam_combined,
    surgical_impression: ultimaConsulta.surgical_impression || '',
    surgical_plan: ultimaConsulta.surgical_plan || '',
    surgical_meds: ultimaConsulta.surgical_meds || '',
    surgical_consult: ultimaConsulta.surgical_consult || '',
    surgical_consult_other_text: ultimaConsulta.surgical_consult_other_text || '',
    surgical_surgeon: ultimaConsulta.surgical_surgeon || '',
    surgical_interpreter: ultimaConsulta.surgical_interpreter || '',
    surgical_notes: ultimaConsulta.surgical_notes || '',
    rx_slips_attached: ultimaConsulta.rx_slips_attached || false,
  };
}

// POST /:id/reclassify - Recalcular severidad basada en signos vitales actuales
exports.reclassifySeverity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const paciente = await Paciente.findByPk(id);
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    // Obtener signos vitales actuales del paciente
    const { 
      presion_arterial_sistolica, 
      presion_arterial_diastolica, 
      glucosa, 
      saturacion_oxigeno, 
      temperatura 
    } = paciente;
    
    // Calcular severidad basada en signos vitales
    let severidad = 'Baja';
    const flags = [];

    // Presión arterial
    if (presion_arterial_sistolica && presion_arterial_diastolica) {
      if (presion_arterial_sistolica >= 180 || presion_arterial_diastolica >= 120) {
        flags.push({ nivel: 'Crítica', desc: 'Hipertensión severa' });
      } else if (presion_arterial_sistolica >= 160 || presion_arterial_diastolica >= 100) {
        flags.push({ nivel: 'Alta', desc: 'Hipertensión moderada' });
      } else if (presion_arterial_sistolica >= 140 || presion_arterial_diastolica >= 90) {
        flags.push({ nivel: 'Media', desc: 'Hipertensión leve' });
      } else if (presion_arterial_sistolica < 90 || presion_arterial_diastolica < 60) {
        flags.push({ nivel: 'Alta', desc: 'Hipotensión' });
      }
    }

    // Glucosa
    if (glucosa) {
      if (glucosa >= 300) {
        flags.push({ nivel: 'Crítica', desc: 'Hiperglucemia severa' });
      } else if (glucosa >= 200) {
        flags.push({ nivel: 'Alta', desc: 'Hiperglucemia moderada' });
      } else if (glucosa >= 140) {
        flags.push({ nivel: 'Media', desc: 'Hiperglucemia leve' });
      } else if (glucosa < 60) {
        flags.push({ nivel: 'Alta', desc: 'Hipoglucemia' });
      } else if (glucosa < 70) {
        flags.push({ nivel: 'Media', desc: 'Hipoglucemia leve' });
      }
    }

    // SpO2
    if (saturacion_oxigeno) {
      if (saturacion_oxigeno < 85) {
        flags.push({ nivel: 'Crítica', desc: 'Hipoxemia severa' });
      } else if (saturacion_oxigeno < 90) {
        flags.push({ nivel: 'Alta', desc: 'Hipoxemia moderada' });
      } else if (saturacion_oxigeno < 94) {
        flags.push({ nivel: 'Media', desc: 'Saturación baja' });
      }
    }

    // Temperatura
    if (temperatura) {
      if (temperatura >= 39.5) {
        flags.push({ nivel: 'Crítica', desc: 'Fiebre alta' });
      } else if (temperatura >= 38.5) {
        flags.push({ nivel: 'Alta', desc: 'Fiebre moderada' });
      } else if (temperatura >= 37.5) {
        flags.push({ nivel: 'Media', desc: 'Febrícula' });
      } else if (temperatura < 35) {
        flags.push({ nivel: 'Alta', desc: 'Hipotermia' });
      }
    }

    // Determinar severidad máxima
    const prioridadMap = { 'Crítica': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
    if (flags.length > 0) {
      severidad = flags.reduce((max, flag) => 
        prioridadMap[flag.nivel] > prioridadMap[max] ? flag.nivel : max, 
        'Baja'
      );
    }

    // Guardar nueva severidad como alerta manual
    await AlertaMedica.create({
      id_paciente: id,
      tipo_alerta_medica: 'Signos Vitales Críticos',
      descripcion_medica: `Reclasificación automática de severidad (${flags.map(f => f.desc).join(', ') || 'Sin alertas'})`,
      prioridad_medica: severidad,
      fecha_alerta: new Date(),
      estado_alerta: 'Pendiente'
    });

    res.json({ 
      severidad, 
      flags,
      mensaje: `Severidad reclasificada a: ${severidad}`
    });
  } catch (err) {
    console.error('Error reclassifySeverity:', err);
    res.status(500).json({ error: 'Error al reclasificar severidad', details: err.message });
  }
};
