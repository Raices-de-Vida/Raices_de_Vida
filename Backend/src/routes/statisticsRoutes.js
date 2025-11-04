// Backend/src/routes/statisticsRoutes.js
const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

/**
 * Rutas para estadísticas médicas
 */

// Obtener casos reportados por lugar (municipios/comunidades)
// GET /api/statistics/casos-por-lugar?meses=4
router.get('/casos-por-lugar', /*authenticate,*/ statisticsController.getCasosPorLugar);

// Obtener distribución de edad de pacientes con enfermedades crónicas
// GET /api/statistics/cronicos-por-edad
router.get('/cronicos-por-edad', /*authenticate,*/ statisticsController.getRangosEdadCronicos);

// Obtener relación peso vs edad en niños
// GET /api/statistics/peso-edad-ninos?edad_maxima=18
router.get('/peso-edad-ninos', /*authenticate,*/ statisticsController.getPesoVsEdadNinos);

// Obtener resumen general de estadísticas
// GET /api/statistics/resumen
router.get('/resumen', /*authenticate,*/ statisticsController.getResumenEstadisticas);

module.exports = router;