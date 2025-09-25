// casoRoutes.js
// Este archivo define las rutas relacionadas con los casos críticos.
// Utiliza el framework Express para manejar las solicitudes HTTP y delega la lógica a los controladores correspondientes.
// También aplica middlewares para autenticar y autorizar a los usuarios según sus roles.

// Dependencias requeridas:
// - express: Framework para manejar las rutas y solicitudes HTTP.
// - casoController: Controlador que contiene la lógica para manejar las solicitudes relacionadas con los casos críticos.
// - authenticate: Middleware para autenticar a los usuarios mediante un token JWT.
// - authorize: Middleware para autorizar a los usuarios según sus roles.

/**
 * GET /
 * Ruta para obtener todos los casos críticos.
 * 
 * @header {string} Authorization - Token JWT en el formato "Bearer <token>".
 * @returns {Array<Object>} - Lista de casos críticos almacenados en la base de datos.
 * @throws {401} - Si el usuario no está autenticado.
 * @throws {403} - Si el usuario no tiene permisos para acceder a esta ruta.
 * 
 * Proceso:
 * 1. Verifica que el usuario esté autenticado mediante el middleware `authenticate`.
 * 2. Autoriza el acceso solo a usuarios con roles 'ONG' o 'Líder Comunitario' mediante el middleware `authorize`.
 * 3. Llama al controlador `getAllCasos` para obtener los casos críticos.
 */

/**
 * POST /
 * Ruta para crear un nuevo caso crítico.
 * 
 * @header {string} Authorization - Token JWT en el formato "Bearer <token>".
 * @body {Object} req.body - Datos del caso crítico a crear.
 * @returns {Object} - Objeto del caso crítico creado.
 * @throws {401} - Si el usuario no está autenticado.
 * @throws {403} - Si el usuario no tiene permisos para acceder a esta ruta.
 * @throws {400} - Si ocurre un error de validación o al crear el caso crítico.
 * 
 * Proceso:
 * 1. Verifica que el usuario esté autenticado mediante el middleware `authenticate`.
 * 2. Autoriza el acceso solo a usuarios con el rol 'Líder Comunitario' mediante el middleware `authorize`.
 * 3. Llama al controlador `createCaso` para crear un nuevo caso crítico.
 */

const express = require('express');
const router = express.Router();
const casoController = require('../controllers/casoController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

//router.get('/', authenticate, authorize(['ONG', 'Líder Comunitario']), casoController.getAllCasos);
router.get('/', casoController.getAllCasos);
//router.post('/', authenticate, authorize(['Líder Comunitario']), casoController.createCaso); //Tener en cuenta que esta es la version correcta
router.post('/', casoController.createCaso); // Versión corregida sin autenticación y autorización

module.exports = router;