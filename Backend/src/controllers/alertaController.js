const Alerta = require('../models/Alerta');
const CasoCritico = require('../models/CasoCritico');
const Paciente = require('../models/Paciente');
const AlertaMedica = require('../models/AlertaMedica');

exports.getAllAlertas = async (req, res) => {
  try {
    const alertas = await Alerta.findAll({
      include: [
        {
          model: CasoCritico,
          attributes: ['id_caso', 'descripcion', 'nivel_urgencia'],
          as: 'caso',
          include: [{
            model: Paciente,
            attributes: ['id_paciente', 'severidad_manual'],
            as: 'paciente'
          }]
        }
      ]
    });
    
    // Mapear alertas con la severidad correcta del paciente
    const alertasConSeveridad = alertas.map(alerta => {
      const alertaJSON = alerta.toJSON();
      
      // Si hay severidad manual, usar esa; si no, usar la calculada
      if (alertaJSON.caso?.paciente) {
        const paciente = alertaJSON.caso.paciente;
        alertaJSON.severidad_paciente = paciente.severidad_manual || alertaJSON.caso.nivel_urgencia;
      } else {
        alertaJSON.severidad_paciente = alertaJSON.caso?.nivel_urgencia || 'Media';
      }
      
      return alertaJSON;
    });
    
    res.json(alertasConSeveridad);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error al obtener las alertas' });
  }
};

//crear una nueva alerta
exports.createAlerta = async (req, res) => {
  try {
    //verificar que el caso crítico exista
    const caso = await CasoCritico.findByPk(req.body.caso_id);
    if (!caso) {
      return res.status(404).json({ error: 'El caso crítico no existe' });
    }

    const nuevaAlerta = await Alerta.create(req.body);
    res.status(201).json(nuevaAlerta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//obtener alertas por ID de caso crítico
exports.getAlertasByCasoId = async (req, res) => {
  try {
    const alertas = await Alerta.findAll({
      where: { caso_id: req.params.caso_id },
      order: [['fecha_alerta', 'DESC']] //ordenar por fecha más reciente
    });
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alertas del caso' });
  }
};

//update una alerta (ej: cambiar estado)
exports.updateAlerta = async (req, res) => {
  try {
    const alerta = await Alerta.findByPk(req.params.alerta_id);
    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    //update campos permitidos (expandido para permitir edición completa)
    const camposPermitidos = [
      'estado', 
      'respuesta', 
      'prioridad', 
      'observaciones',
      'nombre',
      'edad',
      'ubicacion',
      'comunidad',
      'descripcion'
    ];
    
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        alerta[campo] = req.body[campo];
      }
    });

    await alerta.save();
    console.log('[ALERTAS] ✅ Alerta actualizada:', alerta.alerta_id);
    res.json(alerta);
  } catch (error) {
    console.error('[ALERTAS] ❌ Error al actualizar alerta:', error);
    res.status(400).json({ error: error.message });
  }
};

// Eliminar una alerta
exports.deleteAlerta = async (req, res) => {
  try {
    const deleted = await Alerta.destroy({
      where: { alerta_id: req.params.alerta_id }
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la alerta' });
  }
};

// Auto-evaluar paciente y generar flags (alertas médicas) básicas por fuera de rango
exports.autoEvaluarPaciente = async (req, res) => {
  try {
    const { id_paciente } = req.params;
    const paciente = await Paciente.findByPk(id_paciente);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    // Get patient's name
    const nombrePaciente = paciente.nombre || 'Paciente sin nombre';

    const flags = [];
    const edad = paciente.edad || 0;
    const peso = Number(paciente.peso || 0);
    const est = Number(paciente.estatura || 0);
    const imc = est > 0 ? peso / Math.pow(est / 100, 2) : null; // estatura en cm

    // Reglas simples: peso muy bajo para cualquier edad o IMC muy bajo
    if (peso > 0 && edad > 0) {
      if (edad < 5 && peso < 12) flags.push({ tipo: 'Bajo peso infantil', prioridad: 'Alta' });
      if (edad >= 5 && edad < 12 && peso < 20) flags.push({ tipo: 'Bajo peso escolar', prioridad: 'Media' });
      if (edad >= 12 && peso < 40) flags.push({ tipo: 'Bajo peso adolescente/adulto', prioridad: 'Media' });
    }
    if (imc && imc < 16.5) flags.push({ tipo: 'IMC severamente bajo', prioridad: 'Crítica' });
    if (imc && imc < 18.5) flags.push({ tipo: 'IMC bajo', prioridad: 'Alta' });

    // Signos vitales críticos
    const sist = Number(paciente.presion_arterial_sistolica || 0);
    const diast = Number(paciente.presion_arterial_diastolica || 0);
    const sat = Number(paciente.saturacion_oxigeno || 0);
    const glu = Number(paciente.glucosa || 0);
    const temp = Number(paciente.temperatura || 0);

    if (sat && sat < 90) flags.push({ tipo: 'Hipoxemia', prioridad: 'Crítica' });
    if (temp && temp > 39.5) flags.push({ tipo: 'Hipertermia', prioridad: 'Alta' });
    if (sist && sist > 180 || diast && diast > 120) flags.push({ tipo: 'Crisis hipertensiva', prioridad: 'Crítica' });
    if (glu && glu > 300) flags.push({ tipo: 'Hiperglucemia severa', prioridad: 'Crítica' });

    // Crear alertas médicas por cada flag
    const creadas = [];
    for (const f of flags) {
      const row = await AlertaMedica.create({
        id_paciente: paciente.id_paciente,
        tipo_alerta_medica: f.tipo === 'IMC severamente bajo' || f.tipo === 'IMC bajo' ? 'Deshidratación Severa' : 'Signos Vitales Críticos',
        descripcion_medica: f.tipo,
        prioridad_medica: f.prioridad,
        estado_alerta: 'Pendiente'
      });
      creadas.push(row);
    }

    return res.json({ 
      mensaje: `Evaluadas ${flags.length} condiciones para ${nombrePaciente}`, 
      nombrePaciente,
      peso,
      flags: creadas 
    });
  } catch (error) {
    console.error('autoEvaluarPaciente error:', error);
    res.status(500).json({ error: 'Error en auto-evaluación' });
  }
};