const express = require('express');
const router = express.Router();
const alertaController = require('../controllers/alertaController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Obtener todas las alertas (ONG y Voluntarios)
router.get(
  '/',
  //authenticate,
  //authorize(['ONG', 'Voluntario', 'Lider Comunitario']), // Corregido: Sin tilde en "Lider"
  alertaController.getAllAlertas
);

// Crear nueva alerta (Solo Líderes Comunitarios y ONG)
router.post('/', 
  //authenticate, 
  //authorize(['Líder Comunitario', 'ONG']), 
  alertaController.createAlerta
);

// Obtener alertas de un caso específico (Cualquier rol autenticado)
router.get('/caso/:caso_id', 
  authenticate, 
  authorize(['ONG', 'Voluntario', 'Líder Comunitario']), 
  alertaController.getAlertasByCasoId
);

// Actualizar alerta (ONG y Administradores)
router.put('/:alerta_id', 
  authenticate, 
  authorize(['ONG', 'Administrador']), 
  alertaController.updateAlerta
);

// Eliminar alerta (Solo Administradores y ONG)
router.delete('/:alerta_id', 
  authenticate, 
  authorize(['ONG', 'Administrador']), 
  alertaController.deleteAlerta
);


module.exports = router;