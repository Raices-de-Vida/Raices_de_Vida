const express = require('express');
const router = express.Router();
const comunidadController = require('../controllers/comunidadController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Obtener todas las comunidades (público)
router.get('/', comunidadController.getAllComunidades);

// Obtener una comunidad específica
router.get('/:id', authenticate, comunidadController.getComunidadById);

// Rutas protegidas para ONG
router.post('/', authenticate, authorize(['ONG']), comunidadController.createComunidad);
router.put('/:id', authenticate, authorize(['ONG']), comunidadController.updateComunidad);
router.delete('/:id', authenticate, authorize(['ONG']), comunidadController.deleteComunidad);

module.exports = router;