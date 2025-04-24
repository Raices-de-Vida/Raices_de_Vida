const Alerta = require('../models/Alerta');
const CasoCritico = require('../models/CasoCritico');

// Obtener todas las alertas
exports.getAllAlertas = async (req, res) => {
  try {
    const alertas = await Alerta.findAll({
      include: [{
        model: CasoCritico,
        attributes: ['id_caso', 'descripcion', 'nivel_urgencia'] // Campos específicos del caso relacionado
      }]
    });
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las alertas' });
  }
};

// Crear una nueva alerta (con validación de caso_id)
exports.createAlerta = async (req, res) => {
  try {
    // Verificar que el caso crítico exista
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

// Obtener alertas por ID de caso crítico
exports.getAlertasByCasoId = async (req, res) => {
  try {
    const alertas = await Alerta.findAll({
      where: { caso_id: req.params.caso_id },
      order: [['fecha_alerta', 'DESC']] // Ordenar por fecha más reciente
    });
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alertas del caso' });
  }
};

// Actualizar una alerta (ej: cambiar estado)
exports.updateAlerta = async (req, res) => {
  try {
    const alerta = await Alerta.findByPk(req.params.alerta_id);
    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    // Actualizar solo campos permitidos
    const camposPermitidos = ['estado', 'respuesta', 'prioridad', 'observaciones'];
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        alerta[campo] = req.body[campo];
      }
    });

    await alerta.save();
    res.json(alerta);
  } catch (error) {
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