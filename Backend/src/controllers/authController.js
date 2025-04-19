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

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Ong = require('../models/Ong');
const Voluntario = require('../models/Voluntarios');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.validPassword(password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.register = async (req, res) => {
  try {
    const { nombre ,apellido, email, password, rol, tipo_referencia, id_referencia } = req.body;
    const newUser = await User.create({
      nombre,
      apellido,
      email,
      password,
      rol,
      tipo_referencia,
      id_referencia
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};