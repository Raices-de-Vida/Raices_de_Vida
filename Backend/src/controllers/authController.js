// authController.js
// Este archivo contiene los controladores para manejar las solicitudes relacionadas con la autenticación y registro de usuarios.
// Utiliza el modelo de usuario (User) y la biblioteca JWT para generar y verificar tokens de autenticación.

// Dependencias requeridas:
// - jwt: Biblioteca para generar y verificar tokens JWT.
// - User: Modelo que representa a los usuarios en la base de datos.
// - Ong: Modelo que representa a las ONGs en la base de datos (si aplica).
// - Voluntario: Modelo que representa a los voluntarios en la base de datos (si aplica).

/**
 * login(req, res)
 * Controlador para autenticar a un usuario.
 * 
 * @body {string} email - Correo electrónico del usuario.
 * @body {string} password - Contraseña del usuario.
 * @returns {string} - Token JWT generado para el usuario autenticado.
 * @throws {401} - Si las credenciales son inválidas.
 * @throws {500} - Si ocurre un error en el servidor.
 * 
 * Proceso:
 * 1. Busca al usuario en la base de datos utilizando el email proporcionado.
 * 2. Verifica que la contraseña proporcionada sea válida.
 * 3. Genera un token JWT con los datos del usuario.
 * 4. Devuelve el token al cliente.
 */

/**
 * register(req, res)
 * Controlador para registrar un nuevo usuario.
 * 
 * @body {string} nombre - Nombre del usuario.
 * @body {string} email - Correo electrónico del usuario.
 * @body {string} password - Contraseña del usuario.
 * @body {string} rol - Rol del usuario (e.g., admin, voluntario, etc.).
 * @body {string} tipo_referencia - Tipo de referencia (e.g., ONG, voluntario).
 * @body {number} id_referencia - ID de la referencia asociada.
 * @returns {Object} - Objeto del usuario creado.
 * @throws {400} - Si ocurre un error de validación o si el email ya está registrado.
 * 
 * Proceso:
 * 1. Recibe los datos del usuario desde el cuerpo de la solicitud.
 * 2. Crea un nuevo usuario en la base de datos con los datos proporcionados.
 * 3. Devuelve el objeto del usuario creado al cliente.
 */
// src/controllers/authController.js
// src/controllers/authController.js
// Backend/src/controllers/authController.js
const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar que los campos requeridos estén presentes
    if (!email || !password || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Búsqueda case-insensitive usando Sequelize.where con Op.iLike
    const { Op } = require('sequelize');
    const user = await User.findOne({ 
      where: { 
        email: { 
          [Op.iLike]: email.trim() 
        } 
      } 
    });
    
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const isPasswordValid = await user.validPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    
    // Devuelve sólo el objeto user
    return res.json({
      id:           user.id_usuario,
      nombre:       user.nombre,
      apellido:     user.apellido,
      email:        user.email,
      rol:          user.rol,
      tipo_ref:     user.tipo_referencia,
      id_ref:       user.id_referencia
    });
  } catch (err) {
    console.error('Error en inicio de sesión:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.register = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      rol,
      tipo_referencia,
      id_referencia
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: 'Nombre, apellido, email y contraseña son requeridos' });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Verificar si el usuario ya existe (case-insensitive)
    const { Op } = require('sequelize');
    const existingUser = await User.findOne({ 
      where: { 
        email: { 
          [Op.iLike]: email.trim() 
        } 
      } 
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const newUser = await User.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      password,
      rol,
      tipo_referencia,
      id_referencia
    });

    // Devuelve sólo el objeto user creado
    return res.status(201).json({
      id:           newUser.id_usuario,
      nombre:       newUser.nombre,
      apellido:     newUser.apellido,
      email:        newUser.email,
      rol:          newUser.rol,
      tipo_ref:     newUser.tipo_referencia,
      id_ref:       newUser.id_referencia
    });
  } catch (err) {
    console.error('Error en registro:', err);
    return res.status(400).json({ error: err.message });
  }
};