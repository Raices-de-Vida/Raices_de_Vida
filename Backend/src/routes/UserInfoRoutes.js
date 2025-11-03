// UserInfoRoutes.js
// Rutas completas para gestión de usuarios (CRUD)
// Incluye autenticación opcional según el nivel de seguridad requerido

const express = require('express');
const router = express.Router();
const userInfoController = require('../controllers/UserInfoController');
// Descomentar la siguiente línea cuando se implemente autenticación
// const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * GET /user-info
 * Obtiene todos los usuarios con paginación y filtros
 * 
 * Query Parameters:
 * - page: Página actual (default: 1)
 * - limit: Cantidad por página (default: 10)
 * - search: Búsqueda por nombre, apellido o email
 * - rol: Filtrar por rol específico
 * - activos: Mostrar solo usuarios activos (true/false)
 * 
 * Ejemplo: GET /api/user-info?page=1&limit=10&rol=ONG&activos=true
 */
router.get('/', 
  // authenticate, 
  // authorize(['Administrador', 'ONG']), 
  userInfoController.getAllUsers
);

/**
 * POST /user-info
 * Crea un nuevo usuario en el sistema
 * 
 * Body:
 * - nombre: string (requerido)
 * - apellido: string (requerido)
 * - email: string (requerido, único)
 * - password: string (requerido)
 * - rol: string (requerido) - ONG, Voluntario, Lider Comunitario, Administrador
 * - tipo_referencia: string (opcional) - ONG, Voluntario, Comunidad
 * - id_referencia: number (opcional)
 * 
 * Ejemplo: POST /api/user-info
 * Body: {
 *   "nombre": "Juan",
 *   "apellido": "Pérez",
 *   "email": "juan@ejemplo.com",
 *   "password": "password123",
 *   "rol": "Voluntario"
 * }
 */
router.post('/', 
  // authenticate, 
  // authorize(['Administrador']), 
  userInfoController.createUser
);

/**
 * PUT /user-info/:id
 * Actualiza un usuario existente
 * 
 * Path Parameters:
 * - id: ID del usuario (requerido)
 * 
 * Body: Campos a actualizar (todos opcionales)
 * - nombre: string
 * - apellido: string
 * - email: string
 * - password: string
 * - rol: string
 * - tipo_referencia: string
 * - id_referencia: number
 * - estado: boolean
 * 
 * Ejemplo: PUT /api/user-info/123
 */
router.put('/:id', 
  // authenticate, 
  // authorize(['Administrador']), 
  userInfoController.updateUser
);

/**
 * DELETE /user-info/:id
 * Elimina un usuario (lógica o permanentemente)
 * 
 * Path Parameters:
 * - id: ID del usuario (requerido)
 * 
 * Query Parameters:
 * - permanent: boolean (default: false) - Si es true, elimina permanentemente
 * 
 * Ejemplo: DELETE /api/user-info/123?permanent=false
 */
router.delete('/:id', 
  // authenticate, 
  // authorize(['Administrador']), 
  userInfoController.deleteUser
);

/**
 * POST /user-info/bulk-delete
 * Elimina múltiples usuarios de una vez
 * 
 * Body:
 * - userIds: array de números (IDs de usuarios)
 * - permanent: boolean (default: false)
 * 
 * Ejemplo: POST /api/user-info/bulk-delete
 * Body: {
 *   "userIds": [1, 2, 3],
 *   "permanent": false
 * }
 */
router.post('/bulk-delete',
  // authenticate,
  // authorize(['Administrador']),
  userInfoController.bulkDeleteUsers
);

/**
 * GET /user-info/stats
 * Obtiene estadísticas generales de usuarios
 * 
 * Retorna:
 * - total: Total de usuarios
 * - active: Usuarios activos
 * - inactive: Usuarios inactivos
 * - byRole: Conteo por rol
 * - recentlyCreated: Usuarios creados en el último mes
 * 
 * Ejemplo: GET /api/user-info/stats
 */
router.get('/stats',
  // authenticate,
  // authorize(['Administrador', 'ONG']),
  userInfoController.getUserStats
);

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