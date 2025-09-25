// Backend/src/routes/pacienteRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pacienteController');
// const { authenticate, authorize } = require('../middlewares/authMiddleware');

// CRUD Pacientes
router.get('/', /*authenticate,*/ /*authorize(['ONG','Voluntario','Lider Comunitario']),*/ ctrl.getPacientes);
router.post('/', /*authenticate,*/ /*authorize(['ONG','Lider Comunitario']),*/ ctrl.createPaciente);
router.get('/:id', /*authenticate,*/ ctrl.getPacienteById);
router.put('/:id', /*authenticate,*/ ctrl.updatePaciente);
// Actualización básica (peso, estatura, override de severidad manual -> crea alerta manual)
router.put('/:id/update-basic', /*authenticate,*/ ctrl.updatePacienteBasic);
router.delete('/:id', /*authenticate,*/ /*authorize(['ONG','Administrador']),*/ ctrl.deletePaciente);

// Signos vitales (historial)
router.post('/:id/signos', /*authenticate,*/ ctrl.addSignos);
router.get('/:id/signos', /*authenticate,*/ ctrl.getSignos);

// Consultas médicas
router.post('/:id/consultas', /*authenticate,*/ ctrl.addConsulta);
router.get('/:id/consultas', /*authenticate,*/ ctrl.getConsultas);

// Alertas médicas
router.post('/:id/alertas-medicas', /*authenticate,*/ ctrl.addAlertaMedica);
router.get('/:id/alertas-medicas', /*authenticate,*/ ctrl.getAlertasMedicas);
router.get('/flags-summary', /*authenticate,*/ ctrl.getFlagsSummary);
router.post('/:id/alertas-medicas/manual', /*authenticate,*/ ctrl.setManualFlag);
router.post('/:id/alertas-medicas/cerrar', /*authenticate,*/ ctrl.closeAllFlags);

module.exports = router;
