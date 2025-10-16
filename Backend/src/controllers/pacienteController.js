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
    const paciente = await Paciente.create(req.body);
    res.status(201).json(paciente);
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
    if (paciente.peso && paciente.estatura) {
      const imc = Number(paciente.peso) / Math.pow(Number(paciente.estatura)/100,2);
      paciente.imc = Number(imc.toFixed(2));
      paciente.imc_categoria = classifyIMC(imc);
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

    await paciente.update(req.body);
    res.json(paciente);
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
  const historial = p.historial?.[0] || {};
  const cirugias = p.cirugias || [];
  
  //calc edad si hay fecha de nacimiento
  let edad = p.edad;
  if (p.fecha_nacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(p.fecha_nacimiento);
    edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
  }
  
  return {
    //info básica
    date: new Date().toLocaleDateString('en-US'),
    language: p.idioma || 'Spanish',
    patient_name: `${p.nombre} ${p.apellido || ''}`.trim(),
    phone: p.telefono || 'N/A',
    town: p.comunidad_pueblo || 'N/A',
    dob: p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toLocaleDateString('en-US') : 'N/A',
    age: edad ? `${edad} años` : 'N/A',
    gender: p.genero === 'M' ? 'M' : p.genero === 'F' ? 'F' : 'N/A',
    
    //tipo de consulta
    consult_type: ultimaConsulta.tipo_consulta || 'Other',
    chief_complaint: ultimaConsulta.motivo_consulta || ultimaConsulta.queja_principal || 'N/A',
    
    //signos vitales
    vitals: {
      bp: ultimosSignos.presion_arterial_sistolica && ultimosSignos.presion_arterial_diastolica
        ? `${ultimosSignos.presion_arterial_sistolica}/${ultimosSignos.presion_arterial_diastolica}`
        : p.presion_arterial_sistolica && p.presion_arterial_diastolica
        ? `${p.presion_arterial_sistolica}/${p.presion_arterial_diastolica}`
        : 'N/A',
      hr: ultimosSignos.frecuencia_cardiaca || p.frecuencia_cardiaca || 'N/A',
      spo2: ultimosSignos.saturacion_oxigeno || p.saturacion_oxigeno ? `${ultimosSignos.saturacion_oxigeno || p.saturacion_oxigeno}%` : 'N/A',
      bs: ultimosSignos.glucosa || p.glucosa || 'N/A',
      weight: p.peso ? `${p.peso} kg` : 'N/A',
      height: p.estatura ? `${p.estatura} cm` : 'N/A',
      temp: ultimosSignos.temperatura || p.temperatura ? `${ultimosSignos.temperatura || p.temperatura}°C` : 'N/A',
    },
    
    //alergias
    allergies: p.tiene_alergias && p.alergias ? p.alergias : 'NKA',
    
    //vitaminas y medicamentos
    vitamins: p.recibio_vitaminas ? '1' : '0',
    albendazole: p.recibio_desparasitante ? '1' : '0',
    
    //uso actual y pasado
    current: {
      tobacco: p.consume_tabaco ? 'Y' : 'N',
      alcohol: p.consume_alcohol ? 'Y' : 'N',
      drugs: p.consume_drogas ? 'Y' : 'N',
    },
    past: {
      tobacco: historial.historial_tabaco ? 'Y' : 'N',
      alcohol: historial.historial_alcohol ? 'Y' : 'N',
      drugs: historial.historial_drogas ? 'Y' : 'N',
    },
    
    //info reproductiva (para mujeres)
    lmp: p.fecha_ultima_menstruacion ? new Date(p.fecha_ultima_menstruacion).toLocaleDateString('en-US') : 'N/A',
    menopause: p.menopausia ? 'Yes' : 'No',
    gravida: p.embarazos_totales || '0',
    para: p.partos || '0',
    miscarriage: p.abortos_espontaneos || '0',
    abortion: p.abortos_inducidos || '0',
    control_method: p.metodo_anticonceptivo || 'None',
    
    //historia clínica
    history: ultimaConsulta.historia_enfermedad_actual || p.observaciones_generales || 'N/A',
    medical_dx: historial.diagnosticos_previos || historial.condiciones_cronicas || 'N/A',
    surgeries: cirugias.length > 0
      ? cirugias.map(c => `${c.tipo_cirugia} (${new Date(c.fecha_cirugia).toLocaleDateString('en-US')})`).join(', ')
      : 'N/A',
    meds: p.medicamentos_actuales || historial.medicamentos_habituales || 'N/A',
    
    //examen físico
    physical_exam: {
      heart: ultimaConsulta.examen_corazon || 'Normal',
      lungs: ultimaConsulta.examen_pulmones || 'Normal',
      abdomen: ultimaConsulta.examen_abdomen || 'Normal',
      gyn: ultimaConsulta.examen_ginecologico || 'N/A',
    },
    
    //impresión y plan
    impression: ultimaConsulta.diagnostico || ultimaConsulta.impresion_diagnostica || 'N/A',
    plan: ultimaConsulta.plan_tratamiento || ultimaConsulta.recomendaciones || 'N/A',
    rx_notes: ultimaConsulta.prescripciones || ultimaConsulta.notas_rx || 'N/A',
    
    //consulta adicional
    further_consult: ultimaConsulta.requiere_seguimiento || '',
    
    //proveedor e intérprete
    provider: ultimaConsulta.nombre_medico || 'N/A',
    interpreter: ultimaConsulta.interprete || 'N/A',
    
    //Página 2 - Notas quirúrgicas
    surgical_notes: ultimaConsulta.notas_quirurgicas || cirugias.length > 0
      ? cirugias.map(c => `${c.tipo_cirugia}: ${c.notas || 'Sin notas'}`).join('\n\n')
      : 'N/A',
    fasting: ultimaConsulta.en_ayunas ? 'Y' : 'N',
    taken_med: ultimaConsulta.tomo_medicamentos ? 'Y' : 'N',
    rx_slips_attached: ultimaConsulta.recetas_adjuntas || false,
  };
}
