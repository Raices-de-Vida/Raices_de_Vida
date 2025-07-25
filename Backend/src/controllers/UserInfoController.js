// userInfoController.js
// Controlador para obtener información de usuarios mediante consulta directa a la base de datos
// Útil para verificar tipos de usuario y datos básicos sin depender de tokens JWT

const User = require('../models/User');
const Ong = require('../models/Ong');
const Voluntario = require('../models/Voluntarios');
const Comunidad = require('../models/Comunidad');

/**
 * getUserByEmail(req, res)
 * Obtiene información completa de un usuario por su email
 * 
 * @query {string} email - Email del usuario a buscar
 * @returns {Object} - Información del usuario incluyendo datos de referencia
 * @throws {404} - Si el usuario no existe
 * @throws {400} - Si no se proporciona email
 */
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Buscar usuario por email
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'rol', 'tipo_referencia', 'id_referencia', 'estado']
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Objeto base de respuesta
    const userInfo = {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      tipo_referencia: user.tipo_referencia,
      id_referencia: user.id_referencia,
      estado: user.estado,
      detalles_referencia: null
    };

    // Obtener detalles según el tipo de referencia
    if (user.tipo_referencia && user.id_referencia) {
      try {
        switch (user.tipo_referencia) {
          case 'ONG':
            const ong = await Ong.findByPk(user.id_referencia, {
              attributes: ['id_ong', 'nombre_ong', 'tipo_ong', 'direccion', 'telefono']
            });
            if (ong) {
              userInfo.detalles_referencia = {
                tipo: 'ONG',
                id: ong.id_ong,
                nombre: ong.nombre_ong,
                tipo_ong: ong.tipo_ong,
                direccion: ong.direccion,
                telefono: ong.telefono
              };
            }
            break;

          case 'Voluntario':
            const voluntario = await Voluntario.findByPk(user.id_referencia, {
              attributes: ['id_voluntario', 'nombre', 'apellido', 'tipo_voluntario', 'institucion', 'disponibilidad']
            });
            if (voluntario) {
              userInfo.detalles_referencia = {
                tipo: 'Voluntario',
                id: voluntario.id_voluntario,
                nombre: `${voluntario.nombre} ${voluntario.apellido}`,
                tipo_voluntario: voluntario.tipo_voluntario,
                institucion: voluntario.institucion,
                disponibilidad: voluntario.disponibilidad
              };
            }
            break;

          case 'Comunidad':
            const comunidad = await Comunidad.findByPk(user.id_referencia, {
              attributes: ['id_comunidad', 'nombre_comunidad', 'direccion', 'telefono']
            });
            if (comunidad) {
              userInfo.detalles_referencia = {
                tipo: 'Comunidad',
                id: comunidad.id_comunidad,
                nombre: comunidad.nombre_comunidad,
                direccion: comunidad.direccion,
                telefono: comunidad.telefono
              };
            }
            break;
        }
      } catch (refError) {
        console.warn('Error al obtener detalles de referencia:', refError);
        // Continuar sin los detalles de referencia
      }
    }

    res.json(userInfo);

  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * getUserById(req, res)
 * Obtiene información de un usuario por su ID
 * 
 * @params {number} id - ID del usuario
 * @returns {Object} - Información básica del usuario
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'rol', 'tipo_referencia', 'estado']
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);

  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * getUsersByRole(req, res)
 * Obtiene lista de usuarios filtrados por rol
 * 
 * @query {string} rol - Rol a filtrar (ONG, Voluntario, Lider Comunitario)
 * @returns {Array} - Lista de usuarios con el rol especificado
 */
exports.getUsersByRole = async (req, res) => {
  try {
    const { rol } = req.query;

    const whereClause = { estado: true }; // Solo usuarios activos
    if (rol) {
      whereClause.rol = rol;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'rol', 'tipo_referencia'],
      order: [['nombre', 'ASC']]
    });

    res.json(users);

  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * verifyUserExists(req, res)
 * Verifica si un usuario existe y está activo
 * 
 * @query {string} email - Email del usuario a verificar
 * @returns {Object} - Resultado de la verificación
 */
exports.verifyUserExists = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const user = await User.findOne({
      where: { email },
      attributes: ['id_usuario', 'nombre', 'apellido', 'rol', 'estado']
    });

    const result = {
      exists: !!user,
      active: user ? user.estado : false,
      user_info: user ? {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol
      } : null
    };

    res.json(result);

  } catch (error) {
    console.error('Error al verificar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * updateUserStatus(req, res)
 * Actualiza el estado de un usuario (activo/inactivo)
 * 
 * @params {number} id - ID del usuario
 * @body {boolean} estado - Nuevo estado del usuario
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (typeof estado !== 'boolean') {
      return res.status(400).json({ error: 'Estado debe ser true o false' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.estado = estado;
    await user.save();

    res.json({ 
      message: `Usuario ${estado ? 'activado' : 'desactivado'} correctamente`,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        estado: user.estado
      }
    });

  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};