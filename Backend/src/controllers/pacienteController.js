// Backend/src/controllers/pacienteController.js
const { Op } = require('sequelize');
const Paciente = require('../models/Paciente');
const Consulta = require('../models/Consulta');
const Signos = require('../models/SignosVitalesHistorial');
const CirugiaPaciente = require('../models/CirugiaPaciente');
const HistorialMedico = require('../models/HistorialMedico');
const AlertaMedica = require('../models/AlertaMedica');

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
    const { q, estado, comunidad, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (estado) where.estado_paciente = estado;
    if (comunidad) where.comunidad_pueblo = comunidad;
    if (q) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${q}%` } },
        { apellido: { [Op.iLike]: `%${q}%` } },
        { comunidad_pueblo: { [Op.iLike]: `%${q}%` } }
      ];
    }

    const pacientes = await Paciente.findAll({
      where,
      order: [['nombre', 'ASC']],
      limit: Number(limit),
      offset: Number(offset)
    });

    res.json(pacientes);
  } catch (err) {
    console.error('Error getPacientes:', err);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
};

exports.getPacienteById = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id, {
      include: [
        { model: Consulta, as: 'consultas', order: [['fecha', 'DESC']] },
        { model: Signos, as: 'signos', order: [['fecha_toma', 'DESC']] },
        { model: CirugiaPaciente, as: 'cirugias' },
        { model: HistorialMedico, as: 'historial' },
        { model: AlertaMedica, as: 'alertasMedicas', order: [['fecha_alerta', 'DESC']] }
      ]
    });
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
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
