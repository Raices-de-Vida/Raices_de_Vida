// authMiddleware.js
// Este archivo contiene middlewares para la autenticación y autorización de usuarios.
// Utiliza tokens JWT para verificar la identidad del usuario y sus permisos.

// Dependencias requeridas:
// - jwt: Biblioteca para manejar y verificar tokens JWT.

/**
 * authenticate(req, res, next)
 * Middleware para autenticar a un usuario mediante un token JWT.
 * 
 * @header {string} Authorization - Debe contener el token JWT en el formato "Bearer <token>".
 * @returns {void} - Si el token es válido, agrega los datos del usuario al objeto `req.user` y llama a `next()`.
 * @throws {401} - Si no se proporciona un token o si el token es inválido.
 * 
 * Proceso:
 * 1. Obtiene el token del encabezado de autorización.
 * 2. Verifica el token utilizando la clave secreta (JWT_SECRET).
 * 3. Si es válido, agrega los datos decodificados del usuario al objeto `req`.
 * 4. Si no es válido, responde con un error 401 (Acceso no autorizado).
 */

/**
 * authorize(roles)
 * Middleware para autorizar a un usuario según su rol.
 * 
 * @param {Array<string>} roles - Lista de roles permitidos para acceder a la ruta.
 * @returns {void} - Si el usuario tiene un rol permitido, llama a `next()`.
 * @throws {403} - Si el usuario no tiene permisos para realizar la acción.
 * 
 * Proceso:
 * 1. Verifica si el rol del usuario (`req.user.rol`) está incluido en la lista de roles permitidos.
 * 2. Si no está incluido, responde con un error 403 (No tienes permisos para esta acción).
 * 3. Si está incluido, permite el acceso llamando a `next()`.
 */

const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso no autorizado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

exports.authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ error: 'No tienes permisos para esta acción' });
  }
  next();
};