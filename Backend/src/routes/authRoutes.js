// authRoutes.js
// Este archivo define las rutas relacionadas con la autenticación y registro de usuarios.
// Utiliza el framework Express para manejar las solicitudes HTTP y delega la lógica a los controladores correspondientes.

// Dependencias requeridas:
// - express: Framework para manejar las rutas y solicitudes HTTP.
// - authController: Controlador que contiene la lógica para manejar las solicitudes de autenticación y registro.

/**
 * POST /login
 * Ruta para autenticar a un usuario.
 * 
 * @body {string} email - Correo electrónico del usuario.
 * @body {string} password - Contraseña del usuario.
 * @returns {string} - Token JWT generado para el usuario autenticado.
 * 
 * Proceso:
 * 1. Recibe las credenciales del usuario.
 * 2. Llama al controlador para autenticar al usuario.
 * 3. Devuelve el token JWT generado.
 */

/**
 * POST /register
 * Ruta para registrar un nuevo usuario.
 * 
 * @body {Object} userData - Datos del usuario a registrar.
 * @returns {Object} - Objeto del usuario creado.
 * 
 * Proceso:
 * 1. Recibe los datos del usuario.
 * 2. Llama al controlador para registrar al usuario.
 * 3. Devuelve el objeto del usuario creado.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/register/community', authController.registerCommunityMember);

module.exports = router;