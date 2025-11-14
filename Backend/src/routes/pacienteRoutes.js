// Backend/src/routes/pacienteRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pacienteController');
// const { authenticate, authorize } = require('../middlewares/authMiddleware');

// CRUD Pacientes
router.get('/', /*authenticate,*/ /*authorize(['ONG','Voluntario','Lider Comunitario']),*/ ctrl.getPacientes);
router.post('/', /*authenticate,*/ /*authorize(['ONG','Lider Comunitario']),*/ ctrl.createPaciente);

// Rutas específicas (ANTES de /:id para evitar conflictos)
router.get('/flags-summary', /*authenticate,*/ ctrl.getFlagsSummary);

// Migración y búsqueda de duplicados (rutas específicas primero)
router.post('/migrate-visitas', /*authenticate,*/ ctrl.migrateToVisitas);
router.post('/check-duplicates', /*authenticate,*/ ctrl.checkDuplicates);

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
router.post('/:id/alertas-medicas/manual', /*authenticate,*/ ctrl.setManualFlag);
router.post('/:id/alertas-medicas/cerrar', /*authenticate,*/ ctrl.closeAllFlags);
router.post('/:id/reclassify', /*authenticate,*/ ctrl.reclassifySeverity);

// Exportación a PDF
router.get('/:id/exportar-pdf', /*authenticate,*/ ctrl.exportarPDF);

// Gestión de Visitas (historial)
router.get('/:id/visitas', /*authenticate,*/ ctrl.getVisitas);
router.post('/:id/visitas', /*authenticate,*/ ctrl.createVisita);
router.get('/:id/visitas/:visitId', /*authenticate,*/ ctrl.getVisitaById);
router.put('/:id/visitas/:visitId', /*authenticate,*/ ctrl.updateVisita);

module.exports = router;
