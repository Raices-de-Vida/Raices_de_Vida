const express = require('express');
const router = express.Router();
const imagenController = require('../controllers/imagenController');

router.post('/pacientes/:id_paciente/imagenes', imagenController.subirImagen);
router.get('/pacientes/:id_paciente/imagenes', imagenController.obtenerImagenes);
router.get('/imagenes/:id_imagen', imagenController.obtenerImagen);
router.put('/imagenes/:id_imagen', imagenController.actualizarImagen);
router.delete('/imagenes/:id_imagen', imagenController.eliminarImagen);

module.exports = router;
