// Rutas para obtener información de usuarios mediante consulta directa a la base de datos
// No requiere autenticación JWT, útil para verificación de usuarios

const express = require('express');
const router = express.Router();
const userInfoController = require('../controllers/UserInfoController');

/**
 * GET /user-info/by-email
 * Obtiene información completa de un usuario por email
 * 
 * Query Parameters:
 * - email: Email del usuario (requerido)
 * 
 * Ejemplo: GET /api/user-info/by-email?email=usuario@ejemplo.com
 */
router.get('/by-email', userInfoController.getUserByEmail);

/**
 * GET /user-info/by-id/:id
 * Obtiene información básica de un usuario por ID
 * 
 * Path Parameters:
 * - id: ID del usuario (requerido)
 * 
 * Ejemplo: GET /api/user-info/by-id/123
 */
router.get('/by-id/:id', userInfoController.getUserById);

/**
 * GET /user-info/by-role
 * Obtiene lista de usuarios filtrados por rol
 * 
 * Query Parameters:
 * - rol: Rol a filtrar (opcional) - ONG, Voluntario, Lider Comunitario
 * 
 * Ejemplo: GET /api/user-info/by-role?rol=ONG
 */
router.get('/by-role', userInfoController.getUsersByRole);

/**
 * GET /user-info/verify
 * Verifica si un usuario existe y está activo
 * 
 * Query Parameters:
 * - email: Email del usuario (requerido)
 * 
 * Ejemplo: GET /api/user-info/verify?email=usuario@ejemplo.com
 */
router.get('/verify', userInfoController.verifyUserExists);

/**
 * PUT /user-info/status/:id
 * Actualiza el estado de un usuario (activo/inactivo)
 * 
 * Path Parameters:
 * - id: ID del usuario (requerido)
 * 
 * Body:
 * - estado: boolean (true = activo, false = inactivo)
 * 
 * Ejemplo: PUT /api/user-info/status/123
 * Body: { "estado": false }
 */
router.put('/status/:id', userInfoController.updateUserStatus);

module.exports = router;
