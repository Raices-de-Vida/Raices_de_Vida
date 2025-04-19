// authService.js
// Este archivo contiene funciones relacionadas con la autenticación y registro de usuarios.
// Utiliza el modelo de usuario (User) y utilidades para la generación de tokens JWT (jwtUtils).

// Dependencias requeridas:
// - User: Modelo que representa a los usuarios en la base de datos.
// - jwtUtils: Utilidades para la generación y manejo de tokens JWT.

/**
 * authenticateUser(email, password)
 * Autentica a un usuario verificando su email y contraseña.
 * 
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {string} - Token JWT generado para el usuario autenticado.
 * @throws {Error} - Si el usuario no existe o las credenciales son inválidas.
 * 
 * Proceso:
 * 1. Busca un usuario en la base de datos con el email proporcionado.
 * 2. Verifica que la contraseña proporcionada sea válida.
 * 3. Genera un token JWT con los datos del usuario.
 */

/**
 * registerUser(userData)
 * Registra un nuevo usuario en la base de datos.
 * 
 * @param {Object} userData - Datos del usuario a registrar.
 * @returns {Object} - Objeto del usuario creado.
 * @throws {Error} - Si el email ya está registrado.
 * 
 * Proceso:
 * 1. Verifica si el email ya está registrado en la base de datos.
 * 2. Filtra los campos permitidos para el registro.
 * 3. Crea un nuevo usuario en la base de datos con los datos filtrados.
 * 
 * Campos permitidos para el registro:
 * - nombre
 * - apellido
 * - email
 * - password
 * - rol
 * - tipo_referencia
 * - id_referencia
 */

const User = require('../models/User');
const jwtUtils = require('../utils/jwtUtils');

exports.authenticateUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Usuario no encontrado');
  
  const isValid = await user.validPassword(password);
  if (!isValid) throw new Error('Credenciales inválidas');
  
  return jwtUtils.generateToken({
    id: user.id_usuario,
    email: user.email,
    rol: user.rol,
    nombre: user.nombre,
    apellido: user.apellido
  });
};

exports.registerUser = async (userData) => {
  if (await User.findOne({ where: { email: userData.email } })) {
    throw new Error('El email ya está registrado');
  }
  
  const allowedFields = [
    'nombre', 'apellido', 'email', 'password', 
    'rol', 'tipo_referencia', 'id_referencia'
  ];
  
  const filteredData = {};
  allowedFields.forEach(field => {
    if (userData[field] !== undefined) {
      filteredData[field] = userData[field];
    }
  });
  
  return await User.create(filteredData);
};